'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import { usePCMSStore } from '@/store/useStore';
import api from '@/services/api';

import { generateInvoicePDF } from '@/utils/pdfGenerator';

interface Invoice {
  _id: string;
  id: string; // Dynamic clinical ID
  patientId: { name: string; phone?: string };
  date: string;
  items: any[];
  subtotal: number;
  discount: number;
  tax: number;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Partially Paid';
  branch: { _id: string; name: string; address?: string; phone?: string }; // Populated branch
}

export default function BillingPage() {
  const router = useRouter();
  const { selectedBranchId, isLoading: storeLoading, showToast, showConfirm } = usePCMSStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  // Backend Pagination State
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const fetchInvoices = async () => {
    setLocalLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString()
      });
      if (searchQuery) params.append('search', searchQuery);
      
      Object.entries(activeFilters).forEach(([key, values]) => {
        if (values && values.length > 0) {
            params.append(key, values[0]);
        }
      });

      const res = await api.get(`/invoices?${params.toString()}`);
      
      if (res.data && typeof res.data.total !== 'undefined') {
          setInvoices(res.data.data);
          setTotalRecords(res.data.total);
      } else {
          setInvoices(res.data);
          setTotalRecords(res.data.length);
      }
    } catch (err) {
      console.error('🚫 Registry Error | Failed to fetch invoices:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  // -------------------------------------------------------------------
  // SYNC | Fetch Clinical Financial Registry
  // -------------------------------------------------------------------
  useEffect(() => {
    fetchInvoices();
  }, [selectedBranchId, currentPage, pageSize, searchQuery, activeFilters]);

  const handleDownloadPDF = (i: Invoice) => {
    generateInvoicePDF({
        id: i.id,
        patientName: i.patientId?.name || 'Unknown Patient',
        patientPhone: i.patientId?.phone,
        date: i.date,
        items: i.items || [],
        subtotal: i.subtotal || i.amount,
        discount: i.discount || 0,
        tax: i.tax || 0,
        amount: i.amount,
        branchName: i.branch?.name || 'Main',
        branchAddress: i.branch?.address,
        branchPhone: i.branch?.phone
    });
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.put(`/invoices/${id}`, { status: newStatus });
      setInvoices(prev => prev.map(inv => inv._id === id ? { ...inv, status: newStatus as any } : inv));
      showToast(`Invoice marked as ${newStatus}.`, 'success');
    } catch (err) {
      console.error('🚫 Financial Error | Failed to update clinical record:', err);
      showToast('Status update failed.', 'error');
    }
  };

  const handleDeleteInvoice = (i: Invoice) => {
    showConfirm(
      'Erase Financial Record',
      `⚠️ WARNING: Permanent erasure of invoice ${i.id}. Continue?`,
      async () => {
        try {
          await api.delete(`/invoices/${i._id}`);
          showToast('Invoice deleted successfully.', 'success');
          // Refresh
          const res = await api.get('/invoices');
          setInvoices(res.data);
        } catch (err) {
          console.error('🚫 Ledger Error | Deletion failed:', err);
          showToast('Failed to delete invoice.', 'error');
        }
      },
      true
    );
  };

  const columns = [
    { header: 'INVOICE #', key: 'id' as keyof Invoice, style: { fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.02em' } },
    { header: 'PATIENT', key: (i: Invoice) => i.patientId?.name || 'Unknown', style: { fontWeight: 600 } },
    { header: 'DATE', key: (i: Invoice) => new Date(i.date).toLocaleDateString(), style: { fontSize: '0.85rem' } },
    { 
      header: 'AMOUNT', 
      key: (i: Invoice) => (
        <span style={{ fontWeight: 700 }}>₹{i.amount.toLocaleString()}</span>
      ) 
    },
    { 
      header: 'STATUS', 
      key: (i: Invoice) => (
        <span style={{ 
          background: i.status === 'Paid' ? '#dcfce7' : i.status === 'Unpaid' ? '#fee2e2' : '#fef9c3',
          color: i.status === 'Paid' ? '#166534' : i.status === 'Unpaid' ? '#991b1b' : '#854d0e',
          padding: '0.35rem 0.85rem', 
          borderRadius: '1rem', 
          fontSize: '0.75rem', 
          fontWeight: 700 
        }}>
          {i.status.toUpperCase()}
        </span>
      ) 
    },
    {
      header: 'ACTIONS',
      key: (i: Invoice) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => handleDownloadPDF(i)}
            style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}
          >
            PDF
          </button>
          {i.status !== 'Paid' && (
            <button 
              onClick={() => handleStatusUpdate(i._id, 'Paid')}
              style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', background: '#166534', color: 'white', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}
            >
              Pay
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="billing-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>Financial <span className="gradient-text">Ledger</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage clinical invoicing, medical billing, and multi-branch revenue tracking.</p>
        </div>
        <button 
          onClick={() => router.push('/billing/generate')}
          style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
        >
          Generate Invoice
        </button>
      </div>

        <DataTable 
          data={invoices.map(i => ({ ...i, id: i._id }))}
          columns={columns}
          searchPlaceholder="Search by patient or invoice #..."
          onEdit={(i) => router.push(`/billing/${i._id}/edit`)}
          onDelete={handleDeleteInvoice}
          filterableFields={[
            { label: 'Payment Status', key: 'status' as keyof Invoice, options: ['Paid', 'Unpaid', 'Partially Paid'] }
          ]}
          serverPagination={{
            totalRecords,
            currentPage,
            pageSize,
            onPageChange: setCurrentPage,
            onSearchChange: (s) => { setSearchQuery(s); setCurrentPage(1); },
            onFilterChange: (f) => { setActiveFilters(f); setCurrentPage(1); }
          }}
        />
    </div>
  );
}
