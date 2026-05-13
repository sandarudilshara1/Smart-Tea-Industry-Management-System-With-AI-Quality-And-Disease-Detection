import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Crown, Factory, Sprout, Scale, CreditCard, Truck, Leaf, Car } from "lucide-react";

/* ── Keyframes & global styles ── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #0b1a0e; overflow-x: hidden; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(36px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -300% center; }
    100% { background-position:  300% center; }
  }
  @keyframes floatA {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-14px) rotate(1deg); }
  }
  @keyframes spinRing {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .gl-fade-up { animation: fadeUp 0.75s cubic-bezier(.22,1,.36,1) forwards; }

  .gl-btn-primary {
    display: inline-flex; align-items: center; gap: 10px;
    background: #b4d24f; color: #0b1a0e;
    border: none; border-radius: 100px;
    padding: 17px 38px; font-size: 15px;
    font-family: 'DM Sans', sans-serif; font-weight: 500;
    cursor: pointer; text-decoration: none;
    transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
    letter-spacing: 0.01em;
  }
  .gl-btn-primary:hover {
    background: #caeb5a; transform: translateY(-3px);
    box-shadow: 0 16px 48px rgba(180,210,79,0.38);
  }

  .gl-btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: #d6e9b0;
    border: 1px solid rgba(214,233,176,0.25); border-radius: 100px;
    padding: 16px 32px; font-size: 15px;
    font-family: 'DM Sans', sans-serif; font-weight: 400;
    cursor: pointer; text-decoration: none;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .gl-btn-ghost:hover {
    border-color: rgba(214,233,176,0.6);
    color: #fff; background: rgba(255,255,255,0.04);
  }

  .gl-nav-link {
    color: rgba(214,233,176,0.55);
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    text-decoration: none; font-weight: 400; letter-spacing: 0.02em;
    transition: color 0.2s;
  }
  .gl-nav-link:hover { color: #d6e9b0; }

  .gl-tag {
    display: inline-block;
    font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500;
    letter-spacing: 0.13em; text-transform: uppercase;
    color: #b4d24f; background: rgba(180,210,79,0.1);
    border: 1px solid rgba(180,210,79,0.22);
    border-radius: 100px; padding: 5px 15px;
  }

  .gl-role-card {
    border-radius: 22px;
    padding: 30px 26px 26px;
    position: relative; overflow: hidden;
    transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease;
    cursor: default; height: 100%;
  }
  .gl-role-card:hover {
    transform: translateY(-7px);
    box-shadow: 0 24px 60px rgba(0,0,0,0.35);
  }
  .gl-role-card::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at 70% 0%, rgba(255,255,255,0.04) 0%, transparent 60%);
    pointer-events: none;
  }

  .gl-scroll-reveal {
    opacity: 0; transform: translateY(30px);
    transition: opacity 0.75s cubic-bezier(.22,1,.36,1),
                transform 0.75s cubic-bezier(.22,1,.36,1);
  }
  .gl-scroll-reveal.vis { opacity: 1; transform: translateY(0); }

  .gl-ticker-wrap {
    overflow: hidden; white-space: nowrap;
    border-top: 1px solid rgba(180,210,79,0.1);
    border-bottom: 1px solid rgba(180,210,79,0.1);
    padding: 18px 0;
  }
  .gl-ticker-inner {
    display: inline-flex; gap: 64px;
    animation: ticker 28s linear infinite;
  }
  .gl-ticker-item {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    color: rgba(180,210,79,0.55); letter-spacing: 0.08em;
    text-transform: uppercase; font-weight: 400; flex-shrink: 0;
  }

  .gl-process-step {
    display: flex; align-items: flex-start; gap: 20px;
    padding: 28px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .gl-process-step:last-child { border-bottom: none; }

  .gl-testimonial {
    border-radius: 20px; padding: 32px;
    background: rgba(255,255,255,0.035);
    border: 1px solid rgba(255,255,255,0.07);
    transition: border-color 0.3s;
    display: flex; flex-direction: column;
    height: 100%;
  }
  .gl-testimonial:hover { border-color: rgba(180,210,79,0.2); }

  .gl-faq-item {
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .gl-faq-btn {
    width: 100%; background: none; border: none;
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 0; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 1rem;
    font-weight: 500; color: #e8f0d4; text-align: left;
    transition: color 0.2s;
  }
  .gl-faq-btn:hover { color: #b4d24f; }
  .gl-faq-answer {
    overflow: hidden;
    transition: max-height 0.4s ease, opacity 0.4s ease;
  }
`;

/* ── Scroll reveal hook ── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("vis"); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, delay = 0, style = {}, className = "" }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`gl-scroll-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/* ── Role data ── */
const roles = [
  {
    icon: <Crown size={24} color="#e8c96a" />, role: "Owner", headline: "Finally, full control.",
    body: "You built this factory. GreenLeaf gives you one living view of everything, revenue, staff, payments, output, so decisions come from data, not guesswork.",
    cta: "See the Owner view", accent: "#e8c96a",
    bg: "linear-gradient(145deg, #1e1a09, #141a0c)", border: "rgba(232,201,106,0.18)",
  },
  {
    icon: <Factory size={24} color="#7ec8a4" />, role: "Factory Manager", headline: "AI driven quality control.",
    body: "Run quality assessments through our ML models. Predict tea grades and market prices accurately, and coordinate inventory and suppliers from one screen.",
    cta: "See the Manager view", accent: "#7ec8a4",
    bg: "linear-gradient(145deg, #0a1e14, #0d1a0e)", border: "rgba(126,200,164,0.18)",
  },
  {
    icon: <Scale size={24} color="#b4d24f" />, role: "Inventory Manager", headline: "Catch bad leaf instantly.",
    body: "Use AI Disease Detection right at the weighing scale to prevent ruined batches. Fast, accurate leaf and bag weight entry with instant sync.",
    cta: "See the Inventory view", accent: "#b4d24f",
    bg: "linear-gradient(145deg, #141e08, #0d1a0e)", border: "rgba(180,210,79,0.18)",
  },
  {
    icon: <Truck size={24} color="#80b8e8" />, role: "Transport Manager", headline: "Routes that actually run.",
    body: "Build routes, assign drivers, and track vehicles from dispatch to delivery. No more calls, no more guessing where the truck is.",
    cta: "See the Transport view", accent: "#80b8e8",
    bg: "linear-gradient(145deg, #0a1220, #0d1218)", border: "rgba(128,184,232,0.18)",
  },
  {
    icon: <Leaf size={24} color="#68c898" />, role: "Supplier", headline: "Submit. Track. Get paid.",
    body: "Log your supply, see your intake confirmed in real time, and watch your payment come through without chasing anyone. Transparency you can count on.",
    cta: "See the Supplier view", accent: "#68c898",
    bg: "linear-gradient(145deg, #081e12, #0d1a0e)", border: "rgba(104,200,152,0.18)",
  },
  {
    icon: <Car size={24} color="#d4a8f0" />, role: "Driver", headline: "Just open the app and go.",
    body: "Your route, your stops, your schedule, all in one place before you start the engine. No confusion, no wasted trips.",
    cta: "See the Driver view", accent: "#d4a8f0",
    bg: "linear-gradient(145deg, #140e1e, #0e0d18)", border: "rgba(212,168,240,0.18)",
  },
];

