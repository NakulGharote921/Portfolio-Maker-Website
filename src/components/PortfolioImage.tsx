import { useEffect, useState } from 'react'

interface Props {
  src: string
  alt: string
  className?: string
  fallbackClassName?: string
}

function initialsFromTitle(title: string) {
  return title
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function PortfolioImage({
  src,
  alt,
  className,
  fallbackClassName = '',
}: Props) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  if (hasError || !src) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/80 via-secondary/70 to-accent/70 text-white ${fallbackClassName}`}
        aria-label={alt}
        role="img"
      >
        <div className="text-center">
          <div className="text-4xl font-black tracking-[0.2em]">
            {initialsFromTitle(alt)}
          </div>
          <p className="mt-3 text-sm uppercase tracking-[0.3em] text-white/80">
            Portfolio
          </p>
        </div>
      </div>
    )
  }

  return <img src={src} alt={alt} className={className} onError={() => setHasError(true)} />
}
