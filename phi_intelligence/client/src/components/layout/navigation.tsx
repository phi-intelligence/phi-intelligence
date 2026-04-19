import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const services = [
  { href: "/services/saas", label: "SaaS Applications" },
  { href: "/services/mobile-development", label: "Mobile Applications" },
  { href: "/services/web-development", label: "Web Applications" },
  { href: "/services/process-automation", label: "Business Automation" },
  { href: "/services/voice-automation", label: "Voice Agents" },
  { href: "/services/document-processing", label: "Document Processing" },
  { href: "/services/digital-marketing", label: "Digital Marketing" },
  { href: "/services/computer-vision", label: "Computer Vision" },
];

const flatLinks = [
  { href: "/products",    label: "Products"    },
  { href: "/portfolio",   label: "Portfolio"   },
  { href: "/about",       label: "About"       },
  { href: "/careers",     label: "Careers"     },
  { href: "/technology",  label: "Technology"  },
  { href: "/insights",    label: "Insights"    },
];

export default function Navigation() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const isActive = (href: string) => location === href || location.startsWith(href + '/');

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/85 backdrop-blur-md border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/assets/logophi.png"
              alt="Phi Intelligence"
              className="h-7 w-7 filter brightness-0 invert mr-3"
            />
            <span className="font-rajdhani font-bold text-[22px] tracking-wider uppercase leading-none">
              PHI <span className="text-phi-blue">INTELLIGENCE</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">

            {/* HOME */}
            <Link
              href="/"
              className={`text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:opacity-70 ${
                location === '/' ? 'text-white' : 'text-white/60'
              }`}
            >
              Home
            </Link>

            {/* SERVICES — keeps mega-menu */}
            <div className="relative group">
              <Link
                href="/services"
                className={`text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:text-phi-blue flex items-center gap-1 ${
                  isActive('/services') ? 'text-phi-blue' : 'text-white/60'
                }`}
              >
                Services
                <ChevronDown className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
              </Link>

              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[min(520px,90vw)] bg-[#0A0A0F]/95 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                <div className="p-6">
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/30 mb-4">Our Services</p>
                  <div className="grid grid-cols-2 gap-1">
                    {services.map((service) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group/item ${
                          location === service.href
                            ? 'bg-phi-blue/10 text-phi-blue'
                            : 'text-white/60 hover:bg-white/5 hover:text-phi-blue'
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover/item:bg-phi-blue transition-colors" />
                        <span className="text-sm font-medium">{service.label}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <Link
                      href="/services"
                      className="flex items-center gap-2 text-xs text-white/40 hover:text-phi-blue transition-colors font-medium tracking-widest uppercase"
                    >
                      View all services
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* FLAT LINKS */}
            {flatLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:text-phi-blue ${
                  isActive(item.href) ? 'text-phi-blue' : 'text-white/60'
                }`}
              >
                {item.label}
              </Link>
            ))}

          </div>

          {/* Contact CTA button (desktop) */}
          <div className="hidden lg:flex items-center">
            <Link href="/contact">
              <Button className="bg-phi-blue text-white hover:bg-phi-blue/90 rounded-full px-6 py-2 text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(0,163,255,0.3)]">
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black border-white/10 w-[min(320px,85vw)]">
              <div className="flex flex-col space-y-2 mt-8">

                <Link href="/" onClick={() => setIsOpen(false)} className="text-base font-medium text-white/70 hover:text-white py-3 px-2 transition-colors">
                  Home
                </Link>

                {/* Services accordion */}
                <div>
                  <button
                    onClick={() => toggleDropdown('services')}
                    className="flex items-center justify-between w-full text-base font-medium text-white/70 hover:text-white py-3 px-2 transition-colors"
                  >
                    Services
                    {openDropdowns.has('services')
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />
                    }
                  </button>
                  {openDropdowns.has('services') && (
                    <div className="ml-4 space-y-1 mt-1 mb-2">
                      {services.map((service) => (
                        <Link
                          key={service.href}
                          href={service.href}
                          onClick={() => setIsOpen(false)}
                          className="block text-sm text-white/50 hover:text-white py-2 px-2 transition-colors"
                        >
                          {service.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Flat links */}
                {flatLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-base font-medium text-white/70 hover:text-white py-3 px-2 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="pt-4">
                  <Link href="/contact" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-phi-blue text-white hover:bg-phi-blue/90 rounded-full font-bold shadow-[0_0_20px_rgba(0,163,255,0.25)]">
                      Contact Us
                    </Button>
                  </Link>
                </div>

              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </nav>
  );
}
