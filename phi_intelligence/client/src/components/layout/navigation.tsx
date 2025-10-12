import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// Logo path updated to public folder


const navItems = [
  { href: "/", label: "HOME" },
  { 
    href: "/services", 
    label: "SERVICES",
    dropdown: [
      { href: "/services/ai-ml", label: "AI/ML SOLUTIONS" },
      { href: "/services/software-development", label: "SOFTWARE DEVELOPMENT" },
      { href: "/services/iot", label: "IOT SOLUTIONS" },
      { href: "/services/data-science", label: "DATA SCIENCE" },
    ]
  },
  { href: "/products", label: "PRODUCTS" },
  { href: "/careers", label: "CAREERS" },
  { href: "/blog", label: "BLOG" },
  { 
    href: null, 
    label: "COMPANY",
    dropdown: [
      { href: "/company/rd", label: "R&D" },
      { href: "/company/contact", label: "CONTACT US" },
      { href: "/admin/login", label: "ADMIN PANEL" },
    ]
  },
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

  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glassmorphism" : ""
      }`}
      data-testid="navigation"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-2xl font-bold glow-text"
            data-testid="logo-link"
          >
            <img 
              src="/assets/logophi.png" 
              alt="Phi Intelligence" 
              className="h-8 w-8 filter brightness-0 invert"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.dropdown ? (
                  <div className="relative group">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={`nav-link font-medium transition-all duration-300 hover:opacity-70 hover:-translate-y-0.5 flex items-center gap-1 ${
                          location === item.href ? "text-phi-light" : ""
                        }`}
                        data-testid={`nav-link-${item.label.toLowerCase()}`}
                      >
                        {item.label}
                        <ChevronDown className="h-3 w-3" />
                      </Link>
                    ) : (
                      <div className="nav-link font-medium flex items-center gap-1 cursor-default">
                        {item.label}
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    )}
                    
                    {/* Hover Dropdown */}
                    <div className="absolute top-full left-0 mt-2 w-64 bg-phi-black border border-phi-gray rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                      <div className="py-2">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.href}
                            href={dropdownItem.href}
                            className="block px-4 py-3 text-phi-white hover:bg-phi-gray hover:text-phi-white transition-all duration-200 cursor-pointer"
                          >
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  item.href ? (
                    <Link
                      href={item.href}
                      className={`nav-link font-medium transition-all duration-300 hover:opacity-70 hover:-translate-y-0.5 ${
                        location === item.href ? "text-phi-light" : ""
                      }`}
                      data-testid={`nav-link-${item.label.toLowerCase()}`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <div className="nav-link font-medium cursor-default">
                      {item.label}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-phi-white"
                data-testid="mobile-menu-toggle"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-phi-black border-phi-gray"
            >
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <div key={item.label}>
                    {item.dropdown ? (
                      <div>
                        <button
                          onClick={() => toggleDropdown(item.label)}
                          className="flex items-center justify-between w-full text-lg font-medium text-phi-light py-2 transition-all duration-300 hover:opacity-70"
                          data-testid={`mobile-dropdown-toggle-${item.label.toLowerCase()}`}
                        >
                          {item.label}
                          {openDropdowns.has(item.label) ? (
                            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                          ) : (
                            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                          )}
                        </button>
                        {openDropdowns.has(item.label) && (
                          <div className="ml-4 space-y-2 mt-2 animate-in slide-in-from-top-2 duration-200">
                            {item.dropdown.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.href}
                                href={dropdownItem.href}
                                onClick={() => setIsOpen(false)}
                                className="block text-base transition-all duration-300 hover:opacity-70 py-1"
                                data-testid={`mobile-nav-link-${dropdownItem.label.toLowerCase()}`}
                              >
                                {dropdownItem.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      item.href ? (
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`text-lg font-medium transition-all duration-300 hover:opacity-70 py-2 block ${
                            location === item.href ? "text-phi-light" : ""
                          }`}
                          data-testid={`mobile-nav-link-${item.label.toLowerCase()}`}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <div className="text-lg font-medium text-phi-light py-2">
                          {item.label}
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
