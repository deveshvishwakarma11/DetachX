import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

const S = `
  *, *::before, *::after { box-sizing: border-box; }
  .ap { position: relative; min-height: 100dvh; background: #0A0A0F; font-family: 'Space Grotesk', sans-serif; color: #F0EEE9; padding: 0 0 6rem; overflow-x: hidden; }
  .ap .top-bar { height: 1px; background: linear-gradient(90deg, transparent, #1E1E2A 30%, #6C63FF 50%, #1E1E2A 70%, transparent); }
  
  /* ── Nav ── */
  .anv { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2rem; border-bottom: 1px solid #1E1E2A; }
  .anv .wm { font-size: 1rem; font-weight: 600; letter-spacing: 0.08em; color: #F0EEE9; }
  .anv .wm span { color: #6C63FF; }
  .anv .nr { display: flex; align-items: center; gap: 0.6rem; }
  .nbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; font-weight: 500; color: #4A4860; background: none; border: 1px solid #1E1E2A; border-radius: 6px; padding: 0.3rem 0.75rem; cursor: pointer; transition: color 0.2s, border-color 0.2s; text-decoration: none; }
  .nbtn:hover { color: #6B6880; border-color: #2A2A38; }

  /* ── Hero ── */
  .aphero { text-align: center; padding: 3rem 2rem 1rem; animation: afa 0.5s ease forwards; }
  .aphero h1 { font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 700; letter-spacing: -0.03em; margin: 0 0 0.5rem; }
  .aphero p { font-size: 0.85rem; color: #6B6880; font-weight: 300; margin: 0; max-width: 520px; margin-left: auto; margin-right: auto; }

  /* ── Content ── */
  .apsek { max-width: 720px; margin: 2rem auto 0; padding: 0 2rem; animation: afa 0.5s ease 0.1s both; }
  .acard { background: #111118; border: 1px solid #1E1E2A; border-radius: 12px; padding: 1.75rem; margin-bottom: 1rem; transition: border-color 0.2s; }
  .acard:hover { border-color: #2A2A38; }
  .acard .aii { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; flex-shrink: 0; }
  .acard h2 { font-size: 1rem; font-weight: 600; color: #F0EEE9; margin: 0 0 0.5rem; }
  .acard p { font-size: 0.82rem; color: #9A98B0; line-height: 1.7; margin: 0 0 0.5rem; }
  .acard p:last-child { margin-bottom: 0; }
  .acard strong { color: #F0EEE9; font-weight: 500; }

  /* ── Features grid ── */
  .afeat { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 0.65rem; margin-top: 0.75rem; }
  .afc { background: #0F0F16; border: 1px solid #1E1E2A; border-radius: 10px; padding: 1rem 1rem 0.9rem; transition: border-color 0.2s, transform 0.2s; }
  .afc:hover { border-color: #2A2A38; transform: translateY(-2px); }
  .afc .afci { font-size: 1.1rem; margin-bottom: 0.4rem; }
  .afc .afcn { font-size: 0.78rem; font-weight: 600; color: #F0EEE9; margin-bottom: 2px; }
  .afc .afcd { font-size: 0.68rem; color: #6B6880; line-height: 1.5; }

  /* ── Philosophy highlight ── */
  .aphil { background: rgba(108,99,255,0.06); border: 1px solid rgba(108,99,255,0.15); border-radius: 10px; padding: 1.25rem; margin: 0.75rem 0; display: flex; align-items: flex-start; gap: 0.75rem; }
  .aphil .aphi { width: 36px; height: 36px; border-radius: 8px; background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1rem; }
  .aphil p { font-size: 0.8rem; color: #A89DFF; margin: 0; line-height: 1.6; }
  .aphil strong { color: #C4B8FF; }

  /* ── Dev section ── */
  .adev { display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; }
  .adev .adpic { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #6C63FF, #A78BFA); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; color: #fff; flex-shrink: 0; }
  .adev .adn { font-size: 0.9rem; font-weight: 600; color: #F0EEE9; }
  .adev .adr { font-size: 0.72rem; color: #6B6880; }

  /* ── Divider ── */
  .apdiv { max-width: 720px; margin: 2rem auto 0; padding: 0 2rem; }
  .apdiv hr { border: none; border-top: 1px solid #1E1E2A; }

  /* ── Footer ── */
  .apftn { text-align: center; padding: 2rem; font-size: 0.7rem; color: #6B6880; letter-spacing: 0.05em; }
  .apftn a { color: #6C63FF; text-decoration: none; }
  .apftn a:hover { text-decoration: underline; }

  @keyframes afa { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 600px) {
    .anv { padding: 1rem 1.25rem; } .anv .ne { display: none; }
    .apsek { padding: 0 1.25rem; } .acard { padding: 1.25rem; }
    .afeat { grid-template-columns: repeat(2, 1fr); }
  }
`;

