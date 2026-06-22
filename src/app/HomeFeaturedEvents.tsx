'use client';

import Carousel from '@/components/ui/carousel';
import EventCard from '@/components/events/EventCard';
import type { Event as CardEvent } from '@/types/event';

interface Props {
  initialEvents: CardEvent[];
}

export default function HomeFeaturedEvents({ initialEvents }: Props) {
  const featuredEvents = initialEvents.filter(e => e.featured).slice(0, 8);
  const displayed = featuredEvents.length > 0 ? featuredEvents : initialEvents.slice(0, 8);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <Carousel
          title="Eventos em Destaque"
          subtitle="Os eventos mais populares e bem avaliados da plataforma"
        >
          {displayed.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
