# Phi Intelligence — Website Integration Plan

> Maps the strategic research content to concrete pages, sections, and copy direction.
> No product names (DocFlies, Phi Voice Suite). No competitor data on the public site.

---

## Navigation Structure

```
HOME | SERVICES ▾ | TECHNOLOGY | INDUSTRIES | ABOUT | CAREERS | CONTACT [CTA button]
```

### SERVICES Mega-Menu Layout

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| AI Consulting & Strategy | AI Voice Automation | Custom AI Application Development |
| Intelligent Document Processing | AI-Powered Digital Marketing | Business Process Automation |
| Computer Vision & Image AI | | |

**7 service pillars** — each gets its own landing page. These are distinct and non-overlapping (unlike the current 14 which repeat each other).

### Why 7 Works (vs. the current 14)
The current 14 failed because they were template-copy pages with generic CheckCircle lists saying the same things. These 7 are genuinely different businesses with different capabilities, different clients, and different tech stacks. A law firm needs Document Processing. A call centre needs Voice Automation. A retailer needs Digital Marketing + Computer Vision. No overlap.

---

## Page-by-Page Content Plan

---

### 1. HOME PAGE (`/`)

**Goal:** One clear story — who Phi is, what they do, why they're different.

#### Section 1 — Hero
- **Heading:** "We Build Intelligence Into Your Business."
- **Subtext:** "AI consulting, custom development, and open-source model integration — from strategy to production."
- **CTA:** "Explore Our Services" + "Book a Free Consultation"
- **Visual:** Keep 3D Globe animation

#### Section 2 — What We Do (Service Pillars Overview)
- **Heading:** "Seven Ways We Deploy AI"
- 7 compact cards (icon + name + one-line description) linking to each service page
- Layout: responsive grid (2-col mobile, 4-col desktop, second row 3 centered)
- No heavy copy here — just enough to orient the visitor

#### Section 3 — Open-Source First (Key Differentiator)
- **Heading:** "Open-Source First. Vendor-Independent."
- **Copy direction:** "We build with Llama, Mistral, Qwen, Whisper, and the full Hugging Face ecosystem — giving you data sovereignty, lower costs, and zero vendor lock-in. When commercial models fit better, we integrate OpenAI, Claude, and Gemini too."
- **Visual:** Technology logo grid (Hugging Face, Meta, Mistral, OpenAI, Anthropic, Google, AWS, Deepgram, LiveKit)
- This section replaces the old "Manifesto" — same position, but now says something concrete

#### Section 4 — Why Phi Intelligence (Differentiators)
- **Heading:** "Why Companies Choose Phi"
- 4-5 differentiator blocks:
  1. **Security-First Architecture** — "Founded by a Cyber-Security Director. Every solution we build has security, compliance, and data protection designed in from day one."
  2. **End-to-End Ownership** — "We handle consulting, design, development, model training, deployment, monitoring, and ongoing support. No handoffs."
  3. **PoC Before Commitment** — "We prove ROI with a working prototype (4-8 weeks) before you commit to full-scale deployment."
  4. **SMB-Accessible Pricing** — "Enterprise-grade AI at pricing that works for growing businesses."
  5. **We Build and We Ship** — "We have our own production AI products, proving we don't just advise — we build and operate."
- Layout: alternating left/right blocks or stacked cards

#### Section 5 — Industries We Serve (Preview)
- **Heading:** "AI Solutions Across Industries"
- Horizontal scrollable or grid of industry badges/icons linking to `/industries`
- Industries: Healthcare | Financial Services | Legal | E-Commerce | Real Estate | Manufacturing | Education | Logistics | Media

#### Section 6 — Process
- **Heading:** "How We Work"
- 6-step flow: Discovery → Strategy → PoC → Development → Deployment → Support
- Compact horizontal timeline or numbered steps
- This is proven messaging (ScienceSoft, LeewayHertz, Pragmatic Coders all use it)

