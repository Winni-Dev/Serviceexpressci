// import { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
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
// import { uploadRequestPhoto } from '@/lib/storage';
// import { useZones } from '@/hooks/useZones';
// import { useConfirm } from '@/contexts/confirm-context';
// import { useAuth } from '@/contexts/auth-context';
// import { getServiceIcon, getServiceDescription } from '@/lib/service-icons';
// import { Loader2, X, UserPlus } from 'lucide-react';
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
//   const { session, profile } = useAuth();
//   const navigate = useNavigate();
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
//   const [photo, setPhoto] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [previewMounted, setPreviewMounted] = useState(false);
//   const [imageModalOpen, setImageModalOpen] = useState(false);
//   const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

//   useEffect(() => {
//     if (open && service) {
//       setValue('service_id', service.id);
//     } else if (open && !service) {
//       setValue('service_id', '');
//     }
//     if (open && profile) {
//       if (profile.name) setValue('name', profile.name);
//       if (profile.phone) setValue('phone', profile.phone);
//       if (profile.zone_id) setValue('zone_id', profile.zone_id);
//     }
//   }, [open, service, setValue, profile]);

//   useEffect(() => {
//     const handleFocus = (e: FocusEvent) => {
//       const target = e.target as HTMLElement;
//       if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
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

//   useEffect(() => {
//     if (!photo) {
//       setPreview(null);
//       return;
//     }
//     const url = URL.createObjectURL(photo);
//     setPreview(url);
//     return () => URL.revokeObjectURL(url);
//   }, [photo]);

//   useEffect(() => {
//     if (!preview) return setPreviewMounted(false);
//     // trigger entry animation
//     const t = setTimeout(() => setPreviewMounted(true), 20);
//     return () => clearTimeout(t);
//   }, [preview]);

//   const zoneOptions = zones?.map((z) => ({ value: z.id, label: z.name })) ?? [];
//   const serviceOptions = services.map((s) => ({ value: s.id, label: s.name }));

//   const goToRegister = () => {
//     onOpenChange(false);
//     navigate('/inscription', { state: { from: '/demande' } });
//   };

//   const goToLogin = () => {
//     onOpenChange(false);
//     navigate('/connexion', { state: { from: '/demande' } });
//   };

//   const onSubmit = async (data: RequestForm) => {
//     if (!session) {
//       goToRegister();
//       return;
//     }
//     try {
//       let photoUrl: string | undefined;
//       if (photo && session.user.id) {
//         photoUrl = await uploadRequestPhoto(photo, session.user.id);
//       }
//       await createRequest.mutateAsync({
//         ...data,
//         client_id: session.user.id,
//         photo_url: photoUrl,
//       });
//       reset();
//       onOpenChange(false);
//       await alert({
//         title: 'Demande envoyée !',
//         description:
//           'Les professionnels concernés vont proposer un prix. Suivez l\'avancement dans Mon espace.',
//         variant: 'success',
//       });
//       navigate('/espace');
//     } catch (error) {
//       console.error(error);
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
//     <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : onOpenChange(v))}>
//       <DialogContent className="sm:max-w-lg rounded-2xl border-0 shadow-2xl p-0 overflow-hidden gap-0 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto [&>button]:hidden">
//         <div className="relative bg-gradient-to-br from-[#0A2240] to-[#0d2d52] px-4 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-6 text-white shrink-0">
//           <button
//             type="button"
//             onClick={handleClose}
//             className="absolute right-3 sm:right-4 top-3 sm:top-4 rounded-full p-1.5 bg-white/10 hover:bg-white/20 transition-colors"
//           >
//             <X className="w-4 h-4" />
//           </button>
//           {service && ServiceIcon ? (
//             <div className="flex items-center gap-3 sm:gap-4">
//               <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur shrink-0">
//                 <ServiceIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF6600]" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs font-medium text-white/60 sm:text-sm">Votre commande</p>
//                 <DialogTitle className="text-xl sm:text-2xl font-bold text-white mt-0.5 truncate">
//                   {service.name}
//                 </DialogTitle>
//                 <p className="text-white/70 text-xs sm:text-sm mt-0.5 line-clamp-2">
//                   {getServiceDescription(service.name)}
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <>
//               <DialogTitle className="text-xl font-bold text-white sm:text-2xl">
//                 Faire une demande
//               </DialogTitle>
//               <p className="mt-1 text-xs text-white/70 sm:text-sm">
//                 Inscription requise pour envoyer une demande
//               </p>
//             </>
//           )}
//         </div>

