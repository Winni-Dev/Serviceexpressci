// src/hooks/useAttendance.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendance, createAttendance } from '@/services/api';

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