import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

const S = `
  *, *::before, *::after { box-sizing: border-box; }
  .pp { position: relative; min-height: 100dvh; background: #0A0A0F; font-family: 'Space Grotesk', sans-serif; color: #F0EEE9; padding: 0 0 6rem; overflow-x: hidden; }
  .pp .top-bar { height: 1px; background: linear-gradient(90deg, transparent, #1E1E2A 30%, #6C63FF 50%, #1E1E2A 70%, transparent); }
  
  /* ── Nav ── */
  .pnv { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2rem; border-bottom: 1px solid #1E1E2A; }
  .pnv .wm { font-size: 1rem; font-weight: 600; letter-spacing: 0.08em; color: #F0EEE9; }
  .pnv .wm span { color: #6C63FF; }
  .pnv .nr { display: flex; align-items: center; gap: 0.6rem; }
  .nbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; font-weight: 500; color: #4A4860; background: none; border: 1px solid #1E1E2A; border-radius: 6px; padding: 0.3rem 0.75rem; cursor: pointer; transition: color 0.2s, border-color 0.2s; text-decoration: none; }
  .nbtn:hover { color: #6B6880; border-color: #2A2A38; }

  /* ── Hero ── */
  .pphero { text-align: center; padding: 3rem 2rem 1rem; animation: pfa 0.5s ease forwards; }
  .pphero h1 { font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 700; letter-spacing: -0.03em; margin: 0 0 0.5rem; }
  .pphero p { font-size: 0.85rem; color: #6B6880; font-weight: 300; margin: 0; }
  .pphero .peff { font-size: 0.72rem; color: #4A4860; margin-top: 0.35rem; }

  /* ── Content ── */
  .ppsec { max-width: 720px; margin: 2rem auto 0; padding: 0 2rem; animation: pfa 0.5s ease 0.1s both; }
  .ppcard { background: #111118; border: 1px solid #1E1E2A; border-radius: 12px; padding: 1.75rem; margin-bottom: 1rem; transition: border-color 0.2s; }
  .ppcard:hover { border-color: #2A2A38; }
  .ppcard .pci { display: flex; align-items: flex-start; gap: 0.85rem; margin-bottom: 0.25rem; }
  .ppcard .pci .pcico { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1rem; }
  .ppcard h2 { font-size: 1rem; font-weight: 600; color: #F0EEE9; margin: 0 0 0.75rem; }
  .ppcard h3 { font-size: 0.82rem; font-weight: 600; color: #F0EEE9; margin: 1rem 0 0.35rem; }
  .ppcard p, .ppcard li { font-size: 0.82rem; color: #9A98B0; line-height: 1.7; margin: 0 0 0.5rem; }
  .ppcard ul { margin: 0.5rem 0; padding-left: 1.25rem; }
  .ppcard li { margin-bottom: 0.35rem; }
  .ppcard strong { color: #F0EEE9; font-weight: 500; }
  .ppcard .phighlight { background: rgba(108,99,255,0.06); border: 1px solid rgba(108,99,255,0.15); border-radius: 8px; padding: 0.75rem 1rem; margin: 0.75rem 0; font-size: 0.8rem; color: #A89DFF; display: flex; align-items: flex-start; gap: 0.5rem; }
  .ppcard .phighlight svg { flex-shrink: 0; margin-top: 2px; }
  .ppcard .pbadge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 8px; border-radius: 99px; background: rgba(34,197,94,0.1); color: #22C55E; border: 1px solid rgba(34,197,94,0.2); }

  /* ── Divider ── */
  .ppdiv { max-width: 720px; margin: 2rem auto 0; padding: 0 2rem; }
  .ppdiv hr { border: none; border-top: 1px solid #1E1E2A; }

  /* ── Footer ── */
  .ppftn { text-align: center; padding: 2rem; font-size: 0.7rem; color: #6B6880; letter-spacing: 0.05em; }
  .ppftn a { color: #6C63FF; text-decoration: none; }
  .ppftn a:hover { text-decoration: underline; }

  @keyframes pfa { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 600px) {
    .pnv { padding: 1rem 1.25rem; } .pnv .ne { display: none; }
    .ppsec { padding: 0 1.25rem; } .ppcard { padding: 1.25rem; }
  }
`;

