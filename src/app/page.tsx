import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FaRocket, FaSearch, FaCalendarAlt, FaTicketAlt, FaMapMarkerAlt, FaUsers, FaShieldAlt, FaChartLine } from "react-icons/fa"
import Carousel from "@/components/ui/carousel"
import EventCard from "@/components/events/EventCard"
import { getFeaturedEvents, getNearbyEvents } from "@/data/mockEvents"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark-blue via-turquoise/30 to-light-green/40 py-12 md:py-20 relative overflow-hidden">
        {/* Overlay para garantir contraste */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-blue/60 via-transparent to-dark-blue/40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight drop-shadow-lg">
              Eventos que
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-light-green to-turquoise">
                {" "}conectam pessoas
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Descubra eventos incríveis na sua cidade ou crie o seu próprio evento. 
              A plataforma completa para organizadores e participantes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-white hover:bg-white/90 text-dark-blue shadow-xl border-2 border-white">
                <FaSearch className="mr-2" />
                Descobrir Eventos
              </Button>
              <Button size="lg" className="bg-turquoise hover:bg-turquoise/90 text-white shadow-xl border-2 border-turquoise">
                <FaRocket className="mr-2" />
                Criar Evento
              </Button>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-4 flex flex-col lg:flex-row gap-4 border border-white/20">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar eventos, artistas, locais..."
                    className="w-full px-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent text-dark-gray placeholder-medium-gray"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select className="px-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent text-dark-gray bg-white">
                    <option>Cidade</option>
                    <option>São Paulo</option>
                    <option>Rio de Janeiro</option>
                    <option>Belo Horizonte</option>
                  </select>
                  <select className="px-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-turquoise focus:border-transparent text-dark-gray bg-white">
                    <option>Categoria</option>
                    <option>Shows</option>
                    <option>Festas</option>
                    <option>Cursos</option>
                    <option>Teatro</option>
                  </select>
                  <Button className="bg-turquoise hover:bg-turquoise/90 text-white px-6 shadow-lg">
                    <FaSearch />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-gray mb-4">
              Por que escolher o Galliard?
            </h2>
            <p className="text-lg md:text-xl text-dark-gray/80 max-w-2xl mx-auto leading-relaxed">
              Ferramentas profissionais para criar eventos de sucesso e uma experiência 
              excepcional para seus participantes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="w-16 h-16 bg-turquoise/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="text-2xl text-turquoise" />
                </div>
                <CardTitle className="text-lg md:text-xl text-dark-gray">Fácil de Usar</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-dark-gray/70 leading-relaxed">
                  Crie seu evento em minutos com nossa interface intuitiva e templates profissionais.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="w-16 h-16 bg-light-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTicketAlt className="text-2xl text-dark-blue" />
                </div>
                <CardTitle className="text-lg md:text-xl text-dark-gray">Ingressos Digitais</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-dark-gray/70 leading-relaxed">
                  QR codes seguros, transferência de titularidade e integração com wallets digitais.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaMapMarkerAlt className="text-2xl text-coral" />
                </div>
                <CardTitle className="text-lg md:text-xl text-dark-gray">Check-in Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-dark-gray/70 leading-relaxed">
                  App gratuito para check-in offline com múltiplos pontos de entrada.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="w-16 h-16 bg-turquoise/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaChartLine className="text-2xl text-turquoise" />
                </div>
                <CardTitle className="text-lg md:text-xl text-dark-gray">Analytics Avançado</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-dark-gray/70 leading-relaxed">
                  Relatórios detalhados sobre vendas, público e performance do seu evento.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Organizers Section */}
      <section className="py-12 md:py-20 bg-light-gray/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-gray mb-4 md:mb-6 leading-tight">
                Ferramentas profissionais para organizadores
              </h2>
              <p className="text-lg md:text-xl text-dark-gray/80 mb-6 md:mb-8 leading-relaxed">
                Desde a criação até o check-in, tudo que você precisa para um evento de sucesso.
              </p>
              
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-turquoise/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaUsers className="text-lg text-turquoise" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-gray mb-2">Gestão de Equipe</h3>
                    <p className="text-dark-gray/70 leading-relaxed">
                      Convide colaboradores e defina permissões específicas para cada evento.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-light-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaShieldAlt className="text-lg text-dark-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-gray mb-2">Pagamentos Seguros</h3>
                    <p className="text-dark-gray/70 leading-relaxed">
                      Múltiplos métodos de pagamento com proteção total para você e seus clientes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaTicketAlt className="text-lg text-coral" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-gray mb-2">Lotes Inteligentes</h3>
                    <p className="text-dark-gray/70 leading-relaxed">
                      Configure lotes com virada automática por data ou quantidade vendida.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button size="lg" className="bg-turquoise hover:bg-turquoise/90 text-white shadow-lg">
                  Começar Gratuitamente
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-turquoise/10 rounded-full flex items-center justify-center">
                      <FaRocket className="text-lg text-turquoise" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-gray">Dashboard em Tempo Real</h4>
                      <p className="text-sm text-medium-gray">Acompanhe vendas ao vivo</p>
                    </div>
                  </div>
                  
                  <div className="bg-light-gray/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-dark-gray">Vendas Hoje</span>
                      <span className="text-sm text-turquoise font-semibold">+23%</span>
                    </div>
                    <div className="text-2xl font-bold text-dark-gray">R$ 12.450</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-turquoise">156</div>
                      <div className="text-sm text-medium-gray">Ingressos Vendidos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-dark-blue">89%</div>
                      <div className="text-sm text-medium-gray">Taxa de Check-in</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Carousel */}
      <section className="py-12 md:py-16 bg-light-gray/30">
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

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-dark-blue">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Pronto para criar seu próximo evento?
          </h2>
          <p className="text-lg md:text-xl text-light-green/90 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
            Junte-se a milhares de organizadores que já confiam no Galliard para criar eventos inesquecíveis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-turquoise hover:bg-turquoise/90 text-white shadow-lg">
              <FaRocket className="mr-2" />
              Criar Meu Primeiro Evento
            </Button>
            <Button variant="outline" size="lg" className="border-light-green text-light-green hover:bg-light-green hover:text-dark-blue bg-transparent shadow-lg">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}