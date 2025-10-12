import { Link, useLocation } from "wouter";
import { ArrowRight, Mic, Users, Code, CheckCircle, BarChart3, Zap, Factory, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import VoiceBubble from "@/components/voice/VoiceBubble";
import HotelVoiceBubble from "@/components/voice/HotelVoiceBubble";
import RestaurantVoiceBubble from "@/components/voice/RestaurantVoiceBubble";
import HospitalVoiceBubble from "@/components/voice/HospitalVoiceBubble";
import { FrameworkWrapper } from "@/components/voice/FrameworkWrapper";
import { useState } from "react";

import Globe from "@/components/three/Globe";
import RobotArmAnimation from "@/components/three/RobotArmAnimation";


// Removed unused import

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Navigate to chat page with the message
    setLocation(`/chat?message=${encodeURIComponent(inputValue.trim())}`);
    
    setInputValue('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Globe Section with Side Text - Full Viewport */}
      <section
        id="globe-section"
        className="relative h-screen flex items-center justify-center overflow-hidden bg-black pb-0 md:pb-32"
        data-testid="globe-section"
      >
        {/* Globe Background Animation - Desktop */}
        <div className="hidden md:block absolute inset-0 z-0">
          <Globe />
        </div>

        {/* Globe Background Animation - Mobile */}
        <div className="md:hidden absolute inset-0 z-0 flex items-center justify-center">
          <div className="w-[90vw] h-[90vw] max-w-[360px] max-h-[360px] min-w-[300px] min-h-[300px]">
            <Globe isMobile={true} />
          </div>
        </div>

        {/* Left Side Text - Desktop Only (Moved to Top with Small Offset) */}
        <div className="hidden lg:block absolute left-0 top-0 z-10 w-1/3 px-8 xl:px-12 pt-80 32xl:pt-88">
          <div className="text-left space-y-4">
            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-tight text-white glow-text">
              Phi Intelligence
            </h1>
            <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-bold text-white">
              Automation. Redefined.
            </h2>
          </div>
        </div>

                 {/* Right Side CTA Buttons - Desktop Only */}
         <div className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-y-20 z-10 w-1/3 px-4 xl:px-12">
          <div className="text-right">
            <div className="flex flex-col gap-4 justify-center">
              <Link href="/services">
                <Button
                  className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg bg-white text-black hover:bg-opacity-90 transition-all duration-300 w-full"
                  data-testid="button-explore-services"
                >
                  Start Automating Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/company/contact">
                <Button
                  variant="outline"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-black transition-all duration-300 w-full"
                  data-testid="button-contact-us"
                >
                  Book a Free Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout - Above Globe Only */}
        <div className="lg:hidden absolute inset-0 z-10 flex flex-col justify-start px-4 pt-8 sm:pt-12">
          {/* Top Text - Mobile/Tablet */}
          <div className="text-center space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white glow-text">
              Phi Intelligence
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              Automation. Redefined.
            </h2>
          </div>
        </div>
      </section>

      {/* Chat Section - Below Globe */}
      <section
        id="chat-section"
        className="relative py-4 px-4 bg-black -mt-48 md:-mt-28 z-20"
        data-testid="chat-section"
      >
        <div className="container mx-auto max-w-2xl">
          <div className="text-center space-y-4">
            {/* Chat Input */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleChatSubmit} className="flex bg-white/10 rounded-full p-1 sm:p-2 border border-white/20 shadow-lg relative z-30">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about AI automation..."
                  className="flex-1 bg-transparent border-none px-3 sm:px-6 py-2 sm:py-4 text-white placeholder-white/70 outline-none text-sm sm:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-white/30 relative z-30"
                  disabled={isSubmitting}
                  autoComplete="off"
                  spellCheck="false"
                  style={{ 
                    pointerEvents: 'auto',
                    touchAction: 'manipulation'
                  }}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white text-black px-3 sm:px-6 py-2 sm:py-4 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:bg-opacity-90 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </form>
            </div>
            
            {/* CTA Buttons - Mobile Only */}
            <div className="lg:hidden flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button
                  className="btn-primary px-6 py-3 rounded-lg font-semibold text-base bg-white text-black hover:bg-opacity-90 transition-all duration-300"
                  data-testid="button-explore-services-mobile"
                >
                  Start Automating Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/company/contact">
                <Button
                  variant="outline"
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-white hover:text-black transition-all duration-300"
                  data-testid="button-contact-us-mobile"
                >
                  Book a Free Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="py-16 px-6 bg-black" data-testid="about-us-section">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Our Mission Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl card-animate" 
                 data-aos="fade-up" 
                 data-aos-delay="200" 
                 data-aos-duration="1000">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 glow-text">
                  Our Mission
                </h2>
                <p className="text-lg md:text-xl opacity-90 leading-relaxed text-justify">
                  At Phi Intelligence, our mission is to transform the way businesses operate through the power of AI. We focus on creating intelligent solutions that simplify complex processes, improve efficiency, and enable smarter decision-making—turning operational challenges into opportunities for growth and innovation.
                </p>
              </div>
            </div>

            {/* Our Vision Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl card-animate" 
                 data-aos="fade-up" 
                 data-aos-delay="400" 
                 data-aos-duration="1000">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 glow-text">
                  Our Vision
                </h2>
                <p className="text-lg md:text-xl opacity-90 leading-relaxed text-justify">
                  Our vision is to build a future where AI seamlessly integrates with people and processes, empowering businesses of every size to thrive. We strive to lead this transformation by pushing the boundaries of technology, driving progress, and shaping a world where intelligent systems unlock new possibilities and sustainable success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Solutions Section */}
      <section
        id="voice-solutions"
        className="py-24 px-6 bg-black relative"
        data-testid="voice-solutions-section"
      >
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Centered Heading */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 glow-text">
              Phi Voice
            </h2>
            <p className="text-lg font-normal text-phi-light max-w-3xl mx-auto leading-relaxed">
              Your intelligent voice agent that answers calls, takes bookings, and provides customer support 24/7 — ensuring your business never misses an opportunity.
            </p>
          </div>
          
          {/* 3-Column Grid Layout - Desktop */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-12 lg:items-center">
            {/* LEFT COLUMN - Features */}
            <div className="flex flex-col space-y-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-phi-light mb-2">Bookings & Reservations</h3>
                <p className="text-sm opacity-80">Automate table bookings, appointments, and room reservations</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-phi-light mb-2">Order Management</h3>
                <p className="text-sm opacity-80">Take orders, track deliveries, and manage cancellations</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-phi-light mb-2">Customer Support</h3>
                <p className="text-sm opacity-80">Instant FAQ answers and issue resolution</p>
              </div>
            </div>

            {/* CENTER COLUMN - VoiceBubble with CTA */}
            <div className="flex flex-col justify-center items-center space-y-6">
              <div
                className="aspect-square flex items-center justify-center mt-8"
                style={{ width: 'clamp(300px, 25vw, 400px)', height: 'clamp(300px, 25vw, 400px)' }}
              >
                <FrameworkWrapper>
                  <div className="w-full h-full flex items-center justify-center scale-110">
                    <VoiceBubble />
                  </div>
                </FrameworkWrapper>
              </div>
              
            </div>

            {/* RIGHT COLUMN - Features */}
            <div className="flex flex-col space-y-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-phi-light mb-2">Lead Capture</h3>
                <p className="text-sm opacity-80">Capture leads from missed calls with follow-up</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-phi-light mb-2">24/7 Call Handling</h3>
                <p className="text-sm opacity-80">Never miss a call, even outside business hours</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-phi-light mb-2">Multi-Language Support</h3>
                <p className="text-sm opacity-80">Communicate in customers' preferred language</p>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Stacked */}
          <div className="lg:hidden grid grid-cols-1 gap-8 items-center relative z-10">
            {/* Left Features */}
            <div className="flex flex-col space-y-6 relative z-10">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-phi-light mb-2">Bookings & Reservations</h3>
                <p className="text-sm opacity-80">Automate table bookings, appointments, and room reservations</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-phi-light mb-2">Order Management</h3>
                <p className="text-sm opacity-80">Take orders, track deliveries, and manage cancellations</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-phi-light mb-2">Customer Support</h3>
                <p className="text-sm opacity-80">Instant FAQ answers and issue resolution</p>
              </div>
            </div>

            {/* Center Circle with CTA */}
            <div className="flex flex-col justify-center items-center space-y-6 relative z-10">
              <div className="aspect-square flex items-center justify-center relative mt-10" style={{ width: 'clamp(250px, 60vw, 350px)', height: 'clamp(250px, 60vw, 350px)' }}>
                <FrameworkWrapper>
                  <div className="w-full h-full flex items-center justify-center scale-100 sm:scale-110">
                    <VoiceBubble />
                  </div>
                </FrameworkWrapper>
              </div>
              
            </div>

            {/* Right Features */}
            <div className="flex flex-col space-y-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-phi-light mb-2">Lead Capture</h3>
                <p className="text-sm opacity-80">Capture leads from missed calls with follow-up</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-phi-light mb-2">24/7 Call Handling</h3>
                <p className="text-sm opacity-80">Never miss a call, even outside business hours</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-phi-light mb-2">Multi-Language Support</h3>
                <p className="text-sm opacity-80">Communicate in customers' preferred language</p>
              </div>
            </div>
          </div>

          {/* Custom Voice Agents - Extension of Phi Voice Section */}
          <div className="mt-8 md:mt-12">
            <div className="text-center mb-20 md:mb-16">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 glow-text">
                Custom Voice Agents
              </h3>
            </div>
            
            {/* Voice Bubbles Grid - Responsive Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-24 md:gap-10 lg:gap-12 items-center justify-items-center px-4 sm:px-0">
              {/* Hotel Voice Bubble */}
              <div
                className="aspect-square flex items-center justify-center w-full max-w-xs sm:max-w-sm lg:max-w-md mx-auto"
                style={{ 
                  width: 'clamp(150px, 20vw, 280px)', 
                  height: 'clamp(150px, 20vw, 280px)',
                  minWidth: '150px',
                  minHeight: '150px'
                }}
              >
                <FrameworkWrapper>
                  <div className="w-full h-full flex items-center justify-center">
                    <HotelVoiceBubble />
                  </div>
                </FrameworkWrapper>
              </div>

              {/* Restaurant Voice Bubble */}
              <div
                className="aspect-square flex items-center justify-center w-full max-w-xs sm:max-w-sm lg:max-w-md mx-auto"
                style={{ 
                  width: 'clamp(150px, 20vw, 280px)', 
                  height: 'clamp(150px, 20vw, 280px)',
                  minWidth: '150px',
                  minHeight: '150px'
                }}
              >
                <FrameworkWrapper>
                  <div className="w-full h-full flex items-center justify-center">
                    <RestaurantVoiceBubble />
                  </div>
                </FrameworkWrapper>
              </div>

              {/* Hospital Voice Bubble */}
              <div
                className="aspect-square flex items-center justify-center w-full max-w-xs sm:max-w-sm lg:max-w-md mx-auto sm:col-span-2 lg:col-span-1"
                style={{ 
                  width: 'clamp(150px, 20vw, 280px)', 
                  height: 'clamp(150px, 20vw, 280px)',
                  minWidth: '150px',
                  minHeight: '150px'
                }}
              >
                <FrameworkWrapper>
                  <div className="w-full h-full flex items-center justify-center">
                    <HospitalVoiceBubble />
                  </div>
                </FrameworkWrapper>
              </div>
            </div>
            
            {/* CTA Button - After Custom Voice Agents */}
            <div className="text-center mt-12 md:mt-16">
              <Link href="/products/voicebot-builder">
                <Button
                  className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg bg-white text-black hover:bg-opacity-90 transition-all duration-300"
                  data-testid="button-build-voice-agent"
                >
                  Build Your Voicebot
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Agentic Workforce Management Section */}
      <section
        id="agentic-workforce"
        className="py-24 px-6 bg-black relative overflow-hidden"
        data-testid="agentic-workforce-section"
      >
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 glow-text">
              Agentic Workforce Management
            </h2>
            <p className="text-lg md:text-xl opacity-80 max-w-3xl mx-auto">
              Reduce admin time and boost team productivity with AI that handles scheduling, tracks performance, and coordinates tasks automatically.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="text-4xl mb-4">
                  <Users className="mx-auto h-12 w-12 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Smart Scheduling</h3>
                <p className="opacity-80 mb-6">
                  Optimize shifts with AI that automatically creates compliant schedules aligned with business demand.
                </p>
              </div>
            </Card>

            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="text-4xl mb-4">
                  <BarChart3 className="mx-auto h-12 w-12 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Performance Insights</h3>
                <p className="opacity-80 mb-6">
                  Access real-time visibility into workforce performance and identify bottlenecks before they impact output.
                </p>
              </div>
            </Card>

            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="text-4xl mb-4">
                  <Zap className="mx-auto h-12 w-12 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Task Automation</h3>
                <p className="opacity-80 mb-6">
                  Maintain project momentum with AI that assigns tasks, issues reminders, and tracks progress automatically.
                </p>
              </div>
            </Card>

            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="text-4xl mb-4">
                  <Users className="mx-auto h-12 w-12 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Smart Attendance</h3>
                <p className="opacity-80 mb-6">
                  Ensure accurate time tracking with AI-powered facial recognition for precise workforce management.
                </p>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/services">
              <Button
                className="btn-primary px-1 py-4 rounded-lg font-semibold text-lg bg-white text-black hover:bg-opacity-90 transition-all duration-300"
                data-testid="button-learn-more-workforce-management"
              >
                Explore Workforce Solutions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Agentic Operations Management Section */}
      <section
        id="agentic-operations"
        className="py-24 px-6 bg-black relative overflow-hidden"
        data-testid="agentic-operations-section"
      >
        {/* Robot Container - Desktop Background */}
        <div className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 w-3/5 h-[700px] z-0">
          <RobotArmAnimation 
            className="w-full h-full"
            scale={2.5}
            animationSpeed={0.1}
            enableInteraction={false}
          />
        </div>

        {/* Robot Container - Mobile Background */}
        <div className="md:hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-96 z-0">
          <RobotArmAnimation 
            className="w-full h-full"
            scale={2.8}
            animationSpeed={0.1}
            enableInteraction={false}
          />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
              Industrial Automation
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Transform your industrial operations with AI that automates warehouses, optimises production lines, and prevents costly downtime in factories.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="text-4xl mb-4">
                  <Factory className="mx-auto h-12 w-12 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Warehouse Automation</h3>
                <p className="opacity-80 mb-6">
                  AI-powered warehouse automation that reduces costs, improves fulfillment speed, and ensures inventory accuracy.
                </p>
              </div>
            </Card>

            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="text-4xl mb-4">
                  <Package className="mx-auto h-12 w-12 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Inventory Optimization</h3>
                <p className="opacity-80 mb-6">
                  Automated inventory systems that streamline stock management for greater efficiency and control.
                </p>
              </div>
            </Card>

            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="text-4xl mb-4">
                  <Settings className="mx-auto h-12 w-12 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Automated Fulfillment</h3>
                <p className="opacity-80 mb-6">
                  Integrated systems that streamline fulfillment operations, reducing manual intervention and improving reliability.
                </p>
              </div>
            </Card>

            <Card className="p-8 rounded-xl border border-phi-gray bg-transparent hover:border-phi-light transition-colors">
              <div className="text-center">
                <div className="text-4xl mb-4">
                  <Zap className="mx-auto h-12 w-12 text-phi-light" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Real-Time Tracking</h3>
                <p className="opacity-80 mb-6">
                  End-to-end visibility into inventory and shipments with AI-driven tracking for faster, more reliable logistics.
                </p>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/services">
              <Button
                className="btn-primary px-3 py-4 rounded-lg font-semibold text-lg bg-white text-black hover:bg-opacity-90 transition-all duration-300"
                data-testid="button-learn-more-operations"
              >
                Discover Industrial AI Solutions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
}