// ── Section data ─────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "collect",
    icon: "📋",
    color: "#6C63FF",
    bg: "rgba(108,99,255,0.1)",
    title: "Information We Collect",
    content: (
      <>
        <p>
          DetachX only collects the minimum data needed to provide our email
          management service. When you sign in with Google, we receive:
        </p>
        <ul>
          <li>
            <strong>Basic profile information</strong> — your name, email
            address, and profile picture from your Google account.
          </li>
          <li>
            <strong>Email metadata</strong> — when you run a scan, DetachX
            reads email headers (sender, subject, date) and List-Unsubscribe
            headers to detect newsletters, marketing emails, and account
            registrations.
          </li>
          <li>
            <strong>Email body content</strong> — only when needed to find
            unsubscribe links that aren't available in email headers. Body
            text is scanned client-side and never permanently stored.
          </li>
          <li>
            <strong>Scan results</strong> — the domains and services we
            detect are saved to your account so you can view them later.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "usage",
    icon: "🔍",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.1)",
    title: "How We Use Data",
    content: (
      <>
        <p>Your data is used exclusively to power DetachX features:</p>
        <ul>
          <li>Identify newsletters, marketing emails, and subscriptions in your Gmail inbox</li>
          <li>Detect services and accounts linked to your email address</li>
          <li>Track unsubscribe requests and block sender operations</li>
          <li>Provide risk analysis and AI insights on your digital footprint</li>
          <li>Improve the accuracy of our detection engine</li>
        </ul>
        <div className="phighlight">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#6C63FF" strokeWidth="1.3"/>
            <path d="M8 4.5v4M8 11v.01" stroke="#6C63FF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>
            <strong>We do not sell, share, or monetize your data.</strong>{" "}
            DetachX has no advertising, no third-party analytics, and no data
            brokerage. Your information belongs to you.
          </span>
        </div>
      </>
    ),
  },
  {
    id: "gmail",
    icon: "🔐",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    title: "Gmail Access Permissions",
    content: (
      <>
        <p>
          DetachX uses Google OAuth 2.0 to access your Gmail account. Here's
          exactly what this means:
        </p>
        <ul>
          <li>
            <strong>Read-only access</strong> — DetachX only reads emails. It
            can never send emails, delete messages, or modify your account.
          </li>
          <li>
            <strong>You control every scan</strong> — scans only run when you
            explicitly click "Scan Gmail" or "Start Discovery Scan." Nothing
            runs automatically in the background.
          </li>
          <li>
            <strong>No permanent email storage</strong> — email content is
            processed in real-time during a scan. Only metadata (sender
            domains, detection results) is saved to your account.
          </li>
          <li>
            <strong>Revocable at any time</strong> — you can revoke DetachX's
            access from your Google Account settings at
            myaccount.google.com/security. This immediately stops all access.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "storage",
    icon: "💾",
    color: "#818CF8",
    bg: "rgba(99,102,241,0.1)",
    title: "Data Storage",
    content: (
      <>
        <p>
          DetachX stores your data in two places, and both are under your
          control:
        </p>
        <ul>
          <li>
            <strong>Supabase (cloud database)</strong> — scan results,
            unsubscribe history, block sender records, and footprint
            discovery data are stored securely in a hosted PostgreSQL
            database. All data is encrypted in transit (TLS) and at rest.
          </li>
          <li>
            <strong>Local storage (browser cache)</strong> — your settings
            preferences and Gmail access token are cached in your browser
            for convenience. This data never leaves your device.
          </li>
        </ul>
        <p>
          We retain your data for as long as your account is active. You can
          delete your data at any time using the settings page.
        </p>
      </>
    ),
  },
  {
    id: "deletion",
    icon: "🗑️",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.1)",
    title: "Data Deletion",
    content: (
      <>
        <p>You have full control over your data:</p>
        <ul>
          <li>
            <strong>Clear scan history</strong> — removes all scan records
            from the database. Your unsubscribe and block lists are preserved.
          </li>
          <li>
            <strong>Delete footprint results</strong> — removes all
            discovered accounts and evidence from the Digital Footprint
            feature.
          </li>
          <li>
            <strong>Export your data</strong> — download all your DetachX
            data as JSON or CSV before deleting anything.
          </li>
          <li>
            <strong>Delete account</strong> — permanently removes all your
            data from the database and signs you out. This action cannot be
            undone.
          </li>
        </ul>
        <div className="phighlight">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#22C55E" strokeWidth="1.3"/>
            <path d="M5 8l2 2 4-4" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>
            All deletion options are available in{" "}
            <strong>Settings → Data</strong> and{" "}
            <strong>Settings → Account</strong>. No email or support ticket
            needed.
          </span>
        </div>
      </>
    ),
  },
  {
    id: "rights",
    icon: "⚖️",
    color: "#A78BFA",
    bg: "rgba(168,85,247,0.1)",
    title: "User Rights",
    content: (
      <>
        <p>As a DetachX user, you have the following rights:</p>
        <ul>
          <li>
            <strong>Right to access</strong> — view all your data at any time via
            the export feature in Settings → Data.
          </li>
          <li>
            <strong>Right to rectification</strong> — your data is derived from
            your Gmail account. Update your Gmail data directly.
          </li>
          <li>
            <strong>Right to deletion</strong> — delete your data or entire
            account at any time from the settings page.
          </li>
          <li>
            <strong>Right to data portability</strong> — export your complete
            data as JSON or CSV.
          </li>
          <li>
            <strong>Right to withdraw consent</strong> — revoke Gmail access
            from your Google Account settings at any time.
          </li>
          <li>
            <strong>Right to be informed</strong> — this privacy policy
            explains exactly how we handle your data.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    icon: "✉️",
    color: "#6C63FF",
    bg: "rgba(108,99,255,0.1)",
    title: "Contact Information",
    content: (
      <>
        <p>
          If you have questions, concerns, or requests regarding your data
          or this privacy policy, you can reach us at:
        </p>
        <ul>
          <li><strong>Email:</strong> privacy@detachx.app</li>
        </ul>
        <p>
          We will respond to your request within 30 days. For data deletion
          requests, you can also use the built-in tools in{" "}
          <strong>Settings → Data</strong> for an immediate response.
        </p>
      </>
    ),
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function PrivacyPage({ session }) {
  const navigate = useNavigate();
  const user = session?.user;
  const userEmail = user?.email || "";
  const userPic = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      <style>{S}</style>
      <div className="pp">
        <div className="top-bar" />
        <nav className="pnv">
          <div className="wm">Detach<span>X</span></div>
          <div className="nr">
            {userPic && <img src={userPic} alt="" referrerPolicy="no-referrer" style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #2A2A38", objectFit: "cover" }} />}
            {userEmail && <span className="ne" style={{ fontSize: "0.75rem", color: "#6B6880" }}>{userEmail}</span>}
            <button className="nbtn" onClick={() => navigate("/dashboard")}>Dashboard</button>
            {session ? (
              <button className="nbtn" onClick={handleLogout}>Log out</button>
            ) : (
              <button className="nbtn" onClick={() => navigate("/")}>Home</button>
            )}
          </div>
        </nav>

        <div className="pphero">
          <h1>Privacy Policy</h1>
          <p>How DetachX handles your data — transparently and honestly.</p>
          <p className="peff">Last updated: June 19, 2026</p>
        </div>

        {SECTIONS.map((sec, i) => (
          <div className="ppsec" key={sec.id}>
            <div className="ppcard">
              <div className="pci">
                <div className="pcico" style={{ background: sec.bg, border: `1px solid ${sec.color}` }}>
                  {sec.icon}
                </div>
                <div>
                  <h2 style={{ marginBottom: 0, marginTop: "2px" }}>{sec.title}</h2>
                </div>
              </div>
              {sec.content}
            </div>
          </div>
        ))}

        <div className="ppdiv">
          <hr />
        </div>

        <div className="ppftn">
          <p>© 2026 DetachX · All rights reserved</p>
          <p style={{ marginTop: "0.5rem" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Back to Home</a>
            {" · "}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Sign In</a>
          </p>
        </div>
      </div>
    </>
  );
}