const tickerItems = [
  "AI Quality Grading", "Machine Learning Pricing", "Smart Disease Detection", "Leaf intake",
  "Route optimization", "Driver assignment", "Supplier payments", "Loan management",
  "Live analytics", "Role based access", "Advance processing", "Real time Sync",
];

const process = [
  { num: "01", title: "Smart Leaf Intake.", body: "Suppliers log deliveries. The Inventory Manager records weights while AI scans for diseases, preventing ruined batches before they enter the factory.", accent: "#7ec8a4" },
  { num: "02", title: "AI Quality Grading.", body: "The Factory Manager inputs batch parameters. The ML model instantly predicts the final tea grade and calculates optimal market pricing.", accent: "#b4d24f" },
  { num: "03", title: "Logistics moves it.", body: "The Transport Manager builds routes. Drivers get their assignments. Fertilizer and finished product get where they need to go, on time.", accent: "#80b8e8" },
  { num: "04", title: "Everyone gets paid.", body: "The Payment Manager processes supplier payouts with bonuses based on AI quality scores, while the Owner oversees everything.", accent: "#e8c96a" },
];

const faqs = [
  { q: "How long does it take to get set up?", a: "Most factories are fully onboarded within a day. We handle the initial configuration for roles, rates, and supplier list, so your team can start on day one without a learning curve." },
  { q: "Do suppliers and drivers need to pay for access?", a: "No. Supplier and Driver accounts are included in your factory's subscription. Everyone on your supply chain gets access at no extra cost." },
  { q: "Can the Owner really see everything in one place?", a: "Yes. The Owner dashboard aggregates real time data from every module for inventory, payments, routes, fertilizer stock, in one unified view with charts, alerts, and financial summaries." },
  { q: "What happens to our data if we stop using GreenLeaf?", a: "Your data is always yours. Export everything including payments, supply records, inventory history, at any time in standard formats. No lock in." },
  { q: "Is it suitable for small factories or only large operations?", a: "GreenLeaf scales with you. Whether you have 10 suppliers or 200, one driver or a fleet — the system grows without changing how it feels to use." },
];

