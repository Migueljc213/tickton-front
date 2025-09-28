import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FaRocket, FaSearch, FaCalendarAlt, FaTicketAlt, FaMapMarkerAlt, FaUsers, FaShieldAlt, FaChartLine } from "react-icons/fa"
import Carousel from "@/components/ui/carousel"
import EventCard from "@/components/events/EventCard"
import { getFeaturedEvents, getNearbyEvents } from "@/data/mockEvents"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Design Profissional */}
      <section className="bg-gradient-to-br from-dark-blue via-turquoise/20 to-light-green/30 py-16 md:py-24 relative overflow-hidden">
        {/* Overlay sutil para melhor contraste */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-blue/70 via-transparent to-dark-blue/30"></div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-turquoise/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-light-green/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="heading-xl text-white mb-6 md:mb-8 leading-tight">
              Eventos que
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-light-green to-turquoise block md:inline">
                {" "}conectam pessoas
              </span>
            </h1>
            <p className="text-body-lg text-white/95 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
              Descubra eventos incríveis na sua cidade ou crie o seu próprio evento. 
              A plataforma completa para organizadores e participantes com ferramentas profissionais.
            </p>
            
            {/* CTAs Principais */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="btn-secondary text-lg px-8 py-4">
                <FaSearch className="mr-3" />
                Descobrir Eventos
              </Button>
              <Button size="lg" className="btn-primary text-lg px-8 py-4">
                <FaRocket className="mr-3" />
                Criar Evento
              </Button>
            </div>

            {/* Search Bar Profissional */}
            <div className="max-w-4xl mx-auto">
              <div className="search-container rounded-2xl p-6 flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar eventos, artistas, locais..."
                    className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-turquoise focus:border-transparent text-dark-gray placeholder-medium-gray text-lg"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <select className="w-full px-6 py-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-turquoise focus:border-transparent text-dark-gray bg-white text-lg appearance-none cursor-pointer">
                      <option>Cidade</option>
                      <option>São Paulo</option>
                      <option>Rio de Janeiro</option>
                      <option>Belo Horizonte</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="relative">
                    <select className="w-full px-6 py-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-turquoise focus:border-transparent text-dark-gray bg-white text-lg appearance-none cursor-pointer">
                      <option>Categoria</option>
                      <option>Shows</option>
                      <option>Festas</option>
                      <option>Cursos</option>
                      <option>Teatro</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <Button className="btn-primary px-8 py-4 text-lg">
                    <FaSearch className="mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Design Profissional */}
      <section className="py-16 md:py-24 bg-neutral-light-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="heading-lg text-dark-gray mb-6">
              Por que escolher o Ticketon?
            </h2>
            <p className="text-body-lg text-medium-gray max-w-3xl mx-auto leading-relaxed">
              Ferramentas profissionais para criar eventos de sucesso e uma experiência 
              excepcional para seus participantes. Tudo que você precisa em uma plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            <Card className="card-professional text-center border-0 rounded-2xl p-8">
              <CardHeader className="pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-turquoise/20 to-turquoise/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FaCalendarAlt className="text-3xl text-turquoise" />
                </div>
                <CardTitle className="text-xl font-bold text-dark-gray">Fácil de Usar</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-medium-gray leading-relaxed text-body-md">
                  Crie seu evento em minutos com nossa interface intuitiva e templates profissionais.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-professional text-center border-0 rounded-2xl p-8">
              <CardHeader className="pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-light-green/30 to-light-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FaTicketAlt className="text-3xl text-dark-blue" />
                </div>
                <CardTitle className="text-xl font-bold text-dark-gray">Ingressos Digitais</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-medium-gray leading-relaxed text-body-md">
                  QR codes seguros, transferência de titularidade e integração com wallets digitais.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-professional text-center border-0 rounded-2xl p-8">
              <CardHeader className="pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-coral/20 to-coral/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FaMapMarkerAlt className="text-3xl text-coral" />
                </div>
                <CardTitle className="text-xl font-bold text-dark-gray">Check-in Inteligente</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-medium-gray leading-relaxed text-body-md">
                  App gratuito para check-in offline com múltiplos pontos de entrada.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-professional text-center border-0 rounded-2xl p-8">
              <CardHeader className="pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-turquoise/20 to-turquoise/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FaChartLine className="text-3xl text-turquoise" />
                </div>
                <CardTitle className="text-xl font-bold text-dark-gray">Analytics Avançado</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-medium-gray leading-relaxed text-body-md">
                  Relatórios detalhados sobre vendas, público e performance do seu evento.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Organizers Section - Design Profissional */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="heading-lg text-dark-gray mb-6 leading-tight">
                Ferramentas profissionais para organizadores
              </h2>
              <p className="text-body-lg text-medium-gray mb-8 leading-relaxed">
                Desde a criação até o check-in, tudo que você precisa para um evento de sucesso. 
                Plataforma completa com recursos avançados.
              </p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-turquoise/20 to-turquoise/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FaUsers className="text-xl text-turquoise" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark-gray mb-3">Gestão de Equipe</h3>
                    <p className="text-medium-gray leading-relaxed">
                      Convide colaboradores e defina permissões específicas para cada evento.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-light-green/30 to-light-green/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FaShieldAlt className="text-xl text-dark-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark-gray mb-3">Pagamentos Seguros</h3>
                    <p className="text-medium-gray leading-relaxed">
                      Múltiplos métodos de pagamento com proteção total para você e seus clientes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-coral/20 to-coral/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <FaTicketAlt className="text-xl text-coral" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark-gray mb-3">Lotes Inteligentes</h3>
                    <p className="text-medium-gray leading-relaxed">
                      Configure lotes com virada automática por data ou quantidade vendida.
                    </p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="btn-primary text-lg px-8 py-4">
                Começar Gratuitamente
              </Button>
            </div>

            <div className="relative">
              <div className="dashboard-card rounded-3xl p-8">
                <div className="space-y-8">
                  {/* Header do Dashboard */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-turquoise/20 to-turquoise/10 rounded-xl flex items-center justify-center">
                      <FaRocket className="text-xl text-turquoise" />
                    </div>
                    <div>
                      <h4 className="dashboard-title text-lg">Dashboard em Tempo Real</h4>
                      <p className="dashboard-subtitle text-sm">Acompanhe vendas ao vivo</p>
                    </div>
                  </div>
                  
                  {/* Métrica Principal */}
                  <div className="bg-gradient-to-r from-turquoise/10 to-light-green/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="metric-label text-sm">Vendas Hoje</span>
                      <span className="metric-percentage text-sm bg-turquoise/10 px-2 py-1 rounded-full">+23%</span>
                    </div>
                    <div className="metric-value text-3xl">R$ 12.450</div>
                  </div>

                  {/* Métricas Secundárias */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-light-gray/30 rounded-xl p-4 text-center">
                      <div className="metric-secondary-value text-2xl mb-1">156</div>
                      <div className="metric-label text-sm">Ingressos Vendidos</div>
                    </div>
                    <div className="bg-light-gray/30 rounded-xl p-4 text-center">
                      <div className="metric-value text-2xl mb-1 text-dark-blue">89%</div>
                      <div className="metric-label text-sm">Taxa de Check-in</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Carousel */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <Carousel 
            title="Eventos em Destaque" 
            subtitle="Os eventos mais populares e bem avaliados da plataforma"
          >
            {getFeaturedEvents().map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </Carousel>
        </div>
      </section>

      {/* Nearby Events Carousel */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <Carousel 
            title="Eventos Próximos a Você" 
            subtitle="Descubra eventos incríveis na sua região"
          >
            {getNearbyEvents().map((event) => (
              <EventCard key={event.id} event={event} showDistance={true} distance={Math.floor(Math.random() * 20) + 1} />
            ))}
          </Carousel>
        </div>
      </section>

      {/* CTA Section - Design Profissional */}
      <section className="py-20 md:py-28 bg-dark-blue relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-turquoise/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-light-green/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="heading-lg text-white mb-6 leading-tight">
            Pronto para criar seu próximo evento?
          </h2>
          <p className="text-body-lg text-light-green/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Junte-se a milhares de organizadores que já confiam no Ticketon para criar eventos inesquecíveis. 
            Comece hoje mesmo e transforme suas ideias em realidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="btn-primary text-lg px-10 py-5">
              <FaRocket className="mr-3" />
              Criar Meu Primeiro Evento
            </Button>
            <Button size="lg" className="btn-outline text-lg px-10 py-5">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}