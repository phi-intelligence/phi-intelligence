import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Search, Rocket, HeartHandshake, CheckCircle, MessageSquare, Eye, Bot, Smartphone, ShieldCheck, Brain, GraduationCap, Building2, Globe } from "lucide-react";
import Robot3D from "@/components/three/robotvoice";

const values = [
  { icon: Rocket, title: "Business-Driven Innovation", desc: "We build AI and software solutions that solve real business problems, improve operations, and create measurable value." },
  { icon: CheckCircle, title: "Practical, Scalable Technology", desc: "We focus on solutions that are not only innovative, but also reliable, scalable, and ready for real-world use." },
  { icon: Shield, title: "Quality and Trust", desc: "We believe strong systems are built on accuracy, security, performance, and honest delivery. Our clients trust us to build with care and responsibility." },
  { icon: Search, title: "From Idea to Execution", desc: "We do more than suggest ideas. We design, develop, and implement complete solutions that businesses can actually use and grow with." },
  { icon: HeartHandshake, title: "Long-Term Partnership", desc: "We work with clients as long-term technology partners, supporting them beyond launch with improvements, maintenance, and future growth." },
  { icon: Brain, title: "Solutions That Fit the Client", desc: "Every business is different. We create tailored AI and software systems based on the client's goals, industry, and operational needs." },
];

const processSteps = [
  { number: "01", label: "Discovery", desc: "We map your business, your data, and the processes that cost you most — then identify where AI creates the highest-value impact." },
  { number: "02", label: "Strategy", desc: "We build a phased roadmap with ROI projections, KPIs, and milestones — so you know exactly what you're building toward." },
  { number: "03", label: "PoC", desc: "We ship a working prototype in 4–8 weeks. You see real results before committing to full-scale investment." },
  { number: "04", label: "Development", desc: "We build the full solution with your tech stack, security requirements, and regulatory obligations baked in." },
  { number: "05", label: "Deployment", desc: "We deploy to production with monitoring, logging, alerting, and reliability engineering built in from the start." },
  { number: "06", label: "Support", desc: "We remain your partner. We iterate, improve, and scale your AI systems as your business evolves." },
];

const researchAreas = [
  { icon: MessageSquare, title: "Natural Language Processing", desc: "Advancing how machines understand, generate, and reason with human language." },
  { icon: Eye, title: "Computer Vision", desc: "Developing visual intelligence for document processing, quality control, and scene understanding." },
  { icon: Bot, title: "Autonomous Systems", desc: "Research into agentic AI — systems that plan, reason, and execute multi-step tasks independently." },
  { icon: Smartphone, title: "Edge Intelligence", desc: "Deploying capable AI models on resource-constrained hardware without cloud dependency." },
  { icon: ShieldCheck, title: "AI Safety & Ethics", desc: "Building systems that are secure, explainable, fair, and aligned with human values." },
  { icon: Brain, title: "Neural Architecture Research", desc: "Exploring new model architectures and training techniques for efficiency and capability." },
];

const partnerships = [
  { icon: GraduationCap, title: "Academic Ties", desc: "We maintain connections with university research groups, bridging the gap between theory and deployable technology." },
  { icon: Building2, title: "Industry Collaboration", desc: "We partner with businesses on applied AI research — solving domain-specific problems that advance both the company and the field." },
  { icon: Globe, title: "Open-Source Community", desc: "We contribute to and collaborate with the open-source AI community, including Hugging Face, and the broader ML ecosystem." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,163,255,0.07),transparent_65%)]" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-7 space-y-6"
            >
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">About Us</p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                About Phi<br />
                <span className="text-phi-blue">Intelligence.</span>
              </h1>
              <p className="text-lg text-white/50 font-light leading-relaxed max-w-2xl">
                Phi Intelligence is an AI integration company based in Nottingham, UK. We help businesses adopt AI — selecting the right models, integrating them into existing systems, and building new AI-native applications.
              </p>
              <Link href="/contact">
                <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm shadow-[0_0_40px_rgba(0,163,255,0.2)]">
                  Work With Us <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-3xl border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                <div className="w-full h-full relative z-10 scale-125">
                  <Robot3D />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Our Principles</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
              What We<br /><span className="text-phi-blue">Stand For.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="border border-white/8 rounded-2xl p-6 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-phi-blue/5 border border-phi-blue/10 flex items-center justify-center mb-4 group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                  <value.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white/90 mb-2">{value.title}</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Our Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
              How We<br /><span className="text-phi-blue">Work.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-phi-blue/10 rounded-2xl overflow-hidden border border-phi-blue/10">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-black p-8 group hover:bg-phi-blue/[0.03] transition-colors"
              >
                <div className="text-4xl font-bold text-phi-blue/10 mb-4 group-hover:text-phi-blue/25 transition-colors">{step.number}</div>
                <h3 className="text-base font-bold text-white/80 mb-2 uppercase tracking-wide">{step.label}</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Research */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Research & Innovation</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
              Pushing What's<br /><span className="text-phi-blue">Possible.</span>
            </h2>
            <p className="text-base text-white/40 font-light mt-3 max-w-2xl leading-relaxed">
              Alongside our client work, we conduct applied research into the areas that matter most for the future of AI in business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {researchAreas.map((area, i) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="border border-white/8 rounded-2xl p-6 hover:border-phi-blue/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-phi-blue/5 border border-phi-blue/10 flex items-center justify-center mb-4 group-hover:bg-phi-blue/20 transition-colors">
                  <area.icon className="w-5 h-5 text-white/40 group-hover:text-phi-blue transition-colors" />
                </div>
                <h3 className="font-bold text-white/80 mb-2 uppercase text-sm tracking-wide">{area.title}</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">{area.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Partnerships */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 pt-8 border-t border-white/5">
            {partnerships.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-phi-blue/5 border border-phi-blue/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <p.icon className="w-5 h-5 text-phi-blue/50" />
                </div>
                <div>
                  <h3 className="font-bold text-white/80 mb-1">{p.title}</h3>
                  <p className="text-sm text-white/40 font-light leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
            Work With<br /><span className="text-phi-blue">Our Team.</span>
          </h2>
          <p className="text-lg text-white/40 font-light">
            Whether you need a strategy, a prototype, or a full production system — we're the team that builds and ships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold shadow-[0_0_40px_rgba(0,163,255,0.2)]">
                Get In Touch <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/careers">
              <Button variant="outline" className="pill-button border-white/10 hover:border-phi-blue/50 hover:bg-phi-blue/5 hover:text-white px-10 py-4 text-sm">
                Join the Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
