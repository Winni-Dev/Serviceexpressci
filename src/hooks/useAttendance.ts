import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendance, createAttendance, applyAttendanceLevy, markAttendancePaid } from '@/services/api';

export function useAttendance() {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: getAttendance,
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

export function useApplyLevy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, levy }: { id: string; levy: number }) => applyAttendanceLevy(id, levy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['worker-earnings'] });
    },
  });
}

export function usePayAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount?: number }) =>
      markAttendancePaid(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['worker-earnings'] });
    },
  });
}
