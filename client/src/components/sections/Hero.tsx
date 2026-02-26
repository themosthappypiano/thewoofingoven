import { Link } from "wouter";
import { Button } from "@/components/ui/Button";
import { Sparkles, Heart } from "lucide-react";
import { useState, useEffect } from "react";

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const heroImages = [
    "https://i.ibb.co/kdygfZG/Chat-GPT-Image-Feb-25-2026-07-05-20-AM.png",
    "https://i.ibb.co/XwfFZhj/Whats-App-Image-2025-10-15-at-21-54-09-4.jpg",
    "https://i.ibb.co/1fy5Yj57/Whats-App-Image-2025-10-15-at-21-35-34-3.jpg",
    "https://www.clarelynchcreative.com/wp-content/uploads/2024/09/1_The_Woofing_Oven_Irish_Dog_Treats_Woofles_Dogs_Packaging_Design-2500x1728.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div className="space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-accent font-semibold text-sm mb-4">
              <Sparkles size={16} className="text-primary" />
              <span>Ireland’s No.1 Dog Bakery 🐾</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-accent leading-[1.1]">
              Freshly Baked <br/>
              <span className="text-primary">Joy</span> for Dogs.
            </h1>
            
            <p className="text-lg md:text-xl text-accent/80 max-w-lg mx-auto md:mx-0">
              100% natural, human-grade treats and custom Barkday cakes baked fresh in Dublin. Because they deserve the best.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto">
                  Shop All Treats
                </Button>
              </Link>
              <Link href="/#cakes">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Book a Barkday Cake
                </Button>
              </Link>
            </div>
            
            <div className="pt-4 flex items-center justify-center md:justify-start gap-4 text-sm font-medium text-accent/60">
              <span className="flex items-center gap-1"><Heart size={16} className="text-primary" /> Natural Ingredients</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Baked to Order</span>
            </div>
          </div>

          {/* Image Carousel */}
          <div className="relative">
            <div className="relative h-[500px] rounded-[3rem] overflow-hidden border-8 border-white shadow-soft">
              {heroImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`The Woofing Oven treats and cakes ${index + 1}`}
                  className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  } ${
                    index === 2 ? 'object-contain bg-white' : 'object-cover'
                  }`}
                  style={{
                    transition: 'opacity 1000ms ease-in-out'
                  }}
                />
              ))}
            </div>
            
            {/* Image indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentImageIndex 
                      ? 'bg-white shadow-lg' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-3xl shadow-soft-hover flex items-center gap-4 border-2 border-secondary">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                🧁
              </div>
              <div>
                <p className="font-bold text-accent font-display leading-tight">Over 5,000</p>
                <p className="text-sm text-accent/60">Happy Dogs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
