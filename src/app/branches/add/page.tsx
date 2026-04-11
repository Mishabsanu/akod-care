'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Phone, Users, Shield, CheckCircle2, ArrowLeft } from 'lucide-react';
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
    <div className="add-branch-container animate-fade-in clinical-form-wide" style={{ paddingBottom: '7rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.back()}
          style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, background: 'rgba(15, 118, 110, 0.08)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}
        >
          <ArrowLeft size={16} /> Network Infrastructure
        </button>
        <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>Initialize Clinical <span className="gradient-text">Branch</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Establish a new physical clinical site and configure its core operational parameters.</p>
      </div>

      <form onSubmit={handleSubmit} className="clinical-form-card" style={{ opacity: loading ? 0.7 : 1 }}>
        <div className="clinical-form-grid">
          <div className="col-12">
            <label className="label-premium">Full Branch Name <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Building2 size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
              <input required disabled={loading} type="text" className="input-premium" style={{ paddingLeft: '2.75rem' }} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Pune East Center" />
            </div>
          </div>

          <div className="col-12">
            <label className="label-premium">Operational Address <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
              <input required disabled={loading} type="text" className="input-premium" style={{ paddingLeft: '2.75rem' }} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full physical location details..." />
            </div>
          </div>

          <div className="col-6">
            <label className="label-premium">Contact Number <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
              <input required disabled={loading} type="text" className="input-premium" style={{ paddingLeft: '2.75rem' }} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>

          <div className="col-6">
            <label className="label-premium">Staff Capacity <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Users size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
              <input required disabled={loading} type="number" className="input-premium" style={{ paddingLeft: '2.75rem' }} value={formData.staffCount} onChange={(e) => setFormData({ ...formData, staffCount: e.target.value })} placeholder="0" />
            </div>
          </div>

          <div className="col-12">
            <label className="label-premium">Initial Operational Status <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Shield size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
              <select required disabled={loading} className="input-premium" style={{ paddingLeft: '2.75rem', fontWeight: 800, color: 'var(--primary)' }} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                 <option value="Active">Authorized / Active</option>
                 <option value="Inactive">Temporary Deactivation</option>
                 <option value="Setup In-Progress">Setup In-Progress</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'flex-end', marginTop: '4rem' }}>
          <button 
            type="button" 
            disabled={loading} 
            onClick={() => router.back()} 
            style={{ padding: '0.85rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontWeight: 700, background: 'white', color: 'var(--text-muted)' }}
          >
            CANCEL
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
                padding: '0.85rem 2.5rem', 
                borderRadius: 'var(--radius-md)', 
                background: 'var(--primary)', 
                color: 'white', 
                fontWeight: 900, 
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 10px 20px -5px rgba(13, 148, 136, 0.4)' 
            }}
          >
            {loading ? 'SYNCHRONIZING...' : <><CheckCircle2 size={18} /> AUTHORIZE BRANCH</>}
          </button>
        </div>
      </form>
    </div>
  );
}
