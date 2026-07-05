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
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
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
        src="/favicon.png"
        alt="Service Express CI"
        className={cn(sizeMap[size], 'rounded-lg object-contain shrink-0')}
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
