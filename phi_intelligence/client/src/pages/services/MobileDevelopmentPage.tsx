import { Link } from "wouter";
import { Smartphone, Globe, ArrowRight, CheckCircle, Zap, Shield, GitBranch, Monitor, Database, Cloud, Search, AppWindow, Brain, Users, Target, Lightbulb, Building2, DollarSign, Clock, TrendingUp, MessageSquare, Eye, Filter, Camera, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function MobileDevelopmentPage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
                AI-Enhanced Mobile Development
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Intelligent Mobile Applications
              </h2>
              <p className="text-xl opacity-80 mb-8">
                We develop AI-integrated mobile applications for iOS and Android platforms. Our expertise combines traditional mobile development with artificial intelligence integration, creating intelligent apps that enhance user experiences through AI-powered features like voice recognition, computer vision, and predictive analytics that enhance business needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/company/contact">
                  <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                    Start Your App
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/company/contact">
                  <Button
                    variant="outline"
                    className="border-2 border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
                  >
                    Get a Quote
                  </Button>
                </Link>
              </div>
            </div>
            <div className="floating-element">
              <div className="glassmorphism p-8 rounded-xl">
                <div className="bg-black/20 border border-white/10 rounded-lg h-64 flex items-center justify-center overflow-hidden">
                  <img
                    src="/assets/mob.gif"
                    alt="AI-Powered Mobile Development Animation"
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

      {/* Key Features Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              AI-Enhanced Mobile Capabilities
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              We integrate artificial intelligence into mobile applications to enhance functionality, improve user experience, and add intelligent features that make your app more powerful and engaging
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Computer Vision Integration</h3>
                <p className="opacity-80">Implement image and video recognition to enable biometric authentication, intelligent content scanning, and enhanced security.</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Voice & Speech Interfaces</h3>
                <p className="opacity-80">Deliver hands-free interaction and accessibility through AI-powered voice assistants, improving customer convenience and engagement.</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Predictive Analytics</h3>
                <p className="opacity-80">Anticipate customer needs with data-driven insights, enabling proactive recommendations and more informed decision-making.</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Personalised User Experiences</h3>
                <p className="opacity-80">Adapt app functionality to user behaviour, delivering tailored journeys that increase satisfaction and retention.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>



      {/* Technologies Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Technologies We Use
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              We use cutting-edge mobile development technologies and integrate AI frameworks to build modern, intelligent mobile applications with enhanced capabilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <AppWindow className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">iOS</h3>
              <p className="opacity-80">Swift, SwiftUI, UIKit, Core ML, Vision, Speech, Xcode</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Android</h3>
              <p className="opacity-80">Kotlin, Jetpack Compose, ML Kit, TensorFlow Lite, Android Studio</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI & ML</h3>
              <p className="opacity-80">OpenAI API, TensorFlow, PyTorch, Hugging Face, Custom Models</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Performance</h3>
              <p className="opacity-80">Firebase, AWS Mobile, Analytics, Crash Reporting, Performance Monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Industries We Serve
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              We develop AI-integrated mobile applications tailored to specific industry needs, integrating intelligent features that address industry-specific challenges and requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">E-commerce</h3>
              <p className="opacity-80">AI-powered shopping apps with personalized recommendations</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Healthcare</h3>
              <p className="opacity-80">AI-enhanced medical apps with symptom analysis and monitoring</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Education</h3>
              <p className="opacity-80">Intelligent learning apps with AI tutors and adaptive content</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Finance</h3>
              <p className="opacity-80">AI-powered banking apps with fraud detection and insights</p>
            </Card>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Ready to Integrate AI into Your Mobile App?
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Let's enhance your existing mobile application or develop a new one with AI integration that improves functionality, user engagement, and overall app performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/company/contact">
              <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                Start Your App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/company/contact">
              <Button
                variant="outline"
                className="border-2 border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
              >
                Schedule a Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
