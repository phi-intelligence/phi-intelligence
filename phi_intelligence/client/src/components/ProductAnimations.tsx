/**
 * ProductAnimations.tsx
 * Lightweight SVG + Framer Motion mini-animations for each product card.
 * Each component fits in a 280×140 viewBox, dark theme, category-coloured accents.
 */

import { useId } from "react";
import { motion } from "framer-motion";

/* ── shared helpers ──────────────────────────────────────────────────────── */
const inf = { repeat: Infinity, ease: "linear" as const };
const infEase = { repeat: Infinity, ease: "easeInOut" as const };

function Wrapper({ children }: { children: React.ReactNode }) {
  const uid = useId();
  const pid = `dots${uid.replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 280 140"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* subtle dot grid — unique pattern ID per instance */}
      <pattern id={pid} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,0.06)" />
      </pattern>
      <rect width="280" height="140" fill={`url(#${pid})`} />
      {children}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LLM & NLP
═══════════════════════════════════════════════════════════════════════════ */

/** #8 – Document Processing Engine */
export function DocProcessingAnim() {
  const lines = [28, 38, 48, 58, 68, 78, 88];
  return (
    <Wrapper>
      {/* document */}
      <rect x="30" y="20" width="90" height="100" rx="4" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <rect x="30" y="20" width="90" height="14" rx="4" fill="rgba(139,92,246,0.15)" />
      <text x="42" y="30" fontSize="6" fill="rgba(139,92,246,0.7)" fontFamily="monospace">INVOICE.PDF</text>
      {lines.map((y, i) => (
        <motion.rect
          key={y} x="42" y={y} height="4" rx="1.5"
          initial={{ width: 0, fill: "rgba(255,255,255,0.08)" }}
          animate={{ width: [0, 60, 60], fill: ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.08)", i < 4 ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.08)"] }}
          transition={{ duration: 2, delay: i * 0.25, ...infEase, repeatDelay: 1.5 }}
        />
      ))}
      {/* scan line */}
      <motion.rect x="30" y="20" width="90" height="1.5" fill="rgba(139,92,246,0.6)"
        animate={{ y: [20, 118, 20] }}
        transition={{ duration: 3, ...inf, repeatDelay: 0.5 }}
      />
      {/* extracted JSON panel */}
      <rect x="140" y="20" width="110" height="100" rx="4" fill="rgba(139,92,246,0.05)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
      <text x="148" y="32" fontSize="5.5" fill="rgba(139,92,246,0.6)" fontFamily="monospace">EXTRACTED</text>
      {[
        ["vendor:", "#A78BFA"],
        ["amount:", "#A78BFA"],
        ["date:", "#A78BFA"],
        ["items:", "#A78BFA"],
        ["tax:", "#A78BFA"],
      ].map(([label, color], i) => (
        <motion.g key={label}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.8 + i * 0.35, duration: 0.4, ...infEase, repeatDelay: 3.5 }}
        >
          <text x="148" y={44 + i * 14} fontSize="5.5" fill="rgba(255,255,255,0.35)" fontFamily="monospace">{label}</text>
          <rect x="178" y={38 + i * 14} width={28 + (i % 3) * 8} height="5" rx="1.5" fill={`${color}33`} />
        </motion.g>
      ))}
      {/* confidence */}
      <text x="148" y="114" fontSize="5" fill="rgba(139,92,246,0.5)" fontFamily="monospace">confidence: 97.4%</text>
    </Wrapper>
  );
}

/** #10 – Domain-Specific RAG */
export function RAGSystemsAnim() {
  return (
    <Wrapper>
      {/* DB cylinder */}
      <ellipse cx="38" cy="50" rx="22" ry="8" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.2" />
      <rect x="16" y="50" width="44" height="28" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.2" />
      <ellipse cx="38" cy="78" rx="22" ry="8" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.2" />
      <text x="27" y="67" fontSize="5.5" fill="rgba(139,92,246,0.7)" fontFamily="monospace">VECTOR</text>
      <text x="29" y="74" fontSize="5.5" fill="rgba(139,92,246,0.7)" fontFamily="monospace">STORE</text>

      {/* floating chunk nodes */}
      {[[110, 30], [118, 55], [108, 80], [130, 42], [125, 70]].map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r="6"
          fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.4)" strokeWidth="1"
          animate={{ opacity: [0.4, 1, 0.4], r: [6, 7.5, 6] }}
          transition={{ duration: 1.8, delay: i * 0.3, ...infEase }}
        />
      ))}

      {/* traveling query dot DB→chunks */}
      <motion.circle r="3" fill="#8B5CF6"
        animate={{ cx: [60, 110], cy: [64, 55], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.6, ...inf, repeatDelay: 1 }}
      />

      {/* LLM box */}
      <rect x="175" y="38" width="72" height="44" rx="6" fill="rgba(139,92,246,0.1)" stroke="rgba(139,92,246,0.35)" strokeWidth="1.2" />
      <text x="195" y="57" fontSize="6.5" fill="rgba(139,92,246,0.8)" fontFamily="monospace">LLM</text>
      <text x="184" y="69" fontSize="5" fill="rgba(255,255,255,0.3)" fontFamily="monospace">REASONING</text>

      {/* traveling dot chunks→LLM */}
      <motion.circle r="3" fill="#A78BFA"
        animate={{ cx: [130, 175], cy: [55, 60], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.4, delay: 1.8, ...inf, repeatDelay: 0.8 }}
      />

      {/* answer arrow */}
      <motion.path d="M247 60 L265 60" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5" strokeLinecap="round"
        animate={{ strokeDashoffset: [0, -10] }}
        transition={{ duration: 0.8, ...inf }}
        strokeDasharray="4 3"
      />
      <text x="250" y="75" fontSize="5" fill="rgba(139,92,246,0.5)" fontFamily="monospace">ANSWER</text>

      {/* query label */}
      <text x="22" y="98" fontSize="5" fill="rgba(255,255,255,0.25)" fontFamily="monospace">"How does X apply?"</text>
    </Wrapper>
  );
}

