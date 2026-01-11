// Certificate system routes
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Obrigado from "./pages/Obrigado";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import MembersDashboard from "./pages/members/MembersDashboard";
import MembersModules from "./pages/members/MembersModules";
import ModuleDetail from "./pages/members/ModuleDetail";
import LessonPlayer from "./pages/members/LessonPlayer";
import MembersMaterials from "./pages/members/MembersMaterials";
import MembersBonus from "./pages/members/MembersBonus";
import MembersSupport from "./pages/members/MembersSupport";
import MembersCertificate from "./pages/members/MembersCertificate";
import MembersCommunity from "./pages/members/MembersCommunity";
import CommunityPost from "./pages/members/CommunityPost";
import MembersUpdates from "./pages/members/MembersUpdates";
import ValidateCertificate from "./pages/ValidateCertificate";
import CourseContentPage from "./pages/CourseContent";
import Downloads from "./pages/Downloads";
import CarouselEditor from "./pages/CarouselEditor";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/curso" element={<CourseContentPage />} />
            <Route path="/obrigado" element={<Obrigado />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/membros" element={<MembersDashboard />} />
            <Route path="/membros/modulos" element={<MembersModules />} />
            <Route path="/membros/modulos/:moduleId" element={<ModuleDetail />} />
            <Route path="/membros/aula/:lessonId" element={<LessonPlayer />} />
            <Route path="/membros/materiais" element={<MembersMaterials />} />
            <Route path="/membros/bonus" element={<MembersBonus />} />
            <Route path="/membros/suporte" element={<MembersSupport />} />
            <Route path="/membros/certificado" element={<MembersCertificate />} />
            <Route path="/membros/comunidade" element={<MembersCommunity />} />
            <Route path="/membros/comunidade/post/:postId" element={<CommunityPost />} />
            <Route path="/membros/atualizacoes" element={<MembersUpdates />} />
            <Route path="/validar-certificado" element={<ValidateCertificate />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/carrossel" element={<CarouselEditor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
