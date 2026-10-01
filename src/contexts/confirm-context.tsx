import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Info, LogOut, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConfirmVariant = 'danger' | 'warning' | 'default';
type AlertVariant = 'success' | 'error' | 'info';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface AlertOptions {
  title: string;
  description?: string;
  variant?: AlertVariant;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

const confirmIcons: Record<ConfirmVariant, typeof AlertTriangle> = {
  danger: AlertTriangle,
  warning: LogOut,
  default: Info,
};

const confirmStyles: Record<ConfirmVariant, { icon: string; bg: string; btn: string }> = {
  danger: {
    icon: 'text-[#FB7185]',
    bg: 'bg-[#FB7185]/15 border border-[#FB7185]/30',
    btn: 'bg-[#FB7185] hover:bg-[#e0566b] text-white',
  },
  warning: {
    icon: 'text-[#D99A5B]',
    bg: 'bg-[rgba(194,125,61,0.15)] border border-[#C27D3D]/30',
    btn: 'bg-[#C27D3D] hover:bg-[#D99A5B] text-black font-semibold',
  },
  default: {
    icon: 'text-[#D99A5B]',
    bg: 'bg-[rgba(194,125,61,0.15)] border border-[#C27D3D]/30',
    btn: 'bg-[#C27D3D] hover:bg-[#D99A5B] text-black font-semibold',
  },
};

const alertIcons: Record<AlertVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const alertStyles: Record<AlertVariant, { icon: string; bg: string }> = {
  success: { icon: 'text-[#34D399]', bg: 'bg-[#34D399]/15 border border-[#34D399]/30' },
  error: { icon: 'text-[#FB7185]', bg: 'bg-[#FB7185]/15 border border-[#FB7185]/30' },
  info: { icon: 'text-[#22D3EE]', bg: 'bg-[#22D3EE]/15 border border-[#22D3EE]/30' },
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const [alertState, setAlertState] = useState<(AlertOptions & { resolve: () => void }) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ ...options, resolve });
    });
  }, []);

  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setAlertState({ ...options, resolve });
    });
  }, []);

  const closeConfirm = (result: boolean) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  const closeAlert = () => {
    alertState?.resolve();
    setAlertState(null);
  };

  const confirmVariant = confirmState?.variant ?? 'default';
  const ConfirmIcon = confirmIcons[confirmVariant];
  const cStyle = confirmStyles[confirmVariant];

  const alertVariant = alertState?.variant ?? 'info';
  const AlertIcon = alertIcons[alertVariant];
  const aStyle = alertStyles[alertVariant];

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}

      <Dialog open={!!confirmState} onOpenChange={(open) => !open && closeConfirm(false)}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-[#27272A] bg-[#121212] shadow-2xl p-0 overflow-hidden gap-0">
          <div className="p-6">
            <DialogHeader className="space-y-4">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mx-auto sm:mx-0', cStyle.bg)}>
                <ConfirmIcon className={cn('w-6 h-6', cStyle.icon)} />
              </div>
              <div className="text-center sm:text-left">
                <DialogTitle className="text-lg font-bold text-white">{confirmState?.title}</DialogTitle>
                {confirmState?.description && (
                  <DialogDescription className="mt-1.5 text-sm text-zinc-400">{confirmState.description}</DialogDescription>
                )}
              </div>
            </DialogHeader>
          </div>
          <DialogFooter className="flex-row gap-3 p-4 bg-[#18181B] border-t border-[#27272A] sm:justify-end">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none rounded-xl"
              onClick={() => closeConfirm(false)}
            >
              {confirmState?.cancelText ?? 'Annuler'}
            </Button>
            <Button
              className={cn('flex-1 sm:flex-none rounded-xl', cStyle.btn)}
              onClick={() => closeConfirm(true)}
            >
              {confirmState?.confirmText ?? 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!alertState} onOpenChange={(open) => !open && closeAlert()}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-[#27272A] bg-[#121212] shadow-2xl p-0 overflow-hidden gap-0">
          <div className="p-6 text-center">
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5', aStyle.bg)}>
              <AlertIcon className={cn('w-7 h-7', aStyle.icon)} />
            </div>
            <DialogTitle className="text-lg font-bold text-white">{alertState?.title}</DialogTitle>
            {alertState?.description && (
              <DialogDescription className="mt-1.5 text-sm text-zinc-400">{alertState.description}</DialogDescription>
            )}
          </div>
          <div className="p-4 bg-[#18181B] border-t border-[#27272A]">
            <Button className="w-full rounded-xl" onClick={closeAlert}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context;
}