/** #11 – Contract Analysis */
export function ContractAnalysisAnim() {
  const clauses = [
    { y: 35, w: 70, label: "Indemnity", color: "#F43F5E" },
    { y: 52, w: 55, label: "IP Rights", color: "#F59E0B" },
    { y: 69, w: 65, label: "Liability", color: "#F43F5E" },
    { y: 86, w: 50, label: "Termination", color: "#10B981" },
    { y: 103, w: 60, label: "", color: "transparent" },
  ];
  return (
    <Wrapper>
      {/* contract doc */}
      <rect x="20" y="18" width="120" height="106" rx="4" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
      <rect x="20" y="18" width="120" height="12" rx="4" fill="rgba(251,191,36,0.12)" />
      <text x="32" y="27" fontSize="6" fill="rgba(251,191,36,0.6)" fontFamily="monospace">CONTRACT.PDF</text>
      {/* paragraph lines */}
      {[33, 40, 47].map((y, i) => <rect key={i} x="30" y={y} width={85 - i * 8} height="3.5" rx="1" fill="rgba(255,255,255,0.07)" />)}
      {clauses.map((c, i) => (
        <motion.g key={i}
          initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.2, delay: i * 0.6, ...infEase }}
        >
          <rect x="30" y={c.y} width={c.w} height="5" rx="1.5" fill={`${c.color}28`} stroke={`${c.color}60`} strokeWidth="0.8" />
          {c.label && <text x={32} y={c.y + 3.8} fontSize="4.5" fill={`${c.color}cc`} fontFamily="sans-serif">{c.label}</text>}
        </motion.g>
      ))}
      {/* risk panel */}
      <rect x="158" y="18" width="104" height="106" rx="4" fill="rgba(251,191,36,0.04)" stroke="rgba(251,191,36,0.2)" strokeWidth="1" />
      <text x="168" y="32" fontSize="6" fill="rgba(251,191,36,0.6)" fontFamily="monospace">RISK SCORE</text>
      <motion.text x="176" y="65" fontSize="28" fill="rgba(251,191,36,0.85)" fontFamily="monospace" fontWeight="bold"
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, ...infEase }}
      >72</motion.text>
      <text x="208" y="65" fontSize="10" fill="rgba(251,191,36,0.5)" fontFamily="monospace">/100</text>
      <text x="168" y="78" fontSize="5.5" fill="rgba(241,163,49,0.6)" fontFamily="sans-serif">MEDIUM-HIGH</text>
      <text x="168" y="90" fontSize="5" fill="rgba(244,63,94,0.7)" fontFamily="sans-serif">⚠ 2 critical clauses</text>
      <text x="168" y="101" fontSize="5" fill="rgba(245,158,11,0.7)" fontFamily="sans-serif">⚠ 1 unusual term</text>
      <text x="168" y="112" fontSize="5" fill="rgba(16,185,129,0.7)" fontFamily="sans-serif">✓ Termination: standard</text>
    </Wrapper>
  );
}

/** #13 – Meeting Intelligence */
export function MeetingIntelAnim() {
  const bars = [8, 14, 10, 18, 12, 20, 9, 16, 11, 17, 13, 7, 19, 10, 15];
  const lines = [
    "Alex: Q3 revenue target confirmed",
    "Action: Sarah to send report by Fri",
    "Decision: Launch date moved to May 12",
    "Action: Dev team to review API docs",
  ];
  return (
    <Wrapper>
      {/* waveform */}
      <text x="12" y="18" fontSize="5.5" fill="rgba(6,182,212,0.5)" fontFamily="monospace">LIVE TRANSCRIPT</text>
      <g transform="translate(12, 22)">
        {bars.map((h, i) => (
          <motion.rect key={i} x={i * 16} y={22 - h / 2} width="10" height={h} rx="2"
            fill="rgba(6,182,212,0.5)"
            animate={{ height: [h, h * 1.4, h * 0.7, h], y: [22 - h / 2, 22 - (h * 1.4) / 2, 22 - (h * 0.7) / 2, 22 - h / 2] }}
            transition={{ duration: 1.2, delay: i * 0.08, ...infEase }}
          />
        ))}
      </g>
      {/* transcript lines */}
      {lines.map((line, i) => (
        <motion.g key={i}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: [0, 1, 1, 0], x: [-10, 0, 0, 0] }}
          transition={{ duration: 5, delay: i * 1.3, ...inf, repeatDelay: 0.2 }}
        >
          <rect x="12" y={57 + i * 18} width={line.length * 3.5} height="12" rx="3"
            fill={i % 2 === 0 ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.05)"}
            stroke={i % 2 === 0 ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.08)"} strokeWidth="0.8"
          />
          <text x="17" y={65 + i * 18} fontSize="5" fill={i === 1 || i === 3 ? "rgba(6,182,212,0.8)" : "rgba(255,255,255,0.5)"} fontFamily="monospace">
            {i === 1 || i === 3 ? "⬡ " : ""}{line}
          </text>
        </motion.g>
      ))}
    </Wrapper>
  );
}

