import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  count?: number;
}

const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };

export function StarRating({
  value,
  onChange,
  size = 'md',
  readonly,
  showValue,
  count,
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="inline-flex items-center gap-1">
      {stars.map((n) => {
        const filled = n <= Math.round(value);
        return (
          <button
            key={n}
            type="button"
            disabled={readonly || !onChange}
            onClick={() => onChange?.(n)}
            className={cn(
              'p-0.5 transition-transform',
              onChange && !readonly && 'hover:scale-110 cursor-pointer',
              (readonly || !onChange) && 'cursor-default'
            )}
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                sizes[size],
                filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
              )}
            />
          </button>
        );
      })}
      {showValue && value > 0 && (
        <span className="text-xs text-gray-500 ml-1">
          {value.toFixed(1)}
          {count != null ? ` (${count})` : ''}
        </span>
      )}
    </div>
  );
}
