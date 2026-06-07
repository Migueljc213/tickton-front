'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { storage } from '@/lib/utils/storage';
import { usersService } from '@/lib/api/services/users.service';
import { FaUsers, FaSearch, FaTrash, FaShieldAlt, FaUserTie, FaUser } from 'react-icons/fa';
import type { User } from '@/types/api';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  organizer: 'Organizador',
  participant: 'Participante',
};

const ROLE_COLORS: Record<string, string> = {
  admin: '#7c3aed',
  organizer: '#0284c7',
  participant: '#059669',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <FaShieldAlt />,
  organizer: <FaUserTie />,
  participant: <FaUser />,
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null; loading: boolean }>({
    open: false, user: null, loading: false,
  });

  useEffect(() => {
    const role = storage.getUserRole();
    if (role !== 'admin') { router.replace('/login'); return; }
    loadUsers();
  }, [router]);

  useEffect(() => {
    let result = users;
    if (search) result = result.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    if (roleFilter) result = result.filter(u => u.role === roleFilter);
    setFiltered(result);
  }, [search, roleFilter, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await usersService.getAllUsers();
      const list = Array.isArray(res) ? res : (res as any).users ?? [];
      setUsers(list);
      setFiltered(list);
    } catch {
      setError('Não foi possível carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.user) return;
    setDeleteDialog((d) => ({ ...d, loading: true }));
    try {
      await usersService.deleteUser(deleteDialog.user.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteDialog.user!.id));
      toast.success(`Usuário ${deleteDialog.user.name} excluído com sucesso.`);
      setDeleteDialog({ open: false, user: null, loading: false });
    } catch {
      toast.error('Erro ao excluir usuário. Tente novamente.');
      setDeleteDialog((d) => ({ ...d, loading: false }));
    }
  };

  const counts = { total: users.length, admin: users.filter(u => u.role === 'admin').length, organizer: users.filter(u => u.role === 'organizer').length, participant: users.filter(u => u.role === 'participant').length };

  return (
    <DashboardLayout userRole="admin">
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Gerenciar Usuários</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>Visualize e gerencie todos os usuários da plataforma</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total', value: counts.total, color: '#003B4A' },
            { label: 'Participantes', value: counts.participant, color: '#059669' },
            { label: 'Organizadores', value: counts.organizer, color: '#0284c7' },
            { label: 'Admins', value: counts.admin, color: '#7c3aed' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color, margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.8rem' }} />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', color: '#374151', background: '#fff' }}
          >
            <option value="">Todas as roles</option>
            <option value="participant">Participante</option>
            <option value="organizer">Organizador</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Tabela */}
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Carregando usuários...</div>
          ) : error ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  {['Nome', 'Email', 'CPF', 'Role', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Nenhum usuário encontrado</td></tr>
                ) : filtered.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#00C2A8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#374151' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#64748b' }}>{user.cpfCnpj}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${ROLE_COLORS[user.role] ?? '#6b7280'}18`, color: ROLE_COLORS[user.role] ?? '#6b7280' }}>
                        {ROLE_ICONS[user.role]}
                        {ROLE_LABEL[user.role] ?? user.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => setDeleteDialog({ open: true, user, loading: false })}
                        style={{ padding: '6px 10px', border: '1px solid #fee2e2', borderRadius: 6, background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <FaTrash style={{ fontSize: '0.7rem' }} /> Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: 12 }}>
          Exibindo {filtered.length} de {users.length} usuários
        </p>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((d) => ({ ...d, open }))}
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir "${deleteDialog.user?.name}"? Esta ação é irreversível.`}
        confirmLabel="Sim, excluir"
        variant="destructive"
        loading={deleteDialog.loading}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
