import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import MercadoLivreCallback from "@/pages/MercadoLivreCallback";
import ApiTesterPage from "@/pages/ApiTesterPage";
import NotFound from "@/pages/NotFound";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/MainSidebar";
import "./App.css";

function App() {
  return (
    <Router>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <MainSidebar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/callback" element={<MercadoLivreCallback />} />
              <Route path="/api-tester/:storeId" element={<ApiTesterPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </SidebarProvider>
      <Toaster />
    </Router>
  );
}

export default App;