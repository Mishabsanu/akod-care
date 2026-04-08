'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/services/api';
import PermissionMatrix from '@/components/PermissionMatrix';

/**
 * 🛡️ EditRolePage | Dynamic Role Re-Architect
 * Allows modification of existing clinical authorization matrices.
 */
export default function EditRolePage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    allAccess: false,
    isSystemRole: false
  });

  // -------------------------------------------------------------------
  // SYNC | Fetch Master Registry & Role Data
  // -------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [permsRes, roleRes] = await Promise.all([
          api.get('/roles/permissions'),
          api.get(`/roles/${id}`)
        ]);
        
        setAvailablePermissions(permsRes.data);
        setFormData({
            name: roleRes.data.name,
            description: roleRes.data.description || '',
            permissions: roleRes.data.permissions || [],
            allAccess: roleRes.data.allAccess || false,
            isSystemRole: roleRes.data.isSystemRole || false
        });
      } catch (err) {
        console.error('🚫 Registry Error | Failed to fetch clinical role data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.allAccess && formData.permissions.length === 0) {
      alert('⚠️ Security Warning | Please select at least one permission or enable Full Access.');
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/roles/${id}`, formData);
      router.push('/roles');
    } catch (err) {
      console.error('🚫 Registry Error | Failed to update clinical role:', err);
      alert('Role update failed. Please check medical data.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '10rem 2rem', color: 'var(--text-muted)' }}>
          <div className="animate-pulse">🛡️ Accessing Dynamic Security Vault...</div>
        </div>
      );
  }

  return (
    <div className="edit-role-container animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
            <button 
              onClick={() => router.back()} 
              style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ← Back to Registry
            </button>
            <h1 style={{ fontSize: '2.25rem', letterSpacing: '-0.03em', fontWeight: 800 }}>
              Re-Architect <span className="gradient-text">Clinical Role</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem' }}>
              Adjust authorization matrix for <strong>{formData.name}</strong>.
            </p>
        </div>

        <div style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Super Admin Mode</div>
                <div style={{ fontSize: '0.85rem', color: formData.allAccess ? 'var(--primary)' : 'var(--text-muted)' }}>{formData.allAccess ? 'Absolute Access Enabled' : 'Modular Access Only'}</div>
            </div>
            <div 
                onClick={() => !formData.isSystemRole && setFormData({ ...formData, allAccess: !formData.allAccess })}
                style={{ 
                    width: '50px', 
                    height: '26px', 
                    background: formData.allAccess ? 'var(--primary)' : '#cbd5e1', 
                    borderRadius: '20px', 
                    position: 'relative', 
                    cursor: formData.isSystemRole ? 'not-allowed' : 'pointer',
                    transition: 'var(--transition-smooth)',
                    opacity: formData.isSystemRole ? 0.6 : 1
                }}
            >
                <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    background: 'white', 
                    borderRadius: '50%', 
                    position: 'absolute', 
                    top: '3px', 
                    left: formData.allAccess ? '27px' : '3px',
                    transition: 'var(--transition-smooth)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}></div>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ opacity: submitting ? 0.7 : 1 }}>
        {/* Core Identity Card */}
        <div className="card glass" style={{ padding: '2.5rem', marginBottom: '2.5rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>Role Name</label>
                    <input 
                      required 
                      disabled={submitting || formData.isSystemRole} 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: formData.isSystemRole ? '#f8fafc' : 'white', fontWeight: 600, fontSize: '1rem', outline: 'none' }} 
                    />
                    {formData.isSystemRole && <p style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 800 }}>🛡️ SYSTEM PROTECTED ROLE</p>}
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>Clinical Scope / Description</label>
                    <textarea 
                      disabled={submitting} 
                      rows={1} 
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white', resize: 'none', fontSize: '1rem', outline: 'none' }} 
                    />
                </div>
            </div>
        </div>

        {/* Permission Matrix Section */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Authorization <span className="gradient-text">Matrix</span>
          </h2>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-main)' }}>{formData.permissions.length}</strong> Modules Active
            </span>
            <span style={{ color: formData.allAccess ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 700 }}>
                {formData.allAccess ? '⚠️ FULL BYPASS ACTIVE' : '✓ CONTROLLED ACCESS'}
            </span>
          </div>
        </div>

        {availablePermissions ? (
            <PermissionMatrix 
              availablePermissions={availablePermissions}
              selectedPermissions={formData.permissions}
              onChange={(perms) => setFormData({ ...formData, permissions: perms })}
              disabled={formData.allAccess}
            />
        ) : (
            <div className="card" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', background: 'white' }}>
              <div className="animate-pulse" style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛡️</div>
              <div style={{ fontWeight: 600 }}>Synchronizing Master Permissions Registry...</div>
            </div>
        )}

        {/* Global Controls */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '3rem', marginBottom: '5rem' }}>
          <button 
            type="button" 
            disabled={submitting} 
            onClick={() => router.back()} 
            style={{ padding: '1rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontWeight: 700, background: 'white', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting} 
            className="btn-primary"
            style={{ padding: '1rem 3rem', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)' }}
          >
            {submitting ? 'Updating Dynamic Role...' : 'Update Clinical Role'}
          </button>
        </div>
      </form>
    </div>
  );
}
