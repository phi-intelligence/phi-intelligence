import { Link } from "wouter";
import { Code, Brain, Cpu, ArrowRight, CheckCircle, Zap, Shield, GitBranch, Database, Users, Globe, Smartphone, Settings, Target, Lightbulb, Building2, DollarSign, Clock, Search, TrendingUp, AppWindow, Monitor, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SoftwareDevelopmentPage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0">
          <img 
                                src="/assets/cursor.gif"
            alt="AI-Enhanced Software Development Animation"
            className="w-full h-full object-cover"
            style={{
              filter: 'grayscale(100%) brightness(0.8) contrast(1.1)',
              mixBlendMode: 'normal'
            }}
          />
        </div>
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50 z-10"></div>
        
        {/* Content Overlay */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-light glow-text text-white mb-6">
            Adaptive AI Software Solutions
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-12 text-white">
            We build Adaptive AI Software Solutions that grow and evolve with your business.
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
      {/* Web Development Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                AI-Enhanced Web Development
              </h3>
              <p className="text-xl opacity-80 mb-8">
                Intelligent web applications with AI-powered features, personalized user experiences, and automated content generation. Built with modern frameworks and enhanced with machine learning capabilities.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>AI-powered chatbots and assistants</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Personalized content and recommendations</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Intelligent search and filtering</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Predictive analytics dashboards</span>
                </div>
              </div>
              <div>
                <Link href="/services/web-development">
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
                  <img 
                    src="/assets/web.gif"
                    alt="AI-Enhanced Web Development Animation"
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

      {/* Mobile Development Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="floating-element md:order-1 order-2">
              <div className="glassmorphism p-8 rounded-xl">
                <div className="bg-black/20 border border-white/10 rounded-lg h-64 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/assets/mobile.gif"
                    alt="AI-Powered Mobile Apps Animation"
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
                AI-Enhanced Mobile Apps
              </h3>
              <p className="text-xl opacity-80 mb-8">
                Intelligent mobile applications with AI features like voice recognition, image processing, and predictive user behavior. Native and cross-platform solutions enhanced with machine learning.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Voice and gesture controls</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>AI-powered camera features</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Intelligent notifications</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Predictive user assistance</span>
                </div>
              </div>
              <div>
                <Link href="/services/mobile-development">
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
            Ready to Build AI-Integrated Software?
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Transform your ideas into intelligent software applications with AI-powered development and modern technologies.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/company/contact">
              <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                Start Your Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/services">
              <Button
                variant="outline"
                className="border-2 border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
              >
                Explore All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
