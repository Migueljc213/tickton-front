'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaUserPlus,
  FaTrash,
  FaUsers,
  FaArrowLeft,
  FaShieldAlt,
  FaCrown,
  FaQrcode,
} from 'react-icons/fa';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuth } from '@/hooks';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface Collaborator {
  id: number;
  eventId: number;
  userId: number;
  userName: string;
  userEmail: string;
  role: 'SCANNER' | 'CO_ORGANIZER';
  addedAt: string;
}

function roleLabel(role: string) {
  return role === 'CO_ORGANIZER' ? 'Co-organizador' : 'Scanner';
}

function RoleBadge({ role }: { role: string }) {
  const isCo = role === 'CO_ORGANIZER';
  return (
    <span
      style={{
        background: isCo ? '#003B4A' : '#00C2A8',
        color: '#fff',
        fontSize: '0.7rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 20,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {isCo ? <FaCrown style={{ fontSize: '0.6rem' }} /> : <FaQrcode style={{ fontSize: '0.6rem' }} />}
      {roleLabel(role)}
    </span>
  );
}

export default function StaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const eventId = Number(id);
  const router = useRouter();
  const { getToken } = useAuth();

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'SCANNER' | 'CO_ORGANIZER'>('SCANNER');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; collab: Collaborator | null; loading: boolean }>({
    open: false, collab: null, loading: false,
  });

  const token = getToken();

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    fetchCollaborators();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function fetchCollaborators() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/event-collaborators/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCollaborators(data);
    } catch {
      setError('Erro ao carregar equipe.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_URL}/event-collaborators/${eventId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Erro ao adicionar colaborador.');
      setCollaborators((prev) => [data, ...prev]);
      setEmail('');
      setSuccess(`${data.userName} adicionado como ${roleLabel(role)} com sucesso!`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar colaborador.');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove() {
    const c = removeDialog.collab;
    if (!c) return;
    setRemoveDialog((d) => ({ ...d, loading: true }));
    try {
      const res = await fetch(
        `${API_URL}/event-collaborators/${eventId}/${c.id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error();
      setCollaborators((prev) => prev.filter((x) => x.id !== c.id));
      toast.success(`${c.userName} removido da equipe.`);
      setRemoveDialog({ open: false, collab: null, loading: false });
    } catch {
      toast.error('Erro ao remover colaborador.');
      setRemoveDialog((d) => ({ ...d, loading: false }));
    }
  }

  return (
    <DashboardLayout userRole="organizer">
      <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #003B4A, #00C2A8)',
            color: '#fff',
            padding: '32px 24px',
          }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <button
              onClick={() => router.back()}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                borderRadius: 8,
                padding: '6px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.85rem',
                marginBottom: 20,
              }}
            >
              <FaArrowLeft /> Voltar
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaUsers style={{ fontSize: '1.4rem' }} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Equipe de Portaria</h1>
                <p style={{ margin: 0, opacity: 0.75, fontSize: '0.875rem' }}>
                  Convide colaboradores para validar ingressos neste evento
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>

          {/* Add collaborator form */}
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              marginBottom: 24,
            }}
          >
            <h2
              style={{
                margin: '0 0 16px',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FaUserPlus style={{ color: '#00C2A8' }} /> Adicionar Colaborador
            </h2>

            {error && (
              <p
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  marginBottom: 14,
                }}
              >
                {error}
              </p>
            )}
            {success && (
              <p
                style={{
                  background: '#f0fdf4',
                  color: '#16a34a',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  marginBottom: 14,
                }}
              >
                {success}
              </p>
            )}

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
                  E-mail do usuário
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
                  Papel
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['SCANNER', 'CO_ORGANIZER'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: `2px solid ${role === r ? '#00C2A8' : '#e2e8f0'}`,
                        borderRadius: 10,
                        background: role === r ? '#f0fdfa' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 2 }}>
                        {r === 'CO_ORGANIZER' ? (
                          <FaCrown style={{ color: '#003B4A', fontSize: '0.85rem' }} />
                        ) : (
                          <FaQrcode style={{ color: '#00C2A8', fontSize: '0.85rem' }} />
                        )}
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                          {roleLabel(r)}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                        {r === 'SCANNER' ? 'Valida ingressos na portaria' : 'Acesso total ao evento'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={adding || !email.trim()}
                style={{
                  background: adding ? '#94a3b8' : '#00C2A8',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: adding ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s',
                }}
              >
                <FaUserPlus /> {adding ? 'Adicionando...' : 'Adicionar à Equipe'}
              </button>
            </form>
          </div>

          {/* Collaborator list */}
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <h2
              style={{
                margin: '0 0 16px',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FaShieldAlt style={{ color: '#00C2A8' }} />
              Equipe atual
              {collaborators.length > 0 && (
                <span
                  style={{
                    background: '#f1f5f9',
                    color: '#64748b',
                    borderRadius: 20,
                    padding: '1px 8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {collaborators.length}
                </span>
              )}
            </h2>

            {loading ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0' }}>Carregando...</p>
            ) : collaborators.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                <FaUsers style={{ fontSize: '2rem', marginBottom: 10, opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Nenhum colaborador ainda.</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>
                  Adicione pessoas que vão ajudar na portaria.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {collaborators.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px',
                      borderRadius: 12,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #003B4A, #00C2A8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                    >
                      {c.userName.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                          {c.userName}
                        </span>
                        <RoleBadge role={c.role} />
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                        {c.userEmail}
                      </p>
                    </div>

                    <button
                      onClick={() => setRemoveDialog({ open: true, collab: c, loading: false })}
                      style={{
                        background: '#fef2f2',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 10px',
                        cursor: 'pointer',
                        color: '#dc2626',
                        transition: 'all 0.15s',
                      }}
                      title="Remover da equipe"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info box */}
          <div
            style={{
              marginTop: 16,
              background: '#f0fdfa',
              border: '1px solid #99f6e4',
              borderRadius: 12,
              padding: '14px 16px',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#0f766e', lineHeight: 1.6 }}>
              <strong>Como funciona:</strong> Colaboradores com acesso <em>Scanner</em> podem entrar em{' '}
              <strong>/checkin/{eventId}</strong> com o próprio login para validar ingressos sem ter
              acesso ao painel do organizador.
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={removeDialog.open}
        onOpenChange={(open) => setRemoveDialog((d) => ({ ...d, open }))}
        title="Remover colaborador"
        description={`Remover ${removeDialog.collab?.userName} da equipe deste evento?`}
        confirmLabel="Sim, remover"
        variant="destructive"
        loading={removeDialog.loading}
        onConfirm={handleRemove}
      />
    </DashboardLayout>
  );
}
