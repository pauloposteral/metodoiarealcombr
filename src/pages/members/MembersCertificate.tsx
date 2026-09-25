import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Award, CheckCircle2, Download, Loader2, Lock, PartyPopper, Play } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { CertificateTemplate } from '@/components/members/CertificateTemplate';
import { CertificateRequirements } from '@/components/members/CertificateRequirements';
import { PageError, PageLoading } from '@/components/members/PageStates';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  useCertificateStatus,
  useIssueCertificate,
  useIssuedCertificate,
  useProfileName,
  type IssuedCertificate,
} from '@/hooks/useCertificate';
import { useCompletedLessons, useCourseCatalog } from '@/hooks/useCourseOutline';
import { certificateRequirements, findResumeLesson, isTrackKey } from '@/lib/curriculum';

/** Friendly message for `issue_certificate()` errors (Postgres errors are plain objects). */
function issueErrorMessage(error: unknown): string {
  const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
  if (/paid access/i.test(message)) return 'A emissão do certificado faz parte dos planos pagos.';
  if (/final project/i.test(message)) return 'Falta concluir e entregar o projeto final do MOD-12.';
  if (/course incomplete/i.test(message)) return 'Você ainda não concluiu as aulas necessárias da sua trilha.';
  return 'Tente de novo em instantes.';
}

const MembersCertificate = () => {
  const status = useCertificateStatus();
  const issued = useIssuedCertificate();

  let body;
  if (issued.isPending || (status.isPending && !issued.data)) {
    body = <PageLoading label="Carregando certificado…" />;
  } else if (issued.isError || (status.isError && !issued.data)) {
    body = (
      <PageError
        title="Não foi possível carregar o certificado"
        onRetry={() => {
          void issued.refetch();
          void status.refetch();
        }}
      />
    );
  } else if (issued.data) {
    body = <IssuedView certificate={issued.data} />;
  } else if (status.data) {
    body = <RequirementsView />;
  }

  return (
    <MembersLayout>
      <Helmet>
        <title>Certificado | Método IA Real</title>
      </Helmet>
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground md:text-3xl">
            <Award className="h-7 w-7 text-gold-dark dark:text-accent" aria-hidden="true" />
            Certificado
          </h1>
          <p className="mt-1 text-muted-foreground">Conclua a sua trilha e o projeto final para emitir o certificado do Método IA Real.</p>
        </header>
        {body}
      </div>
    </MembersLayout>
  );
};

function RequirementsView() {
  const { toast } = useToast();
  const status = useCertificateStatus();
  const profileName = useProfileName();
  const issue = useIssueCertificate();
  const catalog = useCourseCatalog();
  const completed = useCompletedLessons();

  if (!status.data) return null;
  const requirements = certificateRequirements(status.data);
  const main = catalog.data?.main ?? null;
  const resume = main && completed.data ? findResumeLesson(main.outline, isTrackKey(status.data.track) ? status.data.track : null, completed.data) : null;

  const handleIssue = () => {
    issue.mutate(undefined, {
      onSuccess: () => toast({ title: 'Certificado emitido!', description: 'Parabéns pela conquista. Já dá para baixar o PDF.' }),
      onError: (error) => toast({ title: 'Não foi possível emitir o certificado', description: issueErrorMessage(error), variant: 'destructive' }),
    });
  };

  return (
    <div className="space-y-6">
      <CertificateRequirements requirements={requirements} totalMinutes={status.data.total_minutes} />

      {requirements.eligible ? (
        <section aria-labelledby="certificate-issue-title" className="rounded-2xl border border-accent/50 bg-accent/10 p-5 sm:p-6">
          <h2 id="certificate-issue-title" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            Tudo pronto para emitir
          </h2>
          <p className="mt-2 text-sm text-foreground/85">
            O certificado sai com o nome do seu perfil:{' '}
            <strong className="text-foreground">{profileName.data ?? 'Aluno'}</strong>. Confira antes de emitir.{' '}
            <Link
              to="/membros/perfil"
              className="rounded-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Editar nome no perfil
            </Link>
          </p>
          <Button type="button" variant="cta" size="lg" className="mt-5" onClick={handleIssue} disabled={issue.isPending || profileName.isPending}>
            {issue.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Award aria-hidden="true" />}
            Emitir meu certificado
          </Button>
        </section>
      ) : (
        <section aria-labelledby="certificate-locked-title" className="rounded-2xl border border-border/50 bg-card p-5 text-center sm:p-8">
          <Lock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <h2 id="certificate-locked-title" className="font-display text-lg font-bold text-foreground">Certificado ainda bloqueado</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Cumpra os requisitos acima e o botão para emitir aparece aqui.</p>
          <Button asChild variant="cta" className="mt-5">
            <Link to={resume ? `/membros/aula/${resume.id}` : main ? `/membros/cursos/${main.course.slug}` : '/membros/cursos'}>
              <Play aria-hidden="true" />
              Continuar estudando
            </Link>
          </Button>
        </section>
      )}
    </div>
  );
}

function IssuedView({ certificate }: { certificate: IssuedCertificate }) {
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const completedAt = new Date(certificate.completed_at).toLocaleDateString('pt-BR');

  const downloadPdf = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Certificado-${certificate.student_name.replace(/\s+/g, '-')}-MetodoIAReal.pdf`);
      toast({ title: 'Download iniciado', description: 'Seu certificado está sendo baixado.' });
    } catch (error) {
      console.error('[MembersCertificate] could not generate the PDF', error);
      toast({ title: 'Não foi possível baixar o certificado', description: 'Tente de novo em instantes.', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section aria-labelledby="certificate-ready-title" className="rounded-2xl border border-accent/50 bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <PartyPopper className="mt-0.5 h-8 w-8 shrink-0 text-gold-dark dark:text-accent" aria-hidden="true" />
            <div>
              <h2 id="certificate-ready-title" className="font-display text-lg font-bold text-foreground">Parabéns, seu certificado está pronto!</h2>
              <p className="mt-1 break-all text-sm text-muted-foreground">Código de validação: {certificate.certificate_code}</p>
            </div>
          </div>
          <Button type="button" variant="cta" onClick={() => void downloadPdf()} disabled={downloading} className="shrink-0">
            {downloading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
            {downloading ? 'Gerando PDF…' : 'Baixar certificado (PDF)'}
          </Button>
        </div>
      </section>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoTile label="Aluno" value={certificate.student_name} />
        <InfoTile label="Curso" value={certificate.course_name} />
        <InfoTile label="Carga horária · conclusão" value={`${certificate.total_hours} horas · ${completedAt}`} />
      </dl>

      <section aria-labelledby="certificate-preview-title" className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6">
        <h2 id="certificate-preview-title" className="mb-1 font-display text-lg font-bold text-foreground">Pré-visualização</h2>
        <p className="mb-4 text-xs text-muted-foreground sm:hidden">Deslize para o lado para ver o certificado inteiro.</p>
        {/* Inline-size containment keeps the 1123px template from widening the page. */}
        <div
          role="region"
          aria-label="Pré-visualização do certificado"
          tabIndex={0}
          className="overflow-x-auto rounded-xl [contain:inline-size] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
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
        <p className="mt-4 text-xs text-muted-foreground">
          Qualquer pessoa pode confirmar a autenticidade em{' '}
          <Link to="/validar-certificado" className="rounded-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Validar certificado
          </Link>{' '}
          com o código acima.
        </p>
      </section>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}

export default MembersCertificate;
