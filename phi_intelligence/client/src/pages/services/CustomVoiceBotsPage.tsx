import { Link } from "wouter";
import { Mic, Phone, Clock, Users, ArrowRight, CheckCircle, Zap, Shield, Smartphone, Globe, Building2, ShoppingBag, Utensils, Car, DollarSign, TrendingUp, Smile, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AudioBarsAnimation from "@/components/three/AudioBarsAnimation";

export default function CustomVoiceBotsPage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
                Custom Voice Bots
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                AI-Powered Voice Assistants
              </h2>
              <p className="text-xl opacity-80 mb-8">
                Intelligent voice assistants that can answer calls, handle bookings, provide support, and mimic your brand tone with 24/7 availability. Transform customer interactions with natural, conversational AI that never sleeps.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products/voicebot-builder">
                  <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                    Build Your Agent
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

      {/* Key Features Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Key Features
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Advanced voice bot capabilities designed to enhance customer experience and streamline operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">24/7 Availability</h3>
                <p className="opacity-80">Never miss a customer call with round-the-clock availability and instant response times</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Natural Conversations</h3>
                <p className="opacity-80">Human-like voice interactions with natural language processing and context awareness</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Brand Consistency</h3>
                <p className="opacity-80">Maintain your brand voice and personality across all customer interactions</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Multi-Channel Support</h3>
                <p className="opacity-80">Handle calls, texts, and voice messages across multiple communication channels</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Instant Responses</h3>
                <p className="opacity-80">Lightning-fast response times with no waiting or hold times for customers</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Secure & Compliant</h3>
                <p className="opacity-80">Enterprise-grade security with GDPR and industry compliance standards</p>
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
              Discover how custom voice bots can transform your business operations and customer service
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-bold mb-8">Customer Service</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">24/7 Support</h4>
                    <p className="opacity-80">Provide round-the-clock customer support without additional staffing costs</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Frequently Asked Questions</h4>
                    <p className="opacity-80">Automatically answer common customer questions and reduce support ticket volume</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Issue Resolution</h4>
                    <p className="opacity-80">Guide customers through troubleshooting steps and resolve simple issues</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Escalation Management</h4>
                    <p className="opacity-80">Seamlessly transfer complex issues to human agents when needed</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-8">Appointment Booking</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Calendar Integration</h4>
                    <p className="opacity-80">Sync with your existing calendar systems for seamless scheduling</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Availability Checking</h4>
                    <p className="opacity-80">Instantly check and confirm available time slots with customers</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Rescheduling</h4>
                    <p className="opacity-80">Handle appointment changes and cancellations automatically</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Reminders</h4>
                    <p className="opacity-80">Send automated appointment reminders and confirmations</p>
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
              Custom voice bots designed for specific industry needs and compliance requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Healthcare</h3>
              <p className="opacity-80">HIPAA-compliant voice bots for appointment scheduling and patient support</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Retail</h3>
              <p className="opacity-80">Customer service and order management for e-commerce and brick-and-mortar stores</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hospitality</h3>
              <p className="opacity-80">Reservation management and guest services for hotels and restaurants</p>
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
            Ready to Transform Your Customer Service?
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Join hundreds of businesses already using our custom voice bots to enhance customer experience and streamline operations.
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
