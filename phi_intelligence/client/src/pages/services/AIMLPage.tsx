import { Link } from "wouter";
import { Mic, MessageSquare, Users, Brain, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import NeuralNetworkAnimation from "@/components/three/NeuralNetworkAnimation";
import AudioBarsAnimation from "@/components/three/AudioBarsAnimation";
import ChatbotMascotAnimation from "@/components/three/ChatbotMascotAnimation";

export default function AIMLPage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* 3D Neural Network Animation Background */}
        <div className="hero-animation-container">
          <NeuralNetworkAnimation 
            className="w-full h-full"
            enableInteraction={false}
            animationSpeed={1.0}
            particleCount={800}
            maxConnections={60}
            minDistance={100}
            showDots={true}
            showLines={true}
          />
        </div>
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-10"></div>
        
        {/* Content Overlay */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-light glow-text text-white mb-6">
            AI & ML Solutions
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-12 text-white">
            We design, build, and deploy enterprise-grade AI solutions that streamline operations, reduce costs, and enhance customer engagement
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/company/contact">
              <Button
                className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg bg-white text-black hover:bg-opacity-90 transition-all duration-300"
                data-testid="button-get-started"
              >
                Book a Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/services">
              <Button
                variant="outline"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-all duration-300"
              >
                Explore All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Services Sections */}
      
      {/* Custom Voice Bots Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                Voice Agents
              </h3>
              <p className="text-xl opacity-80 mb-8">
                Custom Voice Bots (24/7 Agents) - AI-powered voice assistants that manage calls, handle bookings, capture orders, and reflect your brand voice — available around the clock.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>24/7 coverage with no missed calls</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Automated bookings, orders, and FAQs</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Consistent, brand-aligned responses</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Reduced handling time and staffing costs</span>
                </div>
              </div>
              <div>
                <Link href="/services/custom-voice-bots">
                  <Button
                    variant="ghost"
                    className="text-phi-white border-b border-phi-white hover:opacity-70 transition-opacity bg-transparent"
                  >
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="floating-element">
              <div className="glassmorphism p-8 rounded-xl">
                <div className="bg-black/20 border border-white/10 rounded-lg h-64 flex items-center justify-center overflow-hidden">
                  <AudioBarsAnimation 
                    barCount={7}
                    animationSpeed={1.2}
                    enableInteraction={false}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversational AI Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="floating-element md:order-1 order-2">
              <div className="glassmorphism p-8 rounded-xl">
                <div className="bg-black/20 border border-white/10 rounded-lg h-64 flex items-center justify-center overflow-hidden">
                  <ChatbotMascotAnimation 
                    enableInteraction={false}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
            <div className="md:order-2 order-1">
              <h3 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                Conversational AI (Web, Chat & Social)
              </h3>
              <p className="text-xl opacity-80 mb-8">
                Intelligent chatbots that deliver natural, context-aware conversations across your website, live chat, WhatsApp, and social channels—integrated with your CRM and knowledge base.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Advanced NLP tuned to your FAQs & policies</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Omnichannel: web, WhatsApp, Messenger, SMS</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Seamless human handoff when needed</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Analytics, A/B training & continuous improvement</span>
                </div>
              </div>
              <div>
                <Link href="/services/conversational-ai">
                  <Button
                    variant="ghost"
                    className="text-phi-white border-b border-phi-white hover:opacity-70 transition-opacity bg-transparent"
                  >
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agentic Software Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                Agentic Operations Software
              </h3>
              <p className="text-xl opacity-80 mb-8">
                Bring intelligence to daily operations with AI agents that automate tasks, optimise resources, and deliver real-time insights. Designed for workforce, logistics, and customer operations, our agentic systems improve reliability, compliance, and efficiency.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Autonomous Workflow Automation – Agents that handle routine tasks and approvals</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Shift & Resource Optimisation – Smarter planning with AI-driven forecasts</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Exception Tracking & Compliance – Automatic monitoring of risks and SLA breaches</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Real-Time Analytics – Dashboards for faster, data-driven decisions</span>
                </div>
              </div>
              <div>
                <Link href="/services/agentic-software">
                  <Button
                    variant="ghost"
                    className="text-phi-white border-b border-phi-white hover:opacity-70 transition-opacity bg-transparent"
                  >
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="floating-element">
              <div className="glassmorphism p-8 rounded-xl">
                <div className="bg-black/20 border border-white/10 rounded-xl h-96 w-96 flex items-center justify-center overflow-hidden mx-auto">
                  <img 
                    src="/assets/Agent.gif"
                    alt="Agentic AI ecosystem showing interconnected concepts like tuning, improvement, optimization, and proactive action"
                    className="w-full h-full object-contain rounded-xl"
                    style={{
                      filter: 'brightness(1.1) contrast(1.1)',
                      mixBlendMode: 'luminosity'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Open-Source AI Solutions Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="floating-element">
              <div className="glassmorphism p-8 rounded-xl">
                <div className="bg-black/20 border border-white/10 rounded-lg h-64 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/assets/11-os-llm--1-.jpg"
                    alt="Open-Source AI Models and Platforms including LLaMA, Mistral, Hugging Face, and more"
                    className="w-full h-full object-cover rounded-lg"
                    style={{
                      filter: 'grayscale(100%) brightness(1.2) contrast(1.3) saturate(0.8)',
                      mixBlendMode: 'luminosity'
                    }}
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                Open-Source AI Solutions
              </h3>
              <p className="text-xl opacity-80 mb-8">
                We help businesses harness the power of open-source LLMs like LLaMA 3, Mistral, and Falcon to build secure, cost-effective, and flexible AI systems. Deploy on-premise or in the cloud with full control over data and no vendor lock-in.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Data privacy & compliance</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Lower costs than proprietary models</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Customisable for your workflows</span>
                </div>
              </div>
              <div>
                <Link href="/services/open-source-ai">
                  <Button
                    variant="ghost"
                    className="text-phi-white border-b border-phi-white hover:opacity-70 transition-opacity bg-transparent"
                  >
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Ready to Transform Your Business with AI?
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Let our team of AI experts help you implement cutting-edge machine learning solutions that drive measurable results and a clear competitive advantage.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/company/contact">
              <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                Schedule a Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/products">
              <Button
                variant="outline"
                className="border-2 border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
              >
                View Our Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
