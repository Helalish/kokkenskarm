import { useToastStore } from "@/stores/toast-store";
import { useOrdersStore } from "@/stores/orders-store";
import { useSmsLogStore } from "@/stores/sms-log-store";

export async function sendOrderSms(
  phone: string,
  orderNumber: number,
  orderId: string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message, orderId }),
    });

    const result = await response.json();

    if (result.success) {
      useOrdersStore.getState().incrementSmsSent(orderId);
      useSmsLogStore.getState().addEntry({
        orderId,
        orderNumber,
        phone,
        message,
        sentAt: new Date().toISOString(),
        success: true,
      });
      useToastStore.getState().addToast({
        type: "sms",
        message: `SMS sendt til ${phone}`,
        detail: `Ordre #${orderNumber}`,
        duration: 3000,
      });
      return true;
    } else {
      useSmsLogStore.getState().addEntry({
        orderId,
        orderNumber,
        phone,
        message,
        sentAt: new Date().toISOString(),
        success: false,
      });
      useToastStore.getState().addToast({
        type: "info",
        message: "SMS kunne ikke sendes",
        detail: result.error || "Ukendt fejl",
        duration: 4000,
      });
      return false;
    }
  } catch {
    useSmsLogStore.getState().addEntry({
      orderId,
      orderNumber,
      phone,
      message,
      sentAt: new Date().toISOString(),
      success: false,
    });
    useToastStore.getState().addToast({
      type: "info",
      message: "SMS fejl",
      detail: "Kunne ikke kontakte SMS-tjenesten",
      duration: 4000,
    });
    return false;
  }
}
