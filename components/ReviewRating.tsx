import { StarIcon } from "@heroicons/react/24/solid";

const getFillPercent = function(rating: number, index: number) {
    const diff = rating - index;
    if ( diff >= 0 ) {
        return 100
    } else if (diff === -0.5) {
        return 50
    } else {
        return 0
    }
}


export default function ReviewRating({ rating }: { rating: number }) {
    return (
        <div className={`
            //General Styling
            flex justify-start items-center gap-2
            //Mobile Styling
            //Desktop Styling
        `}>
            <p className={`
                text-secondaryText
            `}>
                {rating.toFixed(1)}
            </p>
            <div className={`
                rating-container
                //General Styling
                flex justify-center items-center
                //Mobile Styling
                //Desktop Styling
            `}>
                {[1, 2, 3, 4, 5].map((index: number) => {
                    const fillPercentage = getFillPercent(rating, index)

                    return (
                        <div 
                            className={`
                            relative 
                            w-4 h-4
                            `} 
                            key={`star-${index}`}
                        >
                            {/* Background stars */}
                            <StarIcon className={`
                                    text-secondaryText
                                    w-4 h-4
                                `}
                            />

                            {/* Foreground stars */}
                            <div className={`
                                absolute
                                h-full top-0 left-0
                                overflow-hidden
                                pointer-events-none
                            `} style={{
                                width: `${fillPercentage}%`
                            }}>
                                <StarIcon
                                    className={`
                                        w-4 h-m-4
                                        text-accentText
                                    `}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
            {/* Post Date */}
        </div>
    )
}