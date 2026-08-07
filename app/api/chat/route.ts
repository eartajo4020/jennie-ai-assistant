import OpenAI from "openai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 m"),
  analytics: true,
});

type ChatMessage = {
  sender: "user" | "ai";
  text: string;
};

type Lead = {
  name: string;
  email: string;
  phone: string;
  intent: string;
  propertyType: string;
  location: string;
  budget: string;
  timeline: string;
  summary: string;
  leadScore: string;
  nextAction: string;
};

const emptyLead: Lead = {
  name: "",
  email: "",
  phone: "",
  intent: "",
  propertyType: "",
  location: "",
  budget: "",
  timeline: "",
  summary: "",
  leadScore: "",
  nextAction: "",
};

export async function POST(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "anonymous";

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json(
      {
        answer:
          "You’ve reached the message limit for now. Please try again in about 10 minutes.",
        lead: emptyLead,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    const latestMessage =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    if (!latestMessage) {
      return Response.json(
        {
          answer: "Please enter a message before sending.",
          lead: emptyLead,
        },
        { status: 400 }
      );
    }

    if (latestMessage.length > 1000) {
      return Response.json(
        {
          answer:
            "That message is too long. Please shorten it to fewer than 1,000 characters.",
          lead: emptyLead,
        },
        { status: 400 }
      );
    }

    const history: ChatMessage[] = Array.isArray(body.history)
      ? body.history
      : [];

    const systemMessage = {
      role: "system" as const,
      content: `
You are Jennie AI, the dedicated real estate assistant for Jennie Artajo.

Your job is to help website visitors who are interested in buying, selling, renting, or investing in real estate. You should also naturally learn what they need so Jennie Artajo can follow up when appropriate.

PERSONALITY

- Be warm, professional, confident, and conversational.
- Keep responses concise and easy to read.
- Usually respond in no more than four short sentences.
- Do not sound like a form, survey, or interrogation.
- Acknowledge what the visitor said before asking the next question.
- Ask only one main question at a time.
- Never repeatedly ask for information already provided.

CONVERSATION STRATEGY

Review the entire conversation before every reply.

Track which details the visitor has already shared:

- name
- intent: buy, sell, rent, or invest
- property type
- location
- budget
- timeline
- bedrooms and bathrooms, when relevant
- financing or pre-approval status, when relevant
- email
- phone number

Ask for the most useful missing detail next.

For buyers, renters, and investors, generally learn:

1. Intent
2. Property type
3. Location
4. Budget
5. Timeline
6. Other useful preferences
7. Contact information

For sellers, generally learn:

1. What property they want to sell
2. Property location
3. Desired timeline
4. Relevant property details
5. Contact information

These are guidelines, not a rigid script.

If the visitor provides multiple details in one message, recognize all of them and do not ask for them again.

CONTACT INFORMATION

- Do not ask for an email address or phone number immediately.
- First understand at least two meaningful details, such as:
  - property type
  - location
  - budget
  - timeline
- Provide helpful assistance before requesting contact information.
- Once enough context is available, ask naturally and explain the benefit.

A good example is:

"I have a good idea of what you're looking for. What’s the best email or phone number for Jennie to send matching options or follow up?"

- Either an email address or a phone number is enough.
- Do not pressure the visitor to provide both.
- If they decline, respect their choice and continue helping.
- Never claim their information was saved.
- Never claim an email was sent.
- Never claim Jennie will definitely find a matching property.

GENERAL QUESTIONS

- If the visitor is only asking general questions or browsing, answer helpfully without forcing lead qualification.
- Do not invent property listings, prices, availability, market statistics, or property details.
- For information that cannot be verified, explain that Jennie Artajo can follow up with accurate details.
- Never refer the visitor to another real estate agent or competing service.
- Always represent Jennie Artajo professionally.

SAFETY

- Do not give legal, tax, mortgage, investment, or financial advice.
- You may provide general educational information.
- For decisions requiring professional advice, recommend speaking with the appropriate licensed professional.

Your goal is to be helpful first and qualify the visitor naturally without being pushy.
`,
    };

    const chatMessages = history.map((msg) => ({
      role:
        msg.sender === "ai"
          ? ("assistant" as const)
          : ("user" as const),
      content: msg.text,
    }));

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemMessage, ...chatMessages],
    });

    const conversationText = history
      .map(
        (msg) =>
          `${msg.sender === "ai" ? "Assistant" : "User"}: ${
            msg.text
          }`
      )
      .join("\n");

    const leadResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: `
You are Jennie AI's CRM extraction engine.

Your job is to analyze the entire conversation and extract only factual information that the user explicitly provided.

Return only valid JSON.

Use exactly this schema:

{
  "name": "",
  "email": "",
  "phone": "",
  "intent": "",
  "propertyType": "",
  "location": "",
  "budget": "",
  "timeline": "",
  "summary": "",
  "leadScore": "",
  "nextAction": ""
}

EXTRACTION RULES

- Never invent information.
- Never guess.
- Never infer missing facts.
- Only use information explicitly stated by the user.
- Ignore information suggested by Jennie AI unless the user confirms it.
- Use the entire conversation so details from earlier messages are preserved.
- If a value is unknown, return an empty string.
- Always return every field in the schema.

INTENT

Intent must be exactly one of:

- "buy"
- "sell"
- "rent"
- "invest"
- ""

PROPERTY TYPE

Examples include:

- house
- condo
- townhouse
- apartment
- three-flat
- multifamily
- land
- commercial property

You may use another property type if the user clearly states it.

CONTACT INFORMATION

- Recognize valid email addresses.
- Recognize valid phone numbers.
- Never invent contact information.

LEAD QUALIFICATION

A qualified lead generally has:

- a name
- a phone number or email address
- an intent
- at least two meaningful details from:
  - property type
  - location
  - budget
  - timeline

Do not treat someone as qualified merely because they chatted.

LEAD SCORE

Return exactly one of:

- "Hot"
- "Warm"
- "Cold"
- ""

Use "Hot" when:

- the user has strong intent
- contact information is provided
- multiple useful details are known
- the timeline is soon, immediate, or otherwise urgent

Use "Warm" when:

- the user shows real interest
- some useful details are known
- important qualification information is still missing
- the timeline is uncertain or longer-term

Use "Cold" when:

- the user is only browsing
- the user is asking general questions
- serious intent is weak
- very little useful information is provided

Never mark someone Hot only because they provided an email address or phone number.

SUMMARY

Write a concise professional CRM summary in two or three sentences.

Include only facts the user actually provided, such as:

- name
- intent
- property type
- location
- budget
- timeline
- email
- phone number

Do not mention missing information.

Write the summary like a professional note for Jennie Artajo, not like a chatbot response.

NEXT ACTION

Write one short professional recommendation for Jennie Artajo.

Examples:

- "Call within 24 hours."
- "Send available three-flat listings in Chicagoland."
- "Follow up next week."

If the lead is not yet qualified, return an empty string.

Return only valid JSON.
`,
        },
        {
          role: "user",
          content: conversationText,
        },
      ],
    });

    let lead: Lead = {
      ...emptyLead,
    };

    try {
      const parsedLead = JSON.parse(
        leadResponse.choices[0].message.content || "{}"
      );

      lead = {
        ...emptyLead,
        ...parsedLead,
      };
    } catch (error) {
      console.error("Lead JSON parsing failed:", error);
    }

    return Response.json({
      answer:
        response.choices[0].message.content ||
        "Sorry, I couldn't create a response.",
      lead,
    });
  } catch (error) {
    console.error("CHAT ERROR:", error);

    return Response.json(
      {
        answer: "Sorry, something went wrong.",
        lead: emptyLead,
      },
      {
        status: 500,
      }
    );
  }
}