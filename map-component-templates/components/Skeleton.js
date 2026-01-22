'use client';

export function Skeleton({ width, height, className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        minHeight: height || '1rem',
        ...style
      }}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '80%' : '100%'}
          height="1.25rem"
        />
      ))}
    </div>
  );
}

export function SkeletonButton({ className = '', width = '150px' }) {
  return (
    <Skeleton
      width={width}
      height="48px"
      className={className}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={className} style={{ 
      padding: '2rem', 
      borderRadius: '12px', 
      background: 'rgba(255, 255, 255, 0.03)', 
      border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      width: '100%'
    }}>
      <Skeleton width="60%" height="1.75rem" />
      <SkeletonText lines={3} />
    </div>
  );
}
