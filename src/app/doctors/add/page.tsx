'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { usePCMSStore } from '@/store/useStore';

export default function AddDoctorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);

  const { user, showToast } = usePCMSStore();
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    phone: '',
    email: '',
    branchId: user?.allAccess ? '' : (user?.branchId || ''),
    status: 'Available',
    remarks: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchId) {
      showToast('Please assign a branch to this specialist.', 'error');
      return;
    }

    setLoading(true);
    // Clean the data: remove empty strings for optional fields
    const payload: any = { ...formData };
    if (!payload.email) delete payload.email;
    if (!payload.remarks) delete payload.remarks;
    payload.branches = [formData.branchId];

    try {
      await api.post('/doctors', payload);
      router.push('/doctors');
    } catch (err) {
      console.error('🚫 Registry Error | Failed to register clinical specialist:', err);
      showToast('Specialist registration failed. Please check medical data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-doctor-container animate-fade-in clinical-form-wide" style={{ paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <button
          onClick={() => router.back()}
          style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, background: 'rgba(15, 118, 110, 0.08)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}
        >
          ← Back to Registry
        </button>
        <h1 style={{ fontSize: '2.5rem', letterSpacing: '-0.03em', fontWeight: 900 }}>Initialize <span className="gradient-text">Specialist</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>Initialize medical specialist profile and clinical site assignment.</p>
      </div>

      <form onSubmit={handleSubmit} className="clinical-form-card" style={{ opacity: loading ? 0.7 : 1 }} autoComplete="off">
        <div className="clinical-form-grid">
          <div className="col-8">
            <label className="label-premium">Specialist Full Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input required disabled={loading} type="text" className="input-premium" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Dr. Robert Lee" />
          </div>
          <div className="col-4">
            <label className="label-premium">Clinical Category <span style={{ color: '#ef4444' }}>*</span></label>
            <input required disabled={loading} type="text" className="input-premium" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} placeholder="e.g. Sports Therapist" />
          </div>

          <div className="col-4">
            <label className="label-premium">Primary Contact <span style={{ color: '#ef4444' }}>*</span></label>
            <input required disabled={loading} type="text" className="input-premium" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
          </div>
          <div className="col-4">
            <label className="label-premium">Personnel Email</label>
            <input disabled={loading} type="email" className="input-premium" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="specialist@physio4.com" autoComplete="none" />
          </div>
          {user?.allAccess && (
            <div className="col-4">
              <label className="label-premium">Assigned Clinical Branch <span style={{ color: '#ef4444' }}>*</span></label>
              <select required disabled={loading} className="input-premium" value={formData.branchId} onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}>
                <option value="">Select Clinical Site</option>
                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          )}

          {/* Section 4: Conclusion / Remarks */}
          <div className="col-12 remarks-section">
            <label className="label-premium">Conclusions / Administrative Remarks</label>
            <textarea
              className="textarea-premium"
              placeholder="Add specialist notes, availability patterns, or clinical site context..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
            <p className="remarks-subtitle">Include clinical focus areas or site-specific specialist instructions.</p>
          </div>

          {/* Action Row */}
          <div className="col-12" style={{ display: 'flex', gap: '1.25rem', justifyContent: 'flex-end', marginTop: '3rem' }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => router.back()}
              style={{ padding: '0.85rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontWeight: 600, background: 'white' }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.85rem 3.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary)',
                color: 'white',
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {loading ? 'INITIALIZING...' : 'AUTHORIZE SPECIALIST'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
