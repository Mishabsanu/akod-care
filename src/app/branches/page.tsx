'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import api from '@/services/api';
import { usePCMSStore } from '@/store/useStore';

interface Branch {
  _id: string;
  name: string;
  address: string;
  phone: string;
  staffCount: number;
  status: 'Active' | 'Setup In-Progress';
}

export default function BranchesPage() {
  const router = useRouter();
  const { showToast, showConfirm } = usePCMSStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteBranch = (branch: Branch) => {
    showConfirm(
      'Remove Clinical Site',
      `⚠️ WARNING: You are about to purge site ${branch.name} from the clinical network. All linked records may be affected. Continue?`,
      async () => {
        try {
          await api.delete(`/branches/${branch._id}`);
          showToast('Clinical site successfully removed.', 'success');
          // Refresh list
          const res = await api.get('/branches');
          setBranches(Array.isArray(res.data) ? res.data : (res.data?.data || []));
        } catch (err) {
          console.error('🚫 Registry Error | Deletion failed:', err);
          showToast('Failed to remove clinical site. Ensure no active personnel or patients are linked.', 'error');
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

  const fetchBranches = async () => {
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

      const res = await api.get(`/branches?${params.toString()}`);
      
      if (res.data && typeof res.data.total !== 'undefined') {
          setBranches(res.data.data);
          setTotalRecords(res.data.total);
      } else {
          setBranches(Array.isArray(res.data) ? res.data : (res.data?.data || []));
          setTotalRecords(res.data.length);
      }
    } catch (err) {
      console.error('🚫 Registry Error | Failed to fetch clinical branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [currentPage, pageSize, searchQuery, activeFilters]);

  const columns = [
    { header: 'BRANCH NAME', key: 'name' as keyof Branch, style: { fontWeight: 600, color: 'var(--primary)' } },
    { header: 'LOCATION', key: 'address' as keyof Branch, style: { fontSize: '0.85rem' } },
    { header: 'CONTACT', key: 'phone' as keyof Branch, style: { fontSize: '0.85rem', color: 'var(--text-muted)' } },
    { 
      header: 'STAFF', 
      key: (b: Branch) => (
        <span style={{ fontWeight: 600 }}>{b.staffCount} Specialists</span>
      ) 
    },
    { 
      header: 'STATUS', 
      key: (b: Branch) => (
        <span style={{ 
          background: b.status === 'Active' ? '#dcfce7' : '#fef9c3',
          color: b.status === 'Active' ? '#166534' : '#854d0e',
          padding: '0.35rem 0.85rem', 
          borderRadius: '1rem', 
          fontSize: '0.75rem', 
          fontWeight: 600 
        }}>
          {b.status}
        </span>
      ) 
    },
  ];

  return (
    <div className="branches-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>Branch <span className="gradient-text">Network</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage physical clinical locations and staff allocation.</p>
        </div>
        <button 
          onClick={() => router.push('/branches/add')}
          style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
        >
          Add Branch
        </button>
      </div>

        <DataTable 
          data={branches.map(b => ({ ...b, id: b._id }))}
          columns={columns}
          searchPlaceholder="Search by site name or location..."
          onEdit={(b) => router.push(`/branches/${b._id}/edit`)}
          onDelete={handleDeleteBranch}
          filterableFields={[
            { label: 'Status', key: 'status' as keyof Branch, options: ['Active', 'Setup In-Progress'] }
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
