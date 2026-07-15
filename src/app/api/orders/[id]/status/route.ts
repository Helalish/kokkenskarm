import { NextRequest, NextResponse } from "next/server";
import { SHOPBOX_CONFIG } from "@/lib/shopbox-config";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { baseUrl, branchId, accessToken, clientId } = SHOPBOX_CONFIG;

  const url = new URL(`${baseUrl}/branches/${branchId}/kds/orders/${id}/status`);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("client", clientId);

  try {
    const body = await request.json();

    const response = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        order_type: body.order_type,
        status: body.status,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopbox status update error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: response.status },
      );
    }

    const result = await response.json().catch(() => ({}));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { error: "Internal error updating order status" },
      { status: 500 },
    );
  }
}
