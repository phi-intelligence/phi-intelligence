import { Link } from "wouter";
import { PieChart, Brain, ArrowRight, CheckCircle, BarChart3, Database, Users, Globe, Shield, Zap, Smartphone, Settings, Target, Lightbulb, Building2, DollarSign, Clock, Search, TrendingUp, LineChart, Filter, Download, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CustomAnalyticsPage() {
  return (
    <div className="min-h-screen bg-phi-black text-phi-white pt-24">
      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
                Custom Analytics Solutions
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Data-Driven Business Intelligence
              </h2>
              <p className="text-xl opacity-80 mb-8">
                Tailored data analysis tools for specific business needs with industry-specific metrics, automated reporting, and real-time dashboards. Transform your data into actionable insights that drive strategic decision-making.
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
                  <PieChart className="h-16 w-16 opacity-30" />
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
              Advanced analytics capabilities designed to transform your business data into strategic insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Custom Dashboards</h3>
                <p className="opacity-80">Tailored visualizations and metrics specific to your business needs</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Data Integration</h3>
                <p className="opacity-80">Connect multiple data sources for comprehensive business insights</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Real-time Analytics</h3>
                <p className="opacity-80">Live data processing and instant insights for immediate decisions</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Advanced Filtering</h3>
                <p className="opacity-80">Sophisticated data filtering and segmentation capabilities</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Automated Reporting</h3>
                <p className="opacity-80">Scheduled reports and automated insights delivery</p>
              </div>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent hover:bg-opacity-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-phi-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Predictive Insights</h3>
                <p className="opacity-80">AI-powered forecasting and trend prediction for future planning</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Analytics Capabilities Section */}
      <section className="py-24 px-6 bg-phi-black">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Analytics Capabilities
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Discover how custom analytics can transform your business intelligence and decision-making
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-3xl font-bold mb-8">Data Analysis</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Statistical Analysis</h4>
                    <p className="opacity-80">Advanced statistical methods for deep data insights and validation</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Trend Analysis</h4>
                    <p className="opacity-80">Identify patterns and trends across time periods and data sets</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Correlation Studies</h4>
                    <p className="opacity-80">Discover relationships between different business metrics and variables</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Performance Metrics</h4>
                    <p className="opacity-80">Custom KPIs and performance indicators for your business goals</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-8">Visualization & Reporting</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Interactive Charts</h4>
                    <p className="opacity-80">Dynamic visualizations that respond to user interaction and filters</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Custom Reports</h4>
                    <p className="opacity-80">Tailored reporting formats and layouts for different stakeholders</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Data Export</h4>
                    <p className="opacity-80">Multiple export formats for sharing and further analysis</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mr-4 h-6 w-6 text-phi-light mt-1" />
                  <div>
                    <h4 className="text-xl font-bold mb-2">Mobile Access</h4>
                    <p className="opacity-80">Responsive analytics accessible on any device or platform</p>
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
              Custom analytics solutions designed for specific industry needs and challenges
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Finance</h3>
              <p className="opacity-80">Risk analysis, portfolio performance, and market trend analytics</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
                              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-phi-white" />
                </div>
              <h3 className="text-xl font-bold mb-3">Retail</h3>
              <p className="opacity-80">Sales analytics, inventory optimization, and customer behavior insights</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Healthcare</h3>
              <p className="opacity-80">Patient outcomes, treatment effectiveness, and operational efficiency</p>
            </Card>

            <Card className="p-6 border border-phi-gray bg-transparent text-center">
              <div className="w-16 h-16 bg-phi-gray rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-phi-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Manufacturing</h3>
              <p className="opacity-80">Production analytics, quality control, and supply chain optimization</p>
            </Card>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            Ready to Transform Your Data Analytics?
          </h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12">
            Join hundreds of businesses already using our custom analytics to make better decisions and drive growth.
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
