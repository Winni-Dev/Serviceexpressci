



// import { useEffect, useRef } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import {
//   Dialog,
//   DialogContent,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { FormSearchableSelect } from '@/components/ui/form-searchable-select';
// import { useCreateRequest } from '@/hooks/useRequests';
// import { useZones } from '@/hooks/useZones';
// import { useConfirm } from '@/contexts/confirm-context';
// import { generateWhatsAppLink } from '@/lib/utils';
// import { getServiceIcon, getServiceDescription } from '@/lib/service-icons';
// import { Loader2, X } from 'lucide-react';
// import type { Service } from '@/types';

// const requestSchema = z.object({
//   name: z.string().min(2, 'Le nom est requis'),
//   phone: z.string().min(8, 'Numéro de téléphone invalide'),
//   service_id: z.string().min(1, 'Veuillez choisir un service'),
//   quartier: z.string().min(2, 'La commune est requise'),
//   zone_id: z.string().min(1, 'Veuillez choisir une zone'),
//   description: z.string().min(10, 'Description trop courte'),
// });

// type RequestForm = z.infer<typeof requestSchema>;

// interface RequestOrderModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   service: Service | null;
//   services?: Service[];
// }

// export function RequestOrderModal({ open, onOpenChange, service, services = [] }: RequestOrderModalProps) {
//   const { data: zones } = useZones();
//   const createRequest = useCreateRequest();
//   const { alert } = useConfirm();
//   const formRef = useRef<HTMLFormElement>(null);

//   const {
//     register,
//     handleSubmit,
//     control,
//     reset,
//     setValue,
//     formState: { errors, isSubmitting },
//   } = useForm<RequestForm>({
//     resolver: zodResolver(requestSchema),
//   });

//   useEffect(() => {
//     if (open && service) {
//       setValue('service_id', service.id);
//     } else if (open && !service) {
//       setValue('service_id', '');
//     }
//   }, [open, service, setValue]);

//   // Empêcher le zoom sur mobile lors du focus des inputs
//   useEffect(() => {
//     const handleFocus = (e: FocusEvent) => {
//       const target = e.target as HTMLElement;
//       if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
//         // Forcer la taille de police à 16px pour éviter le zoom sur iOS
//         target.style.fontSize = '16px';
//       }
//     };

//     const handleBlur = (e: FocusEvent) => {
//       const target = e.target as HTMLElement;
//       if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
//         target.style.fontSize = '';
//       }
//     };

//     document.addEventListener('focusin', handleFocus);
//     document.addEventListener('focusout', handleBlur);

//     return () => {
//       document.removeEventListener('focusin', handleFocus);
//       document.removeEventListener('focusout', handleBlur);
//     };
//   }, []);

//   const zoneOptions = zones?.map((z) => ({ value: z.id, label: z.name })) ?? [];
//   const serviceOptions = services.map((s) => ({ value: s.id, label: s.name }));

//   const onSubmit = async (data: RequestForm) => {
//     try {
//       await createRequest.mutateAsync(data);
//       const serviceName = service?.name ?? services.find((s) => s.id === data.service_id)?.name ?? '';
//       const message = `Bonjour, je souhaite faire une demande de service:\nService: ${serviceName}\nNom: ${data.name}\nTéléphone: ${data.phone}\nCommune: ${data.quartier}\nDescription: ${data.description}`;
//       window.open(generateWhatsAppLink('0123456789', message), '_blank');
//       reset();
//       onOpenChange(false);
//       await alert({
//         title: 'Demande envoyée !',
//         description: 'Votre demande a bien été enregistrée. Notre équipe vous contactera rapidement.',
//         variant: 'success',
//       });
//     } catch {
//       await alert({
//         title: 'Erreur',
//         description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
//         variant: 'error',
//       });
//     }
//   };

//   const handleClose = () => {
//     reset();
//     onOpenChange(false);
//   };

//   const ServiceIcon = service ? getServiceIcon(service.icon) : null;

//   return (
//     <Dialog open={open} onOpenChange={(v) => !v ? handleClose() : onOpenChange(v)}>
//       <DialogContent className="sm:max-w-lg rounded-2xl border-0 shadow-2xl p-0 overflow-hidden gap-0 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto [&>button]:hidden">
//         {/* Header */}
//         {service && ServiceIcon ? (
//           <div className="relative bg-gradient-to-br from-[#0A2240] to-[#0d2d52] px-4 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-6 text-white shrink-0">
//             <button
//               type="button"
//               onClick={handleClose}
//               className="absolute right-3 sm:right-4 top-3 sm:top-4 rounded-full p-1.5 bg-white/10 hover:bg-white/20 transition-colors"
//             >
//               <X className="w-4 h-4" />
//             </button>
//             <div className="flex items-center gap-3 sm:gap-4">
//               <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
//                 <ServiceIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF6600]" />
//               </div>
//               <div className="min-w-0 flex-1">
//                 <p className="text-white/60 text-xs sm:text-sm font-medium">Votre commande</p>
//                 <DialogTitle className="text-xl sm:text-2xl font-bold text-white mt-0.5 truncate">{service.name}</DialogTitle>
//                 <p className="text-white/70 text-xs sm:text-sm mt-0.5 line-clamp-1 sm:line-clamp-2">
//                   {getServiceDescription(service.name)}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="relative bg-gradient-to-br from-[#0A2240] to-[#0d2d52] px-4 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-6 text-white shrink-0">
//             <button
//               type="button"
//               onClick={handleClose}
//               className="absolute right-3 sm:right-4 top-3 sm:top-4 rounded-full p-1.5 bg-white/10 hover:bg-white/20 transition-colors"
//             >
//               <X className="w-4 h-4" />
//             </button>
//             <DialogTitle className="text-xl sm:text-2xl font-bold text-white">Faire une demande</DialogTitle>
//             <p className="text-white/70 text-xs sm:text-sm mt-1">Remplissez le formulaire pour être contacté rapidement</p>
//           </div>
//         )}

