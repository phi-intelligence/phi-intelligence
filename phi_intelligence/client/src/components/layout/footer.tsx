import { Link } from "wouter";
import { Linkedin, Github, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/5 py-24 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <img src="/assets/logophi.png" alt="Phi" className="w-8 h-8 filter invert brightness-0" />
              <span className="text-2xl font-bold tracking-tighter uppercase">Phi Intelligence</span>
            </div>
            <p className="text-xl opacity-40 font-light max-w-xs leading-relaxed">
              Industrial intelligence architectures built for the next frontier.
            </p>
            <div className="flex gap-6 opacity-30">
              <a href="#" className="hover:opacity-100 transition-opacity"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:opacity-100 transition-opacity"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:opacity-100 transition-opacity"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase opacity-20">Systems</h4>
            <ul className="space-y-4 font-light opacity-60">
              <li><Link href="/services/ai-ml" className="hover:text-white transition-colors">AI & ML</Link></li>
              <li><Link href="/services/iot" className="hover:text-white transition-colors">Industrial IoT</Link></li>
              <li><Link href="/services/software-development" className="hover:text-white transition-colors">Adaptive Code</Link></li>
              <li><Link href="/services/data-science" className="hover:text-white transition-colors">Data Science</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase opacity-20">Company</h4>
            <ul className="space-y-4 font-light opacity-60">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/company/rd" className="hover:text-white transition-colors">R&D Lab</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Insights</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4 space-y-8">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase opacity-20">Connect</h4>
            <div className="space-y-6">
               <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm opacity-20 uppercase font-bold tracking-widest mb-1">Email</p>
                    <a href="mailto:info@phiintelligence.com" className="text-lg opacity-60 hover:opacity-100 transition-opacity">info@phiintelligence.com</a>
                  </div>
               </div>
               <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm opacity-20 uppercase font-bold tracking-widest mb-1">Inquiries</p>
                    <p className="text-lg opacity-60">07352745227</p>
                  </div>
               </div>
            </div>
          </div>

        </div>

        <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between gap-8 opacity-20 text-xs font-bold tracking-widest uppercase">
          <p>© 2026 Phi Intelligence. All rights reserved.</p>
          <div className="flex gap-8">
             <a href="#" className="hover:opacity-100">Privacy Policy</a>
             <a href="#" className="hover:opacity-100">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
