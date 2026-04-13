import { useEffect, useState, useCallback, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "";

/* ─── Design tokens injected globally ──────────────────────────────────────── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,800;1,9..144,300;1,9..144,600;1,9..144,800&family=Cabinet+Grotesk:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  :root {
    /* Dark blue + cyan palette */
    /* Deep Blue #2C3E86, Brand Blue #2F7FD6, Teal/Mint #5BC3A6, Aqua #42AFC7, White #FFFFFF */
    --bg:         #0b1024;              /* very dark blue base */
    --surface:    #151d3f;              /* slightly lighter deep blue */
    --surface2:   #1d274d;              /* card/background surfaces */
    --border:     rgba(255,255,255,0.06);
    --border2:    rgba(255,255,255,0.16);
    --fg:         #ffffff;
    --fg60:       rgba(255,255,255,0.60);
    --fg30:       rgba(255,255,255,0.30);
    --fg10:       rgba(255,255,255,0.10);
    --accent:     #42AFC7;              /* Aqua primary accent */
    --accent-dim: rgba(66,175,199,0.16);
    --accent-glow:rgba(66,175,199,0.32);
    --green:      #5BC3A6;              /* Teal/Mint, used for "success" */
    --green-dim:  rgba(91,195,166,0.18);
    --blue:       #2F7FD6;              /* Brand Blue */
    --blue-dim:   rgba(47,127,214,0.18);
    --gold:       #2C3E86;              /* Deep Blue repurposed as tertiary */
    --gold-dim:   rgba(44,62,134,0.25);
    --r-sm: 10px;
    --r-md: 16px;
    --r-lg: 24px;
    --r-xl: 32px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Cabinet Grotesk', sans-serif;
    background: var(--bg);
    color: var(--fg);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  ::selection { background: var(--accent); color: #fff; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spinAnim {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes blobFloat {
    0%, 100% { transform: translate(0,0) scale(1); }
    33% { transform: translate(30px,-20px) scale(1.05); }
    66% { transform: translate(-20px,15px) scale(0.97); }
  }
  @keyframes numberRoll {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .fade-up   { animation: fadeUp  0.65s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-1 { animation-delay: 0.05s; }
  .fade-up-2 { animation-delay: 0.15s; }
  .fade-up-3 { animation-delay: 0.25s; }
  .fade-up-4 { animation-delay: 0.35s; }
  .fade-up-5 { animation-delay: 0.45s; }
  .fade-up-6 { animation-delay: 0.55s; }
  .spin { animation: spinAnim 0.9s linear infinite; }

  .card-hover {
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease;
  }
  .card-hover:hover {
    transform: translateY(-3px);
    box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px var(--border2);
  }

  .btn-accent {
    background: var(--accent);
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: 'Cabinet Grotesk', sans-serif;
    font-weight: 700;
    transition: filter 0.15s ease, transform 0.1s ease;
  }
  .btn-accent:hover  { filter: brightness(1.12); }
  .btn-accent:active { transform: scale(0.97); }

  .btn-ghost {
    background: transparent;
    color: var(--fg);
    border: 1.5px solid var(--border2);
    cursor: pointer;
    font-family: 'Cabinet Grotesk', sans-serif;
    font-weight: 600;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .btn-ghost:hover { background: var(--fg10); border-color: var(--fg30); }

  input, select, textarea {
    font-family: 'Cabinet Grotesk', sans-serif;
    color: var(--fg);
    background: var(--surface2);
    border: 1.5px solid var(--border);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px var(--accent-glow);
  }
  input::placeholder, textarea::placeholder { color: var(--fg30); }
  select option { background: var(--surface2); color: var(--fg); }

  .nav-link {
    color: var(--fg60);
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
    padding: 7px 12px;
    border-radius: var(--r-sm);
    transition: color 0.15s, background 0.15s;
  }
  .nav-link:hover, .nav-link.active { color: var(--fg); background: var(--fg10); }

  .skeleton {
    background: linear-gradient(90deg, var(--surface2) 25%, var(--surface) 50%, var(--surface2) 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s ease infinite;
    border-radius: var(--r-sm);
  }

  .tab-btn {
    padding: 8px 18px;
    border-radius: var(--r-sm);
    border: 1.5px solid transparent;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: 'Cabinet Grotesk', sans-serif;
  }
  .tab-btn.active {
    background: var(--accent-dim);
    border-color: var(--accent);
    color: var(--accent);
  }
  .tab-btn:not(.active) {
    background: transparent;
    border-color: var(--border);
    color: var(--fg60);
  }
  .tab-btn:not(.active):hover {
    background: var(--fg10);
    border-color: var(--border2);
    color: var(--fg);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 99px;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  a { color: inherit; text-decoration: none; }

  .page { animation: fadeIn 0.35s ease both; }

  /* Noise texture overlay on blobs */
  .noise::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    border-radius: inherit;
  }
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = GLOBAL_STYLE;
  document.head.appendChild(style);
}

/* ─── Router (hash-based) ───────────────────────────────────────────────────── */
function useRoute() {
  const [route, setRoute] = useState(() => window.location.hash.replace("#", "") || "home");
  useEffect(() => {
    const handler = () => setRoute(window.location.hash.replace("#", "") || "home");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = useCallback((path) => {
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return [route, navigate];
}

/* ─── Auth persistence ──────────────────────────────────────────────────────── */
function getStoredAuth() {
  try { return JSON.parse(window.localStorage.getItem("dormly_auth")) || { user: null, token: null }; }
  catch { return { user: null, token: null }; }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [route, navigate] = useRoute();
  const [auth, setAuth] = useState(getStoredAuth);

  function login(authData) {
    setAuth(authData);
    window.localStorage.setItem("dormly_auth", JSON.stringify(authData));
  }
  function logout() {
    setAuth({ user: null, token: null });
    window.localStorage.removeItem("dormly_auth");
    navigate("home");
  }

  const sharedProps = { auth, login, logout, navigate };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Nav route={route} navigate={navigate} auth={auth} logout={logout} />
      <main style={{ flex: 1 }}>
        {route === "home"      && <HomePage     {...sharedProps} />}
        {route === "listings"  && <ListingsPage {...sharedProps} />}
        {route === "dashboard" && <DashboardPage {...sharedProps} />}
        {route === "profile"   && <ProfilePage  {...sharedProps} />}
        {route === "auth"      && <AuthPage      {...sharedProps} />}
        {route === "waitlist"  && <WaitlistPage  {...sharedProps} />}
        {!["home","listings","dashboard","profile","auth","waitlist"].includes(route) && <HomePage {...sharedProps} />}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════════════════════════ */
function Nav({ route, navigate, auth, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { key: "home",     label: "Home" },
    { key: "listings", label: "Browse" },
  ];
  if (auth?.user) links.push({ key: "dashboard", label: auth.user.role === "landlord" ? "My Listings" : "My Applications" });

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(13,13,13,0.82)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, background: "var(--accent)", borderRadius: 10,
            display: "grid", placeItems: "center", flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white" />
            </svg>
          </div>
          <span style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 21, color: "var(--fg)", letterSpacing: "-0.03em" }}>
            Dormly
          </span>
        </button>

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {links.map(l => (
            <button key={l.key} onClick={() => navigate(l.key)} className={`nav-link ${route === l.key ? "active" : ""}`}
              style={{ background: route === l.key ? "var(--fg10)" : "transparent", border: "none", cursor: "pointer", padding: "7px 14px", borderRadius: 8, fontSize: 14, fontWeight: 600, color: route === l.key ? "var(--fg)" : "var(--fg60)", transition: "all 0.15s" }}>
              {l.label}
            </button>
          ))}

          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 10px" }} />

          {auth?.user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => navigate("profile")} style={{
                display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 99,
                padding: "5px 12px 5px 6px", cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", background: "var(--accent-dim)",
                  border: "1.5px solid var(--accent)", display: "grid", placeItems: "center",
                  fontSize: 11, fontWeight: 800, color: "var(--accent)",
                }}>
                  {(auth.user.name || auth.user.email)?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>{auth.user.name || auth.user.email}</span>
              </button>
              <button onClick={logout} className="btn-ghost" style={{ padding: "7px 14px", borderRadius: 8, fontSize: 13 }}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigate("auth")} className="btn-ghost" style={{ padding: "8px 16px", borderRadius: 9, fontSize: 14 }}>
                Sign in
              </button>
              <button onClick={() => navigate("waitlist")} className="btn-accent" style={{ padding: "8px 18px", borderRadius: 9, fontSize: 14 }}>
                Get access
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════════════════════ */
function HomePage({ navigate, auth }) {
  const stats = [
    { value: "2,400+", label: "Students matched" },
    { value: "340+",   label: "Verified listings" },
    { value: "94%",    label: "Match satisfaction" },
    { value: "18 min", label: "Avg. campus commute" },
  ];

  const features = [
    {
      icon: "🚌", color: "var(--blue)", bg: "var(--blue-dim)",
      title: "Commute-aware search",
      desc: "Filter listings by real transit time to your campus. Bus, train, and walk times shown for every property.",
    },
    {
      icon: "🤝", color: "var(--green)", bg: "var(--green-dim)",
      title: "Roommate matching",
      desc: "Our compatibility quiz pairs you with roommates who share your lifestyle, schedule, and living preferences.",
    },
    {
      icon: "⚡", color: "var(--gold)", bg: "var(--gold-dim)",
      title: "Instant applications",
      desc: "Apply to multiple listings with one profile. Landlords get notified instantly with your full student profile.",
    },
    {
      icon: "🏠", color: "var(--accent)", bg: "var(--accent-dim)",
      title: "Verified landlords",
      desc: "Every property owner is identity-verified before listing. No scams, no surprises, just real rentals.",
    },
    {
      icon: "📊", color: "var(--blue)", bg: "var(--blue-dim)",
      title: "Smart analytics",
      desc: "Landlords get applicant dashboards with match scores, profiles, and communication tools all in one place.",
    },
    {
      icon: "💬", color: "var(--green)", bg: "var(--green-dim)",
      title: "Integrated messaging",
      desc: "Schedule viewings, ask questions, and coordinate move-in details without leaving the platform.",
    },
  ];

  return (
    <div className="page">
      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "90px 24px 80px", minHeight: "90vh", display: "flex", alignItems: "center" }}>
        {/* Ambient blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{
            position: "absolute", width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,113,74,0.18) 0%, transparent 70%)",
            top: -150, right: -100, animation: "blobFloat 12s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(91,155,213,0.12) 0%, transparent 70%)",
            bottom: -100, left: -80, animation: "blobFloat 16s ease-in-out infinite reverse",
          }} />
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            {/* Left */}
            <div>
              <div className="fade-up fade-up-1" style={{
                display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 28,
                padding: "5px 12px 5px 7px", borderRadius: 99,
                background: "var(--accent-dim)", border: "1px solid rgba(232,113,74,0.3)",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "block", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.06em", fontFamily: "DM Mono, monospace" }}>
                  NOW IN EARLY ACCESS
                </span>
              </div>

              <h1 className="fade-up fade-up-2" style={{
                fontFamily: "Fraunces, serif", fontWeight: 800,
                fontSize: 66, lineHeight: 1.02, letterSpacing: "-0.03em",
                marginBottom: 22,
              }}>
                Find your{" "}
                <span style={{ color: "var(--accent)", fontStyle: "italic" }}>perfect</span>
                {" "}student home.
              </h1>

              <p className="fade-up fade-up-3" style={{
                fontSize: 18, lineHeight: 1.72, color: "var(--fg60)",
                marginBottom: 36, maxWidth: 480,
              }}>
                Dormly connects students and landlords through smart matchmaking, roommate compatibility, and real commute estimates from every listing to your campus.
              </p>

              <div className="fade-up fade-up-4" style={{ display: "flex", gap: 12, marginBottom: 48 }}>
                <button onClick={() => navigate("listings")} className="btn-accent" style={{
                  padding: "14px 28px", borderRadius: 12, fontSize: 15,
                }}>
                  Browse listings
                </button>
                <button onClick={() => navigate("waitlist")} className="btn-ghost" style={{
                  padding: "14px 28px", borderRadius: 12, fontSize: 15,
                }}>
                  Join waitlist
                </button>
              </div>

              {/* Stats row */}
              <div className="fade-up fade-up-5" style={{ display: "flex", gap: 28, borderTop: "1px solid var(--border)", paddingTop: 28 }}>
                {stats.map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", color: "var(--fg)" }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--fg60)", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – preview card */}
            <div className="fade-up fade-up-3" style={{ display: "flex", justifyContent: "center" }}>
              <HeroCard navigate={navigate} />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "80px 24px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, letterSpacing: "0.12em", color: "var(--accent)", marginBottom: 12 }}>PLATFORM FEATURES</div>
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 44, letterSpacing: "-0.025em", marginBottom: 14 }}>
              Everything you need to find home
            </h2>
            <p style={{ fontSize: 16, color: "var(--fg60)", lineHeight: 1.65, maxWidth: 500, margin: "0 auto" }}>
              Built specifically for the student rental experience — from first search to move-in day.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
            {features.map((f, i) => (
              <div key={f.title} className="card-hover" style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: var_r_lg, padding: "28px 26px",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: f.bg, border: `1px solid ${f.color}22`,
                  display: "grid", placeItems: "center", fontSize: 20, marginBottom: 18,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18.5, letterSpacing: "-0.015em", marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14.5, color: "var(--fg60)", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, letterSpacing: "0.12em", color: "var(--accent)", marginBottom: 14 }}>HOW IT WORKS</div>
              <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 42, letterSpacing: "-0.025em", marginBottom: 18 }}>
                From search to signed in 3 steps
              </h2>
              <p style={{ fontSize: 16, color: "var(--fg60)", lineHeight: 1.7, marginBottom: 40 }}>
                Dormly streamlines the rental hunt so you spend less time scrolling Kijiji and more time settling in.
              </p>
              <button onClick={() => navigate(auth?.user ? "listings" : "auth")} className="btn-accent" style={{ padding: "13px 26px", borderRadius: 12, fontSize: 15 }}>
                {auth?.user ? "Browse listings" : "Create free account"}
              </button>
            </div>
            <div style={{ display: "grid", gap: 18 }}>
              {[
                { step: "01", title: "Create your profile", desc: "Tell us your university, budget, lifestyle habits, and commute preferences. Takes 2 minutes." },
                { step: "02", title: "Browse matched listings", desc: "See properties sorted by your compatibility score and real commute time. Apply with one click." },
                { step: "03", title: "Connect & move in", desc: "Message verified landlords, schedule viewings, and co-ordinate move-in dates — all on Dormly." },
              ].map(s => (
                <div key={s.step} style={{
                  display: "flex", gap: 20, alignItems: "flex-start",
                  padding: "22px 24px", borderRadius: var_r_md,
                  background: "var(--surface)", border: "1px solid var(--border)",
                }}>
                  <div style={{
                    fontFamily: "DM Mono, monospace", fontSize: 11, fontWeight: 500,
                    color: "var(--accent)", letterSpacing: "0.08em", flexShrink: 0,
                    marginTop: 3, minWidth: 28,
                  }}>{s.step}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 6 }}>{s.title}</div>
                    <div style={{ fontSize: 14, color: "var(--fg60)", lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ padding: "80px 24px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(232,113,74,0.15) 0%, rgba(91,155,213,0.08) 100%)",
            border: "1px solid rgba(232,113,74,0.25)", borderRadius: var_r_xl,
            padding: "60px 56px", textAlign: "center", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", width: 400, height: 400, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(232,113,74,0.15) 0%, transparent 70%)",
              top: -100, right: -80, pointerEvents: "none",
            }} />
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 46, letterSpacing: "-0.03em", marginBottom: 16, position: "relative" }}>
              Ready to find your place?
            </h2>
            <p style={{ fontSize: 17, color: "var(--fg60)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 32px", position: "relative" }}>
              Join thousands of students who found their perfect rental through Dormly's smart matching platform.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", position: "relative" }}>
              <button onClick={() => navigate("waitlist")} className="btn-accent" style={{ padding: "14px 30px", borderRadius: 12, fontSize: 16 }}>
                Join the waitlist
              </button>
              <button onClick={() => navigate("listings")} className="btn-ghost" style={{ padding: "14px 30px", borderRadius: 12, fontSize: 16 }}>
                View listings
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroCard({ navigate }) {
  return (
    <div style={{
      width: 380, background: "var(--surface)", borderRadius: var_r_xl,
      border: "1px solid var(--border2)", overflow: "hidden",
      boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
    }}>
      {/* Top bar */}
      <div style={{ background: "var(--surface2)", borderBottom: "1px solid var(--border)", padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#2C3E86","#2F7FD6","#42AFC7"].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        </div>
        <span style={{ fontFamily: "DM Mono, monospace", fontSize: 10.5, color: "var(--fg30)", letterSpacing: "0.06em" }}>DORMLY — LIVE MATCH</span>
      </div>

      {/* Photo placeholder */}
      <div style={{ height: 148, background: "linear-gradient(135deg, rgba(44,62,134,0.55), rgba(47,127,214,0.4))", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ fontSize: 48 }}>🏠</div>
        <div className="badge" style={{ position: "absolute", top: 12, right: 12, background: "var(--green-dim)", border: "1px solid rgba(91,195,166,0.35)", color: "var(--green)" }}>
          ✓ Verified
        </div>
      </div>

      <div style={{ padding: "18px 18px 20px" }}>
        {/* Listing title */}
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, marginBottom: 4, letterSpacing: "-0.01em" }}>
          Bright 2-bed · Midtown
        </div>
        <div style={{ fontSize: 13, color: "var(--fg60)", marginBottom: 16 }}>
          <span style={{ color: "var(--accent)", fontWeight: 800 }}>$875</span>/mo · furnished · utilities incl.
        </div>

        {/* Stat row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { icon: "🚌", label: "Commute", val: "22 min" },
            { icon: "⭐", label: "Match", val: "94%" },
            { icon: "👥", label: "Renters", val: "2 max" },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--surface2)", borderRadius: 10, padding: "10px 10px 9px",
              border: "1px solid var(--border)", textAlign: "center",
            }}>
              <div style={{ fontSize: 14, marginBottom: 3 }}>{s.icon}</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10.5, color: "var(--fg30)", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {["Quiet", "Non-smoker", "Night owl ok"].map(t => (
            <span key={t} className="badge" style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(232,113,74,0.2)" }}>{t}</span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button className="btn-ghost" style={{ padding: "10px", borderRadius: 10, fontSize: 13.5 }}>
            Save
          </button>
          <button onClick={() => navigate("listings")} className="btn-accent" style={{ padding: "10px", borderRadius: 10, fontSize: 13.5 }}>
            View listing
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LISTINGS PAGE
═══════════════════════════════════════════════════════════════════════════════ */
function ListingsPage({ auth, navigate }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [applyStatus, setApplyStatus] = useState({});
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => { loadListings(); }, []);

  async function loadListings() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/listings`);
      if (!res.ok) throw new Error();
      setListings(await res.json());
    } catch { setListings([]); }
    finally { setLoading(false); }
  }

  async function applyToListing(listingId) {
    if (!auth?.user || auth.user.role !== "student") {
      navigate("auth"); return;
    }
    const msg = window.prompt("Message to landlord (optional):", "Hi! I'm interested in this place.");
    if (msg === null) return;

    setApplyStatus(prev => ({ ...prev, [listingId]: "loading" }));
    try {
      const res = await fetch(`${API_BASE}/api/matching/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        },
        body: JSON.stringify({ listingId, message: msg, applicantEmail: auth.user.email }),
      });
      if (!res.ok) throw new Error();
      setApplyStatus(prev => ({ ...prev, [listingId]: "success" }));
    } catch {
      setApplyStatus(prev => ({ ...prev, [listingId]: "error" }));
    }
  }

  const filtered = listings.filter(l => {
    const q = search.toLowerCase();
    const matchText = !q || l.title?.toLowerCase().includes(q) || l.address?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q);
    const matchPrice = !maxPrice || l.price <= Number(maxPrice);
    return matchText && matchPrice;
  });

  return (
    <div className="page" style={{ padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 8 }}>BROWSE ACCOMMODATIONS</div>
            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 40, letterSpacing: "-0.025em" }}>
              Find your place
            </h1>
          </div>
          {auth?.user?.role === "landlord" && (
            <button onClick={() => navigate("dashboard")} className="btn-accent" style={{ padding: "11px 22px", borderRadius: 11, fontSize: 14 }}>
              + Post a listing
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, address, description…"
              style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: 11, fontSize: 14 }}
            />
          </div>
          <input
            type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            placeholder="Max price (CAD/mo)"
            style={{ width: 200, padding: "12px 14px", borderRadius: 11, fontSize: 14 }}
          />
          <button onClick={loadListings} className="btn-ghost" style={{ padding: "12px 18px", borderRadius: 11, fontSize: 14, whiteSpace: "nowrap" }}>
            ↻ Refresh
          </button>
        </div>

        {/* Count */}
        {!loading && (
          <div style={{ fontSize: 13.5, color: "var(--fg60)", marginBottom: 22 }}>
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
            {(search || maxPrice) && <span style={{ color: "var(--accent)", marginLeft: 6 }}>· filtered</span>}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ borderRadius: var_r_lg, overflow: "hidden", background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ height: 180 }} />
                <div style={{ padding: 20 }}>
                  <div className="skeleton" style={{ height: 18, width: "70%", marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 38, borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
            <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>No listings found</div>
            <div style={{ color: "var(--fg60)", marginBottom: 24 }}>
              {listings.length === 0 ? "Be the first to post a listing!" : "Try adjusting your filters."}
            </div>
            {auth?.user?.role === "landlord" && (
              <button onClick={() => navigate("dashboard")} className="btn-accent" style={{ padding: "12px 24px", borderRadius: 11, fontSize: 14 }}>
                Post a listing
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
            {filtered.map(l => (
              <ListingCard
                key={l.id} listing={l}
                applyStatus={applyStatus[l.id]}
                onApply={() => applyToListing(l.id)}
                onSelect={() => setSelectedListing(l)}
                isStudent={auth?.user?.role === "student"}
                isLoggedIn={!!auth?.user}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedListing && (
        <ListingModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          applyStatus={applyStatus[selectedListing.id]}
          onApply={() => applyToListing(selectedListing.id)}
          isStudent={auth?.user?.role === "student"}
          isLoggedIn={!!auth?.user}
          navigate={navigate}
        />
      )}
    </div>
  );
}

function ListingCard({ listing: l, applyStatus, onApply, onSelect, isStudent, isLoggedIn, navigate }) {
  const status = applyStatus;
  return (
    <div className="card-hover" style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: var_r_lg, overflow: "hidden",
    }}>
      {/* Photo */}
      <div style={{ height: 178, overflow: "hidden", position: "relative", cursor: "pointer" }} onClick={onSelect}>
        {Array.isArray(l.photos) && l.photos[0] ? (
          <img src={l.photos[0]} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
            onMouseEnter={e => e.target.style.transform = "scale(1.04)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          />
        ) : (
          <div style={{ height: "100%", background: "linear-gradient(135deg, rgba(232,113,74,0.2), rgba(91,155,213,0.15))", display: "grid", placeItems: "center", fontSize: 44 }}>
            🏠
          </div>
        )}
        {l.maxRenters && (
          <div className="badge" style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.7)", color: "var(--fg)", backdropFilter: "blur(8px)" }}>
            👥 {l.maxRenters} max
          </div>
        )}
        <div className="badge" style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.7)", color: "var(--green)", backdropFilter: "blur(8px)" }}>
          ✓ Active
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 18px 16px" }}>
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, marginBottom: 5, letterSpacing: "-0.01em", lineHeight: 1.3, cursor: "pointer" }} onClick={onSelect}>
          {l.title}
        </div>
        <div style={{ fontSize: 13, color: "var(--fg60)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--accent)", fontWeight: 800, fontSize: 15 }}>${l.price}</span>
          <span>/mo</span>
          <span style={{ color: "var(--fg30)" }}>·</span>
          <span>{l.address}</span>
        </div>

        {l.description && (
          <p style={{ fontSize: 13.5, color: "var(--fg60)", lineHeight: 1.6, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {l.description}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          <button onClick={onSelect} className="btn-ghost" style={{ padding: "10px", borderRadius: 10, fontSize: 13.5 }}>
            View details
          </button>
          {isStudent ? (
            <button
              onClick={onApply}
              disabled={status === "loading" || status === "success"}
              className="btn-accent"
              style={{
                padding: "10px", borderRadius: 10, fontSize: 13.5,
                background: status === "success" ? "var(--green)" : "var(--accent)",
                opacity: (status === "loading" || status === "success") ? 0.85 : 1,
              }}
            >
              {status === "loading" ? "Applying…" : status === "success" ? "✓ Applied" : "Apply now"}
            </button>
          ) : (
            <button onClick={() => navigate(isLoggedIn ? "listings" : "auth")} className="btn-accent" style={{ padding: "10px", borderRadius: 10, fontSize: 13.5 }}>
              {isLoggedIn ? "Enquire" : "Sign in"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ListingModal({ listing: l, onClose, applyStatus, onApply, isStudent, isLoggedIn, navigate }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "var(--surface)", borderRadius: var_r_xl,
        border: "1px solid var(--border2)", width: "100%", maxWidth: 560,
        maxHeight: "88vh", overflow: "auto",
        boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
      }}>
        {/* Photo */}
        <div style={{ height: 220, position: "relative", overflow: "hidden" }}>
          {Array.isArray(l.photos) && l.photos[0] ? (
            <img src={l.photos[0]} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ height: "100%", background: "linear-gradient(135deg, rgba(232,113,74,0.2), rgba(91,155,213,0.15))", display: "grid", placeItems: "center", fontSize: 56 }}>
              🏠
            </div>
          )}
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%",
            background: "rgba(0,0,0,0.6)", border: "none", color: "white", fontSize: 18, cursor: "pointer",
            display: "grid", placeItems: "center", backdropFilter: "blur(6px)",
          }}>×</button>
        </div>

        <div style={{ padding: "24px 28px 28px" }}>
          <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", marginBottom: 8 }}>{l.title}</h2>
          <div style={{ fontSize: 14, color: "var(--fg60)", marginBottom: 20 }}>
            <span style={{ color: "var(--accent)", fontWeight: 800, fontSize: 20 }}>${l.price}</span>/mo · {l.address}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 22 }}>
            {[
              { icon: "📍", label: "Location", val: l.address?.split(",")[0] || "—" },
              { icon: "👥", label: "Max renters", val: l.maxRenters ? `${l.maxRenters} people` : "Not specified" },
              { icon: "💰", label: "Monthly rent", val: `$${l.price} CAD` },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--surface2)", borderRadius: 12, padding: "14px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 12, color: "var(--fg30)", marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{s.val}</div>
              </div>
            ))}
          </div>

          {l.description && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--fg60)", marginBottom: 8 }}>DESCRIPTION</div>
              <p style={{ fontSize: 14.5, color: "var(--fg60)", lineHeight: 1.7 }}>{l.description}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            {isStudent ? (
              <button
                onClick={onApply}
                disabled={applyStatus === "loading" || applyStatus === "success"}
                className="btn-accent"
                style={{
                  flex: 1, padding: "13px", borderRadius: 12, fontSize: 15,
                  background: applyStatus === "success" ? "var(--green)" : "var(--accent)",
                }}
              >
                {applyStatus === "loading" ? "Applying…" : applyStatus === "success" ? "✓ Application sent" : "Apply to rent"}
              </button>
            ) : (
              <button onClick={() => { onClose(); navigate(isLoggedIn ? "listings" : "auth"); }} className="btn-accent" style={{ flex: 1, padding: "13px", borderRadius: 12, fontSize: 15 }}>
                {isLoggedIn ? "Contact landlord" : "Sign in to apply"}
              </button>
            )}
            <button onClick={onClose} className="btn-ghost" style={{ padding: "13px 20px", borderRadius: 12, fontSize: 15 }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
═══════════════════════════════════════════════════════════════════════════════ */
function DashboardPage({ auth, navigate }) {
  if (!auth?.user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, padding: 24 }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 28 }}>Sign in required</h2>
        <p style={{ color: "var(--fg60)", textAlign: "center" }}>You need an account to access your dashboard.</p>
        <button onClick={() => navigate("auth")} className="btn-accent" style={{ padding: "12px 28px", borderRadius: 12, fontSize: 15 }}>
          Sign in
        </button>
      </div>
    );
  }

  return auth.user.role === "landlord"
    ? <LandlordDashboard auth={auth} navigate={navigate} />
    : <StudentDashboard auth={auth} navigate={navigate} />;
}

