import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { useContact } from "@/hooks/use-api";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export function AboutSection() {
  const contactMutation = useContact();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = (data: any) => {
    contactMutation.mutate(data, {
      onSuccess: () => reset()
    });
  };

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* About */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-accent">
              Baked With Love in Ireland 🇮🇪
            </h2>
            <div className="aspect-video rounded-3xl overflow-hidden shadow-soft mb-8">
              {/* Founder dog photo */}
              <img 
                src="https://framerusercontent.com/images/5pvXOKBT2DEYtEnLCFdEewRMVY.jpg?width=1000&height=563" 
                alt="Dogs enjoying Woofing Oven treats" 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-lg text-accent/80 leading-relaxed">
              The Woofing Oven started in our tiny kitchen in Dublin when we realized how hard it was to find treats without nasty preservatives. What began as baking for our own two dogs, Bella and Benjamin, quickly turned into a full-time passion.
            </p>
            <p className="text-lg text-accent/80 leading-relaxed">
              Every single biscuit, cake, and pupcake is handcrafted using local, human-grade ingredients. Because they aren't just pets, they're family.
            </p>
          </div>

          {/* Contact Form */}
          <div id="contact" className="bg-secondary p-8 md:p-12 rounded-[3rem] border border-border">
            <h3 className="text-3xl font-display font-bold text-accent mb-2">Get in Touch</h3>
            <p className="text-accent/70 mb-8">Have a question about an order or a custom cake? Bark at us!</p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-accent mb-2">Your Name</label>
                <input 
                  {...register("name")}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message as string}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-accent mb-2">Email Address</label>
                <input 
                  {...register("email")}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-accent mb-2">Message</label>
                <textarea 
                  {...register("message")}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  placeholder="How can we help?"
                />
                {errors.message && <p className="text-destructive text-sm mt-1">{errors.message.message as string}</p>}
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={contactMutation.isPending}
              >
                {contactMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
