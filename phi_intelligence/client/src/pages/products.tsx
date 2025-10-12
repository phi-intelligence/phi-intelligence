import { CheckCircle, ArrowRight, Mic, Users, BarChart3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import AudioBarsAnimation from "@/components/three/AudioBarsAnimation";

import AdvancedNetworkAnimation from "@/components/three/AdvancedNetworkAnimation";

export default function Products() {
  const products = [
    {
      id: "voice-platform",
      title: "AI Voice Assistant Platform",
      description: "Enterprise-grade voice AI platform that enables businesses to deploy intelligent voice assistants for customer service, sales, and support operations.",
      features: [
        "Natural Language Understanding (NLU)",
        "Multi-language Support (20+ languages)",
        "Real-time Speech Recognition",
        "Voice Synthesis & Customization",
        "CRM & API Integrations",
        "Advanced Analytics Dashboard",
        "24/7 Automated Support",
        "Sentiment Analysis",
        "Call Recording & Transcription",
        "Scalable Cloud Infrastructure"
      ],
      useCases: [
        "Customer Support Automation",
        "Appointment Scheduling",
        "Lead Qualification",
        "Order Processing",
        "FAQ Handling"
      ],
      pricing: "From £500/month"
    },
    {
      id: "workforce-suite",
      title: "Workforce Analytics Suite",
      description: "Comprehensive workforce management solution with AI-powered scheduling, performance tracking, and predictive analytics for optimal resource utilization.",
      features: [
        "Intelligent Scheduling Algorithm",
        "Real-time Attendance Tracking",
        "Performance Analytics & KPIs",
        "Predictive Workforce Planning",
        "Mobile App for Employees",
        "GPS-based Clock In/Out",
        "Automated Payroll Integration",
        "Compliance Monitoring",
        "Resource Optimization",
        "Custom Reporting Tools"
      ],
      useCases: [
        "Retail Staff Management",
        "Healthcare Scheduling",
        "Manufacturing Shifts",
        "Field Service Teams",
        "Restaurant Operations"
      ],
      pricing: "From £10/employee/month"
    },
    {
      id: "analytics-platform",
      title: "Business Intelligence Platform",
      description: "AI-powered business intelligence platform that transforms raw data into actionable insights with predictive analytics and automated reporting.",
      features: [
        "Automated Data Collection",
        "Predictive Analytics Models",
        "Real-time Dashboards",
        "Custom Report Generation",
        "Data Visualization Tools",
        "Machine Learning Insights",
        "Trend Analysis",
        "Alert & Notification System",
        "Multi-source Data Integration",
        "Export & Sharing Capabilities"
      ],
      useCases: [
        "Sales Performance Analysis",
        "Customer Behavior Insights",
        "Operational Efficiency",
        "Financial Forecasting",
        "Market Trend Analysis"
      ],
      pricing: "From £200/month"
    }
  ];

  return (
    <div className="min-h-screen bg-phi-black text-phi-white">
      {/* Hero Section */}
      <section id="products-hero" className="relative h-screen flex items-center justify-center overflow-hidden" data-testid="products-hero">
        {/* Advanced Neural Network Animation Background */}
        <div className="absolute inset-0 z-0">
          <AdvancedNetworkAnimation 
            className="w-full h-full"
            enableInteraction={true}
          />
        </div>
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10"></div>
        
        {/* Content Overlay */}
        <div className="relative z-20 text-center px-4 max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-light glow-text text-white mb-8">
            Our Products
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto mb-12 text-white">
            Discover our suite of AI-powered products designed to revolutionize how businesses 
            operate, engage with customers, and make data-driven decisions.
          </p>
          <Link href="/company/contact">
            <Button 
              className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg bg-white text-black hover:bg-opacity-90 transition-all duration-300"
              data-testid="button-request-demo"
            >
              Request Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 px-6" data-testid="products-list">
        <div className="container mx-auto max-w-7xl">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className={`grid lg:grid-cols-2 gap-16 items-center mb-32 ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}
              data-testid={`product-${product.id}`}
            >
              {/* Product Info */}
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="mb-6">
                  <h3 className="text-4xl md:text-5xl font-bold mb-6">
                    {product.title}
                  </h3>
                  <p className="text-xl opacity-80 mb-8">
                    {product.description}
                  </p>
                </div>

                <div className="mb-8">
                  <h4 className="text-2xl font-semibold mb-6">Key Features:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {product.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <CheckCircle className="mr-3 h-5 w-5 text-phi-light flex-shrink-0" />
                        <span className="opacity-80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-2xl font-semibold mb-4">Use Cases:</h4>
                  <div className="flex flex-wrap gap-3">
                    {product.useCases.map((useCase, useCaseIndex) => (
                      <span 
                        key={useCaseIndex}
                        className="px-4 py-2 bg-phi-gray rounded-full text-sm"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex gap-4">
                    <Link href={index === 0 ? "/products/voicebot-builder" : "/company/contact"}>
                      <Button 
                        className="btn-primary px-6 py-3 rounded-lg font-semibold"
                        data-testid={`button-get-started-${product.id}`}
                      >
                        {index === 0 ? "Build Voice Agent" : "Get Started"}
                      </Button>
                    </Link>
                    <Link href="/company/contact">
                      <Button 
                        variant="outline" 
                        className="border-phi-white text-phi-white px-6 py-3 rounded-lg font-semibold hover:bg-phi-white hover:text-phi-black transition-all duration-300"
                        data-testid={`button-contact-us-${product.id}`}
                      >
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Product Visual */}
              <div className={`floating-element ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                <Card className="glassmorphism p-8 rounded-xl">
                  <div className="bg-black/20 border border-white/10 rounded-lg h-80 flex items-center justify-center overflow-hidden">
                    {index === 0 ? (
                      <AudioBarsAnimation 
                        className="w-full h-full"
                        barCount={7}
                        animationSpeed={1.2}
                        enableInteraction={false}
                      />
                    ) : index === 1 ? (
                      <img
                        src="/assets/arddash.gif"
                        alt="Workforce Analytics Suite Dashboard"
                        className="w-full h-full object-contain rounded-lg"
                        style={{
                          filter: 'grayscale(100%) brightness(1.1) contrast(1.2)',
                          mixBlendMode: 'luminosity'
                        }}
                      />
                    ) : (
                      <img
                        src="/assets/bi.gif"
                        alt="Business Intelligence Platform Dashboard"
                        className="w-full h-full object-contain rounded-lg"
                        style={{
                          filter: 'grayscale(100%) brightness(1.1) contrast(1.2)',
                          mixBlendMode: 'luminosity'
                        }}
                      />
                    )}
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 px-6" data-testid="products-cta">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 glow-text">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl opacity-80 mb-12">
            Schedule a personalized demo to see how our AI products can transform your business operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/products/voicebot-builder">
              <Button 
                className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg"
                data-testid="button-build-voice-agent"
              >
                Build Custom Voice Agent
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/company/contact">
              <Button 
                variant="outline" 
                className="border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
                data-testid="button-schedule-demo"
              >
                Schedule Demo
              </Button>
            </Link>
            <Link href="/services">
              <Button 
                variant="outline" 
                className="border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
                data-testid="button-view-services"
              >
                View Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
