import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RefreshDataButtonProps {
  className?: string;
  variant?: 'ghost' | 'outline' | 'default';
  label?: string;
  dark?: boolean;
}

/** Invalide le cache React Query pour rafraîchir données / notifs sans recharger la page */
export function RefreshDataButton({
  className,
  variant = 'ghost',
  label,
  dark,
}: RefreshDataButtonProps) {
  const queryClient = useQueryClient();
  const [spinning, setSpinning] = useState(false);

  const refresh = async () => {
    setSpinning(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setSpinning(false), 600);
  };

  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      onClick={refresh}
      title="Rafraîchir les données"
      className={cn(
        'rounded-xl gap-1.5',
        dark && 'text-white/80 hover:text-white hover:bg-white/10',
        className
      )}
    >
      <RefreshCw className={cn('w-4 h-4', spinning && 'animate-spin')} />
      {label ? <span className="hidden sm:inline text-xs">{label}</span> : null}
    </Button>
  );
}
