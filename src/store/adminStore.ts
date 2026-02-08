import { create } from "zustand";

interface Stats {
  totalUsers: number;
  activeSubscribers: number;
  totalProjects: number;
  totalOutputs: number;
  totalCreditsUsed: number;
  totalCreditsAvailable: number;
  creditUsagePercentage: number;
  avgCreditsPerUser: number;
  usersNearLimit: number;
  revenueMonthly: number;
}

interface AdminState {
  stats: Stats;
  loading: boolean;
  setStats: (stats: Stats) => void;
  setLoading: (loading: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: {
    totalUsers: 0,
    activeSubscribers: 0,
    totalProjects: 0,
    totalOutputs: 0,
    totalCreditsUsed: 0,
    totalCreditsAvailable: 0,
    creditUsagePercentage: 0,
    avgCreditsPerUser: 0,
    usersNearLimit: 0,
    revenueMonthly: 0,
  },
  loading: true,
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
}));
