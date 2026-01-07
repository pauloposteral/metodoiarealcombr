import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import logo from '@/assets/logo-iareal.png';

const Termos = () => {
  return (
    <>
      <Helmet>
        <title>Termos de Uso | Método IA Real</title>
        <meta name="description" content="Termos de Uso do curso Método IA Real" />
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
              Termos de Uso
            </h1>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-sm text-muted-foreground/70 mb-8">
                Última atualização: Janeiro de 2026
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Aceitação dos Termos</h2>
                <p>
                  Ao acessar e utilizar o curso Método IA Real, você concorda com estes Termos de Uso. 
                  Se não concordar com qualquer parte destes termos, não utilize nossos serviços.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Descrição do Serviço</h2>
                <p>
                  O Método IA Real é um curso online que ensina o uso prático de Inteligência Artificial. 
                  O acesso inclui:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Aulas em vídeo gravadas</li>
                  <li>Material de apoio em PDF</li>
                  <li>Acesso à comunidade de alunos</li>
                  <li>Certificado de conclusão</li>
                  <li>Atualizações futuras do conteúdo</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">3. Acesso ao Curso</h2>
                <p>
                  Após a confirmação do pagamento, você receberá acesso imediato ao curso através do e-mail 
                  cadastrado. O acesso é pessoal e intransferível, sendo vedado o compartilhamento de login 
                  e senha com terceiros.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">4. Propriedade Intelectual</h2>
                <p>
                  Todo o conteúdo do curso, incluindo vídeos, textos, imagens, materiais de apoio e metodologia, 
                  é protegido por direitos autorais. É expressamente proibido:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Copiar, reproduzir ou distribuir o conteúdo</li>
                  <li>Gravar ou capturar as aulas em vídeo</li>
                  <li>Compartilhar materiais com terceiros</li>
                  <li>Utilizar o conteúdo para fins comerciais sem autorização</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Garantia e Reembolso</h2>
                <p>
                  Oferecemos garantia incondicional de 7 (sete) dias corridos a partir da data de compra. 
                  Se não estiver satisfeito, basta solicitar o reembolso dentro do prazo, e o valor será 
                  devolvido integralmente em até 7 dias úteis.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Responsabilidades do Aluno</h2>
                <p>O aluno se compromete a:</p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Manter seus dados de acesso em segurança</li>
                  <li>Não compartilhar seu login com terceiros</li>
                  <li>Utilizar o conteúdo apenas para fins pessoais e educacionais</li>
                  <li>Respeitar as regras da comunidade</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">7. Limitação de Responsabilidade</h2>
                <p>
                  O Método IA Real oferece conteúdo educacional e não garante resultados específicos. 
                  Os resultados dependem da dedicação e aplicação individual de cada aluno.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">8. Alterações nos Termos</h2>
                <p>
                  Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações 
                  significativas serão comunicadas por e-mail aos alunos cadastrados.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">9. Contato</h2>
                <p>
                  Para dúvidas sobre estes termos, entre em contato através do e-mail: 
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

export default Termos;
