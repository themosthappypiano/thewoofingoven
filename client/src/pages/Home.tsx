import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { CakeBuilder } from "@/components/sections/CakeBuilder";
import { MarketSection } from "@/components/sections/MarketSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <section className="bg-[#FFF8EE] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-[#6B3F1E]/15 bg-[#FFC56E] shadow-sm">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center lg:p-10">
              <div className="space-y-4 text-[#2C2A29]">
                <p className="font-display text-3xl font-bold leading-tight sm:text-4xl">
                  🇻🇪🐾 Paws for Venezuela
                </p>
                <div className="max-w-3xl space-y-3 text-sm leading-6 sm:text-base">
                  <p>
                    Next Sunday 5 July, The Woofing Oven is holding a special day to support dogs in Venezuela.
                  </p>
                  <p>
                    Some of you may not know that we are Venezuelan, and what is happening back home has affected us deeply. We know there is a huge need for humanitarian help for people, but there are also many dogs being left behind - dogs without owners, without microchips, without names, and without anyone looking for them.
                  </p>
                  <p className="font-bold text-[#6B3F1E]">Special campaign offer: 3 x Training Treats for €20</p>
                  <p className="font-bold text-[#A40000]">Available throughout July.</p>
                  <p>
                    Treat your pup and help us send a little more support to dogs in Venezuela through Red de Apoyo Canino.
                  </p>
                </div>
              </div>
              <div className="space-y-4 rounded-xl bg-[#FFF8EE] p-5 text-[#2C2A29]">
                <Link
                  href="/shop/21"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#A40000] px-5 py-3 text-center font-bold text-white transition-colors hover:bg-[#EC1C24]"
                >
                  Shop the Venezuela Treat Pack
                </Link>
                <div className="space-y-2 text-sm leading-6">
                  <p className="font-bold text-[#6B3F1E]">Prefer to donate directly?</p>
                  <p>You can also donate directly to Red de Apoyo Canino.</p>
                  <div className="flex flex-wrap gap-2">
                    <a className="font-bold text-[#A40000] underline-offset-4 hover:underline" href="https://www.paypal.me/reddeapoyocanino" target="_blank" rel="noreferrer">
                      PayPal
                    </a>
                    <a className="font-bold text-[#A40000] underline-offset-4 hover:underline" href="https://www.teaming.net/reddeapoyocanino" target="_blank" rel="noreferrer">
                      Teaming
                    </a>
                    <a className="font-bold text-[#A40000] underline-offset-4 hover:underline" href="https://www.instagram.com/reddeapoyocanino/" target="_blank" rel="noreferrer">
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <TrustStrip />
        <FeaturedProducts />
        <CakeBuilder />
        <MarketSection />
        <ReviewsSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
