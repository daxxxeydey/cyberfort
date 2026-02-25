import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const TARGET_DATE = new Date("2026-03-11T09:00:00");

const TECH_EVENTS = [
  { name: "CODE COMBAT", desc: "Battle through algorithmic challenges in real-time coding duels. Fastest solution wins.", icon: "⚔️" },
  { name: "KERNEL CHALLENGE", desc: "Deep-dive OS internals, reverse engineering & low-level system exploitation puzzles.", icon: "🔬" },
];

const NON_TECH_EVENTS = [
  { name: "THINK & LINK", desc: "Connections-based puzzle game — find the hidden patterns between seemingly unrelated concepts.", icon: "🔗" },
  { name: "E-SPORTS", desc: "Competitive gaming tournament. Show your reflexes, strategy, and domination.", icon: "🎮" },
  { name: "LOGO RUSH", desc: "Rapid-fire logo identification challenge. How deep is your brand knowledge?", icon: "🎯" },
];

const SCHEDULE = [
  { time: "08:30 AM", title: "Registration & Check-in", desc: "Participant verification and kit distribution" },
  { time: "09:30 AM", title: "Inauguration", desc: "Chief guests, lighting of the lamp, welcome address" },
  { time: "10:30 AM", title: "Technical Events Begin", desc: "Code Combat & Kernel Challenge rounds start" },
  { time: "12:30 PM", title: "Lunch Break", desc: "Networking session with industry professionals" },
  { time: "01:30 PM", title: "Non-Technical Events", desc: "Think & Link, E-Sports, Logo Rush" },
  { time: "03:30 PM", title: "Finals & Results", desc: "Top teams compete in grand finale rounds" },
  { time: "04:30 PM", title: "Valedictory & Prize Distribution", desc: "Awards ceremony and closing address" },
];

const BOT_RESPONSES = {
  hi: "Hey there, cyber warrior! 👾 How can I assist you today? Type 'help' to see what I can do.",
  hello: "Hello, hacker! 🤖 Welcome to Cyber Fort. Ask me anything about the event!",
  help: "I can answer questions about:\n• Event details\n• Technical & non-technical events\n• Registration fees\n• Contact info\n• Schedule",
  "what is cyber fort": "Cyber Fort is a premier cybersecurity-themed symposium conducted by the **Department of Cybersecurity**, Nehru Institute of Technology. Part of CONVERGENCE 2K26 – a national-level technical fest!",
  "cyber fort": "Cyber Fort is a cybersecurity fest by NIT's Department of Cybersecurity, happening on **March 11, 2026**.",
  events: "**Technical Events:**\n• Code Combat – Real-time coding duels\n• Kernel Challenge – OS & reverse engineering\n\n**Non-Technical Events:**\n• Think & Link – Connection puzzles\n• E-Sports – Gaming tournament\n• Logo Rush – Brand identification",
  "technical events": "🔧 **Technical Events:**\n1. **Code Combat** – Algorithmic battle royale\n2. **Kernel Challenge** – Deep OS & reverse engineering challenges",
  "non technical events": "🎮 **Non-Technical Events:**\n1. **Think & Link** – Pattern connections game\n2. **E-Sports** – Competitive gaming\n3. **Logo Rush** – Logo identification challenge",
  fee: "💰 Entry Fee:\n• Individual: ₹250 per person\n• Group (min 6): ₹200 per person",
  fees: "💰 Entry Fee:\n• Individual: ₹250 per person\n• Group (min 6): ₹200 per person",
  "registration fee": "💰 Entry Fee:\n• Individual: ₹250 per person\n• Group (min 6): ₹200 per person\n\nScan the QR code on the poster to register!",
  register: "To register, scan the QR code or contact:\n📞 Student Coordinators:\n• S. Muthumani: 8098088892\n• S. Anusuya: 9629207480",
  contact: "📞 **Contacts:**\n\n**Faculty Coordinator:**\nP. Showmiya, Asst. Prof – Cyber\n📱 9384949279\n\n**Student Coordinators:**\n• S. Muthumani: 8098088892\n• S. Anusuya: 9629207480",
  date: "📅 Cyber Fort is on **March 11, 2026**! Mark your calendars, soldier.",
  schedule: "⏰ Event starts at 8:30 AM with registration. Inauguration at 9:30 AM, events through the day, prize distribution at 4:30 PM.",
  venue: "🏛️ Nehru Institute of Technology (Autonomous), Coimbatore – 641 105, Tamil Nadu.",
  college: "🏛️ **Nehru Institute of Technology (Autonomous)** – Approved by AICTE, Recognized by UGC, Accredited by NAAC 'A+', NBA Accredited.",
  price: "💰 ₹250 per person | ₹200 for groups of 6+",
  winner: "🏆 Exciting prizes await the winners! Details will be announced at the event.",
  prize: "🏆 Prizes will be announced at the venue. Stay tuned!",
};