/** #23 – RFP Generator */
export function RFPGeneratorAnim() {
  const docLines = [
    { text: "EXECUTIVE SUMMARY", color: "rgba(16,185,129,0.8)", bold: true },
    { text: "Phi Intelligence proposes a", color: "rgba(255,255,255,0.4)" },
    { text: "tailored AI solution for...", color: "rgba(255,255,255,0.4)" },
    { text: "TECHNICAL APPROACH", color: "rgba(16,185,129,0.8)", bold: true },
    { text: "Phase 1: Discovery & Data", color: "rgba(255,255,255,0.4)" },
    { text: "Phase 2: Model Training", color: "rgba(255,255,255,0.4)" },
    { text: "Phase 3: Deployment", color: "rgba(255,255,255,0.4)" },
    { text: "PRICING", color: "rgba(16,185,129,0.8)", bold: true },
  ];
  return (
    <Wrapper>
      <rect x="20" y="14" width="240" height="112" rx="5" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.2)" strokeWidth="1" />
      <rect x="20" y="14" width="240" height="13" rx="5" fill="rgba(16,185,129,0.12)" />
      <text x="30" y="23.5" fontSize="6" fill="rgba(16,185,129,0.7)" fontFamily="monospace">PROPOSAL_DRAFT.DOCX — generating...</text>
      {docLines.map((l, i) => (
        <motion.text key={i} x="30" y={38 + i * 12} fontSize={l.bold ? "6" : "5.5"}
          fill={l.color} fontFamily="monospace" fontWeight={l.bold ? "bold" : "normal"}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: i * 0.4, duration: 0.3, ...infEase, repeatDelay: 4 }}
        >{l.text}</motion.text>
      ))}
      {/* blinking cursor */}
      <motion.rect x="30" y="129" width="5" height="8" rx="1" fill="rgba(16,185,129,0.8)"
        animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, ...inf }}
      />
      {/* progress bar */}
      <rect x="20" y="120" width="240" height="5" rx="2" fill="rgba(16,185,129,0.08)" />
      <motion.rect x="20" y="120" width="0" height="5" rx="2" fill="rgba(16,185,129,0.5)"
        animate={{ width: [0, 240, 0] }} transition={{ duration: 5, ...inf, repeatDelay: 0.5 }}
      />
    </Wrapper>
  );
}

/** #26 – CV Screening */
export function CVScreeningAnim() {
  const cvs = [
    { score: 94, name: "A. Patel", role: "ML Engineer", color: "#10B981", top: true },
    { score: 87, name: "J. Smith", role: "AI Researcher", color: "#10B981", top: false },
    { score: 71, name: "L. Chen", role: "Data Scientist", color: "#F59E0B", top: false },
    { score: 54, name: "M. Ahmed", role: "Software Eng", color: "#F43F5E", top: false },
  ];
  return (
    <Wrapper>
      <text x="14" y="16" fontSize="5.5" fill="rgba(16,185,129,0.5)" fontFamily="monospace">CANDIDATES RANKED  •  247 CVs processed</text>
      {cvs.map((cv, i) => (
        <motion.g key={i}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.3, duration: 0.5, ...infEase, repeatDelay: 3.5 }}
        >
          <rect x="14" y={24 + i * 27} width="252" height="22" rx="4"
            fill={cv.top ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)"}
            stroke={cv.top ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"} strokeWidth="0.8"
          />
          {/* rank */}
          <text x="22" y={38 + i * 27} fontSize="7" fill="rgba(255,255,255,0.2)" fontFamily="monospace">#{i + 1}</text>
          {/* name + role */}
          <text x="42" y={34 + i * 27} fontSize="6" fill="rgba(255,255,255,0.7)" fontFamily="monospace">{cv.name}</text>
          <text x="42" y={42 + i * 27} fontSize="5" fill="rgba(255,255,255,0.3)" fontFamily="monospace">{cv.role}</text>
          {/* score bar */}
          <rect x="150" y={32 + i * 27} width="80" height="5" rx="2" fill="rgba(255,255,255,0.06)" />
          <motion.rect x="150" y={32 + i * 27} width={0} height="5" rx="2" fill={cv.color}
            animate={{ width: [0, cv.score * 0.8, cv.score * 0.8, 0] }}
            transition={{ delay: i * 0.3 + 0.3, duration: 3.5, ...infEase, repeatDelay: 1 }}
            style={{ opacity: 0.7 }}
          />
          {/* score badge */}
          <text x="238" y={37 + i * 27} fontSize="6.5" fill={cv.color} fontFamily="monospace" fontWeight="bold">{cv.score}%</text>
        </motion.g>
      ))}
    </Wrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPUTER VISION
═══════════════════════════════════════════════════════════════════════════ */

/** #1 – Retail Shelf Monitoring */
export function RetailShelfAnim() {
  const slots = [
    [true, false, true, true],
    [true, true, false, true],
    [true, true, true, false],
  ];
  return (
    <Wrapper>
      <text x="14" y="16" fontSize="5.5" fill="rgba(59,130,246,0.5)" fontFamily="monospace">SHELF MONITOR  •  CAM-04  •  LIVE</text>
      {/* shelf lines */}
      {[0, 1, 2].map(row => (
        <g key={row}>
          <rect x="14" y={23 + row * 36} width="252" height="1.5" fill="rgba(255,255,255,0.1)" />
          {slots[row].map((filled, col) => (
            <motion.g key={col}
              animate={{ opacity: filled ? 1 : [1, 0.3, 1] }}
              transition={{ duration: 2, delay: row * 0.8 + col * 0.4, ...infEase }}
            >
              <rect x={20 + col * 62} y={28 + row * 36} width="52" height="22" rx="3"
                fill={filled ? "rgba(59,130,246,0.12)" : "rgba(244,63,94,0.08)"}
                stroke={filled ? "rgba(59,130,246,0.3)" : "rgba(244,63,94,0.4)"} strokeWidth="1"
              />
              {filled ? (
                <>
                  <rect x={26 + col * 62} y={33 + row * 36} width="10" height="12" rx="2" fill="rgba(59,130,246,0.3)" />
                  <rect x={38 + col * 62} y={35 + row * 36} width="8" height="10" rx="2" fill="rgba(59,130,246,0.2)" />
                  <rect x={48 + col * 62} y={32 + row * 36} width="12" height="13" rx="2" fill="rgba(59,130,246,0.25)" />
                </>
              ) : (
                <motion.text x={30 + col * 62} y={41 + row * 36} fontSize="7"
                  fill="rgba(244,63,94,0.8)" fontFamily="monospace"
                  animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2, ...inf }}
                >EMPTY</motion.text>
              )}
            </motion.g>
          ))}
        </g>
      ))}
      {/* heatmap legend */}
      <text x="14" y="133" fontSize="5" fill="rgba(255,255,255,0.2)" fontFamily="monospace">3 out-of-stock alerts  •  planogram compliance: 91%</text>
    </Wrapper>
  );
}

