import { v4 as uuid } from "uuid";
import type { Order, OrderItem, OrderSource } from "@/types/order";
import { useModeStore } from "@/stores/mode-store";
import { useLanguageStore } from "@/stores/language-store";

const SOURCES: OrderSource[] = ["pos", "weorder", "kiosk", "qr"];

export const ALL_CATEGORIES = ["Burgers", "Sides", "Salater", "Drikkevarer", "Dessert", "Wraps"];

const MENU_ITEMS: { name: string; category: string; variants: string[]; modifications: string[] }[] = [
  { name: "Classic Burger", category: "Burgers", variants: ["Small", "Medium", "Large"], modifications: ["Extra cheese", "No onions", "Extra bacon"] },
  { name: "Chicken Burger", category: "Burgers", variants: ["Medium", "Large"], modifications: ["Spicy sauce", "Extra salat"] },
  { name: "Veggie Burger", category: "Burgers", variants: ["Medium", "Large"], modifications: ["Vegan cheese", "Extra avocado"] },
  { name: "Pommes Frites", category: "Sides", variants: ["Small", "Medium", "Large"], modifications: ["Med truffle", "Cheese fries"] },
  { name: "Løgringe", category: "Sides", variants: [], modifications: ["Extra dip"] },
  { name: "Chicken Nuggets", category: "Sides", variants: ["6 stk", "9 stk", "12 stk"], modifications: ["BBQ sauce", "Sweet chili"] },
  { name: "Caesar Salat", category: "Salater", variants: ["Lille", "Stor"], modifications: ["Uden croutoner", "Extra kylling"] },
  { name: "Cola", category: "Drikkevarer", variants: ["Small", "Medium", "Large"], modifications: ["Uden is"] },
  { name: "Milkshake", category: "Drikkevarer", variants: ["Vanilje", "Chokolade", "Jordbær"], modifications: ["Extra tykt"] },
  { name: "Brownie", category: "Dessert", variants: [], modifications: ["Med is", "Med flødeskum"] },
  { name: "Cheesecake", category: "Dessert", variants: ["Klassisk", "Citron"], modifications: [] },
  { name: "Wrap", category: "Wraps", variants: ["Kylling", "Falafel", "Pulled Pork"], modifications: ["Extra sauce", "Ingen tomat"] },
];

const CUSTOMER_NAMES = [
  "Anders Jensen", "Mette Nielsen", "Lars Pedersen", "Sofia Hansen",
  "Emil Christensen", "Ida Larsen", "Oscar Rasmussen", "Freja Petersen",
  "Magnus Andersen", "Alma Olsen", "Noah Thomsen", "Ella Jørgensen",
];

// Comment-style notes shown in DEMO mode (POS staff + customer self-service).
const DEMO_COMMENTS_DA = [
  "Uden løg",
  "Ekstra dressing ved siden af",
  "Bordnummer 7",
  "Ring ved ankomst",
  "Glutenfri bolle, tak",
];

const DEMO_COMMENTS_EN = [
  "No onions",
  "Extra dressing on the side",
  "Table number 7",
  "Call on arrival",
  "Gluten-free bun, please",
];

