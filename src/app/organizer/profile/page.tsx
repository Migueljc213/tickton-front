'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaCheckCircle, FaBuilding, FaUniversity, FaUser } from 'react-icons/fa';
import { useAuth } from '@/hooks';
import DashboardLayout from '@/components/layout/DashboardLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const BRAZIL_STATES = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];

export default function OrganizerProfilePage() {
  const router = useRouter();
  const { getToken, getUserId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizerId, setOrganizerId] = useState<number | null>(null);

  const [orgForm, setOrgForm] = useState({
    companyName: '',
    cnpj: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    description: '',
    logoUrl: '',
    website: '',
  });

  const [bankForm, setBankForm] = useState({
    bankName: '',
    agency: '',
    account: '',
    accountType: 'corrente',
    pixKey: '',
  });

  const [userName, setUserName] = useState('');

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      const userId = getUserId();
      if (!token || !userId) { router.push('/login'); return; }

      try {
        const userRes = await fetch(`${API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          const u = userData.user ?? userData;
          setUserName(u.name ?? '');
          if (u.bankInfo) {
            try {
              const parsed = JSON.parse(u.bankInfo);
              setBankForm({
                bankName: parsed.bankName ?? '',
                agency: parsed.agency ?? '',
                account: parsed.account ?? '',
                accountType: parsed.accountType ?? 'corrente',
                pixKey: parsed.pixKey ?? '',
              });
            } catch { /* bankInfo não é JSON válido */ }
          }
        }

        const orgsRes = await fetch(`${API_URL}/organizers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (orgsRes.ok) {
          const orgsData = await orgsRes.json();
          const orgs = orgsData.organizers ?? orgsData;
          const myOrg = Array.isArray(orgs)
            ? orgs.find((o: { userId: number }) => o.userId === userId)
            : null;
          if (myOrg) {
            setOrganizerId(myOrg.id);
            setOrgForm({
              companyName: myOrg.companyName ?? '',
              cnpj: myOrg.cnpj ?? '',
              phone: myOrg.phone ?? '',
              address: myOrg.address ?? '',
              city: myOrg.city ?? '',
              state: myOrg.state ?? '',
              zipcode: myOrg.zipcode ?? '',
              description: myOrg.description ?? '',
              logoUrl: myOrg.logoUrl ?? '',
              website: myOrg.website ?? '',
            });
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getToken, getUserId, router]);

  const setOrgField = (k: string, v: string) => setOrgForm((prev) => ({ ...prev, [k]: v }));
  const setBankField = (k: string, v: string) => setBankForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    const token = getToken();
    const userId = getUserId();
    if (!token || !userId) { router.push('/login'); return; }

    setSaving(true);
    setError(null);
    try {
      const userRes = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bankInfo: JSON.stringify(bankForm) }),
      });
      if (!userRes.ok) {
        const d = await userRes.json().catch(() => ({}));
        throw new Error(d.message ?? 'Erro ao salvar dados bancários');
      }

      if (organizerId) {
        const orgRes = await fetch(`${API_URL}/organizers/${organizerId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            companyName: orgForm.companyName,
            phone: orgForm.phone,
            address: orgForm.address,
            city: orgForm.city,
            state: orgForm.state,
            zipcode: orgForm.zipcode,
            description: orgForm.description,
            logoUrl: orgForm.logoUrl,
            website: orgForm.website,
          }),
        });
        if (!orgRes.ok) {
          const d = await orgRes.json().catch(() => ({}));
          throw new Error(d.message ?? 'Erro ao salvar perfil');
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="organizer">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Carregando perfil...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="organizer">
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="text-white py-8" style={{ background: 'linear-gradient(135deg, #003B4A, #00C2A8)' }}>
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
            <p className="text-white/70 text-sm mt-1">Gerencie seus dados e informações bancárias</p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-3xl py-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <FaCheckCircle /> Perfil salvo com sucesso!
            </div>
          )}

          {/* Dados do Usuário */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <FaUser className="text-[#00C2A8]" /> Dados da Conta
            </h2>
            <div>
              <label className="label-form">Nome</label>
              <input type="text" className="input-form bg-gray-50" value={userName} readOnly />
            </div>
            <p className="text-xs text-gray-400">Para alterar nome, e-mail ou senha, entre em contato com o suporte.</p>
          </div>

          {/* Perfil do Organizador */}
          {organizerId && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <FaBuilding className="text-[#00C2A8]" /> Perfil do Organizador
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label-form">Nome da empresa / organização</label>
                  <input type="text" className="input-form" placeholder="Minha Empresa Eventos Ltda"
                    value={orgForm.companyName} onChange={(e) => setOrgField('companyName', e.target.value)} />
                </div>
                <div>
                  <label className="label-form">CNPJ</label>
                  <input type="text" className="input-form bg-gray-50" value={orgForm.cnpj} readOnly placeholder="00.000.000/0000-00" />
                </div>
                <div>
                  <label className="label-form">Telefone</label>
                  <input type="tel" className="input-form" placeholder="(11) 99999-9999"
                    value={orgForm.phone} onChange={(e) => setOrgField('phone', e.target.value)} />
                </div>
                <div>
                  <label className="label-form">Site / Redes sociais</label>
                  <input type="url" className="input-form" placeholder="https://minhaempresa.com.br"
                    value={orgForm.website} onChange={(e) => setOrgField('website', e.target.value)} />
                </div>
                <div>
                  <label className="label-form">URL do logotipo</label>
                  <input type="url" className="input-form" placeholder="https://..."
                    value={orgForm.logoUrl} onChange={(e) => setOrgField('logoUrl', e.target.value)} />
                </div>
                <div>
                  <label className="label-form">CEP</label>
                  <input type="text" className="input-form" maxLength={8} placeholder="00000000"
                    value={orgForm.zipcode} onChange={(e) => setOrgField('zipcode', e.target.value)} />
                </div>
                <div>
                  <label className="label-form">Endereço</label>
                  <input type="text" className="input-form" placeholder="Rua, número"
                    value={orgForm.address} onChange={(e) => setOrgField('address', e.target.value)} />
                </div>
                <div>
                  <label className="label-form">Cidade</label>
                  <input type="text" className="input-form"
                    value={orgForm.city} onChange={(e) => setOrgField('city', e.target.value)} />
                </div>
                <div>
                  <label className="label-form">Estado</label>
                  <select className="input-form" value={orgForm.state} onChange={(e) => setOrgField('state', e.target.value)}>
                    <option value="">Selecione</option>
                    {BRAZIL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label-form">Sobre a organização</label>
                  <textarea rows={3} className="input-form resize-none" placeholder="Descreva sua empresa ou organização..."
                    value={orgForm.description} onChange={(e) => setOrgField('description', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Dados Bancários */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <FaUniversity className="text-[#00C2A8]" /> Dados Bancários
            </h2>
            <p className="text-xs text-gray-500">
              Informe sua conta bancária para receber os repasses das vendas de ingressos.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label-form">Banco</label>
                <input type="text" className="input-form" placeholder="Ex: Nubank, Itaú, Bradesco..."
                  value={bankForm.bankName} onChange={(e) => setBankField('bankName', e.target.value)} />
              </div>
              <div>
                <label className="label-form">Agência</label>
                <input type="text" className="input-form" placeholder="0000"
                  value={bankForm.agency} onChange={(e) => setBankField('agency', e.target.value)} />
              </div>
              <div>
                <label className="label-form">Conta</label>
                <input type="text" className="input-form" placeholder="00000-0"
                  value={bankForm.account} onChange={(e) => setBankField('account', e.target.value)} />
              </div>
              <div>
                <label className="label-form">Tipo de conta</label>
                <select className="input-form" value={bankForm.accountType}
                  onChange={(e) => setBankField('accountType', e.target.value)}>
                  <option value="corrente">Conta Corrente</option>
                  <option value="poupanca">Conta Poupança</option>
                  <option value="pagamento">Conta de Pagamento</option>
                </select>
              </div>
              <div>
                <label className="label-form">Chave PIX</label>
                <input type="text" className="input-form" placeholder="CPF, CNPJ, e-mail, telefone ou aleatória"
                  value={bankForm.pixKey} onChange={(e) => setBankField('pixKey', e.target.value)} />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              Seus dados bancários são armazenados de forma segura e utilizados exclusivamente para
              processar os repasses das vendas realizadas na plataforma.
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pb-8">
            <button
              onClick={() => router.push('/organizer/dashboard')}
              className="flex-1 py-3.5 border border-gray-300 text-gray-700 font-bold rounded-xl hover:border-gray-400 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#00C2A8' }}
            >
              <FaSave />
              {saving ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}
