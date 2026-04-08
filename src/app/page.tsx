'use client'
import React, { useState } from 'react';
import { usePCMSStore } from '@/store/useStore';
import FinancialWidget from '@/components/dashboard/FinancialWidget';
import AppointmentsWidget from '@/components/dashboard/AppointmentsWidget';
import InventoryWidget from '@/components/dashboard/InventoryWidget';
import AttendanceWidget from '@/components/dashboard/AttendanceWidget';

export default function Dashboard() {
  const { isLoading } = usePCMSStore();
  const [filter, setFilter] = useState('Today'); // 'Today', 'Week', 'Month', 'Year', 'Custom'
  const [customDates, setCustomDates] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Calculate Date Parameters to pass down to Components
  const getFilterParams = () => {
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
    return params;
  };

  if (isLoading) {
    return (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            🛡️ Initializing Clinical Desktop...
        </div>
    );
  }

  const filterParams = getFilterParams();

  return (
    <div className="dashboard-container animate-fade-in" style={{ paddingBottom: '5rem' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Module 1: Financial & Network Intelligence */}
          <FinancialWidget filterParams={filterParams} />

          {/* Module 2: Staff & Inventory Operations (NEW DATA WIDGETS) */}
          <div className="visualization-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <AttendanceWidget filterParams={filterParams} />
              <InventoryWidget />
          </div>

          {/* Module 3: Clinical Traffic / Appointments */}
          <AppointmentsWidget filterParams={filterParams} />
      </div>

    </div>
  );
}