/** #2 – PPE Compliance */
export function PPEComplianceAnim() {
  return (
    <Wrapper>
      <text x="14" y="16" fontSize="5.5" fill="rgba(248,113,113,0.6)" fontFamily="monospace">SITE CAM-02  •  REAL-TIME ANALYSIS</text>
      {/* worker silhouette */}
      <circle cx="140" cy="42" r="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <rect x="128" y="56" width="24" height="32" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <rect x="120" y="60" width="10" height="22" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <rect x="150" y="60" width="10" height="22" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <rect x="131" y="88" width="8" height="24" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <rect x="141" y="88" width="8" height="24" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

      {/* detection boxes */}
      {/* helmet — OK */}
      <motion.rect x="124" y="28" width="32" height="28" rx="3" fill="none"
        stroke="rgba(16,185,129,0.9)" strokeWidth="1.5"
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, ...infEase }}
      />
      <rect x="124" y="28" width="32" height="9" rx="2" fill="rgba(16,185,129,0.15)" />
      <text x="126" y="35" fontSize="4.5" fill="rgba(16,185,129,0.9)" fontFamily="monospace">✓ HELMET</text>

      {/* vest — MISSING */}
      <motion.rect x="114" y="54" width="52" height="36" rx="3" fill="none"
        stroke="rgba(244,63,94,0.9)" strokeWidth="1.5"
        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, delay: 0.3, ...infEase }}
      />
      <rect x="114" y="54" width="52" height="9" rx="2" fill="rgba(244,63,94,0.12)" />
      <text x="116" y="61" fontSize="4.5" fill="rgba(244,63,94,0.9)" fontFamily="monospace">✗ NO HI-VIS VEST</text>

      {/* alert panel */}
      <motion.rect x="14" y="100" width="120" height="30" rx="4"
        fill="rgba(244,63,94,0.08)" stroke="rgba(244,63,94,0.3)" strokeWidth="1"
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, ...infEase }}
      />
      <text x="22" y="113" fontSize="6" fill="rgba(244,63,94,0.9)" fontFamily="monospace">⚠ VIOLATION</text>
      <text x="22" y="123" fontSize="5" fill="rgba(244,63,94,0.6)" fontFamily="monospace">Supervisor alerted  •  CAM-02</text>

      {/* stats */}
      <text x="170" y="113" fontSize="5.5" fill="rgba(16,185,129,0.7)" fontFamily="monospace">Today: 3 violations</text>
      <text x="170" y="123" fontSize="5.5" fill="rgba(255,255,255,0.3)" fontFamily="monospace">Compliance: 94.2%</text>
    </Wrapper>
  );
}

