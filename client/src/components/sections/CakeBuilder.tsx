import { Button } from "@/components/ui/Button";
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";

export function CakeBuilder() {
  const steps = [
    "Choose your size (3-inch, 4-inch, or 6-inch)",
    "Pick a base (protein or non-protein)",
    "Personalise with name & age or add a drip design (4-inch and 6-inch only)"
  ];

  return (
    <section id="cakes" className="py-24 bg-primary/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[3rem] shadow-soft p-8 md:p-16 border-4 border-primary/20 relative">
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              {/* Dog birthday cake stock photo */}
              <img 
                src="https://i.ibb.co/kdygfZG/Chat-GPT-Image-Feb-25-2026-07-05-20-AM.png" 
                alt="Beautiful custom dog cake" 
                className="rounded-3xl shadow-md object-cover aspect-[4/5] md:aspect-square w-full"
              />
              <div className="absolute -right-4 -bottom-4 bg-primary text-primary-foreground font-display font-bold p-6 rounded-full shadow-lg transform rotate-12 text-center">
                From<br/>€35
              </div>
            </div>
            
            <div className="order-1 md:order-2 space-y-8">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-accent leading-tight">
                Design the Perfect Barkday Cake 🎂
              </h2>
              <p className="text-lg text-accent/80">
                Celebrate their special day with a cake that looks good enough for humans but is made entirely for dogs! Sugar-free, grain-free options available.
              </p>
              
              <ul className="space-y-4">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-4 bg-secondary p-4 rounded-2xl">
                    <div className="mt-1 bg-white rounded-full text-primary shadow-sm">
                      <CheckCircle2 size={24} />
                    </div>
                    <span className="font-medium text-accent">{step}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-4">
                <Link href="/shop#cake-product" className="block w-full sm:inline-block sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-12">
                    Design Your Cake
                  </Button>
                </Link>
                <p className="text-sm text-accent/50 mt-4 text-center sm:text-left font-medium">
                  * 3-5 days notice required. Collection only at the market or Dublin studio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
