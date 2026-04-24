import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-soft max-w-xl w-full text-center border border-border">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-4xl font-display font-bold text-accent mb-4">Checkout Cancelled</h1>
          <p className="text-accent/70 mb-8">
            No problem. Your cart is still there if you want to finish the order.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/checkout">
              <Button size="lg">Back to Checkout</Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline">Keep Shopping</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
