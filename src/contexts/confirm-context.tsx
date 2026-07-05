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
  danger: { icon: 'text-red-500', bg: 'bg-red-50', btn: 'bg-red-600 hover:bg-red-700' },
  warning: { icon: 'text-amber-500', bg: 'bg-amber-50', btn: 'bg-amber-600 hover:bg-amber-700' },
  default: { icon: 'text-[#FF6600]', bg: 'bg-orange-50', btn: 'bg-[#FF6600] hover:bg-[#e55a00]' },
};

const alertIcons: Record<AlertVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const alertStyles: Record<AlertVariant, { icon: string; bg: string }> = {
  success: { icon: 'text-emerald-500', bg: 'bg-emerald-50' },
  error: { icon: 'text-red-500', bg: 'bg-red-50' },
  info: { icon: 'text-blue-500', bg: 'bg-blue-50' },
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
        <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-0 overflow-hidden gap-0">
          <div className="p-6">
            <DialogHeader className="space-y-4">
              <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mx-auto sm:mx-0', cStyle.bg)}>
                <ConfirmIcon className={cn('w-7 h-7', cStyle.icon)} />
              </div>
              <div className="text-center sm:text-left">
                <DialogTitle className="text-xl text-[#0A2240]">{confirmState?.title}</DialogTitle>
                {confirmState?.description && (
                  <DialogDescription className="mt-2 text-base">{confirmState.description}</DialogDescription>
                )}
              </div>
            </DialogHeader>
          </div>
          <DialogFooter className="flex-row gap-3 p-4 bg-gray-50 border-t sm:justify-end">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none rounded-xl"
              onClick={() => closeConfirm(false)}
            >
              {confirmState?.cancelText ?? 'Annuler'}
            </Button>
            <Button
              className={cn('flex-1 sm:flex-none rounded-xl text-white', cStyle.btn)}
              onClick={() => closeConfirm(true)}
            >
              {confirmState?.confirmText ?? 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!alertState} onOpenChange={(open) => !open && closeAlert()}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl p-0 overflow-hidden gap-0">
          <div className="p-6 text-center">
            <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4', aStyle.bg)}>
              <AlertIcon className={cn('w-8 h-8', aStyle.icon)} />
            </div>
            <DialogTitle className="text-xl text-[#0A2240]">{alertState?.title}</DialogTitle>
            {alertState?.description && (
              <DialogDescription className="mt-2 text-base">{alertState.description}</DialogDescription>
            )}
          </div>
          <div className="p-4 bg-gray-50 border-t">
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
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm doit être utilisé dans ConfirmProvider');
  return ctx;
}
