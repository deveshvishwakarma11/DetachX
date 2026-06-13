import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const dashStyles = `
  .dash-page {
    position: relative;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    overflow: hidden;
    background: #0A0A0F;
    font-family: 'Space Grotesk', sans-serif;
  }
  .dash-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, #0A0A0F 100%);
    z-index: 1;
    pointer-events: none;
  }
  .dash-page .bg-x {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 0;
  }
  .dash-page .bg-x svg {
    width: min(70vw, 600px);
    height: min(70vw, 600px);
    opacity: 0.025;
    animation: pulse-x 6s ease-in-out infinite;
  }
  .dash-page .top-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #1E1E2A 30%, #6C63FF 50%, #1E1E2A 70%, transparent);
    z-index: 10;
  }
  .dash-page .wordmark {
    position: absolute;
    top: 2rem;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #F0EEE9;
    z-index: 10;
  }
  .dash-page .wordmark span { color: #6C63FF; }
  .dash-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #111118;
    border: 1px solid #1E1E2A;
    border-radius: 16px;
    padding: 2.75rem 2.5rem 2.5rem;
    box-shadow: 0 0 0 1px rgba(108,99,255,0.06), 0 32px 64px rgba(0,0,0,0.5);
    animation: fade-up 0.6s ease forwards;
  }
  .dash-avatar {
    width: 80px; height: 80px;
    border-radius: 50%;
    border: 2px solid #2A2A38;
    margin-bottom: 1.25rem;
    object-fit: cover;
  }
  .dash-name {
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #F0EEE9;
    margin: 0 0 0.35rem;
    text-align: center;
  }
  .dash-email {
    font-size: 0.85rem;
    font-weight: 300;
    color: #6B6880;
    margin: 0 0 2rem;
    text-align: center;
  }
  .dash-divider {
    width: 100%;
    height: 1px;
    background: #1E1E2A;
    margin-bottom: 2rem;
  }
  .scan-btn {
    position: relative;
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: #0A0A0F;
    padding: 0.9rem 1.5rem;
    border-radius: 8px;
    border: none;
    background: #F0EEE9;
    cursor: pointer;
    margin-bottom: 0.85rem;
    transition: background 0.2s ease, transform 0.15s ease;
  }
  .scan-btn:hover { background: #ffffff; transform: translateY(-1px); }
  .logout-btn {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    color: #4A4860;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: 1px solid #1E1E2A;
    background: transparent;
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease;
  }
  .logout-btn:hover { color: #6B6880; border-color: #2A2A38; }
  .dash-page .footer-note {
    position: absolute;
    bottom: 2rem;
    font-size: 0.72rem;
    color: #6B6880;
    letter-spacing: 0.05em;
    z-index: 10;
  }
  @keyframes pulse-x {
    0%, 100% { opacity: 0.025; transform: scale(1); }
    50%       { opacity: 0.04;  transform: scale(1.04); }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 480px) {
    .dash-card { padding: 2rem 1.5rem; }
  }
`;

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("detachx_user") || "null");

  useEffect(() => {
    if (!user) navigate("/login");
  }, []);

  const handleScan = () => {
    const token = localStorage.getItem("gmail_token");
    if (!token) {
      // Token missing — force re-login
      navigate("/login");
      return;
    }
    // ✅ Token exists — go straight to scan, no OAuth popup
    navigate("/scan");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user) return null;

  return (
    <>
      <style>{dashStyles}</style>
      <div className="dash-page">
        <div className="top-bar" />
        <div className="bg-x" aria-hidden="true">
          <svg viewBox="0 0 200 200" fill="none">
            <line x1="20" y1="20" x2="180" y2="180" stroke="#6C63FF" strokeWidth="14" strokeLinecap="round"/>
            <line x1="180" y1="20" x2="20"  y2="180" stroke="#6C63FF" strokeWidth="14" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="wordmark">Detach<span>X</span></div>
        <div className="dash-card">
          <img
            src={user.picture}
            alt="Profile"
            referrerPolicy="no-referrer"
            className="dash-avatar"
          />
          <h1 className="dash-name">{user.name}</h1>
          <p className="dash-email">{user.email}</p>
          <div className="dash-divider" />
          {/* ✅ No OAuth here — uses stored token */}
          <button className="scan-btn" onClick={handleScan}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v14M1 8h14" stroke="#0A0A0F" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Scan Gmail
          </button>
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>
        <p className="footer-note">© 2026 DetachX · All rights reserved</p>
      </div>
    </>
  );
}