#### Section 7 — CTA
- **Heading:** "Ready to Integrate AI Into Your Business?"
- **Subtext:** "Book a free consultation. We'll identify where AI fits and what it can save you."
- **Button:** "Get Started" → `/contact`

---

### 2. SERVICES INDEX (`/services`)

**Goal:** Overview page showing all 7 pillars clearly.

- **Hero heading:** "Our Services"
- **Subtext:** "End-to-end AI capabilities — from strategy and consulting to production deployment and ongoing support."
- 7 service blocks, each with:
  - Icon
  - Service name
  - 2-3 sentence description
  - "Learn More →" link to detail page
- Layout: stacked full-width blocks (alternating image/text) or large card grid
- **Bottom CTA:** "Not sure which service fits? Book a free AI readiness consultation."

---

### 3. SERVICE DETAIL PAGES (7 pages)

All service pages follow a consistent but NOT template-cookie-cutter structure. Each page should feel purposeful for its specific audience.

---

#### 3A. AI Consulting & Strategy (`/services/ai-consulting`)

**Hero:**
- **Heading:** "AI Consulting & Strategy"
- **Subtext:** "We help you find where AI fits, build the business case, and create a roadmap from proof-of-concept to production."

**Capabilities Section (6 items):**
1. AI Readiness Assessment — Evaluate infrastructure, data maturity, and AI opportunity mapping
2. AI Roadmap & Strategy Development — Phased implementation plans with ROI projections and KPIs
3. Use Case Identification — Analyze business processes for high-impact AI integration points
4. Proof of Concept Development — Rapid prototypes to validate AI solutions (4-8 weeks)
5. AI Architecture Design — Scalable, secure AI system architectures integrating with existing tech stacks
6. AI Cost-Benefit Analysis — Financial modelling of AI implementation vs. manual processes

**Who This Is For:**
- Businesses exploring AI for the first time
- Companies with failed AI projects that need a reset
- Leadership teams that need a clear business case before investing

**CTA:** "Book a Free AI Readiness Assessment"

---

#### 3B. Intelligent Document Processing (`/services/document-processing`)

**Hero:**
- **Heading:** "Intelligent Document Processing"
- **Subtext:** "Enterprise-grade AI that reads, understands, and extracts value from your documents — invoices, contracts, forms, and regulatory filings."

**Capabilities (7 items):**
1. Automated Data Extraction — Structured data from invoices, contracts, receipts, forms, regulatory filings
2. Document Classification & Routing — Automatic categorisation and workflow routing
3. RAG-Powered Document Intelligence — Hybrid dense/sparse search for context-aware querying and retrieval
4. Self-Correction Engine — AI that detects and fixes extraction errors with visual validation
5. Multi-Format Support — PDFs, Word, scanned images, handwritten text, complex tables
6. LLM-Powered Document Generation — Auto-generate reports, summaries, formatted outputs
7. Compliance & Audit Trail — Full audit logs for regulated industries (finance, legal, healthcare)

**Industries highlighted:** Legal, Financial Services, Healthcare, Real Estate

**CTA:** "See a Demo" / "Talk to Our Document AI Team"

---

#### 3C. AI Voice Automation (`/services/voice-automation`)

**Hero:**
- **Heading:** "AI Voice Automation"
- **Subtext:** "Dual-mode AI voice platform — assist your human agents in real-time or deploy fully autonomous voice agents."

**Capabilities (6 items):**
1. Assist Mode — Real-time AI copilot: live transcription, suggested responses, sentiment analysis, knowledge retrieval, call summarisation
2. Agent Mode — Fully autonomous AI voice agents: natural conversation, multi-turn dialogue, intelligent escalation
3. Multi-Region Telephony — UK, US, India telephony integration with local number provisioning and PSTN connectivity
4. Advanced Speech Stack — LiveKit Agents + Deepgram ASR + OpenAI/open-source TTS for ultra-low latency
5. Regulatory Compliance — TCPA (US), UK GDPR/PECR, India TRAI compliance with consent management
6. Analytics Dashboard — Call volume, response times, sentiment, agent performance, conversion metrics

