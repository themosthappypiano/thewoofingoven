import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NEWSLETTER_IMAGE_URL =
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1200&q=80&auto=format&fit=crop";
const NEWSLETTER_POPUP_SEEN_KEY = "woofing-oven-newsletter-popup-seen";
const NEWSLETTER_POPUP_SUBSCRIBED_KEY = "woofing-oven-newsletter-popup-subscribed";

export function NewsletterPopup() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (location === "/checkout") return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(NEWSLETTER_POPUP_SEEN_KEY)) return;
    if (window.localStorage.getItem(NEWSLETTER_POPUP_SUBSCRIBED_KEY)) return;

    const timer = window.setTimeout(() => setIsOpen(true), 1400);

    window.localStorage.setItem(NEWSLETTER_POPUP_SEEN_KEY, "true");
    return () => window.clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    if (!isOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopup();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [isOpen]);

  const closePopup = () => {
    setIsOpen(false);
  };

  const subscribe = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log("[newsletter] submitting email", { email: email.trim() });

      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const contentType = response.headers.get("content-type") || "";
      const raw = await response.text();
      let data: any = null;

      if (raw) {
        if (contentType.includes("application/json")) {
          try {
            data = JSON.parse(raw);
          } catch {
            data = null;
          }
        } else {
          try {
            data = JSON.parse(raw);
          } catch {
            data = { message: raw };
          }
        }
      }

      console.log("[newsletter] subscribe response", {
        status: response.status,
        ok: response.ok,
        contentType,
        data,
      });

      if (!response.ok) {
        throw new Error(data?.message || "Failed to subscribe");
      }

      setIsOpen(false);
      setEmail("");
      window.localStorage.setItem(NEWSLETTER_POPUP_SUBSCRIBED_KEY, "true");
      window.localStorage.setItem(NEWSLETTER_POPUP_SEEN_KEY, "true");
      toast({
        title: "You're subscribed",
        description: "We will send product drops and exclusive offers to your inbox.",
        className: "bg-primary text-primary-foreground border-none",
      });
    } catch (error: any) {
      console.error("[newsletter] subscribe error", error);
      toast({
        title: "Subscription failed",
        description: error?.message || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/35 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={closePopup}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Newsletter signup"
        className="relative w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-soft"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/95 text-accent hover:bg-secondary transition-colors"
        >
          <X size={18} />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="h-64 md:h-[420px]">
            <img
              src={NEWSLETTER_IMAGE_URL}
              alt="Happy dog running"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-7 md:p-10 flex flex-col justify-center">
            <h3 className="text-4xl leading-[0.95] font-display text-accent mb-4">
              Never miss
              <br />
              product updates
            </h3>
            <p className="text-accent/60 text-lg leading-snug mb-7">
              Subscribe to hear about new treats, seasonal drops, and exclusive
              offers from The Woofing Oven.
            </p>

            <form onSubmit={subscribe} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="w-full rounded-lg border border-border bg-secondary/35 px-4 py-3 text-accent outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-accent px-4 py-3 text-white font-eveleth-slant text-lg uppercase tracking-wide hover:bg-accent/90 transition-colors"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
