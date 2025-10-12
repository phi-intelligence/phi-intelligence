import { Link } from "wouter";
import { MessageSquare, Brain, ArrowRight, CheckCircle, Globe, Smartphone, Zap, Shield, Users, BarChart3, Clock, Smartphone as PhoneIcon, Globe as WebIcon, MessageCircle, Database, Target, TrendingUp, Smile, Building2, ShoppingBag, Utensils, Car, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ChatbotMascotAnimation from "@/components/three/ChatbotMascotAnimation";

export default function ConversationalAIPage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
                Conversational AI
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Intelligent Chatbots & Virtual Assistants
              </h2>
              <p className="text-xl opacity-80 mb-8">
                Advanced conversational AI that delivers natural, context-aware interactions across web, mobile, and social platforms. Transform customer engagement with intelligent chatbots that understand, learn, and provide personalized experiences 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/company/contact">
                  <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                    Build Your Chatbot
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
                  <ChatbotMascotAnimation 
                    enableInteraction={false}
                    className="w-full h-full"
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
              Key Features
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Advanced conversational AI capabilities designed to enhance customer engagement and streamline operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Natural Language Processing</h3>
                <p className="opacity-80">Advanced NLP that understands context, intent, and conversational flow for human-like interactions</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Omnichannel Integration</h3>
                <p className="opacity-80">Seamlessly deploy across web, mobile apps, WhatsApp, Messenger, SMS, and social platforms</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">24/7 Availability</h3>
                <p className="opacity-80">Always-on customer support with instant responses and no waiting times</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Human Handoff</h3>
                <p className="opacity-80">Intelligent escalation to human agents when complex issues require personal attention</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Responses</h3>
                <p className="opacity-80">Lightning-fast reply times with no delays, keeping customers engaged and satisfied</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Secure & Compliant</h3>
                <p className="opacity-80">Enterprise-grade security with GDPR, HIPAA, and industry compliance standards</p>
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
              Use Cases & Applications
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Discover how conversational AI can transform your customer engagement and business operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-bold mb-8">Customer Support</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Automated Support</h4>
                    <p className="opacity-80">Handle common inquiries and provide instant solutions without human intervention</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">FAQ Management</h4>
                    <p className="opacity-80">Automatically answer frequently asked questions and reduce support ticket volume</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Issue Resolution</h4>
                    <p className="opacity-80">Guide customers through troubleshooting steps and resolve simple problems</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Escalation System</h4>
                    <p className="opacity-80">Seamlessly transfer complex issues to human agents when needed</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-8">Lead Generation</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Qualification</h4>
                    <p className="opacity-80">Automatically qualify leads through intelligent questioning and assessment</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Appointment Booking</h4>
                    <p className="opacity-80">Schedule meetings and consultations directly through conversational AI</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Product Recommendations</h4>
                    <p className="opacity-80">Suggest relevant products and services based on customer needs and preferences</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Follow-up Automation</h4>
                    <p className="opacity-80">Automated follow-up messages and nurturing sequences for lead conversion</p>
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
              Conversational AI solutions designed for specific industry needs and compliance requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Healthcare</h3>
              <p className="opacity-80">HIPAA-compliant chatbots for patient support and appointment scheduling</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">E-commerce</h3>
              <p className="opacity-80">Shopping assistants and customer service for online retail platforms</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hospitality</h3>
              <p className="opacity-80">Guest services and reservation management for hotels and restaurants</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Automotive</h3>
              <p className="opacity-80">Service scheduling and customer support for dealerships and repair shops</p>
            </Card>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Ready to Transform Your Customer Engagement?
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Join hundreds of businesses already using our conversational AI to enhance customer experience and streamline operations.
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