**Visual:** AudioBarsAnimation or VoiceBubble component (reuse existing)

**CTA:** "Deploy a Voice Agent" / "Book a Demo"

---

#### 3D. AI-Powered Digital Marketing (`/services/digital-marketing`)

**Hero:**
- **Heading:** "AI-Powered Digital Marketing"
- **Subtext:** "Data-driven content, targeting, and optimisation — generated and managed by AI, guided by your brand."

**Capabilities (7 items):**
1. AI Content Generation — Blog posts, social content, ad copy, email campaigns, marketing collateral using LLMs and image generation (FLUX.1, Stable Diffusion)
2. AI-Powered SEO & AEO — Search and Answer Engine Optimisation using AI for keyword research, content optimisation, ranking prediction
3. Programmatic Ad Optimisation — ML-driven placement, bidding, creative optimisation across Meta, Google, TikTok, LinkedIn
4. Customer Segmentation & Personalisation — AI audience segmentation, behavioural analysis, personalised content delivery
5. AI Video Generation — Automated video content for marketing campaigns and social media
6. Predictive Analytics for Marketing — Lead scoring, churn prediction, conversion forecasting, campaign ROI analysis
7. Image Segmentation for Visual Marketing — Product image enhancement, background removal, visual search, catalogue automation

**CTA:** "Get a Marketing AI Audit"

---

#### 3E. Custom AI Application Development (`/services/ai-development`)

**Hero:**
- **Heading:** "Custom AI Application Development"
- **Subtext:** "End-to-end development of web and mobile applications with AI built in from day one — not bolted on after."

**Capabilities (8 items):**
1. AI-Powered Mobile Apps — React Native and Flutter with embedded AI/ML for iOS and Android
2. AI Web Applications — Full-stack platforms (React/Next.js + Python/Node.js) with integrated AI features
3. AI Employee Management Systems — HRMS with AI recruitment (CV screening, candidate matching), onboarding automation, performance analytics
4. AI Task & Project Management — Intelligent tools with AI prioritisation, resource allocation, deadline prediction
5. AI CRM Solutions — Lead scoring, customer insights, automated follow-ups, deal prioritisation
6. AI Inventory & Operations Management — Demand forecasting, automated reordering, supply chain optimisation
7. AI Finance & Accounting Tools — Invoice processing, expense categorisation, financial forecasting, fraud detection
8. Media & Content Platforms — Content recommendation, transcription, intelligent search

**CTA:** "Start Your Project" / "Get a Development Quote"

---

#### 3F. Business Process Automation (`/services/process-automation`)

**Hero:**
- **Heading:** "Business Process Automation & AI Integration"
- **Subtext:** "We connect your systems, automate your workflows, and deploy AI agents that handle multi-step tasks across your business."

**Capabilities (7 items):**
1. AI Workflow Automation — Custom workflows connecting CRM, ERP, HR, accounting, and communication systems
2. AI Agent Development — Autonomous agents for multi-step task execution, decision-making, cross-system orchestration
3. Chatbot & Virtual Assistant Development — Conversational AI for support, helpdesks, lead qualification, scheduling
4. API Integration & System Connectivity — Connect tools via APIs, webhooks, middleware for seamless data flow
5. Email & Communication Automation — AI-powered email responses, scheduling, follow-ups, notifications (Gmail, Outlook, WhatsApp Business API)
6. Custom Automation Workflows — Bespoke solutions using n8n, Make, Zapier, or fully custom pipelines
7. Predictive Maintenance Automation — AI-driven monitoring for equipment, infrastructure, and IT systems

**CTA:** "Automate a Process" / "Talk to Our Automation Team"

---

#### 3G. Computer Vision & Image AI (`/services/computer-vision`)

**Hero:**
- **Heading:** "Computer Vision & Image AI"
- **Subtext:** "Custom visual intelligence — from object detection on a production line to document digitisation in a legal archive."

