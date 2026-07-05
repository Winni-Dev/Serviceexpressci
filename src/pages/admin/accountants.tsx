import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PageHeader, EntityCard, ErrorAlert, EmptyState } from '@/components/admin/page-shell';
import { useAccountants, useCreateAccountant, useDeleteAccountant } from '@/hooks/useAccountants';
import { useConfirm } from '@/contexts/confirm-context';
import { getErrorMessage } from '@/lib/auth';
import { Plus, Calculator, Mail, Trash2 } from 'lucide-react';

export function AccountantsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { data: accountants } = useAccountants();
  const createAccountant = useCreateAccountant();
  const deleteAccountant = useDeleteAccountant();
  const { confirm } = useConfirm();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await createAccountant.mutateAsync({ email, password });
      setEmail('');
      setPassword('');
      setIsDialogOpen(false);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Supprimer ce comptable ?',
      description: 'Son accès au module comptabilité sera révoqué.',
      confirmText: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deleteAccountant.mutateAsync(id);
    } catch (error) {
      setErrorMsg(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comptables"
        description="Accès au module comptabilité"
        badge={accountants?.length ?? 0}
        action={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl"><Plus className="w-4 h-4 mr-2" />Ajouter un comptable</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Créer un compte comptable</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                {errorMsg && <ErrorAlert message={errorMsg} />}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="comptable@serviceexpress.ci" required className="rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Mot de passe</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caractères" required minLength={6} className="rounded-xl" />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={createAccountant.isPending}>
                  {createAccountant.isPending ? 'Création...' : 'Créer le compte'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {errorMsg && !isDialogOpen && <ErrorAlert message={errorMsg} />}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountants?.length === 0 ? (
          <EmptyState icon={Calculator} message="Aucun comptable configuré" />
        ) : (
          accountants?.map((accountant) => (
            <EntityCard key={accountant.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0A2240]">Comptable</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                      <Mail className="w-3 h-3" /><span className="truncate">{accountant.email}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg h-8 w-8 p-0" onClick={() => handleDelete(accountant.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </EntityCard>
          ))
        )}
      </div>
    </div>
  );
}
