import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useShop, cartTotal } from "@/lib/store";
import { formatINR } from "@/lib/products";

export function CartDrawer() {
  const cartOpen = useShop((s) => s.cartOpen);
  const closeCart = useShop((s) => s.closeCart);
  const cart = useShop((s) => s.cart);
  const updateQty = useShop((s) => s.updateQty);
  const removeFromCart = useShop((s) => s.removeFromCart);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  if (!cartOpen) return null;
  const total = cartTotal(cart);

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink/40 animate-rise"
        onClick={closeCart}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-2xl animate-rise">
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="eyebrow">Your bag</p>
            <h3 className="font-display text-xl">{cart.length} {cart.length === 1 ? "item" : "items"}</h3>
          </div>
          <button onClick={closeCart} aria-label="Close" className="p-2">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-display text-xl">Your bag is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Let's find you something beautiful.
              </p>
              <Link
                to="/shop"
                search={{ category: "all" }}
                onClick={closeCart}
                className="mt-6 border-b border-foreground pb-1 eyebrow"
              >
                Browse couture
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {cart.map((item) => (
                <li key={item.product.id + item.size} className="flex gap-4 py-5">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-28 w-20 shrink-0 object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="eyebrow text-[0.6rem]">{item.product.collection}</p>
                        <p className="mt-1 font-display text-base leading-tight">
                          {item.product.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Size {item.size}</p>
                      </div>
                      <p className="text-sm">{formatINR(item.product.price * item.qty)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="inline-flex items-center border border-border">
                        <button
                          className="grid h-8 w-8 place-items-center hover:text-gold"
                          onClick={() => updateQty(item.product.id, item.qty - 1)}
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm">{item.qty}</span>
                        <button
                          className="grid h-8 w-8 place-items-center hover:text-gold"
                          onClick={() => updateQty(item.product.id, item.qty + 1)}
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <footer className="border-t border-border p-6">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Subtotal</span>
              <span className="font-display text-2xl">{formatINR(total)}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Shipping & taxes calculated at checkout.
            </p>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="mt-5 inline-flex w-full items-center justify-center bg-foreground py-4 text-xs font-medium tracking-[0.25em] uppercase text-background transition-colors hover:bg-gold hover:text-gold-foreground"
            >
              Secure checkout
            </Link>
            <button
              onClick={closeCart}
              className="mt-3 w-full text-center text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              Continue shopping
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
