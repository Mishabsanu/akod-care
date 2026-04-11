'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import { usePCMSStore } from '@/store/useStore';
import api from '@/services/api';

interface Service {
  _id: string; // Mongoose ID
  name: string;
  category: string;
  price: number;
  branches: { _id: string; name: string }[]; // Populated branches
  status: 'Available' | 'Archived';
}

export default function ServicesPage() {
  const router = useRouter();
  const { selectedBranchId, isLoading: storeLoading, showToast, showConfirm } = usePCMSStore();
  const [services, setServices] = useState<Service[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  // -------------------------------------------------------------------
  // SYNC | Clinical Services Data from Backend
  // -------------------------------------------------------------------
  const handleDeleteService = (service: Service) => {
    showConfirm(
      'Remove Clinical Service',
      `⚠️ WARNING: You are about to purge treatment ${service.name} from the clinical registry. Continue?`,
      async () => {
        try {
          await api.delete(`/services/${service._id}`);
          showToast('Clinical service successfully removed.', 'success');
          // Refresh list
          const res = await api.get('/services');
          setServices(Array.isArray(res.data) ? res.data : (res.data?.data || []));
        } catch (err) {
          console.error('🚫 Registry Error | Deletion failed:', err);
          showToast('Failed to remove service. Check for linked clinical records.', 'error');
        }
      },
      true
    );
  };

  // Backend Pagination State
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const fetchServices = async () => {
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

      const res = await api.get(`/services?${params.toString()}`);
      
      if (res.data && typeof res.data.total !== 'undefined') {
          setServices(Array.isArray(res.data) ? res.data : (res.data?.data || []));
          setTotalRecords(res.data.total);
      } else {
          setServices(Array.isArray(res.data) ? res.data : (res.data?.data || []));
          setTotalRecords(res.data.length);
      }
    } catch (err) {
      console.error('🚫 Registry Error | Failed to fetch clinical services:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedBranchId, currentPage, pageSize, searchQuery, activeFilters]);

  const columns = [
    { header: 'SERVICE NAME', key: 'name' as keyof Service, style: { fontWeight: 600, color: 'var(--primary)' } },
    { header: 'CATEGORY', key: 'category' as keyof Service, style: { fontSize: '0.85rem' } },
    { 
      header: 'PRICE (₹)', 
      key: (s: Service) => (
        <span style={{ fontWeight: 700 }}>₹{s.price.toLocaleString()}</span>
      ) 
    },
    { 
      header: 'AVAILABLE AT', 
      key: (s: any) => (
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          {s.branches?.length > 0 
            ? s.branches.map((b: any) => b.name).join(', ') 
            : 'Global Access'}
        </span>
      )
    },
    { 
      header: 'STATUS', 
      key: (s: Service) => (
        <span style={{ 
          background: s.status === 'Available' ? '#dcfce7' : '#f1f5f9',
          color: s.status === 'Available' ? '#166534' : '#64748b',
          padding: '0.35rem 0.85rem', 
          borderRadius: '1rem', 
          fontSize: '0.75rem', 
          fontWeight: 600 
        }}>
          {s.status}
        </span>
      ) 
    },
  ];

  return (
    <div className="services-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>Clinical <span className="gradient-text">Services</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage treatment definitions, pricing, and branch availability.</p>
        </div>
        <button 
          onClick={() => router.push('/services/add')}
          style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
        >
          Add Service
        </button>
      </div>

        <DataTable 
          data={services.map(s => ({ ...s, id: s._id }))} // Adapt Mongoose _id to DataTable id
          columns={columns}
          searchPlaceholder="Search by service name..."
          onView={(s) => router.push(`/services/${s._id}`)}
          onEdit={(s) => router.push(`/services/${s._id}/edit`)}
          onDelete={handleDeleteService}
          filterableFields={[
            { label: 'Status', key: 'status' as keyof Service, options: ['Available', 'Archived'] }
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