//         {!session ? (
//           <div className="p-6 space-y-4 text-center">
//             <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FF6600]/10 flex items-center justify-center">
//               <UserPlus className="w-7 h-7 text-[#FF6600]" />
//             </div>
//             <p className="text-sm text-gray-600">
//               Vous pouvez consulter les services librement. Pour faire une demande, créez un compte
//               (nom, téléphone, localisation) ou connectez-vous.
//             </p>
//             <Button
//               className="w-full rounded-xl h-11 bg-[#FF6600] hover:bg-[#e55a00]"
//               onClick={goToRegister}
//             >
//               S'inscrire pour demander
//             </Button>
//             <Button variant="outline" className="w-full rounded-xl h-11" onClick={goToLogin}>
//               J'ai déjà un compte
//             </Button>
//           </div>
//         ) : (
//           <form
//             ref={formRef}
//             onSubmit={handleSubmit(onSubmit)}
//             className="flex-1 p-4 space-y-4 overflow-y-auto bg-white sm:p-6 rounded-b-2xl"
//             style={{ fontSize: '16px' }}
//           >
//             <div className="grid gap-3">
//               {/* photo input moved below description */}
//             </div>

//             {!service && (
//               <div className="mt-3">
//                 <label className="block text-sm font-medium mb-1.5 text-gray-700">Service</label>
//                 <FormSearchableSelect
//                   control={control}
//                   name="service_id"
//                   options={serviceOptions}
//                   placeholder="Choisir un service"
//                   searchPlaceholder="Tapez le nom du service..."
//                 />
//                 {errors.service_id && (
//                   <p className="mt-1 text-xs text-red-500">{errors.service_id.message}</p>
//                 )}
//               </div>
//             )}

//             {service && <input type="hidden" {...register('service_id')} />}

