import type { Language } from "@/stores/language-store";

type Dict = Record<string, string>;

const da: Dict = {
  // KDS header
  "header.sort.oldest": "↑ Ældste",
  "header.sort.newest": "↓ Nyeste",
  "header.sort.oldestTitle": "Ældste først",
  "header.sort.newestTitle": "Nyeste først",
  "header.sound.onTitle": "Lyd til",
  "header.sound.offTitle": "Lyd fra",
  "header.smsLog.title": "SMS-historik",
  "header.undo": "↩ Fortryd ({count})",
  "header.customerDisplay": "Kundeskærm",
  "header.settings": "⚙ Indstillinger",

  // Pipeline bar
  "pipelineBar.all": "Alle",

  // Order card
  "card.changes": "Ændringer i bestilling",
  "card.clickAgain": "Klik igen → {next}",
  "card.done": "Færdig",
  "card.back": "← Tilbage",
  "card.itemsDone": "{done}/{total} færdig",
  "card.itemsCount": "{total} varer",
  "card.showDetails": "Vis detaljer",
  "card.sendSms": "Send SMS til {phone}",
  "card.deleted": "Slettet — lav ikke",
  "card.new": "NY",
  "card.refunded": "Refunderet",

  // Expanded card
  "expanded.unpaid": "IKKE BETALT",
  "expanded.paid": "BETALT",
  "expanded.customer": "Kunde",
  "expanded.note": "Note",
  "expanded.items": "Varer ({done}/{total} færdig)",
  "expanded.markAllDone": "Markér alle færdige",
  "expanded.unmarkAll": "Fjern alle hak",
  "expanded.variant": "Variant",
  "expanded.mod": "Mod",
  "expanded.ingredients": "Ingredienser",
  "expanded.moveTo": "Flyt til: {next}",
  "expanded.moveBack": "← Flyt tilbage",
  "expanded.goBack": "← Gå tilbage",
  "expanded.remove": "Fjern",

  // Grid empty state
  "grid.empty.title": "Ingen aktive ordrer",
  "grid.empty.subtitle": "Nye ordrer vises automatisk her",

  // Customer display
  "customer.orderStatus": "Ordrestatus",
  "customer.preparing": "Tilberedes",
  "customer.ready": "Klar",
  "customer.preparingEmpty": "Ingen ordrer lige nu",
  "customer.readyEmpty": "Ordrer vises her når de er klar",

  // Payment badge
  "payment.paid": "Betalt",
  "payment.unpaid": "Ikke betalt",
  "payment.partial": "Delvist betalt",

  // Settings
  "settings.title": "Indstillinger",
  "settings.backToKds": "← Tilbage til KDS",
  "settings.display": "Visning",
  "settings.timers": "Timer-tærskler",
  "settings.timer.warning": "Advarsel efter: {min} min",
  "settings.timer.critical": "Kritisk efter: {min} min",
  "settings.timer.autoDismiss": "Fjern fra \"Ready for Pick up\" efter: {value}",
  "settings.timer.disabled": "Slået fra",
  "settings.timer.off": "Fra",
  "settings.timer.helper":
    "Ordrer i det sidste stadie fjernes automatisk efter den valgte tid. Sæt til 0 for at slå fra.",
  "settings.orderFlow": "Ordre-flow",
  "settings.checkmarks": "Markér individuelle produkter",
  "settings.checkmarks.helper":
    "Vis checkmarks på hvert produkt, så køkkenet kan markere dem færdige én ad gangen. Slå fra hvis I kun arbejder med hele ordrer.",
  "settings.autoAdvance": "Auto-skub når alle produkter er færdige",
  "settings.autoAdvance.helper":
    "Når alle produkter i en ordre er markeret færdige, rykkes ordren automatisk til næste stadie.",
  "settings.sms": "SMS-notifikationer",
  "settings.sms.enable": "Aktivér SMS",
  "settings.sms.helperDemo":
    "Send automatisk SMS til kunden når en ordre når \"Ready for Pick up\".",
  "settings.sms.previewLabel": "Besked ved \"Ready for Pick up\"",
  "settings.sms.previewNote": "Denne besked er fast og kan ikke redigeres.",
};

