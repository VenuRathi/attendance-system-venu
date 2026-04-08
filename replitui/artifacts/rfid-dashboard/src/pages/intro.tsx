import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroProps {
  onComplete: () => void;
}

const TEAM = [
  { name: "Venu Rathi", role: "Project Lead" },
  { name: "Prachiti Bhambure", role: "UI/UX Support" },
  { name: "Shravasti Barathe", role: "Testing & Validation" },
  { name: "Sameera Koshe", role: "Documentation Lead" },
];

export default function Intro({ onComplete }: IntroProps) {
  const [phase, setPhase] = useState<"idle" | "scanning" | "granted" | "exit">("idle");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("scanning"), 1600);
    const t2 = setTimeout(() => setPhase("granted"), 3200);
    const t3 = setTimeout(() => setPhase("exit"), 4800);
    const t4 = setTimeout(() => onComplete(), 5600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "radial-gradient(ellipse at 50% 40%, #0a1628 0%, #020810 100%)" }}
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,229,255,0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,229,255,0.15) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Ambient glow */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)", top: "20%", left: "50%", x: "-50%", y: "-50%" }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />

          {/* Header branding */}
          <motion.div
            className="absolute top-10 left-0 right-0 flex flex-col items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-400" />
              <span className="text-xs font-mono tracking-[0.4em] text-cyan-400 uppercase">
                Attendance Management System
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-400" />
            </div>
            <motion.h1
              className="text-5xl font-mono font-black tracking-[0.15em] text-white"
              style={{ textShadow: "0 0 30px rgba(0,229,255,0.5)" }}
            >
              RFID<span className="text-cyan-400">_</span>CTRL
            </motion.h1>
          </motion.div>

          {/* Main RFID Scanner + Card Animation */}
          <div className="relative flex flex-col items-center" style={{ marginTop: -20 }}>
            <svg width="280" height="300" viewBox="0 0 280 300">
              {/* Scan beam behind card */}
              {phase === "scanning" && (
                <motion.rect
                  x="62" y="130" width="156" height="6" rx="3"
                  fill="rgba(0,229,255,0.6)"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: [0, 1, 1, 0], scaleX: [0, 1, 1, 1], y: [130, 130, 175, 175] }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              )}

              {/* Scanner body */}
              <motion.rect
                x="60" y="130" width="160" height="100" rx="12"
                fill="#0d1f38" stroke="rgba(0,229,255,0.4)" strokeWidth="1.5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              />
              {/* Scanner inner panel */}
              <motion.rect
                x="74" y="143" width="132" height="74" rx="6"
                fill="#081526" stroke="rgba(0,229,255,0.2)" strokeWidth="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              />
              {/* Scanner LED strip */}
              <motion.rect
                x="100" y="225" width="80" height="3" rx="1.5"
                fill={phase === "granted" ? "#00ff88" : "rgba(0,229,255,0.5)"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              />
              {/* Scanner LED dots */}
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx={88 + i * 15} cy={165} r={3.5}
                  fill={phase === "granted" ? "#00ff88" : "#00e5ff"}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: phase === "scanning" ? [0.3, 1, 0.3] : 1,
                    scale: phase === "granted" ? [1, 1.4, 1] : 1,
                  }}
                  transition={{
                    delay: 0.9 + i * 0.1,
                    repeat: phase === "scanning" ? Infinity : 0,
                    duration: 0.6,
                    repeatDelay: 0.2,
                  }}
                />
              ))}
              {/* Scanner signal lines */}
              <motion.rect x="74" y="182" width="60" height="2" rx="1" fill="rgba(0,229,255,0.2)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} />
              <motion.rect x="74" y="190" width="80" height="2" rx="1" fill="rgba(0,229,255,0.2)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05 }} />
              <motion.rect x="74" y="198" width="50" height="2" rx="1" fill="rgba(0,229,255,0.2)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} />

              {/* Scanner glow on scan */}
              {phase === "scanning" && (
                <motion.rect
                  x="60" y="130" width="160" height="100" rx="12"
                  fill="transparent" stroke="#00e5ff" strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0, 0.8, 0] }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                />
              )}

              {/* SUCCESS glow */}
              {phase === "granted" && (
                <motion.rect
                  x="60" y="130" width="160" height="100" rx="12"
                  fill="transparent" stroke="#00ff88" strokeWidth="2.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.6, 1] }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              )}

              {/* RFID Card */}
              <motion.g
                initial={{ y: -30, opacity: 0 }}
                animate={
                  phase === "idle"
                    ? { y: -10, opacity: 1 }
                    : phase === "scanning"
                    ? { y: 110, opacity: 1 }
                    : { y: 70, opacity: phase === "granted" ? 0.4 : 1 }
                }
                transition={
                  phase === "scanning"
                    ? { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
                    : phase === "idle"
                    ? { delay: 0.6, duration: 0.5 }
                    : { duration: 0.4 }
                }
              >
                {/* Card body */}
                <rect x="82" y="30" width="116" height="74" rx="8" fill="#0e2a4a" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" />
                {/* Card chip */}
                <rect x="98" y="50" width="26" height="20" rx="3" fill="#1a4060" stroke="rgba(0,229,255,0.4)" strokeWidth="1" />
                <line x1="111" y1="50" x2="111" y2="70" stroke="rgba(0,229,255,0.3)" strokeWidth="0.8" />
                <line x1="98" y1="60" x2="124" y2="60" stroke="rgba(0,229,255,0.3)" strokeWidth="0.8" />
                {/* Card NFC symbol */}
                {[8, 14, 20].map((r, i) => (
                  <path
                    key={i}
                    d={`M ${150} ${67} m -${r / 2},0 a ${r / 2},${r / 2} 0 0,1 ${r},0`}
                    fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="1.2"
                  />
                ))}
                {/* Card stripe */}
                <rect x="82" y="78" width="116" height="10" rx="0" fill="rgba(0,229,255,0.08)" />
                {/* Card dots for name hint */}
                <rect x="98" y="92" width="40" height="4" rx="2" fill="rgba(0,229,255,0.2)" />
                <rect x="98" y="99" width="28" height="3" rx="1.5" fill="rgba(0,229,255,0.1)" />
              </motion.g>

              {/* Hand / Finger pointing */}
              <motion.g
                initial={{ y: -30, x: 20, opacity: 0 }}
                animate={
                  phase === "idle"
                    ? { y: -12, x: 20, opacity: 0.85 }
                    : phase === "scanning"
                    ? { y: 108, x: 20, opacity: 0.7 }
                    : { y: 68, x: 20, opacity: 0 }
                }
                transition={
                  phase === "scanning"
                    ? { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
                    : phase === "idle"
                    ? { delay: 0.7, duration: 0.5 }
                    : { duration: 0.4 }
                }
              >
                {/* Simplified hand silhouette */}
                <ellipse cx="140" cy="17" rx="18" ry="10" fill="#1a3a5c" stroke="rgba(0,229,255,0.3)" strokeWidth="1" />
                {/* Fingers */}
                {[-22, -11, 0, 11].map((dx, i) => (
                  <rect key={i} x={128 + dx} y={4} width="7" height={16 + i * 2} rx="3.5" fill="#1a3a5c" stroke="rgba(0,229,255,0.25)" strokeWidth="0.8" />
                ))}
                {/* Thumb */}
                <ellipse cx="107" cy="16" rx="7" ry="5" fill="#1a3a5c" stroke="rgba(0,229,255,0.2)" strokeWidth="0.8" />
              </motion.g>
            </svg>

            {/* Status text */}
            <div className="mt-2 h-10 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {phase === "idle" && (
                  <motion.p
                    key="idle"
                    className="font-mono text-sm tracking-[0.25em] text-cyan-400/60 uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    Tap card to scan...
                  </motion.p>
                )}
                {phase === "scanning" && (
                  <motion.p
                    key="scanning"
                    className="font-mono text-sm tracking-[0.25em] text-cyan-300 uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Scanning...
                  </motion.p>
                )}
                {phase === "granted" && (
                  <motion.div
                    key="granted"
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="h-2 w-2 rounded-full bg-green-400"
                      animate={{ scale: [1, 1.6, 1] }}
                      transition={{ repeat: 3, duration: 0.4 }}
                    />
                    <p className="font-mono text-sm tracking-[0.25em] text-green-400 uppercase font-bold">
                      Access Granted
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Team names */}
          <motion.div
            className="absolute bottom-14 left-0 right-0 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.7 }}
          >
            <p className="text-[10px] font-mono tracking-[0.5em] text-cyan-500/50 uppercase mb-2">
              Developed by
            </p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-1">
              {TEAM.map((member, i) => (
                <motion.div
                  key={member.name}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + i * 0.12, duration: 0.4 }}
                >
                  <span className="text-sm font-semibold text-white/90 font-mono">{member.name}</span>
                  <span className="text-[10px] text-cyan-400/50 font-mono tracking-wider">{member.role}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Skip hint */}
          <motion.button
            className="absolute bottom-5 right-6 text-[10px] font-mono tracking-widest text-white/20 hover:text-white/50 transition-colors uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={onComplete}
          >
            Skip →
          </motion.button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
