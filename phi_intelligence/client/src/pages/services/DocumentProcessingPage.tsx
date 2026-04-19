import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Search,
  GitBranch,
  AlertCircle,
  Layers,
  FileOutput,
  ShieldCheck,
  Upload,
  FileSearch,
  CheckCircle2,
  Download,
  ScanLine,
  FileSpreadsheet,
  Image,
  PenTool,
  Eye,
} from "lucide-react";
import { DocExtractionMini } from "@/components/ServiceAnimations";


const capabilities = [
  { icon: Search, title: "LLM-Powered Extraction", desc: "Extract structured data from complex, unstructured documents using LLM pipelines with self-correction and visual validation — accuracy improves with each document type as the system learns your formats." },
  { icon: GitBranch, title: "Intelligent Routing", desc: "Documents are automatically classified by type and intent, then routed to specialised processing workflows." },
  { icon: Layers, title: "RAG Document Search", desc: "Transform static document archives into searchable knowledge bases. Query millions of pages with sub-second semantic search." },
  { icon: AlertCircle, title: "Self-Correction Engine", desc: "Secondary models audit extraction outputs in real-time, catching errors before they propagate into downstream systems." },
  { icon: FileText, title: "Multi-Format Support", desc: "Unified processing for PDFs, scanned documents, handwritten text, nested tables, and legacy file formats." },
  { icon: FileOutput, title: "Automated Reporting", desc: "Generate executive summaries, compliance filings, and formatted reports directly from raw document data." },
  { icon: ShieldCheck, title: "Compliance & Audit Trail", desc: "Full lineage tracking for every extracted data point. Air-gapped deployment options for regulated environments." },
];

const industries = [
  { name: "Legal", desc: "Contract analysis, clause extraction, case research, and due diligence automation.", accent: "from-white/[0.04] to-white/0" },
  { name: "Financial Services", desc: "KYC document extraction — passports, utility bills, proof of address. Automated field validation and structured output for onboarding workflows.", accent: "from-white/[0.04] to-white/0" },
  { name: "Healthcare", desc: "Clinical record extraction, referral letter processing, and discharge summary digitisation — with compliant data handling for HIPAA and UK GDPR.", accent: "from-white/[0.04] to-white/0" },
  { name: "Real Estate", desc: "Lease document processing, property valuation reports, and compliance management.", accent: "from-white/[0.04] to-white/0" },
];

const pipelineSteps = [
  { icon: Upload, label: "Upload", desc: "Ingest documents in any format" },
  { icon: FileSearch, label: "Parse", desc: "Structure & segment content" },
  { icon: ScanLine, label: "Extract", desc: "Pull data with LLM pipelines" },
  { icon: CheckCircle2, label: "Validate", desc: "Self-correct & audit outputs" },
  { icon: Download, label: "Output", desc: "Deliver structured results" },
];

const supportedFormats = [
  { icon: FileText, label: "PDF", desc: "Native & scanned" },
  { icon: FileText, label: "DOCX", desc: "Word documents" },
  { icon: FileSpreadsheet, label: "XLSX", desc: "Spreadsheets & tables" },
  { icon: Image, label: "Images", desc: "JPG, PNG, TIFF" },
  { icon: Eye, label: "Scanned", desc: "OCR processing" },
  { icon: PenTool, label: "Handwritten", desc: "ICR recognition" },
];

