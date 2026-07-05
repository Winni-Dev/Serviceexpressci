import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequests, createRequest, updateRequestStatus } from '@/services/api';
import { useAuth } from '@/contexts/auth-context';

function useZoneFilter() {
  const { profile } = useAuth();
  return profile?.role === 'zone_manager' ? profile.zone_id : undefined;
}

export function useRequests() {
  const zoneId = useZoneFilter();
  return useQuery({
    queryKey: ['requests', zoneId],
    queryFn: () => getRequests(zoneId ? { zoneId } : undefined),
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, workerId }: { id: string; status: string; workerId?: string }) =>
      updateRequestStatus(id, status, workerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['requests'] }),
  });
}
