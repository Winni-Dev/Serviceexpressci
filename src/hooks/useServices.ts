import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  reorderServiceCategories,
  reorderServices,
} from '@/services/api';
import type { Service, ServiceCategory } from '@/types';

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Service>) => updateService(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });
}

export function useReorderServices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderServices,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });
}

export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: getServiceCategories,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createServiceCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<ServiceCategory>) =>
      updateServiceCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteServiceCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-categories'] });
      qc.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useReorderCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reorderServiceCategories,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-categories'] }),
  });
}
