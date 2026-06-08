import Link from 'next/link';
import { FaMusic, FaTheaterMasks, FaFutbol, FaGraduationCap, FaUtensils, FaMicrophone, FaPalette, FaHeartbeat, FaLaptopCode, FaChild } from 'react-icons/fa';

const CATEGORIES = [
  { slug: 'musica',        label: 'Música',          icon: FaMusic,         desc: 'Shows, festivais e concertos',           color: '#00C2A8' },
  { slug: 'teatro',        label: 'Teatro & Arte',   icon: FaTheaterMasks,  desc: 'Peças, exposições e performances',       color: '#7c3aed' },
  { slug: 'esportes',      label: 'Esportes',        icon: FaFutbol,        desc: 'Partidas, torneios e corridas',          color: '#16a34a' },
  { slug: 'educacao',      label: 'Educação',        icon: FaGraduationCap, desc: 'Workshops, cursos e palestras',          color: '#2563eb' },
  { slug: 'gastronomia',   label: 'Gastronomia',     icon: FaUtensils,      desc: 'Feiras, festivais e degustações',        color: '#ea580c' },
  { slug: 'stand-up',      label: 'Stand-up',        icon: FaMicrophone,    desc: 'Comédias e apresentações ao vivo',       color: '#d97706' },
  { slug: 'arte',          label: 'Arte & Cultura',  icon: FaPalette,       desc: 'Museus, galerias e eventos culturais',   color: '#db2777' },
  { slug: 'saude',         label: 'Saúde & Bem-estar', icon: FaHeartbeat,   desc: 'Yoga, meditação e wellness',            color: '#dc2626' },
  { slug: 'tecnologia',    label: 'Tecnologia',      icon: FaLaptopCode,    desc: 'Hackathons, meetups e conferências',     color: '#0891b2' },
  { slug: 'infantil',      label: 'Infantil',        icon: FaChild,         desc: 'Shows e atividades para crianças',      color: '#65a30d' },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white py-14" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h1 className="text-3xl font-bold mb-2">Categorias de Eventos</h1>
          <p className="text-white/70 text-sm">Encontre eventos do seu interesse</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/events?category=${cat.slug}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${cat.color}18` }}
                >
                  <Icon className="text-2xl" style={{ color: cat.color }} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 group-hover:text-[#00C2A8] transition-colors">{cat.label}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{cat.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#00C2A8' }}
          >
            Ver todos os eventos
          </Link>
        </div>
      </div>
    </main>
  );
}
