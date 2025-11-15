'use client';

interface StarsDisplayProps {
  stars: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StarsDisplay({ stars, maxStars = 3, size = 'md' }: StarsDisplayProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: maxStars }).map((_, index) => (
        <span
          key={index}
          className={sizeClasses[size]}
        >
          {index < stars ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}

