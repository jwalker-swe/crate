'use client'

import { useState } from 'react'

type NewsImageProps = {
    src: string | null
    alt: string
    className?: string
}

function PlaceholderIcon({ className }: { className: string }) {
    return (
        <div className={`bg-gradient-to-br from-tertiaryBackground to-secondaryBackground flex items-center justify-center ${className}`}>
            <svg 
                className="w-12 h-12 text-secondaryText/50" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
                />
            </svg>
        </div>
    )
}

export default function NewsImage({ src, alt, className = '' }: NewsImageProps) {
    const [hasError, setHasError] = useState(false)

    // Show placeholder if no src, empty string, or image failed to load
    const showPlaceholder = !src || src.trim() === '' || hasError

    if (showPlaceholder) {
        return <PlaceholderIcon className={className} />
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
        />
    )
}
