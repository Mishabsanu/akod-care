'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Building2, MapPin, Phone, Users, CheckCircle2, Shield } from 'lucide-react';
import api from '@/services/api';
import { usePCMSStore } from '@/store/useStore';

export default function EditBranchPage() {
  const router = useRouter();
  const { id } = useParams();
  const { showToast, setIsSyncing } = usePCMSStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    staffCount: '',
    status: 'Active'
  });

  useEffect(() => {
    const fetchBranch = async () => {
      setIsSyncing(true);
      try {
        const res = await api.get(`/branches/${id}`);
        const branch = res.data;
        if (branch) {
          setFormData({
            name: branch.name,
            address: branch.address,
            phone: branch.phone,
            staffCount: branch.staffCount || '',
            status: branch.status || 'Active'
          });
        }
      } catch (err) {
        console.error('🚫 Registry Error | Failed to fetch site record:', err);
        showToast('Failed to load branch details.', 'error');
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    };
    fetchBranch();
  }, [id, setIsSyncing, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setIsSyncing(true);
    try {
      await api.put(`/branches/${id}`, formData);
      showToast('Clinical site updated successfully.', 'success');
      router.push('/branches');
    } catch (err) {
      console.error('🚫 Registry Error | Failed to update clinical branch:', err);
      showToast('Update failed. Please check site data.', 'error');
    } finally {
      setSaving(false);
      setIsSyncing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin" />
      <p className="font-bold text-slate-400 animate-pulse text-xs tracking-widest">🛡️ ACCESSING SITE REGISTRY...</p>
    </div>
  );

  return (
    <div className="edit-branch-container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '7rem' }}>
      
      {/* 🏥 CLINICAL HEADER */}
      <div style={{ marginBottom: '3rem' }}>
        <button 
          onClick={() => router.back()} 
          style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, background: 'rgba(15, 118, 110, 0.08)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}
        >
          <ArrowLeft size={16} /> Network Infrastructure
        </button>
        <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>Modify Clinical <span className="gradient-text">Branch</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Adjust site location, contact details, and operational status for this clinical branch.</p>
      </div>

      <form onSubmit={handleSubmit} className="clinical-form-card" style={{ opacity: saving ? 0.7 : 1 }}>
        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', marginBottom: '2.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderLeft: '4px solid var(--primary)', fontWeight: 600 }}>
           Location Code: <strong style={{ color: 'var(--primary)' }}>{id}</strong> • Verified Physical Site Record
        </div>

        <div className="clinical-form-grid">
          <div className="col-12">
            <label className="label-premium">Full Branch Name <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Building2 size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
              <input required disabled={saving} type="text" className="input-premium" style={{ paddingLeft: '2.75rem' }} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Pune East Center" />
            </div>
          </div>

          <div className="col-12">
            <label className="label-premium">Operational Address <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
              <input required disabled={saving} type="text" className="input-premium" style={{ paddingLeft: '2.75rem' }} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full physical location details..." />
            </div>
          </div>

          <div className="col-6">
            <label className="label-premium">Contact Number <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
              <input required disabled={saving} type="text" className="input-premium" style={{ paddingLeft: '2.75rem' }} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>

          <div className="col-6">
            <label className="label-premium">Staff Capacity <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Users size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
              <input required disabled={saving} type="number" className="input-premium" style={{ paddingLeft: '2.75rem' }} value={formData.staffCount} onChange={(e) => setFormData({ ...formData, staffCount: e.target.value })} placeholder="0" />
            </div>
          </div>

          <div className="col-12">
            <label className="label-premium">Operational Status <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Shield size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
              <select required disabled={saving} className="input-premium" style={{ paddingLeft: '2.75rem', fontWeight: 800, color: 'var(--primary)' }} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                 <option value="Active">Authorized / Active</option>
                 <option value="Inactive">Temporary Deactivation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'flex-end', marginTop: '4rem' }}>
          <button 
            type="button" 
            disabled={saving} 
            onClick={() => router.back()} 
            style={{ padding: '0.85rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontWeight: 700, background: 'white', color: 'var(--text-muted)' }}
          >
            CANCEL
          </button>
          <button 
            type="submit" 
            disabled={saving} 
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
            {saving ? 'SYNCHRONIZING...' : <><CheckCircle2 size={18} /> UPDATE BRANCH</>}
          </button>
        </div>
      </form>
    </div>
  );
}
