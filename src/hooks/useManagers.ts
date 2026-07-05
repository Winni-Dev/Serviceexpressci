import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getZoneManagers,
  createZoneManager,
  updateZoneManager,
  deleteZoneManager,
} from '@/services/api';
import type { CreateZoneManagerInput, Gender, ZoneManager } from '@/types';

export function useZoneManagers() {
  return useQuery({
    queryKey: ['zone_managers'],
    queryFn: getZoneManagers,
  });
}

export function useCreateZoneManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (manager: CreateZoneManagerInput) => createZoneManager(manager),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zone_managers'] });
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

export function useUpdateZoneManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<ZoneManager>) =>
      updateZoneManager(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zone_managers'] }),
  });
}

export function useDeleteZoneManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteZoneManager,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zone_managers'] }),
  });
}