//             <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-1.5 text-gray-700">Nom complet</label>
//                 <Input {...register('name')} className="rounded-xl h-11" style={{ fontSize: '16px' }} />
//                 {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1.5 text-gray-700">Téléphone</label>
//                 <Input
//                   {...register('phone')}
//                   type="tel"
//                   className="rounded-xl h-11"
//                   style={{ fontSize: '16px' }}
//                 />
//                 {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1.5 text-gray-700">Zone</label>
//               <FormSearchableSelect
//                 control={control}
//                 name="zone_id"
//                 options={zoneOptions}
//                 placeholder="Choisir une zone"
//                 searchPlaceholder="Tapez le nom de la zone..."
//               />
//               {errors.zone_id && <p className="mt-1 text-xs text-red-500">{errors.zone_id.message}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1.5 text-gray-700">Commune / Quartier</label>
//               <Input
//                 {...register('quartier')}
//                 placeholder="Ex: Angré, Blockhaus..."
//                 className="rounded-xl h-11"
//                 style={{ fontSize: '16px' }}
//               />
//               {errors.quartier && (
//                 <p className="mt-1 text-xs text-red-500">{errors.quartier.message}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1.5 text-gray-700">
//                 Description du besoin
//               </label>
//               <textarea
//                 {...register('description')}
//                 className="w-full min-h-[90px] rounded-xl border border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#FF6600]/30 focus:border-[#FF6600] resize-none"
//                 placeholder="Décrivez votre besoin en détail..."
//                 style={{ fontSize: '16px' }}
//               />
//               {errors.description && (
//                 <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1.5 text-gray-700">Photo du problème (optionnelle)</label>
//               <p className="mb-2 text-xs text-gray-500">Joignez une photo si cela aide à illustrer le problème (facultatif).</p>
//               <Input
//                 type="file"
//                 accept="image/*"
//                 capture="environment"
//                 className="rounded-xl"
//                 onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
//               />
//               {preview && (
//                 <div className="mt-2">
//                   <div
//                     onClick={() => {
//                       setImageModalUrl(preview);
//                       setImageModalOpen(true);
//                     }}
//                     role="button"
//                     className={`cursor-pointer inline-block rounded-lg overflow-hidden border transition-all duration-200 ${
//                       previewMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
//                     }`}
//                   >
//                     <img src={preview} alt="Aperçu" className="block w-auto max-h-48" />
//                   </div>
//                   <div className="flex items-center gap-3 mt-2">
//                     <button
//                       type="button"
//                       className="text-sm text-red-500"
//                       onClick={() => setPhoto(null)}
//                     >
//                       Supprimer la photo
//                     </button>
//                     <p className="text-xs text-gray-500">Cliquez sur l'image pour agrandir</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <Button
//               type="submit"
//               className="w-full rounded-xl h-12 text-base bg-gradient-to-r from-[#FF6600] to-[#e55a00] shadow-lg"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                   Envoi...
//                 </>
//               ) : (
//                 'Envoyer ma demande'
//               )}
//             </Button>
//           </form>
//         )}
//         <Dialog open={imageModalOpen} onOpenChange={(v) => setImageModalOpen(v)}>
//           <DialogContent className="p-0 sm:max-w-2xl rounded-2xl">
//             {imageModalUrl && (
//               <div className="flex justify-center p-4 bg-black/90">
//                 <img src={imageModalUrl} alt="Grande vue" className="max-h-[80vh] w-auto rounded" />
//               </div>
//             )}
//           </DialogContent>
//         </Dialog>
//       </DialogContent>
//     </Dialog>
//   );
// }

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { uploadRequestPhoto } from '@/lib/storage';
import { useZones } from '@/hooks/useZones';
import { useConfirm } from '@/contexts/confirm-context';
import { useAuth } from '@/contexts/auth-context';
import { getServiceIcon, getServiceDescription } from '@/lib/service-icons';
import {
  Loader2,
  X,
  Camera,
  Trash2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Service } from '@/types';

/* -------------------------------------------------------------------------- */
/*                                   Schema                                   */
/* -------------------------------------------------------------------------- */

const requestSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  phone: z.string().min(8, 'Numéro invalide'),
  service_id: z.string().min(1, 'Service requis'),
  quartier: z.string().min(2, 'Commune requise'),
  zone_id: z.string().min(1, 'Zone requise'),
  description: z.string().min(10, 'Trop court'),
});

type RequestForm = z.infer<typeof requestSchema>;

interface RequestOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  services?: Service[];
}

/* -------------------------------------------------------------------------- */
/*                                 Sous-comps                                 */
/* -------------------------------------------------------------------------- */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-[11px] font-medium text-foreground/70">
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -2 }}
          transition={{ duration: 0.15 }}
          className="mt-1 text-[10.5px] font-medium text-red-500"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

const inputCls = cn(
  'h-9 rounded-lg border-border/60 bg-muted/20 text-[13.5px]',
  'transition-all duration-200',
  'focus-visible:border-[#FF6600]/50 focus-visible:ring-2 focus-visible:ring-[#FF6600]/15'
);

/* -------------------------------------------------------------------------- */
/*                              Request Order Modal                           */
/* -------------------------------------------------------------------------- */

