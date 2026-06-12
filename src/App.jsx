import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage  from "./HomePage";
import LoginPage from "./LoginPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"      element={<HomePage />}  />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </HashRouter>
  );
}