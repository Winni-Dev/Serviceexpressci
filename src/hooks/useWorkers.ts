import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkers, createWorker, updateWorker, updateWorkerStatus, deleteWorker } from '@/services/api';
import { useAuth } from '@/contexts/auth-context';
import type { Gender, Worker } from '@/types';

function useZoneFilter() {
  const { profile } = useAuth();
  return profile?.role === 'zone_manager' ? profile.zone_id : undefined;
}

export function useWorkers() {
  const zoneId = useZoneFilter();
  return useQuery({
    queryKey: ['workers', zoneId],
    queryFn: () => getWorkers(zoneId ? { zoneId } : undefined),
  });
}

export function useCreateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorker,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
  });
}

export function useUpdateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...worker }: { id: string } & Partial<Worker>) =>
      updateWorker(id, worker),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
  });
}

export function useUpdateWorkerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateWorkerStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
  });
}

export function useDeleteWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWorker,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workers'] }),
  });
}
