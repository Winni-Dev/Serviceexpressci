import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useRequestModal } from '@/contexts/request-modal-context';

/** Redirige vers l'accueil et ouvre le modal de commande */
export function RequestFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openRequest, openRequestById } = useRequestModal();

  useEffect(() => {
    const serviceId = searchParams.get('service');
    if (serviceId) {
      openRequestById(serviceId);
    } else {
      openRequest();
    }
    navigate('/', { replace: true });
  }, [searchParams, navigate, openRequest, openRequestById]);

  return null;
}
