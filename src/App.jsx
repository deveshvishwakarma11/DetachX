import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage     from "./HomePage";
import LoginPage    from "./LoginPage";
import DashboardPage from "./DashboardPage";
import ScanPage     from "./ScanPage";
import ResultsPage  from "./ResultsPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"         element={<HomePage />}      />
        <Route path="/login"    element={<LoginPage />}     />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/scan"     element={<ScanPage />}      />
        <Route path="/results"  element={<ResultsPage />}   />
      </Routes>
    </HashRouter>
  );
}