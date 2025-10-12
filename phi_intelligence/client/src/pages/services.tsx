import { Mic, Users, Code, Brain, ArrowRight, CheckCircle, Home, Camera, Bell, BarChart3, PieChart, TrendingUp, Database, Target, Zap, Shield, GitBranch, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ParticleWavesAnimation from "@/components/three/ParticleWavesAnimation";


export default function Services() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white">
      {/* Hero Section */}
      <section id="services-hero" className="relative h-screen flex items-center justify-center overflow-hidden" data-testid="services-hero">
        {/* Particle Waves Animation Background */}
        <ParticleWavesAnimation />
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10"></div>
        
        {/* Content Overlay */}
        <div className="relative z-20 text-center px-4 max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-light glow-text text-white mb-8">
            Our Services
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto mb-12 text-white">
            Comprehensive AI solutions designed to transform your business operations, 
            enhance customer experiences, and drive sustainable growth in the digital age.
          </p>
          <Link href="/company/contact">
            <Button 
              className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg bg-white text-black hover:bg-opacity-90 transition-all duration-300"
              data-testid="button-get-started"
            >
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* AI/ML Solutions Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                AI & ML Solutions
              </h3>
              <p className="text-xl opacity-80 mb-8 text-justify">
                We design, build, and deploy production-ready AI that streamlines operations, reduces costs, and improves customer engagement — enabling your organisation to operate more efficiently and scale with confidence.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light mt-0.5 flex-shrink-0" />
                  <span className="text-justify">Custom Voice Bots (24/7 Agents) – AI-driven voice automation for calls, bookings, and enquiries, available at all times.</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light mt-0.5 flex-shrink-0" />
                  <span className="text-justify">Conversational AI (Web, Chat & Social) – Context-aware chat solutions across web platforms, messaging apps, and social channels.</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light mt-0.5 flex-shrink-0" />
                  <span className="text-justify">Agentic Operations Software – Intelligent workforce and process management for real-time visibility and performance optimisation.</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light mt-0.5 flex-shrink-0" />
                  <span className="text-justify">LLM Applications & Custom AI Software – Bespoke large language model integrations and tailored AI products aligned with your data and workflows.</span>
                </div>
              </div>
              <div>
                <Link href="/services/ai-ml">
                  <Button
                    variant="ghost"
                    className="text-phi-white border-b border-phi-white hover:opacity-70 transition-opacity bg-transparent"
                  >
                    Explore AI/ML Services <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="floating-element flex justify-center items-center">
              <div className="glassmorphism p-8 rounded-xl">
                <div className="bg-black/20 border border-white/10 rounded-lg h-64 w-64 flex items-center justify-center overflow-hidden shadow-2xl">
                  <img 
                    src="/assets/ai.gif"
                    alt="AI & Machine Learning Solutions Animation"
                    className="w-full h-full object-cover rounded-lg"
                    style={{
                      filter: 'grayscale(100%) brightness(1.1) contrast(1.2)',
                      mixBlendMode: 'luminosity'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Software Development Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="floating-element md:order-1 order-2">
              <div className="glassmorphism p-8 rounded-xl">
                <div className="bg-black/20 border border-white/10 rounded-lg h-80 w-96 flex items-center justify-center overflow-hidden mx-auto">
                  <img 
                    src="/assets/Thumbnail-The-Competitive-Edge-Harnessing-Generative-AI-Tools-for-Modern-Software-Development.jpg"
                    alt="AI-Enhanced Software Development showing generative AI tools and modern development practices"
                    className="w-full h-full object-cover rounded-lg"
                    style={{
                      filter: 'grayscale(100%) brightness(1.1) contrast(1.2)',
                      mixBlendMode: 'luminosity'
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="md:order-2 order-1">
              <h3 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                AI-Enhanced Software Solutions
              </h3>
              <p className="text-xl opacity-80 mb-8 text-justify">
                Build smarter applications with AI-powered features, seamless automation, and scalable architecture.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light mt-0.5 flex-shrink-0" />
                  <span className="text-justify">AI-Enhanced Web App Development – Intelligent web solutions with integrated AI capabilities</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light mt-0.5 flex-shrink-0" />
                  <span className="text-justify">AI-Enhanced Mobile App Development – Smart mobile applications powered by AI-driven features</span>
                </div>
              </div>
              <div>
                <Link href="/services/software-development">
                  <Button
                    variant="ghost"
                    className="text-phi-white border-b border-phi-white hover:opacity-70 transition-opacity bg-transparent"
                  >
                    Explore Software Development <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IoT Solutions Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                AI-Powered IoT Systems
              </h3>
              <p className="text-xl opacity-80 mb-8 text-justify">
                Connect, monitor, and automate environments with AI-driven IoT solutions that improve efficiency, security, and control — across homes, facilities, and business operations.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light mt-0.5 flex-shrink-0" />
                  <span className="text-justify">Smart Facility & Home Automation – AI-enabled lighting, energy, and security management</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light mt-0.5 flex-shrink-0" />
                  <span className="text-justify">Real-Time Monitoring & Alerts – Intelligent notifications that keep you informed instantly</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light mt-0.5 flex-shrink-0" />
                  <span className="text-justify">IoT Data Intelligence – Turn connected device data into actionable dashboards and insights</span>
                </div>
              </div>
              <div>
                <Link href="/services/iot">
                  <Button
                    variant="ghost"
                    className="text-phi-white border-b border-phi-white hover:opacity-70 transition-opacity bg-transparent"
                  >
                    Explore IoT Services <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="floating-element">
              <div className="glassmorphism p-10 rounded-xl">
                <div className="bg-black/20 border border-white/10 rounded-xl h-80 w-96 flex items-center justify-center overflow-hidden mx-auto">
                  <img 
                    src="/assets/iothme.gif"
                    alt="AI-Powered IoT Systems showing connected devices, smart automation, and intelligent monitoring capabilities"
                    className="w-full h-full object-contain rounded-xl"
                    style={{
                      filter: 'grayscale(100%) brightness(1.2) contrast(1.3) saturate(0.8)',
                      mixBlendMode: 'luminosity'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Science Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="floating-element md:order-1 order-2">
              <div className="h-64 flex items-center justify-center overflow-hidden">
                <img 
                                      src="/assets/original-76a5db36a0639511b2d78de8036ef45a.gif"
                  alt="AI-Driven Data Intelligence Animation"
                  className="w-full h-full object-cover rounded-lg"
                  style={{
                    filter: 'grayscale(100%) brightness(1.1) contrast(1.2)',
                    mixBlendMode: 'luminosity'
                  }}
                />
              </div>
            </div>
            <div className="md:order-2 order-1">
              <h3 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                AI-Driven Data Intelligence
              </h3>
              <p className="text-xl opacity-80 mb-8 text-justify">
                Turn raw data into actionable insights with AI-powered analytics and business intelligence.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light mt-0.5 flex-shrink-0" />
                  <span className="text-justify">Business Intelligence with AI – Smarter decision-making powered by AI analytics</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light mt-0.5 flex-shrink-0" />
                  <span className="text-justify">Custom Analytics Solutions – Tailored models for unique business needs</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light mt-0.5 flex-shrink-0" />
                  <span className="text-justify">Predictive Insights & Forecasting – Anticipate trends with data-driven predictions</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light mt-0.5 flex-shrink-0" />
                  <span className="text-justify">Real-Time Dashboards & Reporting – Instant visibility with dynamic AI reporting tools</span>
                </div>
              </div>
              <div>
                <Link href="/services/data-science">
                  <Button
                    variant="ghost"
                    className="text-phi-white border-b border-phi-white hover:opacity-70 transition-opacity bg-transparent"
                  >
                    Explore Data Science <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 glow-text">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl opacity-80 mb-12">
            Contact our team of AI experts to discuss how we can help you implement cutting-edge solutions 
            that drive growth and efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/company/contact">
              <Button 
                className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg"
                data-testid="button-start-project"
              >
                Start Your Project
              </Button>
            </Link>
            <Link href="/products/voicebot-builder">
              <Button
                variant="outline" 
                className="border-2 border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
                data-testid="button-view-products"
              >
                Build Voice Agent
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