/* ── FAQ Item ── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="gl-faq-item">
      <button className="gl-faq-btn" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "1px solid rgba(180,210,79,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#b4d24f", fontSize: 18, flexShrink: 0, marginLeft: 16,
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.3s ease",
        }}>+</span>
      </button>
      <div className="gl-faq-answer" style={{ maxHeight: open ? 200 : 0, opacity: open ? 1 : 0 }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: "0.93rem",
          color: "rgba(214,233,176,0.6)", lineHeight: 1.75, paddingBottom: 24,
        }}>{a}</p>
      </div>
    </div>
  );
}

import PublicNavbar from "./PublicNavbar";

/* ══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ background: "#0b1a0e", color: "#e8f0d4", overflowX: "hidden" }}>

        {/* ══ NAV ══ */}
        <PublicNavbar />

        {/* ══ HERO ══ */}
        <section style={{
          minHeight: "100vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "130px 24px 60px",
          position: "relative", overflow: "hidden", textAlign: "center",
        }}>
          {/* BG */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{
              position: "absolute",
              width: "min(900px, 110vw)", height: "min(900px, 110vw)", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(180,210,79,0.07) 0%, transparent 65%)",
              top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            }} />
            <div style={{
              position: "absolute", width: 500, height: 500, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(126,200,164,0.06) 0%, transparent 70%)",
              bottom: "0%", right: "-10%",
            }} />
            <svg style={{
              position: "absolute", top: "12%", right: "6%", opacity: 0.12,
              animation: "spinRing 25s linear infinite",
            }} width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="92" fill="none" stroke="#b4d24f" strokeWidth="0.8" strokeDasharray="5 12" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="#7ec8a4" strokeWidth="0.5" strokeDasharray="3 9" />
            </svg>
            <svg style={{
              position: "absolute", bottom: "10%", left: "4%", opacity: 0.08,
              animation: "spinRing 35s linear infinite reverse",
            }} width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="64" fill="none" stroke="#e8c96a" strokeWidth="0.7" strokeDasharray="4 10" />
            </svg>
            {Array.from({ length: 22 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                width: [3, 2, 1.5, 2][i % 4], height: [3, 2, 1.5, 2][i % 4],
                borderRadius: "50%",
                background: ["#b4d24f", "#7ec8a4", "#e8c96a"][i % 3],
                opacity: 0.15 + (i % 5) * 0.07,
                top: `${8 + (i * 43) % 82}%`, left: `${4 + (i * 31) % 92}%`,
                animation: `pulse ${2.5 + (i % 3)}s ease-in-out ${(i * 0.3) % 2}s infinite`,
              }} />
            ))}
          </div>

          {/* Content */}
          <div style={{ position: "relative", maxWidth: 820 }}>
            <div className="gl-fade-up" style={{ animationDelay: "0.05s", opacity: 0, marginBottom: 22 }}>
              <span className="gl-tag">Sri Lanka's Tea Industry OS</span>
            </div>

            <h1 className="gl-fade-up" style={{
              animationDelay: "0.2s", opacity: 0,
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(3.2rem, 7.5vw, 6rem)",
              fontWeight: 700, lineHeight: 1.05,
              color: "#f2f7e8", marginBottom: 28, letterSpacing: "-0.025em",
            }}>
              The <span style={{
                fontStyle: "italic",
                background: "linear-gradient(100deg, #b4d24f 0%, #7ec8a4 45%, #e8c96a 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "shimmer 5s linear infinite",
              }}>AI powered</span> factory<br />
              platform built for tea.
            </h1>

            <p className="gl-fade-up" style={{
              animationDelay: "0.38s", opacity: 0,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              fontWeight: 300, lineHeight: 1.75,
              color: "rgba(214,233,176,0.65)",
              maxWidth: 580, margin: "0 auto 48px",
            }}>
              GreenLeaf replaces the clipboards, the spreadsheets, and the missed
              calls with one intelligent platform connecting every person in your
              factory from leaf intake to final payment.
            </p>

            <div className="gl-fade-up" style={{
              animationDelay: "0.52s", opacity: 0,
              display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
            }}>
              <Link to="/login" className="gl-btn-primary">
                Start for free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a href="#for-you" className="gl-btn-ghost">Find your role ↓</a>
            </div>

            {/* Trust stats */}
            <div className="gl-fade-up" style={{
              animationDelay: "0.7s", opacity: 0,
              marginTop: 68,
              display: "flex", justifyContent: "center", alignItems: "center",
              gap: 48, flexWrap: "wrap",
            }}>
              {[
                { val: "AI", label: "Disease Detection" },
                { val: "ML", label: "Quality Grading" },
                { val: "6", label: "Roles covered" },
                { val: "100%", label: "Supply chain visibility" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <p style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.9rem", fontWeight: 700, color: "#b4d24f", lineHeight: 1,
                  }}>{s.val}</p>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem",
                    color: "rgba(214,233,176,0.38)", textTransform: "uppercase",
                    letterSpacing: "0.07em", marginTop: 6,
                  }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TICKER ══ */}
        <div className="gl-ticker-wrap">
          <div className="gl-ticker-inner">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="gl-ticker-item">
                <span style={{ color: "#b4d24f", fontSize: 10 }}>✦</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ══ PROBLEM vs SOLUTION ══ */}
        <section style={{ padding: "110px 24px 100px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 56, alignItems: "start",
          }}>
            {/* Problem */}
            <Reveal>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem",
                fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase",
                color: "rgba(255,120,80,0.65)", marginBottom: 20,
              }}>The old way</p>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                fontWeight: 700, color: "#f2f7e8", lineHeight: 1.2, marginBottom: 32,
              }}>
                Running a tea factory<br />
                <span style={{ fontStyle: "italic", color: "rgba(214,233,176,0.38)" }}>
                  shouldn't feel like this.
                </span>
              </h2>
              {[
                "Suppliers calling to ask about payment status",
                "Drivers unsure which route to take today",
                "Owners piecing together weekly reports by hand",
                "Payment disputes because weight records don't match",
                "Fertilizer stockouts no one saw coming",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                  <span style={{ color: "rgba(255,100,80,0.45)", fontSize: 14, marginTop: 2, flexShrink: 0 }}>✕</span>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem",
                    color: "rgba(214,233,176,0.48)", lineHeight: 1.6,
                  }}>{item}</p>
                </div>
              ))}
            </Reveal>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
              <div style={{
                width: 1, height: 280,
                background: "linear-gradient(180deg, transparent, rgba(180,210,79,0.18), transparent)",
              }} />
            </div>

            {/* Solution */}
            <Reveal delay={120}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem",
                fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#b4d24f", marginBottom: 20,
              }}>The Smart AI Way</p>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                fontWeight: 700, color: "#f2f7e8", lineHeight: 1.2, marginBottom: 32,
              }}>
                Every person connected.<br />
                <span style={{ fontStyle: "italic", color: "#b4d24f" }}>
                  Every process visible.
                </span>
              </h2>
              {[
                "AI Disease Detection catches bad batches at the scale",
                "Machine Learning predicts tea grades and fair market pricing",
                "Suppliers track their AI calculated bonuses transparently",
                "Drivers open the app and see exactly where to go",
                "Owners have a live dashboard, always up to date",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                  <span style={{ color: "#b4d24f", fontSize: 14, marginTop: 2, flexShrink: 0 }}>✓</span>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem",
                    color: "rgba(214,233,176,0.72)", lineHeight: 1.6,
                  }}>{item}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section id="how-it-works" style={{
          padding: "90px 24px 100px",
          borderTop: "1px solid rgba(180,210,79,0.08)",
          borderBottom: "1px solid rgba(180,210,79,0.08)",
        }}>
          <div style={{
            maxWidth: 1100, margin: "0 auto",
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 80, alignItems: "start",
          }}>
            <Reveal style={{ position: "sticky", top: 120 }}>
              <span className="gl-tag" style={{ marginBottom: 22, display: "inline-block" }}>
                How it works
              </span>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700, color: "#f2f7e8", lineHeight: 1.15, marginBottom: 22,
              }}>
                From first leaf<br />to final payment<br />
                <span style={{ fontStyle: "italic", color: "#b4d24f" }}>all in one flow.</span>
              </h2>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem",
                color: "rgba(214,233,176,0.5)", lineHeight: 1.75, marginBottom: 36,
              }}>
                We don't just digitize your paperwork. We integrate Machine Learning directly into your daily workflow, catching diseases early and grading tea flavors with precision.
              </p>
              <Link to="/login" className="gl-btn-primary" style={{ fontSize: 14, padding: "13px 28px" }}>
                See it in action →
              </Link>
            </Reveal>

            <div>
              {process.map((step, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="gl-process-step">
                    <div style={{
                      flexShrink: 0, width: 52, height: 52, borderRadius: 14,
                      background: `${step.accent}12`, border: `1px solid ${step.accent}28`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1rem", fontWeight: 700, color: step.accent,
                      }}>{step.num}</span>
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.2rem", fontWeight: 600,
                        color: "#f2f7e8", marginBottom: 8,
                      }}>{step.title}</h3>
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem",
                        color: "rgba(214,233,176,0.55)", lineHeight: 1.7,
                      }}>{step.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ ROLES ══ */}
        <section id="for-you" style={{ padding: "100px 24px 100px", maxWidth: 1260, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 64 }}>
            <span className="gl-tag" style={{ marginBottom: 22, display: "inline-block" }}>
              Built for every role
            </span>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
              fontWeight: 700, color: "#f2f7e8", lineHeight: 1.1, marginBottom: 18,
            }}>
              Which one are you?
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: "1rem",
              color: "rgba(214,233,176,0.5)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7,
            }}>
              GreenLeaf isn't one generic tool. It's six purpose built workspaces,
              each one designed around what that person actually does every day.
            </p>
          </Reveal>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
            gap: 32,
          }}>
            {roles.map((r, i) => (
              <Reveal key={r.role} delay={i * 60}>
                <div className="gl-role-card" style={{ background: r.bg, border: `1px solid ${r.border}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 14,
                      background: `${r.accent}15`, border: `1px solid ${r.accent}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{r.icon}</div>
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: "10px",
                      fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: r.accent, background: `${r.accent}12`,
                      border: `1px solid ${r.accent}22`, borderRadius: 100, padding: "4px 10px",
                    }}>{r.role}</span>
                  </div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.28rem", fontWeight: 600,
                    color: "#f2f7e8", lineHeight: 1.2, marginBottom: 12,
                  }}>{r.headline}</h3>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem",
                    color: "rgba(214,233,176,0.58)", lineHeight: 1.7, marginBottom: 24,
                  }}>{r.body}</p>
                  <Link to="/login" style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem",
                    fontWeight: 500, color: r.accent, textDecoration: "none",
                    borderBottom: `1px solid ${r.accent}30`, paddingBottom: 2,
                    transition: "border-color 0.2s",
                  }}>{r.cta} →</Link>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section style={{
          padding: "90px 24px 100px",
          background: "rgba(180,210,79,0.018)",
          borderTop: "1px solid rgba(180,210,79,0.08)",
          borderBottom: "1px solid rgba(180,210,79,0.08)",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
              <span className="gl-tag" style={{ marginBottom: 22, display: "inline-block" }}>
                From the factory floor
              </span>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700, color: "#f2f7e8", lineHeight: 1.15,
              }}>
                The people inside the factory<br />
                <span style={{ fontStyle: "italic", color: "#b4d24f" }}>speak for themselves.</span>
              </h2>
            </Reveal>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {[
                { quote: "Before GreenLeaf, I spent Monday mornings building last week's report from six different notebooks. Now I open one screen and it's all there live.", name: "Ravindra S.", role: "Factory Owner, Kandy", accent: "#e8c96a" },
                { quote: "My drivers stopped calling me for route details the first week. They open the app, they see the job, they go. That alone was worth it.", name: "Chaminda P.", role: "Transport Manager, Nuwara Eliya", accent: "#80b8e8" },
                { quote: "I always had to go to the factory to ask about my payment. Now I just check GreenLeaf. It shows my weight records, what I'm owed, when it's coming.", name: "Suresh M.", role: "Tea Supplier, Matale", accent: "#68c898" },
                { quote: "I was skeptical, I've been logging weights by hand for eleven years. The transition took one afternoon. Everything's cleaner and I make zero entry mistakes.", name: "Priyanka J.", role: "Inventory Manager, Hatton", accent: "#b4d24f" },
              ].map((t, i) => (
                <Reveal key={i} delay={i * 70}>
                  <div className="gl-testimonial">
                    <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
                      {[...Array(5)].map((_, s) => (
                        <span key={s} style={{ color: "#b4d24f", fontSize: 13 }}>★</span>
                      ))}
                    </div>
                    <p style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1rem", fontStyle: "italic",
                      color: "rgba(214,233,176,0.82)", lineHeight: 1.75,
                      marginBottom: 24, flexGrow: 1,
                    }}>"{t.quote}"</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto" }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: "50%",
                        background: `${t.accent}18`, border: `1px solid ${t.accent}28`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem",
                        fontWeight: 500, color: t.accent, flexShrink: 0,
                      }}>{t.name.split(" ").map(n => n[0]).join("")}</div>
                      <div>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", fontWeight: 500, color: "#e8f0d4" }}>{t.name}</p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: t.accent }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FAQ ══ */}
        <section id="faq" style={{ padding: "100px 24px 100px", maxWidth: 760, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="gl-tag" style={{ marginBottom: 22, display: "inline-block" }}>FAQ</span>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 700, color: "#f2f7e8", lineHeight: 1.15,
            }}>
              Questions worth asking<br />
              <span style={{ fontStyle: "italic", color: "#b4d24f" }}>before you start.</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(180,210,79,0.1)",
              borderRadius: 20, padding: "8px 32px",
            }}>
              {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
            </div>
          </Reveal>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section style={{ padding: "0 24px 120px" }}>
          <Reveal>
            <div style={{
              maxWidth: 820, margin: "0 auto",
              border: "1px solid rgba(180,210,79,0.18)", borderRadius: 28,
              padding: "80px 56px", textAlign: "center",
              position: "relative", overflow: "hidden",
              background: "linear-gradient(145deg, rgba(180,210,79,0.055) 0%, rgba(126,200,164,0.035) 100%)",
            }}>
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse at 50% -10%, rgba(180,210,79,0.13) 0%, transparent 60%)",
              }} />
              <div style={{ position: "relative" }}>
                <span className="gl-tag" style={{ marginBottom: 24, display: "inline-block" }}>
                  Ready when you are
                </span>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                  fontWeight: 700, color: "#f2f7e8", lineHeight: 1.1, marginBottom: 20,
                }}>
                  Your factory.<br />
                  <span style={{ fontStyle: "italic", color: "#b4d24f" }}>Running at its best.</span>
                </h2>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: "1rem",
                  color: "rgba(214,233,176,0.55)", maxWidth: 440, margin: "0 auto 44px", lineHeight: 1.75,
                }}>
                  Join the factories that replaced chaos with clarity. Set up
                  in a day, results from week one.
                </p>
                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                  <Link to="/login" className="gl-btn-primary">
                    Get started, it's free
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <a href="#for-you" className="gl-btn-ghost">See all roles</a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ══ FOOTER ══ */}
        <footer style={{
          borderTop: "1px solid rgba(180,210,79,0.08)",
          padding: "44px 52px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, #b4d24f, #7ec8a4)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
            }}>🍃</div>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1rem", fontWeight: 600, color: "rgba(214,233,176,0.55)",
            }}>GreenLeaf</span>
          </div>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem",
            color: "rgba(214,233,176,0.25)",
          }}>© 2025 GreenLeaf. All rights reserved.</p>
          <div style={{ display: "flex", gap: 28 }}>
            {["Privacy", "Terms", "Contact"].map(l => (
              <a key={l} href="#" className="gl-nav-link" style={{ fontSize: 13 }}>{l}</a>
            ))}
          </div>
        </footer>

      </div>
    </>
  );
}