export function RequestOrderModal({
  open,
  onOpenChange,
  service,
  services = [],
}: RequestOrderModalProps) {
  const { data: zones } = useZones();
  const createRequest = useCreateRequest();
  const { alert } = useConfirm();
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const descriptionValue = watch('description') ?? '';

  useEffect(() => {
    if (open && service) {
      setValue('service_id', service.id);
    } else if (open && !service) {
      setValue('service_id', '');
    }
    if (open && profile) {
      if (profile.name) setValue('name', profile.name);
      if (profile.phone) setValue('phone', profile.phone);
      if (profile.zone_id) setValue('zone_id', profile.zone_id);
    }
  }, [open, service, setValue, profile]);

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) {
        t.style.fontSize = '16px';
      }
    };
    const handleBlur = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) {
        t.style.fontSize = '';
      }
    };
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const zoneOptions = zones?.map((z) => ({ value: z.id, label: z.name })) ?? [];
  const serviceOptions = services.map((s) => ({ value: s.id, label: s.name }));

  const goToRegister = () => {
    onOpenChange(false);
    navigate('/inscription', { state: { from: '/demande' } });
  };
  const goToLogin = () => {
    onOpenChange(false);
    navigate('/connexion', { state: { from: '/demande' } });
  };

  const onSubmit = async (data: RequestForm) => {
    if (!session) {
      goToRegister();
      return;
    }
    try {
      let photoUrl: string | undefined;
      if (photo && session.user.id) {
        photoUrl = await uploadRequestPhoto(photo, session.user.id);
      }
      await createRequest.mutateAsync({
        ...data,
        client_id: session.user.id,
        photo_url: photoUrl,
      });
      reset();
      setPhoto(null);
      onOpenChange(false);
      await alert({
        title: 'Demande envoyée !',
        description:
          "Les professionnels concernés vont proposer un prix. Suivez l'avancement dans Mon espace.",
        variant: 'success',
      });
      navigate('/espace');
    } catch (error) {
      console.error(error);
      await alert({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        variant: 'error',
      });
    }
  };

  const handleClose = () => {
    reset();
    setPhoto(null);
    onOpenChange(false);
  };

  const ServiceIcon = service ? getServiceIcon(service.icon) : null;

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : onOpenChange(v))}>
      <DialogContent
        className={cn(
          'gap-0 overflow-hidden rounded-2xl border border-border/70 bg-background p-0 shadow-2xl',
          'sm:max-w-md',
          'max-h-[92vh] overflow-y-auto',
          '[&>button]:hidden'
        )}
      >
        {/* ============================= HEADER (compact) ============================= */}
        <div className="relative flex items-center gap-3 px-5 py-4 border-b border-border/60 bg-background">
          {/* Trait orange signature */}
          <span className="absolute left-0 top-0 h-full w-[3px] bg-[#FF6600]" />

          {service && ServiceIcon ? (
            <div className="flex items-center justify-center border rounded-lg h-9 w-9 shrink-0 border-border/70 bg-muted/40">
              <ServiceIcon className="h-4 w-4 text-[#FF6600]" strokeWidth={1.75} />
            </div>
          ) : (
            <div className="flex items-center justify-center border rounded-lg h-9 w-9 shrink-0 border-border/70 bg-muted/40">
              <Camera className="h-4 w-4 text-[#FF6600]" strokeWidth={1.75} />
            </div>
          )}

          <div className="flex-1 min-w-0 pr-8">
            <DialogTitle className="truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] text-foreground">
              {service ? service.name : 'Nouvelle demande'}
            </DialogTitle>
            <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
              {service
                ? getServiceDescription(service.name)
                : 'Décrivez votre besoin, recevez des propositions.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Fermer"
            className="absolute right-3 top-3.5 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        {/* ============================= BODY ============================= */}
        {!session ? (
          <div className="p-5 space-y-4 text-center">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Pour envoyer une demande, créez un compte ou connectez-vous.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={goToRegister}
                className="group h-10 w-full gap-1.5 rounded-full bg-[#FF6600] text-white shadow-sm shadow-[#FF6600]/25 hover:bg-[#e55a00]"
              >
                <span className="text-[13px] font-medium">Créer mon compte</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Button>
              <Button
                variant="ghost"
                onClick={goToLogin}
                className="h-10 w-full rounded-full text-[13px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                J'ai déjà un compte
              </Button>
            </div>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3.5 p-5"
            style={{ fontSize: '16px' }}
          >
            {/* Service (si non pré-sélectionné) */}
            {!service && (
              <div>
                <FieldLabel>Service</FieldLabel>
                <FormSearchableSelect
                  control={control}
                  name="service_id"
                  options={serviceOptions}
                  placeholder="Choisir un service"
                  searchPlaceholder="Rechercher…"
                />
                <FieldError message={errors.service_id?.message} />
              </div>
            )}
            {service && <input type="hidden" {...register('service_id')} />}

            {/* Nom + Téléphone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Nom</FieldLabel>
                <Input
                  {...register('name')}
                  placeholder="Kouassi Jean"
                  className={inputCls}
                  style={{ fontSize: '16px' }}
                />
                <FieldError message={errors.name?.message} />
              </div>
              <div>
                <FieldLabel>Téléphone</FieldLabel>
                <Input
                  {...register('phone')}
                  type="tel"
                  inputMode="tel"
                  placeholder="07 00 00 00 00"
                  className={inputCls}
                  style={{ fontSize: '16px' }}
                />
                <FieldError message={errors.phone?.message} />
              </div>
            </div>

            {/* Zone + Commune */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Zone</FieldLabel>
                <FormSearchableSelect
                  control={control}
                  name="zone_id"
                  options={zoneOptions}
                  placeholder="Zone"
                  searchPlaceholder="Rechercher…"
                />
                <FieldError message={errors.zone_id?.message} />
              </div>
              <div>
                <FieldLabel>Quartier</FieldLabel>
                <Input
                  {...register('quartier')}
                  placeholder="Angré…"
                  className={inputCls}
                  style={{ fontSize: '16px' }}
                />
                <FieldError message={errors.quartier?.message} />
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <FieldLabel>Décrivez votre besoin</FieldLabel>
                <span className="text-[10.5px] tabular-nums text-muted-foreground/50">
                  {descriptionValue.length}
                </span>
              </div>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Ex : Fuite sous l'évier, urgente, 3e étage…"
                className={cn(
                  'w-full resize-none rounded-lg border border-border/60 bg-muted/20 px-3 py-2',
                  'text-[13.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/50',
                  'transition-all duration-200',
                  'focus:border-[#FF6600]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6600]/15'
                )}
                style={{ fontSize: '16px' }}
              />
              <FieldError message={errors.description?.message} />
            </div>

            {/* Photo compacte */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />

              {!preview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'group flex w-full items-center gap-2.5 rounded-lg border border-dashed border-border/70 bg-muted/10 px-3 py-2.5 text-left',
                    'transition-all duration-200',
                    'hover:border-[#FF6600]/40 hover:bg-[#FF6600]/[0.04]'
                  )}
                >
                  <Camera
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-[#FF6600]"
                    strokeWidth={1.75}
                  />
                  <span className="flex-1 text-[12.5px] text-muted-foreground">
                    Ajouter une photo
                  </span>
                  <span className="text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground/50">
                    Optionnel
                  </span>
                </button>
              ) : (
                <div className="relative overflow-hidden border rounded-lg border-border/70 bg-muted/20">
                  <img
                    src={preview}
                    alt="Aperçu"
                    onClick={() => {
                      setImageModalUrl(preview);
                      setImageModalOpen(true);
                    }}
                    className="object-cover w-full max-h-32 cursor-zoom-in"
                  />
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    aria-label="Supprimer"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" strokeWidth={1.75} />
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-1 space-y-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="group h-10 w-full gap-1.5 rounded-full bg-[#FF6600] text-white shadow-sm shadow-[#FF6600]/25 transition-all duration-300 hover:bg-[#e55a00] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                    <span className="text-[13px] font-medium">Envoi…</span>
                  </>
                ) : (
                  <>
                    <span className="text-[13px] font-medium">Envoyer</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </>
                )}
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-[10.5px] text-muted-foreground">
                <ShieldCheck className="w-3 h-3" strokeWidth={1.75} />
                Sécurisé · Sans engagement
              </p>
            </div>
          </form>
        )}

        {/* ============================= IMAGE MODAL ============================= */}
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogContent
            className={cn(
              'gap-0 overflow-hidden rounded-2xl border border-border/70 p-0 shadow-2xl',
              'sm:max-w-2xl'
            )}
          >
            {imageModalUrl && (
              <div className="flex max-h-[75vh] items-center justify-center bg-muted/20 p-4">
                <img
                  src={imageModalUrl}
                  alt="Grande vue"
                  className="max-h-[70vh] w-auto rounded-lg"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}