import { useQuery } from "@tanstack/react-query";
import { MapPin, Clock, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Job } from "@shared/schema";
import { useState } from "react";

export default function Careers() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use full API URL instead of relative path (consistent with chatbot)
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  const { data: jobs, isLoading, error, refetch } = useQuery<Job[]>({
    queryKey: [`${apiUrl}/api/jobs`],
    placeholderData: [],
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Ensure jobs is always an array
  const safeJobs = jobs || [];
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };



  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden" data-testid="careers-hero">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/stairs.png"
            alt="Abstract stairs background representing career progression"
            className="w-full h-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto max-w-7xl text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-8 glow-text text-white">
            Join Our Team
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto mb-12 text-white">
            Be part of the AI revolution. We're looking for talented individuals who share our passion 
            for innovation and want to help shape the future of business automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg"
              onClick={() => document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-view-positions"
            >
              View Open Positions
            </Button>
            <Link href="/company/contact">
              <Button 
                variant="outline" 
                className="border-phi-white text-phi-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-phi-white hover:text-phi-black transition-all duration-300"
                data-testid="button-general-inquiry"
              >
                General Inquiry
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* Open Positions */}
      <section id="open-positions" className="py-24 px-6" data-testid="open-positions">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 glow-text">Open Positions</h2>
            <p className="text-xl opacity-80 mb-6">
              Join our growing team and help us build the future of AI-powered business solutions.
            </p>
            {/* Simple refresh button */}
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="border-phi-white text-phi-white hover:bg-phi-white hover:text-phi-black transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Jobs'}
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glassmorphism p-8 rounded-xl animate-pulse">
                  <div className="h-6 bg-phi-gray rounded mb-4"></div>
                  <div className="h-4 bg-phi-gray rounded mb-2 w-1/3"></div>
                  <div className="h-4 bg-phi-gray rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-phi-gray rounded w-16"></div>
                    <div className="h-6 bg-phi-gray rounded w-16"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-lg mb-4">Failed to load jobs</div>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="border-phi-white text-phi-white hover:bg-phi-white hover:text-phi-black"
              >
                Try Again
              </Button>
            </div>
          ) : safeJobs.length > 0 ? (
            <div className="space-y-6">
              {safeJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="glassmorphism p-8 rounded-xl hover:bg-opacity-10 transition-all duration-300"
                  data-testid={`job-card-${job.id}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="mb-4 lg:mb-0">
                      <h3 className="text-2xl font-bold mb-2">{job.title}</h3>
                      <div className="flex items-center text-opacity-80 text-phi-white space-x-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {job.type}
                        </div>
                      </div>
                    </div>
                    <Link href={`/careers/apply/${job.id}`}>
                      <Button 
                        className="btn-primary px-6 py-3 rounded-lg font-semibold"
                        data-testid={`button-apply-${job.id}`}
                      >
                        Apply Now
                      </Button>
                    </Link>
                  </div>
                  
                  <p className="opacity-80 mb-6 text-lg">{job.description}</p>
                  
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((requirement, reqIndex) => (
                        <Badge 
                          key={reqIndex} 
                          variant="secondary" 
                          className="bg-phi-gray text-phi-white"
                        >
                          {requirement}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glassmorphism p-12 rounded-xl text-center">
              <h3 className="text-2xl font-bold mb-4">No Open Positions</h3>
              <p className="opacity-80 mb-6">
                We don't have any open positions at the moment, but we're always interested in hearing from talented individuals.
              </p>
              <Link href="/careers/apply/general">
                <Button 
                  className="btn-primary px-6 py-3 rounded-lg font-semibold"
                  data-testid="button-submit-resume"
                >
                  Submit Your Resume
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </section>

      {/* Application Process */}
      <section className="py-24 px-6 bg-phi-black" data-testid="application-process">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 glow-text">Application Process</h2>
            <p className="text-xl opacity-80">
              Our straightforward hiring process is designed to find the best fit for both you and our team.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Apply", description: "Submit your application through our contact form or directly for open positions." },
              { step: "2", title: "Screen", description: "Initial screening call to discuss your background and our opportunities." },
              { step: "3", title: "Interview", description: "Technical and cultural fit interviews with our team members." },
              { step: "4", title: "Offer", description: "Reference checks and final offer discussion for successful candidates." }
            ].map((process, index) => (
              <Card 
                key={index} 
                className="glassmorphism p-6 rounded-xl text-center"
                data-testid={`process-step-${index}`}
              >
                <div className="w-12 h-12 bg-phi-white text-phi-black rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  {process.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{process.title}</h3>
                <p className="opacity-80 text-sm">{process.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6" data-testid="careers-cta">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 glow-text">
            Ready to Shape the Future?
          </h2>
          <p className="text-xl opacity-80 mb-12">
            Join our mission to revolutionize business operations through innovative AI solutions.
          </p>
          <Link href="/company/contact">
            <Button 
              className="btn-primary px-8 py-4 rounded-lg font-semibold text-lg"
              data-testid="button-get-in-touch"
            >
              Get In Touch
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
