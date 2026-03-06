import { useState } from "react";

const API_BASE = "/api";

export default function App() {
  const [formState, setFormState] = useState({ status: "idle", message: "" });

  async function handleWaitlist(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    setFormState({ status: "loading", message: "" });
    try {
      const res = await fetch(`${API_BASE}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setFormState({ status: "success", message: json.message || "You're on the list!" });
      e.target.reset();
    } catch (err) {
      setFormState({ status: "error", message: err.message });
    }
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.brandRow}>
            <img src="/Dormly Cavicon.png" alt="Dormly" style={s.logo} />
            <div>
              <div style={s.brand}>Dormly</div>
              <div style={s.tag}>Student renting, matched + commute-aware</div>
            </div>
          </div>

          <nav style={s.nav}>
            <a style={s.link} href="#features">Features</a>
            <a style={s.link} href="#how">How it works</a>
            <a style={{ ...s.link, ...s.cta }} href="#waitlist">Join waitlist</a>
          </nav>
        </div>
      </header>

      <main style={s.main}>
        <section style={s.hero}>
          <div style={s.heroLeft}>
            <div style={s.badge}>Built for students + landowners</div>
            <h1 style={s.h1}>
              Match rentals by <span style={s.grad}>fit</span> — and compare places by{" "}
              <span style={s.grad}>real transit commutes</span>.
            </h1>
            <p style={s.lead}>
              Dormly connects students and landowners with a matchmaking system, optional roommate matching,
              and a public transit route calculator from the rental to campus.
            </p>

            <div style={s.btnRow}>
              <a href="#waitlist" style={{ ...s.btn, ...s.btnPrimary }}>Get early access</a>
              <a href="#features" style={{ ...s.btn, ...s.btnGhost }}>See features</a>
            </div>

            <div style={s.miniRow}>
              <Mini title="Commute-first" text="Bus/train routes + time estimates to your university." />
              <Mini title="Matchmaking" text="Shortlist renters/owners you actually like." />
              <Mini title="Multi-renter" text="Opt into shared rentals + roommate matches." />
            </div>
          </div>

          <div style={s.heroRight}>
            <div style={s.preview}>
              <div style={s.previewTop}>
                <div style={s.dots}>
                  <span style={{ ...s.dot, background: "#ff5f57" }} />
                  <span style={{ ...s.dot, background: "#febc2e" }} />
                  <span style={{ ...s.dot, background: "#28c840" }} />
                </div>
                <div style={s.previewTitle}>Dormly preview</div>
              </div>

              <div style={s.previewBody}>
                <Card label="Rental" value="2-bed near Midtown" sub="$850/mo • furnished • utilities included" />
                <div style={s.grid2}>
                  <Card label="Commute to campus" value="22 mins" sub="Bus → Train → Walk" />
                  <Card label="Match score" value="92%" sub="Quiet • clean • non-smoker" />
                </div>
                <div style={s.pills}>
                  <span style={s.pill}>Roommate matching</span>
                  <span style={s.pill}>Shortlist</span>
                  <span style={s.pill}>Schedule viewings</span>
                </div>
                <div style={s.grid2}>
                  <button style={{ ...s.btn, ...s.btnGhost, width: "100%" }}>Save</button>
                  <button style={{ ...s.btn, ...s.btnPrimary, width: "100%" }}>Request viewing</button>
                </div>
              </div>
            </div>
            <div style={s.note}>Prototype UI only — you’ll connect transit + matching data later.</div>
          </div>
        </section>

        <section id="features" style={s.section}>
          <h2 style={s.h2}>Features</h2>
          <div style={s.cards}>
            <Feature
              title="Student–Landowner Matchmaking"
              text="Match by budget, dates, rules, and lifestyle preferences — not just price."
            />
            <Feature
              title="Public Transit Route Calculator"
              text="See bus/train routes from any listing to your campus with commute time estimates."
            />
            <Feature
              title="Multi-Renter & Roommate Matching"
              text="Opt into shared rentals and match with compatible roommates before moving in."
            />
            <Feature
              title="Shortlist, Message, Schedule"
              text="Shortlist listings, chat, and set up viewings in one place."
            />
          </div>
        </section>

        <section id="how" style={s.section}>
          <h2 style={s.h2}>How it works</h2>
          <div style={s.steps}>
            <Step n="1" t="Build your profile" d="Campus, budget, move-in date, lifestyle and transit preferences." />
            <Step n="2" t="Match + shortlist" d="Get matches for rentals and (optionally) roommates." />
            <Step n="3" t="Compare commutes" d="Instant transit routes + commute times to campus." />
            <Step n="4" t="Connect" d="Message, book viewings, and finalize details." />
          </div>
        </section>

        <section id="waitlist" style={s.section}>
          <div style={s.wait}>
            <div>
              <h2 style={s.h2}>Join the waitlist</h2>
              <p style={s.p}>Get early access to Dormly when we launch.</p>
            </div>

            {formState.status === "success" ? (
              <div style={s.formMsg}>{formState.message}</div>
            ) : (
              <form style={s.form} onSubmit={handleWaitlist}>
                <input style={s.input} name="email" type="email" placeholder="Email" required />
                <select style={s.input} name="role" defaultValue="student">
                  <option value="student">I'm a student</option>
                  <option value="landowner">I'm a landowner</option>
                </select>
                <button
                  style={{ ...s.btn, ...s.btnPrimary, opacity: formState.status === "loading" ? 0.6 : 1 }}
                  type="submit"
                  disabled={formState.status === "loading"}
                >
                  {formState.status === "loading" ? "Submitting..." : "Get early access"}
                </button>
                {formState.status === "error" && (
                  <div style={s.formError}>{formState.message}</div>
                )}
              </form>
            )}
          </div>
        </section>
      </main>

      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <img src="/Dormly Logo + Favicon.png" alt="Dormly" style={s.footerLogo} />
            <span style={s.brand}>Dormly</span>
          </div>
          <div style={s.footerText}>© {new Date().getFullYear()} Dormly</div>
        </div>
      </footer>
    </div>
  );
}

function Mini({ title, text }) {
  return (
    <div style={s.mini}>
      <div style={s.miniTitle}>{title}</div>
      <div style={s.miniText}>{text}</div>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div style={s.card}>
      <div style={s.cardTitle}>{title}</div>
      <div style={s.cardText}>{text}</div>
    </div>
  );
}

function Step({ n, t, d }) {
  return (
    <div style={s.step}>
      <div style={s.stepN}>{n}</div>
      <div>
        <div style={s.stepT}>{t}</div>
        <div style={s.stepD}>{d}</div>
      </div>
    </div>
  );
}

function Card({ label, value, sub }) {
  return (
    <div style={s.box}>
      <div style={s.boxLabel}>{label}</div>
      <div style={s.boxValue}>{value}</div>
      <div style={s.boxSub}>{sub}</div>
    </div>
  );
}

const s = {
  page: {
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    color: "#2C3E86",
    background: "linear-gradient(180deg,#f0f6ff, #ffffff 35%, #f0f6ff)",
    minHeight: "100vh",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "rgba(240,246,255,0.88)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(44,62,134,0.08)",
  },
  headerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 10 },
  logo: {
    width: 48,
    height: 48,
    objectFit: "contain",
  },
  brand: { fontWeight: 900, letterSpacing: "-0.02em" },
  tag: { fontSize: 12.5, opacity: 0.7, fontWeight: 650 },
  nav: { display: "flex", gap: 12, alignItems: "center" },
  link: { textDecoration: "none", color: "#2C3E86", fontWeight: 750, opacity: 0.85 },
  cta: { padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(44,62,134,0.15)" },

  main: { maxWidth: 1100, margin: "0 auto", padding: "26px 18px 60px" },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 22,
    alignItems: "center",
    padding: "18px 0 8px",
  },
  heroLeft: { minWidth: 0 },
  heroRight: { minWidth: 0 },

  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(66,175,199,0.12)",
    border: "1px solid rgba(66,175,199,0.25)",
    color: "#2C3E86",
    fontWeight: 800,
    fontSize: 13,
    marginBottom: 12,
  },
  h1: { fontSize: 44, lineHeight: 1.1, margin: "0 0 12px", letterSpacing: "-0.03em" },
  
  lead: { margin: "0 0 16px", lineHeight: 1.6, fontSize: 16.5, color: "rgba(44,62,134,0.7)" },

  btnRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 },
  btn: {
    padding: "10px 14px",
    borderRadius: 14,
    fontWeight: 800,
    border: "1px solid rgba(44,62,134,0.15)",
    background: "white",
    cursor: "pointer",
    textDecoration: "none",
    color: "#2C3E86",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: { background: "#2F7FD6", color: "white", border: "1px solid #2F7FD6" },
  btnGhost: { background: "white" },

  miniRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  mini: {
    background: "white",
    border: "1px solid rgba(44,62,134,0.10)",
    borderRadius: 18,
    padding: 12,
    boxShadow: "0 10px 30px rgba(44,62,134,0.06)",
  },
  miniTitle: { fontWeight: 900, marginBottom: 4 },
  miniText: { fontSize: 13.5, opacity: 0.75, lineHeight: 1.5, fontWeight: 650 },

  preview: {
    background: "white",
    border: "1px solid rgba(44,62,134,0.10)",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 18px 50px rgba(44,62,134,0.08)",
  },
  previewTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    background: "rgba(47,127,214,0.04)",
    borderBottom: "1px solid rgba(44,62,134,0.08)",
  },
  dots: { display: "flex", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 999 },
  previewTitle: { fontSize: 13, fontWeight: 900, opacity: 0.7 },
  previewBody: { padding: 14, display: "grid", gap: 12 },
  box: { padding: 12, borderRadius: 16, background: "rgba(47,127,214,0.04)", border: "1px solid rgba(44,62,134,0.08)" },
  boxLabel: { fontSize: 12, fontWeight: 900, opacity: 0.65, marginBottom: 4 },
  boxValue: { fontWeight: 950, letterSpacing: "-0.02em" },
  boxSub: { fontSize: 12.5, opacity: 0.75, marginTop: 4, lineHeight: 1.35 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  pills: { display: "flex", gap: 8, flexWrap: "wrap" },
  pill: { fontSize: 12, fontWeight: 800, padding: "6px 10px", borderRadius: 999, background: "white", border: "1px solid rgba(44,62,134,0.10)", color: "#2C3E86" },
  note: { fontSize: 12.5, opacity: 0.7, marginTop: 10, fontWeight: 650 },

  section: { paddingTop: 34 },
  h2: { fontSize: 28, letterSpacing: "-0.02em", margin: "0 0 10px" },

  cards: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 12 },
  card: {
    background: "white",
    border: "1px solid rgba(44,62,134,0.10)",
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 10px 30px rgba(44,62,134,0.06)",
  },
  cardTitle: { fontWeight: 950, marginBottom: 6 },
  cardText: { fontSize: 14, lineHeight: 1.55, opacity: 0.75, fontWeight: 650 },

  steps: { display: "grid", gap: 10, marginTop: 12 },
  step: {
    background: "white",
    border: "1px solid rgba(44,62,134,0.10)",
    borderRadius: 18,
    padding: 14,
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    boxShadow: "0 10px 30px rgba(44,62,134,0.06)",
  },
  stepN: {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "rgba(47,127,214,0.12)",
    border: "1px solid rgba(47,127,214,0.25)",
    color: "#5BC3A6",
    fontWeight: 950,
  },
  stepT: { fontWeight: 950, marginBottom: 4 },
  stepD: { fontSize: 14, opacity: 0.75, fontWeight: 650, lineHeight: 1.55 },

  wait: {
    background: "white",
    border: "1px solid rgba(44,62,134,0.10)",
    borderRadius: 22,
    padding: 18,
    boxShadow: "0 18px 50px rgba(44,62,134,0.06)",
    display: "grid",
    gap: 12,
  },
  p: { margin: 0, opacity: 0.75, fontWeight: 650, lineHeight: 1.55 },
  form: { display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr", gap: 10, marginTop: 6 },
  input: { padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(44,62,134,0.14)", fontWeight: 700, outline: "none", color: "#2C3E86" },

  footer: { borderTop: "1px solid rgba(44,62,134,0.08)", padding: "22px 18px", marginTop: 40 },
  footerInner: { maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  footerBrand: { display: "flex", alignItems: "center", gap: 8 },
  footerLogo: { width: 40, height: 40, objectFit: "contain" },
  footerText: { opacity: 0.7, fontWeight: 700, fontSize: 13 },

  formMsg: { padding: 14, borderRadius: 14, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", fontWeight: 700, color: "#166534" },
  formError: { gridColumn: "1 / -1", fontSize: 13, fontWeight: 700, color: "#dc2626", marginTop: 2 },
};