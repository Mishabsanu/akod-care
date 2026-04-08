'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { usePCMSStore } from '@/store/useStore';

export default function AddBranchPage() {
  const router = useRouter();
  const { showToast } = usePCMSStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    staffCount: '',
    status: 'Active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/branches', formData);
      showToast('Clinical site established successfully.', 'success');
      router.push('/branches');
    } catch (err) {
      console.error('🚫 Registry Error | Failed to register clinical branch:', err);
      showToast('Branch registration failed. Please check site data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-branch-container animate-fade-in" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.back()}
          style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          ← Back to Network
        </button>
        <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>Initialize <span className="gradient-text">Branch</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Establish a new clinical site and configure its operational parameters.</p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem', opacity: loading ? 0.7 : 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Full Branch Name</label>
            <input required disabled={loading} type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Pune East Center" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Operational Address</label>
            <input required disabled={loading} type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full physical location details..." style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Contact Number</label>
            <input required disabled={loading} type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Staff Capacity</label>
            <input required disabled={loading} type="number" value={formData.staffCount} onChange={(e) => setFormData({ ...formData, staffCount: e.target.value })} placeholder="0" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="button" disabled={loading} onClick={() => router.back()} style={{ padding: '0.85rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontWeight: 600 }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '0.85rem 2rem', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'white', fontWeight: 600 }}>
            {loading ? 'Archiving Registration...' : 'Authorize Branch'}
          </button>
        </div>
      </form>
    </div>
  );
}
