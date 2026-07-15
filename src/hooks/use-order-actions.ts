"use client";

import { useCallback } from "react";
import { useOrdersStore } from "@/stores/orders-store";
import { usePipelineStore } from "@/stores/pipeline-store";
import { useSettingsStore } from "@/stores/settings-store";
import { sendOrderSms } from "@/services/sms-service";
import type { Order } from "@/types/order";

export function useOrderActions() {
  const { updateOrderStatus } = useOrdersStore();
  const { stages, getNextStageId } = usePipelineStore();
  const { smsEnabled } = useSettingsStore();

  const advanceWithSms = useCallback(
    (order: Order) => {
      const nextStageId = getNextStageId(order.currentStageId);
      if (!nextStageId) return;

      updateOrderStatus(order.id, nextStageId);

      const nextStage = stages.find((s) => s.id === nextStageId);
      if (
        smsEnabled &&
        nextStage?.smsEnabled &&
        nextStage.smsTemplate &&
        order.customerInfo?.phone
      ) {
        const message = nextStage.smsTemplate.replace(
          "#{orderNumber}",
          String(order.orderNumber)
        );
        sendOrderSms(order.customerInfo.phone, order.orderNumber, order.id, message);
      }
    },
    [updateOrderStatus, getNextStageId, stages, smsEnabled]
  );

  const sendSmsManually = useCallback(
    (order: Order, stageTemplate?: string) => {
      if (!order.customerInfo?.phone || !stageTemplate) return;
      const message = stageTemplate.replace(
        "#{orderNumber}",
        String(order.orderNumber)
      );
      sendOrderSms(order.customerInfo.phone, order.orderNumber, order.id, message);
    },
    []
  );

  return { advanceWithSms, sendSmsManually };
}
