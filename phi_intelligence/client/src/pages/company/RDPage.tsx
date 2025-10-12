import { Link } from "wouter";
import { FlaskConical, Brain, Lightbulb, ArrowRight, CheckCircle, TrendingUp, Users, Globe, Zap, Target, MessageSquare, Eye, Bot, Smartphone, Shield, GraduationCap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RDPage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Robot AI GIF Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <img 
                                src="/assets/robot-ai.gif"
            alt="AI Research & Development Robot Background"
            className="w-6/6 h-6/6 object-contain opacity-15"
            style={{
              filter: 'grayscale(100%) brightness(1.1) contrast(1.2)',
              mixBlendMode: 'luminosity'
            }}
          />
        </div>
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10"></div>
        
        {/* Content Overlay */}
        <div className="relative z-20 text-center px-4 max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-light glow-text text-white mb-8">
            Research & Development
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto mb-12 text-white">
            Pushing the boundaries of artificial intelligence through cutting-edge research, innovative solutions, and breakthrough technologies that shape the future of AI
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/company/contact">
              <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg bg-white text-black hover:bg-opacity-90 transition-all duration-300">
                Collaborate With Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/services">
              <Button
                variant="outline"
                className="border-2 border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
              >
                Explore Our Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Research Areas Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Our Research Focus Areas
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              We focus on the most promising and impactful areas of artificial intelligence research
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Natural Language Processing */}
            <Card className="service-card p-8 rounded-xl border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Natural Language Processing</h3>
              </div>
              <p className="text-lg opacity-80 mb-6 text-center">
                Advanced language understanding, generation, and translation systems that bridge human-AI communication gaps.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Language understanding</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Text generation</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Translation systems</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Sentiment analysis</span>
                </div>
              </div>
            </Card>

            {/* Computer Vision */}
            <Card className="service-card p-8 rounded-xl border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Computer Vision</h3>
              </div>
              <p className="text-lg opacity-80 mb-6 text-center">
                Visual intelligence systems for object recognition, image analysis, and autonomous decision-making.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Object recognition</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Image analysis</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Facial recognition</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Autonomous systems</span>
                </div>
              </div>
            </Card>

            {/* Machine Learning */}
            <Card className="service-card p-8 rounded-xl border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Machine Learning</h3>
              </div>
              <p className="text-lg opacity-80 mb-6 text-center">
                Advanced algorithms and models that learn from data to make predictions and automate complex tasks.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Deep learning</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Predictive modeling</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Neural networks</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Reinforcement learning</span>
                </div>
              </div>
            </Card>

            {/* Robotics & Automation */}
            <Card className="service-card p-8 rounded-xl border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Robotics & Automation</h3>
              </div>
              <p className="text-lg opacity-80 mb-6 text-center">
                Intelligent automation systems that combine AI with robotics for industrial and commercial applications.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Industrial automation</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Autonomous robots</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Process optimization</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Smart manufacturing</span>
                </div>
              </div>
            </Card>

            {/* Edge AI */}
            <Card className="service-card p-8 rounded-xl border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Edge AI</h3>
              </div>
              <p className="text-lg opacity-80 mb-6 text-center">
                AI systems that run on edge devices for real-time processing, reduced latency, and enhanced privacy.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Real-time processing</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Reduced latency</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Enhanced privacy</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Offline capabilities</span>
                </div>
              </div>
            </Card>

            {/* AI Ethics & Safety */}
            <Card className="service-card p-8 rounded-xl border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">AI Ethics & Safety</h3>
              </div>
              <p className="text-lg opacity-80 mb-6 text-center">
                Research into responsible AI development, bias detection, and safety measures for AI systems.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Bias detection</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Fairness algorithms</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Safety protocols</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-3 h-5 w-5 text-phi-light" />
                  <span>Transparency tools</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Innovation Lab Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Our Innovation Lab
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              A state-of-the-art facility where ideas become reality through experimentation, prototyping, and breakthrough innovations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-8">Cutting-Edge Infrastructure</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">High-Performance Computing</h4>
                    <p className="opacity-80">GPU clusters and cloud infrastructure for large-scale AI model training</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Data Centers</h4>
                    <p className="opacity-80">Secure, scalable data storage and processing facilities</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Prototyping Labs</h4>
                    <p className="opacity-80">Hardware and software prototyping capabilities for rapid iteration</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Collaboration Spaces</h4>
                    <p className="opacity-80">Modern workspaces designed for creativity and collaboration</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="floating-element">
              <div className="glassmorphism p-8 rounded-xl">
                <div className="bg-phi-gray rounded-lg h-64 flex items-center justify-center">
                  <FlaskConical className="h-16 w-16 opacity-30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnerships Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Research Partnerships
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Collaborating with leading academic institutions, research organizations, and industry partners to advance AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Academic Collaboration</h3>
              <p className="opacity-80">Partnerships with leading universities for cutting-edge research and talent development</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Industry Partnerships</h3>
              <p className="opacity-80">Collaborative research with industry leaders to solve real-world challenges</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Global Networks</h3>
              <p className="opacity-80">International research networks and collaborative projects worldwide</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Join Us in Shaping the Future of AI
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Whether you're a researcher, industry partner, or organization interested in AI innovation, let's collaborate to push the boundaries of what's possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/company/contact">
              <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                Start a Collaboration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/services">
              <Button
                variant="outline"
                className="border-2 border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
              >
                Explore Our Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
