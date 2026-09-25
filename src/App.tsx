import { lazy, Suspense } from 'react';
// Certificate system routes
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Obrigado = lazy(() => import("./pages/Obrigado"));
const Termos = lazy(() => import("./pages/Termos"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const MembersDashboard = lazy(() => import("./pages/members/MembersDashboard"));
const MembersCourses = lazy(() => import("./pages/members/MembersCourses"));
const CourseOverview = lazy(() => import("./pages/members/CourseOverview"));
const MembersModules = lazy(() => import("./pages/members/MembersModules"));
const ModuleDetail = lazy(() => import("./pages/members/ModuleDetail"));
const LessonPlayer = lazy(() => import("./pages/members/LessonPlayer"));
const MembersMaterials = lazy(() => import("./pages/members/MembersMaterials"));
const MembersBonus = lazy(() => import("./pages/members/MembersBonus"));
const MembersSupport = lazy(() => import("./pages/members/MembersSupport"));
const MembersCertificate = lazy(() => import("./pages/members/MembersCertificate"));
const MembersCommunity = lazy(() => import("./pages/members/MembersCommunity"));
const CommunityPost = lazy(() => import("./pages/members/CommunityPost"));
const MembersUpdates = lazy(() => import("./pages/members/MembersUpdates"));
const MembersRanking = lazy(() => import("./pages/members/MembersRanking"));
const MembersProfile = lazy(() => import("./pages/members/MembersProfile"));
const MembersBookmarks = lazy(() => import("./pages/members/MembersBookmarks"));
const MembersAnalytics = lazy(() => import("./pages/members/MembersAnalytics"));
const ValidateCertificate = lazy(() => import("./pages/ValidateCertificate"));
const Downloads = lazy(() => import("./pages/Downloads"));
const CarouselEditor = lazy(() => import("./pages/CarouselEditor"));
const CarrosselPage = lazy(() => import("./pages/CarrosselPage"));
const StoriesPage = lazy(() => import("./pages/StoriesPage"));
const AcessoBloqueado = lazy(() => import("./pages/AcessoBloqueado"));
const CarouselPreviewPublic = lazy(() => import("./pages/CarouselPreviewPublic"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Checkout = lazy(() => import("./pages/Checkout"));
const LandingCinema = lazy(() => import("./pages/LandingCinema"));

// Método IA SaaS
const MetodoLanding = lazy(() => import("./pages/metodo/MetodoLanding"));
const MetodoPricing = lazy(() => import("./pages/metodo/MetodoPricing"));
const MetodoSolicitar = lazy(() => import("./pages/metodo/MetodoSolicitar"));
const MetodoLogin = lazy(() => import("./pages/metodo/MetodoLogin"));
const MetodoAcessoPendente = lazy(() => import("./pages/metodo/MetodoAcessoPendente"));
const MetodoApp = lazy(() => import("./pages/metodo/app/MetodoApp"));
const MetodoDashboard = lazy(() => import("./pages/metodo/app/MetodoDashboard"));
const MetodoPrompts = lazy(() => import("./pages/metodo/app/MetodoPrompts"));
const MetodoEditor = lazy(() => import("./pages/metodo/app/MetodoEditor"));
const MetodoTreinamento = lazy(() => import("./pages/metodo/app/MetodoTreinamento"));
const MetodoEquipe = lazy(() => import("./pages/metodo/app/MetodoEquipe"));

// Admin Panel
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminEmpresas = lazy(() => import("./pages/admin/AdminEmpresas"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminUsuarios = lazy(() => import("./pages/admin/AdminUsuarios"));
const AdminPrompts = lazy(() => import("./pages/admin/AdminPrompts"));
const AdminSetup = lazy(() => import("./pages/admin/AdminSetup"));
const AdminCursos = lazy(() => import("./pages/admin/AdminCursos"));
import { Analytics } from "./components/Analytics";
import { CookieConsent } from "./components/CookieConsent";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Analytics />
        <BrowserRouter>
          <CookieConsent />
          <Suspense fallback={<div role="status" className="min-h-screen grid place-items-center">Carregando...</div>}>
          <Routes>
            <Route path="/" element={<LandingCinema />} />
            <Route path="/completo" element={<Index />} />
            <Route path="/curso" element={<Navigate to="/completo" replace />} />
            <Route path="/obrigado" element={<Obrigado />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/checkout" element={<Checkout />} />
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
