import { NextResponse } from "next/server";
import { transformShopboxOrders } from "@/services/shopbox-transformer";

const SHOPBOX_API_URL = process.env.SHOPBOX_API_URL;
const SHOPBOX_API_KEY = process.env.SHOPBOX_API_KEY;

export async function GET() {
  if (!SHOPBOX_API_URL || !SHOPBOX_API_KEY) {
    return NextResponse.json(
      { error: "Shopbox API not configured. Set SHOPBOX_API_URL and SHOPBOX_API_KEY in .env.local" },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${SHOPBOX_API_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${SHOPBOX_API_KEY}`,
        "Content-Type": "application/json",
      },
      // Don't cache — we need fresh orders
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopbox API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch orders from Shopbox" },
        { status: response.status }
      );
    }

    const shopboxData = await response.json();
    const orders = transformShopboxOrders(shopboxData);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Internal error fetching orders" },
      { status: 500 }
    );
  }
}
