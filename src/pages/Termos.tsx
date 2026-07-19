import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import logo from '@/assets/logo-iareal.png';

const Termos = () => {
  return (
    <>
      <Helmet>
        <title>Termos de Uso | Método IA Real</title>
        <meta name="description" content="Termos de Uso do curso Método IA Real — condições de acesso, garantia de 7 dias, propriedade intelectual e responsabilidades." />
        <link rel="canonical" href="https://metodoiareal.com.br/termos" />
        <meta property="og:title" content="Termos de Uso | Método IA Real" />
        <meta property="og:url" content="https://metodoiareal.com.br/termos" />
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
              Termos de Uso
            </h1>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-sm text-muted-foreground/70 mb-8">
                Última atualização: Julho de 2026
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Aceitação dos Termos</h2>
                <p>
                  Ao acessar ou utilizar o curso Método IA Real ("Serviço"), você declara ter lido,
                  compreendido e concordado integralmente com estes Termos de Uso e com a nossa{' '}
                  <Link to="/privacidade" className="text-gold hover:text-gold-light">Política de Privacidade</Link>.
                  Se não concordar, não realize a compra e não utilize a plataforma.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Identificação do fornecedor</h2>
                <p>
                  O Método IA Real é operado por sua empresa mantenedora, com CNPJ em cadastro, sediada no Brasil.
                  Contato oficial:{' '}
                  <a href="mailto:contato@metodoiareal.com.br" className="text-gold hover:text-gold-light">
                    contato@metodoiareal.com.br
                  </a>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">3. Descrição do Serviço</h2>
                <p>
                  O Serviço consiste em curso online de Inteligência Artificial aplicada, distribuído
                  em módulos, com material de apoio, comunidade de alunos, certificado de conclusão e
                  atualizações periódicas ("Radar IA"). A disponibilidade de aulas e bônus segue o
                  cronograma comunicado no site e pode evoluir ao longo do tempo.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">4. Acesso e Conta</h2>
                <p>
                  Após a confirmação do pagamento, o aluno recebe acesso à área de membros pelo e-mail
                  cadastrado. O acesso é <strong>pessoal e intransferível</strong>. É vedado compartilhar
                  credenciais, revender ou disponibilizar o conteúdo a terceiros. O descumprimento
                  autoriza o encerramento imediato do acesso, sem reembolso.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Pagamento</h2>
                <p>
                  Os pagamentos são processados por gateway parceiro (Stripe), aceitando cartão de
                  crédito e Pix, conforme opções exibidas no checkout. Todos os valores são cobrados
                  em reais (BRL). O acesso é liberado após a confirmação da transação pelo provedor
                  de pagamento.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Direito de Arrependimento e Garantia</h2>
                <p>
                  Nos termos do art. 49 do Código de Defesa do Consumidor, você pode desistir da
                  compra em até <strong>7 (sete) dias corridos</strong> a partir do pagamento,
                  independentemente de justificativa. Basta enviar solicitação para{' '}
                  <a href="mailto:contato@metodoiareal.com.br" className="text-gold hover:text-gold-light">
                    contato@metodoiareal.com.br
                  </a>{' '}
                  informando o e-mail da compra. O valor é devolvido integralmente pelo mesmo meio de
                  pagamento em até 7 dias úteis após o processamento pelo gateway.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">7. Propriedade Intelectual</h2>
                <p>
                  Todo o conteúdo — vídeos, textos, imagens, marcas, materiais de apoio, prompts,
                  templates e metodologia — é protegido por direitos autorais (Lei nº 9.610/98) e
                  pertence ao Método IA Real ou aos respectivos licenciantes. São expressamente vedados:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Copiar, reproduzir, editar ou redistribuir qualquer conteúdo;</li>
                  <li>Gravar aulas por qualquer meio ou capturar telas para divulgação;</li>
                  <li>Compartilhar materiais em grupos, drives públicos ou redes sociais;</li>
                  <li>Utilizar o conteúdo em cursos, treinamentos ou produtos concorrentes.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">8. Uso da Inteligência Artificial e Isenções</h2>
                <p>
                  O curso ensina técnicas para uso de ferramentas de IA de terceiros (ChatGPT, Claude,
                  Gemini e outras). Estas ferramentas podem apresentar erros, alucinações ou variações
                  de resultado. O aluno é responsável por revisar criticamente as saídas antes de
                  aplicá-las em contexto profissional, comercial, jurídico ou de saúde.
                </p>
                <p className="mt-3">
                  <strong>Não há promessa de ganho financeiro.</strong> Resultados dependem da dedicação,
                  contexto e execução individual. Nenhuma parte do material configura consultoria
                  financeira, jurídica, contábil ou médica.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">9. Comunidade e Comportamento</h2>
                <p>
                  Na comunidade de alunos são vedados: assédio, discurso de ódio, discriminação, spam,
                  divulgação de conteúdo pirata, autopromoção agressiva e vazamento de material do
                  curso. Violações resultam em advertência ou banimento, sem reembolso.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">10. Suporte</h2>
                <p>
                  Suporte por e-mail em até 24 horas úteis (segunda a sexta, exceto feriados). Dúvidas
                  técnicas sobre ferramentas de terceiros podem ser encaminhadas para os canais oficiais
                  dos fabricantes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">11. Limitação de Responsabilidade</h2>
                <p>
                  O Método IA Real não se responsabiliza por: (i) indisponibilidade temporária causada
                  por manutenção, falha de rede ou terceiros; (ii) decisões e resultados obtidos pelo
                  aluno com base no conteúdo; (iii) custos de ferramentas de IA de terceiros contratadas
                  pelo aluno. A responsabilidade máxima, em qualquer hipótese, fica limitada ao valor
                  efetivamente pago pelo curso.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">12. Alterações</h2>
                <p>
                  Podemos atualizar estes termos a qualquer momento para refletir mudanças legais ou
                  no serviço. Alterações relevantes serão comunicadas por e-mail e/ou por aviso na
                  plataforma com antecedência razoável.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">13. Foro e Lei Aplicável</h2>
                <p>
                  Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de
                  domicílio do consumidor para dirimir qualquer controvérsia, salvo disposição legal
                  em contrário.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">14. Contato</h2>
                <p>
                  Dúvidas sobre estes Termos:{' '}
                  <a href="mailto:contato@metodoiareal.com.br" className="text-gold hover:text-gold-light">
                    contato@metodoiareal.com.br
                  </a>.
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
