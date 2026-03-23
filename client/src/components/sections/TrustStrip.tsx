import { Leaf, Cake, Store, Star } from "lucide-react";
import { Link } from "wouter";

export function TrustStrip() {
  const handleMarketClick = () => {
    const element = document.getElementById("market");
    if (!element) return;
    
    const navbarHeight = 120;
    const extraOffset = 20;
    const elementPosition = element.offsetTop - navbarHeight - extraOffset;
    
    window.scrollTo({
      top: elementPosition,
      behavior: "smooth",
    });
  };

  const handleReviewsClick = () => {
    const element = document.getElementById("reviews");
    if (!element) return;
    
    const navbarHeight = 120;
    const extraOffset = 20;
    const elementPosition = element.offsetTop - navbarHeight - extraOffset;
    
    window.scrollTo({
      top: elementPosition,
      behavior: "smooth",
    });
  };

  const points = [
    {
      icon: <Leaf className="text-primary" size={32} />,
      title: "100% Natural",
      desc: "Human-grade ingredients only",
      link: "/faq",
      isExternal: false
    },
    {
      icon: <Cake className="text-primary" size={32} />,
      title: "Custom Cakes",
      desc: "Made for their special day",
      link: "/shop/22",
      isExternal: false
    },
    {
      icon: <Store className="text-primary" size={32} />,
      title: "Local Market",
      desc: "Every Sunday in Dún Laoghaire",
      onClick: handleMarketClick,
      isExternal: false
    },
    {
      icon: <Star className="text-primary" size={32} />,
      title: "5-Star Rated",
      desc: "Approved by fussy eaters",
      onClick: handleReviewsClick,
      isExternal: false
    }
  ];

  return (
    <section className="bg-[#fbc560]/30 py-12 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {points.map((point, i) => {
            const ButtonContent = () => (
              <div className="flex flex-col items-center text-center space-y-3 group cursor-pointer transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-soft-hover transition-all duration-300 group-hover:scale-105">
                  {point.icon}
                </div>
                <div>
                  <h4 className="font-display font-bold text-accent text-lg group-hover:text-primary transition-colors duration-200">
                    {point.title}
                  </h4>
                  <p className="text-sm text-accent/70 group-hover:text-accent transition-colors duration-200">
                    {point.desc}
                  </p>
                </div>
              </div>
            );

            if (point.onClick) {
              return (
                <button key={i} onClick={point.onClick} className="block">
                  <ButtonContent />
                </button>
              );
            }

            if (point.link) {
              return (
                <Link key={i} href={point.link}>
                  <ButtonContent />
                </Link>
              );
            }

            return (
              <div key={i}>
                <ButtonContent />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
