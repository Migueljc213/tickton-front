'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaUser, FaLock, FaCheck, FaEye, FaEyeSlash, FaTicketAlt } from 'react-icons/fa';
import { usersService } from '@/lib/api/services/users.service';
import { storage } from '@/lib/utils/storage';
import { maskCpfCnpj } from '@/lib/utils/format';
import type { User } from '@/types/api';

type Tab = 'profile' | 'password';

export default function SettingsPage() {
  const router = useRouter();

  const [tab, setTab]           = useState<Tab>('profile');
  const [user, setUser]         = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  // Profile form
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [cpfCnpj, setCpfCnpj]   = useState('');

  // Password form
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]               = useState(false);

  useEffect(() => {
    const token = storage.getToken();
    if (!token) { router.push('/login'); return; }

    usersService.getMe()
      .then((u) => {
        setUser(u);
        setName(u.name);
        setEmail(u.email);
        setCpfCnpj(u.cpfCnpj ? maskCpfCnpj(u.cpfCnpj) : '');
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const flash = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setSuccess(null); setError(null); }, 3500);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const updated = await usersService.updateUser(user.id, { name: name.trim(), email: email.trim().toLowerCase(), cpfCnpj: cpfCnpj.trim() || undefined });
      setUser(updated);
      storage.setUserName(updated.name);
      flash('Perfil atualizado com sucesso!');
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : 'Erro ao salvar perfil.', true);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length < 6) { flash('A senha deve ter pelo menos 6 caracteres.', true); return; }
    if (newPassword !== confirmPassword) { flash('As senhas não coincidem.', true); return; }
    setSaving(true);
    try {
      await usersService.updateUser(user.id, { password: newPassword });
      setNewPassword('');
      setConfirmPassword('');
      flash('Senha alterada com sucesso!');
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : 'Erro ao alterar senha.', true);
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #00C2A8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/events" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #00C2A8, #007465)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaTicketAlt style={{ color: '#fff', fontSize: '0.8rem' }} />
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a' }}>Ticketon</span>
        </Link>
        <span style={{ color: '#d1d5db' }}>·</span>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Configurações</span>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        {/* Back */}
        <button
          onClick={() => {
            const role = storage.getUserRole();
            if (role === 'organizer') router.push('/organizer/dashboard');
            else if (role === 'admin') router.push('/admin/dashboard');
            else router.push('/tickets');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, fontSize: '0.875rem' }}
        >
          <FaArrowLeft style={{ fontSize: '0.75rem' }} /> Voltar ao dashboard
        </button>

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#00C2A8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem' }}>{initials}</span>
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{user?.name}</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
          {([
            { key: 'profile' as Tab, icon: <FaUser style={{ fontSize: '0.75rem' }} />, label: 'Perfil' },
            { key: 'password' as Tab, icon: <FaLock style={{ fontSize: '0.75rem' }} />, label: 'Senha' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.15s',
                background: tab === t.key ? '#fff' : 'transparent',
                color: tab === t.key ? '#00C2A8' : '#64748b',
                boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: 10, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
            <FaCheck /> {success}
          </div>
        )}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: 32 }}>

          {/* ── Profile tab ── */}
          {tab === 'profile' && (
            <form onSubmit={handleProfileSave}>
              <h2 style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', marginTop: 0, marginBottom: 24 }}>Informações pessoais</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Nome completo</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={inputStyle}
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label style={labelStyle}>CPF / CNPJ</label>
                  <input
                    value={cpfCnpj}
                    onChange={e => setCpfCnpj(maskCpfCnpj(e.target.value))}
                    style={inputStyle}
                    placeholder="000.000.000-00"
                    maxLength={18}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="seu@email.com"
                />
              </div>

              <button type="submit" disabled={saving} style={submitStyle}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          )}

          {/* ── Password tab ── */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordSave}>
              <h2 style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', marginTop: 0, marginBottom: 8 }}>Alterar senha</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 24 }}>
                Escolha uma senha com pelo menos 6 caracteres.
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Nova senha</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    style={{ ...inputStyle, paddingRight: 44 }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Confirmar nova senha</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" disabled={saving} style={submitStyle}>
                {saving ? 'Salvando...' : 'Alterar senha'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
  borderRadius: 10, fontSize: '0.875rem', color: '#0f172a',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const submitStyle: React.CSSProperties = {
  background: '#00C2A8', color: '#fff', border: 'none', borderRadius: 10,
  padding: '11px 28px', fontWeight: 700, fontSize: '0.9rem',
  cursor: 'pointer', opacity: 1, transition: 'opacity 0.15s',
};