const FEATURES = [
  { icon: "📧", name: "Gmail Scan", desc: "Scans your inbox to detect newsletters, marketing emails, and subscriptions." },
  { icon: "✉️", name: "Unsubscribe", desc: "Finds unsubscribe links so you can opt out from unwanted senders." },
  { icon: "🚫", name: "Block Sender", desc: "Creates Gmail filters to block persistent unwanted emails." },
  { icon: "🔍", name: "Footprint Discovery", desc: "Detects services and accounts linked to your email address." },
  { icon: "🗑️", name: "Delete Assistant", desc: "Provides direct links to delete accounts on 100+ services." },
];

export default function AboutPage({ session }) {
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
      <div className="ap">
        <div className="top-bar" />
        <nav className="anv">
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

        <div className="aphero">
          <h1>About DetachX</h1>
          <p>Take control of your inbox and digital footprint — one email at a time.</p>
        </div>

        {/* What DetachX Does */}
        <div className="apsek">
          <div className="acard">
            <h2>What DetachX Does</h2>
            <p>
              DetachX is a privacy-focused tool that helps you declutter your
              Gmail inbox and manage your digital footprint. It scans your email
              to detect newsletters, marketing emails, and account registrations
              — then helps you unsubscribe, block senders, and delete unused
              accounts across the web.
            </p>
          </div>
        </div>

        {/* Why It Was Built */}
        <div className="apsek">
          <div className="acard">
            <h2>Why It Was Built</h2>
            <p>
              The average person has over 100 online accounts and receives
              hundreds of marketing emails every week. Managing this digital
              clutter is overwhelming, and most tools either sell your data or
              lock features behind expensive subscriptions.
            </p>
            <p>
              DetachX was built to give people a free, private, and simple way
              to take back control of their inbox and online presence — without
              compromising their data.
            </p>
          </div>
        </div>

        {/* Privacy-First Philosophy */}
        <div className="apsek">
          <div className="acard">
            <h2>Privacy-First Philosophy</h2>
            <p>
              Your data belongs to you. DetachX is designed with privacy at its
              core:
            </p>
            <div className="aphil">
              <div className="aphi">🔐</div>
              <p>
                <strong>We do not sell, share, or monetize your data.</strong>{" "}
                DetachX has no advertising, no trackers, and no third-party
                analytics. Your scan results, subscription history, and
                personal information stay private and under your control.
              </p>
            </div>
            <div className="aphil">
              <div className="aphi">🗑️</div>
              <p>
                <strong>You can delete everything at any time.</strong> Your
                data is never locked in. Export it, clear it, or delete your
                entire account from the settings page.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="apsek">
          <div className="acard">
            <h2>Features</h2>
            <p>Everything DetachX offers to help you clean up your digital life.</p>
            <div className="afeat">
              {FEATURES.map((f) => (
                <div className="afc" key={f.name}>
                  <div className="afci">{f.icon}</div>
                  <div className="afcn">{f.name}</div>
                  <div className="afcd">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Developer */}
        <div className="apsek">
          <div className="acard">
            <h2>Developer</h2>
            <p>Built with passion for privacy and digital well-being.</p>
            <div className="adev">
              <div className="adpic">DV</div>
              <div>
                <div className="adn">Devesh Vishwakarma</div>
                <div className="adr">Creator &amp; Developer</div>
              </div>
            </div>
          </div>
        </div>

        <div className="apdiv">
          <hr />
        </div>

        <div className="apftn">
          <p>© 2026 DetachX · All rights reserved</p>
          <p style={{ marginTop: "0.5rem" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/privacy"); }}>Privacy Policy</a>
            {" · "}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/terms"); }}>Terms of Service</a>
            {" · "}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/contact"); }}>Contact</a>
            {" · "}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Home</a>
          </p>
        </div>
      </div>
    </>
  );
}
