import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ContactForm from "@/components/ui/contact-form";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-28 lg:pt-32 pb-20">
      <div className="container mx-auto max-w-7xl px-6">
        
        {/* Contact Hero */}
        <div className="mb-12 lg:mb-24 text-center lg:text-left">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter"
          >
            CONTACT<br />
            <span className="opacity-20 uppercase">Sales.</span>
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start">
          
          {/* Form & Info Section */}
          <div className="space-y-12 lg:space-y-16 order-2 lg:order-1">
            <div className="space-y-4 text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase">Let's Connect</h3>
              <p className="text-lg sm:text-xl opacity-60 leading-relaxed font-light">
                Our team of experts is ready to help transform your business.
              </p>
            </div>

            <div className="space-y-6 lg:space-y-8">
              {[
                { icon: Mail, label: "Email", val: "info@phiintelligence.com" },
                { icon: Phone, label: "Phone", val: "07352745227" },
                { icon: MapPin, label: "Address", val: "Nottingham, NG5 3AS, UK" }
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 lg:gap-6 group">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                    <item.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[10px] lg:text-xs tracking-widest uppercase opacity-40 mb-1">{item.label}</h4>
                    <p className="text-lg lg:text-xl font-light">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 p-6 lg:p-12 bg-white/[0.02] rounded-[2rem] lg:rounded-[4rem] border border-white/10">
              <ContactForm />
            </div>
          </div>

          {/* Contact Visual - Replaced Robot with Static Image */}
          <div className="lg:sticky lg:top-40 flex flex-col items-center order-1 lg:order-2">
            <div className="w-full max-w-md lg:max-w-2xl aspect-[4/5] bg-white/[0.02] rounded-[3rem] border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl">
               <img 
                 src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000" 
                 className="w-full h-full object-cover grayscale opacity-60 transition-all duration-1000 hover:grayscale-0 hover:opacity-100"
                 alt="Contact Support" 
               />
               <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            </div>
            <div className="mt-8 lg:mt-16 text-center space-y-4">
               <p className="text-[10px] lg:text-xs tracking-[0.4em] opacity-40 uppercase font-bold">Global Support v2.0</p>
               <div className="flex items-center gap-3 justify-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] lg:text-xs opacity-60 font-medium tracking-widest uppercase">Live Agents Active</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}