**Capabilities (5 items):**
1. Image Segmentation Models — Semantic, instance, panoptic segmentation for product detection, medical imaging, QC, scene understanding
2. Object Detection & Recognition — Real-time detection for manufacturing, retail inventory, security, autonomous systems
3. OCR & Document Digitisation — Converting printed/handwritten documents to searchable digital formats
4. AI Image Generation & Enhancement — Product photography enhancement, background generation, style transfer, upscaling (diffusion models)
5. Video Analytics — Real-time analysis for security, traffic monitoring, customer behaviour, sports analytics

**Visual:** Could use a relevant Three.js animation or image showcase

**CTA:** "Discuss a Vision Project"

---

### 4. TECHNOLOGY PAGE (`/technology`)

**Goal:** Showcase the full open-source + commercial stack. This is a key differentiator page.

**Hero:**
- **Heading:** "Our Technology"
- **Subtext:** "Open-source first. Vendor-independent. We work with the models and platforms that fit your problem — not the ones that lock you in."

**Section 1 — Open-Source Model Ecosystem**
- Hugging Face Hub (1M+ models, 200K+ datasets, Transformers library, fine-tuning with LoRA/QLoRA/PEFT)

**Section 2 — Large Language Models** (table/grid)
| Model | Provider | Use Cases |
|-------|----------|-----------|
| Llama 3.x / 4 | Meta | General reasoning, code generation, multilingual, RAG |
| Mistral / Mixtral | Mistral AI | Efficient inference, MoE, cost-effective deployment |
| Qwen 2.5 / QwQ | Alibaba Cloud | Code generation, reasoning, multilingual |
| Phi-4 | Microsoft | Small model excellence, on-device AI |
| Gemma 3 | Google | Lightweight tasks, on-device, vision-language |
| DeepSeek V3 / R1 | DeepSeek | Advanced reasoning, math, code |
| Devstral | Mistral AI | Code-specialised, dev workflows |

**Section 3 — Computer Vision & Image Models** (table/grid)
| Model | Provider | Capabilities |
|-------|----------|-------------|
| SAM 2 | Meta | Universal segmentation, zero-shot |
| YOLO v10/v11 | Ultralytics | Real-time object detection |
| FLUX.1 / SDXL | BFL / Stability AI | Image generation, product vis |
| Docling | IBM | Document understanding, layout |
| Florence-2 / PaliGemma | MS / Google | Vision-language understanding |

**Section 4 — Speech & Audio Models** (table/grid)
| Model | Provider | Capabilities |
|-------|----------|-------------|
| Whisper Large V3 Turbo | OpenAI (open-source) | STT, 100+ languages |
| Bark / XTTS | Suno AI / Coqui | TTS, voice cloning, multilingual |
| MMS | Meta | 1000+ languages |

**Section 5 — Infrastructure & Deployment**
- Ollama / LM Studio / vLLM — Local model deployment
- LangChain / LlamaIndex — RAG pipelines and agent frameworks
- Qdrant / Weaviate / ChromaDB — Vector databases
- BentoML / TorchServe — Model serving
- AWS / GCP / Azure — Cloud GPU
- Docker / Kubernetes — Containerised AI

**Section 6 — Commercial Integrations**
- OpenAI (GPT-4o, o3-mini)
- Anthropic Claude (Opus, Sonnet, Haiku)
- Google Gemini
- Deepgram
- ElevenLabs

**Section 7 — Technology Partner Logos**
Visual grid of partner/ecosystem logos: Hugging Face, AWS, Google Cloud, OpenAI, Anthropic, Meta, Mistral, Deepgram, LiveKit, Docker, Kubernetes

---

### 5. INDUSTRIES PAGE (`/industries`)

**Goal:** Show vertical expertise. Each industry gets a compact section (not a full page yet — can expand later).

**Hero:**
- **Heading:** "Industries We Serve"
- **Subtext:** "AI solutions designed for the specific challenges of your industry."

**Industry Sections (9 blocks):**