function getBotResponse(input) {
  const lower = input.toLowerCase().trim();
  for (const key of Object.keys(BOT_RESPONSES)) {
    if (lower.includes(key)) return BOT_RESPONSES[key];
  }
  return "🤖 Hmm, I don't have data on that. Try asking about: events, fees, registration, contact, date, or schedule.";
}

const TERMINAL_RESPONSES = {
  help: `Available commands:
  help      → Show this list
  about     → About Cyber Fort
  events    → List all events
  register  → Registration info
  contact   → Contact numbers
  date      → Event date
  clear     → Clear terminal
  hack      → Try your luck
  matrix    → Trigger matrix rain`,
  about: `CYBER FORT v2026.1
  Department: Cybersecurity
  College: Nehru Institute of Technology
  Parent Event: CONVERGENCE 2K26
  Type: National Level Technical Symposium
  Date: March 11, 2026`,
  events: `[TECHNICAL]
  01. CODE COMBAT
  02. KERNEL CHALLENGE

[NON-TECHNICAL]
  03. THINK & LINK (CONNECTIONS)
  04. E-SPORTS
  05. LOGO RUSH`,
  register: `Registration Details:
  Individual: Rs.250 per person
  Group (min 6): Rs.200 per person
  
  Coordinators:
  > S. Muthumani  : 8098088892
  > S. Anusuya    : 9629207480`,
  contact: `Faculty Coordinator:
  > P. Showmiya, Asst. Prof
  > Ph: 9384949279

Student Coordinators:
  > S. Muthumani : 8098088892
  > S. Anusuya   : 9629207480`,
  date: `EVENT DATE: MARCH 11, 2026
  Time: 08:30 AM onwards
  Venue: Nehru Institute of Technology`,
  hack: `██████████████████████████████
  ACCESS DENIED
  ██████████████████████████████
  Unauthorized intrusion detected.
  Your IP has been logged.
  FBI IS ON ITS WAY. 😈`,
  clear: "__CLEAR__",
  matrix: "__MATRIX__",
};

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useCountdown(target) {
  const [time, setTime] = useState({});
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) return setTime({ d: 0, h: 0, m: 0, s: 0 });
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);
  return time;
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function GlitchText({ text, className = "" }) {
  return (
    <span className={`glitch-wrap ${className}`} data-text={text}>
      {text}
    </span>
  );
}

function MatrixRain({ active }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const cols = Math.floor(canvas.width / 14);
    const drops = Array(cols).fill(1);
    const chars = "アイウエオカキクケコ01アBCDEFGHIJサシスセソ</>{}[]";
    let anim;
    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff41";
      ctx.font = "13px monospace";
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 14, y * 14);
        if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: active ? 0.15 : 0 }}
    />
  );
}

// Loading Screen
function LoadingScreen({ onDone }) {
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);
  const sequence = [
    { text: "SYSTEM BOOTING...", delay: 400 },
    { text: "> Initializing Cyber Fort...", delay: 900 },
    { text: "> Loading cybersecurity protocols...", delay: 1400 },
    { text: "> Bypassing firewall [████████████] 100%", delay: 2000 },
    { text: "> Decrypting access credentials...", delay: 2600 },
    { text: "> Establishing secure channel...", delay: 3100 },
    { text: "✓ ACCESS GRANTED", delay: 3700, green: true },
    { text: "✓ Welcome to CYBER FORT 2026", delay: 4100, green: true },
  ];

  useEffect(() => {
    sequence.forEach(({ text, delay, green }) => {
      setTimeout(() => setLines((l) => [...l, { text, green }]), delay);
    });
    setTimeout(() => setDone(true), 4800);
    setTimeout(onDone, 5600);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "#000",
        transition: "opacity 0.8s",
        opacity: done ? 0 : 1,
        pointerEvents: done ? "none" : "all",
      }}
    >
      <div className="w-full max-w-xl px-8 font-mono text-sm">
        <div className="mb-6 text-center">
          <div style={{ color: "#ff0066", fontSize: "1.5rem", letterSpacing: "0.3em", fontWeight: 700 }}>
            NEHRU INSTITUTE OF TECHNOLOGY
          </div>
          <div style={{ color: "#888", fontSize: "0.75rem", letterSpacing: "0.2em" }}>DEPARTMENT OF CYBERSECURITY</div>
        </div>
        <div className="space-y-1">
          {lines.map((l, i) => (
            <div key={i} style={{ color: l.green ? "#00ff88" : "#00bfff", animation: "fadeIn 0.3s ease" }}>
              {l.text}
            </div>
          ))}
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 16,
              background: "#00bfff",
              animation: "blink 1s infinite",
              verticalAlign: "middle",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Countdown