/* --- Document Mockup Component --- */
function DocumentMockup() {
  const extractedFields = [
    { label: "Name", value: "J. Carter", delay: 0.6 },
    { label: "Date", value: "2026-03-18", delay: 0.9 },
    { label: "Amount", value: "$42,850", delay: 1.2 },
    { label: "Status", value: "Approved", delay: 1.5 },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Main document panel */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative bg-white/[0.04] border border-white/10 rounded-xl p-6 backdrop-blur-sm"
      >
        {/* Document header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/8">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white/50" />
          </div>
          <div>
            <div className="h-2.5 w-28 bg-white/20 rounded-full" />
            <div className="h-2 w-16 bg-white/10 rounded-full mt-1.5" />
          </div>
        </div>

        {/* Text lines with extraction zones */}
        <div className="space-y-3">
          {/* Line group 1 */}
          <div className="h-2 w-full bg-white/8 rounded-full" />
          <div className="h-2 w-[85%] bg-white/8 rounded-full" />

          {/* Extraction zone 1 - Name */}
          <div className="relative my-4">
            <div className="h-2 w-full bg-white/8 rounded-full" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -inset-x-1 -inset-y-2 border border-white/30 rounded-md bg-white/[0.03]"
            >
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white/40 animate-pulse" />
            </motion.div>
          </div>

          <div className="h-2 w-[70%] bg-white/8 rounded-full" />
          <div className="h-2 w-[90%] bg-white/8 rounded-full" />

          {/* Extraction zone 2 - Date */}
          <div className="relative my-4">
            <div className="h-2 w-[60%] bg-white/8 rounded-full" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="absolute -inset-x-1 -inset-y-2 border border-white/25 rounded-md bg-white/[0.03]"
            >
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white/35 animate-pulse" />
            </motion.div>
          </div>

          <div className="h-2 w-full bg-white/8 rounded-full" />
          <div className="h-2 w-[75%] bg-white/8 rounded-full" />

          {/* Extraction zone 3 - Amount */}
          <div className="relative my-4">
            <div className="h-2 w-[45%] bg-white/8 rounded-full" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -inset-x-1 -inset-y-2 border border-white/20 rounded-md bg-white/[0.03]"
            >
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
            </motion.div>
          </div>

          <div className="h-2 w-[80%] bg-white/8 rounded-full" />
          <div className="h-2 w-[55%] bg-white/8 rounded-full" />
        </div>
      </motion.div>

      {/* Floating extracted data cards */}
      <div className="absolute -right-4 sm:-right-8 top-4 space-y-3">
        {extractedFields.map((field, i) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: field.delay, duration: 0.4, ease: "easeOut" }}
            className="bg-white/[0.06] backdrop-blur-md border border-white/12 rounded-lg px-3 py-2 min-w-[100px]"
          >
            <div className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/30">{field.label}</div>
            <div className="text-xs font-medium text-white/80 mt-0.5">{field.value}</div>
            {/* Connector line */}
            <div
              className="absolute -left-3 top-1/2 w-3 h-px"
              style={{
                background: "rgba(255,255,255,0.15)",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Processing indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/[0.06] backdrop-blur-md border border-white/12 rounded-full px-4 py-1.5 flex items-center gap-2"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
        <span className="text-[10px] text-white/50 font-medium tracking-wide">Processing complete</span>
      </motion.div>
    </div>
  );
}

export default function DocumentProcessingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-phi-blue selection:text-white">

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center pt-32 pb-20 overflow-hidden">

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Service 06</p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter uppercase leading-[0.9]">
                Intelligent<br />Document<br />
                <span className="text-phi-blue/60 italic">Processing.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-lg">
                Beyond OCR. Our document processing platform uses LLMs and RAG pipelines to extract, classify, search, and validate documents at scale — with self-correction, visual validation, and semantic search across your entire document archive.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/contact">
                  <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-8 py-4 text-sm">
                    Discuss Your Documents <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" className="pill-button border-white/10 hover:border-phi-blue/50 hover:bg-phi-blue/5 hover:text-white px-8 py-4 text-sm">
                    All Services
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative h-[420px] overflow-hidden"
            >
              <DocExtractionMini />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">What We Build</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-4 sm:p-6 md:p-8 rounded-2xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                  <cap.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white/90 mb-2 text-lg">{cap.title}</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Pipeline */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-16 text-center">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Pipeline</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">How It Works</h2>
          </div>

          {/* Pipeline flow */}
          <div className="relative">
            {/* Connecting line - desktop */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-px bg-gradient-to-r from-white/0 via-white/15 to-white/0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-8 lg:gap-4">
              {pipelineSteps.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center relative"
                >
                  {/* Step circle */}
                  <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full border border-white/10 bg-white/[0.03] mb-5 mx-auto">
                    <step.icon className="w-8 h-8 text-white/50" />
                    {/* Step number */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white/50">{i + 1}</span>
                    </div>
                  </div>

                  {/* Arrow between steps - mobile/tablet */}
                  {i < pipelineSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-2 w-4 text-white/20">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}

                  <h3 className="text-sm font-bold uppercase tracking-wider mb-1">{step.label}</h3>
                  <p className="text-xs text-white/40 font-light">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Compatibility</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
              Supported <span className="text-phi-blue/60 italic">Formats</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {supportedFormats.map((format, i) => (
              <motion.div
                key={format.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="text-center p-5 rounded-xl border border-white/8 hover:border-phi-blue/30 hover:bg-phi-blue/[0.02] transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-phi-blue group-hover:text-white transition-all duration-300">
                  <format.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wide mb-0.5">{format.label}</h3>
                <p className="text-[11px] text-white/30 font-light">{format.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="section-padding border-t border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-4 space-y-6">
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60 mb-3">Industries</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
                Where It<br /><span className="text-phi-blue/60 italic">Applies.</span>
              </h2>
              <p className="text-base text-white/40 font-light leading-relaxed">
                Document processing is critical in industries where accuracy, compliance, and speed directly impact operations and revenue.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {industries.map((ind, i) => (
                <motion.div
                  key={ind.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative p-4 sm:p-6 md:p-8 rounded-2xl border border-white/8 hover:border-white/20 transition-all duration-300 overflow-hidden group"
                >
                  {/* Accent gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${ind.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-2 uppercase tracking-tight">{ind.name}</h3>
                    <p className="text-sm text-white/40 font-light leading-relaxed">{ind.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cross-sell: Computer Vision */}
      <section className="section-padding border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-5 sm:p-8 md:p-12 rounded-2xl border border-white/8 overflow-hidden"
          >
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white/50" />
                  </div>
                  <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-phi-blue/60">Related Service</p>
                </div>
                <h3 className="text-2xl font-bold tracking-tighter uppercase">
                  Need Advanced OCR & Visual Analysis?
                </h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">
                  Our Computer Vision service extends document processing with advanced OCR, layout analysis, signature detection, and visual content extraction for complex document types.
                </p>
              </div>
              <Link href="/services/computer-vision">
                <Button variant="outline" className="pill-button border-white/10 hover:border-phi-blue/50 hover:bg-phi-blue/5 hover:text-white px-8 py-4 text-sm whitespace-nowrap">
                  Computer Vision <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding border-t border-white/5 text-center">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter uppercase">
              Turn Your Documents<br />
              <span className="text-phi-blue/60 italic">Into Intelligence.</span>
            </h2>
            <p className="text-lg text-white/40 font-light">
              Send us a sample document set. We'll show you what our pipeline can extract — free of charge.
            </p>
            <Link href="/contact">
              <Button className="pill-button bg-phi-blue text-white hover:bg-phi-blue/90 px-10 py-4 text-sm font-bold">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