const en: Dict = {
  // KDS header
  "header.sort.oldest": "↑ Oldest",
  "header.sort.newest": "↓ Newest",
  "header.sort.oldestTitle": "Oldest first",
  "header.sort.newestTitle": "Newest first",
  "header.sound.onTitle": "Sound on",
  "header.sound.offTitle": "Sound off",
  "header.smsLog.title": "SMS history",
  "header.undo": "↩ Undo ({count})",
  "header.customerDisplay": "Customer screen",
  "header.settings": "⚙ Settings",

  // Pipeline bar
  "pipelineBar.all": "All",

  // Order card
  "card.changes": "Order changes",
  "card.clickAgain": "Click again → {next}",
  "card.done": "Done",
  "card.back": "← Back",
  "card.itemsDone": "{done}/{total} done",
  "card.itemsCount": "{total} items",
  "card.showDetails": "Show details",
  "card.sendSms": "Send SMS to {phone}",
  "card.deleted": "Deleted — don't make",
  "card.new": "NEW",
  "card.refunded": "Refunded",

  // Expanded card
  "expanded.unpaid": "UNPAID",
  "expanded.paid": "PAID",
  "expanded.customer": "Customer",
  "expanded.note": "Note",
  "expanded.items": "Items ({done}/{total} done)",
  "expanded.markAllDone": "Mark all done",
  "expanded.unmarkAll": "Unmark all",
  "expanded.variant": "Variant",
  "expanded.mod": "Mod",
  "expanded.ingredients": "Ingredients",
  "expanded.moveTo": "Move to: {next}",
  "expanded.moveBack": "← Move back",
  "expanded.goBack": "← Go back",
  "expanded.remove": "Remove",

  // Grid empty state
  "grid.empty.title": "No active orders",
  "grid.empty.subtitle": "New orders appear here automatically",

  // Customer display
  "customer.orderStatus": "Order status",
  "customer.preparing": "Preparing",
  "customer.ready": "Ready",
  "customer.preparingEmpty": "No orders right now",
  "customer.readyEmpty": "Orders appear here when they're ready",

  // Payment badge
  "payment.paid": "Paid",
  "payment.unpaid": "Unpaid",
  "payment.partial": "Partially paid",

  // Settings
  "settings.title": "Settings",
  "settings.backToKds": "← Back to KDS",
  "settings.display": "Display",
  "settings.timers": "Timer thresholds",
  "settings.timer.warning": "Warning after: {min} min",
  "settings.timer.critical": "Critical after: {min} min",
  "settings.timer.autoDismiss": "Remove from \"Ready for Pick up\" after: {value}",
  "settings.timer.disabled": "Disabled",
  "settings.timer.off": "Off",
  "settings.timer.helper":
    "Orders in the final stage are automatically removed after the chosen time. Set to 0 to disable.",
  "settings.orderFlow": "Order flow",
  "settings.checkmarks": "Mark individual items",
  "settings.checkmarks.helper":
    "Show checkmarks on each item so the kitchen can mark them done one by one. Disable if you only work with whole orders.",
  "settings.autoAdvance": "Auto-advance when all items are done",
  "settings.autoAdvance.helper":
    "When all items in an order are marked done, the order automatically advances to the next stage.",
  "settings.sms": "SMS notifications",
  "settings.sms.enable": "Enable SMS",
  "settings.sms.helperDemo":
    "Automatically send an SMS to the customer when an order reaches \"Ready for Pick up\".",
  "settings.sms.previewLabel": "Message at \"Ready for Pick up\"",
  "settings.sms.previewNote": "This message is fixed and cannot be edited.",
};

export const translations: Record<Language, Dict> = { da, en };
