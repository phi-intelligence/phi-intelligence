import { Link } from "wouter";
import { Code, Globe, Smartphone, ArrowRight, CheckCircle, Zap, Shield, GitBranch, Monitor, Database, Cloud, Search, Brain, Users, Target, Lightbulb, Building2, DollarSign, Clock, TrendingUp, MessageSquare, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function WebDevelopmentPage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
                AI-Enhanced Web Development
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Intelligent Web Applications
              </h2>
              <p className="text-xl opacity-80 mb-8">
                We build cutting-edge web applications enhanced with artificial intelligence that deliver exceptional user experiences across all devices. From AI-powered chatbots to intelligent personalization, our web development expertise ensures your digital presence stands out with intelligent features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/company/contact">
                  <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                    Start Your Project
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
                <div className="bg-black/20 border border-white/10 rounded-lg h-80 flex items-center justify-center overflow-hidden">
                  <img
                    src="/assets/Untitled design.png"
                    alt="AI-Enhanced Web Development Technologies"
                    className="w-full h-full object-contain rounded-lg scale-[1.75]"
                    style={{
                      filter: 'grayscale(100%) brightness(1.1) contrast(1.2)',
                      mixBlendMode: 'luminosity',
                      objectPosition: 'center center'
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
              AI-Enhanced Web Capabilities
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Comprehensive web development services enhanced with artificial intelligence to create powerful, intelligent, and user-friendly applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI-Powered Chatbots</h3>
                <p className="opacity-80">Intelligent conversational interfaces with natural language processing and learning capabilities</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Personalized Experiences</h3>
                <p className="opacity-80">AI-driven user behavior analysis and dynamic content personalization</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Intelligent Search</h3>
                <p className="opacity-80">AI-powered search with semantic understanding and predictive suggestions</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Predictive Analytics</h3>
                <p className="opacity-80">Real-time data analysis and AI-driven insights for business intelligence</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Security</h3>
                <p className="opacity-80">Intelligent threat detection and automated security response systems</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Voice Interfaces</h3>
                <p className="opacity-80">Speech recognition and voice-controlled web applications</p>
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
              AI Integration Capabilities
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Discover how artificial intelligence transforms traditional web development into intelligent, adaptive solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-bold mb-8">AI Services Integration</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">LLM Integration</h4>
                    <p className="opacity-80">Seamless integration with OpenAI, Claude, and custom language models</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Computer Vision</h4>
                    <p className="opacity-80">Image recognition, object detection, and visual AI capabilities</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Natural Language Processing</h4>
                    <p className="opacity-80">Text analysis, sentiment detection, and language understanding</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Recommendation Engines</h4>
                    <p className="opacity-80">AI-powered content and product recommendation systems</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-8">Intelligent Features</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Smart Automation</h4>
                    <p className="opacity-80">AI-driven workflow automation and intelligent task management</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Predictive User Experience</h4>
                    <p className="opacity-80">Anticipate user needs and provide proactive assistance</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Intelligent Forms</h4>
                    <p className="opacity-80">Smart form validation and auto-completion with AI assistance</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Adaptive Content</h4>
                    <p className="opacity-80">Dynamic content that adapts based on user behavior and preferences</p>
                  </div>
                </div>
              </div>
            </div>
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
              Cutting-edge technologies and AI frameworks for building modern, intelligent web applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Frontend</h3>
              <p className="opacity-80">React, Vue.js, Angular, TypeScript, Tailwind CSS, Next.js</p>
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
                <Cloud className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cloud & DevOps</h3>
              <p className="opacity-80">AWS, Azure, Docker, Kubernetes, CI/CD, GitHub Actions</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Performance</h3>
              <p className="opacity-80">Webpack, Vite, Lighthouse, Core Web Vitals, PWA</p>
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
              AI-enhanced web solutions designed for specific industry needs and challenges
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">E-commerce</h3>
              <p className="opacity-80">AI-powered product recommendations and personalized shopping experiences</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Finance</h3>
              <p className="opacity-80">Intelligent financial platforms with AI-powered insights and automation</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Healthcare</h3>
              <p className="opacity-80">AI-enhanced patient portals and intelligent health management systems</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Education</h3>
              <p className="opacity-80">Intelligent learning platforms with personalized content and AI tutors</p>
            </Card>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Ready to Build Your AI-Enhanced Web Application?
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Let's create a powerful web presence enhanced with artificial intelligence that drives results and exceeds user expectations.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/company/contact">
              <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                Start Your Project
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
