import { Link } from "wouter";
import { Linkedin, Github, Twitter, Mail, Phone } from "lucide-react";

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

const company = [
  { href: "/about", label: "About" },
  { href: "/technology", label: "Technology" },
  { href: "/industries", label: "Industries" },
  { href: "/careers", label: "Careers" },
  { href: "/insights", label: "Insights" },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/5 py-24 px-6 md:px-0">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">

          {/* Brand Column */}
          <div className="md:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <img src="/assets/logophi.png" alt="Phi" className="w-8 h-8 filter invert brightness-0" />
              <span className="text-2xl font-bold tracking-tighter uppercase">Phi <span className="text-phi-blue">Intelligence</span></span>
            </div>
            <p className="text-lg opacity-40 font-light max-w-xs leading-relaxed">
              AI consulting, custom development, and open-source model integration — from strategy to production.
            </p>
            <div className="flex gap-6 opacity-30">
              <a href="#" className="hover:text-phi-blue transition-colors hover:opacity-100"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-phi-blue transition-colors hover:opacity-100"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-phi-blue transition-colors hover:opacity-100"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Services Column */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase opacity-20">Services</h4>
            <ul className="space-y-3 font-light opacity-60">
              {services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="hover:text-phi-blue transition-colors text-sm">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase opacity-20">Company</h4>
            <ul className="space-y-3 font-light opacity-60">
              {company.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="hover:text-phi-blue transition-colors text-sm">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-3 space-y-8">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase opacity-20">Connect</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:border-phi-blue/50 transition-all flex-shrink-0">
                  <Mail className="w-4 h-4 group-hover:text-phi-blue transition-colors" />
                </div>
                <div>
                  <p className="text-xs opacity-20 uppercase font-bold tracking-widest mb-1">Email</p>
                  <a href="mailto:info@phiintelligence.com" className="text-sm opacity-60 hover:text-phi-blue transition-colors">
                    info@phiintelligence.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:border-phi-blue/50 transition-all flex-shrink-0">
                  <Phone className="w-4 h-4 group-hover:text-phi-blue transition-colors" />
                </div>
                <div>
                  <p className="text-xs opacity-20 uppercase font-bold tracking-widest mb-1">Phone</p>
                  <p className="text-sm opacity-60">07352745227</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/contact">
                <button className="w-full py-3 px-6 bg-phi-blue/10 text-phi-blue border border-phi-blue/20 rounded-full text-sm font-bold hover:bg-phi-blue hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(0,163,255,0.1)]">
                  Book a Consultation
                </button>
              </Link>
            </div>
          </div>

        </div>

        <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between gap-6 opacity-20 text-xs font-bold tracking-widest uppercase">
          <p>© 2026 Phi Intelligence. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:opacity-100">Privacy Policy</a>
            <a href="#" className="hover:opacity-100">Terms of Service</a>
            <Link href="/admin/login" className="hover:opacity-100">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