/** #6 – Vehicle Damage Assessment */
export function VehicleDamageAnim() {
  const damages = [
    { cx: 80, cy: 45, label: "DENT", color: "#F43F5E", severity: "Moderate" },
    { cx: 195, cy: 55, label: "SCRATCH", color: "#F59E0B", severity: "Minor" },
    { cx: 140, cy: 100, label: "CRACK", color: "#F43F5E", severity: "Severe" },
  ];
  return (
    <Wrapper>
      <text x="14" y="16" fontSize="5.5" fill="rgba(59,130,246,0.5)" fontFamily="monospace">DAMAGE ASSESSMENT  •  4 PHOTOS ANALYSED</text>
      {/* car top-view outline */}
      <rect x="60" y="28" width="160" height="85" rx="16" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      {/* windscreens */}
      <rect x="75" y="30" width="130" height="20" rx="8" fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
      <rect x="75" y="92" width="130" height="20" rx="8" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
      {/* wheels */}
      {[[56, 40], [184, 40], [56, 83], [184, 83]].map(([cx, cy], i) => (
        <rect key={i} x={cx} y={cy} width="12" height="18" rx="4" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      ))}
      {/* damage spots */}
      {damages.map((d, i) => (
        <motion.g key={i}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, delay: i * 0.5, ...infEase }}
        >
          <circle cx={d.cx} cy={d.cy} r="9" fill={`${d.color}30`} stroke={d.color} strokeWidth="1.5" />
          <text x={d.cx - 10} y={d.cy + 2} fontSize="4.5" fill={d.color} fontFamily="monospace">{d.label}</text>
        </motion.g>
      ))}
      {/* estimate */}
      <rect x="14" y="120" width="252" height="16" rx="3" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.15)" strokeWidth="0.8" />
      <text x="22" y="130" fontSize="5.5" fill="rgba(255,255,255,0.5)" fontFamily="monospace">Est. repair cost: </text>
      <text x="95" y="130" fontSize="5.5" fill="rgba(59,130,246,0.9)" fontFamily="monospace">£1,240 – £1,890</text>
      <text x="170" y="130" fontSize="5" fill="rgba(255,255,255,0.25)" fontFamily="monospace">•  Report generated in 2.1s</text>
    </Wrapper>
  );
}

/** #3 – Manufacturing QC */
export function ManufacturingQCAnim() {
  return (
    <Wrapper>
      <text x="14" y="16" fontSize="5.5" fill="rgba(59,130,246,0.5)" fontFamily="monospace">PRODUCTION LINE  •  LIVE INSPECTION</text>
      {/* conveyor belt */}
      <rect x="14" y="58" width="252" height="30" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {/* belt lines */}
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <motion.rect key={i} x={14 + i * 42} y="58" width="2" height="30" rx="1" fill="rgba(255,255,255,0.06)"
          animate={{ x: [14 + i * 42, 14 + (i + 1) * 42] }}
          transition={{ duration: 2, ...inf }}
        />
      ))}
      {/* moving items */}
      {[0, 1, 2, 3].map(i => (
        <motion.g key={i}
          animate={{ x: [-60 + i * 70, 266] }}
          transition={{ duration: 4.5, delay: i * 1.1, ...inf }}
        >
          <rect x={0} y="64" width="34" height="18" rx="3"
            fill={i === 1 ? "rgba(244,63,94,0.2)" : "rgba(59,130,246,0.15)"}
            stroke={i === 1 ? "rgba(244,63,94,0.7)" : "rgba(59,130,246,0.3)"} strokeWidth="1.2"
          />
          {i === 1 && (
            <motion.text x="2" y="76" fontSize="6" fill="rgba(244,63,94,0.9)" fontFamily="monospace"
              animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.6, ...inf }}
            >✗</motion.text>
          )}
        </motion.g>
      ))}
      {/* camera cone */}
      <path d="M134 14 L100 58 L168 58 Z" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
      <rect x="124" y="8" width="32" height="16" rx="4" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
      <text x="128" y="18" fontSize="5.5" fill="rgba(59,130,246,0.9)" fontFamily="monospace">CAM</text>

      {/* defect alert */}
      <motion.rect x="14" y="100" width="140" height="30" rx="4"
        fill="rgba(244,63,94,0.08)" stroke="rgba(244,63,94,0.3)" strokeWidth="1"
        animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 2.5, delay: 2, ...inf, repeatDelay: 2 }}
      />
      <motion.text x="24" y="113" fontSize="6" fill="rgba(244,63,94,0.9)" fontFamily="monospace"
        animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 2.5, delay: 2, ...inf, repeatDelay: 2 }}
      >DEFECT DETECTED</motion.text>
      <motion.text x="24" y="123" fontSize="5" fill="rgba(244,63,94,0.6)" fontFamily="monospace"
        animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 2.5, delay: 2, ...inf, repeatDelay: 2 }}
      >PCB surface anomaly  •  confidence 98.4%</motion.text>

      {/* stats */}
      <text x="170" y="112" fontSize="5.5" fill="rgba(16,185,129,0.7)" fontFamily="monospace">Yield rate: 99.1%</text>
      <text x="170" y="122" fontSize="5" fill="rgba(255,255,255,0.3)" fontFamily="monospace">12,450 units today</text>
    </Wrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VOICE AI
═══════════════════════════════════════════════════════════════════════════ */

