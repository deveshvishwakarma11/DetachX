import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

const S = `
  *, *::before, *::after { box-sizing: border-box; }
  .tp { position: relative; min-height: 100dvh; background: #0A0A0F; font-family: 'Space Grotesk', sans-serif; color: #F0EEE9; padding: 0 0 6rem; overflow-x: hidden; }
  .tp .top-bar { height: 1px; background: linear-gradient(90deg, transparent, #1E1E2A 30%, #6C63FF 50%, #1E1E2A 70%, transparent); }
  
  /* ── Nav ── */
  .tnv { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2rem; border-bottom: 1px solid #1E1E2A; }
  .tnv .wm { font-size: 1rem; font-weight: 600; letter-spacing: 0.08em; color: #F0EEE9; }
  .tnv .wm span { color: #6C63FF; }
  .tnv .nr { display: flex; align-items: center; gap: 0.6rem; }
  .nbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; font-weight: 500; color: #4A4860; background: none; border: 1px solid #1E1E2A; border-radius: 6px; padding: 0.3rem 0.75rem; cursor: pointer; transition: color 0.2s, border-color 0.2s; text-decoration: none; }
  .nbtn:hover { color: #6B6880; border-color: #2A2A38; }

  /* ── Hero ── */
  .tphero { text-align: center; padding: 3rem 2rem 1rem; animation: tfa 0.5s ease forwards; }
  .tphero h1 { font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 700; letter-spacing: -0.03em; margin: 0 0 0.5rem; }
  .tphero p { font-size: 0.85rem; color: #6B6880; font-weight: 300; margin: 0; }
  .tphero .teff { font-size: 0.72rem; color: #4A4860; margin-top: 0.35rem; }

  /* ── Content ── */
  .tpsec { max-width: 720px; margin: 2rem auto 0; padding: 0 2rem; animation: tfa 0.5s ease 0.1s both; }
  .tpcard { background: #111118; border: 1px solid #1E1E2A; border-radius: 12px; padding: 1.75rem; margin-bottom: 1rem; transition: border-color 0.2s; }
  .tpcard:hover { border-color: #2A2A38; }
  .tpcard .tci { display: flex; align-items: flex-start; gap: 0.85rem; margin-bottom: 0.25rem; }
  .tpcard .tci .tcico { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1rem; }
  .tpcard h2 { font-size: 1rem; font-weight: 600; color: #F0EEE9; margin: 0 0 0.75rem; }
  .tpcard h3 { font-size: 0.82rem; font-weight: 600; color: #F0EEE9; margin: 1rem 0 0.35rem; }
  .tpcard p, .tpcard li { font-size: 0.82rem; color: #9A98B0; line-height: 1.7; margin: 0 0 0.5rem; }
  .tpcard ul { margin: 0.5rem 0; padding-left: 1.25rem; }
  .tpcard li { margin-bottom: 0.35rem; }
  .tpcard strong { color: #F0EEE9; font-weight: 500; }
  .tpcard .thighlight { background: rgba(108,99,255,0.06); border: 1px solid rgba(108,99,255,0.15); border-radius: 8px; padding: 0.75rem 1rem; margin: 0.75rem 0; font-size: 0.8rem; color: #A89DFF; display: flex; align-items: flex-start; gap: 0.5rem; }
  .tpcard .thighlight svg { flex-shrink: 0; margin-top: 2px; }

  /* ── Divider ── */
  .tpdiv { max-width: 720px; margin: 2rem auto 0; padding: 0 2rem; }
  .tpdiv hr { border: none; border-top: 1px solid #1E1E2A; }

  /* ── Footer ── */
  .tpftn { text-align: center; padding: 2rem; font-size: 0.7rem; color: #6B6880; letter-spacing: 0.05em; }
  .tpftn a { color: #6C63FF; text-decoration: none; }
  .tpftn a:hover { text-decoration: underline; }

  @keyframes tfa { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 600px) {
    .tnv { padding: 1rem 1.25rem; } .tnv .ne { display: none; }
    .tpsec { padding: 0 1.25rem; } .tpcard { padding: 1.25rem; }
  }
`;

