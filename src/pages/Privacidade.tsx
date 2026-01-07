import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import logo from '@/assets/logo-iareal.png';

const Privacidade = () => {
  return (
    <>
      <Helmet>
        <title>Política de Privacidade | Método IA Real</title>
        <meta name="description" content="Política de Privacidade do curso Método IA Real" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-navy-dark py-6 border-b border-gold/20">
          <div className="container">
            <div className="flex items-center justify-between">
              <Link to="/">
                <img src={logo} alt="Método IA Real" className="h-8" />
              </Link>
              <Link to="/" className="flex items-center gap-2 text-primary-foreground/70 hover:text-gold transition-colors text-sm">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="container py-12 md:py-20">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
              Política de Privacidade
            </h1>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-sm text-muted-foreground/70 mb-8">
                Última atualização: Janeiro de 2026
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Introdução</h2>
                <p>
                  A sua privacidade é importante para nós. Esta Política de Privacidade explica como 
                  coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você 
                  utiliza o curso Método IA Real.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Dados Coletados</h2>
                <p>Coletamos os seguintes tipos de informações:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li><strong>Dados de cadastro:</strong> nome completo, e-mail, telefone</li>
                  <li><strong>Dados de pagamento:</strong> processados de forma segura pela plataforma Greenn</li>
                  <li><strong>Dados de navegação:</strong> páginas visitadas, tempo de permanência, dispositivo utilizado</li>
                  <li><strong>Dados de progresso:</strong> aulas assistidas, materiais baixados, certificados emitidos</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">3. Como Usamos Seus Dados</h2>
                <p>Utilizamos suas informações para:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Fornecer acesso ao curso e à área de membros</li>
                  <li>Processar pagamentos e emitir notas fiscais</li>
                  <li>Enviar comunicações sobre o curso (atualizações, novidades)</li>
                  <li>Melhorar a experiência do usuário na plataforma</li>
                  <li>Emitir certificados de conclusão</li>
                  <li>Fornecer suporte ao aluno</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">4. Compartilhamento de Dados</h2>
                <p>
                  Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para 
                  fins de marketing. Podemos compartilhar dados apenas com:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Processadores de pagamento (Greenn) para efetuar transações</li>
                  <li>Serviços de e-mail para envio de comunicações</li>
                  <li>Autoridades legais, quando exigido por lei</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Segurança dos Dados</h2>
                <p>
                  Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, 
                  incluindo:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Criptografia SSL em todas as transmissões de dados</li>
                  <li>Armazenamento seguro em servidores protegidos</li>
                  <li>Acesso restrito às informações apenas a pessoas autorizadas</li>
                  <li>Monitoramento contínuo de segurança</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Cookies</h2>
                <p>
                  Utilizamos cookies para melhorar sua experiência na plataforma. Os cookies nos ajudam a:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Manter você logado na área de membros</li>
                  <li>Lembrar suas preferências</li>
                  <li>Analisar o uso da plataforma para melhorias</li>
                  <li>Personalizar conteúdo e anúncios</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">7. Seus Direitos (LGPD)</h2>
                <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos ou incorretos</li>
                  <li>Solicitar a exclusão de seus dados</li>
                  <li>Revogar consentimento a qualquer momento</li>
                  <li>Solicitar portabilidade dos dados</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">8. Retenção de Dados</h2>
                <p>
                  Mantemos seus dados pelo tempo necessário para fornecer o serviço contratado e cumprir 
                  obrigações legais. Após a exclusão da conta, alguns dados podem ser mantidos por até 
                  5 anos para fins fiscais e legais.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">9. Alterações nesta Política</h2>
                <p>
                  Podemos atualizar esta política periodicamente. Alterações significativas serão 
                  comunicadas por e-mail ou através de aviso na plataforma.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">10. Contato</h2>
                <p>
                  Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato:
                  <a href="mailto:contato@metodoiareal.com.br" className="text-gold hover:text-gold-light ml-1">
                    contato@metodoiareal.com.br
                  </a>
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
