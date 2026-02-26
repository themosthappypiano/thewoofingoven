import { Leaf, Cake, Store, Star } from "lucide-react";

export function TrustStrip() {
  const points = [
    {
      icon: <Leaf className="text-primary" size={32} />,
      title: "100% Natural",
      desc: "Human-grade ingredients only"
    },
    {
      icon: <Cake className="text-primary" size={32} />,
      title: "Custom Cakes",
      desc: "Made for their special day"
    },
    {
      icon: <Store className="text-primary" size={32} />,
      title: "Local Market",
      desc: "Every Sunday in Dún Laoghaire"
    },
    {
      icon: <Star className="text-primary" size={32} />,
      title: "5-Star Rated",
      desc: "Approved by fussy eaters"
    }
  ];

  return (
    <section className="bg-[#fbc560]/30 py-12 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {points.map((point, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                {point.icon}
              </div>
              <div>
                <h4 className="font-display font-bold text-accent text-lg">{point.title}</h4>
                <p className="text-sm text-accent/70">{point.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
