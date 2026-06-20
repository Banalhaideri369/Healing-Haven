import { createContext, useContext, useState, type ReactNode } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  finalPrice: number;
  type: "recorded" | "online";
  image: string;
  telegramLink?: string;
}

interface CartContextType {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  add: () => {},
  remove: () => {},
  clear: () => {},
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const add = (item: CartItem) =>
    setItems((prev) => (prev.find((x) => x.id === item.id) ? prev : [...prev, item]));

  const remove = (id: string) =>
    setItems((prev) => prev.filter((x) => x.id !== id));

  const clear = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        items,
        add,
        remove,
        clear,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
