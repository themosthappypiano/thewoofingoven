import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { CakeBuilder } from "@/components/sections/CakeBuilder";
import { MarketSection } from "@/components/sections/MarketSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { AboutSection } from "@/components/sections/AboutSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        {/* Paws for Venezuela homepage promo section deactivated.
            The dedicated /paws-for-venezuela donation page and its Stripe
            links (in PawsForVenezuela.tsx) are untouched. */}
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
