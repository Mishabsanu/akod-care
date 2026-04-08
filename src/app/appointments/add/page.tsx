'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Building,
  Search,
  UserCheck,
  AlertCircle,
  ChevronRight,
  MessageCircle,
  Stethoscope,
  Info,
  ClipboardList
} from 'lucide-react';
import api from '@/services/api';
import { usePCMSStore } from '@/store/useStore';

export default function BookAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const { user, showToast } = usePCMSStore();
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    type: 'Consultation',
    branch: user?.allAccess ? '' : (user?.branchId || ''),
    status: 'Booked',
    description: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isFieldFocused, setIsFieldFocused] = useState<string | null>(null);

  // -------------------------------------------------------------------
  // LOGIC | Multi-Identifier Search (Name, Phone, or Patient ID)
  // -------------------------------------------------------------------
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm)) ||
    (p.patientId && p.patientId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedPatient = patients.find(p => p._id === formData.patientId);

  // -------------------------------------------------------------------
  // SYNC | Fetch Clinical Registry Data for Dropdowns
  // -------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, branchesRes] = await Promise.all([
          api.get('/patients/dropdown'),
          api.get('/doctors/dropdown'),
          api.get('/branches')
        ]);
        setPatients(patientsRes.data);
        setDoctors(doctorsRes.data);
        setBranches(branchesRes.data);
      } catch (err) {
        console.error('🚫 Registry Error | Failed to fetch scheduling options:', err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedDoctor = doctors.find(d => d._id === formData.doctorId);

      const payload = {
        ...formData,
        patientName: selectedPatient?.name || 'Unknown Patient',
        doctorName: selectedDoctor?.name || 'Unknown Specialist'
      };

      await api.post('/appointments', payload);
      showToast('Clinical session successfully authorized.', 'success');
      router.push('/appointments');
    } catch (err) {
      console.error('🚫 Scheduling Error | Failed to authorize appointment:', err);
      showToast('Booking failed. Please check medical scheduling data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.patientId && formData.date && formData.time && formData.branch;

  return (
    <div className="book-appointment-container animate-fade-in clinical-form-wide" style={{ paddingBottom: '9rem' }}>

      {/* 🏥 CLINICAL HEADER */}
      <div style={{ marginBottom: '3rem' }}>
        <button
          onClick={() => router.back()}
          style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, background: 'rgba(15, 118, 110, 0.08)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}
        >
          <ArrowLeft size={16} /> DashBoard
        </button>
        <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>New Clinical <span className="gradient-text">Booking</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Orchestrate a medical session between a specialist and patient.</p>
      </div>

      <form onSubmit={handleSubmit} className="clinical-form-card" style={{ opacity: loading ? 0.7 : 1 }}>
        <div className="clinical-form-grid">

          {/* Section 1: Patient Identification (Simplified UX) */}
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
              Patient <span className="gradient-text">Selection</span>
            </h3>
          </div>

          <div className="col-12" style={{ marginBottom: '2rem' }}>
            <label className="label-premium" style={{ marginBottom: '0.75rem', display: 'block' }}>Search Clinical Registry <span style={{ color: '#ef4444' }}>*</span></label>

            {!formData.patientId ? (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={18} style={{ position: 'absolute', left: '1.25rem', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="input-premium"
                    style={{ paddingLeft: '3rem', height: '52px', fontSize: '1rem' }}
                    placeholder="Search File (Name / Phone / Patient ID)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {searchTerm && (
                  <div className="animate-fade-in" style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    background: 'white',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
                    maxHeight: '280px',
                    overflowY: 'auto'
                  }}>
                    {filteredPatients.map(p => (
                      <div
                        key={p._id}
                        onClick={() => {
                          setFormData({ ...formData, patientId: p._id });
                          setSearchTerm('');
                        }}
                        className="table-row-hover"
                        style={{
                          padding: '1rem 1.5rem',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'var(--transition-smooth)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                           <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(15, 118, 110, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                              {p.name?.[0]}
                           </div>
                           <div>
                             <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</span>
                             <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>— {p.phone}</span>
                           </div>
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', padding: '0.25rem 0.5rem', background: 'rgba(15, 118, 110, 0.05)', borderRadius: '4px' }}>Sync File</span>
                      </div>
                    ))}
                    {filteredPatients.length === 0 && (
                      <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No results found. <button type="button" onClick={() => router.push('/patients/add')} style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline' }}>+ Add Patient</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-fade-in" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'white',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', boxShadow: '0 6px 12px rgba(15, 118, 110, 0.2)' }}>
                    {selectedPatient?.name?.[0]}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.1rem' }}>
                       <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem', letterSpacing: '-0.01em' }}>{selectedPatient?.name}</p>
                       <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '2rem' }}>VERIFIED FILE</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Selected Record: {selectedPatient?.phone} • [#{selectedPatient?.patientId || 'N/A'}]</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, patientId: '' })}
                  style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', background: 'white', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', border: '2px solid #ef4444', transition: 'var(--transition-smooth)' }}
                >
                  CHANGE FILE
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Clinical Details */}
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
            <Calendar size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Booking <span className="gradient-text">Logistics</span>
            </h3>
          </div>

          <div className="col-4">
            <label className="label-premium">Clinical Category</label>
            <select className="input-premium" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              <option value="Consultation">Clinical Consultation</option>
              <option value="Therapy Session">Manual Therapy Session</option>
              <option value="Follow-up">Diagnostic Follow-up</option>
              <option value="Rehabilitation">Post-Op Rehabilitation</option>
            </select>
          </div>
          <div className="col-4">
            <label className="label-premium">Medical Specialist</label>
            <select className="input-premium" value={formData.doctorId} onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}>
              <option value="">Select Specialist (Optional)</option>
              {doctors.map(d => <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>)}
            </select>
          </div>
          {user?.allAccess && (
            <div className="col-4">
              <label className="label-premium">Clinical Site <span style={{ color: '#ef4444' }}>*</span></label>
              <select required className="input-premium" value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })}>
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          )}

          <div className="col-6">
            <label className="label-premium">Scheduled Date <span style={{ color: '#ef4444' }}>*</span></label>
            <input required type="date" className="input-premium" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
          </div>
          <div className="col-6">
            <label className="label-premium">Scheduled Time <span style={{ color: '#ef4444' }}>*</span></label>
            <input required type="time" className="input-premium" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
          </div>

          {/* Section 3: Conclusion / Remarks */}
          <div className="col-12" style={{ 
              margin: '3rem 0 1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              background: 'linear-gradient(90deg, rgba(15, 118, 110, 0.05) 0%, transparent 100%)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--primary)'
          }}>
            <MessageCircle size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Clinical <span className="gradient-text">Remarks</span>
            </h3>
          </div>

          <div className="col-12">
            <label className="label-premium">Conclusions / Clinical Notes</label>
            <textarea
              className="textarea-premium"
              placeholder="Add final clinical notes, session specific requirements, or patient history context..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <p className="remarks-subtitle">Provide critical medical context for the clinician.</p>
          </div>

          {/* Action Row */}
          <div className="col-12" style={{ display: 'flex', gap: '1.25rem', justifyContent: 'flex-end', marginTop: '3rem' }}>
            <button
              type="button"
              disabled={loading}
              onClick={() => router.back()}
              style={{ padding: '0.85rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontWeight: 600, background: 'white' }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!isFormValid || loading}
              style={{
                padding: '0.85rem 3.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary)',
                color: 'white',
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)',
                opacity: !isFormValid ? 0.5 : 1
              }}
            >
              {loading ? 'AUTHORIZING...' : 'AUTHORIZE BOOKING'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
