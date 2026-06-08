export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
          <p className="text-white/70 text-sm">Atualizada em 01 de janeiro de 2025</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-12 space-y-5">
        {[
          {
            title: '1. Quem somos',
            text: 'A Ticketon é uma plataforma de venda e gerenciamento de ingressos para eventos. Este documento explica como coletamos, usamos e protegemos seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).',
          },
          {
            title: '2. Dados que coletamos',
            text: 'Coletamos: nome completo, e-mail, CPF/CNPJ, telefone, dados de pagamento (tokenizados via Mercado Pago), dados demográficos opcionais (idade, gênero, bairro) e dados de uso da plataforma (logs de acesso, histórico de compras).',
          },
          {
            title: '3. Como usamos seus dados',
            text: 'Utilizamos seus dados para: processar compras e pagamentos, enviar ingressos e notificações, garantir segurança das transações, gerar analytics agregados para organizadores, e cumprir obrigações legais.',
          },
          {
            title: '4. Compartilhamento',
            text: 'Compartilhamos dados apenas com: Mercado Pago (processamento de pagamentos), organizadores do evento (nome e e-mail do comprador), e autoridades quando exigido por lei. Não vendemos dados para terceiros.',
          },
          {
            title: '5. Seus direitos (LGPD)',
            text: 'Você tem direito a: acessar seus dados, corrigir informações incorretas, solicitar exclusão dos seus dados, revogar consentimento, e portabilidade dos dados. Solicite pelo e-mail privacidade@ticketon.com.br.',
          },
          {
            title: '6. Segurança',
            text: 'Utilizamos criptografia SSL/TLS em todas as comunicações, senhas armazenadas com hash bcrypt, e acesso restrito aos dados por equipe autorizada.',
          },
          {
            title: '7. Retenção de dados',
            text: 'Dados de conta são mantidos enquanto a conta estiver ativa ou conforme exigência legal. Após exclusão da conta, os dados são removidos em até 30 dias, exceto os obrigados por lei (5 anos para dados fiscais).',
          },
          {
            title: '8. Contato',
            text: 'Para questões sobre privacidade: privacidade@ticketon.com.br. Para reclamações: Autoridade Nacional de Proteção de Dados (ANPD) — gov.br/anpd.',
          },
        ].map(section => (
          <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-2">{section.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{section.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
