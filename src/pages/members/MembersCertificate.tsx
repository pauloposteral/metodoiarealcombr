import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MembersLayout } from '@/components/members/MembersLayout';
import { CertificateTemplate } from '@/components/members/CertificateTemplate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Download, PartyPopper, Lock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Certificate {
  id: string;
  certificate_code: string;
  student_name: string;
  course_name: string;
  total_hours: number;
  completed_at: string;
}

const MembersCertificate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [userName, setUserName] = useState('');
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Get user name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();
      
      setUserName(profile?.full_name || user.email?.split('@')[0] || 'Aluno');

      // Check existing certificate
      const { data: existingCert } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingCert) {
        setCertificate(existingCert);
      }

      // Calculate progress
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, duration_minutes');

      const { data: completedLessons } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('completed', true);

      const total = lessons?.length || 0;
      const completed = completedLessons?.length || 0;
      setProgress({ completed, total });

      // If 100% completed and no certificate, generate one
      if (total > 0 && completed >= total && !existingCert) {
        await generateCertificate(user.id, profile?.full_name || user.email?.split('@')[0] || 'Aluno', lessons);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async (userId: string, studentName: string, lessons: any[]) => {
    setGenerating(true);
    try {
      // Calculate total hours
      const totalMinutes = lessons?.reduce((acc, l) => acc + (l.duration_minutes || 0), 0) || 0;
      const totalHours = Math.max(1, Math.round(totalMinutes / 60));

      // Generate unique code
      const code = `IAR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { data, error } = await supabase
        .from('certificates')
        .insert({
          user_id: userId,
          certificate_code: code,
          student_name: studentName,
          course_name: 'Método IA Real',
          total_hours: totalHours,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setCertificate(data);
      setShowCongrats(true);
      
      toast({
        title: "🎉 Parabéns!",
        description: "Seu certificado foi gerado com sucesso!",
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o certificado.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!certificateRef.current || !certificate) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Certificado-${certificate.student_name.replace(/\s+/g, '-')}-MetodoIAReal.pdf`);

      toast({
        title: "Download iniciado",
        description: "Seu certificado está sendo baixado.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar o certificado.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const progressPercent = progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100) 
    : 0;

  if (loading) {
    return (
      <MembersLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      </MembersLayout>
    );
  }

  return (
    <MembersLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">Certificado</h1>
          <p className="text-muted-foreground">
            Seu certificado de conclusão do curso Método IA Real
          </p>
        </div>

        {/* Congratulations Modal */}
        {showCongrats && (
          <Card className="bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 border-gold/50">
            <CardContent className="p-8 text-center">
              <PartyPopper className="w-16 h-16 text-gold mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary-foreground mb-2">
                🎉 Parabéns pela conquista!
              </h2>
              <p className="text-muted-foreground mb-4">
                Você concluiu 100% do curso Método IA Real. Seu certificado está pronto!
              </p>
              <Button 
                onClick={() => setShowCongrats(false)}
                className="bg-gold hover:bg-gold/90 text-navy-dark"
              >
                Ver meu certificado
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress or Certificate */}
        {!certificate ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8 text-center">
              <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-primary-foreground mb-2">
                Certificado bloqueado
              </h2>
              <p className="text-muted-foreground mb-6">
                Complete 100% das aulas para desbloquear seu certificado.
              </p>
              
              {/* Progress bar */}
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Progresso atual</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gold to-gold/80 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {progress.completed} de {progress.total} aulas concluídas
                </p>
              </div>

              <Button 
                onClick={() => navigate('/membros/modulos')}
                className="mt-6 bg-gold hover:bg-gold/90 text-navy-dark"
              >
                Continuar estudando
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Certificate Actions */}
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gold/20">
                      <Award className="w-8 h-8 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-foreground">
                        Certificado disponível
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Código: {certificate.certificate_code}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={downloadPDF}
                    disabled={downloading}
                    className="bg-gold hover:bg-gold/90 text-navy-dark gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {downloading ? 'Baixando...' : 'Baixar certificado'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card/30 border-border/30">
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aluno</p>
                  <p className="font-semibold text-primary-foreground">{certificate.student_name}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/30 border-border/30">
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Carga Horária</p>
                  <p className="font-semibold text-primary-foreground">{certificate.total_hours} horas</p>
                </CardContent>
              </Card>
              <Card className="bg-card/30 border-border/30">
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Concluído em</p>
                  <p className="font-semibold text-primary-foreground">
                    {new Date(certificate.completed_at).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Certificate Preview */}
            <Card className="bg-card/50 border-border/50 overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary-foreground mb-4">
                  Pré-visualização
                </h3>
                <div className="overflow-x-auto">
                  <div className="min-w-[1123px]">
                    <CertificateTemplate
                      ref={certificateRef}
                      studentName={certificate.student_name}
                      courseName={certificate.course_name}
                      totalHours={certificate.total_hours}
                      completedAt={certificate.completed_at}
                      certificateCode={certificate.certificate_code}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MembersLayout>
  );
};

export default MembersCertificate;
