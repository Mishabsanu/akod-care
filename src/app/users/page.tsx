'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import api from '@/services/api';
import { usePCMSStore } from '@/store/useStore';

interface User {
  _id: string;
  name: string;
  email: string;
  role: { _id: string; name: string }; // Populated role
  branch: { _id: string; name: string }; // Populated branch
  status: 'Active' | 'Inactive';
}

export default function UsersPage() {
  const router = useRouter();
  const { showToast, showConfirm } = usePCMSStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteUser = (user: User) => {
    showConfirm(
      'Revoke System Access',
      `⚠️ WARNING: You are about to revoke system access for ${user.name}. All assigned clinical tasks may be affected. Continue?`,
      async () => {
        try {
          await api.delete(`/users/${user._id}`);
          showToast('Clinical specialist access revoked.', 'success');
          // Refresh list
          const res = await api.get('/users');
          setUsers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
        } catch (err) {
          console.error('🚫 Registry Error | Deletion failed:', err);
          showToast('Failed to revoke access. Ensure you have administrative authorization.', 'error');
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

  const fetchUsers = async () => {
    setLoading(true);
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

      const res = await api.get(`/users?${params.toString()}`);
      
      if (res.data && typeof res.data.total !== 'undefined') {
          setUsers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
          setTotalRecords(res.data.total);
      } else {
          setUsers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
          setTotalRecords(res.data.length);
      }
    } catch (err) {
      console.error('🚫 Registry Error | Failed to fetch clinical users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchQuery, activeFilters]);

  const columns = [
    { header: 'SPECIALIST NAME', key: 'name' as keyof User, style: { fontWeight: 600, color: 'var(--primary)' } },
    { header: 'EMAIL', key: 'email' as keyof User, style: { fontSize: '0.85rem' } },
    { 
      header: 'CLINICAL ROLE', 
      key: (u: User) => (
        <span style={{ 
          background: 'rgba(15, 118, 110, 0.1)', 
          color: 'var(--primary)', 
          padding: '0.3rem 0.75rem', 
          borderRadius: '0.5rem', 
          fontSize: '0.75rem', 
          fontWeight: 700 
        }}>
          {u.role?.name || 'Unassigned'}
        </span>
      ) 
    },
    { 
      header: 'ASSIGNED BRANCH', 
      key: (u: User) => (
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          {u.branch?.name || 'Global Access'}
        </span>
      )
    },
    { 
      header: 'STATUS', 
      key: (u: User) => (
        <span style={{ 
          background: u.status === 'Active' ? '#dcfce7' : '#f1f5f9',
          color: u.status === 'Active' ? '#166534' : '#64748b',
          padding: '0.35rem 0.85rem', 
          borderRadius: '1rem', 
          fontSize: '0.75rem', 
          fontWeight: 600 
        }}>
          {u.status}
        </span>
      ) 
    },
  ];

  return (
    <div className="users-container animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', letterSpacing: '-0.01em' }}>Staff <span className="gradient-text">Management</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Orchestrate clinical personnel, specialists, and role-based authorizations.</p>
        </div>
        <button 
          onClick={() => router.push('/users/add')}
          style={{ background: 'var(--primary)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
        >
          Onboard User
        </button>
      </div>

        <DataTable 
          data={users.map(u => ({ ...u, id: u._id }))}
          columns={columns}
          searchPlaceholder="Search by name, email..."
          onView={(u) => router.push(`/users/${u._id}`)}
          onEdit={(u) => router.push(`/users/${u._id}/edit`)}
          onDelete={handleDeleteUser}
          filterableFields={[
            { label: 'Status', key: 'status' as keyof User, options: ['Active', 'Inactive'] }
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
