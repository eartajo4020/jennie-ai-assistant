export async function GET() {
  try {
    const sheetsUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;

    if (!sheetsUrl) {
      return Response.json(
        {
          success: false,
          error: "Missing Google Sheets URL",
        },
        { status: 500 }
      );
    }

    const response = await fetch(sheetsUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Google Sheets returned status ${response.status}`
      );
    }

    const data = await response.json();

    return Response.json({
      success: true,
      leads: Array.isArray(data.leads) ? data.leads : [],
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data",
        leads: [],
      },
      { status: 500 }
    );
  }
}