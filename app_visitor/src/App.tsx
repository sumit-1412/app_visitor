import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
// import AdminLogin from "./pages/AdminLogin";
import Kiosk from "./pages/kiosk/kioskPage";
// import Documentation from "./pages/Documentation";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/admin/login" element={<AdminLogin />} /> */}
        <Route path="/kiosk" element={<Kiosk />} />
        {/* <Route path="/documents" element={<Documentation />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
