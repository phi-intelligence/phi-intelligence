import { Link } from "wouter";
import { Mail, Phone, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ContactForm from "@/components/ui/contact-form";
import Robot3D from "@/components/three/robotvoice";

export default function ContactPage() {


  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 md:px-6" data-testid="contact-hero">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left Side - Text Content */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 glow-text">
                Contact Sales
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
                Ready to discuss your AI needs? Contact our team of experts to learn 
                how we can help transform your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="#contact-form">
                  <Button
                    className="btn-primary px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg bg-white text-black hover:bg-opacity-90 transition-all duration-300"
                    data-testid="button-get-started"
                  >
                    Send Message
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button
                    variant="outline"
                    className="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg hover:bg-white hover:text-black transition-all duration-300"
                  >
                    Explore Services
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right Side - Robot Container */}
            <div className="flex justify-center md:justify-end">
              <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center justify-center">
                <div className="w-full h-full">
                  <Robot3D />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-form" className="py-16 md:py-24 px-4 md:px-6" data-testid="company-contact-section">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
            {/* Contact Form */}
            <div className="order-2 md:order-1">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 glow-text">
                Send Us a Message
              </h3>
              <p className="text-lg md:text-xl opacity-80 mb-6 md:mb-8">
                Tell us about your project and we'll get back to you within 2 hours.
              </p>
              <ContactForm />
            </div>
            
            {/* Contact Information */}
            <div className="space-y-6 md:space-y-8 order-1 md:order-2">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 glow-text">
                Contact Information
              </h3>
              <div className="space-y-4 md:space-y-6">
                <Card className="p-4 md:p-6 border border-white/20 bg-black/50">
                  <div className="flex items-start">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                      <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold mb-1 text-sm md:text-base">Address</h4>
                      <p className="font-medium mb-2 text-sm md:text-base break-words">66 Costock Avenue, Nottingham, NG5 3AS</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 md:p-6 border border-white/20 bg-black/50">
                  <div className="flex items-start">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                      <Phone className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold mb-1 text-sm md:text-base">Phone</h4>
                      <p className="font-medium mb-2 text-sm md:text-base">07352745227</p>
                      <p className="text-xs md:text-sm opacity-70">Speak directly with our AI experts</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 md:p-6 border border-white/20 bg-black/50">
                  <div className="flex items-start">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                      <Mail className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold mb-1 text-sm md:text-base">Email</h4>
                      <p className="font-medium mb-2 text-sm md:text-base break-all">info@phiintelligence.com</p>
                      <p className="text-xs md:text-sm opacity-70">Get detailed responses within 2 hours</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
