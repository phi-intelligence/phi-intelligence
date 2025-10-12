import { Link } from "wouter";
import { Bell, Brain, ArrowRight, CheckCircle, Zap, Database, Users, Globe, Shield, Smartphone, Settings, Target, Lightbulb, Building2, DollarSign, Clock, Search, TrendingUp, AlertTriangle, MessageSquare, Eye, Filter, House } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SmartNotificationsPage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
                Smart Notification Systems
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Intelligent Alert Management
              </h2>
              <p className="text-xl opacity-80 mb-8">
                AI-powered alert systems for homes and businesses with context-aware alerts, priority-based notifications, and predictive warnings. Never miss important information with intelligent notification systems that learn and adapt to your preferences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/company/contact">
                  <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button
                    variant="outline"
                    className="border-2 border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
                  >
                    View All Services
                  </Button>
                </Link>
              </div>
            </div>
            <div className="floating-element">
              <div className="glassmorphism p-8 rounded-xl">
                <div className="bg-phi-gray rounded-lg h-64 flex items-center justify-center">
                  <Bell className="h-16 w-16 opacity-30" />
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
              Advanced notification capabilities designed to keep you informed without overwhelming
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI-Powered Intelligence</h3>
                <p className="opacity-80">Smart algorithms that learn your preferences and prioritize notifications</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Context-Aware Filtering</h3>
                <p className="opacity-80">Notifications that adapt based on time, location, and user activity</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Priority-Based Alerts</h3>
                <p className="opacity-80">Critical notifications that break through with appropriate urgency</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Multi-Channel Delivery</h3>
                <p className="opacity-80">Notifications across email, SMS, push, and in-app channels</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Predictive Warnings</h3>
                <p className="opacity-80">Anticipate issues before they occur with intelligent forecasting</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Customizable Rules</h3>
                <p className="opacity-80">Personalized notification preferences and automation rules</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Notification Capabilities Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Notification Capabilities
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Discover how smart notifications can transform your communication and alert management
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-bold mb-8">Intelligent Filtering</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Behavioral Learning</h4>
                    <p className="opacity-80">AI learns your notification preferences and adjusts accordingly</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Time-Based Filtering</h4>
                    <p className="opacity-80">Notifications that respect your schedule and quiet hours</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Location Awareness</h4>
                    <p className="opacity-80">Context-aware alerts based on your current location</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Priority Scoring</h4>
                    <p className="opacity-80">Automatic importance ranking for all incoming notifications</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-8">Advanced Features</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Smart Aggregation</h4>
                    <p className="opacity-80">Group related notifications to reduce clutter and repetition</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Escalation Management</h4>
                    <p className="opacity-80">Automatic escalation for critical alerts that require attention</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Response Tracking</h4>
                    <p className="opacity-80">Monitor notification engagement and response rates</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Integration APIs</h4>
                    <p className="opacity-80">Connect with existing systems and third-party applications</p>
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
              Smart notification solutions designed for specific industry needs and challenges
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Enterprise</h3>
              <p className="opacity-80">Corporate communication and critical alert management systems</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
                              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <House className="h-8 w-8 text-phi-white" />
                </div>
              <h3 className="text-xl font-bold mb-3">Smart Homes</h3>
              <p className="opacity-80">Home automation alerts and security notification systems</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Healthcare</h3>
              <p className="opacity-80">Patient monitoring and medical alert systems</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Manufacturing</h3>
              <p className="opacity-80">Industrial monitoring and safety alert systems</p>
            </Card>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Ready to Transform Your Notifications?
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Join hundreds of businesses already using our smart notification systems to improve communication and productivity.
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
