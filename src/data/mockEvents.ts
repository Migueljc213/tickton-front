import { Event } from '@/types/event';

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival de Música Eletrônica 2024',
    description: 'O maior festival de música eletrônica do Brasil com os melhores DJs nacionais e internacionais.',
    date: '2024-03-15',
    time: '20:00',
    location: {
      name: 'Parque Ibirapuera',
      address: 'Av. Pedro Álvares Cabral',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04094-000',
      capacity: 50000
    },
    organizer: {
      id: '1',
      name: 'Music Events SP',
      email: 'contato@musicevents.com.br',
      phone: '(11) 99999-9999'
    },
    category: 'music',
    type: 'paid',
    featured: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=250&fit=crop&crop=center',
    tickets: [
      {
        id: '1',
        name: 'Pista',
        price: 150,
        quantity: 30000,
        sold: 25000,
        isActive: true
      },
      {
        id: '2',
        name: 'VIP',
        price: 300,
        quantity: 5000,
        sold: 3000,
        isActive: true
      }
    ],
    tags: ['música', 'eletrônica', 'festival'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Workshop de Design UX/UI',
    description: 'Aprenda as melhores práticas de design de experiência do usuário com profissionais experientes.',
    date: '2024-02-20',
    time: '09:00',
    location: {
      name: 'Centro de Convenções',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      capacity: 200
    },
    organizer: {
      id: '2',
      name: 'Design Academy',
      email: 'contato@designacademy.com.br',
      phone: '(11) 88888-8888'
    },
    category: 'workshop',
    type: 'paid',
    featured: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop&crop=center',
    tickets: [
      {
        id: '3',
        name: 'Participante',
        price: 200,
        quantity: 200,
        sold: 150,
        isActive: true
      }
    ],
    tags: ['design', 'ux', 'ui', 'workshop'],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z'
  },
  {
    id: '3',
    title: 'Show de Rock Nacional',
    description: 'Os maiores nomes do rock brasileiro em uma noite inesquecível.',
    date: '2024-03-10',
    time: '21:00',
    location: {
      name: 'Arena Anhembi',
      address: 'Av. Olavo Fontoura, 1209',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '02012-021',
      capacity: 25000
    },
    organizer: {
      id: '3',
      name: 'Rock Productions',
      email: 'contato@rockproductions.com.br',
      phone: '(11) 77777-7777'
    },
    category: 'music',
    type: 'paid',
    featured: false,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop&crop=center',
    tickets: [
      {
        id: '4',
        name: 'Pista',
        price: 80,
        quantity: 15000,
        sold: 12000,
        isActive: true
      },
      {
        id: '5',
        name: 'Camarote',
        price: 150,
        quantity: 2000,
        sold: 1800,
        isActive: true
      }
    ],
    tags: ['rock', 'música', 'nacional'],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-12T09:15:00Z'
  },
  {
    id: '4',
    title: 'Feira de Tecnologia',
    description: 'Conheça as últimas tendências em tecnologia e inovação.',
    date: '2024-02-25',
    time: '10:00',
    location: {
      name: 'Expo Center Norte',
      address: 'Rua José Bernardo Pinto, 333',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '02039-900',
      capacity: 10000
    },
    organizer: {
      id: '4',
      name: 'Tech Events',
      email: 'contato@techevents.com.br',
      phone: '(11) 66666-6666'
    },
    category: 'conference',
    type: 'free',
    featured: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop&crop=center',
    tickets: [
      {
        id: '6',
        name: 'Visitante',
        price: 0,
        quantity: 10000,
        sold: 7500,
        isActive: true
      }
    ],
    tags: ['tecnologia', 'inovação', 'feira'],
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z'
  },
  {
    id: '5',
    title: 'Curso de Culinária Italiana',
    description: 'Aprenda os segredos da culinária italiana com chefs especializados.',
    date: '2024-02-18',
    time: '14:00',
    location: {
      name: 'Escola de Culinária Bella Italia',
      address: 'Rua Augusta, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-000',
      capacity: 30
    },
    organizer: {
      id: '5',
      name: 'Bella Italia Escola',
      email: 'contato@bellaitalia.com.br',
      phone: '(11) 55555-5555'
    },
    category: 'course',
    type: 'paid',
    featured: false,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop&crop=center',
    tickets: [
      {
        id: '7',
        name: 'Participante',
        price: 180,
        quantity: 30,
        sold: 25,
        isActive: true
      }
    ],
    tags: ['culinária', 'italiana', 'curso'],
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-20T11:30:00Z'
  },
  {
    id: '6',
    title: 'Peça Teatral: Hamlet',
    description: 'A clássica obra de Shakespeare apresentada pela companhia de teatro local.',
    date: '2024-03-05',
    time: '20:30',
    location: {
      name: 'Teatro Municipal',
      address: 'Praça Ramos de Azevedo, s/n',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01037-010',
      capacity: 1500
    },
    organizer: {
      id: '6',
      name: 'Companhia de Teatro SP',
      email: 'contato@teatrosp.com.br',
      phone: '(11) 44444-4444'
    },
    category: 'theater',
    type: 'paid',
    featured: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=center',
    tickets: [
      {
        id: '8',
        name: 'Plateia',
        price: 60,
        quantity: 800,
        sold: 650,
        isActive: true
      },
      {
        id: '9',
        name: 'Balcão',
        price: 40,
        quantity: 700,
        sold: 500,
        isActive: true
      }
    ],
    tags: ['teatro', 'shakespeare', 'hamlet'],
    createdAt: '2024-01-07T00:00:00Z',
    updatedAt: '2024-01-14T13:20:00Z'
  }
];

// Função para obter eventos em destaque
export const getFeaturedEvents = (): Event[] => {
  return mockEvents.filter(event => event.featured);
};

// Função para obter eventos próximos (simulando localização do usuário)
export const getNearbyEvents = (userCity: string = 'São Paulo'): Event[] => {
  return mockEvents.filter(event => 
    event.location.city.toLowerCase().includes(userCity.toLowerCase())
  ).sort((a, b) => {
    // Simular proximidade baseada no ID (em uma aplicação real seria calculada pela distância)
    return parseInt(a.id) - parseInt(b.id);
  });
};

// Função para obter eventos por categoria
export const getEventsByCategory = (category: string): Event[] => {
  return mockEvents.filter(event => event.category === category);
};
