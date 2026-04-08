'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import { usePCMSStore } from '@/store/useStore';
import api from '@/services/api';

interface Appointment {
  _id: string;
  patientId: { name: string; phone: string };
  doctorId: { name: string; specialization: string };
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
  branch: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { selectedBranchId, isLoading: storeLoading, showToast, showConfirm, setIsSyncing } = usePCMSStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  // -------------------------------------------------------------------
  // SYNC | Fetch Clinical Appointment Registry
  // -------------------------------------------------------------------
  const fetchAppointments = async () => {
    setLocalLoading(true);
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error('🚫 Registry Error | Failed to fetch appointments:', err);
      showToast('Failed to load clinical scheduler.', 'error');
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedBranchId]);

  const handleDeleteAppointment = (appointment: Appointment) => {
    showConfirm(
      'Cancel & Purge Appointment',
      `⚠️ WARNING: You are about to cancel and purge the clinical booking for ${appointment.patientId?.name || appointment.patientName}. Proceed?`,
      async () => {
        setIsSyncing(true);
        try {
          await api.delete(`/appointments/${appointment._id}`);
          showToast('Appointment successfully cancelled.', 'success');
          fetchAppointments();
        } catch (err) {
          console.error('🚫 Registry Error | Cancellation failed:', err);
          showToast('Failed to cancel appointment.', 'error');
        } finally {
          setIsSyncing(false);
        }
      },
      true
    );
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.put(`/appointments/${id}`, { status: newStatus });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus as any } : a));
      showToast(`Booking marked as ${newStatus}.`, 'success');
    } catch (err) {
      console.error('🚫 Registry Error | Failed to update clinical status:', err);
      showToast('Status update failed.', 'error');
    }
  };

  const handleSendReminder = async (id: string) => {
    try {
      await api.post(`/appointments/${id}/reminder`);
      showToast('🔔 WhatsApp reminder dispatched successfully.', 'success');
    } catch (err) {
      console.error('🚫 Gateway Error | Failed to dispatch reminder:', err);
      showToast('Failed to send reminder. Check patient contact details.', 'error');
    }
  };

  const columns = [
    { 
      header: 'PATIENT NAME', 
      key: (a: Appointment) => (
        <div>
          <p style={{ fontWeight: 600, color: 'var(--primary)' }}>{a.patientId?.name || a.patientName || 'Deleted'}</p>
          <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>{a.patientId?.phone}</p>
        </div>
      )
    },
    { 
      header: 'SPECIALIST', 
      key: (a: Appointment) => (
        <div>
          <p style={{ fontWeight: 600 }}>{a.doctorId?.name || a.doctorName || 'Deleted'}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{a.doctorId?.specialization}</p>
        </div>
      )
    },
    { 
      header: 'SCHEDULE', 
      key: (a: Appointment) => (
        <div>
          <p style={{ fontWeight: 600 }}>{new Date(a.date).toLocaleDateString()}</p>
          <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>{a.time}</p>
        </div>
      )
    },
    { header: 'CATEGORY', key: 'type' as keyof Appointment, style: { fontSize: '0.8rem', fontWeight: 600 } },
    { 
      header: 'STATUS', 
      key: (a: Appointment) => (
        <span style={{ 
          background: a.status === 'Confirmed' ? '#dcfce7' : a.status === 'Scheduled' ? '#f1f5f9' : '#fef9c3',
          color: a.status === 'Confirmed' ? '#166534' : a.status === 'Scheduled' ? '#64748b' : '#854d0e',
          padding: '0.35rem 0.85rem', 
          borderRadius: '1rem', 
          fontSize: '0.75rem', 
          fontWeight: 600 
        }}>
          {a.status}
        </span>
      ) 
    },
    {
      header: 'QUICK ACTIONS',
      key: (a: Appointment) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {a.status === 'Scheduled' && (
            <button 
              onClick={() => handleSendReminder(a._id)}
              style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}
            >
              Remind
            </button>
          )}
          {a.status !== 'Completed' && (
            <button 
              onClick={() => handleStatusUpdate(a._id, 'Completed')}
              style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--primary)', color: 'white', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}
            >
              Done
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="appointments-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>Clinical <span className="gradient-text">Scheduler</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Coordinate medical sessions, specialist availability, and site assignments.</p>
        </div>
        <button 
          onClick={() => router.push('/appointments/add')}
          style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
        >
          Book Appointment
        </button>
      </div>

        <DataTable 
          data={appointments.map(a => ({ ...a, id: a._id }))}
          columns={columns}
          searchPlaceholder="Search scheduler names..."
          onEdit={(a) => router.push(`/appointments/${a._id}/edit`)}
          onDelete={handleDeleteAppointment}
          filterableFields={[
            { label: 'Status', key: 'status' as keyof Appointment, options: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'] }
          ]}
        />
    </div>
  );
}