function LandlordDashboard({ auth, navigate }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState({ status: "idle", message: "" });
  const [selectedListing, setSelectedListing] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => { loadMyListings(); }, []);

  async function loadMyListings() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/listings`);
      const all = await res.json();
      setListings(all.filter(l => l.ownerEmail === auth.user.email));
    } catch { setListings([]); }
    finally { setLoading(false); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    setCreateStatus({ status: "loading", message: "" });
    try {
      const res = await fetch(`${API_BASE}/api/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        },
        body: JSON.stringify({
          title: data.title,
          price: Number(data.price),
          address: data.address,
          description: data.description,
          maxRenters: data.maxRenters ? Number(data.maxRenters) : null,
          photos: data.photos ? data.photos.split(",").map(p => p.trim()).filter(Boolean) : [],
          ownerEmail: auth.user.email,
        }),
      });
      if (!res.ok) throw new Error();
      setCreateStatus({ status: "success", message: "Listing published!" });
      e.target.reset();
      setCreating(false);
      loadMyListings();
    } catch {
      setCreateStatus({ status: "error", message: "Could not create listing. Try again." });
    }
  }

  async function showApplicants(listingId) {
    setSelectedListing(listingId);
    setLoadingApplicants(true);
    try {
      const res = await fetch(`${API_BASE}/api/matching/applicants/${listingId}`, {
        headers: { ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}) },
      });
      if (!res.ok) throw new Error();
      setApplicants(await res.json());
    } catch { setApplicants([]); }
    finally { setLoadingApplicants(false); }
  }

  const totalApplicants = applicants.length;

  return (
    <div className="page" style={{ padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 8 }}>LANDLORD DASHBOARD</div>
            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 38, letterSpacing: "-0.025em" }}>
              Good to see you, {auth.user.name || "there"}
            </h1>
          </div>
          <button onClick={() => setCreating(!creating)} className="btn-accent" style={{ padding: "12px 22px", borderRadius: 11, fontSize: 14 }}>
            {creating ? "× Cancel" : "+ New listing"}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 36 }}>
          {[
            { icon: "🏠", label: "Active listings", val: listings.length, color: "var(--accent)" },
            { icon: "👥", label: "Total applicants", val: selectedListing ? totalApplicants : "—", color: "var(--green)" },
            { icon: "📊", label: "Avg. price/mo", val: listings.length ? `$${Math.round(listings.reduce((s,l) => s + l.price, 0) / listings.length)}` : "—", color: "var(--blue)" },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: var_r_md, padding: "24px 24px 20px",
            }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em", color: s.color, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 13, color: "var(--fg60)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Create form */}
        {creating && (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border2)",
            borderRadius: var_r_lg, padding: "28px 28px 24px", marginBottom: 28,
          }}>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, marginBottom: 20 }}>New listing</h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                {[
                  { name: "title", placeholder: "Listing title *", required: true },
                  { name: "price", type: "number", placeholder: "Price per month (CAD) *", required: true },
                  { name: "address", placeholder: "Full address *", required: true },
                  { name: "maxRenters", type: "number", placeholder: "Max renters (optional)" },
                ].map(f => (
                  <input key={f.name} {...f} style={{ padding: "12px 14px", borderRadius: 10, fontSize: 14 }} />
                ))}
              </div>
              <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
                <textarea name="description" placeholder="Description (optional)" rows={3}
                  style={{ padding: "12px 14px", borderRadius: 10, fontSize: 14, resize: "vertical" }} />
                <input name="photos" placeholder="Photo URLs (comma-separated, optional)"
                  style={{ padding: "12px 14px", borderRadius: 10, fontSize: 14 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button type="submit" className="btn-accent" style={{ padding: "12px 28px", borderRadius: 11, fontSize: 14 }}
                  disabled={createStatus.status === "loading"}>
                  {createStatus.status === "loading" ? "Publishing…" : "Publish listing"}
                </button>
                {createStatus.status === "success" && <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>✓ {createStatus.message}</span>}
                {createStatus.status === "error"   && <span style={{ fontSize: 13, color: "#42AFC7" }}>{createStatus.message}</span>}
              </div>
            </form>
          </div>
        )}

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* My listings */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: var_r_lg, padding: "24px 24px 20px" }}>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18, marginBottom: 18 }}>
              Your listings
              {listings.length > 0 && <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: "var(--accent-dim)", color: "var(--accent)" }}>{listings.length}</span>}
            </h3>

            {loading ? (
              <div style={{ display: "grid", gap: 10 }}>
                {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
              </div>
            ) : listings.length === 0 ? (
              <div style={{ color: "var(--fg60)", fontSize: 14, padding: "24px 0", textAlign: "center" }}>
                No listings yet. Use the button above to add one.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {listings.map(l => (
                  <div key={l.id} style={{
                    padding: "16px 18px", borderRadius: 12,
                    background: selectedListing === l.id ? "var(--accent-dim)" : "var(--surface2)",
                    border: `1.5px solid ${selectedListing === l.id ? "var(--accent)" : "var(--border)"}`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onClick={() => showApplicants(l.id)}
                  onMouseEnter={e => { if (selectedListing !== l.id) e.currentTarget.style.borderColor = "var(--border2)"; }}
                  onMouseLeave={e => { if (selectedListing !== l.id) e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>{l.title}</div>
                    <div style={{ fontSize: 12.5, color: "var(--fg60)", display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: "var(--accent)", fontWeight: 700 }}>${l.price}/mo</span>
                      <span style={{ color: "var(--fg30)" }}>·</span>
                      <span>{l.address}</span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: selectedListing === l.id ? "var(--accent)" : "var(--fg30)", fontWeight: 600 }}>
                      {selectedListing === l.id ? "Viewing applicants ↓" : "Click to view applicants"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Applicants */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: var_r_lg, padding: "24px 24px 20px" }}>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18, marginBottom: 18 }}>
              Applicants
              {selectedListing && <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: "var(--green-dim)", color: "var(--green)" }}>{applicants.length}</span>}
            </h3>

            {!selectedListing ? (
              <div style={{ color: "var(--fg60)", fontSize: 14, padding: "24px 0", textAlign: "center" }}>
                Select a listing on the left to see its applicants.
              </div>
            ) : loadingApplicants ? (
              <div style={{ display: "grid", gap: 10 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 68, borderRadius: 12 }} />)}
              </div>
            ) : applicants.length === 0 ? (
              <div style={{ color: "var(--fg60)", fontSize: 14, padding: "24px 0", textAlign: "center" }}>
                No applicants yet for this listing.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {applicants.map(a => (
                  <div key={a.id} style={{
                    padding: "15px 16px", borderRadius: 12,
                    background: "var(--surface2)", border: "1px solid var(--border)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "var(--accent-dim)", border: "1.5px solid var(--accent)",
                        display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, color: "var(--accent)",
                      }}>
                        {a.applicantEmail?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{a.applicantEmail}</div>
                        <div className="badge" style={{ background: "var(--green-dim)", color: "var(--green)", marginTop: 2 }}>Applied</div>
                      </div>
                    </div>
                    {a.message && (
                      <div style={{ fontSize: 13, color: "var(--fg60)", lineHeight: 1.55, paddingLeft: 42, fontStyle: "italic" }}>
                        "{a.message}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ auth, navigate }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      try {
        const res = await fetch(`${API_BASE}/api/matching/applications/${encodeURIComponent(auth.user.email)}`, {
          headers: { ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}) },
        });
        if (!res.ok) throw new Error();
        setApplications(await res.json());
      } catch { setApplications([]); }
      finally { setLoading(false); }
    }
    loadApplications();
  }, []);

  return (
    <div className="page" style={{ padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 8 }}>STUDENT DASHBOARD</div>
          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 38, letterSpacing: "-0.025em" }}>
            Welcome back, {auth.user.name || "there"}
          </h1>
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 36 }}>
          {[
            { icon: "🔍", label: "Browse listings", action: () => navigate("listings"), variant: "accent" },
            { icon: "👤", label: "Edit profile", action: () => navigate("profile"), variant: "ghost" },
            { icon: "🏠", label: "Saved homes", action: () => {}, variant: "ghost" },
          ].map(a => (
            <button key={a.label} onClick={a.action}
              className={a.variant === "accent" ? "btn-accent" : "btn-ghost"}
              style={{ padding: "22px 20px", borderRadius: var_r_md, fontSize: 15, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
              <span style={{ fontSize: 24 }}>{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Applications */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: var_r_lg, padding: "28px" }}>
          <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, marginBottom: 20 }}>
            Your applications
            {applications.length > 0 && (
              <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: "var(--accent-dim)", color: "var(--accent)" }}>
                {applications.length}
              </span>
            )}
          </h3>

          {loading ? (
            <div style={{ display: "grid", gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
            </div>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>📭</div>
              <div style={{ color: "var(--fg60)", marginBottom: 20 }}>You haven't applied to any listings yet.</div>
              <button onClick={() => navigate("listings")} className="btn-accent" style={{ padding: "12px 24px", borderRadius: 11, fontSize: 14 }}>
                Browse listings
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {applications.map(a => (
                <div key={a.id} style={{
                  padding: "16px 20px", borderRadius: 12,
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Listing #{a.listingId}</div>
                    {a.message && <div style={{ fontSize: 13, color: "var(--fg60)", fontStyle: "italic" }}>"{a.message}"</div>}
                  </div>
                  <div className="badge" style={{ background: "var(--green-dim)", color: "var(--green)", border: "1px solid rgba(92,200,138,0.2)", whiteSpace: "nowrap" }}>
                    ✓ Submitted
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PROFILE PAGE
═══════════════════════════════════════════════════════════════════════════════ */
function ProfilePage({ auth, navigate, logout }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: auth?.user?.name || "",
    university: "",
    budget: "",
    lifestyle: [],
    bio: "",
  });

  const lifestyleOptions = ["Early bird", "Night owl", "Non-smoker", "Smoker", "Quiet", "Social", "Pet-friendly", "Clean & organized", "Flexible"];

  function toggleLifestyle(tag) {
    setForm(f => ({
      ...f,
      lifestyle: f.lifestyle.includes(tag) ? f.lifestyle.filter(t => t !== tag) : [...f.lifestyle, tag],
    }));
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!auth?.user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 28 }}>Sign in required</h2>
        <button onClick={() => navigate("auth")} className="btn-accent" style={{ padding: "12px 28px", borderRadius: 12, fontSize: 15 }}>
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 8 }}>YOUR ACCOUNT</div>
          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 38, letterSpacing: "-0.025em" }}>Profile</h1>
        </div>

        {/* Avatar + meta */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: var_r_lg,
          padding: "28px", marginBottom: 22, display: "flex", alignItems: "center", gap: 22,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "var(--accent-dim)", border: "2.5px solid var(--accent)",
            display: "grid", placeItems: "center", fontSize: 26, fontWeight: 800, color: "var(--accent)",
            flexShrink: 0,
          }}>
            {(auth.user.name || auth.user.email)?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
              {auth.user.name || "Your name"}
            </div>
            <div style={{ fontSize: 13.5, color: "var(--fg60)", marginBottom: 8 }}>{auth.user.email}</div>
            <div className="badge" style={{
              background: auth.user.role === "landlord" ? "var(--blue-dim)" : "var(--green-dim)",
              color: auth.user.role === "landlord" ? "var(--blue)" : "var(--green)",
              border: `1px solid ${auth.user.role === "landlord" ? "rgba(91,155,213,0.2)" : "rgba(92,200,138,0.2)"}`,
            }}>
              {auth.user.role === "landlord" ? "🏠 Landlord" : "🎓 Student"}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: var_r_lg,
          padding: "28px", display: "grid", gap: 20,
        }}>
          <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 18 }}>Edit profile</h3>

          <Field label="Full name">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your name" style={{ padding: "12px 14px", borderRadius: 10, fontSize: 14, width: "100%" }} />
          </Field>

          {auth.user.role === "student" && (
            <>
              <Field label="University">
                <input value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
                  placeholder="e.g. University of Toronto" style={{ padding: "12px 14px", borderRadius: 10, fontSize: 14, width: "100%" }} />
              </Field>

              <Field label="Monthly budget (CAD)">
                <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                  placeholder="e.g. 1000" style={{ padding: "12px 14px", borderRadius: 10, fontSize: 14, width: "100%" }} />
              </Field>

              <Field label="Lifestyle preferences">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {lifestyleOptions.map(tag => (
                    <button type="button" key={tag}
                      onClick={() => toggleLifestyle(tag)}
                      style={{
                        padding: "7px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        background: form.lifestyle.includes(tag) ? "var(--accent-dim)" : "var(--surface2)",
                        border: `1.5px solid ${form.lifestyle.includes(tag) ? "var(--accent)" : "var(--border)"}`,
                        color: form.lifestyle.includes(tag) ? "var(--accent)" : "var(--fg60)",
                        transition: "all 0.15s", fontFamily: "Cabinet Grotesk, sans-serif",
                      }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Bio (optional)">
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell landlords and potential roommates about yourself…"
                  rows={4} style={{ padding: "12px 14px", borderRadius: 10, fontSize: 14, width: "100%", resize: "vertical" }} />
              </Field>
            </>
          )}

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button type="submit" className="btn-accent" style={{ padding: "12px 28px", borderRadius: 11, fontSize: 14 }}>
              Save changes
            </button>
            {saved && <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>✓ Saved</span>}
            <div style={{ flex: 1 }} />
            <button type="button" onClick={logout} className="btn-ghost" style={{ padding: "12px 20px", borderRadius: 11, fontSize: 14, color: "var(--accent)", borderColor: "var(--accent-dim)" }}>
              Sign out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", color: "var(--fg60)", marginBottom: 8 }}>
        {label.toUpperCase()}
      </label>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   AUTH PAGE
═══════════════════════════════════════════════════════════════════════════════ */
function AuthPage({ auth, login, navigate }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [status, setStatus] = useState({ status: "idle", error: "" });

  if (auth?.user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <div style={{ fontSize: 48 }}>✓</div>
        <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 28 }}>Already signed in</h2>
        <p style={{ color: "var(--fg60)" }}>You're signed in as {auth.user.email}.</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => navigate("dashboard")} className="btn-accent" style={{ padding: "12px 24px", borderRadius: 11, fontSize: 14 }}>Go to dashboard</button>
          <button onClick={() => navigate("listings")} className="btn-ghost" style={{ padding: "12px 24px", borderRadius: 11, fontSize: 14 }}>Browse listings</button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    setStatus({ status: "loading", error: "" });
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email: data.email, password: data.password }
        : { email: data.email, password: data.password, name: data.name, role: data.role };
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const resBody = await res.json().catch(() => null);
      if (!res.ok) throw new Error(resBody?.error || (mode === "login" ? "Invalid credentials" : "Could not create account"));
      login({ user: resBody.user, token: resBody.token });
      navigate("dashboard");
    } catch (err) {
      setStatus({ status: "error", error: err.message });
    }
  }

  return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 120px)", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, background: "var(--accent)", borderRadius: 16,
            display: "inline-grid", placeItems: "center", marginBottom: 16,
          }}>
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
              <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white" />
            </svg>
          </div>
          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 28, letterSpacing: "-0.025em", marginBottom: 6 }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p style={{ color: "var(--fg60)", fontSize: 15 }}>
            {mode === "login" ? "Sign in to your Dormly account" : "Join Dormly to find your perfect home"}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "var(--surface)", borderRadius: 12, padding: 4, marginBottom: 28, border: "1px solid var(--border)" }}>
          {[["login","Sign in"],["register","Register"]].map(([key, label]) => (
            <button key={key} onClick={() => { setMode(key); setStatus({ status: "idle", error: "" }); }}
              style={{
                flex: 1, padding: "10px", borderRadius: 9, border: "none", cursor: "pointer",
                fontFamily: "Cabinet Grotesk, sans-serif", fontWeight: 700, fontSize: 14,
                background: mode === key ? "var(--accent)" : "transparent",
                color: mode === key ? "white" : "var(--fg60)",
                transition: "all 0.15s",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: var_r_lg,
          padding: "28px", display: "grid", gap: 14,
        }}>
          {mode === "register" && (
            <input name="name" placeholder="Full name" required style={{ padding: "13px 14px", borderRadius: 11, fontSize: 14 }} />
          )}
          <input name="email" type="email" placeholder="Email address" required style={{ padding: "13px 14px", borderRadius: 11, fontSize: 14 }} />
          <input name="password" type="password" placeholder="Password" required style={{ padding: "13px 14px", borderRadius: 11, fontSize: 14 }} />

          {mode === "register" && (
            <select name="role" required style={{ padding: "13px 14px", borderRadius: 11, fontSize: 14 }}>
              <option value="">Select your role…</option>
              <option value="student">Student — looking to rent</option>
              <option value="landlord">Landowner — listing property</option>
            </select>
          )}

          <button type="submit" className="btn-accent" disabled={status.status === "loading"}
            style={{ padding: "14px", borderRadius: 12, fontSize: 15, marginTop: 4 }}>
            {status.status === "loading" ? (mode === "login" ? "Signing in…" : "Creating account…") : (mode === "login" ? "Sign in" : "Create account")}
          </button>

          {status.status === "error" && (
            <div style={{ fontSize: 13.5, color: "#42AFC7", textAlign: "center", padding: "4px 0" }}>
              {status.error}
            </div>
          )}
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--fg60)" }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setStatus({ status: "idle", error: "" }); }}
            style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "Cabinet Grotesk, sans-serif" }}>
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   WAITLIST PAGE
═══════════════════════════════════════════════════════════════════════════════ */
function WaitlistPage({ navigate }) {
  const [status, setStatus] = useState({ status: "idle", message: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    setStatus({ status: "loading", message: "" });
    try {
      const res = await fetch(`${API_BASE}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, role: data.role }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong");
      }
      const body = await res.json().catch(() => null);
      setStatus({ status: "success", message: body?.message || "You're on the list!" });
      e.target.reset();
    } catch (err) {
      setStatus({ status: "error", message: err.message });
    }
  }

  return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 120px)", padding: "40px 24px", position: "relative", overflow: "hidden" }}>
      {/* Background blobs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,113,74,0.15) 0%, transparent 70%)", top: -100, right: -50, animation: "blobFloat 14s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,155,213,0.1) 0%, transparent 70%)", bottom: -50, left: -80, animation: "blobFloat 18s ease-in-out infinite reverse" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 540, position: "relative" }}>
        {status.status === "success" ? (
          <div style={{ textAlign: "center", animation: "fadeUp 0.6s ease both" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 36, letterSpacing: "-0.025em", marginBottom: 14 }}>
              You're on the list!
            </h2>
            <p style={{ fontSize: 17, color: "var(--fg60)", lineHeight: 1.65, marginBottom: 32 }}>
              {status.message} We'll reach out when early access opens.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => navigate("listings")} className="btn-ghost" style={{ padding: "13px 26px", borderRadius: 12, fontSize: 15 }}>
                Browse listings
              </button>
              <button onClick={() => navigate("auth")} className="btn-accent" style={{ padding: "13px 26px", borderRadius: 12, fontSize: 15 }}>
                Create account
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div className="fade-up fade-up-1" style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20,
                padding: "5px 14px 5px 8px", borderRadius: 99,
                background: "var(--accent-dim)", border: "1px solid rgba(232,113,74,0.3)",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.06em", fontFamily: "DM Mono, monospace" }}>
                  EARLY ACCESS
                </span>
              </div>
              <h1 className="fade-up fade-up-2" style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 48, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 16 }}>
                Get in before<br />
                <span style={{ color: "var(--accent)", fontStyle: "italic" }}>everyone</span> else.
              </h1>
              <p className="fade-up fade-up-3" style={{ fontSize: 17, color: "var(--fg60)", lineHeight: 1.7, maxWidth: 420, margin: "0 auto" }}>
                Join the Dormly waitlist and be first to access smart student rentals when we launch in your city.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{
              background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: var_r_xl,
              padding: "32px", display: "grid", gap: 14,
            }} className="fade-up fade-up-4">
              <input name="email" type="email" placeholder="Your email address" required
                style={{ padding: "14px 16px", borderRadius: 12, fontSize: 15 }} />
              <select name="role" required style={{ padding: "14px 16px", borderRadius: 12, fontSize: 15 }}>
                <option value="">I am a…</option>
                <option value="student">Student — looking for a place to rent</option>
                <option value="landlord">Landowner — want to list my property</option>
              </select>
              <button type="submit" className="btn-accent" disabled={status.status === "loading"}
                style={{ padding: "15px", borderRadius: 12, fontSize: 16 }}>
                {status.status === "loading" ? "Joining…" : "Join the waitlist →"}
              </button>
              {status.status === "error" && (
                <div style={{ fontSize: 13.5, color: "#42AFC7", textAlign: "center" }}>{status.message}</div>
              )}
              <p style={{ fontSize: 12.5, color: "var(--fg30)", textAlign: "center", marginTop: -4 }}>
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>

            {/* Social proof */}
            <div className="fade-up fade-up-5" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 28 }}>
              {[
                { val: "2,400+", label: "on the waitlist" },
                { val: "12", label: "cities launching" },
                { val: "2025", label: "expected launch" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 22, color: "var(--fg)", letterSpacing: "-0.02em" }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: "var(--fg30)", fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════════════════════ */
function Footer({ navigate }) {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px 36px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, background: "var(--accent)", borderRadius: 8, display: "grid", placeItems: "center" }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                  <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white" />
                </svg>
              </div>
              <span style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.025em" }}>Dormly</span>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--fg60)", lineHeight: 1.65, maxWidth: 240 }}>
              Smart student rentals. Commute-aware, roommate-matched, landlord-verified.
            </p>
          </div>

          {/* Links */}
          {[
            { heading: "Platform", links: [["Browse listings","listings"],["Join waitlist","waitlist"],["Sign in","auth"]] },
            { heading: "Company",  links: [["About","home"],["Blog","home"],["Careers","home"]] },
            { heading: "Support",  links: [["Help centre","home"],["Contact","home"],["Privacy","home"]] },
          ].map(col => (
            <div key={col.heading}>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: "var(--fg30)", marginBottom: 14 }}>{col.heading.toUpperCase()}</div>
              <div style={{ display: "grid", gap: 10 }}>
                {col.links.map(([label, page]) => (
                  <button key={label} onClick={() => navigate(page)}
                    style={{ background: "none", border: "none", color: "var(--fg60)", fontSize: 14, cursor: "pointer", textAlign: "left", fontFamily: "Cabinet Grotesk, sans-serif", padding: 0, transition: "color 0.15s" }}
                    onMouseEnter={e => e.target.style.color = "var(--fg)"}
                    onMouseLeave={e => e.target.style.color = "var(--fg60)"}
                  >{label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 13, color: "var(--fg30)" }}>
            © {new Date().getFullYear()} Dormly Inc. · Student renting, matched &amp; commute-aware
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Terms","Privacy","Cookies"].map(l => (
              <span key={l} style={{ fontSize: 13, color: "var(--fg30)", cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Utility ──────────────────────────────────────────────────────────────── */
const var_r_md = "var(--r-md)";
const var_r_lg = "var(--r-lg)";
const var_r_xl = "var(--r-xl)";