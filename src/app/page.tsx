'use client'
import React, { useState, useEffect } from 'react';
import { usePCMSStore } from '@/store/useStore';
import api from '@/services/api';

export default function Dashboard() {
  const { selectedBranchId, isLoading: storeLoading } = usePCMSStore();
  const [stats, setStats] = useState<any>(null);
  const [opStatus, setOpStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Today'); // 'Today', 'Week', 'Month', 'Year', 'Custom'
  const [customDates, setCustomDates] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // -------------------------------------------------------------------
  // SYNC | Fetch Clinical Intelligence Data
  // -------------------------------------------------------------------
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        let params: any = {};
        const now = new Date();
        
        if (filter === 'Today') {
            const start = new Date(now.setHours(0,0,0,0));
            params.startDate = start.toISOString();
        } else if (filter === 'Week') {
            const start = new Date(now.setDate(now.getDate() - 7));
            params.startDate = start.toISOString();
        } else if (filter === 'Month') {
            const start = new Date(now.setMonth(now.getMonth() - 1));
            params.startDate = start.toISOString();
        } else if (filter === 'Year') {
            const start = new Date(now.setFullYear(now.getFullYear() - 1));
            params.startDate = start.toISOString();
        } else if (filter === 'Custom') {
            params.startDate = new Date(customDates.start).toISOString();
            params.endDate = new Date(customDates.end).toISOString();
        }

        const [statsRes, opRes] = await Promise.all([
          api.get('/stats/dashboard', { params }),
          api.get('/attendance/status')
        ]);
        setStats(statsRes.data || null);
        setOpStatus(opRes.data || null);
      } catch (err) {
        console.error('🚫 Analytics Error | Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedBranchId, filter, customDates]);

  if (loading || storeLoading) {
    return (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            🛡️ Synchronizing Clinical Intelligence...
        </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>Clinical <span className="gradient-text">Overview</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time operational intelligence across your medical network.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {filter === 'Custom' && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <input type="date" value={customDates.start} onChange={(e) => setCustomDates({...customDates, start: e.target.value})} style={{ border: 'none', background: 'transparent', fontSize: '0.8rem', fontWeight: 600 }} />
                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>→</span>
                <input type="date" value={customDates.end} onChange={(e) => setCustomDates({...customDates, end: e.target.value})} style={{ border: 'none', background: 'transparent', fontSize: '0.8rem', fontWeight: 600 }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>REPORT PERIOD:</span>
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'white', fontWeight: 700, fontSize: '0.85rem' }}
                >
                    <option value="Today">Today</option>
                    <option value="Week">Last 7 Days</option>
                    <option value="Month">Last 30 Days</option>
                    <option value="Year">Past Year</option>
                    <option value="Custom">Custom Range</option>
                    <option value="All">All Time</option>
                </select>
            </div>
        </div>
      </div>

      {/* Primary Highlights Registry */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{filter.toUpperCase()} EARNINGS</p>
          <h2 style={{ fontSize: '1.4rem', marginTop: '0.5rem', color: 'var(--primary)' }}>₹{stats?.summary?.totalRevenue?.toLocaleString() || '0'}</h2>
          <p style={{ fontSize: '0.6rem', color: '#16a34a', fontWeight: 700, marginTop: '0.25rem' }}>Gross Revenue</p>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>TOTAL EXPENSES</p>
          <h2 style={{ fontSize: '1.4rem', marginTop: '0.5rem', color: '#ef4444' }}>₹{stats?.summary?.totalExpenses?.toLocaleString() || '0'}</h2>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>Operational Cost</p>
        </div>
        <div className="card" style={{ 
            padding: '1.25rem', 
            borderLeft: `4px solid ${stats?.summary?.totalProfit >= 0 ? '#10b981' : '#f43f5e'}`,
            background: stats?.summary?.totalProfit >= 0 ? 'rgba(16, 185, 129, 0.02)' : 'rgba(244, 63, 94, 0.02)'
        }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>NET PROFIT</p>
          <h2 style={{ 
              fontSize: '1.4rem', 
              marginTop: '0.5rem', 
              color: stats?.summary?.totalProfit >= 0 ? '#10b981' : '#f43f5e' 
          }}>
              ₹{stats?.summary?.totalProfit?.toLocaleString() || '0'}
          </h2>
          <p style={{ 
              fontSize: '0.6rem', 
              color: stats?.summary?.totalProfit >= 0 ? '#10b981' : '#f43f5e', 
              fontWeight: 800, 
              marginTop: '0.25rem' 
          }}>
              {stats?.summary?.totalProfit >= 0 ? '↑ Surplus' : '↓ Deficit'}
          </p>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #6366f1' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>APPOINTMENTS</p>
          <h2 style={{ fontSize: '1.4rem', marginTop: '0.5rem' }}>{stats?.summary?.totalAppointments || '0'}</h2>
          <p style={{ fontSize: '0.6rem', color: '#6366f1', fontWeight: 700, marginTop: '0.25rem' }}>Slot Usage</p>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>NEW PATIENTS</p>
          <h2 style={{ fontSize: '1.4rem', marginTop: '0.5rem' }}>{stats?.summary?.totalPatients || '0'}</h2>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>Files Opened</p>
        </div>
      </div>

      <div className="visualization-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Revenue Performance Index */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '2rem' }}>Financial <span className="gradient-text">Trends</span></h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '220px', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
             {!stats?.trends || stats.trends.length === 0 ? (
                 <div style={{ width: '100%', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>No data available for this period.</div>
             ) : stats.trends.map((data: any) => (
                <div key={data.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                        width: '100%', 
                        background: 'var(--primary)', 
                        height: `${(data.value / Math.max(...stats.trends.map((t: any) => t.value || 1))) * 100}%`,
                        borderRadius: '0.25rem 0.25rem 0 0',
                        minHeight: '4px',
                        transition: 'height 0.8s ease'
                    }} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', transform: 'rotate(-45deg)', marginTop: '0.5rem' }}>{data.name}</span>
                </div>
             ))}
          </div>
        </div>

        {/* Clinical Distribution Portfolio */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '2rem' }}>Status <span className="gradient-text">Share</span></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
             {!stats?.distribution || stats.distribution.length === 0 ? (
                 <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>No records found.</div>
             ) : stats.distribution.map((s: any) => (
                 <div key={s.status}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                        <span>{s.status}</span>
                        <span style={{ color: 'var(--primary)' }}>{stats?.summary?.totalAppointments ? Math.round((s.count / stats.summary.totalAppointments) * 100) : 0}%</span>
                    </div>
                    <div style={{ height: '0.5rem', background: '#f1f5f9', borderRadius: '1rem', overflow: 'hidden' }}>
                        <div style={{ 
                            width: `${stats?.summary?.totalAppointments ? (s.count / stats.summary.totalAppointments) * 100 : 0}%`, 
                            height: '100%', 
                            background: 'var(--primary)',
                            transition: 'width 0.8s ease'
                        }} />
                    </div>
                 </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