/** #12 – Multilingual Customer Support */
export function CustomerSupportAnim() {
  const messages = [
    { text: "My order hasn't arrived", lang: "EN", from: "user" },
    { text: "मैं आपकी सहायता करूँगा", lang: "HI", from: "agent" },
    { text: "Order #4821 dispatched today", lang: "EN", from: "agent" },
    { text: "شكراً، متى يصل؟", lang: "AR", from: "user" },
    { text: "Delivery by Thursday 3pm", lang: "EN", from: "agent" },
  ];
  return (
    <Wrapper>
      {/* header */}
      <rect x="14" y="10" width="252" height="18" rx="4" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.2)" strokeWidth="0.8" />
      <circle cx="24" cy="19" r="5" fill="rgba(6,182,212,0.3)" />
      <motion.circle cx="24" cy="19" r="5" fill="none" stroke="rgba(6,182,212,0.6)" strokeWidth="1"
        animate={{ r: [5, 9, 5], opacity: [0.8, 0, 0.8] }} transition={{ duration: 2, ...infEase }}
      />
      <text x="34" y="21" fontSize="6" fill="rgba(6,182,212,0.8)" fontFamily="monospace">PHI SUPPORT AGENT  •  LIVE</text>
      <text x="218" y="21" fontSize="5" fill="rgba(16,185,129,0.7)" fontFamily="monospace">0.18s</text>

      {/* messages */}
      {messages.map((m, i) => (
        <motion.g key={i}
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 4, delay: i * 1.0, ...inf, repeatDelay: 0.5 }}
        >
          <rect
            x={m.from === "user" ? 14 : 80} y={32 + i * 20}
            width={160} height="14" rx="4"
            fill={m.from === "agent" ? "rgba(6,182,212,0.1)" : "rgba(255,255,255,0.05)"}
            stroke={m.from === "agent" ? "rgba(6,182,212,0.25)" : "rgba(255,255,255,0.08)"} strokeWidth="0.8"
          />
          <text x={m.from === "user" ? 20 : 86} y={41 + i * 20} fontSize="5.5"
            fill={m.from === "agent" ? "rgba(6,182,212,0.9)" : "rgba(255,255,255,0.6)"} fontFamily="monospace">
            {m.text}
          </text>
          <text x={m.from === "user" ? 184 : 250} y={41 + i * 20} fontSize="4.5" fill="rgba(255,255,255,0.2)" fontFamily="monospace">{m.lang}</text>
        </motion.g>
      ))}
    </Wrapper>
  );
}

/** #32 – Speech Translation */
export function SpeechTranslationAnim() {
  const w1 = [8, 14, 6, 18, 10, 20, 7, 16, 12, 9, 17, 11, 15, 8, 13];
  const w2 = [10, 12, 8, 16, 14, 18, 9, 20, 7, 15, 11, 13, 17, 6, 12];
  return (
    <Wrapper>
      {/* Left - input language */}
      <rect x="14" y="20" width="100" height="100" rx="6" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
      <text x="32" y="35" fontSize="6.5" fill="rgba(6,182,212,0.7)" fontFamily="monospace">ENGLISH</text>
      <text x="24" y="44" fontSize="5" fill="rgba(255,255,255,0.25)" fontFamily="monospace">Source audio</text>
      {w1.map((h, i) => (
        <motion.rect key={i} x={20 + i * 6} y={70 - h / 2} width="4" height={h} rx="1"
          fill="rgba(6,182,212,0.5)"
          animate={{ height: [h, h * 1.5, h * 0.6, h], y: [70 - h / 2, 70 - (h * 1.5) / 2, 70 - (h * 0.6) / 2, 70 - h / 2] }}
          transition={{ duration: 1.4, delay: i * 0.07, ...infEase }}
        />
      ))}

      {/* arrow + translation indicator */}
      <motion.g animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, ...infEase }}>
        <path d="M122 70 L158 70" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="3 2" />
        <path d="M154 65 L160 70 L154 75" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      </motion.g>
      <rect x="116" y="55" width="48" height="16" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
      <text x="124" y="63" fontSize="5.5" fill="rgba(255,255,255,0.3)" fontFamily="monospace">AI TRANSLATE</text>
      <motion.circle cx="140" cy="82" r="3" fill="rgba(255,255,255,0.4)"
        animate={{ cx: [122, 158], opacity: [0, 1, 0] }} transition={{ duration: 1.5, ...inf, repeatDelay: 0.3 }}
      />

      {/* Right - output language */}
      <rect x="166" y="20" width="100" height="100" rx="6" fill="rgba(139,92,246,0.06)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
      <text x="185" y="35" fontSize="6.5" fill="rgba(139,92,246,0.7)" fontFamily="monospace">ARABIC</text>
      <text x="175" y="44" fontSize="5" fill="rgba(255,255,255,0.25)" fontFamily="monospace">Translated audio</text>
      {w2.map((h, i) => (
        <motion.rect key={i} x={172 + i * 6} y={70 - h / 2} width="4" height={h} rx="1"
          fill="rgba(139,92,246,0.5)"
          animate={{ height: [h, h * 1.3, h * 0.7, h] }}
          transition={{ duration: 1.6, delay: 0.7 + i * 0.07, ...infEase }}
        />
      ))}

      {/* latency */}
      <text x="96" y="132" fontSize="5.5" fill="rgba(16,185,129,0.6)" fontFamily="monospace">latency: 280ms  •  40+ languages</text>
    </Wrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AGENT PLATFORM
═══════════════════════════════════════════════════════════════════════════ */