Each block: Industry name | 3-4 AI applications | Which Phi services are relevant

1. **Healthcare** — Patient scheduling, claims processing, medical document AI, clinical decision support, voice triage → Document Processing + Voice Automation + Custom Apps
2. **Financial Services** — Fraud detection, KYC automation, document processing, risk assessment, client onboarding → Document Processing + AI Agents + Compliance Automation
3. **Legal** — Contract analysis, clause extraction, case research, document review, compliance monitoring → Document Processing + RAG-powered research
4. **E-Commerce & Retail** — Product recommendations, inventory optimisation, customer support, visual search, catalogue automation → Digital Marketing + Computer Vision + Voice
5. **Real Estate & PropTech** — Property valuation AI, tenant support, compliance management, document automation → Document Processing + Custom Apps
6. **Manufacturing** — Predictive maintenance, quality control (CV), supply chain optimisation, IoT integration → Computer Vision + Automation + Predictive Analytics
7. **Education** — Personalised learning, AI tutoring, automated grading, content generation, student analytics → Custom AI Platforms + LLM Integration
8. **Logistics & Supply Chain** — Route optimisation, demand forecasting, warehouse automation, shipment tracking → Custom Apps + Predictive Analytics
9. **Media & Entertainment** — Content recommendation, transcription, AI content generation, audience analytics → AI Content + Voice + Custom Platforms

**CTA:** "Don't see your industry? We build custom AI solutions for any vertical."

---

### 6. ABOUT PAGE (`/about`)

**Hero:**
- **Heading:** "About Phi Intelligence"
- **Subtext:** Company story — founded by AJ (Cyber-Security Director, MSc), driven by the belief that AI should be accessible to businesses of all sizes.

**Section: What We Stand For**
- Security-first AI architecture
- Open-source model advocacy
- End-to-end ownership (no handoffs)
- Practical AI (not hype — working systems)

**Section: How We Work (Process)**
6 steps: Discovery → Strategy → PoC → Development → Deployment → Support
(same content as homepage Section 6 but expanded with more detail)

**Section: Research & Innovation** (folded from R&D page)
- Research focus areas: NLP, Computer Vision, Autonomous Systems, Edge Intelligence, AI Ethics
- Academic and industry partnerships

**Section: Team** (if content available)

**CTA:** "Work With Us" → `/contact`

---

### 7. CAREERS PAGE (`/careers`)

Keep current structure — minor copy updates:
- **Heading:** "Join Phi Intelligence"
- **Subtext:** Update from "industrial intelligence layer" to something aligned with new positioning: "We're building AI solutions that transform how businesses operate. Join us in Nottingham or remotely."
- Job cards, recruitment process — keep as-is

---

### 8. CONTACT PAGE (`/contact`)

**Route change:** `/company/contact` → `/contact` (top-level, simpler)

**Hero:**
- **Heading:** "Let's Talk"
- **Subtext:** "Book a free consultation. We'll identify where AI fits your business and what it can save you."

**Form:** Keep existing ContactForm component

**Contact Details:** Email, phone, address — unchanged

**Optional future addition:** AI Readiness Assessment quiz (lead gen tool, Phase 2)

---

### 9. BLOG / INSIGHTS (`/insights`)

**Route change:** `/blog` → `/insights`

- **Heading:** "Insights"
- Keep existing RSS aggregation and category filters
- Minor label updates only

---

### 10. CHAT (`/chat`)

- Remove from all navigation
- Keep route alive (accessible via direct URL or homepage chat input)
- No other changes

---

### 11. ADMIN (`/admin/*`)

- Remove from public navigation entirely
- Access via `/admin/login` directly
- No other changes

---

## Files Summary

