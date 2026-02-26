import { Instagram, Mail, MapPin } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-accent text-accent-foreground pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <h3 className="font-display text-2xl font-bold text-primary">The Woofing Oven</h3>
            <p className="text-accent-foreground/80 text-sm leading-relaxed">
              Ireland's No.1 Dog Bakery. 100% natural, human-grade treats and custom barkday cakes baked fresh in Dublin.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-accent-foreground/80 hover:text-white transition-colors">Shop All</Link></li>
              <li><Link href="/#cakes" className="text-accent-foreground/80 hover:text-white transition-colors">Barkday Cakes</Link></li>
              <li><Link href="/#about" className="text-accent-foreground/80 hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/#contact" className="text-accent-foreground/80 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Market */}
          <div>
            <h4 className="font-bold mb-4 text-primary">Find Us</h4>
            <ul className="space-y-3 text-accent-foreground/80 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>Every Sunday<br/>Dún Laoghaire People's Park<br/>10:00 am - 4:00 pm</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-4 text-primary">Join the Santa Paws List 🐾</h4>
            <p className="text-sm text-accent-foreground/80 mb-4">Get updates on new flavors and market locations.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-primary"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                Join
              </button>
            </form>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-accent-foreground/60 text-sm flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} The Woofing Oven. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made with 🤎 in Ireland</p>
        </div>
      </div>
    </footer>
  );
}
