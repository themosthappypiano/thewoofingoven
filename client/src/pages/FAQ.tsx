import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const faqData = [
  {
    id: 1,
    question: "Are all your treats dog-safe?",
    answer: "Yes! Every product is made using 100% dog-friendly ingredients — no preservatives, no added salt, no artificial sweeteners, and absolutely no Xylitol. Everything is baked fresh in Ireland using simple, wholesome ingredients."
  },
  {
    id: 2,
    question: "What type of flour do you use?",
    answer: "All our treats (except grain-free ones) are made with 100% oat flour. Our grain-free range uses chickpea (gram) flour."
  },
  {
    id: 3,
    question: "Do you make treats for dogs with allergies?",
    answer: "Yes — many of our products are naturally gentle. We also offer grain-free options like Woofles.\n\nFor severe allergies, always consult your vet first."
  },
  {
    id: 4,
    question: "Do you offer wholesale or branded treats?",
    answer: "Yes! We supply branded biscuits to groomers, coffee shops, day-care centres, and events. Available individually wrapped, labelled, or bulk-packed."
  },
  {
    id: 5,
    question: "How do I store the treats?",
    answer: "– Keep in an airtight container\n– Use within 7–10 days\n– Freeze Woofles, Dognuts, Pupcakes & Cakes for up to 3 months"
  },
  {
    id: 6,
    question: "How do I order a doggie cake?",
    answer: "Choose cake size, pick flavour, add name & age, and choose collection method.\n\nLead time: 4–7 days notice."
  },
  {
    id: 7,
    question: "Do you deliver?",
    answer: "– Local Dublin collection\n– Sunday Market collection\n– Dublin delivery (small extra fee)"
  },
  {
    id: 8,
    question: "Are your cakes safe for humans?",
    answer: "Technically yes — but they're made for dog taste buds, not humans 😄"
  },
  {
    id: 9,
    question: "Can you customise decorations?",
    answer: "Yes! Names, numbers, colour themes and simple dog-safe decorations."
  },
  {
    id: 10,
    question: "Do you offer corporate/custom orders?",
    answer: "We create branded biscuits, event packs, treat bundles, and activation treats for pet-friendly brands."
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev.filter(item => item !== id), id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 sm:pt-32 lg:pt-36 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* FAQ Section */}
            <div className="flex-[2] rounded-3xl border-4 border-primary/60 bg-secondary/80 p-8 shadow-soft">
              <h1 className="relative mb-8 pl-12 text-4xl font-display font-bold text-accent md:text-5xl">
                ⭐ The Woofing Oven – FAQ
                <span className="absolute left-0 top-0 text-4xl text-primary">🐾</span>
              </h1>

              {faqData.map((item, index) => (
                <div 
                  key={item.id} 
                  className="mb-4 overflow-hidden rounded-2xl border-2 border-primary/40 bg-white"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="flex w-full items-center justify-between bg-primary/20 px-6 py-4 text-left transition-colors duration-200 hover:bg-primary/30"
                  >
                    <span className="text-lg font-bold text-accent">
                      {index + 1}. {item.question}
                    </span>
                    <span 
                      className={`text-carrot-chickpea transition-transform duration-300 ${
                        openItems.includes(item.id) ? 'rotate-90' : ''
                      }`}
                    >
                      ➤
                    </span>
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openItems.includes(item.id) ? 'max-h-96 py-6' : 'max-h-0'
                    }`}
                  >
                    <div className="px-6 text-[#614C45] text-lg leading-relaxed whitespace-pre-line">
                      {item.answer}
                    </div>
                  </div>
                </div>
              ))}

              {/* Bottom Image */}
              <div className="mt-10 text-center">
                <img 
                  src="https://i.ibb.co/mVX2KjK2/Whats-App-Image-2025-10-15-at-21-35-34-2.jpg"
                  alt="The Woofing Oven treats"
                  className="mx-auto w-4/5 rounded-3xl border-4 border-primary/60 shadow-soft"
                />
              </div>
            </div>

            {/* Gallery Section */}
            <div className="flex-1 flex flex-col gap-6">
              <img 
                src="https://i.ibb.co/tMb2zSD0/Whats-App-Image-2025-10-15-at-21-35-34-10.jpg"
                alt="Woofing Oven gallery 1"
                className="w-full rounded-3xl border-4 border-primary/60 object-cover shadow-soft"
              />
              <img 
                src="https://i.ibb.co/7JWbBKtX/Whats-App-Image-2025-10-15-at-22-00-56.jpg"
                alt="Woofing Oven gallery 2"
                className="w-full rounded-3xl border-4 border-primary/60 object-cover shadow-soft"
              />
              <img 
                src="https://i.ibb.co/hRTxbyzd/Whats-App-Image-2025-10-15-at-22-00-56-1.jpg"
                alt="Woofing Oven gallery 3"
                className="w-full rounded-3xl border-4 border-primary/60 object-cover shadow-soft"
              />
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
