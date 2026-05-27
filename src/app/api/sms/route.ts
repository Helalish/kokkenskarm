import { NextRequest, NextResponse } from "next/server";

const GATEWAY_API_TOKEN = process.env.GATEWAYAPI_TOKEN;
const SMS_SENDER = process.env.SMS_SENDER || "Shopbox";

export async function POST(request: NextRequest) {
  try {
    const { phone, message, orderId } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { error: "phone and message are required" },
        { status: 400 }
      );
    }

    if (!GATEWAY_API_TOKEN) {
      console.warn("SMS: GATEWAYAPI_TOKEN not configured, skipping send");
      return NextResponse.json({
        success: false,
        error: "SMS gateway not configured",
        orderId,
      }, { status: 503 });
    }

    // GatewayAPI.com REST API
    const response = await fetch("https://gatewayapi.com/rest/mtsms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GATEWAY_API_TOKEN}`,
      },
      body: JSON.stringify({
        sender: SMS_SENDER,
        message,
        recipients: [{ msisdn: phone.replace(/\D/g, "") }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SMS send failed:", errorText);
      return NextResponse.json(
        { success: false, error: "SMS send failed" },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log(`SMS sent to ${phone} for order ${orderId}:`, result);

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error("SMS error:", error);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
