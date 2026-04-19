# Phi Intelligence — AI Product Portfolio Specifications

**Prepared for:** Software Engineering Team  
**Date:** April 2026  
**Markets:** UK · India · UAE · US  
**Status:** Build roadmap with technical specifications for each product

---

## Overview

17 AI products across 4 categories. Tier 1 (build first) products leverage existing Phi Intelligence infrastructure (RAG pipeline, voice stack, YOLO CV pipeline, SaaS shell). Tier 2 and 3 products require moderate additional development.

### Shared Infrastructure to Build Once

| Component | Products Using It | Stack |
|-----------|------------------|-------|
| **RAG/Document Pipeline** | #8, #9, #10, #11, #13, #23, #35 | LangChain + ChromaDB/Pinecone + LLM extraction |
| **YOLO CV Inference Service** | #1, #2, #3, #6 | YOLOv11 + FastAPI + TorchServe/Triton |
| **Voice Pipeline** | #12, #32 | LiveKit + Deepgram + Whisper |
| **Agent Orchestration** | #9, #34, #35, #36, #37 | OpenClaw / LangGraph / CrewAI |
| **SaaS Admin Shell** | All products | React + Express + Drizzle + Neon + R2 |

---

## TIER 1 — Build First (Weeks 1–8)

---

### Product #8 — Intelligent Document Processing Engine

**Category:** LLM & NLP  
**Priority:** P0

**What it does:**  
Ingests unstructured documents (invoices, contracts, medical records, shipping documents, legal filings) and extracts structured data automatically. Handles multiple languages, handwriting, varied layouts, and poor-quality scans. Operates beyond basic OCR — uses LLMs to understand document context and semantics.

**Key Features:**
- Multi-format ingestion: PDF, DOCX, XLSX, JPEG/PNG scans, handwritten documents
- Multi-language support: English, Hindi, Arabic, and others
- Self-correction: secondary LLM audit pass to validate extraction quality
- Confidence scoring: per-field extraction confidence displayed in dashboard
- Industry templates: pre-built extraction schemas for invoices, contracts, medical records, shipping docs
- Structured output: JSON/CSV/Excel export
- Audit trail: full extraction logs with original document reference

**Tech Stack:**
- OCR: PaddleOCR or Tesseract for initial text extraction
- Layout understanding: LayoutLMv3 (HuggingFace) for document structure analysis
- LLM extraction: GPT-4o or Claude via API
- Document parsing: Docling (IBM open-source) for complex formats
- Storage: Cloudflare R2 for document storage
- API: FastAPI (Python)
- Frontend: React dashboard with document upload, extraction preview, and download

**API Design:**
```
POST /api/v1/documents/extract
  Body: { file: multipart, schema: string, language: string }
  Returns: { fields: {}, confidence: {}, raw_text: string, processing_time_ms: number }

GET /api/v1/documents/{id}/status
GET /api/v1/documents/{id}/result
POST /api/v1/schemas (create custom extraction schema)
```

**Open-Source Starting Points:**
- PaddlePaddle/PaddleOCR (45K+ stars)
- microsoft/layoutlmv3-base (HuggingFace)
- DS4SD/docling (IBM document parser)

**Revenue Model:** Per-document API pricing ($0.05–0.50/doc depending on complexity) + Enterprise SaaS  
**Target Markets:** Banks (India, UAE, UK), logistics, hospitals, law firms, government

---

### Product #10 — Domain-Specific RAG Knowledge Systems

**Category:** LLM & NLP  
**Priority:** P0

**What it does:**  
Custom AI knowledge assistants connected to a company's internal documents, databases, and knowledge bases. Employees query in natural language and receive accurate, sourced answers from their own data. Available as four vertical products: Legal RAG, Medical RAG, Financial RAG, Engineering RAG.

