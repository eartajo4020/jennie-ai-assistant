import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type ChatMessage = {
  sender: "user" | "ai";
  text: string;
};

type Lead = {
  leadId?: string;
  name?: string;
  email?: string;
  phone?: string;
  intent?: string;
  propertyType?: string;
  location?: string;
  budget?: string;
  timeline?: string;
  status?: string;
  summary?: string;
  leadScore?: string;
  nextAction?: string;
  conversation?: ChatMessage[];
};

function escapeHtml(value: unknown) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const lead: Lead = await req.json();

    const sheetsUrl =
      process.env.GOOGLE_SHEETS_WEB_APP_URL;

    const notificationEmail =
      process.env.LEAD_NOTIFICATION_EMAIL;

    if (!sheetsUrl) {
      return Response.json(
        {
          success: false,
          error: "Missing Google Sheets URL",
        },
        { status: 500 }
      );
    }

    const googleResponse = await fetch(sheetsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(lead),
    });

    if (!googleResponse.ok) {
      throw new Error(
        `Google Sheets returned status ${googleResponse.status}`
      );
    }

    const googleResult = await googleResponse.json();

    if (googleResult.success === false) {
      throw new Error(
        googleResult.error ||
          "Google Sheets could not save the lead"
      );
    }

    const isNewLead = googleResult.updated === false;

    const hasContactInfo = Boolean(
      lead.email || lead.phone
    );

    const qualificationDetails = [
      lead.propertyType,
      lead.location,
      lead.budget,
      lead.timeline,
    ].filter(
      (value) =>
        typeof value === "string" &&
        value.trim() !== ""
    );

    const isQualifiedLead = Boolean(
      lead.name &&
        hasContactInfo &&
        lead.intent &&
        qualificationDetails.length >= 2
    );

    if (
      isNewLead &&
      isQualifiedLead &&
      notificationEmail
    ) {
      const scoreLabel =
        lead.leadScore === "Hot"
          ? "🔥 Hot"
          : lead.leadScore || "Not scored";

      const { error: emailError } =
        await resend.emails.send({
          from:
            "Jennie AI Leads <onboarding@resend.dev>",

          to: [notificationEmail],

          subject: `${scoreLabel} New Lead — ${
            lead.name || "Website Visitor"
          }`,

          html: `
            <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; color: #111827;">
              <h1 style="font-size: 24px; margin-bottom: 8px;">
                New Real Estate Lead
              </h1>

              <p style="font-size: 16px; color: #4b5563;">
                Jennie AI captured a new website lead.
              </p>

              <table
                style="width: 100%; border-collapse: collapse; margin-top: 24px;"
              >
                <tr>
                  <td style="padding: 10px; font-weight: bold;">
                    Lead score
                  </td>

                  <td style="padding: 10px;">
                    ${escapeHtml(scoreLabel)}
                  </td>
                </tr>

                <tr style="background: #f3f4f6;">
                  <td style="padding: 10px; font-weight: bold;">
                    Name
                  </td>

                  <td style="padding: 10px;">
                    ${escapeHtml(lead.name)}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 10px; font-weight: bold;">
                    Email
                  </td>

                  <td style="padding: 10px;">
                    ${escapeHtml(lead.email)}
                  </td>
                </tr>

                <tr style="background: #f3f4f6;">
                  <td style="padding: 10px; font-weight: bold;">
                    Phone
                  </td>

                  <td style="padding: 10px;">
                    ${escapeHtml(lead.phone)}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 10px; font-weight: bold;">
                    Intent
                  </td>

                  <td style="padding: 10px;">
                    ${escapeHtml(lead.intent)}
                  </td>
                </tr>

                <tr style="background: #f3f4f6;">
                  <td style="padding: 10px; font-weight: bold;">
                    Property type
                  </td>

                  <td style="padding: 10px;">
                    ${escapeHtml(lead.propertyType)}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 10px; font-weight: bold;">
                    Location
                  </td>

                  <td style="padding: 10px;">
                    ${escapeHtml(lead.location)}
                  </td>
                </tr>

                <tr style="background: #f3f4f6;">
                  <td style="padding: 10px; font-weight: bold;">
                    Budget
                  </td>

                  <td style="padding: 10px;">
                    ${escapeHtml(lead.budget)}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 10px; font-weight: bold;">
                    Timeline
                  </td>

                  <td style="padding: 10px;">
                    ${escapeHtml(lead.timeline)}
                  </td>
                </tr>
              </table>

              <div style="margin-top: 24px;">
                <h2 style="font-size: 18px;">
                  Conversation summary
                </h2>

                <p style="line-height: 1.6;">
                  ${escapeHtml(lead.summary)}
                </p>
              </div>

              <div
                style="margin-top: 24px; padding: 16px; background: #eef2ff; border-radius: 10px;"
              >
                <strong>
                  Recommended next action
                </strong>

                <p style="margin-bottom: 0;">
                  ${escapeHtml(lead.nextAction)}
                </p>
              </div>
            </div>
          `,
        });

      if (emailError) {
        console.error(
          "RESEND ERROR:",
          emailError
        );

        return Response.json({
          success: true,
          sheetSaved: true,
          emailSent: false,
          emailError: emailError.message,
        });
      }

      return Response.json({
        success: true,
        sheetSaved: true,
        emailSent: true,
        isNewLead: true,
      });
    }

    return Response.json({
      success: true,
      sheetSaved: true,
      emailSent: false,
      isNewLead,
    });
  } catch (error) {
    console.error("LEADS ERROR:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save lead",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const leadId =
      typeof body.leadId === "string"
        ? body.leadId.trim()
        : "";

    if (!leadId) {
      return Response.json(
        {
          success: false,
          error: "Missing leadId",
        },
        { status: 400 }
      );
    }

    const sheetsUrl =
      process.env.GOOGLE_SHEETS_WEB_APP_URL;

    if (!sheetsUrl) {
      return Response.json(
        {
          success: false,
          error: "Missing Google Sheets URL",
        },
        { status: 500 }
      );
    }

    const googleResponse = await fetch(sheetsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "delete",
        leadId,
      }),
    });

    if (!googleResponse.ok) {
      throw new Error(
        `Google Sheets returned status ${googleResponse.status}`
      );
    }

    const googleResult = await googleResponse.json();

    if (
      googleResult.success !== true ||
      googleResult.deleted !== true
    ) {
      return Response.json(
        {
          success: false,
          error:
            googleResult.error ||
            "Lead could not be deleted",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      deleted: true,
      leadId,
    });
  } catch (error) {
    console.error("DELETE LEAD ERROR:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete lead",
      },
      { status: 500 }
    );
  }
}