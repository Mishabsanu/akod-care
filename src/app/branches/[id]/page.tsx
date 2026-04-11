'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Phone, 
  Users, 
  ShieldCheck, 
  Edit,
  Activity,
  Info,
  Calendar,
  Network
} from 'lucide-react';
import api from '@/services/api';
import { usePCMSStore } from '@/store/useStore';

export default function BranchDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { showToast } = usePCMSStore();
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<any>(null);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const res = await api.get(`/branches/${id}`);
        setBranch(res.data);
      } catch (err) {
        console.error('🚫 Registry Error | Failed to fetch site record:', err);
        showToast('Failed to load branch details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchBranch();
  }, [id, showToast]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin" />
      <p className="font-bold text-slate-400 animate-pulse text-xs tracking-widest">🛡️ ACCESSING NETWORK TOPOLOGY...</p>
    </div>
  );

  if (!branch) return (
    <div className="p-12 text-center font-bold text-slate-400">
      🚫 CLINICAL SITE RECORD NOT FOUND
    </div>
  );

  return (
    <div className="branch-details-container animate-fade-in clinical-form-wide" style={{ paddingBottom: '7rem' }}>
      
      {/* 🏥 CLINICAL HEADER */}
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <button 
            onClick={() => router.push('/branches')} 
            style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, background: 'rgba(15, 118, 110, 0.08)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}
          >
            <ArrowLeft size={16} /> Network Dashboard
          </button>
          <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>Site <span className="gradient-text">Parameters</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Comprehensive breakdown of the physical clinical site, capacity, and operational standing.</p>
        </div>
        <button
          onClick={() => router.push(`/branches/${id}/edit`)}
          className="glass-interactive"
          style={{ 
            padding: '0.85rem 2rem', 
            borderRadius: 'var(--radius-md)', 
            background: 'var(--primary)', 
            color: 'white', 
            fontWeight: 800, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            boxShadow: '0 10px 20px -5px rgba(13, 148, 136, 0.4)'
          }}
        >
          <Edit size={18} /> EDIT PARAMETERS
        </button>
      </div>

      <div className="clinical-form-grid">
        
        {/* LEFT COLUMN: Physical & Operational Metrics */}
        <div className="col-8">
          <div className="clinical-form-card" style={{ height: '100%' }}>
            
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '3.5rem' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '1.5rem', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', fontWeight: 900, boxShadow: '0 10px 25px -10px rgba(13, 148, 136, 0.3)' }}>
                <Building2 size={40} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 950, margin: 0, letterSpacing: '-0.03em' }}>{branch.name}</h2>
                  <span style={{ 
                    padding: '0.4rem 1rem', 
                    borderRadius: '2rem', 
                    background: branch.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                    color: branch.status === 'Active' ? '#10b981' : '#64748b',
                    fontSize: '0.75rem', 
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                    border: '1px solid currentColor'
                  }}>
                    {branch.status?.toUpperCase() || 'AUTHORIZED'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', opacity: 0.7, fontWeight: 700, fontSize: '0.9rem' }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> {branch.address}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginTop: '3rem' }}>
              <div className="spec-block" style={{ gridColumn: 'span 2' }}>
                <label className="label-premium" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} style={{ color: 'var(--primary)' }} /> SITE GEOLOCATION
                </label>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)' }}>
                  {branch.address}
                </div>
              </div>

              <div className="spec-block">
                <label className="label-premium" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} style={{ color: 'var(--primary)' }} /> SITE CONTACT
                </label>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border-subtle)' }}>
                  {branch.phone || 'NO CONTACT'}
                </div>
              </div>

              <div className="spec-block">
                <label className="label-premium" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={14} style={{ color: 'var(--primary)' }} /> STAFF CAPACITY
                </label>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border-subtle)' }}>
                  {branch.staffCount || 0} DEPLOYED PERSONNEL
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Operational Context */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="clinical-form-card" style={{ padding: '2rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
               <Network size={20} style={{ color: 'var(--primary)' }} />
               <h3 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '-0.01em' }}>SITE CONNECTIVITY</h3>
             </div>
             <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                 <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.6 }}>SYSTEM NODE</span>
                 <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)' }}>ONLINE</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                 <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.6 }}>REGISTRY SYNC</span>
                 <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)' }}>ACTIVE</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.6 }}>DATA ISOLATION</span>
                 <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#10b981' }}>ENFORCED</span>
               </div>
             </div>
          </div>

          <div style={{ padding: '2rem', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Calendar size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '-0.01em' }}>SCHEDULE FEED</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.6 }}>
               Clinical site throughput and specialist availability are managed via the Central Scheduler. Site parameters directly impact local booking capacity.
            </p>
          </div>

          <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 118, 110, 0.05)', border: '1px dashed var(--primary)' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                Modifying site parameters may affect historical data reporting and branch-level isolation policies. Verify capacity changes before authorization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
