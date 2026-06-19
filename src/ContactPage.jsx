import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";

const S = `
  *, *::before, *::after { box-sizing: border-box; }
  .cp { position: relative; min-height: 100dvh; background: #0A0A0F; font-family: 'Space Grotesk', sans-serif; color: #F0EEE9; padding: 0 0 6rem; overflow-x: hidden; }
  .cp .top-bar { height: 1px; background: linear-gradient(90deg, transparent, #1E1E2A 30%, #6C63FF 50%, #1E1E2A 70%, transparent); }
  
  /* ── Nav ── */
  .cnv { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2rem; border-bottom: 1px solid #1E1E2A; }
  .cnv .wm { font-size: 1rem; font-weight: 600; letter-spacing: 0.08em; color: #F0EEE9; }
  .cnv .wm span { color: #6C63FF; }
  .cnv .nr { display: flex; align-items: center; gap: 0.6rem; }
  .nbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; font-weight: 500; color: #4A4860; background: none; border: 1px solid #1E1E2A; border-radius: 6px; padding: 0.3rem 0.75rem; cursor: pointer; transition: color 0.2s, border-color 0.2s; text-decoration: none; }
  .nbtn:hover { color: #6B6880; border-color: #2A2A38; }

  /* ── Hero ── */
  .cphero { text-align: center; padding: 3rem 2rem 1rem; animation: cfa 0.5s ease forwards; }
  .cphero h1 { font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 700; letter-spacing: -0.03em; margin: 0 0 0.5rem; }
  .cphero p { font-size: 0.85rem; color: #6B6880; font-weight: 300; margin: 0; max-width: 480px; margin-left: auto; margin-right: auto; }

  /* ── Contact card ── */
  .cpwrap { max-width: 460px; margin: 2.5rem auto 0; padding: 0 2rem; animation: cfa 0.5s ease 0.1s both; }
  .ccard { background: #111118; border: 1px solid #1E1E2A; border-radius: 16px; padding: 2.5rem 2rem; text-align: center; transition: border-color 0.2s; }
  .ccard:hover { border-color: #2A2A38; }
  .cicon { width: 64px; height: 64px; border-radius: 16px; background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; font-size: 1.75rem; }
  .cname { font-size: 1.3rem; font-weight: 700; color: #F0EEE9; margin: 0 0 0.25rem; }
  .csub { font-size: 0.78rem; color: #6B6880; margin: 0 0 1.5rem; }
  .cdiv { width: 100%; height: 1px; background: #1E1E2A; margin-bottom: 1.5rem; }
  .crow { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid #0F0F16; text-align: left; }
  .crow:last-child { border-bottom: none; }
  .cico { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.9rem; }
  .cinfo { flex: 1; min-width: 0; }
  .clbl { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #4A4860; margin-bottom: 2px; }
  .cval { font-size: 0.85rem; color: #F0EEE9; word-break: break-all; }
  .cval a { color: #6C63FF; text-decoration: none; }
  .cval a:hover { text-decoration: underline; }

  /* ── Footer ── */
  .cpftn { text-align: center; padding: 2rem; font-size: 0.7rem; color: #6B6880; letter-spacing: 0.05em; }
  .cpftn a { color: #6C63FF; text-decoration: none; }
  .cpftn a:hover { text-decoration: underline; }

  @keyframes cfa { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 600px) {
    .cnv { padding: 1rem 1.25rem; } .cnv .ne { display: none; }
    .cpwrap { padding: 0 1.25rem; } .ccard { padding: 1.75rem 1.25rem; }
  }
`;

export default function ContactPage({ session }) {
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
      <div className="cp">
        <div className="top-bar" />
        <nav className="cnv">
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

        <div className="cphero">
          <h1>Contact</h1>
          <p>Get in touch with the creator of DetachX.</p>
        </div>

        <div className="cpwrap">
          <div className="ccard">
            <div className="cicon">📧</div>
            <h2 className="cname">DetachX</h2>
            <p className="csub">Digital declutter, one email at a time.</p>
            <div className="cdiv" />

            <div className="crow">
              <div className="cico" style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)" }}>
                📦
              </div>
              <div className="cinfo">
                <div className="clbl">Project</div>
                <div className="cval">DetachX</div>
              </div>
            </div>

            <div className="crow">
              <div className="cico" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                👤
              </div>
              <div className="cinfo">
                <div className="clbl">Developer</div>
                <div className="cval">Devesh Vishwakarma</div>
              </div>
            </div>

            <div className="crow">
              <div className="cico" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                ✉️
              </div>
              <div className="cinfo">
                <div className="clbl">Contact Email</div>
                <div className="cval">
                  <a href="mailto:deveshvishwakarma5646@gmail.com">
                    nikkuvishwakarma2004@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cpftn">
          <p>© 2026 DetachX · All rights reserved</p>
          <p style={{ marginTop: "0.5rem" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/privacy"); }}>Privacy Policy</a>
            {" · "}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/terms"); }}>Terms of Service</a>
            {" · "}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Home</a>
          </p>
        </div>
      </div>
    </>
  );
}
