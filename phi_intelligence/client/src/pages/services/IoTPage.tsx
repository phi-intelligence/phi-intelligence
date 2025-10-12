import { Link } from "wouter";
import { Home, Bell, ArrowRight, CheckCircle, Wifi, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IoTPage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background GIF with theme overlay */}
        <div className="absolute inset-0 z-0">
          <img 
                                src="/assets/iot-1.gif"
            alt="AI-Powered IoT Systems background showing connected devices and intelligent automation"
            className="w-full h-full object-cover"
            style={{
              filter: 'grayscale(100%) brightness(0.8) contrast(1.2) saturate(0.7)',
              mixBlendMode: 'luminosity'
            }}
          />
        </div>
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10"></div>
        
        {/* Content Overlay */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-light glow-text text-white mb-6">
            AI-Powered IoT Systems
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-12 text-white">
            Empower your spaces with AI-driven IoT solutions that connect devices, monitor environments, and automate operations in real time. From smart homes and offices to retail, logistics, and industrial facilities, our IoT systems deliver efficiency, security, and intelligent control.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/company/contact">
              <Button
                className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg bg-white text-black hover:bg-opacity-90 transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/services">
              <Button
                variant="outline"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-all duration-300"
              >
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Services Sections */}
      
      {/* AI-Driven Home IoT Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                AI-Driven Home IoT
              </h3>
              <p className="text-xl opacity-80 mb-8">
                A unified home automation solution that connects all your devices into one intelligent system. Control and monitor from anywhere, with AI features that adapt to your lifestyle for smarter living.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Remote connectivity and control of all devices from anywhere</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>AI-powered routines and smart automations</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Energy optimisation with real-time usage insights</span>
                </div>
              </div>
              <div>
                <Link href="/company/contact">
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
              <div className="glassmorphism p-10 rounded-xl">
                <div className="bg-black/20 border border-white/10 rounded-xl h-80 w-80 flex items-center justify-center overflow-hidden mx-auto">
                  <img 
                    src="/assets/hme.jpg"
                    alt="AI-Driven Home IoT system showing a smart home with digital connections and various icons"
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



      {/* AI-Driven Facility IoT Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="floating-element md:order-1 order-2">
              <div className="glassmorphism p-10 rounded-xl">
                <div className="bg-black/20 border border-white/10 rounded-xl h-80 w-96 flex items-center justify-center overflow-hidden mx-auto">
                  <img 
                    src="/assets/iothme.gif"
                    alt="AI-Driven Facility IoT showing interconnected systems, monitoring, and intelligent automation for enterprise facilities"
                    className="w-full h-full object-contain rounded-xl"
                    style={{
                      filter: 'grayscale(100%) brightness(1.2) contrast(1.3) saturate(0.8)',
                      mixBlendMode: 'luminosity'
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="md:order-2 order-1">
              <h3 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                AI-Driven Facility IoT
              </h3>
              <p className="text-xl opacity-80 mb-8">
                Enterprise-ready IoT solutions that connect and optimise offices, warehouses, and industrial spaces with intelligent monitoring and automation for smarter, safer, and more efficient operations.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Centralised monitoring and control across facilities</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>AI-driven automation for energy, security, and workflows</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Real-time analytics and alerts for improved efficiency</span>
                </div>
              </div>
              <div>
                <Link href="/company/contact">
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
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Ready to Make Your Environment Smarter?
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Transform your home or business with intelligent IoT solutions that learn, adapt, and optimize your environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/company/contact">
              <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                Get a Free Consultation
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
