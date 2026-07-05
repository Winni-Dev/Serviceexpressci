import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getZones, createZone, updateZone, deleteZone } from '@/services/api';

export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: getZones,
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createZone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateZone(id, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteZone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });
}
