export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-3xl font-bold mb-2">Política de Cookies</h1>
          <p className="text-white/70 text-sm">Atualizada em 01 de janeiro de 2025</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-12 space-y-5">
        {[
          {
            title: 'O que são Cookies?',
            text: 'Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita um site. Eles ajudam o site a lembrar suas preferências e a funcionar corretamente.',
          },
          {
            title: 'Cookies Essenciais',
            text: 'Necessários para o funcionamento básico da plataforma: autenticação (manter você logado), segurança (proteção contra CSRF) e preferências de sessão. Não podem ser desativados.',
          },
          {
            title: 'Cookies de Desempenho',
            text: 'Nos ajudam a entender como você usa a plataforma: páginas visitadas, tempo de navegação e erros encontrados. Usados para melhorar a experiência. Podem ser desativados.',
          },
          {
            title: 'Cookies de Funcionalidade',
            text: 'Lembram suas preferências: idioma, filtros de busca e configurações de exibição. Desativá-los pode reduzir a personalização da experiência.',
          },
          {
            title: 'Como Gerenciar',
            text: 'Você pode gerenciar cookies nas configurações do seu navegador. A maioria dos navegadores permite bloquear ou excluir cookies. Note que desabilitar cookies essenciais pode impedir o uso da plataforma.',
          },
          {
            title: 'Atualizações',
            text: 'Esta política pode ser atualizada. A data da última revisão está sempre indicada no topo desta página. Para dúvidas: privacidade@ticketon.com.br.',
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
