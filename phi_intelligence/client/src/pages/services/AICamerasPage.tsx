import { Link } from "wouter";
import { Camera, Eye, ArrowRight, CheckCircle, Zap, Database, Users, Globe, Shield, Smartphone, Settings, Target, Lightbulb, Building2, DollarSign, Clock, Search, TrendingUp, AlertTriangle, Video, Filter, Activity, House } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AICamerasPage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
                AI-Integrated Security Cameras
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Intelligent Surveillance Systems
              </h2>
              <p className="text-xl opacity-80 mb-8">
                Intelligent surveillance with real-time AI analysis, including object detection, facial recognition, and behavior analysis. Transform your security monitoring with cameras that see, understand, and alert you to what matters most.
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
                  <Camera className="h-16 w-16 opacity-30" />
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
              Advanced AI camera capabilities designed to provide intelligent security monitoring
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Real-time Analysis</h3>
                <p className="opacity-80">Instant AI processing of video feeds for immediate threat detection</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Facial Recognition</h3>
                <p className="opacity-80">Advanced biometric identification and authorized personnel tracking</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Object Detection</h3>
                <p className="opacity-80">Identify and classify objects, vehicles, and suspicious items</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Behavior Analysis</h3>
                <p className="opacity-80">AI-powered pattern recognition for unusual or suspicious activities</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Alerts</h3>
                <p className="opacity-80">Intelligent notifications that filter out false positives</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Cloud Storage</h3>
                <p className="opacity-80">Secure cloud recording with AI-powered search and retrieval</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              AI Capabilities
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Discover how artificial intelligence transforms traditional surveillance into intelligent security
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-bold mb-8">Computer Vision</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Image Recognition</h4>
                    <p className="opacity-80">Identify people, objects, and activities in real-time video streams</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Motion Tracking</h4>
                    <p className="opacity-80">Follow moving objects and people across multiple camera views</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Scene Understanding</h4>
                    <p className="opacity-80">Analyze complex scenes and identify potential security threats</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Quality Enhancement</h4>
                    <p className="opacity-80">AI-powered video enhancement for better clarity and detail</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-8">Intelligent Analytics</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Predictive Analysis</h4>
                    <p className="opacity-80">Anticipate security incidents before they occur</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Pattern Recognition</h4>
                    <p className="opacity-80">Learn normal behavior patterns and detect anomalies</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Risk Assessment</h4>
                    <p className="opacity-80">Automatically evaluate threat levels and prioritize alerts</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Learning Algorithms</h4>
                    <p className="opacity-80">Continuously improve detection accuracy over time</p>
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
              AI camera solutions designed for specific industry security needs and challenges
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Commercial</h3>
              <p className="opacity-80">Office buildings, retail stores, and corporate security monitoring</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
                              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <House className="h-8 w-8 text-phi-white" />
                </div>
              <h3 className="text-xl font-bold mb-3">Residential</h3>
              <p className="opacity-80">Home security systems with intelligent monitoring and alerts</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Healthcare</h3>
              <p className="opacity-80">Patient safety and facility security monitoring systems</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Industrial</h3>
              <p className="opacity-80">Factory security, equipment monitoring, and safety compliance</p>
            </Card>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Ready to Transform Your Security?
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Join hundreds of businesses already using our AI cameras to protect their assets and people.
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
