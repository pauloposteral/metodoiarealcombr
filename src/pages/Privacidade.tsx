import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import logo from '@/assets/logo-iareal.png';

const Privacidade = () => {
  return (
    <>
      <Helmet>
        <title>Política de Privacidade | Método IA Real</title>
        <meta name="description" content="Como o Método IA Real coleta, usa e protege seus dados pessoais — em conformidade com a LGPD (Lei nº 13.709/2018)." />
        <link rel="canonical" href="https://metodoiareal.com.br/privacidade" />
        <meta property="og:title" content="Política de Privacidade | Método IA Real" />
        <meta property="og:url" content="https://metodoiareal.com.br/privacidade" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="bg-navy-dark py-6 border-b border-gold/20">
          <div className="container">
            <div className="flex items-center justify-between">
              <Link to="/">
                <img src={logo} alt="Método IA Real" className="w-[250px] h-auto object-contain" />
              </Link>
              <Link to="/" className="flex items-center gap-2 text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
            </div>
          </div>
        </header>

        <main className="container py-12 md:py-20">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              Política de Privacidade
            </h1>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-sm text-muted-foreground/70 mb-8">
                Última atualização: Julho de 2026 · Em conformidade com a LGPD (Lei nº 13.709/2018)
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Controlador dos dados</h2>
                <p>
                  O controlador dos dados pessoais tratados por esta plataforma é a empresa
                  mantenedora do Método IA Real, com CNPJ em cadastro. Contato do encarregado (DPO):{' '}
                  <a href="mailto:contato@metodoiareal.com.br" className="text-gold hover:text-gold-light">
                    contato@metodoiareal.com.br
                  </a>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Dados que coletamos</h2>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong>Cadastro:</strong> nome, e-mail, senha (armazenada com hash), telefone (quando informado).</li>
                  <li><strong>Pagamento:</strong> não armazenamos dados de cartão. O processamento é feito pelo Stripe, que retorna apenas identificadores da transação.</li>
                  <li><strong>Uso da plataforma:</strong> aulas assistidas, tempo de estudo, anotações, marcadores, projetos enviados, respostas de quiz.</li>
                  <li><strong>Comunidade:</strong> posts, comentários e reações que você publicar voluntariamente.</li>
                  <li><strong>Navegação:</strong> páginas visitadas, tipo de dispositivo, IP e cookies (ver seção 6).</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">3. Bases legais e finalidades (LGPD art. 7º)</h2>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li><strong>Execução de contrato</strong> — liberar acesso, emitir certificado, prestar suporte.</li>
                  <li><strong>Cumprimento de obrigação legal</strong> — emissão fiscal e guarda de registros (art. 15 do Marco Civil).</li>
                  <li><strong>Legítimo interesse</strong> — segurança, prevenção a fraude, melhoria do produto (métricas agregadas).</li>
                  <li><strong>Consentimento</strong> — comunicações de marketing, cookies de análise e Pixel de mídia paga (Meta/Google). Você pode revogar a qualquer momento.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">4. Compartilhamento com terceiros (operadores)</h2>
                <p>Compartilhamos dados apenas com fornecedores essenciais à prestação do serviço:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li><strong>Stripe</strong> — processamento de pagamento (cartão e Pix).</li>
                  <li><strong>Supabase</strong> — banco de dados, autenticação e armazenamento (infra em nuvem).</li>
                  <li><strong>Google Analytics 4</strong> — métricas agregadas de uso (apenas com consentimento).</li>
                  <li><strong>Meta Pixel</strong> — atribuição de anúncios em Facebook/Instagram (apenas com consentimento).</li>
                  <li><strong>Provedor de e-mail transacional</strong> — envio de confirmações e recuperação de senha.</li>
                  <li><strong>Autoridades públicas</strong> — quando exigido por lei ou ordem judicial.</li>
                </ul>
                <p className="mt-3">
                  Não vendemos, alugamos nem cedemos dados pessoais para fins de marketing de terceiros.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Segurança</h2>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>TLS/SSL em todas as transmissões;</li>
                  <li>Senhas armazenadas com hash de mão única;</li>
                  <li>Row Level Security no banco de dados;</li>
                  <li>Acessos administrativos com autenticação forte e logs de auditoria;</li>
                  <li>Backups automáticos e monitoramento contínuo.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Cookies</h2>
                <p>Utilizamos três categorias de cookies:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li><strong>Essenciais</strong> — sessão, autenticação e preferências de tema. Não podem ser desligados.</li>
                  <li><strong>Análise</strong> — Google Analytics 4, para medir uso agregado. Ativados apenas com consentimento.</li>
                  <li><strong>Marketing</strong> — Meta Pixel, para atribuição de anúncios. Ativados apenas com consentimento.</li>
                </ul>
                <p className="mt-3">
                  Você pode revisar ou revogar o consentimento a qualquer momento limpando os dados do
                  site no seu navegador — o banner reaparece na próxima visita.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">7. Seus direitos como titular (LGPD art. 18)</h2>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>Confirmação da existência de tratamento;</li>
                  <li>Acesso aos dados;</li>
                  <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
                  <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
                  <li>Portabilidade dos dados a outro fornecedor;</li>
                  <li>Eliminação dos dados tratados com consentimento;</li>
                  <li>Informação sobre com quem compartilhamos seus dados;</li>
                  <li>Revogação do consentimento.</li>
                </ul>
                <p className="mt-3">
                  Para exercer qualquer direito, envie mensagem para{' '}
                  <a href="mailto:contato@metodoiareal.com.br" className="text-gold hover:text-gold-light">
                    contato@metodoiareal.com.br
                  </a>. Responderemos em até 15 dias.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">8. Retenção</h2>
                <p>
                  Mantemos seus dados enquanto durar o acesso ao curso e, após o encerramento, por
                  período adicional necessário ao cumprimento de obrigações legais (registros fiscais
                  por 5 anos; registros de acesso por 6 meses conforme Marco Civil da Internet).
                  Depois disso, os dados são anonimizados ou eliminados.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">9. Transferência internacional</h2>
                <p>
                  Alguns operadores (Stripe, Google, Meta) podem armazenar dados fora do Brasil.
                  Nestes casos, exigimos cláusulas contratuais e padrões de proteção compatíveis com
                  a LGPD.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">10. Alterações desta política</h2>
                <p>
                  Podemos atualizar esta política. Mudanças relevantes serão comunicadas por e-mail
                  e/ou aviso na plataforma antes de entrarem em vigor.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">11. Contato</h2>
                <p>
                  Dúvidas sobre privacidade ou para exercer direitos:{' '}
                  <a href="mailto:contato@metodoiareal.com.br" className="text-gold hover:text-gold-light">
                    contato@metodoiareal.com.br
                  </a>.
                </p>
                <p className="mt-3 text-sm">
                  Você também pode registrar reclamação junto à Autoridade Nacional de Proteção de
                  Dados (ANPD): <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light">gov.br/anpd</a>.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Privacidade;
