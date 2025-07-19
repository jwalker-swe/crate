'use client'

import { useState, MouseEvent } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'

type StarRatingProps = {
    size?: number
}

export default function StarRating({ size = 8 }: StarRatingProps) {
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const iconSize = size.toString();

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>, starIndex: number) => {
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const isHalf = x < width / 2;
        const value = starIndex - (isHalf ? 0.5 : 0);
        setHoverRating(value);
    };

    const handleClick = (e: MouseEvent<HTMLDivElement>, starIndex: number) => {
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const isHalf = x < width / 2;
        const value = starIndex - (isHalf ? 0.5 : 0);
        setRating(value);
    };

    const getFillPercent = (index: number): number => {
        const active = hoverRating || rating;
        if (active >= index) return 100;
        if (active + 0.5 === index) return 50;
        return 0;
    };

    return (
        <div className={`
            flex
        `}>
            {[1,2,3,4,5].map((i) => {
                const fillPercent = getFillPercent(i);

                return (
                        <div
                            key={i}
                            onMouseMove={(e) => handleMouseMove(e, i)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={(e) => handleClick(e, i)}
                            className={`
                                relative
                                w-${iconSize} h-${iconSize}
                                cursor-pointer
                            `}
                        >
                            {/* Background star (empty) */}
                            <StarIcon className={`
                                w-${iconSize} h-${iconSize}
                                text-secondaryText
                            `}/>
                            {/* Top Star (filled) with width clamped */}
                            <div className={`
                                absolute
                                top-0 left-0
                                h-full
                                overflow-hidden
                                pointer-events-none
                            `} style={{width: `${fillPercent}%`}
                            }>
                                <StarIcon className={`
                                    w-${iconSize} h-${iconSize}
                                    text-accentText
                                `} />
                            </div>
                        </div>
                )
            })}
        </div>
    )
}