// ── Section data ─────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "acceptance",
    icon: "📝",
    color: "#6C63FF",
    bg: "rgba(108,99,255,0.1)",
    title: "Acceptance of Terms",
    content: (
      <>
        <p>
          By accessing or using DetachX ("the Service"), you agree to be
          bound by these Terms &amp; Conditions. If you do not agree with any
          part of these terms, you may not use the Service.
        </p>
        <p>
          These terms apply to all users of the Service, including anyone who
          accesses or contributes to it in any way. By continuing to use
          DetachX after changes are posted, you accept the updated terms.
        </p>
      </>
    ),
  },
  {
    id: "service",
    icon: "🔧",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.1)",
    title: "Service Description",
    content: (
      <>
        <p>
          DetachX helps you manage your email subscriptions and digital
          footprint. The Service provides:
        </p>
        <ul>
          <li>
            <strong>Inbox scanning</strong> — identify newsletters, marketing
            emails, and subscriptions in your Gmail account.
          </li>
          <li>
            <strong>Unsubscribe assistance</strong> — find and manage
            unsubscribe links for detected senders.
          </li>
          <li>
            <strong>Block sender management</strong> — filter unwanted emails
            at the Gmail level.
          </li>
          <li>
            <strong>Digital footprint discovery</strong> — detect services
            and accounts linked to your email address.
          </li>
          <li>
            <strong>Risk analysis</strong> — assess the security posture of
            your online accounts.
          </li>
        </ul>
        <p>
          The Service is provided "as is" and is intended for personal,
          non-commercial use only.
        </p>
      </>
    ),
  },
  {
    id: "responsibilities",
    icon: "👤",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    title: "User Responsibilities",
    content: (
      <>
        <p>As a user of DetachX, you agree to:</p>
        <ul>
          <li>
            Provide accurate Google account information during sign-in.
          </li>
          <li>
            Use the Service only for its intended purpose — managing your own
            email subscriptions and digital footprint.
          </li>
          <li>
            Not attempt to access another user's account, data, or scan
            results.
          </li>
          <li>
            Not use the Service for any unlawful purpose or in violation of
            Google's Terms of Service.
          </li>
          <li>
            Not abuse the scanning functionality by making excessive or
            automated requests.
          </li>
          <li>
            Maintain the confidentiality of your Google account credentials.
            DetachX never stores your Google password.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "liability",
    icon: "⚖️",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.1)",
    title: "Limitation of Liability",
    content: (
      <>
        <p>
          DetachX is provided as a tool to help you manage your email. We
          strive for accuracy, but:
        </p>
        <ul>
          <li>
            DetachX does not guarantee that all subscriptions or accounts
            will be detected. Detection is based on pattern matching and may
            miss certain senders.
          </li>
          <li>
            DetachX is not responsible for any missed emails, incorrectly
            classified senders, or any actions you take based on scan
            results.
          </li>
          <li>
            We are not liable for any indirect, incidental, or consequential
            damages arising from your use of the Service.
          </li>
          <li>
            Unsubscribe and block sender actions are performed by you
            manually. DetachX provides links and information but does not
            automatically modify your Gmail settings.
          </li>
        </ul>
        <div className="thighlight">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#6C63FF" strokeWidth="1.3"/>
            <path d="M8 4.5v4M8 11v.01" stroke="#6C63FF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>
            DetachX is a productivity tool, not a legal or compliance
            service. Use it as a guide, but always verify important actions
            yourself.
          </span>
        </div>
      </>
    ),
  },
  {
    id: "account",
    icon: "🔑",
    color: "#818CF8",
    bg: "rgba(99,102,241,0.1)",
    title: "Account Usage",
    content: (
      <>
        <p>
          Your DetachX account is tied to your Google identity. You are
          responsible for all activity that occurs under your account.
        </p>
        <ul>
          <li>
            You may have only one DetachX account per Google account.
          </li>
          <li>
            You can delete your account and all associated data at any time
            from the Settings page.
          </li>
          <li>
            DetachX reserves the right to suspend or terminate accounts that
            violate these terms or engage in abusive behaviour.
          </li>
          <li>
            Account suspension or termination will not result in a refund of
            any fees (currently the Service is free).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "accuracy",
    icon: "📊",
    color: "#A78BFA",
    bg: "rgba(168,85,247,0.1)",
    title: "Data Accuracy Disclaimer",
    content: (
      <>
        <p>
          DetachX uses pattern recognition and heuristic analysis to detect
          subscriptions and accounts. While we continuously improve our
          detection engine:
        </p>
        <ul>
          <li>
            Detection results are estimates, not guarantees. Some
            subscriptions may be missed, and some legitimate emails may be
            flagged.
          </li>
          <li>
            The Digital Footprint Discovery feature identifies potential
            accounts based on email patterns. It may not capture every
            service you've signed up for.
          </li>
          <li>
            Confidence scores and risk levels are calculated using automated
            rules and should be used as guidance, not definitive assessments.
          </li>
          <li>
            You should review scan results before taking any action based on
            them.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "changes",
    icon: "🔄",
    color: "#F472B6",
    bg: "rgba(236,72,153,0.1)",
    title: "Changes to Service",
    content: (
      <>
        <p>
          DetachX is under active development. We reserve the right to:
        </p>
        <ul>
          <li>
            Modify, suspend, or discontinue any part of the Service at any
            time with reasonable notice.
          </li>
          <li>
            Update these Terms &amp; Conditions as the Service evolves.
            Users will be notified of material changes.
          </li>
          <li>
            Change pricing or introduce paid tiers in the future (with
            advance notice to existing users).
          </li>
          <li>
            Limit the number of scans, accounts discovered, or other usage
            metrics to ensure fair use for all users.
          </li>
        </ul>
        <p>
          We will make reasonable efforts to notify users of significant
          changes via email or in-app notifications.
        </p>
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
          If you have questions about these Terms &amp; Conditions, please
          reach out to us:
        </p>
        <ul>
          <li><strong>Email:</strong> support@detachx.app</li>
        </ul>
        <p>
          We aim to respond to all inquiries within 5 business days.
        </p>
      </>
    ),
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function TermsPage({ session }) {
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
      <div className="tp">
        <div className="top-bar" />
        <nav className="tnv">
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

        <div className="tphero">
          <h1>Terms &amp; Conditions</h1>
          <p>Simple, readable terms that explain how DetachX works.</p>
          <p className="teff">Last updated: June 19, 2026</p>
        </div>

        {SECTIONS.map((sec) => (
          <div className="tpsec" key={sec.id}>
            <div className="tpcard">
              <div className="tci">
                <div className="tcico" style={{ background: sec.bg, border: `1px solid ${sec.color}` }}>
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

        <div className="tpdiv">
          <hr />
        </div>

        <div className="tpftn">
          <p>© 2026 DetachX · All rights reserved</p>
          <p style={{ marginTop: "0.5rem" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/privacy"); }}>Privacy Policy</a>
            {" · "}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Back to Home</a>
            {" · "}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Sign In</a>
          </p>
        </div>
      </div>
    </>
  );
}