//         {/* Formulaire */}
//         <form 
//           ref={formRef}
//           onSubmit={handleSubmit(onSubmit)} 
//           className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1"
//           style={{ fontSize: '16px' }}
//         >
//           {!service && (
//             <div>
//               <label className="block text-sm font-medium mb-1.5 text-gray-700">Service</label>
//               <FormSearchableSelect
//                 control={control}
//                 name="service_id"
//                 options={serviceOptions}
//                 placeholder="Choisir un service"
//                 searchPlaceholder="Tapez le nom du service..."
//               />
//               {errors.service_id && (
//                 <p className="text-red-500 text-xs mt-1">{errors.service_id.message}</p>
//               )}
//             </div>
//           )}

//           {service && <input type="hidden" {...register('service_id')} />}

//           <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1.5 text-gray-700">Nom complet</label>
//               <Input 
//                 {...register('name')} 
//                 placeholder="Votre nom" 
//                 className="rounded-xl text-base h-11 sm:h-10" 
//                 style={{ fontSize: '16px' }}
//               />
//               {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1.5 text-gray-700">Téléphone</label>
//               <Input 
//                 {...register('phone')} 
//                 placeholder="05XXXXXXXX" 
//                 className="rounded-xl text-base h-11 sm:h-10" 
//                 style={{ fontSize: '16px' }}
//                 type="tel"
//               />
//               {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1.5 text-gray-700">Zone</label>
//             <FormSearchableSelect
//               control={control}
//               name="zone_id"
//               options={zoneOptions}
//               placeholder="Choisir une zone"
//               searchPlaceholder="Tapez le nom de la zone..."
//             />
//             {errors.zone_id && <p className="text-red-500 text-xs mt-1">{errors.zone_id.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1.5 text-gray-700">Commune / Quartier</label>
//             <Input 
//               {...register('quartier')} 
//               placeholder="Ex: Angré, Blockhaus..." 
//               className="rounded-xl text-base h-11 sm:h-10" 
//               style={{ fontSize: '16px' }}
//             />
//             {errors.quartier && <p className="text-red-500 text-xs mt-1">{errors.quartier.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1.5 text-gray-700">Description du besoin</label>
//             <textarea
//               {...register('description')}
//               className="w-full min-h-[80px] sm:min-h-[90px] rounded-xl border border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#FF6600]/30 focus:border-[#FF6600] resize-none"
//               placeholder="Décrivez votre besoin en détail..."
//               style={{ fontSize: '16px' }}
//             />
//             {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
//           </div>

//           <Button 
//             type="submit" 
//             className="w-full rounded-xl h-12 sm:h-11 text-base" 
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                 Envoi en cours...
//               </>
//             ) : (
//               'Envoyer ma demande'
//             )}
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormSearchableSelect } from '@/components/ui/form-searchable-select';
import { useCreateRequest } from '@/hooks/useRequests';
import { useZones } from '@/hooks/useZones';
import { useConfirm } from '@/contexts/confirm-context';
import { getServiceIcon, getServiceDescription } from '@/lib/service-icons';
import { Loader2, X } from 'lucide-react';
import type { Service } from '@/types';

const requestSchema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  service_id: z.string().min(1, 'Veuillez choisir un service'),
  quartier: z.string().min(2, 'La commune est requise'),
  zone_id: z.string().min(1, 'Veuillez choisir une zone'),
  description: z.string().min(10, 'Description trop courte'),
});

type RequestForm = z.infer<typeof requestSchema>;

interface RequestOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  services?: Service[];
}

