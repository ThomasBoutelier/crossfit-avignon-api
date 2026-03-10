import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { LeadsList } from "./pages/LeadsList";
import { LeadDetail } from "./pages/LeadDetail";
import { ToCall } from "./pages/ToCall";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Route publique */}
        <Route path="/login" element={<Login />} />

        {/* Routes protégées */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<LeadsList />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="to-call" element={<ToCall />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
