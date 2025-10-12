import { Link } from "wouter";
import { TrendingUp, BarChart3, ArrowRight, CheckCircle, Database, PieChart, Target, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DataSciencePage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0">
          <img 
                                src="/assets/dash-ezgif.com-crop.gif"
            alt="AI-Driven Data Intelligence Dashboard Animation"
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
            AI-Driven Data Intelligence
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-12 text-white">
            Transform your raw data into actionable insights with our advanced AI-powered analytics and business intelligence solutions
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
      
      {/* Business Intelligence with AI Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
                Business Intelligence with AI
              </h3>
              <p className="text-xl opacity-80 mb-8">
                AI-enhanced data analysis and insights generation with automated pattern recognition, predictive insights, and intelligent reporting.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Automated pattern recognition</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Predictive insights</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Intelligent reporting</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Real-time dashboards</span>
                </div>
              </div>
              <div>
                <Link href="/services/ai-business-intelligence">
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
                    src="/assets/original-76a5db36a0639511b2d78de8036ef45a.gif"
                    alt="Business Intelligence with AI Animation"
                    className="w-full h-full object-contain rounded-lg"
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

      {/* Custom Analytics Solutions Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="floating-element md:order-1 order-2">
              <div className="glassmorphism p-8 rounded-xl">
                <div className="bg-black/20 border border-white/10 rounded-lg h-64 flex items-center justify-center overflow-hidden">
                  <img
                    src="/assets/das.gif"
                    alt="Custom Analytics Solutions Dashboard"
                    className="w-full h-full object-contain rounded-lg"
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
                Custom Analytics Solutions
              </h3>
              <p className="text-xl opacity-80 mb-8">
                Tailored data analysis tools for specific business needs with industry-specific metrics, automated reporting, and real-time dashboards.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Industry-specific metrics</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Automated reporting</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Real-time dashboards</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Custom visualizations</span>
                </div>
              </div>
              <div>
                <Link href="/services/custom-analytics">
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



      {/* Use Cases Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Data Science Use Cases
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Discover how our AI-powered data science solutions can transform your business operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-white/20 bg-transparent rounded-lg">
              <div className="w-12 h-12 bg-black/30 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sales Forecasting</h3>
              <p className="opacity-80">Predict future sales trends and optimize your sales strategies with AI-powered analytics</p>
            </div>

            <div className="text-center p-6 border border-white/20 bg-transparent rounded-lg">
              <div className="w-12 h-12 bg-black/30 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Customer Segmentation</h3>
              <p className="opacity-80">Identify customer patterns and create targeted marketing campaigns based on data insights</p>
            </div>

            <div className="text-center p-6 border border-white/20 bg-transparent rounded-lg">
              <div className="w-12 h-12 bg-black/30 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Performance Analytics</h3>
              <p className="opacity-80">Track and analyze business performance metrics to identify areas for improvement</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Ready to Unlock Your Data's Potential?
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Transform your business with AI-powered data science solutions that deliver actionable insights and drive growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/company/contact">
              <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                Schedule a Demo
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
