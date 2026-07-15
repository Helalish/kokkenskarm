import { NextRequest, NextResponse } from "next/server";
import { SHOPBOX_CONFIG } from "@/lib/shopbox-config";
import { transformShopboxOrders } from "@/services/shopbox-transformer";

export async function GET(request: NextRequest) {
  const { baseUrl, branchId, accessToken, clientId } = SHOPBOX_CONFIG;

  const url = new URL(`${baseUrl}/branches/${branchId}/kds/orders`);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("client", clientId);

  const status = request.nextUrl.searchParams.get("status");
  if (status) {
    url.searchParams.set("status", status);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopbox KDS API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch orders from Shopbox" },
        { status: response.status },
      );
    }

    const shopboxData = await response.json();
    const orders = transformShopboxOrders(shopboxData);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Internal error fetching orders" },
      { status: 500 },
    );
  }
}
