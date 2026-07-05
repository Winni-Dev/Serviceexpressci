import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccountants, createAccountant, deleteAccountant } from '@/services/api';
import type { CreateAccountantInput } from '@/types';

export function useAccountants() {
  return useQuery({
    queryKey: ['accountants'],
    queryFn: getAccountants,
  });
}

export function useCreateAccountant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountant: CreateAccountantInput) => createAccountant(accountant),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accountants'] }),
  });
}

export function useDeleteAccountant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAccountant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accountants'] }),
  });
}
