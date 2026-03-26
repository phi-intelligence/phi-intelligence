# Phi Intelligence — Full Site Content Audit

> This document details every page's current content: sections, headings, copy, layout, and components.
> Created to plan the complete website redesign.

---

## Table of Contents

1. [Navigation](#navigation)
2. [Footer](#footer)
3. [Home Page](#home-page)
4. [Services Overview](#services-overview)
5. [Service Pages (14)](#service-pages)
6. [Products Page](#products-page)
7. [Product Detail Pages](#product-detail-pages)
8. [About Page](#about-page)
9. [Careers Page](#careers-page)
10. [Blog / Insights Page](#blog--insights-page)
11. [Contact Page](#contact-page)
12. [R&D Lab Page](#rd-lab-page)
13. [Chat Page](#chat-page)
14. [Admin Pages](#admin-pages)
15. [404 Page](#404-page)

---

## Navigation

**Component:** `client/src/components/layout/navigation.tsx`

**Behaviour:** Fixed top bar. Transparent when at top of page → dark background with blur when scrolled.

### Desktop Menu Items

| Item | Type | Links To |
|------|------|----------|
| HOME | Direct link | `/` |
| SERVICES | Dropdown | — |
| → AI/ML Solutions | Sub-link | `/services/ai-ml` |
| → Software Development | Sub-link | `/services/software-development` |
| → IOT Solutions | Sub-link | `/services/iot` |
| → Data Science | Sub-link | `/services/data-science` |
| CAREERS | Direct link | `/careers` |
| BLOG | Direct link | `/blog` |
| COMPANY | Dropdown | — |
| → R&D | Sub-link | `/company/rd` |
| → Contact Us | Sub-link | `/company/contact` |
| → Admin Panel | Sub-link | `/admin/login` |

**Issues:**
- Admin Panel is publicly visible in the navigation
- Only 4 of the 14 service pages are reachable from nav
- PRODUCTS has no nav entry

---

## Footer

**Component:** `client/src/components/layout/footer.tsx`

### Content Columns

**Brand Column:**
- Logo + "Phi Intelligence"
- Tagline: "Industrial intelligence architectures built for the next frontier."
- Social icons: LinkedIn, Twitter, GitHub

**SYSTEMS Column:**
- AI & ML → `/services/ai-ml`
- Industrial IoT → `/services/iot`
- Adaptive Code → `/services/software-development`
- Data Science → `/services/data-science`

**COMPANY Column:**
- About Us → `/about`
- R&D Lab → `/company/rd`
- Careers → `/careers`
- Insights → `/blog`

**CONNECT Column:**
- Email: info@phiintelligence.com
- Phone: 07352745227

**Bottom Bar:**
- © 2026 Phi Intelligence. All rights reserved.
- Privacy Policy | Terms of Service

---

## Home Page

**File:** `client/src/pages/home.tsx`
**Route:** `/`

---

### Section 1 — Hero

**Layout:** 2-column grid (text left, 3D Globe right)

**Heading:** `PHI INTELLIGENCE`

**Subheading / tagline:**
> "Industrial-grade AI solutions engineered for the next generation of business efficiency."

**Chat input:** "Ask Phi AI anything..." (form that navigates to `/chat`)

**CTA Buttons:**
- "Our Services" → `/services`
- "Contact Us" → `/company/contact`

**Visual:** 3D rotating Globe (`Globe.tsx` component)

---

### Section 2 — Manifesto

**Layout:** 2-column (text left, 3D Robot right)

**Section heading:** "Strategy Meets Precision"

**Sub-section: Our Purpose**
> "Phi Intelligence was founded with a singular focus: to eliminate the inefficiency gap between human oversight and machine capability. We design systems that operate where conventional software fails — in dynamic environments requiring adaptive logic, real-time decision-making, and autonomous execution."

**Sub-section: Our Future**
> "The next decade of industrial progress won't be defined by incremental upgrades but by systemic reinvention. We're building the intelligence infrastructure that powers that reinvention — one deployment at a time."

**Visual:** 3D Robot model (Robot3D / robotvoice component)

---

### Section 3 — Phi Voice

**Layout:** 2-column (animation left, text right)

**Section heading:** "Conversational. Agentic."

**Body copy:**
> "Phi Voice agents handle inbound and outbound communication autonomously — capturing leads, booking appointments, and resolving queries without human intervention. Operating across 40+ languages with sub-200ms response latency, our agents integrate with your existing CRM, telephony, and workflow infrastructure."

**Feature points:**
- 24/7 autonomous operation across voice and text channels
- Multilingual support with regional dialect adaptation
- Seamless CRM and calendar integration

**Visual:** Pulsing concentric rings + VoiceBubble component (LiveKit voice animation)

---

### Section 4 — Phi Docs

**Layout:** 2-column (text left, image right)

**Section heading:** "Knowledge Extracted."

**Body copy:**
> "Phi Docs transforms your static document libraries into active intelligence systems. Upload Word documents, Excel files, or PowerPoint presentations and deploy an AI that answers questions, generates summaries, and extracts structured data — without manual processing."

**Feature points:**
- Instant deployment on any document corpus
- Cross-document query resolution
- Structured output generation for downstream systems

**Visual:** phi.jpeg image — grayscale by default, transitions to full colour on hover

---

### Section 5 — Digital Marketing

**Layout:** 2-column (image left, text right)

**Section heading:** "Visibility. Amplified."

**Body copy:**
> "Phi Marketing Intelligence monitors your digital presence, generates optimised content, and schedules distribution across your channels — all driven by real-time performance data and competitive analysis."

**Feature points:**
- AI-generated content tailored to brand voice
- Smart scheduling based on audience behaviour
- Real-time performance monitoring and optimisation

**Visual:** Network/digital image — grayscale on load, full colour on hover

---

### Section 6 — Industrial Intelligence

**Layout:** 2-column (text left, RobotArm animation right)

**Section heading:** "Autonomous Logistics."

**Body copy:**
> "From warehouse floor to production line, Phi's industrial intelligence systems monitor, predict, and respond — reducing downtime, optimising throughput, and flagging anomalies before they escalate."

**Feature points:**
- Real-time production line monitoring
- Predictive maintenance and anomaly detection
- Automated inventory and logistics coordination

**Visual:** RobotArmAnimation 3D component

---

### Section 7 — Final CTA

**Heading:** "START YOUR JOURNEY."

**Button:** "Book a Consultation"

---

## Services Overview

**File:** `client/src/pages/services.tsx`
**Route:** `/services`

### Hero

**Heading:** "SERVICES"
**Subheading:** "Engineered intelligence for the industrial frontier."
**Visual:** ParticleWavesAnimation (full-width background with dark overlay)

### Service Blocks (2 blocks, alternating layout)

**Block 1 — AI & Machine Learning**
- Icon: Brain (Lucide)
- Description: Custom-engineered neural architectures for enterprise environments
- Features listed: Custom Voice Bots | Conversational AI | Agentic Operations
- Button: "Explore"

**Block 2 — Industrial IoT**
- Icon: Cpu (Lucide)
- Description: Connect physical infrastructure with AI-driven ecosystems
- Features listed: Smart Facility Automation | Real-Time Monitoring | IoT Data Dashboards
- Button: "Explore"

**Final CTA:**
- Heading: "Ready to Transform?"
- Button: "Get in touch"

**Note:** Only 2 of 14 services are shown here. The others are only reachable if you know the URL.

---

## Service Pages

All 14 service pages follow the same template:
- Hero: Tag | Large Heading | Subtext | CTA | Visual
- Body: Key Features (6-item 3-col grid) | Capabilities (2-col with CheckCircle bullets) | Industries (4-col grid)

---

### 1. AI/ML Solutions

**Route:** `/services/ai-ml`
**File:** `pages/services/AIMLPage.tsx`

**Tag:** "Core Intelligence"
**Heading:** "AI/ML Solutions."
**Subtext:** "Custom-engineered neural architectures designed for high-throughput enterprise environments."
**CTA:** "Sync with Engineering"

**Section: Voice Agents**
- Features: Low Latency Response | Natural Language Synthesis | CRM Integration
- Visual: Spinning concentric circles + VoiceBubble

**Section: Agentic Ops**
- Features: Self-Optimizing Workflows | Autonomous Scheduling | Real-time Risk Assessment
- Visual: Unsplash image (grayscale → colour on hover)

---

### 2. Software Development

**Route:** `/services/software-development`
**File:** `pages/services/SoftwareDevelopmentPage.tsx`

**Tag:** "Evolutionary Code"
**Heading:** "ADAPTIVE Software."
**Subtext:** "We build self-evolving software ecosystems that optimize performance in real-time."
**CTA:** "Initialize Project"

**Section: AI-Enhanced Web**
- Description: LLM-driven search and predictive behaviour
- Visual: web.gif (grayscale, opacity 20%)

**Section: Intelligent Mobile**
- Description: Native apps with machine learning for voice/image analysis
- Visual: mobile.gif (grayscale, opacity 20%)

---

### 3. Industrial IoT

**Route:** `/services/iot`
**File:** `pages/services/IoTPage.tsx`

**Tag:** "Environment Control"
**Heading:** "INDUSTRIAL IoT."
**Subtext:** "Connect and automate your physical infrastructure with AI-driven ecosystems."
**CTA:** "Request Site Survey"

**Section: Facility Control**
- Features: Centralised Monitoring | Energy Optimization | Automated Security
- Visual: Facility photo (grayscale → colour on hover)

---

### 4. Data Science

**Route:** `/services/data-science`
**File:** `pages/services/DataSciencePage.tsx`

**Tag:** "Information Synthesis"
**Heading:** "DATA Science."
**Subtext:** "Unlock the hidden potential of your organizational data with predictive models and deep-learning analytics."
**CTA:** "Request Data Audit"

**Section: BI With AI**
- Icon: PieChart
- Visual: BI dashboard GIF

**Section: Custom Analytics**
- Icon: BarChart3
- Visual: Analytics dashboard GIF

**Bottom Capabilities:**
Forecasting | Segmentation | Optimization | NLP Analysis

---

### 5. Custom Voice Bots

**Route:** `/services/custom-voice-bots`
**File:** `pages/services/CustomVoiceBotsPage.tsx`

**Tag:** "Vocal Intelligence"
**Heading:** "VOICE Agents."
**Subtext:** "Proprietary vocal synthesis architectures designed for high-precision business automation."
**CTA:** "Deploy Agent"
**Visual:** AudioBarsAnimation (12 animated bars)

**Key Capabilities (6):**
24/7 Response | NLP Engine | Brand Voice | Multi-Channel | Low Latency | Encrypted

**Verticals (4):**
Healthcare | Retail | Hospitality | Logistics

---

### 6. Conversational AI

**Route:** `/services/conversational-ai`
**File:** `pages/services/ConversationalAIPage.tsx`

**Heading:** "Conversational AI"
**Subtitle:** "Intelligent Chatbots & Virtual Assistants"
**CTA:** "Build Your Chatbot" + "Contact for Implementation"
**Visual:** ChatbotMascotAnimation

**Key Features (6):**
Natural Language Processing | Omnichannel Integration | 24/7 Availability | Human Handoff | Instant Responses | Secure & Compliant

**Use Cases:**
- Customer Support: Automated Support | FAQ Management | Issue Resolution | Escalation
- Lead Generation: Qualification | Appointment Booking | Product Recommendations | Follow-up

**Industries:** Healthcare | E-commerce | Hospitality | Automotive

---

### 7. Agentic Software

**Route:** `/services/agentic-software`
**File:** `pages/services/AgenticSoftwarePage.tsx`

**Heading:** "Agentic Software"
**Subtitle:** "Custom AI Software Agents for Your Business"
**CTA:** "Get Started" + "Contact for Implementation"

**Key Capabilities (6):**
Custom AI Development | Process Automation | Intelligent Analytics | Predictive Intelligence | Real-Time Decision Making | Enterprise Integration

**Business Applications:**
- Workforce Management: AI-Powered Scheduling | Performance Analytics | Compliance Automation | Skill Matching
- Business Process Automation: Inventory Management | Customer Service | Financial Analysis | Quality Control

**Industries:** Manufacturing | Retail | Hospitality | Logistics

---

### 8. Smart Homes

**Route:** `/services/smart-homes`
**File:** `pages/services/SmartHomesPage.tsx`

**Heading:** "Smart Home Systems"
**Subtitle:** "AI-Powered Home Automation"
**CTA:** "Get Started" + "View All Services"
**Visual:** Home icon placeholder (no animation)

**Key Features (6):**
Smart Lighting Control | Climate Management | Smart Security | Energy Optimization | Surveillance & Monitoring | Voice Control

**Capabilities:**
- Automation & Control: Automated Routines | Voice Commands | Mobile App Control | Remote Access
- AI Learning: Behavioural Learning | Predictive Analytics | Smart Scheduling | Energy Optimization

**Targets:** Single Family Homes | Apartments | Multi-Family | Luxury Homes

---

### 9. AI Cameras

**Route:** `/services/ai-cameras`
**File:** `pages/services/AICamerasPage.tsx`

**Heading:** "AI-Integrated Security Cameras"
**Subtitle:** "Intelligent Surveillance Systems"
**CTA:** "Get Started" + "View All Services"
**Visual:** Camera icon placeholder (no animation)

**Key Features (6):**
Real-time Analysis | Facial Recognition | Object Detection | Behaviour Analysis | Smart Alerts | Cloud Storage

**Capabilities:**
- Computer Vision: Image Recognition | Motion Tracking | Scene Understanding | Quality Enhancement
- Intelligent Analytics: Predictive Analysis | Pattern Recognition | Risk Assessment | Learning Algorithms

**Industries:** Commercial | Residential | Healthcare | Industrial

---

### 10. Smart Notifications

**Route:** `/services/smart-notifications`
**File:** `pages/services/SmartNotificationsPage.tsx`

**Heading:** "Smart Notification Systems"
**Subtitle:** "Intelligent Alert Management"
**CTA:** "Get Started" + "View All Services"
**Visual:** Bell icon placeholder (no animation)

**Key Features (6):**
AI-Powered Intelligence | Context-Aware Filtering | Priority-Based Alerts | Multi-Channel Delivery | Predictive Warnings | Customizable Rules

**Capabilities:**
- Intelligent Filtering: Behavioural Learning | Time-Based Filtering | Location Awareness | Priority Scoring
- Advanced Features: Smart Aggregation | Escalation Management | Response Tracking | Integration APIs

**Industries:** Enterprise | Smart Homes | Healthcare | Manufacturing

---

### 11. AI Business Intelligence

**Route:** `/services/ai-business-intelligence`
**File:** `pages/services/AIBusinessIntelligencePage.tsx`

**Heading:** "AI Business Intelligence"
**Subtitle:** "Data-Driven Decision Making"
**CTA:** "Get Started" + "View All Services"
**Visual:** BarChart3 icon placeholder (no animation)

**Key Features (6):**
Predictive Analytics | Data Mining | Real-time Analytics | Interactive Dashboards | KPI Monitoring | Natural Language Query

**Capabilities:**
- Advanced Analytics: Machine Learning Models | Anomaly Detection | Sentiment Analysis | Market Forecasting
- Business Intelligence: Automated Reporting | Data Visualisation | Performance Tracking | Strategic Insights

**Industries:** Finance | Retail | Healthcare | Manufacturing

---

### 12. Custom Analytics

**Route:** `/services/custom-analytics`
**File:** `pages/services/CustomAnalyticsPage.tsx`

**Heading:** "Custom Analytics Solutions"
**Subtitle:** "Data-Driven Business Intelligence"
**CTA:** "Get Started" + "View All Services"
**Visual:** PieChart icon placeholder (no animation)

**Key Features (6):**
Custom Dashboards | Data Integration | Real-time Analytics | Advanced Filtering | Automated Reporting | Predictive Insights

**Capabilities:**
- Data Analysis: Statistical Analysis | Trend Analysis | Correlation Studies | Performance Metrics
- Visualisation & Reporting: Interactive Charts | Custom Reports | Data Export | Mobile Access

**Industries:** Finance | Retail | Healthcare | Manufacturing

---

### 13. Web Development

**Route:** `/services/web-development`
**File:** `pages/services/WebDevelopmentPage.tsx`

**Heading:** "AI-Enhanced Web Development"
**Subtitle:** "Intelligent Web Applications"
**CTA:** "Start Your Project" + "Get a Quote"
**Visual:** Design image (scaled 1.75x)

**Key Features (6):**
AI-Powered Chatbots | Personalised Experiences | Intelligent Search | Predictive Analytics | AI Security | Voice Interfaces

**Integration Capabilities:**
- AI Services: LLM Integration | Computer Vision | NLP | Recommendation Engines
- Intelligent Features: Smart Automation | Predictive UX | Intelligent Forms | Adaptive Content

**Technologies:**
Frontend (React, Vue, Angular) | AI & ML (OpenAI, TensorFlow) | Cloud & DevOps (AWS, Docker) | Performance (Webpack, Vite)

**Industries:** E-commerce | Finance | Healthcare | Education

---

### 14. Mobile Development

**Route:** `/services/mobile-development`
**File:** `pages/services/MobileDevelopmentPage.tsx`

**Heading:** "AI-Enhanced Mobile Development"
**Subtitle:** "Intelligent Mobile Applications"
**CTA:** "Start Your App" + "Get a Quote"
**Visual:** mob.gif (grayscale with luminosity blend)

**Key Features (4):**
Computer Vision Integration | Voice & Speech Interfaces | Predictive Analytics | Personalised User Experiences

**Technologies:**
iOS (Swift, SwiftUI, Core ML) | Android (Kotlin, Jetpack, ML Kit) | AI & ML (OpenAI, TensorFlow) | Performance (Firebase, AWS Mobile)

**Industries:** E-commerce | Healthcare | Education | Finance

---

## Products Page

**File:** `client/src/pages/products.tsx`
**Route:** `/products`

**Heading:** "OUR PRODUCTS."
**Subheading:** "Scalable AI platforms built to empower your organizational growth."

### Product 1 — WORKSTREAM
- Icon: Layout
- Tagline: Task automation, team analytics, real-time tracking
- Button: "Get Started" → `/products/workstream`

### Product 2 — VOICEBOT BUILDER
- Icon: Mic
- Tagline: Drag-and-drop logic, multilingual support, CRM integration
- Button: "Get Started" → `/voicebot-dashboard`

**Custom Solutions CTA:**
- Heading: "NEED SOMETHING CUSTOM?"
- Background: White (the only white-background section on the site)
- Button: Enquiry

---

## Product Detail Pages

### Workstream

**File:** `client/src/pages/products/WorkstreamPage.tsx`
**Route:** `/products/workstream`

**Heading:** "Workstream"
**Subtitle:** "Agentic Workforce Management"
**CTA:** "Request Demo" + "View All Products"
**Visual:** Dashboard GIF (animated)

**Key Features (6):**
- Real-time Scheduling
- Attendance Tracking
- Performance Analytics
- Shift Management
- Reporting & Insights
- Mobile Access

**Industries (4):**
Retail | Hospitality | Logistics | Manufacturing

**Bottom CTA:** "Ready to Transform Your Workforce Management?" with "Get Started Today" + "Schedule a Demo"

---

### VoiceBot Builder

**File:** `client/src/pages/products/VoicebotBuilderPage.tsx`
**Route:** `/voicebot-dashboard`

**Heading:** "Custom Voice Agents"
**Feature badges:** "RAG-Powered" | "Voice Interface" | "Company Secure"

**Left Column — Creation Form:**
- Company Name input (required)
- Bot Name input (required, 2–20 chars)
- Company Description textarea (15–100 words recommended)
- File upload area (PDF, DOC, DOCX, TXT, CSV, JSON, XML, HTML)
- "Create Voicebot" button with progress bar (0% → 100%)

**Right Column — Voicebot Interface:**
- Before creation: Inactive 3D Robot + guidance text
- After creation: Bot name | Files count | Knowledge chunks | 3D Robot | Voice Connection Button | Transcript display

---

## About Page

**File:** `client/src/pages/about.tsx`
**Route:** `/about`

### Hero
**Heading:** "About Phi Intelligence"
**Copy:** Mission statement about pioneering business automation

### Mission & Vision (2-col)
- **Mission** (Target icon): "Transforming operations through AI"
- **Vision** (Lightbulb icon): "Seamless AI integration for all business sizes"

### Values (6 cards, 3-col grid)
1. Innovation First (Zap)
2. Reliability (Shield)
3. Customer Success (Users)
4. Global Impact (Globe)
5. Excellence (Award)
6. Continuous Learning (Lightbulb)

### Team Section (2-col)
- Left: 3 bullet points about team expertise
- Button: "Meet Our Team"

### Final CTA
- Heading: "Ready to Transform Your Business?"
- Buttons: "Get Started" | "Explore Solutions"

---

## Careers Page

**File:** `client/src/pages/careers.tsx`
**Route:** `/careers`

### Hero
**Heading:** "JOIN THE MISSION."
**Copy:** "We're building the industrial intelligence layer of the future. Join us in Nottingham or remotely."

### Open Positions
- Live data from `/api/jobs`
- Job cards: badge (type + location) | title | description | "Apply Role" button
- Empty state: Briefcase icon + "No active positions found" + general inquiry link
- Loading: 2 skeleton placeholder cards
- Refresh button (spinning when loading)

### Recruitment Process (3 steps)
1. **Review** — Application review
2. **Sync** — Interview / discussion
3. **Onboard** — Join the team

---

## Blog / Insights Page

**File:** `client/src/pages/blog.tsx`
**Route:** `/blog`

### Hero
**Heading:** "INSIGHTS NETWORK."
**Visual:** NeuralNetworkAnimation (right side, grayscale with black overlay)

### Category Filters
Buttons: All | AI | ML | DL | Research | Industry
- Active: white background
- Refresh button with spinner

### Article Grid (3-column)
- Article cards: image (aspect-[4/5], grayscale → colour hover, scale on hover)
- Fields: source badge | title | excerpt | read time | publish date
- Click → opens external URL
- Loading: 3 skeleton cards
- Error: red message + retry button

**Data source:** `/api/news` (RSS aggregator, updated every 3 hours)

---

## Contact Page

**File:** `client/src/pages/company/ContactPage.tsx`
**Route:** `/company/contact`

### Hero
**Heading:** "CONTACT SALES."

### Layout (2-col)

**Left Column:**
- "Let's Connect" heading
- Contact details:
  - Email: info@phiintelligence.com (Mail icon)
  - Phone: 07352745227 (Phone icon)
  - Address: Nottingham, NG5 3AS, UK (MapPin icon)
- ContactForm component (name, email, company, service, message fields)

**Right Column (sticky):**
- Robot/AI image — grayscale opacity-60 → full colour on hover
- Label: "Global Support v2.0"
- Status: "Live Agents Active" with pulsing green dot

---

## R&D Lab Page

**File:** `client/src/pages/company/RDPage.tsx`
**Route:** `/company/rd`

### Hero (2-col)
**Badge:** "Future Frontier"
**Heading:** "R&D LAB."
**Copy:** "Pushing the boundaries of what AI can do — from pure research to deployable technology."
**CTA:** "Collaborate with Us"
**Visual:** robot-ai.gif (grayscale, opacity-20 → opacity-40 on hover)

### Research Focus Areas (6 cards, 3-col)
1. Natural Language (MessageSquare)
2. Computer Vision (Eye)
3. Autonomous Systems (Bot)
4. Edge Intelligence (Smartphone)
5. AI Ethics & Safety (Shield)
6. Neural Dynamics (Brain)

### Partnerships (3 columns)
- **Academic Ties** (GraduationCap): University partnerships
- **Industry Labs** (Building2): Enterprise collaboration
- **Global Network** (Globe): Distributed research

---

## Chat Page

**File:** `client/src/pages/chat.tsx`
**Route:** `/chat`

**Layout:** Full-screen (no navigation/footer shown)

### Sticky Header
- Back button (←)
- Bot icon + "Phi AI Chat" title
- Action buttons: Clear | Voice (disabled) | Settings (disabled)

### Messages Area (scrollable)
- Messages by role:
  - User: white background, right-aligned
  - AI: white/10 background with border, left-aligned
- Avatar circles
- Timestamps
- Typing indicator: "Phi AI is typing" + 3 bouncing dots

### Sticky Input Bar
- Text input: "Message Phi AI..."
- Send button (disabled when empty)

**Data source:** `ChatbotService` → `/api/chat` → OpenAI GPT-4o-mini

---

## Admin Pages

All admin pages are behind `/admin/*` and protected by JWT auth.

### Admin Login
**Route:** `/admin/login`

- Full-screen dark card, animated gradient background
- Shield icon + "Admin Access" + "Phi Intelligence Management Portal"
- Username + Password (show/hide toggle)
- Error display (red box if login fails)
- "Sign In" button → spins while loading
- Redirects to `/admin/dashboard` on success

---

### Admin Layout
**Route:** `/admin/*` (shell wrapping all admin pages)

**Sidebar (fixed left):**
- Φ logo + "Admin Panel"
- Nav: Dashboard | Contacts | Applications | Job Postings | Settings
- Footer: username + email + Sign Out

**Top Header:** Page title + description dynamically from current route

**Routes inside admin:**
- `/admin/dashboard` → AdminDashboard
- `/admin/contacts` → ContactsTable
- `/admin/applications` → ApplicationsTable
- `/admin/jobs` → JobsTable
- `/admin/settings` → "Coming Soon" placeholder

---

### Admin Dashboard
**Route:** `/admin/dashboard`

**Welcome Banner:** "Welcome back, Admin!" gradient banner

**Stats Grid (6 cards):**
| Metric | Colour | Icon |
|--------|--------|------|
| Total Contacts | Blue | Users |
| Job Applications | Green | FileText |
| Active Jobs | Purple | Briefcase |
| Blog Posts | Orange | BarChart3 |
| Voice Sessions | Indigo | Mic |
| Active Voicebots | Emerald | Bot |

**Recent Activity (left):**
- 5 most recent contacts + applications
- Status icons + badges (new / contacted / qualified / converted)

**Quick Actions (right):**
- Manage Contacts | Manage Job Postings | Review Applications | View Analytics

---

## 404 Page

**File:** `client/src/pages/not-found.tsx`

- Background: gray-50 (light — inconsistent with dark theme)
- Centered card (max-w-md)
- AlertCircle icon (red)
- "404 Page Not Found"
- "Did you forget to add the page to the router?"

**Issue:** Light background breaks dark theme consistency

---

## Design System Summary

### Colours
| Token | Value | Usage |
|-------|-------|-------|
| phi-black | #000 or very dark | Page backgrounds |
| phi-white | #fff | Text, borders |
| phi-gray | mid-gray | Icons, borders, secondary |
| phi-light | light gray | Active nav states |
| white/5 | 5% white opacity | Dividers |
| white/10 | 10% white opacity | Card backgrounds |
| white/20 | 20% white opacity | Hover borders |

### Typography
- Headings: Bold, uppercase, 6xl–9xl, tracking-tighter
- Body: Regular weight, opacity-60
- Tags: Uppercase, letter-spaced, opacity-40

### Animation Library in Use
| Animation | Component | Used On |
|-----------|-----------|---------|
| 3D Globe | Globe.tsx | Home hero |
| 3D Robot | Robot3D.tsx / robotvoice.tsx | Home manifesto |
| Robot Arm | RobotArmAnimation.tsx | Home industrial section |
| Particle Waves | ParticleWavesAnimation.tsx | Services hero |
| Neural Network | NeuralNetworkAnimation.tsx | Blog hero |
| Advanced Network | AdvancedNetworkAnimation.tsx | — |
| Chatbot Mascot | ChatbotMascotAnimation.tsx | Conversational AI page |
| Audio Bars | AudioBarsAnimation.tsx | Voice Bots page |
| IDE Animation | IDEAnimation.tsx | — |
| Cube Grid | CubeGridAnimation.tsx | — |
| ANN Animation | ANNAnimation.tsx | — |
| Voice Bubble | VoiceBubble.tsx | Home voice section, AI/ML page |

### Layout Patterns
- Container: `max-w-7xl mx-auto px-6`
- Section padding: `py-24` or `py-32`
- 2-column grid: `grid lg:grid-cols-2 gap-16`
- 3-column grid: `grid md:grid-cols-3 gap-8`
- 4-column grid: `grid md:grid-cols-4 gap-6`
- Alternating left/right content blocks throughout service pages

---

*Last updated: 2026-03-24*
