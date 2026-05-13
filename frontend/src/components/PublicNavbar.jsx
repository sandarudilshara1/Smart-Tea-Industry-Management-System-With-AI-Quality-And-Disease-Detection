import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 52px", height: 70,
      background: scrolled ? "rgba(11,26,14,0.94)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(180,210,79,0.1)" : "1px solid transparent",
      transition: "all 0.4s ease",
    }}>
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
        <Link to="/landing" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/assets/logo2.png" alt="GreenLeaf Logo" style={{ height: 40 }} />
        </Link>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 36, alignItems: "center" }}>
        <Link to="/landing" style={{
          color: "rgba(214,233,176,0.55)",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14,
          textDecoration: "none", fontWeight: 400, letterSpacing: "0.02em",
          transition: "color 0.2s"
        }} onMouseOver={e => e.currentTarget.style.color = "#d6e9b0"} onMouseOut={e => e.currentTarget.style.color = "rgba(214,233,176,0.55)"}>Home</Link>
        
        <a href="/landing#how-it-works" style={{
          color: "rgba(214,233,176,0.55)",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14,
          textDecoration: "none", fontWeight: 400, letterSpacing: "0.02em",
          transition: "color 0.2s"
        }} onMouseOver={e => e.currentTarget.style.color = "#d6e9b0"} onMouseOut={e => e.currentTarget.style.color = "rgba(214,233,176,0.55)"}>How it works</a>
        
        <a href="/landing#for-you" style={{
          color: "rgba(214,233,176,0.55)",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14,
          textDecoration: "none", fontWeight: 400, letterSpacing: "0.02em",
          transition: "color 0.2s"
        }} onMouseOver={e => e.currentTarget.style.color = "#d6e9b0"} onMouseOut={e => e.currentTarget.style.color = "rgba(214,233,176,0.55)"}>For you</a>
        
        <a href="/landing#faq" style={{
          color: "rgba(214,233,176,0.55)",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14,
          textDecoration: "none", fontWeight: 400, letterSpacing: "0.02em",
          transition: "color 0.2s"
        }} onMouseOver={e => e.currentTarget.style.color = "#d6e9b0"} onMouseOut={e => e.currentTarget.style.color = "rgba(214,233,176,0.55)"}>FAQ</a>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: 16, alignItems: "center" }}>
        <Link to="/signup" style={{
          color: "#d6e9b0", fontFamily: "'DM Sans', sans-serif", fontSize: 14, textDecoration: "none", fontWeight: 500
        }}>Sign up</Link>
        <Link to="/login" style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "#b4d24f", color: "#0b1a0e",
          border: "none", borderRadius: 100,
          padding: "11px 26px", fontSize: 14,
          fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          cursor: "pointer", textDecoration: "none",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }} onMouseOver={e => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 10px 25px rgba(180,210,79,0.3)";
        }} onMouseOut={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
        }}>
          Log in
        </Link>
      </div>
    </nav>
  );
}
