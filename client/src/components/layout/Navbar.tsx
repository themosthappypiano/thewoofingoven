import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/store/use-cart";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartCount, isDrawerOpen, openDrawer, closeDrawer } = useCart();
  const cartCount = getCartCount();
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Handle initial page load with hash fragments
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && location === "/") {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location]);

  const handleSectionClick = (sectionId: string) => {
    // If we're not on the home page, navigate there first
    if (location !== "/") {
      window.location.href = `/#${sectionId}`;
      return;
    }
    
    // If we're already on the home page, just scroll to the section
    const element = document.getElementById(sectionId);
    if (element) {
      // Get the navbar height and add some extra offset
      const navbarHeight = 120; // Approximate navbar height
      const extraOffset = 60; // Additional offset to scroll higher
      const elementPosition = element.offsetTop - navbarHeight - extraOffset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth"
      });
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Barkday Cakes", path: "/#cakes", sectionId: "cakes" },
    { name: "Find Us", path: "/#market", sectionId: "market" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-gradient-to-b from-[#fbc560] to-[#fbc560]/20 backdrop-blur-md shadow-sm py-3" : "bg-gradient-to-b from-[#fbc560] to-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="https://framerusercontent.com/images/bYdEiYKnlTCyPyWpSa1NHSZyyrE.png?scale-down-to=512&width=794&height=644" 
              alt="Logo" 
              className="h-32 w-auto group-hover:scale-110 transition-transform"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 ml-auto mr-8">
            {navLinks.map((link) => (
              link.sectionId ? (
                <button
                  key={link.name}
                  onClick={() => handleSectionClick(link.sectionId!)}
                  className="text-accent/80 font-medium hover:text-primary transition-colors text-lg"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  href={link.path}
                  className="text-accent/80 font-medium hover:text-primary transition-colors text-lg"
                >
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={openDrawer}
              className="relative p-2 text-accent hover:text-primary transition-colors group"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-accent"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-border">
            <div className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                link.sectionId ? (
                  <button
                    key={link.name}
                    onClick={() => handleSectionClick(link.sectionId!)}
                    className="text-accent font-medium text-lg p-2 rounded-xl hover:bg-secondary transition-colors text-left"
                  >
                    {link.name}
                  </button>
                ) : (
                  <Link
                    key={link.name}
                    href={link.path}
                    className="text-accent font-medium text-lg p-2 rounded-xl hover:bg-secondary transition-colors"
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </header>

      <CartDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
    </>
  );
}