export function RequestOrderModal({ open, onOpenChange, service, services = [] }: RequestOrderModalProps) {
  const { data: zones } = useZones();
  const createRequest = useCreateRequest();
  const { alert } = useConfirm();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
  });

  useEffect(() => {
    if (open && service) {
      setValue('service_id', service.id);
    } else if (open && !service) {
      setValue('service_id', '');
    }
  }, [open, service, setValue]);

  // Empêcher le zoom sur mobile lors du focus des inputs
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        target.style.fontSize = '16px';
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        target.style.fontSize = '';
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  const zoneOptions = zones?.map((z) => ({ value: z.id, label: z.name })) ?? [];
  const serviceOptions = services.map((s) => ({ value: s.id, label: s.name }));

  // Fonction openWhatsApp avec fallback
  const openWhatsApp = (phoneNumber: string, message: string) => {
    // Encoder le message pour l'URL sans caractères spéciaux
    const encodedMessage = encodeURIComponent(message);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
      setTimeout(() => {
        window.location.href = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      }, 500);
    } else {
      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
    }
  };

  const onSubmit = async (data: RequestForm) => {
    try {
      // Récupérer les noms
      const serviceName = service?.name ?? services.find((s) => s.id === data.service_id)?.name ?? 'Service non spécifié';
      const zoneName = zones?.find((z) => z.id === data.zone_id)?.name ?? 'Zone non spécifiée';
      
      // Construire le message WhatsApp - SANS caractères spéciaux ni emojis
      const message = 
        `Nouvelle demande de service\n\n` +
        `Client: ${data.name}\n` +
        `Telephone: ${data.phone}\n` +
        `Service: ${serviceName}\n` +
        `Zone: ${zoneName}\n` +
        `Commune: ${data.quartier}\n\n` +
        `Description:\n${data.description}\n\n` +
        `Date: ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      
      // 1. Ouvrir WhatsApp avec le message
      openWhatsApp("2250747753696", message);

      // 2. Enregistrer la demande dans la base de données
      await createRequest.mutateAsync(data);

      // 3. Réinitialiser le formulaire
      reset();

      // 4. Fermer la fenêtre modale
      onOpenChange(false);

      // 5. Afficher un message de succès
      await alert({
        title: 'Demande envoyée ! ✅',
        description: 'Votre demande a bien été enregistrée. Notre équipe vous contactera rapidement sur WhatsApp.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      await alert({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        variant: 'error',
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const ServiceIcon = service ? getServiceIcon(service.icon) : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v ? handleClose() : onOpenChange(v)}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-0 shadow-2xl p-0 overflow-hidden gap-0 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto [&>button]:hidden">
        {/* Header */}
        {service && ServiceIcon ? (
          <div className="relative bg-gradient-to-br from-[#0A2240] to-[#0d2d52] px-4 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-6 text-white shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 rounded-full p-1.5 bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
                <ServiceIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF6600]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white/60 text-xs sm:text-sm font-medium">Votre commande</p>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-white mt-0.5 truncate">{service.name}</DialogTitle>
                <p className="text-white/70 text-xs sm:text-sm mt-0.5 line-clamp-1 sm:line-clamp-2">
                  {getServiceDescription(service.name)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-[#0A2240] to-[#0d2d52] px-4 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-6 text-white shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 rounded-full p-1.5 bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-white">Faire une demande</DialogTitle>
            <p className="text-white/70 text-xs sm:text-sm mt-1">Remplissez le formulaire pour être contacté rapidement</p>
          </div>
        )}

        {/* Formulaire */}
        <form 
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)} 
          className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1"
          style={{ fontSize: '16px' }}
        >
          {!service && (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Service</label>
              <FormSearchableSelect
                control={control}
                name="service_id"
                options={serviceOptions}
                placeholder="Choisir un service"
                searchPlaceholder="Tapez le nom du service..."
              />
              {errors.service_id && (
                <p className="text-red-500 text-xs mt-1">{errors.service_id.message}</p>
              )}
            </div>
          )}

          {service && <input type="hidden" {...register('service_id')} />}

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Nom complet</label>
              <Input 
                {...register('name')} 
                placeholder="Votre nom" 
                className="rounded-xl text-base h-11 sm:h-10" 
                style={{ fontSize: '16px' }}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Téléphone</label>
              <Input 
                {...register('phone')} 
                placeholder="05XXXXXXXX" 
                className="rounded-xl text-base h-11 sm:h-10" 
                style={{ fontSize: '16px' }}
                type="tel"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Zone</label>
            <FormSearchableSelect
              control={control}
              name="zone_id"
              options={zoneOptions}
              placeholder="Choisir une zone"
              searchPlaceholder="Tapez le nom de la zone..."
            />
            {errors.zone_id && <p className="text-red-500 text-xs mt-1">{errors.zone_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Commune / Quartier</label>
            <Input 
              {...register('quartier')} 
              placeholder="Ex: Angré, Blockhaus..." 
              className="rounded-xl text-base h-11 sm:h-10" 
              style={{ fontSize: '16px' }}
            />
            {errors.quartier && <p className="text-red-500 text-xs mt-1">{errors.quartier.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Description du besoin</label>
            <textarea
              {...register('description')}
              className="w-full min-h-[80px] sm:min-h-[90px] rounded-xl border border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#FF6600]/30 focus:border-[#FF6600] resize-none"
              placeholder="Décrivez votre besoin en détail..."
              style={{ fontSize: '16px' }}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full rounded-xl h-12 sm:h-11 text-base bg-gradient-to-r from-[#FF6600] to-[#e55a00] hover:shadow-lg hover:shadow-[#FF6600]/30 transition-all duration-300" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Envoyer ma demande'
            )}
          </Button>
          
          <p className="text-center text-xs text-gray-400 mt-2">
            <span className="flex items-center justify-center gap-1">
              <span>📱</span> Vous serez contacté via WhatsApp
            </span>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}