### New Files to Create
```
client/src/pages/solutions.tsx                          → Services index
client/src/pages/solutions/AIConsulting.tsx              → AI Consulting & Strategy
client/src/pages/solutions/DocumentProcessing.tsx       → Intelligent Document Processing
client/src/pages/solutions/VoiceAutomation.tsx          → AI Voice Automation
client/src/pages/solutions/DigitalMarketing.tsx         → AI-Powered Digital Marketing
client/src/pages/solutions/AIDevelopment.tsx            → Custom AI Application Development
client/src/pages/solutions/ProcessAutomation.tsx        → Business Process Automation
client/src/pages/solutions/ComputerVision.tsx           → Computer Vision & Image AI
client/src/pages/technology.tsx                         → Technology stack showcase
client/src/pages/industries.tsx                         → Industries page
```

### Files to Modify
```
client/src/App.tsx                                      → All route changes
client/src/components/layout/navigation.tsx             → New nav structure + mega-menu
client/src/components/layout/footer.tsx                 → Updated links
client/src/pages/home.tsx                               → Complete redesign
client/src/pages/about.tsx                              → Fold R&D + new positioning
client/src/pages/careers.tsx                            → Minor copy update
client/src/pages/blog.tsx                               → Route to /insights, minor label
client/src/pages/company/ContactPage.tsx                → New messaging, possible route change
```

### Files to Delete
```
client/src/pages/services/                              → All 15 files (entire directory)
client/src/pages/company/RDPage.tsx                     → Folded into About
client/src/pages/products/VoicebotBuilderPage.tsx       → Removed
client/src/pages/voicebot/                              → All files (entire directory)
client/src/pages/products.tsx                           → Removed (no products page)
client/src/pages/products/WorkstreamPage.tsx            → Removed for now
```

### Routes

| Route | Page | Status |
|-------|------|--------|
| `/` | Home | Redesign |
| `/services` | Services index | New |
| `/services/ai-consulting` | AI Consulting | New |
| `/services/document-processing` | Document Processing | New |
| `/services/voice-automation` | Voice Automation | New |
| `/services/digital-marketing` | Digital Marketing | New |
| `/services/ai-development` | AI App Development | New |
| `/services/process-automation` | Business Process Automation | New |
| `/services/computer-vision` | Computer Vision | New |
| `/technology` | Technology Stack | New |
| `/industries` | Industries | New |
| `/about` | About | Redesign |
| `/careers` | Careers | Minor update |
| `/careers/apply/:jobId` | Job Application | Keep |
| `/insights` | Blog/Insights | Rename from /blog |
| `/contact` | Contact | Move from /company/contact |
| `/chat` | Chat (hidden) | Keep, remove from nav |
| `/admin/*` | Admin pages | Keep, remove from nav |

---

## Implementation Order

1. **App.tsx** — all route changes
2. **navigation.tsx** — new mega-menu structure
3. **footer.tsx** — updated links
4. **home.tsx** — complete redesign (7 sections)
5. **solutions.tsx** — services index
6. **7 service pages** — one at a time
7. **technology.tsx** — tech stack showcase
8. **industries.tsx** — industry verticals
9. **about.tsx** — redesign with R&D content
10. **careers.tsx** — minor copy
11. **blog.tsx → insights** — rename/route
12. **ContactPage.tsx** — route + messaging
13. **Delete old files** — services/, voicebot/, products/, RDPage

---

## Animations Reuse Plan

| Animation Component | New Location |
|---------------------|-------------|
| Globe.tsx | Home hero |
| NeuralNetworkAnimation.tsx | Technology page or AI Consulting |
| ParticleWavesAnimation.tsx | Services index hero |
| AudioBarsAnimation.tsx | Voice Automation service page |
| ChatbotMascotAnimation.tsx | Process Automation or AI Development |
| RobotArmAnimation.tsx | Industries page or Home |
| ANNAnimation.tsx | Data section of home or Technology |
| AdvancedNetworkAnimation.tsx | AI Consulting page |
| IDEAnimation.tsx | AI Development page |
| CubeGridAnimation.tsx | Document Processing or Computer Vision |
| VoiceBubble.tsx | Voice Automation page |
| Robot3D.tsx | About page or Home |

---

*Ready for review. Once confirmed, implementation begins.*
