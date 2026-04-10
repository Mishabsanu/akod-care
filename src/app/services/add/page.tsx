'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { usePCMSStore } from '@/store/useStore';

export default function AddServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user, showToast } = usePCMSStore();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Therapy',
    price: '',
    branches: user?.allAccess ? [] : (user?.branchId ? [user.branchId] : []) as string[],
    description: ''
  });

  const [branches, setBranches] = useState<any[]>([]);
  const categories = ['Consultation', 'Therapy', 'Assessment', 'Rehabilitation', 'Emergency'];

  // -------------------------------------------------------------------
  // SYNC | Fetch Clinical Branch Registry
  // -------------------------------------------------------------------
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/branches');
        setBranches(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      } catch (err) {
        console.error('🚫 Registry Error | Failed to fetch site options:', err);
      }
    };
    fetchBranches();
  }, []);

  const toggleBranch = (branchId: string) => {
    if (formData.branches.includes(branchId)) {
      setFormData({ ...formData, branches: formData.branches.filter(b => b !== branchId) });
    } else {
      setFormData({ ...formData, branches: [...formData.branches, branchId] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/services', formData);
      router.push('/services');
    } catch (err) {
      console.error('🚫 Registry Error | Failed to onboard clinical service:', err);
      showToast('Failed to save service. Please check your inputs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-service-container animate-fade-in clinical-form-wide" style={{ paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.back()}
          style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          ← Back to Registry
        </button>
        <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>New Clinical <span className="gradient-text">Service</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Define a new treatment modality and set its standard clinical rate.</p>
      </div>

      <form onSubmit={handleSubmit} className="clinical-form-card" style={{ opacity: loading ? 0.7 : 1 }}>
        <div className="clinical-form-grid">
          <div className="col-6">
            <label className="label-premium">Service/Treatment Name</label>
            <input required disabled={loading} type="text" className="input-premium" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ultrasound Therapy" />
          </div>
          <div className="col-3">
            <label className="label-premium">Category</label>
            <select disabled={loading} className="input-premium" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-3">
            <label className="label-premium">Standard Rate (₹)</label>
            <input required disabled={loading} type="number" className="input-premium" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="₹ 0.00" />
          </div>

          <div className="col-12">
            <label className="label-premium">Brief Description</label>
            <textarea disabled={loading} rows={2} className="input-premium" style={{ height: '80px', resize: 'none' }} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the clinical benefits and procedure..." />
          </div>

          {user?.allAccess && (
            <div className="col-12" style={{ marginTop: '1rem' }}>
              <label className="label-premium">Branch Availability & Deployment</label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Select clinical sites where this service is authorized to be provided.</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {branches.map(branch => (
                  <button
                    disabled={loading}
                    type="button"
                    key={branch._id}
                    onClick={() => toggleBranch(branch._id)}
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '2rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      border: `2px solid ${formData.branches.includes(branch._id) ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: formData.branches.includes(branch._id) ? 'rgba(15, 118, 110, 0.08)' : 'white',
                      color: formData.branches.includes(branch._id) ? 'var(--primary)' : 'var(--text-muted)'
                    }}
                  >
                    {branch.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '3rem' }}>
          <button type="button" disabled={loading} onClick={() => router.back()} style={{ padding: '0.85rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontWeight: 600 }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '0.85rem 3rem', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'white', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}>
            {loading ? 'Finalizing Registry...' : 'FINALIZE CLINICAL SERVICE'}
          </button>
        </div>
      </form>
    </div>
  );
}