/** #9 – Multi-Agent Workflow */
export function MultiAgentWorkflowAnim() {
  const nodes = [
    { x: 30, y: 70, label: "INTAKE", color: "#10B981" },
    { x: 95, y: 70, label: "VERIFY", color: "#10B981" },
    { x: 162, y: 70, label: "ASSESS", color: "#10B981" },
    { x: 228, y: 70, label: "OUTPUT", color: "#10B981" },
  ];
  return (
    <Wrapper>
      <text x="14" y="16" fontSize="5.5" fill="rgba(16,185,129,0.5)" fontFamily="monospace">INSURANCE CLAIMS  •  3 AGENTS ACTIVE</text>
      {/* connecting lines */}
      {nodes.slice(0, -1).map((n, i) => (
        <line key={i} x1={n.x + 26} y1={n.y} x2={nodes[i + 1].x - 26} y2={nodes[i + 1].y}
          stroke="rgba(16,185,129,0.2)" strokeWidth="1.5" strokeDasharray="3 2" />
      ))}
      {/* traveling packet */}
      <motion.circle r="4" fill="#10B981"
        animate={{
          cx: [nodes[0].x, nodes[1].x, nodes[2].x, nodes[3].x],
          cy: [70, 70, 70, 70],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{ duration: 3.5, ...inf, repeatDelay: 0.5 }}
      />
      {/* nodes */}
      {nodes.map((n, i) => (
        <motion.g key={i}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.5, delay: i * 0.85, ...infEase }}
          style={{ originX: `${n.x}px`, originY: `${n.y}px` } as React.CSSProperties}
        >
          <circle cx={n.x} cy={n.y} r="22" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.35)" strokeWidth="1.5" />
          <text x={n.x - 14} y={n.y + 2} fontSize="5.5" fill="rgba(16,185,129,0.85)" fontFamily="monospace" fontWeight="bold">{n.label}</text>
        </motion.g>
      ))}
      {/* doc input / output */}
      <motion.rect x="14" y="95" width="36" height="22" rx="3"
        fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.2)" strokeWidth="1"
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, ...infEase }}
      />
      <text x="16" y="106" fontSize="4.5" fill="rgba(16,185,129,0.6)" fontFamily="monospace">CLAIM</text>
      <text x="16" y="113" fontSize="4.5" fill="rgba(16,185,129,0.6)" fontFamily="monospace">INTAKE</text>

      <motion.rect x="230" y="95" width="36" height="22" rx="3"
        fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.4)" strokeWidth="1"
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, delay: 1.5, ...infEase }}
      />
      <text x="232" y="106" fontSize="4.5" fill="rgba(16,185,129,0.7)" fontFamily="monospace">PAYOUT</text>
      <text x="232" y="113" fontSize="4.5" fill="rgba(16,185,129,0.7)" fontFamily="monospace">APPROVED</text>
    </Wrapper>
  );
}

/** #34 – OpenClaw Deployment */
export function OpenClawDeployAnim() {
  const checks = [
    "Docker configured",
    "SSL/TLS active",
    "OAuth connected",
    "WhatsApp linked",
    "CRM integrated",
    "Monitoring live",
  ];
  return (
    <Wrapper>
      {/* server box */}
      <rect x="14" y="14" width="80" height="112" rx="6" fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.25)" strokeWidth="1.2" />
      <text x="24" y="28" fontSize="6" fill="rgba(16,185,129,0.6)" fontFamily="monospace">SERVER</text>
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x="22" y={34 + i * 20} width="64" height="12" rx="3"
          fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.15)" strokeWidth="0.8" />
      ))}
      {/* activity bars */}
      {[0, 1, 2].map(i => (
        <motion.rect key={i} x="26" y={37 + i * 20} width="0" height="6" rx="2"
          fill="rgba(16,185,129,0.4)"
          animate={{ width: [0, 40 + i * 8, 20 + i * 5, 55 - i * 3] }}
          transition={{ duration: 3, delay: i * 0.4, ...infEase }}
        />
      ))}
      <motion.rect x="26" y={97} width="0" height="6" rx="2" fill="rgba(16,185,129,0.4)"
        animate={{ width: [0, 50] }} transition={{ duration: 2, ...infEase }}
      />
      {/* checklist */}
      <text x="108" y="24" fontSize="6" fill="rgba(16,185,129,0.6)" fontFamily="monospace">DEPLOYMENT</text>
      {checks.map((c, i) => (
        <motion.g key={i}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: i * 0.5, duration: 0.4, ...infEase, repeatDelay: 4 }}
        >
          <motion.text x="108" y={37 + i * 18} fontSize="6.5"
            fill="rgba(16,185,129,0.9)" fontFamily="monospace"
            animate={{ opacity: [0, 1] }} transition={{ delay: i * 0.5, duration: 0.3, ...infEase, repeatDelay: 4 }}
          >✓</motion.text>
          <text x="120" y={37 + i * 18} fontSize="5.5" fill="rgba(255,255,255,0.45)" fontFamily="monospace">{c}</text>
        </motion.g>
      ))}
    </Wrapper>
  );
}

/** #35 – Industry Skill Packs */
export function SkillPacksAnim() {
  const packs = [
    { label: "Legal",       skills: 6, x: 10,  y: 24,  color: "#F59E0B" },
    { label: "Healthcare",  skills: 5, x: 100, y: 24,  color: "#F43F5E" },
    { label: "Real Estate", skills: 6, x: 190, y: 24,  color: "#10B981" },
    { label: "Marketing",   skills: 5, x: 55,  y: 68,  color: "#8B5CF6" },
    { label: "E-Commerce",  skills: 5, x: 145, y: 68,  color: "#06B6D4" },
  ];
  return (
    <Wrapper>
      <text x="14" y="16" fontSize="5.5" fill="rgba(16,185,129,0.5)" fontFamily="monospace">CLAWHUB SKILL PACKS  •  5 INDUSTRIES</text>
      {packs.map((p, i) => (
        <motion.g key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, delay: i * 0.4, ...infEase }}
        >
          <rect x={p.x} y={p.y} width="80" height="38" rx="5"
            fill={`${p.color}10`} stroke={`${p.color}40`} strokeWidth="1.2"
          />
          {/* package icon */}
          <rect x={p.x + 6} y={p.y + 6} width="16" height="16" rx="2.5" fill={`${p.color}25`} stroke={`${p.color}60`} strokeWidth="1" />
          <line x1={p.x + 14} y1={p.y + 6} x2={p.x + 14} y2={p.y + 22} stroke={`${p.color}50`} strokeWidth="0.8" />
          <line x1={p.x + 6} y1={p.y + 14} x2={p.x + 22} y2={p.y + 14} stroke={`${p.color}40`} strokeWidth="0.8" />
          <text x={p.x + 28} y={p.y + 17} fontSize="6" fill={`${p.color}cc`} fontFamily="monospace" fontWeight="bold">{p.label}</text>
          <text x={p.x + 28} y={p.y + 28} fontSize="5" fill={`${p.color}70`} fontFamily="monospace">{p.skills} skills</text>
        </motion.g>
      ))}
      {/* total count */}
      <text x="85" y="122" fontSize="5.5" fill="rgba(16,185,129,0.4)" fontFamily="monospace">27 skills  •  ready to deploy</text>
    </Wrapper>
  );
}

