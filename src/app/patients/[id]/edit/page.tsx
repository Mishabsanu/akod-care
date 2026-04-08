'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, Phone, MapPin, Activity, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';
import { usePCMSStore } from '@/store/useStore';

export default function EditPatientPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, setIsSyncing, showToast } = usePCMSStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    branch: '',
    status: ''
  });

  // -------------------------------------------------------------------
  // SYNC | Fetch Clinical Patient Data & Options
  // -------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      setIsSyncing(true);
      try {
        const [patientRes, branchesRes] = await Promise.all([
          api.get(`/patients/${id}`),
          api.get('/branches')
        ]);
        
        const patient = patientRes.data;
        if (patient) {
          const resolvedBranchId = 
            (typeof patient.branch === 'object' && patient.branch !== null)
              ? (patient.branch._id || patient.branch.id)
              : patient.branch;

          setFormData({
            name: patient.name || '',
            phone: patient.phone || '',
            age: patient.age ? patient.age.toString() : '',
            gender: patient.gender || '',
            address: patient.address || '',
            branch: resolvedBranchId || '',
            status: patient.status || ''
          });
        }
        setBranches(branchesRes.data);
      } catch (err) {
        console.error('🚫 Registry Error | Failed to fetch medical file:', err);
        showToast('Failed to synchronize medical record.', 'error');
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    };
    fetchData();
  }, [id, setIsSyncing, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setIsSyncing(true);
    try {
      await api.put(`/patients/${id}`, formData);
      showToast('Medical record updated successfully.', 'success');
      router.push('/patients');
    } catch (err) {
      console.error('🚫 Registry Error | Failed to update clinical record:', err);
      showToast('Update failed. Please check medical data consistency.', 'error');
    } finally {
      setSaving(false);
      setIsSyncing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin" />
      <p className="font-bold text-slate-400 animate-pulse text-xs tracking-widest">🛡️ SECURING CLINICAL VAULT...</p>
    </div>
  );

  return (
    <div className="edit-patient-container animate-fade-in clinical-form-wide" style={{ paddingBottom: '7rem' }}>
      
      {/* 🏥 CLINICAL HEADER */}
      <div style={{ marginBottom: '3rem' }}>
        <button 
          onClick={() => router.back()} 
          style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, background: 'rgba(15, 118, 110, 0.08)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}
        >
          <ArrowLeft size={16} /> Registry Dashboard
        </button>
        <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>Modify Patient <span className="gradient-text">File</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Update medical identity, contact vectors, and clinical status profiles.</p>
      </div>

      <form onSubmit={handleSubmit} className="clinical-form-card" style={{ opacity: saving ? 0.7 : 1 }}>
        <div className="clinical-form-grid">
          
          {/* Section 1: Clinical Identity */}
          <div className="col-12" style={{ 
              marginBottom: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              background: 'linear-gradient(90deg, rgba(15, 118, 110, 0.05) 0%, transparent 100%)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--primary)'
          }}>
            <User size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Identity & <span className="gradient-text">Profiling</span>
            </h3>
          </div>

          <div className="col-8">
            <label className="label-premium">Patient Full Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input required disabled={saving} type="text" className="input-premium" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Full legal name..." />
          </div>
          <div className="col-4">
            <label className="label-premium">Primary Contact <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
              <input required disabled={saving} type="text" className="input-premium" style={{ paddingLeft: '2.75rem' }} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="9876543210" />
            </div>
          </div>

          <div className="col-4">
            <label className="label-premium">Gender</label>
            <select className="input-premium" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="col-4">
            <label className="label-premium">Age <span style={{ color: '#ef4444' }}>*</span></label>
            <input required disabled={saving} type="number" className="input-premium" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="0" />
          </div>
          
          <div className="col-4">
            <label className="label-premium">Assigned Clinical Site <span style={{ color: '#ef4444' }}>*</span></label>
            <select 
              required 
              disabled={saving || !user?.allAccess} 
              className="input-premium" 
              value={formData.branch} 
              onChange={(e) => setFormData({...formData, branch: e.target.value})}
              style={{ background: !user?.allAccess ? '#f8fafc' : 'white' }}
            >
              <option value="" disabled>Select Branch</option>
              {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
            {!user?.allAccess && <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 600 }}>🔒 Restricted to assigned site.</p>}
          </div>

          {/* Section 2: Clinical Status */}
          <div className="col-12" style={{ 
              margin: '2rem 0 1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              background: 'linear-gradient(90deg, rgba(15, 118, 110, 0.05) 0%, transparent 100%)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--primary)'
          }}>
            <Activity size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Clinical <span className="gradient-text">Condition</span>
            </h3>
          </div>

          <div className="col-12">
            <label className="label-premium">Residential Address <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', opacity: 0.5 }} />
              <input required disabled={saving} type="text" className="input-premium" style={{ paddingLeft: '2.75rem' }} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Complete physical address..." />
            </div>
          </div>

          <div className="col-12">
             <label className="label-premium">Medical Condition Status</label>
             <select className="input-premium" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="" disabled>Select Status</option>
                <option value="New Case">New Case</option>
                <option value="Critical">Critical</option>
                <option value="Stable">Stable</option>
                <option value="Recovering">Recovering</option>
             </select>
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'flex-end', marginTop: '4rem' }}>
          <button 
            type="button" 
            disabled={saving} 
            onClick={() => router.back()} 
            style={{ padding: '0.85rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontWeight: 700, background: 'white', color: 'var(--text-muted)' }}
          >
            CANCEL
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            style={{ 
                padding: '0.85rem 3.5rem', 
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
            {saving ? 'SYNCHRONIZING...' : <><CheckCircle2 size={18} /> AUTHORIZE UPDATE</>}
          </button>
        </div>
      </form>
    </div>
  );
}
