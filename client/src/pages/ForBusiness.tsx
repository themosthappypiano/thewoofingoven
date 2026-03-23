import { useEffect } from "react";
import { Instagram, Mail, PawPrint, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const businessLinks = [
  {
    id: "wholesale",
    title: "Wholesale",
    description: "Stock handcrafted dog treats your customers will love.",
  },
  {
    id: "corporate",
    title: "Corporate",
    description: "Thoughtful treats for dog-loving businesses.",
  },
  {
    id: "catering",
    title: "Catering",
    description: "Dog event catering for community, brand, and celebration moments.",
  },
];

const cateringCards = [
  {
    title: "Handcrafted for Happy Dogs",
    text: "Our event catering is built around fresh, dog-friendly bakes made with care and presented beautifully for the occasion.",
    image: "https://i.postimg.cc/xdsvL2VY/Whats-App-Image-2026-03-10-at-18-19-37.jpg",
  },
  {
    title: "Styled for the Occasion",
    text: "We can create a setup that feels polished, playful, and in keeping with your event, from simple displays to more styled presentation.",
    image: "https://i.postimg.cc/fbHcYNQQ/Whats-App-Image-2026-03-10-at-18-19-37(1).jpg",
  },
  {
    title: "Easy for Hosts",
    text: "Within Dublin, we can arrange delivery, setup, and takedown so you can focus on the fun while we handle the bakery side.",
    image: "https://i.postimg.cc/g0MV3WbG/Whats-App-Image-2026-03-10-at-18-18-37(1).jpg",
  },
];

export default function ForBusiness() {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;

      const element = document.getElementById(hash);
      if (!element) return;

      setTimeout(() => {
        const navbarHeight = 140;
        const elementPosition = element.offsetTop - navbarHeight;
        window.scrollTo({ top: elementPosition, behavior: "smooth" });
      }, 120);
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8EE]">
      <Navbar />
      <main className="flex-1 pt-24 sm:pt-32 lg:pt-36 pb-24">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2.25rem] bg-white px-6 py-10 md:px-10 md:py-12 shadow-soft border border-[#F5C842]/20">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F5C842]/40 bg-[#F5C842]/15 px-4 py-2 text-sm font-semibold text-[#6B3F1E]">
                <Sparkles size={16} className="text-[#B07A16]" />
                Partnerships & Events
              </div>
              <h1 className="text-5xl md:text-6xl font-display text-[#6B3F1E] leading-[1.02]">
                The Woofing Oven
                <br />
                For Business
              </h1>
              <p className="text-lg md:text-xl text-[#222222]/76 max-w-2xl">
                We love working with dog lovers, businesses, and communities across Dublin.
                From joyful dog-friendly events to retail partnerships, we create handcrafted
                treats and experiences that bring a little extra happiness to every wagging tail.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {businessLinks.map((link) => (
                <a
                  key={link.id}
                  href={`/for-business#${link.id}`}
                  className="rounded-[1.5rem] border-2 border-[#F5C842]/30 bg-[#FFF8EE] p-5 hover:bg-[#F5C842]/12 hover:border-[#F5C842] transition-colors"
                >
                  <div className="text-2xl font-display text-[#6B3F1E] mb-2">{link.title}</div>
                  <p className="text-sm leading-relaxed text-[#222222]/72">{link.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="catering" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 scroll-mt-40">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-8 items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B07A16]">
                Dog Event Catering
              </p>
              <h2 className="text-5xl font-display text-[#6B3F1E] leading-[1.02]">
                Tail-wagging catering for dog-friendly events
              </h2>
              <p className="text-lg text-[#222222]/76">
                At The Woofing Oven, we specialise in creating joyful, dog-friendly
                catering experiences for events of all sizes. Whether you&apos;re planning
                a brand activation, community gathering, corporate event, or a special
                celebration for pups, we bring handcrafted treats, thoughtful presentation,
                and a warm bakery atmosphere that both dogs and their humans will love.
              </p>
              <p className="text-lg text-[#222222]/76">
                Every event is unique, and we&apos;re happy to tailor the treats,
                presentation, and setup to suit your space and the number of attending dogs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:thewoofingoven@gmail.com?subject=Catering%20Enquiry"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5C842] px-6 py-4 font-semibold text-[#6B3F1E] shadow-soft hover:shadow-soft-hover transition-all"
                >
                  <Mail size={18} />
                  Email Us to Enquire
                </a>
                <a
                  href="https://www.instagram.com/thewoofingoven/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#6B3F1E] px-6 py-4 font-semibold text-[#6B3F1E] hover:bg-white transition-colors"
                >
                  <Instagram size={18} />
                  Message Us on Instagram
                </a>
              </div>
            </div>

            <img
              src="https://i.postimg.cc/Zqf86SzT/Whats-App-Image-2026-03-10-at-18-18-37.jpg"
              alt="Joyful dog-friendly event scene"
              className="w-full rounded-[2rem] object-cover shadow-soft-hover min-h-[420px]"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center rounded-[2rem] bg-white p-6 md:p-10 shadow-soft mt-10">
            <img
              src="https://i.postimg.cc/g0MV3WbG/Whats-App-Image-2026-03-10-at-18-18-37(1).jpg"
              alt="Styled dog catering table"
              className="w-full h-full min-h-[320px] rounded-[1.75rem] object-cover"
            />
            <div className="space-y-5">
              <h3 className="text-4xl font-display text-[#6B3F1E]">
                Made for Memorable Dog-Friendly Events
              </h3>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                From intimate gatherings to larger public events, we tailor each catering
                setup to suit your space, your guests, and the number of attending dogs.
                Everything is designed to feel fun, welcoming, and beautifully presented
                with the same playful Woofing Oven charm people know from the market.
              </p>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                We can create custom experiences that feel polished, easy, and full of
                personality, with natural treats and thoughtful presentation at the heart of it all.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#F5C842] px-6 py-8 md:px-10 md:py-10 text-[#6B3F1E] shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-10">
            <div className="flex items-center gap-3">
              <PawPrint size={22} />
              <p className="text-xl md:text-2xl font-semibold">
                Freshly baked, dog-safe treats designed to bring a little extra joy to your event.
              </p>
            </div>
            <div className="text-2xl">💛</div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {cateringCards.map((card) => (
              <article
                key={card.title}
                className="overflow-hidden rounded-[2rem] bg-white shadow-soft border border-[#F5C842]/15"
              >
                <img src={card.image} alt={card.title} className="h-64 w-full object-cover" />
                <div className="p-6 space-y-3">
                  <h3 className="text-2xl font-display text-[#6B3F1E]">{card.title}</h3>
                  <p className="text-[#222222]/75 leading-relaxed">{card.text}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-center mt-10">
            <img
              src="https://i.postimg.cc/fbHcYNQQ/Whats-App-Image-2026-03-10-at-18-19-37(1).jpg"
              alt="Dogs enjoying treats at an event"
              className="w-full min-h-[360px] rounded-[2rem] object-cover shadow-soft"
            />
            <div className="rounded-[2rem] bg-white p-6 md:p-10 shadow-soft space-y-5">
              <h3 className="text-4xl font-display text-[#6B3F1E]">
                Perfect for Community, Corporate, and Celebration Events
              </h3>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                The Woofing Oven catering is ideal for dog-friendly brand activations,
                office events, local gatherings, launch events, and pup celebrations.
                If dogs are invited, we&apos;re happy to make the day feel even more special.
              </p>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                Every event is different, so we&apos;re always happy to tailor the
                presentation and overall experience to suit what you have in mind.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#6B3F1E] px-6 py-10 md:px-10 text-white text-center shadow-soft-hover mt-10">
            <h3 className="text-4xl md:text-5xl font-display mb-4">Planning an Event?</h3>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              Get in touch with us to request a custom quote based on your event details,
              location, and number of attending dogs. We&apos;d love to hear what you&apos;re planning.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="mailto:thewoofingoven@gmail.com?subject=Catering%20Enquiry"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5C842] px-6 py-4 font-semibold text-[#6B3F1E]"
              >
                <Mail size={18} />
                thewoofingoven@gmail.com
              </a>
              <a
                href="https://www.instagram.com/thewoofingoven/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 px-6 py-4 font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Instagram size={18} />
                @thewoofingoven
              </a>
            </div>
          </div>
        </section>

        <section id="corporate" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 scroll-mt-40">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B07A16]">
                Corporate & Business Partnerships
              </p>
              <h2 className="text-5xl font-display text-[#6B3F1E] leading-[1.02]">
                Thoughtful treats for dog-loving businesses
              </h2>
              <p className="text-lg text-[#222222]/76">
                At The Woofing Oven, we love working with pet-focused businesses to create
                thoughtful treats that add a special touch to your customer experience.
              </p>
              <p className="text-lg text-[#222222]/76">
                Whether you&apos;re a groomer, veterinary clinic, dog walker, daycare,
                trainer, or pet-friendly cafe, our handcrafted dog biscuits can help you
                leave a lasting impression with the dogs and owners you care for every day.
              </p>
              <a
                href="mailto:thewoofingoven@gmail.com?subject=Corporate%20Partnership%20Enquiry"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5C842] px-6 py-4 font-semibold text-[#6B3F1E] shadow-soft hover:shadow-soft-hover transition-all"
              >
                <Mail size={18} />
                Enquire About Partnerships
              </a>
            </div>

            <img
              src="https://i.postimg.cc/g2cF0VYB/Whats-App-Image-2026-03-10-at-18-19-32.jpg"
              alt="Branded dog biscuits"
              className="w-full rounded-[2rem] object-cover shadow-soft-hover min-h-[420px]"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center rounded-[2rem] bg-white p-6 md:p-10 shadow-soft mt-10">
            <video
              src="/corporate-video-1.mp4"
              controls
              muted
              playsInline
              className="w-full h-full min-h-[320px] rounded-[1.75rem] object-cover bg-black"
            />
            <div className="space-y-5">
              <h3 className="text-4xl font-display text-[#6B3F1E]">
                A Small Treat That Makes a Big Impression
              </h3>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                Sometimes the smallest gesture leaves the biggest impact.
              </p>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                A personalised biscuit offered at the end of a grooming appointment,
                included in a welcome pack, or given after a training session can turn
                an everyday service into something memorable.
              </p>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                Our biscuits are baked in small batches using natural, dog-safe ingredients
                and can be customised with your business name, message, or seasonal campaign.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center mt-10">
            <div className="rounded-[2rem] bg-white p-6 md:p-10 shadow-soft space-y-5">
              <h3 className="text-4xl font-display text-[#6B3F1E]">
                Designed for Pet-Focused Businesses
              </h3>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                We partner with businesses across the dog community who want to add a thoughtful
                touch to their services.
              </p>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                Our personalised treats are perfect for welcoming new clients, celebrating loyal
                customers, or simply saying thank you to the dogs that visit your business every day.
              </p>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                Every partnership is different, so we&apos;re happy to tailor designs,
                quantities, and messaging to suit your brand.
              </p>
            </div>
            <video
              src="/corporate-video-2.mp4"
              controls
              muted
              playsInline
              className="w-full min-h-[360px] rounded-[2rem] object-cover shadow-soft bg-black"
            />
          </div>

          <div className="rounded-[2rem] bg-[#6B3F1E] px-6 py-10 md:px-10 text-white text-center shadow-soft-hover mt-10">
            <h3 className="text-4xl md:text-5xl font-display mb-4">Interested in Partnering With Us?</h3>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              If you&apos;d like to offer personalised dog treats to your customers,
              we&apos;d love to chat about creating something special for your business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="mailto:thewoofingoven@gmail.com?subject=Corporate%20Partnership%20Enquiry"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5C842] px-6 py-4 font-semibold text-[#6B3F1E]"
              >
                <Mail size={18} />
                thewoofingoven@gmail.com
              </a>
              <a
                href="https://www.instagram.com/thewoofingoven/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 px-6 py-4 font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Instagram size={18} />
                @thewoofingoven
              </a>
            </div>
          </div>
        </section>

        <section id="wholesale" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 scroll-mt-40">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-8 items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B07A16]">
                Wholesale
              </p>
              <h2 className="text-5xl font-display text-[#6B3F1E] leading-[1.02]">
                Stock handcrafted dog treats your customers will love
              </h2>
              <p className="text-lg text-[#222222]/76">
                At The Woofing Oven, we partner with pet-friendly businesses who want to
                offer something special for the dogs that visit their shops and spaces.
              </p>
              <p className="text-lg text-[#222222]/76">
                Our handcrafted treats are made with natural, dog-safe ingredients and baked
                in small batches in Ireland. With their playful designs and beautiful
                presentation, they are perfect for businesses looking to stock high-quality dog treats.
              </p>
              <a
                href="mailto:thewoofingoven@gmail.com?subject=Wholesale%20Catalogue%20Request"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5C842] px-6 py-4 font-semibold text-[#6B3F1E] shadow-soft hover:shadow-soft-hover transition-all"
              >
                <Mail size={18} />
                Request Wholesale Catalogue
              </a>
            </div>

            <img
              src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80"
              alt="Retail display of dog treats"
              className="w-full rounded-[2rem] object-cover shadow-soft-hover min-h-[420px]"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center rounded-[2rem] bg-white p-6 md:p-10 shadow-soft mt-10">
            <img
              src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80"
              alt="Pet shop shelf with treats"
              className="w-full h-full min-h-[320px] rounded-[1.75rem] object-cover"
            />
            <div className="space-y-5">
              <h3 className="text-4xl font-display text-[#6B3F1E]">
                Perfect for Independent Retailers
              </h3>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                We work with a variety of businesses including pet shops, dog cafes,
                grooming salons, farm shops, garden centres, dog daycares, and independent retailers.
              </p>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                Our wholesale selection includes some of our most popular baked treats such as
                biscuits, dognuts, pupcakes, and seasonal creations, all packaged and ready for retail display.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-center mt-10">
            <img
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80"
              alt="Close up of packaged dog treats"
              className="w-full min-h-[360px] rounded-[2rem] object-cover shadow-soft"
            />
            <div className="rounded-[2rem] bg-white p-6 md:p-10 shadow-soft space-y-5">
              <h3 className="text-4xl font-display text-[#6B3F1E]">
                Simple, Friendly Wholesale Partnerships
              </h3>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                We aim to make wholesale partnerships simple, reliable, and enjoyable.
                Our goal is to help you offer something unique to the dog-loving customers
                who visit your business.
              </p>
              <p className="text-[#222222]/75 text-lg leading-relaxed">
                Whether you&apos;re a small independent shop or a growing pet-focused
                retailer, we&apos;d be delighted to explore how we can work together.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-[#6B3F1E] px-6 py-10 md:px-10 text-white text-center shadow-soft-hover mt-10">
            <h3 className="text-4xl md:text-5xl font-display mb-4">Interested in Stocking Our Treats?</h3>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              Get in touch to request our wholesale catalogue and pricing.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="mailto:thewoofingoven@gmail.com?subject=Wholesale%20Catalogue%20Request"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F5C842] px-6 py-4 font-semibold text-[#6B3F1E]"
              >
                <Mail size={18} />
                thewoofingoven@gmail.com
              </a>
              <a
                href="https://www.instagram.com/thewoofingoven/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 px-6 py-4 font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Instagram size={18} />
                @thewoofingoven
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