function Countdown({ time }) {
  const pad = (n) => String(n).padStart(2, "0");
  const units = [
    { label: "DAYS", val: time.d },
    { label: "HRS", val: time.h },
    { label: "MIN", val: time.m },
    { label: "SEC", val: time.s },
  ];
  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {units.map(({ label, val }) => (
        <div key={label} className="countdown-box">
          <div className="countdown-num">{pad(val ?? 0)}</div>
          <div className="countdown-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

// Radial Nav
function RadialNav({ active, onSelect }) {
  const items = ["HOME", "ABOUT", "EVENTS", "SCHEDULE", "REGISTER", "CONTACT"];
  const radius = 90;
  return (
    <div className="radial-nav">
      <div
        className="radial-center"
        onClick={() => onSelect(null)}
        title="Close"
      >
        ✕
      </div>
      {items.map((item, i) => {
        const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <button
            key={item}
            className={`radial-item ${active === item ? "active" : ""}`}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            onClick={() => onSelect(item)}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

// Terminal
function Terminal({ onClose, onMatrix }) {
  const [history, setHistory] = useState([
    { type: "sys", text: "CYBER FORT TERMINAL v2026.1" },
    { type: "sys", text: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const submit = (e) => {
    e.preventDefault();
    if (!input.trim() || processing) return;
    const cmd = input.trim().toLowerCase();
    setHistory((h) => [...h, { type: "input", text: `$ ${input}` }]);
    setInput("");
    setProcessing(true);
    setTimeout(() => {
      setHistory((h) => [...h, { type: "sys", text: "Processing..." }]);
      setTimeout(() => {
        const resp = TERMINAL_RESPONSES[cmd];
        if (resp === "__CLEAR__") {
          setHistory([{ type: "sys", text: 'Terminal cleared. Type "help" for commands.' }]);
        } else if (resp === "__MATRIX__") {
          onMatrix();
          setHistory((h) => [...h.slice(0, -1), { type: "ok", text: "Matrix rain activated! Look at the background..." }]);
        } else if (resp) {
          setHistory((h) => [...h.slice(0, -1), { type: "ok", text: resp }]);
        } else {
          setHistory((h) => [...h.slice(0, -1), { type: "err", text: `Command not found: ${cmd}. Type "help".` }]);
        }
        setProcessing(false);
      }, 600);
    }, 200);
  };

  return (
    <div className="terminal-window">
      <div className="terminal-titlebar">
        <span style={{ color: "#ff5f56" }}>●</span>
        <span style={{ color: "#ffbd2e", marginLeft: 6 }}>●</span>
        <span style={{ color: "#27c93f", marginLeft: 6 }}>●</span>
        <span style={{ flex: 1, textAlign: "center", fontSize: "0.7rem", color: "#555", letterSpacing: "0.15em" }}>
          CYBER_FORT_TERMINAL
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}>✕</button>
      </div>
      <div className="terminal-body">
        {history.map((h, i) => (
          <div
            key={i}
            style={{
              color: h.type === "input" ? "#00bfff" : h.type === "err" ? "#ff4466" : h.type === "ok" ? "#00ff88" : "#888",
              whiteSpace: "pre-wrap",
              marginBottom: 4,
              fontSize: "0.8rem",
              fontFamily: "monospace",
            }}
          >
            {h.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="terminal-input-row">
        <span style={{ color: "#ff0066", fontFamily: "monospace" }}>$</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="type command..."
          autoFocus
          className="terminal-input"
        />
      </form>
    </div>
  );
}

// Chatbot
function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    { from: "bot", text: "👾 Hello! I'm CyBot. Ask me about Cyber Fort 2026!" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages((m) => [...m, { from: "user", text: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: getBotResponse(msg) }]);
    }, 900);
  };

  return (
    <div className="chatbot-window">
      <div className="chatbot-header">
        <div className="flex items-center gap-2">
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 6px #00ff88" }} />
          <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#00ff88", letterSpacing: "0.1em" }}>
            CYBOT v1.0
          </span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}>✕</button>
      </div>
      <div className="chatbot-body">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.from}`}>
            <div style={{ whiteSpace: "pre-wrap", fontSize: "0.82rem" }}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div className="chat-bubble bot">
            <span style={{ letterSpacing: "0.3em", color: "#555" }}>●●●</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="chatbot-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask CyBot..."
          className="chatbot-input"
        />
        <button type="submit" className="chatbot-send">➤</button>
      </form>
    </div>
  );
}

// Event Card
function EventCard({ name, desc, icon, color }) {
  return (
    <div className="event-card" style={{ "--glow": color }}>
      <div className="event-icon">{icon}</div>
      <div className="event-name">{name}</div>
      <div className="event-desc">{desc}</div>
    </div>
  );
}

// Main App
export default function App() {
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("HOME");
  const [showTerminal, setShowTerminal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [matrixActive, setMatrixActive] = useState(false);
  const countdown = useCountdown(TARGET_DATE);
  const bgRef = useRef(null);

  // Particle canvas
  useEffect(() => {
    const canvas = bgRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      color: ["#ff0066", "#9000ff", "#00bfff"][Math.floor(Math.random() * 3)],
    }));
    let anim;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      anim = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(anim); window.removeEventListener("resize", resize); };
  }, [loading]);

  const handleNav = (section) => {
    if (section) {
      setActiveSection(section);
      setNavOpen(false);
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    } else {
      setNavOpen(false);
    }
  };

  if (loading) return <LoadingScreen onDone={() => setLoading(false)} />;

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@300;400;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --pink: #ff0066;
          --purple: #9000ff;
          --blue: #00bfff;
          --green: #00ff88;
          --bg: #050508;
          --card-bg: rgba(255,255,255,0.03);
        }

        body { background: var(--bg); color: #fff; overflow-x: hidden; }

        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
        @keyframes glitch1 {
          0%,100% { clip-path: inset(0 0 95% 0); transform: translate(-3px,0) }
          20% { clip-path: inset(30% 0 60% 0); transform: translate(3px,0) }
          40% { clip-path: inset(70% 0 20% 0); transform: translate(-3px,0) }
          60% { clip-path: inset(50% 0 40% 0); transform: translate(2px,0) }
          80% { clip-path: inset(10% 0 80% 0); transform: translate(-2px,0) }
        }
        @keyframes glitch2 {
          0%,100% { clip-path: inset(80% 0 5% 0); transform: translate(3px,0) }
          20% { clip-path: inset(20% 0 70% 0); transform: translate(-3px,0) }
          40% { clip-path: inset(60% 0 30% 0); transform: translate(3px,0) }
          60% { clip-path: inset(40% 0 50% 0); transform: translate(-2px,0) }
          80% { clip-path: inset(5% 0 85% 0); transform: translate(2px,0) }
        }
        @keyframes neonFlicker {
          0%,19%,21%,23%,25%,54%,56%,100% { text-shadow: 0 0 10px var(--pink), 0 0 20px var(--pink), 0 0 40px var(--pink) }
          20%,24%,55% { text-shadow: none }
        }
        @keyframes scanline {
          0% { top: -100% } 100% { top: 100% }
        }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }

        .app {
          font-family: 'Rajdhani', sans-serif;
          min-height: 100vh;
        }

        /* BG canvas */
        .bg-canvas {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        /* Scanline overlay */
        .scanline {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }
        .scanline::after {
          content: '';
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(transparent, rgba(0,191,255,0.06), transparent);
          animation: scanline 4s linear infinite;
        }

        /* Grid overlay */
        .grid-overlay {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(0,191,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,191,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        main { position: relative; z-index: 2; }

        /* NAVBAR */
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: rgba(5,5,8,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,0,102,0.2);
        }
        .navbar-logo {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--pink);
          text-shadow: 0 0 12px var(--pink);
          letter-spacing: 0.2em;
        }
        .navbar-links {
          display: flex;
          gap: 1.5rem;
          list-style: none;
        }
        @media (max-width: 768px) {
          .navbar-links { display: none }
        }
        .navbar-links a {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.75rem;
          color: #aaa;
          text-decoration: none;
          letter-spacing: 0.15em;
          transition: color 0.2s;
        }
        .navbar-links a:hover { color: var(--blue); text-shadow: 0 0 8px var(--blue); }

        .nav-toggle {
          background: none;
          border: 1px solid var(--pink);
          color: var(--pink);
          padding: 0.4rem 0.8rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem;
          cursor: pointer;
          letter-spacing: 0.1em;
          transition: all 0.2s;
        }
        .nav-toggle:hover { background: var(--pink); color: #000; }

        /* RADIAL NAV OVERLAY */
        .radial-overlay {
          position: fixed;
          inset: 0;
          z-index: 45;
          background: rgba(0,0,0,0.92);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .radial-nav {
          position: relative;
          width: 260px;
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .radial-center {
          position: absolute;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: rgba(255,0,102,0.15);
          border: 2px solid var(--pink);
          color: var(--pink);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          z-index: 2;
          transition: all 0.2s;
        }
        .radial-center:hover { background: var(--pink); color: #000; }
        .radial-item {
          position: absolute;
          background: rgba(0,191,255,0.08);
          border: 1px solid rgba(0,191,255,0.3);
          color: #fff;
          padding: 0.4rem 0.6rem;
          font-family: 'Orbitron', sans-serif;
          font-size: 0.6rem;
          cursor: pointer;
          letter-spacing: 0.1em;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .radial-item:hover, .radial-item.active {
          background: rgba(0,191,255,0.25);
          border-color: var(--blue);
          color: var(--blue);
          box-shadow: 0 0 12px rgba(0,191,255,0.4);
        }

        /* SECTIONS */
        section {
          min-height: 100vh;
          padding: 6rem 1.5rem 4rem;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* HERO */
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1.5rem;
          min-height: 100vh;
          padding-top: 5rem;
        }
        .hero-subtitle {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.8rem;
          color: var(--blue);
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }
        .hero-title-wrap {
          position: relative;
          display: inline-block;
        }
        .glitch-wrap {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(3rem, 10vw, 7rem);
          font-weight: 900;
          color: #fff;
          position: relative;
          display: inline-block;
          text-shadow: 0 0 30px rgba(255,0,102,0.5);
        }
        .glitch-wrap::before, .glitch-wrap::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
        }
        .glitch-wrap::before {
          color: var(--pink);
          animation: glitch1 3.5s infinite;
          animation-delay: 0.5s;
        }
        .glitch-wrap::after {
          color: var(--blue);
          animation: glitch2 3.5s infinite;
          animation-delay: 1s;
        }

        .hero-desc {
          font-size: 1rem;
          color: #aaa;
          max-width: 500px;
          line-height: 1.6;
          letter-spacing: 0.05em;
        }
        .hero-date {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.1rem;
          color: var(--purple);
          letter-spacing: 0.2em;
          text-shadow: 0 0 12px var(--purple);
        }

        /* COUNTDOWN */
        .countdown-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,0,102,0.3);
          padding: 0.8rem 1.2rem;
          min-width: 70px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .countdown-box::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,0,102,0.08), transparent);
        }
        .countdown-num {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--pink);
          text-shadow: 0 0 12px var(--pink);
          line-height: 1;
        }
        .countdown-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.6rem;
          color: #555;
          letter-spacing: 0.2em;
          margin-top: 4px;
        }

        /* ENTER BUTTON */
        .enter-btn {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          color: #000;
          background: var(--pink);
          border: none;
          padding: 0.9rem 2.5rem;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
          box-shadow: 0 0 20px rgba(255,0,102,0.5);
        }
        .enter-btn:hover {
          box-shadow: 0 0 40px rgba(255,0,102,0.8), 0 0 80px rgba(255,0,102,0.3);
          transform: scale(1.05);
        }

        /* SECTION HEADING */
        .section-heading {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
          letter-spacing: 0.1em;
        }
        .section-line {
          height: 2px;
          background: linear-gradient(to right, var(--pink), var(--purple), transparent);
          margin-bottom: 2.5rem;
          max-width: 300px;
        }

        /* ABOUT */
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 1rem;
        }
        @media (max-width: 640px) { .about-grid { grid-template-columns: 1fr } }
        .about-card {
          background: var(--card-bg);
          border: 1px solid rgba(144,0,255,0.3);
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }
        .about-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 3px; height: 100%;
          background: var(--purple);
          box-shadow: 0 0 10px var(--purple);
        }
        .about-card-title {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.7rem;
          color: var(--purple);
          letter-spacing: 0.2em;
          margin-bottom: 0.5rem;
        }
        .about-card-val {
          font-size: 1rem;
          color: #ddd;
          line-height: 1.5;
        }

        /* EVENTS */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.2rem;
        }
        .event-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(var(--glow-rgb, 255,0,102),0.25);
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          cursor: default;
          --glow-rgb: 255,0,102;
        }
        .event-card:hover {
          border-color: var(--glow, var(--pink));
          box-shadow: 0 0 20px rgba(255,0,102,0.2), inset 0 0 20px rgba(255,0,102,0.05);
          transform: translateY(-4px);
        }
        .event-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: var(--glow, var(--pink));
          box-shadow: 0 0 8px var(--glow, var(--pink));
        }
        .event-icon { font-size: 2rem; margin-bottom: 0.75rem; }
        .event-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
          letter-spacing: 0.1em;
        }
        .event-desc { font-size: 0.88rem; color: #888; line-height: 1.5; }

        .events-section-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.75rem;
          color: var(--blue);
          letter-spacing: 0.3em;
          margin: 2rem 0 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .events-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, rgba(0,191,255,0.4), transparent);
        }

        /* SCHEDULE */
        .timeline { position: relative; padding-left: 2rem; }
        .timeline::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, var(--pink), var(--purple), transparent);
        }
        .timeline-item {
          position: relative;
          padding: 1.2rem 1.2rem 1.2rem 1.5rem;
          margin-bottom: 1rem;
          background: var(--card-bg);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.2s;
        }
        .timeline-item:hover {
          border-color: rgba(255,0,102,0.3);
          transform: translateX(4px);
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -2.4rem;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--pink);
          box-shadow: 0 0 8px var(--pink);
        }
        .timeline-time {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.75rem;
          color: var(--pink);
          letter-spacing: 0.1em;
          margin-bottom: 0.3rem;
        }
        .timeline-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.2rem;
        }
        .timeline-desc { font-size: 0.85rem; color: #666; }

        /* REGISTRATION */
        .reg-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 500px) { .reg-cards { grid-template-columns: 1fr } }
        .reg-card {
          padding: 2rem;
          border: 1px solid rgba(255,0,102,0.3);
          background: rgba(255,0,102,0.04);
          text-align: center;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }
        .reg-card.featured {
          border-color: var(--pink);
          box-shadow: 0 0 30px rgba(255,0,102,0.15);
        }
        .reg-card:hover { transform: translateY(-6px); }
        .reg-type {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.7rem;
          color: #888;
          letter-spacing: 0.2em;
          margin-bottom: 0.5rem;
        }
        .reg-price {
          font-family: 'Orbitron', sans-serif;
          font-size: 2.5rem;
          font-weight: 900;
          color: var(--pink);
          text-shadow: 0 0 15px var(--pink);
          line-height: 1;
          margin-bottom: 0.3rem;
        }
        .reg-unit { font-size: 0.85rem; color: #666; }
        .reg-note { font-size: 0.8rem; color: var(--blue); margin-top: 0.8rem; }

        /* CONTACT */
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.2rem;
        }
        .contact-card {
          background: var(--card-bg);
          border: 1px solid rgba(0,191,255,0.2);
          padding: 1.5rem;
          transition: all 0.2s;
        }
        .contact-card:hover {
          border-color: var(--blue);
          box-shadow: 0 0 15px rgba(0,191,255,0.15);
        }
        .contact-role {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.65rem;
          color: var(--blue);
          letter-spacing: 0.2em;
          margin-bottom: 0.5rem;
        }
        .contact-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: #ddd;
          margin-bottom: 0.3rem;
        }
        .contact-phone { font-size: 0.9rem; color: var(--pink); }

        /* TERMINAL */
        .terminal-fab {
          position: fixed;
          bottom: 5rem;
          left: 1.5rem;
          z-index: 50;
          background: rgba(0,0,0,0.9);
          border: 1px solid #00ff41;
          color: #00ff41;
          padding: 0.6rem 1rem;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.75rem;
          cursor: pointer;
          letter-spacing: 0.1em;
          transition: all 0.2s;
          box-shadow: 0 0 12px rgba(0,255,65,0.3);
        }
        .terminal-fab:hover { background: rgba(0,255,65,0.1); }

        .terminal-window {
          position: fixed;
          bottom: 8rem;
          left: 1rem;
          z-index: 60;
          width: min(420px, calc(100vw - 2rem));
          height: 340px;
          background: #0a0a0a;
          border: 1px solid #00ff41;
          box-shadow: 0 0 30px rgba(0,255,65,0.2);
          display: flex;
          flex-direction: column;
        }
        .terminal-titlebar {
          background: #111;
          padding: 0.4rem 0.8rem;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #1a1a1a;
          flex-shrink: 0;
        }
        .terminal-body {
          flex: 1;
          overflow-y: auto;
          padding: 0.8rem;
        }
        .terminal-input-row {
          display: flex;
          gap: 0.5rem;
          padding: 0.6rem 0.8rem;
          border-top: 1px solid #1a1a1a;
          flex-shrink: 0;
        }
        .terminal-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: #00bfff;
          font-family: monospace;
          font-size: 0.8rem;
        }

        /* CHATBOT */
        .chatbot-fab {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 50;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--pink);
          border: none;
          cursor: pointer;
          font-size: 1.4rem;
          box-shadow: 0 0 20px rgba(255,0,102,0.6);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chatbot-fab:hover { box-shadow: 0 0 35px rgba(255,0,102,0.9); transform: scale(1.1); }

        .chatbot-window {
          position: fixed;
          bottom: 5rem;
          right: 1.5rem;
          z-index: 60;
          width: min(340px, calc(100vw - 3rem));
          height: 420px;
          background: #080810;
          border: 1px solid rgba(255,0,102,0.4);
          box-shadow: 0 0 30px rgba(255,0,102,0.15);
          display: flex;
          flex-direction: column;
        }
        .chatbot-header {
          padding: 0.8rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          background: rgba(255,0,102,0.05);
        }
        .chatbot-body {
          flex: 1;
          overflow-y: auto;
          padding: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .chat-bubble {
          max-width: 85%;
          padding: 0.6rem 0.9rem;
          border-radius: 2px;
          font-size: 0.82rem;
          line-height: 1.4;
          white-space: pre-wrap;
        }
        .chat-bubble.user {
          background: rgba(255,0,102,0.15);
          border: 1px solid rgba(255,0,102,0.3);
          align-self: flex-end;
          color: #eee;
        }
        .chat-bubble.bot {
          background: rgba(0,191,255,0.05);
          border: 1px solid rgba(0,191,255,0.2);
          align-self: flex-start;
          color: #ccc;
        }
        .chatbot-input-row {
          display: flex;
          gap: 0.5rem;
          padding: 0.6rem 0.8rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .chatbot-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          outline: none;
          color: #ddd;
          padding: 0.4rem 0.6rem;
          font-size: 0.82rem;
          font-family: 'Rajdhani', sans-serif;
        }
        .chatbot-send {
          background: var(--pink);
          border: none;
          color: #fff;
          padding: 0.4rem 0.8rem;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .chatbot-send:hover { background: #cc0052; }

        /* FOOTER */
        footer {
          text-align: center;
          padding: 2rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.7rem;
          color: #333;
          letter-spacing: 0.1em;
          position: relative;
          z-index: 2;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px }
        ::-webkit-scrollbar-track { background: #0a0a0a }
        ::-webkit-scrollbar-thumb { background: var(--pink) }

        /* MATRIX overlay */
        .matrix-overlay {
          position: fixed;
          inset: 0;
          z-index: 3;
          pointer-events: none;
        }
      `}</style>

      {/* Background layers */}
      <canvas ref={bgRef} className="bg-canvas" />
      <div className="grid-overlay" />
      <div className="scanline" />
      {matrixActive && (
        <div className="matrix-overlay">
          <MatrixRain active={matrixActive} />
        </div>
      )}

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-logo">CYBER FORT</div>
        <ul className="navbar-links">
          {["HOME", "ABOUT", "EVENTS", "SCHEDULE", "REGISTER", "CONTACT"].map((s) => (
            <li key={s}>
              <a href={`#${s}`} onClick={(e) => { e.preventDefault(); document.getElementById(s)?.scrollIntoView({ behavior: "smooth" }); }}>
                {s}
              </a>
            </li>
          ))}
        </ul>
        <button className="nav-toggle" onClick={() => setNavOpen(true)}>⊹ MENU</button>
      </nav>

      {/* RADIAL NAV OVERLAY */}
      {navOpen && (
        <div className="radial-overlay" onClick={() => setNavOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <RadialNav active={activeSection} onSelect={handleNav} />
          </div>
        </div>
      )}

      <main>
        {/* HERO */}
        <section id="HOME" className="hero">
          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: "0.72rem", color: "#555", letterSpacing: "0.3em" }}>
            NEHRU INSTITUTE OF TECHNOLOGY (AUTONOMOUS)
          </div>
          <div className="hero-subtitle">DEPARTMENT OF CYBERSECURITY PRESENTS</div>
          <div>
            <div className="hero-subtitle" style={{ color: "#9000ff", marginBottom: "0.4rem" }}>CONVERGENCE 2K26</div>
            <GlitchText text="CYBER FORT" />
          </div>
          <div className="hero-desc">
            A national-level cybersecurity symposium where elite minds battle through code, cryptography, and creative challenges.
          </div>
          <div className="hero-date">[ MARCH 11, 2026 ]</div>

          <div>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: "0.65rem", color: "#444", letterSpacing: "0.2em", textAlign: "center", marginBottom: "0.75rem" }}>
              EVENT BEGINS IN
            </div>
            <Countdown time={countdown} />
          </div>

          <button
            className="enter-btn"
            onClick={() => document.getElementById("ABOUT")?.scrollIntoView({ behavior: "smooth" })}
          >
            ENTER SYSTEM
          </button>

          <div style={{ fontFamily: "'Share Tech Mono'", fontSize: "0.65rem", color: "#333", letterSpacing: "0.1em" }}>
            ▼ SCROLL TO EXPLORE ▼
          </div>
        </section>

        {/* ABOUT */}
        <section id="ABOUT">
          <div className="section-heading"><GlitchText text="ABOUT" /></div>
          <div className="section-line" />
          <p style={{ color: "#888", lineHeight: 1.7, marginBottom: "1.5rem", maxWidth: 600, fontFamily: "'Share Tech Mono'", fontSize: "0.85rem" }}>
            Cyber Fort is the flagship event of the Department of Cybersecurity, NIT Coimbatore. Part of CONVERGENCE 2K26 — a national-level technical symposium bringing together the brightest minds to solve real-world cyber challenges.
          </p>
          <div className="about-grid">
            {[
              { label: "EVENT", val: "CYBER FORT" },
              { label: "PARENT SYMPOSIUM", val: "CONVERGENCE 2K26" },
              { label: "ORGANIZED BY", val: "Department of Cybersecurity, NIT" },
              { label: "INSTITUTION", val: "Nehru Institute of Technology (Autonomous), Coimbatore" },
              { label: "DATE", val: "March 11, 2026" },
              { label: "PARTICIPATION", val: "Individual & Group (Min 6)" },
            ].map((item) => (
              <div key={item.label} className="about-card">
                <div className="about-card-title">{item.label}</div>
                <div className="about-card-val">{item.val}</div>
              </div>
            ))}
          </div>
        </section>

        {/* EVENTS */}
        <section id="EVENTS">
          <div className="section-heading"><GlitchText text="EVENTS" /></div>
          <div className="section-line" />

          <div className="events-section-label">[ TECHNICAL EVENTS ]</div>
          <div className="events-grid">
            {TECH_EVENTS.map((e) => (
              <EventCard key={e.name} {...e} color="var(--pink)" />
            ))}
          </div>

          <div className="events-section-label" style={{ color: "var(--blue)" }}>[ NON-TECHNICAL EVENTS ]</div>
          <div className="events-grid">
            {NON_TECH_EVENTS.map((e) => (
              <EventCard key={e.name} {...e} color="var(--blue)" />
            ))}
          </div>
        </section>

        {/* SCHEDULE */}
        <section id="SCHEDULE">
          <div className="section-heading"><GlitchText text="SCHEDULE" /></div>
          <div className="section-line" />
          <div className="timeline">
            {SCHEDULE.map((s) => (
              <div key={s.time} className="timeline-item">
                <div className="timeline-time">{s.time}</div>
                <div className="timeline-title">{s.title}</div>
                <div className="timeline-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* REGISTRATION */}
        <section id="REGISTER">
          <div className="section-heading"><GlitchText text="REGISTER" /></div>
          <div className="section-line" />
          <div className="reg-cards">
            <div className="reg-card featured">
              <div className="reg-type">INDIVIDUAL</div>
              <div className="reg-price">₹250</div>
              <div className="reg-unit">per person</div>
            </div>
            <div className="reg-card">
              <div className="reg-type">GROUP</div>
              <div className="reg-price">₹200</div>
              <div className="reg-unit">per person</div>
              <div className="reg-note">Minimum 6 members</div>
            </div>
          </div>
          <div style={{ background: "rgba(0,191,255,0.04)", border: "1px solid rgba(0,191,255,0.2)", padding: "1.2rem" }}>
            <div style={{ fontFamily: "'Share Tech Mono'", fontSize: "0.7rem", color: "var(--blue)", letterSpacing: "0.2em", marginBottom: "0.5rem" }}>HOW TO REGISTER</div>
            <p style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Scan the QR code on the event poster, or contact the student coordinators directly. On-spot registration available at the venue on event day.
            </p>
          </div>
        </section>

        {/* CONTACT */}
        <section id="CONTACT">
          <div className="section-heading"><GlitchText text="CONTACT" /></div>
          <div className="section-line" />
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-role">FACULTY COORDINATOR</div>
              <div className="contact-name">P. Showmiya</div>
              <div style={{ fontSize: "0.78rem", color: "#555", marginBottom: "0.4rem" }}>Asst. Prof – Cybersecurity</div>
              <div className="contact-phone">📱 9384949279</div>
            </div>
            <div className="contact-card">
              <div className="contact-role">STUDENT COORDINATOR</div>
              <div className="contact-name">S. Muthumani</div>
              <div className="contact-phone">📱 8098088892</div>
            </div>
            <div className="contact-card">
              <div className="contact-role">STUDENT COORDINATOR</div>
              <div className="contact-name">S. Anusuya</div>
              <div className="contact-phone">📱 9629207480</div>
            </div>
            <div className="contact-card">
              <div className="contact-role">VENUE</div>
              <div className="contact-name">Nehru Institute of Technology</div>
              <div style={{ fontSize: "0.82rem", color: "#666", marginTop: "0.3rem" }}>
                NH-544, Coimbatore – 641 105<br />Tamil Nadu, India
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div style={{ marginBottom: "0.4rem" }}>CYBER FORT 2026 · CONVERGENCE 2K26</div>
        <div>DEPARTMENT OF CYBERSECURITY · NEHRU INSTITUTE OF TECHNOLOGY</div>
      </footer>

      {/* TERMINAL FAB */}
      {!showTerminal && (
        <button className="terminal-fab" onClick={() => setShowTerminal(true)}>
          &gt;_ TERMINAL
        </button>
      )}
      {showTerminal && (
        <Terminal onClose={() => setShowTerminal(false)} onMatrix={() => {
          setMatrixActive(true);
          setTimeout(() => setMatrixActive(false), 8000);
        }} />
      )}

      {/* CHATBOT FAB */}
      {!showChatbot && (
        <button className="chatbot-fab" onClick={() => setShowChatbot(true)} title="Ask CyBot">
          🤖
        </button>
      )}
      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
}
