import { useEffect, useMemo } from "react";
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/use-cart";

export default function CheckoutSuccess() {
  const clearCart = useCart((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("session_id") || "";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-soft max-w-xl w-full text-center border border-border">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-4xl font-display font-bold text-accent mb-4">Order Confirmed!</h1>
          <p className="text-accent/70 mb-4">
            Your payment was successful and we have your order.
          </p>
          <p className="text-accent/70 mb-8">
            We&apos;ll prepare it and contact you if anything else is needed.
          </p>
          {sessionId && (
            <p className="text-xs text-accent/50 mb-8 break-all">
              Reference: {sessionId}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop">
              <Button size="lg">Shop Again</Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">Return Home</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
