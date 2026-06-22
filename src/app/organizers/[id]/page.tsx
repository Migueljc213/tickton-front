import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OrganizerProfileClient, { type Organizer } from './OrganizerProfileClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function fetchOrganizer(id: string): Promise<Organizer | null> {
  try {
    const r = await fetch(`${API_URL}/organizers/${id}`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const org = await fetchOrganizer(id);
  if (!org) return { title: 'Organizador não encontrado — Ticketon' };

  const description = org.description ?? `Confira os eventos de ${org.companyName} na Ticketon.`;
  return {
    title: `${org.companyName} — Ticketon`,
    description,
    openGraph: {
      title: `${org.companyName} — Ticketon`,
      description,
      type: 'profile',
      images: org.logoUrl ? [`${API_URL}${org.logoUrl}`] : [],
    },
  };
}

export default async function OrganizerProfilePage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const organizer = await fetchOrganizer(id);
  if (!organizer) notFound();
  return <OrganizerProfileClient initialOrganizer={organizer} />;
}
