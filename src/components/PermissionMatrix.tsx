'use client'
import React from 'react';

/**
 * 🛡️ Clinical Permission Matrix | Authorization Architect
 * High-fidelity interface for mapping staff roles to clinical modules.
 * Features: Module-level toggles, granular action control, and responsive desktop layout.
 */
interface PermissionMatrixProps {
  availablePermissions: Record<string, Record<string, string>>;
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ 
  availablePermissions, 
  selectedPermissions, 
  onChange,
  disabled = false
}) => {
  const standardColumns = ['VIEW', 'CREATE', 'EDIT', 'DELETE'];

  const togglePermission = (perm: string) => {
    if (disabled) return;
    if (selectedPermissions.includes(perm)) {
      onChange(selectedPermissions.filter(p => p !== perm));
    } else {
      onChange([...selectedPermissions, perm]);
    }
  };

  const toggleModule = (moduleKey: string, checked: boolean) => {
    if (disabled) return;
    const modulePerms = Object.values(availablePermissions[moduleKey]);
    if (checked) {
      const newPerms = [...selectedPermissions];
      modulePerms.forEach(p => {
        if (!newPerms.includes(p)) newPerms.push(p);
      });
      onChange(newPerms);
    } else {
      onChange(selectedPermissions.filter(p => !modulePerms.includes(p)));
    }
  };

  const isModuleFull = (moduleKey: string) => {
    const modulePerms = Object.values(availablePermissions[moduleKey]);
    return modulePerms.length > 0 && modulePerms.every(p => selectedPermissions.includes(p));
  };

  const isModuleEmpty = (moduleKey: string) => {
    const modulePerms = Object.values(availablePermissions[moduleKey]);
    return !modulePerms.some(p => selectedPermissions.includes(p));
  };

  const getSpecialActions = (moduleKey: string) => {
    const moduleData = availablePermissions[moduleKey];
    return Object.entries(moduleData).filter(([key]) => !standardColumns.includes(key));
  };

  return (
    <div className="permission-matrix-wrapper" style={{ opacity: disabled ? 0.6 : 1, transition: 'var(--transition-smooth)' }}>
      <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-subtle)' }}>
              <th style={{ padding: '1.5rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '240px' }}>Clinical Module</th>
              <th style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Full access</th>
              {standardColumns.map(col => (
                <th key={col} style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{col}</th>
              ))}
              <th style={{ padding: '1.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Special Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(availablePermissions).map((moduleKey, idx) => {
              const specialActions = getSpecialActions(moduleKey);
              return (
                <tr key={moduleKey} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-subtle)', background: idx % 2 === 0 ? 'transparent' : 'rgba(248, 250, 252, 0.5)' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--primary)', opacity: isModuleEmpty(moduleKey) ? 0.3 : 1 }}></div>
                      {moduleKey.replace(/_/g, ' ')}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      disabled={disabled}
                      checked={isModuleFull(moduleKey)}
                      onChange={(e) => toggleModule(moduleKey, e.target.checked)}
                      style={{ transform: 'scale(1.25)', accentColor: 'var(--primary)', cursor: disabled ? 'not-allowed' : 'pointer' }}
                    />
                  </td>
                  {standardColumns.map(col => {
                    const permKey = availablePermissions[moduleKey][col];
                    return (
                      <td key={col} style={{ padding: '1.25rem', textAlign: 'center' }}>
                        {permKey ? (
                          <div 
                            onClick={() => !disabled && togglePermission(permKey)}
                            style={{ 
                              width: '24px', 
                              height: '24px', 
                              margin: '0 auto', 
                              borderRadius: '6px', 
                              border: `2px solid ${selectedPermissions.includes(permKey) ? 'var(--primary)' : '#e2e8f0'}`,
                              background: selectedPermissions.includes(permKey) ? 'var(--primary)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: disabled ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              color: 'white',
                              fontSize: '12px'
                            }}
                          >
                            {selectedPermissions.includes(permKey) && '✓'}
                          </div>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '1rem' }}>·</span>
                        )}
                      </td>
                    );
                  })}
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {specialActions.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {specialActions.map(([label, permKey]) => (
                          <button
                            key={permKey}
                            type="button"
                            disabled={disabled}
                            onClick={() => togglePermission(permKey)}
                            style={{ 
                              padding: '0.35rem 0.75rem', 
                              borderRadius: '2rem', 
                              fontSize: '0.7rem', 
                              fontWeight: 700,
                              background: selectedPermissions.includes(permKey) ? 'rgba(15, 118, 110, 0.1)' : '#f1f5f9',
                              color: selectedPermissions.includes(permKey) ? 'var(--primary)' : '#64748b',
                              border: `1px solid ${selectedPermissions.includes(permKey) ? 'var(--primary)' : 'transparent'}`,
                              transition: 'all 0.2s',
                              cursor: disabled ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '0.75rem', fontStyle: 'italic' }}>Standard Only</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(15, 118, 110, 0.05)', border: '1px dashed var(--primary)' }}>
        <div style={{ fontSize: '1.25rem' }}>🛡️</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', lineHeight: '1.4' }}>
          <strong>Clinical Authorization Notice:</strong> Changing these permissions will instantly affect all users assigned to this role across their respective branches. Please review the matrix carefully.
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrix;
