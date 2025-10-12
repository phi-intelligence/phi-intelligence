import { Link } from "wouter";
import { ArrowRight, Users, Target, Award, Lightbulb, Globe as GlobeIcon, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white">
      {/* Hero Section */}
      <section className="py-24 px-6 bg-black" data-testid="about-hero">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light glow-text text-white mb-8">
              About Phi Intelligence
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto leading-relaxed text-white">
              Pioneering the future of business automation through intelligent AI solutions that transform how companies operate, scale, and succeed in the digital age.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 px-6 bg-black" data-testid="mission-vision-section">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Mission */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-phi-light" />
                </div>
                <h2 className="text-4xl font-bold glow-text">Our Mission</h2>
              </div>
              <p className="text-lg opacity-90 leading-relaxed">
                At Phi Intelligence, our mission is to transform the way businesses operate through the power of AI. We focus on creating intelligent solutions that simplify complex processes, improve efficiency, and enable smarter decision-making—turning operational challenges into opportunities for growth and innovation.
              </p>
            </div>

            {/* Vision */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-phi-light" />
                </div>
                <h2 className="text-4xl font-bold glow-text">Our Vision</h2>
              </div>
              <p className="text-lg opacity-90 leading-relaxed">
                Our vision is to build a future where AI seamlessly integrates with people and processes, empowering businesses of every size to thrive. We strive to lead this transformation by pushing the boundaries of technology, driving progress, and shaping a world where intelligent systems unlock new possibilities and sustainable success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6 bg-black" data-testid="values-section">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 glow-text">Our Values</h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              The principles that guide everything we do and every solution we create.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Innovation First</h3>
                <p className="opacity-80">
                  We constantly push the boundaries of what's possible with AI, always seeking cutting-edge solutions that deliver real business value.
                </p>
              </div>
            </Card>

            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Reliability</h3>
                <p className="opacity-80">
                  Our solutions are built for enterprise-grade reliability, ensuring your business operations never miss a beat, 24/7.
                </p>
              </div>
            </Card>

            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Customer Success</h3>
                <p className="opacity-80">
                  Your success is our success. We're committed to delivering solutions that drive measurable results for your business.
                </p>
              </div>
            </Card>

            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <GlobeIcon className="h-8 w-8 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Global Impact</h3>
                <p className="opacity-80">
                  We believe in democratizing AI automation, making advanced technology accessible to businesses of all sizes worldwide.
                </p>
              </div>
            </Card>

            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Excellence</h3>
                <p className="opacity-80">
                  We maintain the highest standards in everything we do, from code quality to customer service and solution delivery.
                </p>
              </div>
            </Card>

            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="h-8 w-8 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Continuous Learning</h3>
                <p className="opacity-80">
                  We stay at the forefront of AI innovation, continuously evolving our solutions to meet the changing needs of modern businesses.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Team & Expertise Section */}
      <section className="py-24 px-6 bg-black" data-testid="team-section">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold mb-6 glow-text">Expert Team</h2>
                <p className="text-xl opacity-80 leading-relaxed">
                  Our team of AI specialists, engineers, and business experts brings together decades of experience in automation, machine learning, and enterprise solutions.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-phi-light rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-black rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">AI & Machine Learning Experts</h3>
                    <p className="opacity-80">Leading researchers and engineers with deep expertise in cutting-edge AI technologies.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-phi-light rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-black rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Enterprise Solutions Architects</h3>
                    <p className="opacity-80">Experienced professionals who understand the complex needs of modern businesses.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-phi-light rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-black rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Customer Success Specialists</h3>
                    <p className="opacity-80">Dedicated professionals committed to ensuring your success with our solutions.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/company/contact">
                  <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg bg-white text-black hover:bg-opacity-90 transition-all duration-300">
                    Meet Our Team
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-24 px-6 bg-black" data-testid="about-cta-section">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl opacity-80 mb-8 leading-relaxed">
            Join hundreds of businesses already using Phi Intelligence to revolutionize their operations with AI automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/company/contact">
              <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg bg-white text-black hover:bg-opacity-90 transition-all duration-300">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-all duration-300">
                Explore Solutions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
