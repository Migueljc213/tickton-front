import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const event = await fetch(`${API_URL}/events/${id}`, { next: { revalidate: 60 } }).then(r => r.json());

    const title       = event?.title ?? 'Evento';
    const description = (event?.description ?? 'Compre seu ingresso na Ticketon').slice(0, 160);
    const image       = event?.bannerUrl ?? null;
    const dateStr     = event?.eventDate
      ? new Date(event.eventDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
      : '';
    const location    = [event?.venueName, event?.city, event?.state].filter(Boolean).join(', ');
    const fullDesc    = [dateStr, location, description].filter(Boolean).join(' · ');

    return {
      title: `${title} | Ticketon`,
      description: fullDesc,
      openGraph: {
        title: `${title} | Ticketon`,
        description: fullDesc,
        type: 'website',
        ...(image && { images: [{ url: image, width: 1200, height: 630, alt: title }] }),
      },
      twitter: {
        card: image ? 'summary_large_image' : 'summary',
        title,
        description: fullDesc,
        ...(image && { images: [image] }),
      },
    };
  } catch {
    return {
      title: 'Evento | Ticketon',
      description: 'Compre ingressos para os melhores eventos independentes com a Ticketon.',
    };
  }
}

export default function EventDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