**Key Features:**
- Multi-format document ingestion: PDF, DOCX, TXT, Confluence, Notion, SharePoint, Google Drive
- Semantic chunking with configurable overlap and size
- Hybrid search: dense (vector) + sparse (BM25) retrieval
- Citation-grounded answers: every answer shows source document and page number
- Conversation memory: multi-turn query support
- Admin panel: document management, ingestion status, query analytics
- Access control: document-level permissions per user/team

**Vertical Configurations:**

| Vertical | Knowledge Base | Key Use Cases |
|----------|---------------|--------------|
| Legal RAG | Case law, contracts, regulations | Contract clause search, case research, regulatory Q&A |
| Medical RAG | Clinical guidelines, drug databases, protocols | Drug interaction check, clinical guidelines assistant |
| Financial RAG | Policies, regulations, transaction rules | Policy lookup, audit navigation, compliance Q&A |
| Engineering RAG | Technical documentation, manuals | Troubleshooting assistant, code documentation Q&A |

**Tech Stack:**
- Framework: LlamaIndex or LangChain
- Vector DB: Qdrant (self-hosted) or Pinecone (managed)
- Embeddings: OpenAI text-embedding-3-large or BGE-M3 (multilingual, open-source)
- LLM: GPT-4o / Claude / local Llama 3.3 via Ollama
- Reranking: Cohere Rerank or BGE-reranker
- Frontend: React chat interface + admin document management panel

**API Design:**
```
POST /api/v1/rag/query
  Body: { query: string, domain: string, session_id: string, filters: {} }
  Returns: { answer: string, sources: [], confidence: float }

POST /api/v1/rag/ingest
  Body: { files: multipart[], domain: string, metadata: {} }

GET /api/v1/rag/sources/{domain}
DELETE /api/v1/rag/sources/{id}
```

**Open-Source Starting Points:**
- run-llama/llama_index (38K+ stars)
- langchain-ai/langchain
- qdrant/qdrant vector database

**Revenue Model:** Implementation fee (£10–50K) + monthly hosting SaaS (£500–3,000/month)  
**Target Markets:** Law firms, hospitals, banks, engineering firms (all 4 markets)

---

### Product #11 — AI Contract Analysis & Risk Scoring

