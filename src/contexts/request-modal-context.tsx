import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { RequestOrderModal } from '@/components/public/request-order-modal';
import { useServices } from '@/hooks/useServices';
import type { Service } from '@/types';

interface RequestModalContextValue {
  openRequest: (service?: Service) => void;
  openRequestById: (serviceId: string) => void;
  closeRequest: () => void;
}

const RequestModalContext = createContext<RequestModalContextValue | null>(null);

export function RequestModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [pendingServiceId, setPendingServiceId] = useState<string | null>(null);
  const { data: services } = useServices();

  useEffect(() => {
    if (pendingServiceId && services) {
      const service = services.find((s) => s.id === pendingServiceId) ?? null;
      if (service) setSelectedService(service);
      setPendingServiceId(null);
    }
  }, [pendingServiceId, services]);

  const openRequest = useCallback((service?: Service) => {
    setSelectedService(service ?? null);
    setPendingServiceId(null);
    setOpen(true);
  }, []);

  const openRequestById = useCallback(
    (serviceId: string) => {
      const service = services?.find((s) => s.id === serviceId) ?? null;
      setSelectedService(service);
      if (!service) setPendingServiceId(serviceId);
      setOpen(true);
    },
    [services]
  );

  const closeRequest = useCallback(() => {
    setOpen(false);
    setSelectedService(null);
  }, []);

  return (
    <RequestModalContext.Provider value={{ openRequest, openRequestById, closeRequest }}>
      {children}
      <RequestOrderModal
        open={open}
        onOpenChange={(v) => (v ? setOpen(true) : closeRequest())}
        service={selectedService}
        services={services ?? []}
      />
    </RequestModalContext.Provider>
  );
}

export function useRequestModal() {
  const ctx = useContext(RequestModalContext);
  if (!ctx) throw new Error('useRequestModal doit être utilisé dans RequestModalProvider');
  return ctx;
}
