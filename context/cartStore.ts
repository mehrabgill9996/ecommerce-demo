import { getProductById } from "@/lib/products";
import { CartItem } from "@/lib/types";

const STORAGE_KEY = "ecommerce-demo:cart";

type Listener = () => void;

const EMPTY_CART: CartItem[] = [];

let items: CartItem[] = EMPTY_CART;
let hasHydrated = false;
const listeners = new Set<Listener>();

function emitChange() {
  for (const listener of listeners) listener();
}

function readFromLocalStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        item && typeof item.id === "string" && Boolean(getProductById(item.id))
    );
  } catch {
    return [];
  }
}

function writeToLocalStorage(next: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore write failures (e.g. storage disabled/full).
  }
}

function setItems(next: CartItem[]) {
  items = next;
  writeToLocalStorage(items);
  emitChange();
}

export const cartStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // Runs on the client. Lazily hydrates from localStorage on first read
  // so the very first client snapshot reflects any previously saved cart.
  getSnapshot(): CartItem[] {
    if (!hasHydrated) {
      hasHydrated = true;
      items = readFromLocalStorage();
    }
    return items;
  },

  // Runs during SSR; localStorage isn't available there, so the server
  // always renders an empty cart. React reconciles this with the client
  // snapshot after hydration. Must return a stable reference or React
  // will think the snapshot changes on every render.
  getServerSnapshot(): CartItem[] {
    return EMPTY_CART;
  },

  addToCart(productId: string, quantity: number) {
    if (!getProductById(productId)) return;
    const existing = items.find((item) => item.id === productId);
    if (existing) {
      setItems(
        items.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setItems([...items, { id: productId, quantity }]);
    }
  },

  removeFromCart(productId: string) {
    setItems(items.filter((item) => item.id !== productId));
  },

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      cartStore.removeFromCart(productId);
      return;
    }
    setItems(
      items.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  },

  clearCart() {
    setItems([]);
  },
};
