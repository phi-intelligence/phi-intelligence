import { motion } from "framer-motion";
import {
  Cloud, Globe as GlobeIcon, Settings, Users, MessageSquare, FileText,
  MousePointer2, Mic, Camera, Brain, BarChart3, Bell, Layers, Cpu, Zap, ArrowRight
} from "lucide-react";
import AudioBarsAnimation from "@/components/three/AudioBarsAnimation";

const PHI_FILTER = 'brightness(0) saturate(100%) invert(44%) sepia(100%) saturate(1500%) hue-rotate(189deg)';

/* ─── SaaS Dashboard ─── */
export function SaaSDashboardMini() {
  const floatingIcons = [
    { Icon: Cloud,         x: '50%', y: '10%', delay: 0   },
    { Icon: GlobeIcon,     x: '90%', y: '20%', delay: 0.4 },
    { Icon: Settings,      x: '90%', y: '60%', delay: 0.8 },
    { Icon: Users,         x: '72%', y: '78%', delay: 1.2 },
    { Icon: MessageSquare, x: '28%', y: '78%', delay: 1.6 },
    { Icon: FileText,      x: '8%',  y: '45%', delay: 2   },
  ];
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {floatingIcons.map((icon, i) => (
          <motion.line
            key={`line-${i}`}
            x1="50%" y1="50%"
            x2={icon.x} y2={icon.y}
            stroke="rgba(0,163,255,0.25)"
            strokeWidth="1"
            strokeDasharray="3 5"
            animate={{ strokeDashoffset: [0, -16] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: icon.delay * 0.3 }}
          />
        ))}
      </svg>
      <motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-52 h-32 rounded-xl border border-white/25 bg-white/[0.08] backdrop-blur-sm overflow-hidden"
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/15">
          <img
            src="/assets/logophi.png"
            alt=""
            className="h-4 w-4 shrink-0 object-contain"
            style={{ filter: PHI_FILTER }}
          />
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>
          <div className="flex-1 min-w-0 ml-1 h-2.5 rounded bg-white/10" />
        </div>
        <div className="flex h-[calc(100%-24px)]">
          <div className="w-10 border-r border-white/10 p-1.5 space-y-1">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-full h-3 rounded bg-white/10" />
            ))}
          </div>
          <div className="flex-1 p-2 flex flex-col gap-1.5">
            <div className="flex gap-1">
              <div className="flex-1 h-6 rounded bg-white/8 p-1">
                <div className="w-8 h-1 rounded bg-white/20" />
                <div className="w-5 h-1 rounded bg-white/10 mt-0.5" />
              </div>
              <div className="flex-1 h-6 rounded bg-white/8 p-1">
                <div className="w-6 h-1 rounded bg-white/20" />
                <div className="w-8 h-1 rounded bg-white/10 mt-0.5" />
              </div>
            </div>
            <div className="flex-1 rounded bg-white/[0.06] flex items-end gap-0.5 p-1">
              {[40,60,35,75,50,80].map((h, i) => (
                <motion.div
                  key={i}
                  className={`flex-1 rounded-t ${i % 2 === 0 ? 'bg-phi-blue/50' : 'bg-white/15'}`}
                  animate={{ height: [`${h*0.4}%`, `${h}%`] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        </div>
        <motion.div
          animate={{ x: [0, 20, 10, 20, 0], y: [0, -8, 3, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-3 right-5"
        >
          <MousePointer2 className="w-3 h-3 text-white/30" />
        </motion.div>
      </motion.div>
      {floatingIcons.map(({ Icon, x, y, delay }, i) => (
        <motion.div
          key={`icon-${i}`}
          className="absolute z-20"
          style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
          animate={{ y: [0, i % 2 === 0 ? -5 : 5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5 + i * 0.2, repeat: Infinity, delay }}
        >
          <div className="w-10 h-10 rounded-lg border border-white/25 bg-black flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-white/50" />
          </div>
        </motion.div>
      ))}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-[12%] left-[5%] w-4 h-4 rounded-full bg-white/20 border border-white/30 flex items-center justify-center z-30"
      >
        <span className="text-[6px] font-bold text-white/60">1</span>
      </motion.div>
      {floatingIcons.map((icon, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full bg-phi-blue z-30"
          style={{ left: '50%', top: '50%' }}
          animate={{ left: ['50%', icon.x], top: ['50%', icon.y], opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: icon.delay + 1, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Phone Mockup — `compact` for homepage bento slot; default = full hero on service page ─── */
export function PhoneMockupMini({ compact = false }: { compact?: boolean }) {
  const shell = compact
    ? `relative border-2 border-white/15 bg-white/[0.02] flex flex-col items-center justify-between overflow-hidden
          w-[5.5rem] h-[10.35rem] rounded-[1.2rem] p-1.5 gap-0.5
          sm:w-[7rem] sm:h-[13.2rem] sm:rounded-[1.65rem] sm:p-2.5 sm:gap-1
          md:w-[8.15rem] md:h-[15.45rem] md:rounded-[1.9rem] md:p-3
          lg:w-[9rem] lg:h-[17.05rem] lg:rounded-[2.1rem] lg:p-3.5`
    : `relative w-48 h-[380px] rounded-[2.4rem] border-2 border-white/15 bg-white/[0.02] flex flex-col items-center justify-between p-3.5 overflow-hidden`;

  const outer = compact
    ? "w-full h-full min-h-0 flex items-end justify-center pb-0.5 sm:pb-1 md:pb-1.5 relative"
    : "w-full h-full flex items-center justify-center relative";

  return (
    <div className={outer}>
      <div className="relative shrink-0">
        <div className={shell}>
          <div
            className={
              compact
                ? "w-10 sm:w-12 md:w-14 h-2.5 sm:h-3 md:h-3.5 rounded-full bg-white/10 mt-0.5 shrink-0"
                : "w-16 h-4 rounded-full bg-white/10 mt-1"
            }
          />
          <div
            className={
              compact
                ? "flex min-h-0 flex-1 flex-col items-center justify-center gap-1 sm:gap-1.5 md:gap-2 w-full px-1 sm:px-1.5 py-0.5 sm:py-1"
                : "flex-grow flex flex-col items-center justify-center gap-2.5 w-full px-2 py-2"
            }
          >
            <div className={`flex items-center ${compact ? "gap-1 sm:gap-1.5 mb-0 sm:mb-0.5" : "gap-2 mb-1"}`}>
              <img
                src="/assets/logophi.png"
                alt="Phi"
                className={
                  compact
                    ? "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 object-contain"
                    : "w-6 h-6 object-contain"
                }
                style={{ filter: PHI_FILTER }}
              />
              <span
                className={
                  compact
                    ? "text-[6px] sm:text-[7px] md:text-[8px] font-bold tracking-widest uppercase text-phi-blue/70"
                    : "text-[8px] font-bold tracking-widest uppercase text-phi-blue/70"
                }
              >
                Phi AI
              </span>
            </div>
            <div
              className={
                compact
                  ? "w-full h-5 sm:h-6 md:h-7 rounded-md sm:rounded-lg bg-white/5 border border-phi-blue/20 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 shrink-0"
                  : "w-full h-7 rounded-lg bg-white/5 border border-phi-blue/20 flex items-center gap-2 px-2"
              }
            >
              <Mic className={compact ? "w-2.5 h-2.5 sm:w-3 sm:h-3 text-phi-blue/60 shrink-0" : "w-3 h-3 text-phi-blue/60"} />
              <div className="flex-grow h-0.5 rounded-full bg-white/10" />
            </div>
            <div
              className={
                compact
                  ? "grid grid-cols-2 gap-1 sm:gap-1.5 w-full min-h-0 flex-1"
                  : "grid grid-cols-2 gap-1.5 w-full"
              }
            >
              {[Camera, Brain, BarChart3, Bell].map((Icon, i) => (
                <div
                  key={i}
                  className={`${compact ? "min-h-0 aspect-square rounded-md sm:rounded-lg" : "aspect-square rounded-lg"} border flex items-center justify-center ${i === 0 ? "bg-phi-blue/10 border-phi-blue/20" : "bg-white/5 border-white/8"}`}
                >
                  <Icon
                    className={`${compact ? "w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" : "w-4 h-4"} ${i === 0 ? "text-phi-blue/60" : "text-white/25"}`}
                  />
                </div>
              ))}
            </div>
            <div className={compact ? "w-full space-y-1 sm:space-y-1.5 shrink-0" : "w-full space-y-1.5"}>
              {[65, 45, 80].map((w, i) => (
                <div
                  key={i}
                  className={`${compact ? "h-1 sm:h-1.5" : "h-1.5"} rounded-full ${i === 2 ? "bg-phi-blue/30" : "bg-white/8"}`}
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
          <div
            className={
              compact
                ? "w-10 sm:w-14 md:w-16 h-0.5 rounded-full bg-white/20 mb-0.5 shrink-0"
                : "w-16 h-0.5 rounded-full bg-white/20 mb-1"
            }
          />
        </div>
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={
            compact
              ? "absolute -left-16 lg:-left-20 top-4 sm:top-6 md:top-8 bg-black border border-phi-blue/20 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 space-y-0.5 hidden md:block"
              : "absolute -left-20 top-8 bg-black border border-phi-blue/20 rounded-lg px-2.5 py-1.5 space-y-0.5 hidden md:block"
          }
        >
          <p className="text-[7px] font-bold tracking-widest uppercase text-white/30">On-Device AI</p>
          <p className="text-[10px] font-bold text-phi-blue/80">&lt;50ms</p>
        </motion.div>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className={
            compact
              ? "absolute -right-16 lg:-right-20 top-[28%] bg-black border border-white/15 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 space-y-0.5 hidden md:block"
              : "absolute -right-20 top-1/3 bg-black border border-white/15 rounded-lg px-2.5 py-1.5 space-y-0.5 hidden md:block"
          }
        >
          <p className="text-[7px] font-bold tracking-widest uppercase text-white/30">Platforms</p>
          <p className="text-[10px] font-bold text-white/80">iOS + Android</p>
        </motion.div>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className={
            compact
              ? "absolute -left-14 lg:-left-20 bottom-[12%] sm:bottom-[14%] md:bottom-[16%] bg-black border border-white/15 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 space-y-0.5 hidden md:block"
              : "absolute -left-20 bottom-14 bg-black border border-white/15 rounded-lg px-2.5 py-1.5 space-y-0.5 hidden md:block"
          }
        >
          <p className="text-[7px] font-bold tracking-widest uppercase text-white/30">Offline AI</p>
          <p className="text-[10px] font-bold text-white/80">Works Offline</p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Browser Mockup ─── */
export function BrowserMockupMini() {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div className="relative">
        <div className="w-[min(440px,100%)] h-[260px] rounded-xl border border-white/20 bg-black/90 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/12 bg-white/[0.05]">
            <div className="w-2.5 h-2.5 rounded-full bg-white/25" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/25" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/25" />
            <div className="flex-1 ml-2 h-4 rounded bg-white/10 flex items-center gap-1.5 px-2.5">
              <img src="/assets/logophi.png" alt="" className="w-3 h-3 object-contain flex-shrink-0" style={{ filter: PHI_FILTER }} />
              <span className="text-[8px] text-white/40 font-mono">app.client.com/dashboard</span>
            </div>
          </div>
          <div className="flex border-b border-white/8 bg-white/[0.02]">
            {['Home', 'Dashboard', 'Analytics', 'Settings'].map((tab, i) => (
              <span
                key={tab}
                className={`text-[7px] font-bold uppercase tracking-wider px-3 py-2 ${
                  i === 1 ? 'text-phi-blue/80 border-b-2 border-phi-blue' : 'text-white/25'
                }`}
              >{tab}</span>
            ))}
          </div>
          <div className="flex h-[calc(100%-60px)]">
            <div className="w-10 border-r border-white/8 flex flex-col items-center pt-2.5 gap-2.5">
              {[Layers, BarChart3, Users, Settings].map((Icon, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded flex items-center justify-center ${i === 0 ? 'bg-phi-blue/20' : ''}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${i === 0 ? 'text-phi-blue/70' : 'text-white/22'}`} />
                </div>
              ))}
            </div>
            <div className="flex-1 p-2.5 space-y-2 overflow-hidden">
              <div className="text-[6px] font-bold text-white/20 uppercase tracking-widest mb-1">Example Dashboard</div>
              <div className="flex gap-1.5">
                {[
                  { label: 'Users',  val: '12.4K', blue: false },
                  { label: 'Uptime', val: '99.9%', blue: true  },
                  { label: 'Resp',   val: '180ms', blue: false  },
                ].map(({ label, val, blue }) => (
                  <div key={label} className={`flex-1 rounded-lg border px-2 py-1.5 ${blue ? 'bg-phi-blue/[0.07] border-phi-blue/20' : 'bg-white/[0.07] border-white/12'}`}>
                    <p className="text-[6px] text-white/35 uppercase tracking-wider">{label}</p>
                    <p className={`text-[11px] font-bold ${blue ? 'text-phi-blue/80' : 'text-white/75'}`}>{val}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-white/[0.04] border border-white/8 px-2 pt-1 pb-1.5 flex items-end gap-1 h-14">
                {[40, 65, 35, 80, 50, 90, 60, 75].map((h, i) => (
                  <motion.div
                    key={i}
                    className={`flex-1 rounded-t ${i % 3 === 0 ? 'bg-phi-blue/50' : 'bg-white/20'}`}
                    animate={{ height: [`${h * 0.4}%`, `${h}%`] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: i * 0.15 }}
                  />
                ))}
              </div>
              <div className="rounded-lg bg-white/[0.04] border border-white/8 p-2 space-y-1.5">
                <div className="flex gap-2">
                  {['Name', 'Status', 'Value'].map(h => (
                    <div key={h} className="flex-1 h-1.5 rounded bg-white/22" />
                  ))}
                </div>
                {[1, 2].map(row => (
                  <motion.div
                    key={row}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, delay: row * 0.4 }}
                    className="flex gap-2"
                  >
                    {[1, 2, 3].map(col => (
                      <div key={col} className="flex-1 h-1 rounded bg-white/12" />
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-20 top-6 bg-black border border-phi-blue/20 rounded-lg px-2.5 py-1.5 space-y-0.5 hidden md:block"
        >
          <p className="text-[7px] font-bold tracking-widest uppercase text-white/30">LLM Search</p>
          <p className="text-[10px] font-bold text-phi-blue/80">AI-Powered</p>
        </motion.div>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -right-20 top-8 bg-black border border-white/15 rounded-lg px-2.5 py-1.5 space-y-0.5 hidden md:block"
        >
          <p className="text-[7px] font-bold tracking-widest uppercase text-white/30">Response</p>
          <p className="text-[10px] font-bold text-white/80">&lt;200ms</p>
        </motion.div>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -left-16 bottom-6 bg-black border border-white/15 rounded-lg px-2.5 py-1.5 space-y-0.5 hidden md:block"
        >
          <p className="text-[7px] font-bold tracking-widest uppercase text-white/30">Stack</p>
          <p className="text-[10px] font-bold text-white/80">Full-Stack</p>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Document Extraction ─── */
export function DocExtractionMini() {
  // Use shared PHI_FILTER constant
  const fileTypes = [
    { ext: "PDF",  w: "w-20" },
    { ext: "DOCX", w: "w-24" },
    { ext: "XLSX", w: "w-20" },
    { ext: "PPTX", w: "w-24" },
  ];
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-5 px-8">
      <div className="flex items-center gap-4">
        {fileTypes.map((ft, i) => (
          <motion.div
            key={ft.ext}
            animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
            className={`${ft.w} h-28 rounded-xl border border-white/15 bg-white/[0.04] flex flex-col items-center justify-center gap-2`}
          >
            <FileText className="w-7 h-7 text-white/30" />
            <span className="text-[9px] font-bold text-white/40 tracking-wider">{ft.ext}</span>
          </motion.div>
        ))}
      </div>
      <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 1.5, repeat: Infinity }}>
        <ArrowRight className="w-6 h-6 text-phi-blue/50 rotate-90" />
      </motion.div>
      <motion.div
        animate={{ borderColor: ["rgba(0,163,255,0.1)", "rgba(0,163,255,0.5)", "rgba(0,163,255,0.1)"] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex items-center gap-3 px-6 py-3 rounded-full border bg-phi-blue/[0.03]"
      >
        <img src="/assets/logophi.png" alt="" className="w-5 h-5 object-contain" style={{ filter: PHI_FILTER }} />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-phi-blue/40 border-t-phi-blue rounded-full" />
        <span className="text-[10px] font-bold text-phi-blue/60 uppercase tracking-widest">AI Extracting</span>
      </motion.div>
      <div className="flex gap-3">
        {[
          { label: "Name", value: "J. Carter" },
          { label: "Amt",  value: "$42.8K"   },
          { label: "Date", value: "2026-03"  },
        ].map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.3, duration: 0.4 }}
            className={`border rounded-xl px-4 py-2.5 text-center ${i === 1 ? 'bg-phi-blue/[0.06] border-phi-blue/20' : 'bg-white/[0.04] border-white/10'}`}
          >
            <div className="text-[9px] font-bold tracking-widest uppercase text-white/25">{f.label}</div>
            <div className={`text-[13px] font-bold mt-0.5 ${i === 1 ? 'text-phi-blue/80' : 'text-white/60'}`}>{f.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Voice Waveform ─── */
export function VoiceWaveformMini() {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-25">
        <AudioBarsAnimation barCount={20} animationSpeed={0.8} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-44 h-44 rounded-full border border-phi-blue/15"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute w-32 h-32 rounded-full border border-phi-blue/20"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.05, 0.25] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-24 h-24 rounded-full border border-phi-blue/30"
        />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-phi-blue/10 border border-phi-blue/30 flex items-center justify-center">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Mic className="w-7 h-7 text-phi-blue/80" />
          </motion.div>
        </div>
        {/* Phi logo label */}
        <div className="flex items-center gap-1.5 bg-black/60 border border-phi-blue/20 rounded-full px-3 py-1">
          <img src="/assets/logophi.png" alt="" className="w-3.5 h-3.5 object-contain" style={{ filter: PHI_FILTER }} />
          <span className="text-[8px] font-bold text-phi-blue/60 uppercase tracking-widest">Phi Voice AI</span>
        </div>
      </div>
      <div className="absolute top-4 right-4 bg-black/70 border border-phi-blue/20 rounded-full px-3 py-1 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-phi-blue/70 animate-pulse" />
        <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Live · 180ms</span>
      </div>
    </div>
  );
}

/* ─── Vision Detection ─── */
export function VisionDetectionMini() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-6 left-4 w-24 h-20 border-2 border-white/30 rounded-lg"
      >
        <span className="absolute -top-4 left-0 text-[8px] font-bold text-white/60 bg-white/[0.08] backdrop-blur-sm px-1.5 py-0.5 rounded">Person 98.7%</span>
      </motion.div>
      <motion.div
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        className="absolute top-12 right-4 w-20 h-28 border-2 border-white/25 rounded-lg"
      >
        <span className="absolute -top-4 left-0 text-[8px] font-bold text-white/60 bg-white/[0.08] backdrop-blur-sm px-1.5 py-0.5 rounded">Vehicle 96%</span>
      </motion.div>
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        className="absolute bottom-10 left-1/4 w-20 h-12 border-2 border-white/20 rounded-lg"
      >
        <span className="absolute -top-4 left-0 text-[8px] font-bold text-white/60 bg-white/[0.08] backdrop-blur-sm px-1.5 py-0.5 rounded">Package 94%</span>
      </motion.div>
      <motion.div
        animate={{ top: ['5%', '90%', '5%'] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-phi-blue/50 to-transparent"
      />
      {/* Phi logo as detection engine badge */}
      <div className="absolute top-3 left-3 bg-black/70 border border-phi-blue/25 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 z-10">
        <img src="/assets/logophi.png" alt="" className="w-4 h-4 object-contain" style={{ filter: PHI_FILTER }} />
        <span className="text-[8px] font-bold text-phi-blue/60 uppercase tracking-widest">Phi Vision</span>
      </div>
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-phi-blue/60 animate-pulse" />
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Live Detection</span>
        </div>
        <span className="text-[8px] font-bold text-white/30">60 FPS</span>
      </div>
    </div>
  );
}

/* ─── Automation Flow ─── */
export function AutomationFlowMini() {
  const nodes = [
    { label: "Ingest",  icon: Layers },
    { label: "Process", icon: Cpu    },
    { label: "Decide",  icon: Brain  },
    { label: "Act",     icon: Zap    },
  ];
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 relative">
      {/* Phi AI hub label */}
      <div className="flex items-center gap-2">
        <img src="/assets/logophi.png" alt="" className="w-5 h-5 object-contain" style={{ filter: PHI_FILTER }} />
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-phi-blue/50">Phi AI Orchestration</span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex items-center gap-1.5 sm:gap-3">
            <motion.div
              animate={{
                borderColor: ["rgba(0,163,255,0.1)", "rgba(0,163,255,0.4)", "rgba(0,163,255,0.1)"],
                backgroundColor: ["rgba(0,163,255,0.02)", "rgba(0,163,255,0.06)", "rgba(0,163,255,0.02)"]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              className="w-14 h-14 sm:w-24 sm:h-24 rounded-2xl border flex flex-col items-center justify-center gap-1 sm:gap-2"
            >
              <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}>
                <node.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white/40" />
              </motion.div>
              <span className="text-[7px] sm:text-[8px] font-bold text-white/30 uppercase tracking-wider">{node.label}</span>
            </motion.div>
            {i < nodes.length - 1 && (
              <div className="relative w-4 sm:w-8">
                <div className="h-px w-full bg-white/10" />
                <motion.div
                  animate={{ x: [-2, 6, -2], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.5 + 0.3 }}
                  className="absolute top-1/2 left-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-phi-blue/60 -translate-y-1/2"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <motion.div
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-[8px] font-bold text-white/20 uppercase tracking-widest"
      >
        Continuous Loop
      </motion.div>
    </div>
  );
}

/* ─── Marketing Analytics ─── */
export function MarketingAnalyticsMini() {
  const socials = [
    { name: 'X',  path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
    { name: 'Fb', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { name: 'In', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
    { name: 'Gg', path: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' },
    { name: 'Li', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    { name: 'Yt', path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-5 px-6 relative">
      {/* Phi hub — central engine */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="flex items-center gap-2.5 bg-black/60 border border-phi-blue/30 rounded-full px-5 py-2.5"
      >
        <img src="/assets/logophi.png" alt="" className="w-6 h-6 object-contain" style={{ filter: PHI_FILTER }} />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-phi-blue/70">Auto-Post Engine</span>
      </motion.div>

      {/* Animated connecting lines from hub to grid */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scaleY: [0.5, 1, 0.5], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            className="w-px h-6 bg-phi-blue/40"
          />
        ))}
      </div>

      {/* Social platforms grid — 3×2, larger */}
      <div className="grid grid-cols-3 gap-5">
        {socials.map((s, i) => (
          <motion.div
            key={s.name}
            animate={{ opacity: [0.35, 0.8, 0.35], scale: [0.96, 1.04, 0.96] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
            className={`w-20 h-20 rounded-2xl border flex items-center justify-center ${i % 2 === 0 ? 'border-phi-blue/25 bg-phi-blue/[0.04]' : 'border-white/12 bg-white/[0.03]'}`}
          >
            <svg className={`w-8 h-8 ${i % 2 === 0 ? 'text-phi-blue/55' : 'text-white/30'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d={s.path} />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-6 mt-1">
        {[
          { l: "CTR",  v: "4.8%", blue: true  },
          { l: "Conv", v: "3.2%", blue: false },
          { l: "ROAS", v: "2.4x", blue: false },
        ].map((s, i) => (
          <motion.div
            key={s.l}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            className="text-center"
          >
            <div className={`text-sm font-bold ${s.blue ? 'text-phi-blue/80' : 'text-white/45'}`}>{s.v}</div>
            <div className="text-[8px] text-white/25 uppercase tracking-wider mt-0.5">{s.l}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