function generateNotes(): string | undefined {
  if (useModeStore.getState().isFullMode) {
    return Math.random() > 0.8 ? "Allergisk over for nødder" : undefined;
  }
  const lang = useLanguageStore.getState().language;
  const pool = lang === "en" ? DEMO_COMMENTS_EN : DEMO_COMMENTS_DA;
  return Math.random() < 0.4 ? randomItem(pool) : undefined;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems<T>(arr: T[], min: number, max: number): T[] {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateOrderItem(): OrderItem {
  const menuItem = randomItem(MENU_ITEMS);
  return {
    id: uuid(),
    name: menuItem.name,
    quantity: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 2 : 1,
    variants: menuItem.variants.length > 0 ? [randomItem(menuItem.variants)] : [],
    modifications: randomItems(menuItem.modifications, 0, 2),
    ingredients: [],
    category: menuItem.category,
    isDone: false,
  };
}

function applyRandomChanges(order: Order): Order {
  const roll = Math.random();

  // ~5% — hele ordre refunderet/slettet (case 5)
  if (roll < 0.05) {
    return {
      ...order,
      isRefunded: true,
      hasChanges: true,
      items: order.items.map((item) => ({ ...item, changeStatus: "refunded" as const })),
    };
  }

  // ~10% — produkt erstattet (case 1): ét item fjernet, nyt indsat efter
  if (roll < 0.15 && order.items.length >= 2) {
    const idx = Math.floor(Math.random() * order.items.length);
    const removedItem = { ...order.items[idx], changeStatus: "removed" as const };
    const newItem = generateOrderItem();
    newItem.changeStatus = "added";
    const items = [...order.items];
    items[idx] = removedItem;
    items.splice(idx + 1, 0, newItem);
    return { ...order, items, hasChanges: true };
  }

  // ~10% — produkt slettet uden erstatning (case 3)
  if (roll < 0.25 && order.items.length >= 2) {
    const idx = Math.floor(Math.random() * order.items.length);
    const items = order.items.map((item, i) =>
      i === idx ? { ...item, changeStatus: "removed" as const } : item
    );
    return { ...order, items, hasChanges: true };
  }

  // ~5% — produkt refunderet (case 4)
  if (roll < 0.30 && order.items.length >= 2) {
    const idx = Math.floor(Math.random() * order.items.length);
    const items = order.items.map((item, i) =>
      i === idx ? { ...item, changeStatus: "refunded" as const } : item
    );
    return { ...order, items, hasChanges: true };
  }

  return order;
}

let orderCounter = 100;

export function generateMockOrder(firstStageId: string): Order {
  const source = randomItem(SOURCES);
  const now = new Date();
  // Stagger creation times: some orders are older to show timer colors
  const minutesAgo = Math.floor(Math.random() * 15);
  const createdAt = new Date(now.getTime() - minutesAgo * 60 * 1000);

  orderCounter++;

  const order: Order = {
    id: uuid(),
    orderNumber: orderCounter,
    source,
    items: randomItems(
      Array.from({ length: 8 }, () => generateOrderItem()),
      1,
      5
    ),
    currentStageId: firstStageId,
    createdAt: createdAt.toISOString(),
    paymentStatus: Math.random() > 0.2 ? "paid" : "unpaid",
    isPreOrder: false,
    notes: generateNotes(),
  };

  // Add customer info for web/kiosk orders
  if (source === "weorder" || source === "kiosk" || source === "qr") {
    const name = randomItem(CUSTOMER_NAMES);
    order.customerInfo = {
      name,
      phone: `+45 ${20 + Math.floor(Math.random() * 80)}${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`,
    };
  }

  return order;
}

export function generateMockPreOrder(firstStageId: string): Order {
  const source = randomItem(["weorder", "kiosk", "qr"] as OrderSource[]);
  const now = new Date();
  // Scheduled 15-90 minutes from now
  const minutesFromNow = 15 + Math.floor(Math.random() * 75);
  const scheduledTime = new Date(now.getTime() + minutesFromNow * 60 * 1000);

  orderCounter++;

  const name = randomItem(CUSTOMER_NAMES);

  return {
    id: uuid(),
    orderNumber: orderCounter,
    source,
    items: randomItems(
      Array.from({ length: 8 }, () => generateOrderItem()),
      1,
      5
    ),
    currentStageId: firstStageId,
    createdAt: now.toISOString(),
    paymentStatus: Math.random() > 0.3 ? "paid" : "unpaid",
    isPreOrder: true,
    scheduledTime: scheduledTime.toISOString(),
    customerInfo: {
      name,
      phone: `+45 ${20 + Math.floor(Math.random() * 80)}${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`,
    },
    notes: Math.random() > 0.7 ? "Forudbestilling - ring ved ankomst" : undefined,
  };
}

export function generateInitialOrders(firstStageId: string, count: number = 8): Order[] {
  return Array.from({ length: count }, () => {
    const order = generateMockOrder(firstStageId);
    return applyRandomChanges(order);
  });
}

export function generateInitialPreOrders(firstStageId: string, count: number = 3): Order[] {
  return Array.from({ length: count }, () => generateMockPreOrder(firstStageId));
}
