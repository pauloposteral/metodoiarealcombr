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
import MembersCourses from "./pages/members/MembersCourses";
import CourseOverview from "./pages/members/CourseOverview";
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
import MembersRanking from "./pages/members/MembersRanking";
import MembersProfile from "./pages/members/MembersProfile";
import MembersBookmarks from "./pages/members/MembersBookmarks";
import MembersAnalytics from "./pages/members/MembersAnalytics";
import ValidateCertificate from "./pages/ValidateCertificate";
import CourseContentPage from "./pages/CourseContent";
import Downloads from "./pages/Downloads";
import CarouselEditor from "./pages/CarouselEditor";
import CarrosselPage from "./pages/CarrosselPage";
import StoriesPage from "./pages/StoriesPage";
import AcessoBloqueado from "./pages/AcessoBloqueado";
import CarouselPreviewPublic from "./pages/CarouselPreviewPublic";
import Pricing from "./pages/Pricing";

// Método IA SaaS
import MetodoLanding from "./pages/metodo/MetodoLanding";
import MetodoPricing from "./pages/metodo/MetodoPricing";
import MetodoSolicitar from "./pages/metodo/MetodoSolicitar";
import MetodoLogin from "./pages/metodo/MetodoLogin";
import MetodoAcessoPendente from "./pages/metodo/MetodoAcessoPendente";
import MetodoApp from "./pages/metodo/app/MetodoApp";
import MetodoDashboard from "./pages/metodo/app/MetodoDashboard";
import MetodoPrompts from "./pages/metodo/app/MetodoPrompts";
import MetodoEditor from "./pages/metodo/app/MetodoEditor";
import MetodoTreinamento from "./pages/metodo/app/MetodoTreinamento";
import MetodoEquipe from "./pages/metodo/app/MetodoEquipe";

// Admin Panel
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEmpresas from "./pages/admin/AdminEmpresas";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminPrompts from "./pages/admin/AdminPrompts";
import AdminSetup from "./pages/admin/AdminSetup";
import AdminCursos from "./pages/admin/AdminCursos";

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
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/membros" element={<MembersDashboard />} />
            <Route path="/membros/cursos" element={<MembersCourses />} />
            <Route path="/membros/cursos/:slug" element={<CourseOverview />} />
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
            <Route path="/membros/ranking" element={<MembersRanking />} />
            <Route path="/membros/perfil" element={<MembersProfile />} />
            <Route path="/membros/salvos" element={<MembersBookmarks />} />
            <Route path="/membros/analytics" element={<MembersAnalytics />} />
            <Route path="/validar-certificado" element={<ValidateCertificate />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/carrossel" element={<CarrosselPage />} />
            <Route path="/carrossel-old" element={<CarouselEditor />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/acesso-bloqueado" element={<AcessoBloqueado />} />
            <Route path="/preview/:shareId" element={<CarouselPreviewPublic />} />
            
            {/* Método IA SaaS Routes */}
            <Route path="/metodo" element={<MetodoLanding />} />
            <Route path="/metodo/pricing" element={<MetodoPricing />} />
            <Route path="/metodo/solicitar" element={<MetodoSolicitar />} />
            <Route path="/metodo/login" element={<MetodoLogin />} />
            <Route path="/metodo/acesso-pendente" element={<MetodoAcessoPendente />} />
            <Route path="/metodo/app" element={<MetodoApp />}>
              <Route index element={<MetodoDashboard />} />
              <Route path="prompts" element={<MetodoPrompts />} />
              <Route path="editor" element={<MetodoEditor />} />
              <Route path="treinamento" element={<MetodoTreinamento />} />
              <Route path="equipe" element={<MetodoEquipe />} />
            </Route>
            
            {/* Admin Panel Routes */}
            <Route path="/admin/setup" element={<AdminSetup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/cursos" element={<AdminCursos />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/empresas" element={<AdminEmpresas />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/admin/prompts" element={<AdminPrompts />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