/** #36 – Security Audit */
export function SecurityAuditAnim() {
  const items = [
    { label: "Prompt injection", ok: true },
    { label: "API key exposure", ok: true },
    { label: "Access controls", ok: true },
    { label: "Malicious skills", ok: true },
    { label: "Data exfiltration", ok: true },
    { label: "Docker security", ok: false },
  ];
  return (
    <Wrapper>
      {/* shield */}
      <motion.path
        d="M140 14 L174 28 L174 72 Q174 96 140 108 Q106 96 106 72 L106 28 Z"
        fill="rgba(248,113,113,0.08)" stroke="rgba(248,113,113,0.4)" strokeWidth="1.5"
        animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, ...infEase }}
      />
      {/* scan line */}
      <motion.rect x="106" y="14" width="68" height="2" fill="rgba(248,113,113,0.7)" rx="1"
        animate={{ y: [14, 105, 14], opacity: [0.8, 0.8, 0] }}
        transition={{ duration: 3, ...inf, repeatDelay: 0.5 }}
      />
      {/* checkmark */}
      <motion.path d="M128 62 L137 71 L155 53" stroke="rgba(16,185,129,0.9)" strokeWidth="3"
        fill="none" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 2, delay: 1.5, ...inf, repeatDelay: 1 }}
      />
      {/* audit checklist */}
      {items.map((item, i) => (
        <motion.g key={i}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.4, duration: 0.3, ...infEase, repeatDelay: 4 }}
        >
          <text x="195" y={26 + i * 18} fontSize="6.5"
            fill={item.ok ? "rgba(16,185,129,0.9)" : "rgba(244,63,94,0.9)"} fontFamily="monospace">
            {item.ok ? "✓" : "✗"}
          </text>
          <text x="206" y={26 + i * 18} fontSize="5.5" fill={item.ok ? "rgba(255,255,255,0.45)" : "rgba(244,63,94,0.7)"} fontFamily="monospace">
            {item.label}
          </text>
        </motion.g>
      ))}
      <text x="108" y="122" fontSize="5.5" fill="rgba(248,113,113,0.5)" fontFamily="monospace">GDPR · PDPL · HIPAA compliant audit</text>
    </Wrapper>
  );
}

/** #37 – Multi-Agent Enterprise */
export function MultiAgentEnterpriseAnim() {
  const satellites = [
    { x: 140, y: 20, label: "STRATEGY" },
    { x: 230, y: 56, label: "SALES" },
    { x: 215, y: 112, label: "FINANCE" },
    { x: 65, y: 112, label: "HR" },
    { x: 50, y: 56, label: "OPS" },
    { x: 140, y: 122, label: "MARKETING" },
  ];
  const center = { x: 140, y: 70 };
  return (
    <Wrapper>
      {/* connections */}
      {satellites.map((s, i) => (
        <motion.line key={i}
          x1={center.x} y1={center.y} x2={s.x} y2={s.y}
          stroke="rgba(16,185,129,0.25)" strokeWidth="1"
          strokeDasharray="3 3"
          animate={{ strokeDashoffset: [0, -12] }}
          transition={{ duration: 1.5, delay: i * 0.2, ...inf }}
        />
      ))}
      {/* traveling packets */}
      {satellites.slice(0, 3).map((s, i) => (
        <motion.circle key={i} r="2.5" fill="#10B981"
          animate={{ cx: [center.x, s.x, center.x], cy: [center.y, s.y, center.y], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.5, delay: i * 0.8, ...inf }}
        />
      ))}
      {/* satellite nodes */}
      {satellites.map((s, i) => (
        <motion.g key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, delay: i * 0.3, ...infEase }}
        >
          <circle cx={s.x} cy={s.y} r="14" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.3)" strokeWidth="1.2" />
          <text x={s.x - (s.label.length * 2)} y={s.y + 2} fontSize="4.5" fill="rgba(16,185,129,0.8)" fontFamily="monospace">{s.label}</text>
        </motion.g>
      ))}
      {/* center node */}
      <motion.circle cx={center.x} cy={center.y} r="22" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.5)" strokeWidth="1.8"
        animate={{ r: [22, 24, 22] }} transition={{ duration: 2.5, ...infEase }}
      />
      <text x="122" y="67" fontSize="5.5" fill="rgba(16,185,129,0.9)" fontFamily="monospace" fontWeight="bold">ENTERPRISE</text>
      <text x="127" y="75" fontSize="5" fill="rgba(16,185,129,0.6)" fontFamily="monospace">CORE AGENT</text>
    </Wrapper>
  );
}
