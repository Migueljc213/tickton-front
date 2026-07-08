'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { FaUser, FaLock, FaCheck, FaEye, FaEyeSlash, FaCamera, FaSpinner } from 'react-icons/fa';
import { usersService } from '@/lib/api/services/users.service';
import { storage } from '@/lib/utils/storage';
import { maskCpfCnpj } from '@/lib/utils/format';
import DashboardLayout from '@/components/layout/DashboardLayout';
import type { User } from '@/types/api';

type Tab = 'profile' | 'password';
type Role = 'participant' | 'organizer' | 'admin';

export default function SettingsPage() {
  const router = useRouter();

  const [tab, setTab]           = useState<Tab>('profile');
  const [user, setUser]         = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role>('participant');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [cpfCnpj, setCpfCnpj]   = useState('');
  const [gender, setGender]         = useState('');
  const [age, setAge]               = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]               = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = storage.getToken();
    if (!token) { router.push('/login'); return; }

    const role = storage.getUserRole() as Role | null;
    if (role) setUserRole(role);

    usersService.getMe()
      .then((u) => {
        setUser(u);
        setUserRole(u.role as Role);
        setName(u.name);
        setEmail(u.email);
        setCpfCnpj(u.cpfCnpj ? maskCpfCnpj(u.cpfCnpj) : '');
        setGender(u.gender ?? '');
        setAge(u.age != null ? String(u.age) : '');
        setNeighborhood(u.neighborhood ?? '');
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
      const updated = await usersService.updateUser(user.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        cpfCnpj: cpfCnpj.trim() || undefined,
        gender: gender || undefined,
        age: age ? Number(age) : undefined,
        neighborhood: neighborhood.trim() || undefined,
      });
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

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);
    try {
      const { avatarUrl } = await usersService.uploadAvatar(user.id, file);
      setUser(prev => prev ? { ...prev, avatarUrl } : prev);
      flash('Foto de perfil atualizada!');
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : 'Erro ao enviar foto.', true);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #00C2A8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
                e.target.value = '';
              }}
            />
            {user?.avatarUrl ? (
              <img
                src={`${API_URL}${user.avatarUrl}`}
                alt="Avatar"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e2e8f0' }}
              />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#00C2A8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem' }}>{initials}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%',
                background: '#00C2A8', border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff', fontSize: '0.7rem',
              }}
            >
              {uploadingAvatar ? <FaSpinner style={{ animation: 'spin 0.8s linear infinite' }} /> : <FaCamera />}
            </button>
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{user?.name}</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>{user?.email}</p>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              style={{ marginTop: 6, fontSize: '0.78rem', color: '#00C2A8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
            >
              {uploadingAvatar ? 'Enviando...' : 'Alterar foto de perfil'}
            </button>
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

          {/* Profile tab */}
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

              <div style={{ marginBottom: 20 }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 28 }}>
                <div>
                  <label style={labelStyle}>Sexo</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Prefiro não informar</option>
                    <option value="feminino">Feminino</option>
                    <option value="masculino">Masculino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Idade</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    style={inputStyle}
                    placeholder="Ex: 28"
                    min={1}
                    max={120}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Lugar</label>
                  <input
                    value={neighborhood}
                    onChange={e => setNeighborhood(e.target.value)}
                    style={inputStyle}
                    placeholder="Ex: Barra Mansa"
                  />
                </div>
              </div>

              <button type="submit" disabled={saving} style={submitStyle}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          )}

          {/* Password tab */}
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
    </DashboardLayout>
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
