export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
          <p className="text-white/70 text-sm">Atualizado em 01 de janeiro de 2025</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-12 space-y-5">
        {[
          {
            title: '1. Aceitação dos Termos',
            text: 'Ao criar uma conta ou usar a Ticketon, você concorda com estes Termos de Uso. Se não concordar, não utilize a plataforma.',
          },
          {
            title: '2. Descrição do Serviço',
            text: 'A Ticketon é uma plataforma intermediária que conecta organizadores de eventos a participantes, fornecendo ferramentas de venda de ingressos, check-in, analytics e comunicação.',
          },
          {
            title: '3. Conta de Usuário',
            text: 'Para usar a plataforma, você deve criar uma conta com informações verdadeiras. Você é responsável por manter a segurança de sua senha e por todas as atividades realizadas em sua conta.',
          },
          {
            title: '4. Obrigações do Organizador',
            text: 'O organizador é responsável por: cumprir com o evento divulgado, processar reembolsos quando aplicável, fornecer informações verídicas sobre o evento, e cumprir todas as leis aplicáveis.',
          },
          {
            title: '5. Taxa de Serviço',
            text: 'A Ticketon cobra uma taxa de 7% sobre o valor de cada ingresso pago vendido. Esta taxa é adicionada ao valor do ingresso e paga pelo comprador. Ingressos gratuitos não têm cobrança.',
          },
          {
            title: '6. Cancelamentos',
            text: 'Em caso de cancelamento do evento pelo organizador, os compradores serão reembolsados integralmente. A Ticketon se reserva o direito de suspender contas que violem estes termos.',
          },
          {
            title: '7. Propriedade Intelectual',
            text: 'Todo o conteúdo da plataforma (interface, marca, código) é propriedade da Ticketon. O organizador mantém os direitos sobre o conteúdo dos seus eventos.',
          },
          {
            title: '8. Limitação de Responsabilidade',
            text: 'A Ticketon não se responsabiliza por cancelamentos, atrasos, mudanças ou qualquer problema relacionado ao evento em si, sendo esta responsabilidade exclusiva do organizador.',
          },
          {
            title: '9. Modificações',
            text: 'Podemos atualizar estes termos a qualquer momento. Você será notificado por e-mail em caso de alterações significativas. O uso continuado da plataforma após as alterações implica aceitação.',
          },
          {
            title: '10. Foro',
            text: 'Fica eleito o foro da Comarca de São Paulo — SP para dirimir quaisquer questões oriundas destes Termos de Uso.',
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
