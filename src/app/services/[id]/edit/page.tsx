'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/services/api';

import { usePCMSStore } from '@/store/useStore';

export default function EditServicePage() {
  const router = useRouter();
  const { id } = useParams();
  const { setIsSyncing, showToast } = usePCMSStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    branches: [] as string[],
    status: ''
  });

  const [branches, setBranches] = useState<any[]>([]);
  const categories = ['Consultation', 'Therapy', 'Assessment', 'Rehabilitation', 'Emergency'];

  // -------------------------------------------------------------------
  // SYNC | Fetch Clinical Registry & Service Data
  // -------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      setIsSyncing(true);
      try {
        const [serviceRes, branchesRes] = await Promise.all([
          api.get(`/services/${id}`),
          api.get('/branches')
        ]);
        
        setBranches(branchesRes.data);
        const service = serviceRes.data;
        
        if (service) {
          setFormData({
            name: service.name,
            category: service.category,
            price: service.price.toString(),
            branches: service.branches?.map((b: any) => b._id || b) || [],
            status: service.status
          });
        }
      } catch (err) {
        console.error('🚫 Registry Error | Failed to fetch clinical service:', err);
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    };
    fetchData();
  }, [id, setIsSyncing]);

  const toggleBranch = (branchId: string) => {
    if (formData.branches.includes(branchId)) {
      setFormData({...formData, branches: formData.branches.filter(b => b !== branchId)});
    } else {
      setFormData({...formData, branches: [...formData.branches, branchId]});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setIsSyncing(true);
    try {
      await api.put(`/services/${id}`, formData);
      showToast('Clinical modality updated successfully.', 'success');
      router.push('/services');
    } catch (err) {
      console.error('🚫 Registry Error | Failed to update clinical modality:', err);
      showToast('Update failed. Please check medical data.', 'error');
    } finally {
      setSaving(false);
      setIsSyncing(false);
    }
  };

  if (loading) return <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>🛡️ Accessing Clinical Registry...</div>;

  return (
    <div className="edit-service-container animate-fade-in" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => router.back()} 
          style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          ← Back to Registry
        </button>
        <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>Edit Service: <span className="gradient-text">{formData.name}</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Modify the clinical modality's profile, session rates, and branch availability.</p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem', opacity: saving ? 0.7 : 1 }}>
        <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
           Service Code: <strong style={{ color: 'var(--primary)' }}>{id}</strong> • Last Updated: Persistently Synchronized
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Service Name</label>
            <input required disabled={saving} type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Update Price (₹)</label>
            <input required disabled={saving} type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Status</label>
            <select required disabled={saving} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white' }}>
              <option value="" disabled>Select Status</option>
              <option value="Available">Available</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Active Branches</label>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {branches.map(branch => (
               <button 
                disabled={saving}
                type="button" 
                key={branch._id} 
                onClick={() => toggleBranch(branch._id)}
                className="glass"
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  border: `1px solid ${formData.branches.includes(branch._id) ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  background: formData.branches.includes(branch._id) ? 'rgba(15, 118, 110, 0.1)' : 'white'
                }}
               >
                 {branch.name}
               </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" disabled={saving} onClick={() => router.back()} style={{ padding: '0.85rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontWeight: 600 }}>Cancel Updates</button>
          <button type="submit" disabled={saving} style={{ padding: '0.85rem 2rem', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'white', fontWeight: 600 }}>
            {saving ? 'Updating Registry...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
