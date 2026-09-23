import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useConfirm } from '@/contexts/confirm-context';
import { submitPartnerApplication, getMyPartnerApplication } from '@/services/api';
import { uploadIdDoc } from '@/lib/storage';
import { getErrorMessage } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  experience: z.string().min(20, 'Décrivez votre expérience (min. 20 caractères)'),
  services_offered: z.string().min(5, 'Indiquez les services proposés'),
  zones_interest: z.string().min(3, 'Indiquez les zones'),
  why_partner: z.string().min(20, 'Expliquez votre motivation'),
  has_tools: z.boolean(),
  has_transport: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function BecomePartnerPage() {
  const { profile, session, refreshProfile } = useAuth();
  const { alert } = useConfirm();
  const navigate = useNavigate();
  const [recto, setRecto] = useState<File | null>(null);
  const [verso, setVerso] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [rectoPreview, setRectoPreview] = useState<string | null>(null);
  const [versoPreview, setVersoPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [previewMounted, setPreviewMounted] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: ['my-partner-app'],
    queryFn: getMyPartnerApplication,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      has_tools: false,
      has_transport: false,
    },
  });

  useEffect(() => {
    if (recto) {
      const url = URL.createObjectURL(recto);
      setRectoPreview(url);
      setPreviewMounted(false);
      setTimeout(() => setPreviewMounted(true), 20);
      return () => URL.revokeObjectURL(url);
    }
    setRectoPreview(null);
  }, [recto]);

  useEffect(() => {
    if (verso) {
      const url = URL.createObjectURL(verso);
      setVersoPreview(url);
      setPreviewMounted(false);
      setTimeout(() => setPreviewMounted(true), 20);
      return () => URL.revokeObjectURL(url);
    }
    setVersoPreview(null);
  }, [verso]);

  useEffect(() => {
    if (selfie) {
      const url = URL.createObjectURL(selfie);
      setSelfiePreview(url);
      setPreviewMounted(false);
      setTimeout(() => setPreviewMounted(true), 20);
      return () => URL.revokeObjectURL(url);
    }
    setSelfiePreview(null);
  }, [selfie]);

  if (profile?.role === 'partner' || profile?.role === 'zone_manager') {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border">
        <p className="text-[#0A2240] font-medium">Vous êtes déjà partenaire.</p>
        <Button className="mt-4 rounded-xl" onClick={() => navigate('/partenaire')}>
          Aller au tableau de bord
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF6600]" />
      </div>
    );
  }

  if (existing?.status === 'pending') {
    return (
      <div className="bg-white rounded-2xl p-8 border text-center">
        <h1 className="text-xl font-bold text-[#0A2240]">Demande en cours</h1>
        <p className="text-gray-500 mt-2">
          Votre demande de partenariat a bien été envoyée. Nous vous notifierons après examen.
        </p>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    if (!session?.user?.id) return;
    if (!recto || !verso || !selfie) {
      await alert({
        title: 'Pièces manquantes',
        description: 'Ajoutez la photo d\'identité recto, verso et un selfie.',
        variant: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const rectoPath = await uploadIdDoc(recto, session.user.id, 'recto');
      const versoPath = await uploadIdDoc(verso, session.user.id, 'verso');
      const selfiePath = await uploadIdDoc(selfie as File, session.user.id, 'selfie');
      await submitPartnerApplication({
        ...data,
        id_recto_url: rectoPath,
        id_verso_url: versoPath,
        selfie_url: selfiePath,
      });
      await refreshProfile();
      await alert({
        title: 'Demande envoyée',
        description:
          'Votre demande pour devenir partenaire a été transmise. Notre équipe va l\'étudier.',
        variant: 'success',
      });
      navigate('/espace');
    } catch (e) {
      await alert({ title: 'Erreur', description: getErrorMessage(e), variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0A2240]">Devenir partenaire</h1>
        <p className="text-sm text-gray-500">
          Remplissez ce formulaire pour prouver votre crédibilité. Une pièce d'identité (recto/verso) est requise.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Nom</label>
            <Input {...register('name')} className="rounded-xl mt-1" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Téléphone</label>
            <Input {...register('phone')} className="rounded-xl mt-1" />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Expérience professionnelle</label>
          <textarea
            {...register('experience')}
            className="mt-1 w-full min-h-[90px] rounded-xl border px-3 py-2 text-sm"
            placeholder="Années d'expérience, métiers, références..."
          />
          {errors.experience && <p className="text-xs text-red-500">{errors.experience.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Services proposés</label>
          <Input {...register('services_offered')} className="rounded-xl mt-1" placeholder="Plomberie, électricité..." />
        </div>

        <div>
          <label className="text-sm font-medium">Zones d'intervention</label>
          <Input {...register('zones_interest')} className="rounded-xl mt-1" placeholder="Cocody, Yopougon..." />
        </div>

        <div>
          <label className="text-sm font-medium">Pourquoi devenir partenaire ?</label>
          <textarea
            {...register('why_partner')}
            className="mt-1 w-full min-h-[90px] rounded-xl border px-3 py-2 text-sm"
          />
          {errors.why_partner && <p className="text-xs text-red-500">{errors.why_partner.message}</p>}
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('has_tools')} /> J'ai mon matériel
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('has_transport')} /> J'ai un moyen de transport
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Pièce d'identité — Recto</label>
            <Input
              type="file"
              accept="image/*,.pdf"
              className="rounded-xl mt-1"
              onChange={(e) => setRecto(e.target.files?.[0] ?? null)}
            />
            {rectoPreview && (
              <div className="mt-2">
                <div
                  onClick={() => {
                    setImageModalUrl(rectoPreview);
                    setImageModalOpen(true);
                  }}
                  role="button"
                  className={`cursor-pointer inline-block rounded-lg overflow-hidden border transition-all duration-200 ${
                    previewMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                >
                  <img src={rectoPreview} alt="Recto" className="max-h-40 w-auto block" />
                </div>
                <button type="button" className="text-sm text-red-500 mt-2" onClick={() => setRecto(null)}>
                  Supprimer
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Pièce d'identité — Verso</label>
            <Input
              type="file"
              accept="image/*,.pdf"
              className="rounded-xl mt-1"
              onChange={(e) => setVerso(e.target.files?.[0] ?? null)}
            />
            {versoPreview && (
              <div className="mt-2">
                <div
                  onClick={() => {
                    setImageModalUrl(versoPreview);
                    setImageModalOpen(true);
                  }}
                  role="button"
                  className={`cursor-pointer inline-block rounded-lg overflow-hidden border transition-all duration-200 ${
                    previewMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                >
                  <img src={versoPreview} alt="Verso" className="max-h-40 w-auto block" />
                </div>
                <button type="button" className="text-sm text-red-500 mt-2" onClick={() => setVerso(null)}>
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Selfie (photo du visage)</label>
          <Input
            type="file"
            accept="image/*"
            className="rounded-xl mt-1"
            onChange={(e) => setSelfie(e.target.files?.[0] ?? null)}
          />
          {selfiePreview && (
            <div className="mt-2">
              <div
                onClick={() => {
                  setImageModalUrl(selfiePreview);
                  setImageModalOpen(true);
                }}
                role="button"
                className={`cursor-pointer inline-block rounded-lg overflow-hidden border transition-all duration-200 ${
                  previewMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              >
                <img src={selfiePreview} alt="Selfie" className="max-h-40 w-auto block" />
              </div>
              <button type="button" className="text-sm text-red-500 mt-2" onClick={() => setSelfie(null)}>
                Supprimer
              </button>
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full rounded-xl h-11 bg-[#FF6600] hover:bg-[#e55a00]">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Envoyer ma demande
        </Button>
      </form>
      <Dialog open={imageModalOpen} onOpenChange={(v) => setImageModalOpen(v)}>
        <DialogContent className="sm:max-w-2xl rounded-2xl p-0">
          {imageModalUrl && (
            <div className="bg-black/90 p-4 flex justify-center">
              <img src={imageModalUrl} alt="Document" className="max-h-[80vh] w-auto rounded" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
