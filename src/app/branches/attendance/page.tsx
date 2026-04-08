'use client'
import React, { useState, useEffect } from 'react';
import { usePCMSStore } from '@/store/useStore';
import api from '@/services/api';

interface AttendanceRecord {
  _id: string;
  type: 'Branch' | 'Staff';
  branch: { name: string };
  staffId?: { name: string };
  checkIn: string;
  checkOut?: string;
  status: string;
  note?: string;
}

export default function AttendancePage() {
  const { user, selectedBranchId, showToast } = usePCMSStore();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [checkInData, setCheckInData] = useState({
    type: 'Branch',
    staffId: '',
    note: ''
  });

  // -------------------------------------------------------------------
  // SYNC | Fetch Operational Data
  // -------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recordsRes, staffRes] = await Promise.all([
          api.get('/attendance'),
          api.get('/users') // Managers can see staff via branchGuard
        ]);
        setRecords(recordsRes.data);
        setStaff(staffRes.data);
      } catch (err) {
        console.error('🚫 Operational Error | Failed to fetch attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedBranchId]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...checkInData,
        branch: selectedBranchId || user?.branchId
      };
      const res = await api.post('/attendance/check-in', payload);
      setRecords([res.data, ...records]);
      setCheckInData({ ...checkInData, staffId: '', note: '' });
    } catch (err) {
      showToast('Check-in failed. Session might already be active.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/attendance/check-out/${id}`);
      setRecords(records.map(r => r._id === id ? res.data : r));
    } catch (err) {
      showToast('Check-out failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>🛡️ Synchronizing Operational Registry...</div>;

  const activeBranchSession = records.find(r => r.type === 'Branch' && !r.checkOut);

  return (
    <div className="attendance-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>Site <span className="gradient-text">Operations</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Record clinical site opening times and track specialist presence.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Check-In Console */}
        <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Control <span className="gradient-text">Console</span></h3>
          
          <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>REGISTRY TYPE</label>
              <select 
                value={checkInData.type} 
                onChange={(e) => setCheckInData({...checkInData, type: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white' }}
              >
                <option value="Branch">🏥 Clinical Site (Open Branch)</option>
                <option value="Staff">👩‍⚕️ Clinical Specialist (Check-In Staff)</option>
              </select>
            </div>

            {checkInData.type === 'Staff' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>SPECIALIST</label>
                <select 
                  required
                  value={checkInData.staffId} 
                  onChange={(e) => setCheckInData({...checkInData, staffId: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white' }}
                >
                  <option value="">Select Staff</option>
                  {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            )}

            <div>
               <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>OPERATIONAL NOTE</label>
               <input 
                type="text" 
                value={checkInData.note} 
                onChange={(e) => setCheckInData({...checkInData, note: e.target.value})}
                placeholder="Session notes..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white' }} 
               />
            </div>

            <button 
              disabled={actionLoading}
              type="submit" 
              style={{ width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'white', fontWeight: 700, marginTop: '1rem' }}
            >
              {actionLoading ? 'Initializing...' : 'Confirm Check-In'}
            </button>
          </form>
        </div>

        {/* Live Registry */}
        <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Operational <span className="gradient-text">Registry</span></h3>
                {activeBranchSession && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>🏥 SITE OPEN SINCE {new Date(activeBranchSession.checkIn).toLocaleTimeString()}</span>
                        <button 
                            onClick={() => handleCheckOut(activeBranchSession._id)}
                            style={{ padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)', background: '#991b1b', color: 'white', fontSize: '0.7rem', fontWeight: 800 }}
                        >
                            CLOSE BRANCH
                        </button>
                    </div>
                )}
            </div>

            <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', background: '#f8fafc' }}>
                            <th style={{ padding: '1rem', fontSize: '0.75rem' }}>SUBJECT</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem' }}>SITE</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem' }}>CHECK-IN</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem' }}>CHECK-OUT</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem' }}>STATUS</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(record => (
                            <tr key={record._id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="table-row-hover">
                                <td style={{ padding: '1rem', fontWeight: 600 }}>{record.type === 'Branch' ? '🏥 Site Opening' : record.staffId?.name}</td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{record.branch?.name}</td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{new Date(record.checkIn).toLocaleTimeString()}</td>
                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '--'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ 
                                        padding: '0.25rem 0.6rem', 
                                        borderRadius: '1rem', 
                                        fontSize: '0.65rem', 
                                        fontWeight: 800,
                                        background: record.checkOut ? '#fee2e2' : '#dcfce7',
                                        color: record.checkOut ? '#991b1b' : '#166534'
                                    }}>
                                        {record.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {!record.checkOut && record.type === 'Staff' && (
                                        <button 
                                            onClick={() => handleCheckOut(record._id)}
                                            style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}
                                        >
                                            Check-Out
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}
