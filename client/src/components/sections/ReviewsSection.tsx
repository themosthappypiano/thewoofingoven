import { Star } from "lucide-react";

export function ReviewsSection() {
  const reviews = [
    {
      id: 1,
      dogName: "Harry",
      rating: 5,
      content: "We ordered a birthday cake for our boy Harry and honestly, it was amazing! From the moment he saw it, he was completely obsessed — tail wagging, big smile, the whole lot. The cake looked beautiful and was such a lovely size, perfectly decorated and clearly made with so much care. Harry absolutely devoured it (and tried to go back for seconds!). You can really tell these treats are made with love. We'll definitely be ordering again. Highly recommend The Woofing Oven for any special pup celebration! 🐾🎂",
      img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=150&h=150&fit=crop"
    },
    {
      id: 2,
      dogName: "Princess Sally",
      rating: 5,
      content: "Pawpals, the smell of this delicious Woofles and cupcake really got me struggling to pose for this pic!",
      img: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=150&h=150&fit=crop"
    },
    {
      id: 3,
      dogName: "Barnaby",
      rating: 5,
      content: "Fussy eater approved! We pick up a fresh bag every Sunday at the market. Great quality ingredients.",
      img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&h=150&fit=crop"
    }
  ];

  return (
    <section className="py-24 bg-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-accent mb-16">
          Dog-Approved 🐾
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-3xl shadow-soft text-left relative mt-8">
              <div className="absolute -top-10 left-8">
                <img 
                  src={review.img} 
                  alt={review.dogName} 
                  className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-sm"
                />
              </div>
              <div className="mt-8 flex gap-1 mb-4 text-primary">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-accent/80 italic mb-6 text-lg">"{review.content}"</p>
              <p className="font-bold text-accent font-display">{review.dogName} says...</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
