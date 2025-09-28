import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FaRocket, 
  FaChartLine, 
  FaUsers, 
  FaTicketAlt, 
  FaShieldAlt, 
  FaMobileAlt,
  FaHeadset,
  FaCheckCircle,
  FaStar,
  FaArrowRight,
  FaCalendarAlt,
  FaDollarSign,
  FaCog,
  FaDownload,
  FaPlus
} from "react-icons/fa";

export default function OrganizerPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Design Profissional */}
      <section className="bg-gradient-to-br from-dark-blue via-turquoise/20 to-light-green/30 py-20 md:py-28 relative overflow-hidden">
        {/* Overlay sutil para melhor contraste */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-blue/80 via-transparent to-dark-blue/40"></div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-turquoise/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-light-green/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Conteúdo Principal */}
              <div className="text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Crie eventos
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-light-green to-turquoise block">
                    inesquecíveis
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                  A plataforma completa para organizadores de eventos. 
                  Gerencie vendas, participantes e muito mais com ferramentas profissionais.
                </p>
                
                {/* CTAs Principais */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Button size="lg" className="bg-turquoise hover:bg-turquoise-600 text-white text-lg px-8 py-4 font-semibold">
                    <FaRocket className="mr-3" />
                    Começar Gratuitamente
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-dark-blue text-lg px-8 py-4 font-semibold">
                    <FaChartLine className="mr-3" />
                    Ver Demonstração
                  </Button>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-turquoise mb-1">10K+</div>
                    <div className="text-sm text-white/80">Eventos Criados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-turquoise mb-1">2M+</div>
                    <div className="text-sm text-white/80">Participantes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-turquoise mb-1">R$ 50M+</div>
                    <div className="text-sm text-white/80">Em Vendas</div>
                  </div>
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="space-y-4">
                    {/* Header do Dashboard */}
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-turquoise rounded-lg flex items-center justify-center">
                          <FaRocket className="text-white text-lg" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Meus Eventos</h3>
                          <p className="text-sm text-gray-600">Dashboard em tempo real</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-turquoise text-white">
                        <FaPlus className="mr-2" />
                        Novo Evento
                      </Button>
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <FaTicketAlt className="text-turquoise" />
                          <span className="text-xs text-gray-600">Hoje</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">156</div>
                        <div className="text-xs text-gray-600">Ingressos Vendidos</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <FaDollarSign className="text-turquoise" />
                          <span className="text-xs text-gray-600">Hoje</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">R$ 12.450</div>
                        <div className="text-xs text-gray-600">Receita</div>
                      </div>
                    </div>

                    {/* Lista de Eventos */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">Festival de Música</div>
                          <div className="text-xs text-gray-600">15 de março, 2025</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">915/1200</div>
                          <div className="text-xs text-gray-600">vendidos</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">Workshop UX/UI</div>
                          <div className="text-xs text-gray-600">20 de fevereiro, 2025</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">30/50</div>
                          <div className="text-xs text-gray-600">vendidos</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Tudo que você precisa para criar eventos de sucesso
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ferramentas profissionais, relatórios detalhados e suporte especializado. 
              Tudo em uma plataforma intuitiva e poderosa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Gestão de Eventos */}
            <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-turquoise/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="text-2xl text-turquoise" />
                </div>
                <CardTitle className="text-xl font-bold" style={{ color: '#111827' }}>Gestão Completa</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="leading-relaxed" style={{ color: '#374151' }}>
                  Crie, edite e gerencie seus eventos com facilidade. 
                  Interface intuitiva e ferramentas poderosas.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Vendas e Ingressos */}
            <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-turquoise/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaTicketAlt className="text-2xl text-turquoise" />
                </div>
                <CardTitle className="text-xl font-bold" style={{ color: '#111827' }}>Vendas Inteligentes</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="leading-relaxed" style={{ color: '#374151' }}>
                  Múltiplos tipos de ingressos, lotes automáticos e 
                  relatórios de vendas em tempo real.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-turquoise/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaChartLine className="text-2xl text-turquoise" />
                </div>
                <CardTitle className="text-xl font-bold" style={{ color: '#111827' }}>Analytics Avançado</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="leading-relaxed" style={{ color: '#374151' }}>
                  Relatórios detalhados, métricas de performance e 
                  insights para otimizar seus eventos.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Pagamentos */}
            <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-turquoise/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaShieldAlt className="text-2xl text-turquoise" />
                </div>
                <CardTitle className="text-xl font-bold" style={{ color: '#111827' }}>Pagamentos Seguros</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="leading-relaxed" style={{ color: '#374151' }}>
                  Múltiplos métodos de pagamento com proteção total 
                  para você e seus participantes.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Mobile */}
            <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-turquoise/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaMobileAlt className="text-2xl text-turquoise" />
                </div>
                <CardTitle className="text-xl font-bold" style={{ color: '#111827' }}>App Mobile</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="leading-relaxed" style={{ color: '#374151' }}>
                  Gerencie seus eventos de qualquer lugar com nosso 
                  aplicativo móvel completo.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Suporte */}
            <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-turquoise/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaHeadset className="text-2xl text-turquoise" />
                </div>
                <CardTitle className="text-xl font-bold" style={{ color: '#111827' }}>Suporte 24/7</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="leading-relaxed" style={{ color: '#374151' }}>
                  Suporte especializado sempre disponível para 
                  ajudar você a ter sucesso.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Planos que se adaptam ao seu negócio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano ideal para o seu tipo de evento. 
              Sem taxas ocultas, sem surpresas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plano Básico */}
            <Card className="border-2 border-gray-200 hover:border-turquoise/50 transition-colors duration-300">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Básico</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">Gratuito</span>
                  <p className="text-gray-600 mt-2">Para começar</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">Até 100 participantes</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">1 evento por mês</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">Suporte por email</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">Relatórios básicos</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Começar Grátis
                </Button>
              </CardContent>
            </Card>

            {/* Plano Profissional */}
            <Card className="border-2 border-turquoise relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-turquoise text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Mais Popular
                </span>
              </div>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Profissional</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">R$ 29</span>
                  <span className="text-gray-600">/mês</span>
                  <p className="text-gray-600 mt-2">Para eventos regulares</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">Até 1.000 participantes</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">Eventos ilimitados</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">Suporte prioritário</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">Analytics avançado</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">Integrações</span>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-turquoise hover:bg-turquoise-600 text-white">
                  Começar Agora
                </Button>
              </CardContent>
            </Card>

            {/* Plano Enterprise */}
            <Card className="border-2 border-gray-200 hover:border-turquoise/50 transition-colors duration-300">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">R$ 99</span>
                  <span className="text-gray-600">/mês</span>
                  <p className="text-gray-600 mt-2">Para grandes eventos</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">Participantes ilimitados</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">Eventos ilimitados</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">Suporte 24/7</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">API personalizada</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="text-turquoise mr-3" />
                    <span className="text-gray-700">Gerente dedicado</span>
                  </div>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Falar com Vendas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Organizadores que confiam no Ticketon
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja o que nossos clientes dizem sobre nossa plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Depoimento 1 */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 mr-1" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "O Ticketon revolucionou a forma como organizamos nossos eventos. 
                  A interface é intuitiva e as ferramentas são poderosas."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-turquoise rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">M</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Maria Silva</div>
                    <div className="text-sm text-gray-600">Eventos SP</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depoimento 2 */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 mr-1" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Os relatórios são incríveis! Conseguimos otimizar nossas vendas 
                  e entender melhor nosso público."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-turquoise rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">J</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">João Santos</div>
                    <div className="text-sm text-gray-600">Tech Events</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depoimento 3 */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 mr-1" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Suporte excepcional e plataforma confiável. 
                  Recomendo para qualquer organizador de eventos."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-turquoise rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Ana Costa</div>
                    <div className="text-sm text-gray-600">Design Academy</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-dark-blue relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-turquoise/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-light-green/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para criar seu próximo evento?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Junte-se a milhares de organizadores que já confiam no Ticketon 
              para criar eventos inesquecíveis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-turquoise hover:bg-turquoise-600 text-white text-lg px-8 py-4 font-semibold">
                <FaRocket className="mr-3" />
                Começar Gratuitamente
                <FaArrowRight className="ml-3" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-dark-blue text-lg px-8 py-4 font-semibold">
                <FaHeadset className="mr-3" />
                Falar com Especialista
              </Button>
            </div>
            
            <p className="text-sm text-white/70 mt-6">
              Sem cartão de crédito • Configuração em 5 minutos • Suporte 24/7
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
