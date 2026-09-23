import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  to?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  textClassName?: string;
  onClick?: () => void;
}

const sizeMap = {
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
};

export function BrandLogo({
  to,
  showText = true,
  size = 'md',
  className,
  textClassName,
  onClick,
}: BrandLogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2.5', className)} onClick={onClick}>
      <img
        src="/favicon.jpeg"
        alt="Service Express CI"
        className={cn(
          sizeMap[size],
          'rounded-xl object-cover shrink-0 ring-1 ring-black/5 shadow-sm'
        )}
      />
      {showText && (
        <span className={cn('font-bold tracking-tight leading-tight', textClassName)}>
          Service Express <span className="text-[#FF6600]">CI</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex" onClick={onClick}>
        {content}
      </Link>
    );
  }

  return content;
}