**Category:** LLM & NLP  
**Priority:** P0 (builds on top of #8 and #10)

**What it does:**  
Ingests legal contracts and automatically identifies key clauses, flags unusual or risky terms, compares against standard templates, and generates a risk score with recommendations. Reduces legal review time by 80%.

**Key Features:**
- Clause identification: indemnity, liability, termination, IP ownership, non-compete, governing law, dispute resolution
- Risk scoring: 0–100 score per clause with overall contract risk grade (A/B/C/D)
- Template comparison: upload standard template, identify deviations in submitted contract
- Red-flag detection: unusual or one-sided terms flagged with explanation
- Side-by-side redline view: original vs recommended language
- Batch processing: analyse multiple contracts simultaneously
- Export: PDF risk report with clause-by-clause annotation

**Tech Stack:**
- Document extraction: Product #8 pipeline (LayoutLMv3 + OCR)
- Clause classifier: fine-tuned BERT/DeBERTa on CUAD (Contract Understanding Atticus Dataset)
- Risk scoring: rule-based heuristics + LLM reasoning
- RAG precedent database: standard contract templates as knowledge base (Product #10 pattern)
- Redline view: React diff viewer component

**Training Data:**
- CUAD dataset (510 contracts, 13K clause labels — publicly available)
- EDGAR SEC filings (public contracts)
- Custom templates provided by client during onboarding

**API Design:**
```
POST /api/v1/contracts/analyse
  Body: { file: multipart, template_id?: string, jurisdiction: string }
  Returns: { risk_score: number, grade: string, clauses: [], flags: [], summary: string }

POST /api/v1/contracts/compare
  Body: { contract: multipart, template: multipart }
  Returns: { deviations: [], risk_delta: number }
```

**Open-Source Starting Points:**
- CUAD dataset: atticusdatasetproject.github.io
- Fine-tuning: HuggingFace transformers + DeBERTa-v3

**Revenue Model:** Per-contract ($5–50 depending on length) or enterprise licence  
**Target Markets:** Law firms, corporate legal departments, real estate, procurement (UK, UAE)

---

### Product #9 — Multi-Agent AI Workflow Automation Platform

**Category:** Agent Platform  
**Priority:** P0

**What it does:**  
Businesses define their SOPs and the system deploys a team of specialised AI agents that execute workflows autonomously. Agents collaborate: one gathers data, another validates, a third makes decisions, a fourth escalates to humans.

**Pre-Built Workflow Templates (ship with product):**
1. **Accounts Payable:** Invoice receipt → OCR extraction → PO matching → approval routing → payment scheduling
2. **HR Onboarding:** Document collection → background check trigger → system provisioning → training scheduling
3. **Insurance Claims:** Intake → document verification → fraud check → assessment → payout recommendation
4. **Customer Support Triage:** Ticket intake → classification → knowledge base search → auto-resolve or escalate
5. **Lead Qualification:** Lead capture → research → scoring → CRM update → sales notification

**Key Features:**
- Visual workflow builder: React Flow-based drag-and-drop canvas
- Agent library: pre-built specialised agents (researcher, validator, writer, classifier, escalator)
- Human-in-the-loop: configurable approval steps at any workflow node
- Tool integrations: email (Gmail/Outlook), calendar (Google/Outlook), CRM (HubSpot/Salesforce), Jira, Slack, WhatsApp
- Execution logs: full trace of every agent action and decision
- Error handling: automatic retry, fallback paths, human escalation

**Tech Stack:**
- Agent orchestration: LangGraph (primary) + CrewAI for multi-agent patterns
- LLM: GPT-4o (primary), Claude (fallback), local Llama 3.3 (data-sovereign option)
- Tool integrations: custom adapters per integration using existing OAuth patterns
- Frontend: React + React Flow for visual workflow builder
- Backend: FastAPI + Celery for async workflow execution
- Queue: Redis for task queue
- DB: PostgreSQL (Neon) for workflow state persistence

**API Design:**
```
POST /api/v1/workflows
  Body: { name: string, nodes: [], edges: [], triggers: [] }

POST /api/v1/workflows/{id}/execute
  Body: { input: {}, context: {} }
  Returns: { execution_id: string }

GET /api/v1/executions/{id}/status
GET /api/v1/executions/{id}/trace
POST /api/v1/executions/{id}/approve (human-in-the-loop)
```

**Open-Source Starting Points:**
- langchain-ai/langgraph (10K+ stars)
- crewAIInc/crewAI (25K+ stars)
- reactflow/reactflow (visual builder)

**Revenue Model:** Platform licence (£500–5,000/month) + per-execution pricing  
**Target Markets:** Financial services, healthcare, logistics enterprises (all 4 markets)

---

### Product #12 — Multilingual Customer Support AI Agent

**Category:** Voice AI  
**Priority:** P0

**What it does:**  
Voice and text AI agent handling customer support in multiple languages. Understands context from past interactions, accesses knowledge bases, performs actions (refunds, booking changes, escalations), and hands off to humans when needed.

**Supported Languages:** English, Hindi, Arabic, Tamil, Telugu, Bengali, Urdu (expand per client)

**Key Features:**
- Dual-mode: voice (phone/WebRTC) + text (chat widget/WhatsApp/Telegram)
- Sub-200ms response latency (existing Phi Voice infrastructure)
- Context memory: remembers previous interactions across sessions
- Action execution: CRM updates, ticket creation, refund triggers, booking modifications
- Human handoff: seamless transfer to live agent with full context summary
- CSAT collection: end-of-call satisfaction rating
- Analytics dashboard: resolution rate, handle time, sentiment scores, escalation rate
- Compliance: GDPR (UK/EU), PDPL (UAE), DPDP (India), TCPA (US)

**Tech Stack:**
- Voice infrastructure: LiveKit WebRTC (existing)
- STT: Deepgram Nova-3 (existing) + Whisper Large V3 fallback
- TTS: ElevenLabs or Kokoro (existing)
- LLM: GPT-4o with function calling for action execution
- RAG: Product #10 pipeline for knowledge base grounding
- Telephony: Telnyx (UK/US) + Plivo (India) (existing)
- Frontend: React chat widget (embeddable) + standalone web interface
- Analytics: existing voicebot metrics tables in PostgreSQL

**Extends:** Phi Voice platform (existing production system — configure with customer support persona + domain knowledge base)

**Revenue Model:** Per-conversation ($0.10–0.50) or seat-based SaaS ($50–200/seat/month)  
**Target Markets:** Telecoms, banks, airlines, e-commerce (India, UAE priority)

---

### Product #34 — OpenClaw Managed Deployment

**Category:** Agent Platform  
**Priority:** P0

**What it does:**  
End-to-end OpenClaw AI agent deployment service for businesses — provisioning, configuration, security hardening, tool integration, and ongoing maintenance.

**Service Tiers:**

| Tier | Setup | Monthly | Includes |
|------|-------|---------|----------|
| Starter | £500 | £50 | VPS provisioning, basic config, email triage + calendar agent |
| Professional | £2,000 | £150 | Multi-tool integration, 3 industry skills, security hardening, WhatsApp/Telegram |
| Enterprise | £5,000+ | £500+ | On-premises/private cloud, GDPR compliance, multi-agent architecture, custom skills |

**Deliverables per engagement:**
1. Server provisioning (VPS or client's cloud)
2. Docker deployment + SSL/TLS setup
3. OAuth configuration for required platforms
4. Security hardening (prompt injection guards, rate limiting, access controls)
5. Integration with 3–10 business tools (email, CRM, calendar, Slack, WhatsApp)
6. 2–5 pre-configured skills from ClawHub or custom-built
7. Admin dashboard for monitoring agent activity
8. 30-day support period

**Tech Stack:**
- Platform: OpenClaw (open-source, MIT licence)
- Deployment: Docker + Nginx (existing Phi deployment patterns)
- Hosting: Client's VPS or Phi-managed VPS (Fasthosts, Hetzner, DigitalOcean)
- Monitoring: PM2 + custom health checks
- Security: Rate limiting, API key rotation, prompt injection detection, audit logging

**Revenue Model:** Setup fee + monthly retainer  
**Target Markets:** SMBs, agencies, law firms, real estate firms (UK, India, UAE)

---

### Product #35 — OpenClaw Industry Skill Packs

**Category:** Agent Platform  
**Priority:** P0

**What it does:**  
Pre-built, tested OpenClaw skill bundles for specific industries. Each skill is a Markdown file (skill.md with YAML frontmatter) containing instructions for the agent to interact with tools and APIs.

**Skill Packs to Build:**

**Real Estate Pack** (6 skills):
- Lead follow-up sequences (Zillow/99acres/Bayut integration)
- Property listing generation from photos + details
- Tenant communication management
- Showing scheduling and reminders
- Market comp research and analysis
- Lease document summarisation (integrates with Product #8)

**Legal Pack** (6 skills):
- Case deadline tracking and calendar reminders
- Client intake form processing
- Legal research summaries
- Court filing status monitoring
- Billing time tracking from conversation context
- Document preparation assistance (integrates with Product #10)

**Healthcare/Clinic Pack** (5 skills):
- Appointment scheduling and patient reminders
- Patient intake form processing
- Insurance verification workflow
- Follow-up care reminders
- Lab result notification management

**Agency/Marketing Pack** (5 skills):
- Social media content calendar management
- Client report generation
- Competitor monitoring and alerts
- Content brief generation from client conversations
- SEO analysis automation (weekly reports)

**E-Commerce Pack** (5 skills):
- Order status inquiry handling
- Return/refund processing workflows
- Inventory alert monitoring
- Customer review response drafting
- Abandoned cart follow-up sequences

**Tech Stack:**
- Format: OpenClaw skill.md with YAML frontmatter
- Distribution: ClawHub marketplace listing + direct sale
- Custom integrations: REST API adapters per tool

**Revenue Model:** £200–1,000 per pack (one-time) + natural upsell to Product #34 managed deployment  
**Target Markets:** All 4 markets, sold as standalone or bundled with #34

---

## TIER 2 — Build Next Quarter (Weeks 8–20)

---

### Product #2 — Construction Site Safety & PPE Compliance

**Category:** Computer Vision  
**Priority:** P1

**What it does:**  
Real-time video analysis of construction sites detecting workers without safety equipment. Flags violations, sends alerts, generates compliance reports.

**Detectable PPE Items:**
- Hard hats / helmets
- High-visibility vests
- Safety harnesses
- Gloves
- Safety boots
- Eye protection / goggles

**Key Features:**
- Real-time violation detection with bounding box overlay
- Configurable confidence threshold per PPE type
- Alert channels: email, SMS, WhatsApp, Telegram
- Compliance dashboard: daily/weekly/monthly violation reports with timestamps and screenshots
- Per-worker tracking (optional, privacy-compliant)
- RTSP/RTMP camera stream support
- Edge deployment option: Jetson Orin for on-site inference

**Tech Stack:**
- Detection: YOLOv11 fine-tuned on PPE datasets
- Training data: Roboflow Universe PPE datasets (publicly available, annotated)
- Inference: FastAPI + PyTorch (cloud) or TensorRT (edge/Jetson)
- Alert system: existing notification patterns + WhatsApp Business API
- Frontend: React dashboard with live camera feeds, alert logs, compliance reports
- Storage: R2 for violation screenshots

**Model Training:**
- Base model: YOLOv11-m or YOLOv11-l
- Dataset: CHV (Construction Hazard and Violations), Roboflow hard-hat datasets
- Augmentation: random lighting, blur, occlusion to handle real-world conditions
- Target mAP: >85% at IoU 0.5

**Revenue Model:** £500–2,000/site/month  
**Target Markets:** UAE (construction boom), India (HSE mandates), UK (HSE regulations)

---

### Product #1 — Smart Retail Shelf & Inventory Monitoring

**Category:** Computer Vision  
**Priority:** P1

**What it does:**  
Uses existing CCTV cameras to detect out-of-stock products, misplaced items, planogram compliance violations, and foot traffic heatmaps.

**Key Features:**
- Out-of-stock detection: empty shelf area detection in real time
- Planogram compliance: compare actual shelf state against planogram template
- Misplaced item detection: product in wrong location
- Foot traffic heatmaps: customer dwell time and path analysis
- Restocking alerts: notification when stock below threshold
- Reporting: hourly/daily compliance and stockout reports
- Multi-store dashboard: central view across all locations

**Tech Stack:**
- Detection: YOLOv11 fine-tuned on retail shelf datasets
- Tracking: DeepSort or ByteTrack for person tracking in heatmaps
- Analytics overlays: Roboflow Supervision library
- Camera integration: RTSP stream ingestion
- Shared with Product #2: same YOLO inference service, different model weights

**Revenue Model:** £50–200/camera/month SaaS  
**Target Markets:** Supermarket chains (UAE, India), QSR franchises (UK, US)

---

### Product #6 — Vehicle Damage Assessment for Insurance

**Category:** Computer Vision  
**Priority:** P1

**What it does:**  
Mobile-first tool where users photograph vehicle damage from multiple angles. AI identifies damage type, affected parts, severity, and generates instant cost estimates.

**Key Features:**
- Multi-angle photo guidance: UI prompts user to capture front, rear, sides, close-ups
- Damage classification: dent, scratch, crack, shatter, deformation
- Part identification: bumper, door, bonnet, windscreen, roof, side panel, wheel arch
- Severity scoring: minor / moderate / severe / write-off
- Cost estimation: repair cost range based on part + severity + regional labour rates
- PDF report generation: structured damage assessment with photo evidence
- API for insurance systems: integrate with claims management platforms

**Tech Stack:**
- Detection: YOLOv11 for damage localisation
- Segmentation: SAM 2 (Segment Anything Model 2) for precise damage area
- Classification: EfficientNet fine-tuned on damage type and severity
- Cost model: rule-based lookup table (part × severity × region) + LLM for narrative
- Mobile: React Native (or mobile web PWA)
- Shared with Products #1, #2: YOLO inference service

**Revenue Model:** Per-assessment API ($0.50–5.00) or enterprise licence  
**Target Markets:** Insurance companies, fleet management, car rentals (UAE, India, UK)

---

### Product #13 — AI Meeting Intelligence & Action Tracker

**Category:** LLM & NLP  
**Priority:** P1

**What it does:**  
Records meetings, transcribes in real time, identifies speakers, extracts action items and decisions, then syncs to project management tools.

**Key Features:**
- Recording: browser extension + native app + Zoom/Teams/Meet bot integration
- Speaker diarisation: identify and label multiple speakers
- Real-time transcription with 95%+ accuracy
- AI summary: key topics, decisions, action items, deadlines extracted automatically
- Tool integrations: Jira, Asana, Monday.com, Notion, Slack
- Private-cloud option: on-premises deployment for GDPR (UK) and UAE data localisation
- Search: full-text search across all meeting history

**Tech Stack:**
- STT: Whisper Large V3 (existing Phi Voice infrastructure)
- Speaker diarisation: pyannote/speaker-diarization-3.1
- Summarisation: GPT-4o with structured output
- Action item extraction: LLM with JSON schema enforcement
- Integrations: REST APIs for Jira, Asana, Monday, Notion
- Storage: R2 for audio files, PostgreSQL for transcripts + action items

**Revenue Model:** £15–30/user/month SaaS  
**Target Markets:** Consulting firms, government agencies, corporates (UK, UAE, US)

---

### Product #23 — AI Proposal & RFP Response Generator

**Category:** LLM & NLP  
**Priority:** P1

**What it does:**  
Analyses uploaded RFPs, matches against company capabilities database, and generates tailored proposal drafts with case studies, team profiles, and pricing suggestions.

**Key Features:**
- RFP parsing: extract requirements, evaluation criteria, deadlines, mandatory sections
- Capability matching: RAG over company's past proposals, case studies, team bios
- Auto-draft generation: structured proposal with executive summary, approach, team, pricing
- Compliance matrix: auto-populate RFP compliance checklist
- Template system: customisable proposal templates per industry/client type
- Export: Word DOCX and PDF
- Iteration: human edit + AI re-draft loop

**Tech Stack:**
- RFP parsing: Product #8 document processing pipeline
- Knowledge base: Product #10 RAG over company's capability documents
- Generation: GPT-4o with structured output schemas
- Document export: python-docx + WeasyPrint (PDF)
- Frontend: React editor with tracked changes view

**Revenue Model:** Per-proposal (£5–20) or monthly subscription (£200–500/month)  
**Target Markets:** IT services, consulting, construction (UK, UAE, India)

---

### Product #36 — AI Agent Security Audit & Hardening

**Category:** Agent Platform  
**Priority:** P1 (depends on #34 being established)

**What it does:**  
Security audit of existing AI agent deployments (particularly OpenClaw) checking for vulnerabilities including prompt injection, data exfiltration risks, over-privileged access, malicious skills, and misconfigured infrastructure.

**Audit Checklist:**
- Prompt injection vulnerability testing (automated + manual)
- Malicious skill detection: scan installed ClawHub skills against known-bad signatures
- API key exposure: check for keys in logs, environment files, version control
- Over-privileged access: review OAuth scopes vs actual needs
- Docker security: non-root user, read-only filesystem, network isolation
- Audit trail: verify all agent actions are logged
- Data exfiltration: verify no sensitive data leaks to external endpoints
- GDPR/PDPL compliance: data residency, retention policies

**Deliverables:**
- Written security audit report (executive summary + technical findings)
- Severity-rated findings (Critical/High/Medium/Low)
- Remediation scripts and configuration changes
- Hardened Docker configuration
- Ongoing monitoring setup (alerting on anomalous agent behaviour)

**Tech Stack:**
- Automated scanning: custom Python scripts + Docker Bench for Security
- Prompt injection testing: garak (LLM vulnerability scanner)
- Network analysis: Wireshark/tcpdump for data exfiltration detection
- Reporting: auto-generated PDF report from structured findings

**Revenue Model:** £1,000–5,000 per audit + optional ongoing monitoring retainer  
**Target Markets:** Regulated industries: finance, legal, healthcare (UK, UAE)

---

### Product #37 — Multi-Agent Enterprise Architecture

**Category:** Agent Platform  
**Priority:** P1

**What it does:**  
Enterprise-scale multi-agent systems where 5–20 specialised agents work in parallel — strategy, operations, sales, marketing, finance, HR — sharing memory and handing off tasks with full governance and audit trails.

**Agent Roles (Standard Enterprise Suite):**
- **Strategy Agent:** Planning, prioritisation, cross-team coordination
- **Operations Agent:** Email triage, scheduling, document processing
- **Sales Agent:** Lead research, CRM updates, follow-up sequences, proposal drafting
- **Marketing Agent:** Content creation, competitor monitoring, social posting, SEO analysis
- **Finance Agent:** Invoice processing, expense tracking, reporting, payment reminders
- **HR Agent:** Candidate screening (Product #26), onboarding workflows, policy Q&A

**Key Features:**
- Shared memory: agents share context about key decisions and project state
- Task handoff protocol: structured handoff with context summary between agents
- Parallel execution: agents work simultaneously on independent tasks
- Governance layer: access controls per agent (which tools/data each can touch)
- Full audit trail: every agent action logged with reasoning
- Human escalation: configurable thresholds for human approval
- Built on OpenClaw: leverages 13,000+ ClawHub skills + custom Phi-built skills

**Tech Stack:**
- Foundation: OpenClaw multi-agent mode
- Orchestration: LangGraph for complex agent-to-agent workflows
- Memory: Redis (short-term) + PostgreSQL (long-term / decision log)
- Tool integrations: all major SaaS tools via existing Phi connector library
- Monitoring: custom dashboard showing all agent activity in real time

**Revenue Model:** £50,000–200,000 implementation + £2,000–10,000/month retainer  
**Target Markets:** Mid-to-large enterprises across all 4 markets

---

## TIER 3 — Strategic (3–6 months)

---

### Product #3 — Manufacturing Visual Quality Inspection

**Category:** Computer Vision

**What it does:**  
Real-time production line defect detection — surface defects, dimensional anomalies, colour inconsistencies, assembly errors.

**Key Considerations:**
- Requires physical site visit for camera positioning and line integration
- Custom model training per product type (different defects for PCBs vs textiles vs packaging)
- Edge deployment required for sub-100ms inference on production lines
- Industrial-grade hardware: FLIR cameras, Basler GigE cameras

**Tech Stack:**
- Detection: Anomalib (Intel) for unsupervised anomaly detection (no labelled defect data needed)
- Segmentation: SAM 2 for zero-shot defect localisation
- Edge: NVIDIA Jetson AGX Orin or Intel NUC with OpenVINO
- Integration: OPC-UA/MQTT for PLC/SCADA integration

**Revenue Model:** Per-production-line licence + implementation services  
**Target Markets:** India (Gujarat, Tamil Nadu manufacturing hubs), UK (Midlands), UAE (industrial zones)

---

### Product #32 — Real-Time Speech Translation System

**Category:** Voice AI

**What it does:**  
Real-time bidirectional speech translation for meetings and calls. English ↔ Hindi ↔ Arabic ↔ other languages.

**Key Technical Challenge:** End-to-end latency must be under 500ms for natural conversation flow.

**Tech Stack:**
- STT: Whisper Large V3 (existing)
- Translation: NLLB-200 (Meta, 200 languages) or M2M100
- TTS: Kokoro or ElevenLabs (existing)
- Streaming: WebSocket pipeline for low-latency audio chunking
- Infrastructure: LiveKit (existing)

**Revenue Model:** Per-minute SaaS  
**Target Markets:** UAE (multilingual business environment), India, international call centres

---

### Product #26 — Intelligent CV/Resume Screening

**Category:** LLM & NLP

**What it does:**  
Parses resumes, extracts structured data, matches against job requirements using semantic understanding, and ranks candidates with explainable scoring.

**Tech Stack:**
- Parsing: LLM-based extraction (structured JSON output from raw CV text)
- Matching: embedding-based semantic similarity (OpenAI text-embedding-3 or BGE-M3)
- Scoring: weighted rubric per job requirement
- Bias mitigation: configurable anonymisation (remove name, photo, age, gender before scoring)

**Revenue Model:** Per-hire API pricing  
**Target Markets:** Recruitment agencies, large HR departments (UK, India, UAE)

---

## Implementation Notes for Engineers

### Monorepo Approach
All products should be built as modules within or alongside the existing `phi_intelligence` monorepo pattern:
- Python AI services: FastAPI microservices, Dockerised, exposed via REST
- Frontend: React pages within existing Vite SPA, or separate micro-frontends for product dashboards
- Shared: database schema extensions in `shared/schema.ts`, new tables following existing Drizzle ORM patterns
- Auth: reuse existing `adminAuthMiddleware` and JWT pattern for product admin panels
- Storage: reuse `r2StorageService.ts` for document/image/audio storage

### Environment Variables to Add
```
# Document Processing
PADDLEOCR_LANG=en,hi,ar
LAYOUTLM_MODEL_PATH=...

# RAG Systems
QDRANT_URL=...
QDRANT_API_KEY=...
COHERE_API_KEY=... (for reranking)

# OpenClaw
OPENCLAW_INSTANCE_URL=...
OPENCLAW_ADMIN_TOKEN=...

# Computer Vision
YOLO_MODEL_PATH=...
RTSP_BUFFER_SIZE=...
```

### Database Schema Extensions (Drizzle)
New tables needed (add to `shared/schema.ts`):
- `documents` — uploaded documents with processing status
- `document_extractions` — extracted fields per document
- `rag_knowledge_bases` — per-client RAG configurations
- `rag_queries` — query history + analytics
- `agent_workflows` — workflow definitions
- `agent_executions` — execution logs
- `agent_actions` — individual agent action traces
- `cv_detections` — CV inference results (violations, defects, etc.)
- `product_enquiries` — CRM for product interest leads

### Key Open-Source Repos

| Product | Repo | Stars |
|---------|------|-------|
| YOLOv11 | ultralytics/ultralytics | 40K+ |
| Video analytics | roboflow/supervision | 25K+ |
| Anomaly detection | openvinotoolkit/anomalib | 4K+ |
| RAG | run-llama/llama_index | 38K+ |
| Agent orchestration | langchain-ai/langgraph | 10K+ |
| Multi-agent | crewAIInc/crewAI | 25K+ |
| Document AI | DS4SD/docling | growing |
| OCR | PaddlePaddle/PaddleOCR | 45K+ |
| Speech/STT | openai/whisper | 75K+ |
| Speaker diarisation | pyannote/audio | 6K+ |
| Medical imaging | Project-MONAI/MONAI | 6K+ |
| Segmentation | facebookresearch/segment-anything | 50K+ |
| LLM security testing | NVIDIA/garak | 3K+ |

---

*Phi Intelligence — Internal Product Specifications Document — April 2026*
