import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = body.question;

    if (!question) {
      return Response.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are Jennie AI, a real estate assistant for Jennie Artajo. Help with home buying, selling, neighborhoods, and showings. Be professional and concise.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: question,
            },
          ],
        },
      ],
    });

    return Response.json({
      answer: response.output_text,
    });

  } catch (error) {
    return Response.json(
      { error: "AI request failed." },
      { status: 500 }
    );
  }
}