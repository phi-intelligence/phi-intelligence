import { Link } from "wouter";
import { Users, Clock, TrendingUp, Shield, ArrowRight, CheckCircle, Calendar, BarChart3, Smartphone, Zap, ShoppingBag, Utensils, Truck, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function WorkstreamPage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
                Workstream
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Agentic Workforce Management
              </h2>
              <p className="text-xl opacity-80 mb-8">
                Smart workforce management application that helps businesses schedule, track, and manage their workforce in real time. Designed specifically for retail, hospitality, logistics, and other sectors requiring dynamic workforce coordination.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/company/contact">
                  <Button className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg">
                    Request Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button
                    variant="outline"
                    className="border-2 border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
                  >
                    View All Products
                  </Button>
                </Link>
              </div>
            </div>
            <div className="floating-element flex justify-center items-center">
              <div className="bg-black/20 border border-white/10 rounded-lg h-64 w-[28rem] flex items-center justify-center overflow-hidden shadow-2xl">
                <img 
                                      src="/assets/arddash.gif"
                  alt="Workstream Dashboard Animation"
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
      </section>

      {/* Key Features Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Key Features
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Comprehensive workforce management tools designed to optimize your operations and improve productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Real-time Scheduling</h3>
                <p className="opacity-80">Dynamic scheduling with AI-powered optimization and real-time updates</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Attendance Tracking</h3>
                <p className="opacity-80">Automated attendance monitoring with biometric and mobile check-ins</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Performance Analytics</h3>
                <p className="opacity-80">Comprehensive performance metrics and insights for workforce optimization</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Shift Management</h3>
                <p className="opacity-80">Intelligent shift planning with conflict resolution and optimization</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Reporting & Insights</h3>
                <p className="opacity-80">Custom reports and actionable insights for data-driven decisions</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Mobile Access</h3>
                <p className="opacity-80">Full-featured mobile app for employees and managers on the go</p>
              </div>
            </Card>
          </div>
        </div>
      </section>



      {/* Industries Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Designed for Multiple Industries
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Our workforce management solution is tailored for sectors requiring dynamic workforce coordination
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Retail</h3>
              <p className="opacity-80">Manage seasonal staffing, peak hours, and multi-location operations</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hospitality</h3>
              <p className="opacity-80">Optimize staff scheduling for hotels, restaurants, and events</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Logistics</h3>
              <p className="opacity-80">Coordinate drivers, warehouse staff, and delivery personnel</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Factory className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Manufacturing</h3>
              <p className="opacity-80">Manage production schedules and shift rotations efficiently</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Ready to Transform Your Workforce Management?
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Join hundreds of businesses already using Workstream to optimize their workforce operations and improve productivity.
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
