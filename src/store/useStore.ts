import { create } from 'zustand';
import api from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  roleName: string;
  permissions: string[];
  branchId: string;
  allAccess: boolean;
}

interface PCMSState {
  user: User | null;
  selectedBranchId: string | null;
  allBranches: any[];
  isLoading: boolean;
  isSyncing: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' | null };
  confirmDialog: { isOpen: boolean; title: string; message: string; onConfirm: () => void; isDanger?: boolean };
  
  
  setUser: (user: User | null) => void;
  setSelectedBranchId: (branchId: string) => void;
  fetchInitialData: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  setIsSyncing: (syncing: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, isDanger?: boolean) => void;
  closeConfirm: () => void;
  logout: () => Promise<void>;
}

export const usePCMSStore = create<PCMSState>((set, get) => ({
  user: null,
  selectedBranchId: null,
  allBranches: [],
  isLoading: false,
  isSyncing: false,
  toast: { message: '', type: null },
  confirmDialog: { isOpen: false, title: '', message: '', onConfirm: () => {}, isDanger: false },

  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: { message: '', type: null } }), 4000);
  },
  showConfirm: (title, message, onConfirm, isDanger = true) => {
    set({ confirmDialog: { isOpen: true, title, message, onConfirm, isDanger } });
  },
  closeConfirm: () => {
    set((state) => ({ confirmDialog: { ...state.confirmDialog, isOpen: false } }));
  },

  setUser: (user) => {
    set({ user });
    if (user && !user.allAccess) {
        set({ selectedBranchId: user.branchId });
        sessionStorage.setItem('selectedBranchId', user.branchId);
    }
  },

  setSelectedBranchId: (branchId) => {
    set({ selectedBranchId: branchId });
    if (branchId) {
      sessionStorage.setItem('selectedBranchId', branchId);
    } else {
      sessionStorage.removeItem('selectedBranchId');
    }
  },

  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [userRes, branchesRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/branches?limit=1000')
      ]);

      const branches = branchesRes.data.data || branchesRes.data;
      set({ allBranches: branches });

      if (userRes.data.user) {
        const user = userRes.data.user;
        set({ user });
        
        // Default branch selection logic
        // Owners (allAccess) ALWAYS default to GLOBAL (null) for total clinic oversight
        // Staff are strictly locked to their assigned branchId
        if (user.allAccess) {
            set({ selectedBranchId: null });
            sessionStorage.removeItem('selectedBranchId'); // Clear any previous specific selection
        } else {
            set({ selectedBranchId: user.branchId });
            sessionStorage.setItem('selectedBranchId', user.branchId);
        }
      }
    } catch (err) {
      console.error('🚫 Clinical State Error | Failed to synchronize profile:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('selectedBranchId');
      set({ user: null, selectedBranchId: null });
      window.location.href = '/login';
    } catch (err) {
      console.error('🚫 Logout Error:', err);
    }
  }
}));
