import { Link } from "wouter";
import { Users, Clock, TrendingUp, ArrowRight, CheckCircle, Brain, Zap, Shield, BarChart3, Target, Calendar, Smartphone, Building2, ShoppingBag, Utensils, Car, DollarSign, Smile, Globe, Database, Cpu, PieChart, Settings, Activity, UserCheck, AlertTriangle, CheckCircle2, Code, Bot, Workflow, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AgenticSoftwarePage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
                Agentic Software
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Custom AI Software Agents for Your Business
              </h2>
              <p className="text-xl opacity-80 mb-8">
                We design and build intelligent software agents tailored to your specific business needs. From workforce management to inventory control, customer service to financial analysis - our custom agentic systems automate complex processes and make intelligent decisions to optimize your operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/company/contact">
                  <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/company/contact">
                  <Button
                    variant="outline"
                    className="border-2 border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
                  >
                    Contact for Implementation
                  </Button>
                </Link>
              </div>
            </div>
            <div className="floating-element">
              <div className="glassmorphism p-8 rounded-xl">
                <div className="bg-black/20 border border-white/10 rounded-lg h-64 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/assets/Thumbnail-The-Competitive-Edge-Harnessing-Generative-AI-Tools-for-Modern-Software-Development.jpg"
                    alt="AI-Powered Software Development and Automation"
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

      {/* Key Features Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Key Capabilities
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Advanced agentic software development capabilities designed to create custom AI solutions for your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Custom AI Development</h3>
                <p className="opacity-80">Tailored AI algorithms and machine learning models specific to your business domain and requirements</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Workflow className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Process Automation</h3>
                <p className="opacity-80">Intelligent workflow automation that learns and adapts to your business processes and rules</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Intelligent Analytics</h3>
                <p className="opacity-80">AI-powered data analysis and insights generation for informed decision-making</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Predictive Intelligence</h3>
                <p className="opacity-80">Forward-looking insights and forecasting capabilities for proactive business planning</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Real-Time Decision Making</h3>
                <p className="opacity-80">Instant intelligent responses and automated decision-making based on real-time data</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Enterprise Integration</h3>
                <p className="opacity-80">Seamless integration with existing systems, APIs, and business infrastructure</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Business Applications
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Discover how custom agentic software can transform various aspects of your business operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-bold mb-8">Workforce Management</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">AI-Powered Scheduling</h4>
                    <p className="opacity-80">Intelligent shift optimization considering skills, availability, and business demand</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Performance Analytics</h4>
                    <p className="opacity-80">Real-time monitoring and predictive insights for workforce optimization</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Compliance Automation</h4>
                    <p className="opacity-80">Built-in regulatory compliance and automated reporting systems</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Skill Matching</h4>
                    <p className="opacity-80">AI-driven talent allocation and skill-based task assignment</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-8">Business Process Automation</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Inventory Management</h4>
                    <p className="opacity-80">Predictive stock management and automated reordering systems</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Customer Service</h4>
                    <p className="opacity-80">Intelligent chatbots and automated customer support workflows</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Financial Analysis</h4>
                    <p className="opacity-80">Automated financial reporting and predictive market analysis</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Quality Control</h4>
                    <p className="opacity-80">AI-powered quality monitoring and defect detection systems</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Industries We Serve
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Custom agentic software solutions designed for specific industry needs and operational requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Manufacturing</h3>
              <p className="opacity-80">Production optimization, quality control, and predictive maintenance agents</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Retail</h3>
              <p className="opacity-80">Inventory management, customer service, and sales optimization agents</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hospitality</h3>
              <p className="opacity-80">Guest service management, resource optimization, and operational efficiency agents</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Logistics</h3>
              <p className="opacity-80">Route optimization, fleet management, and supply chain automation agents</p>
            </Card>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Ready to Build Your Custom AI Agents?
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Join businesses already using our custom agentic software to automate operations, reduce costs, and gain competitive advantage through intelligent automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/company/contact">
              <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/company/contact">
              <Button
                variant="outline"
                className="border-2 border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
              >
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
