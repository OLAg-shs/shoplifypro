import React, { useState, useEffect } from 'react';
import { User, Store, Bell, Shield, Save, Loader, CheckCircle, AlertCircle, Palette, Globe, Mail } from 'lucide-react';
import { api } from '../utils/api';

const Section = ({ title, icon: Icon, children }) => (
  <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
        <Icon size={18} />
      </div>
      <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{title}</h2>
    </div>
    {children}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="form-group">
    <label style={{ display: 'block', fontWeight: '600', fontSize: '0.875rem', marginBottom: '6px', color: '#374151' }}>{label}</label>
    {hint && <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '-2px 0 8px' }}>{hint}</p>}
    {children}
  </div>
);

const SellerSettings = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [profile, setProfile] = useState({ name: storedUser.name || '', email: storedUser.email || '' });
  const [store, setStore] = useState(null);
  const [storeForm, setStoreForm] = useState({ name: '', description: '', slug: '' });
  const [branding, setBranding] = useState({ primaryColor: '#2563eb', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' });
  const [notifications, setNotifications] = useState({ newOrder: true, lowStock: true, marketing: false });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await api.get('/stores/mine');
        setStore(data);
        setStoreForm({ name: data.name || '', description: data.description || '', slug: data.slug || '' });
        if (data.branding) setBranding(data.branding);
      } catch {
        // No store yet — that's okay
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const saveStoreSettings = async () => {
    if (!store) return;
    setSaving(true);
    try {
      const updated = await api.put(`/stores/${store.id}`, {
        name: storeForm.name,
        description: storeForm.description,
        branding,
      });
      setStore(updated);
      showSuccess('Store settings saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save store settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem', textAlign: 'center' }}>
        <Loader size={28} className="spinner" style={{ color: '#94a3b8', display: 'block', margin: '0 auto 12px' }} />
        <p style={{ color: '#94a3b8' }}>Loading settings…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Settings</h1>
        <p style={{ color: '#64748b' }}>Manage your account and store preferences.</p>
      </div>

      {/* Alerts */}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.875rem 1.25rem', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#059669', marginBottom: '1.5rem', fontWeight: '600' }}>
          <CheckCircle size={18} /> {success}
        </div>
      )}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.875rem 1.25rem', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', marginBottom: '1.5rem', fontWeight: '600' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Profile */}
      <Section title="Account Profile" icon={User}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <Field label="Full Name">
            <input className="input-field" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </Field>
          <Field label="Email Address">
            <input className="input-field" type="email" value={profile.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </Field>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.875rem 1.25rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <Shield size={16} style={{ color: '#94a3b8' }} />
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Email changes require contacting support. Your account is secured with JWT authentication.</span>
        </div>
      </Section>

      {/* Store Settings */}
      {store ? (
        <Section title="Store Settings" icon={Store}>
          <div style={{ marginBottom: '1.5rem' }}>
            <Field label="Store Name">
              <input className="input-field" value={storeForm.name} onChange={e => setStoreForm(f => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Store Description">
              <textarea className="input-field" rows={3} value={storeForm.description} onChange={e => setStoreForm(f => ({ ...f, description: e.target.value }))} />
            </Field>
            <Field label="Store URL Slug" hint={`Your store URL: /store/${storeForm.slug}`}>
              <input className="input-field" value={storeForm.slug} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </Field>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <Palette size={16} style={{ color: '#7c3aed' }} />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Brand Colors</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { key: 'primaryColor', label: 'Primary Color' },
                { key: 'backgroundColor', label: 'Background' },
              ].map(({ key, label }) => (
                <Field key={key} label={label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="color" value={branding[key] || '#000000'} onChange={e => setBranding(b => ({ ...b, [key]: e.target.value }))}
                      style={{ width: '44px', height: '44px', padding: '2px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }} />
                    <code style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'monospace' }}>{branding[key]}</code>
                  </div>
                </Field>
              ))}
              <Field label="Font Family">
                <select className="input-field" value={branding.fontFamily} onChange={e => setBranding(b => ({ ...b, fontFamily: e.target.value }))}>
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                  <option value="'Outfit', sans-serif">Outfit</option>
                  <option value="'Playfair Display', serif">Playfair Display</option>
                  <option value="'DM Sans', sans-serif">DM Sans</option>
                </select>
              </Field>
            </div>
          </div>

          <button className="btn btn-primary" onClick={saveStoreSettings} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saving ? <Loader size={16} className="spinner" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save Store Settings'}
          </button>
        </Section>
      ) : (
        <Section title="Store Settings" icon={Store}>
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            <Store size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>Your store will appear here after admin approval.</p>
          </div>
        </Section>
      )}

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        {[
          { key: 'newOrder', label: 'New Order Received', desc: 'Get notified when a customer places an order.' },
          { key: 'lowStock', label: 'Low Stock Alerts', desc: 'Alert when a product drops below 5 units.' },
          { key: 'marketing', label: 'Platform Updates', desc: 'News about new Eagle Choice features.' },
        ].map(({ key, label, desc }) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{label}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{desc}</div>
            </div>
            <button
              onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
              style={{
                width: '44px', height: '24px', borderRadius: '100px', border: 'none',
                background: notifications[key] ? '#2563eb' : '#e2e8f0',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s ease', flexShrink: 0
              }}
            >
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                position: 'absolute', top: '3px', transition: 'left 0.2s ease',
                left: notifications[key] ? '23px' : '3px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
        ))}
      </Section>

      {/* Danger Zone */}
      <Section title="Security" icon={Shield}>
        <div style={{ padding: '1.25rem', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca' }}>
          <div style={{ fontWeight: '700', marginBottom: '4px', color: '#dc2626' }}>Danger Zone</div>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>Permanently delete your account and all associated data.</div>
          <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #fecaca', background: 'white', color: '#dc2626', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}>
            Request Account Deletion
          </button>
        </div>
      </Section>
    </div>
  );
};

export default SellerSettings;
