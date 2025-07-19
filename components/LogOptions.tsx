'use client'

import getReleaseDate from '@/lib/spotify/getReleaseDate'
import getReleaseYear from '@/lib/spotify/getReleaseYear'
import { SpotifyAlbum } from '@/types/spotify'
import { HeartIcon, StarIcon, XMarkIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import React, {useState, useEffect, MouseEvent } from 'react'
import StarRating from './StarRating'

interface FormData {
    rating: number | null,
    liked: boolean,
    review: string | null,
}


export default function LogOptions({ album }: {album: SpotifyAlbum}) {

    const [logging, setLogging] = useState<boolean>(false);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [rating, setRating] = useState<number>(0);
    const [formData, setFormData] = useState<FormData>({
        rating: null,
        liked: false,
        review: null
    });
    const releaseDate = getReleaseDate(album.release_date)

    const handleOpen = function() {
        setLogging(true);
    };

    const handleClose = function() {
        setLogging(false);
    };

    const handleSubmit = async function(e: React.FormEvent) {
        e.preventDefault()

        
    }

    const handleMouseMove = function(e: MouseEvent<HTMLDivElement>, starIndex: number) {
        const {left, width} = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const isHalf = x < width / 2;
        const value = starIndex - (isHalf ? 0.5 : 0);
        setHoverRating(value)
    }

    const handleClick = function(e: MouseEvent<HTMLDivElement>, starIndex: number) {
        const {left, width} = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - left;
        const isHalf = x < width / 2;
        const value = starIndex - (isHalf ? 0.5 : 0); 
        setRating(value);
    }

    const getFillPercent = function(index: number): number {
        const active = hoverRating || rating;
        if (active >= index) {
            return 100
        } else if (active + 0.5 === index) {
            return 50
        } else {
            return 0
        }
    }

    useEffect(() => {
        if (logging) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }, [logging])


    return (
        <>
            <div className={`
                log-button-container
                mt-4
            `}>
                <button onClick={() => {
                    handleOpen()
                }} className={`
                    log-button
                    px-8 py-2
                    bg-accentText
                    rounded-lg
                    hover:bg-primaryButtonHover 
                    hover:text-primaryTextHover
                    hover:cursor-pointer 
                `}>
                    Log Album
                </button>
            </div>
            <div className={`
                modal-container-bg
                w-screen h-full
                absolute
                bg-secondarBackground/50
                inset-0
                backdrop-blur-3xl
                z-50
                flex justify-center items-center
                ${logging ? `visible scale-100` : `hidden scale-0`}
                transition-all duration-200 ease-in-out
            `}>
                <div className={`
                    modal-container
                    w-[942px] h-fit
                    p-8
                    bg-secondaryBackground
                    rounded-lg
                    drop-shadow-
                `}>
                    <div className={`
                        header-container
                        w-full h-fit
                        flex justify-end items-center
                    `}>
                        <button onClick={handleClose}
                            className={`
                                cursor-pointer
                            `}
                        >
                            <XMarkIcon className={`
                                w-9 h-9
                                hover:text-accentText
                                transition-colors duration-200 ease-in-out
                            `} />
                        </button>
                    </div>
                    <section className={`
                        body-container
                        w-full h-fit mt-4
                        flex justify-between items-start gap-8
                    `}>
                        <div className={`
                            cover-container
                        `}>
                            <img src={album.images[0].url} width={334} height={334} className={`
                                rounded-sm
                            `}/>
                        </div>
                        <div className={`
                            form-container
                            flex flex-col justify-start items-start flex-grow
                            w-[512px]
                        `}>
                            <h2 className={`
                                text-3xl font-bold
                                line-clamp-2
                            `}>
                                {album.name}
                            </h2>
                            <p className={`
                                text-accentText
                            `}>
                                {album.artists[0].name}
                            </p>
                            <form onClick={() => {}}
                                className={`
                                    w-full
                                `}
                            >
                                <div className={`
                                    mt-6
                                    flex justify-start items-center gap-8
                                `}>
                                    <div className={`
                                        rating-container
                                        w-fit h-fit flex justify-start items-center gap-2
                                    `}>
                                        <h3 className={`
                                            font-medium
                                        `}>
                                            Rating:
                                        </h3>
                                        <div className={`
                                            flex justify-start items-center
                                        `}>
                                            {[1,2,3,4,5].map((i) => {
                                                const fillPercent = getFillPercent(i)

                                                return (
                                                    <div 
                                                        key={i}
                                                        onMouseMove={(e) => {handleMouseMove(e, i)}}
                                                        onMouseLeave={() => {setHoverRating(0)}}
                                                        onClick={(e) => {handleClick(e, i)}}
                                                        className={`
                                                            relative 
                                                            w-6 h-6
                                                            cursor-pointer
                                                        `}
                                                    >
                                                        {/* Background Star (empty) */}
                                                        <StarIcon 
                                                            className={`
                                                                w-6 h-6
                                                                text-secondaryText
                                                            `}
                                                        />

                                                        {/* Foreground Star (filled) with width clipped */}
                                                        <div 
                                                            className={`
                                                                absolute
                                                                h-full top-0 left-0
                                                                overflow-hidden
                                                                pointer-events-none
                                                            `}
                                                            style={{width: `${fillPercent}%`}}
                                                        >
                                                            <StarIcon 
                                                                className={`
                                                                    w-6 h-6
                                                                    text-accentText
                                                                `}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className={`
                                        like-container
                                        w-fit h-fit
                                        flex justify-start items-center gap-2
                                    `}>
                                        <h3 className={`
                                            font-medium
                                        `}>
                                            Like: 
                                        </h3>
                                        <button type='button' onClick={async () => {
                                            await setFormData(prev => ({
                                                ...prev,
                                                liked: !prev.liked
                                            }))
                                            console.log(formData.liked)
                                        }}>
                                            <HeartIcon 
                                                className={`
                                                    w-6 h-6
                                                    ${formData.liked ? 'text-accentText' : 'text-secondaryText'}
                                                    hover:text-accentText
                                                    cursor-pointer
                                                `}
                                            />
                                        </button>
                                    </div>
                                </div>
                                {/* <p className={`
                                    text-sm
                                    mt-2
                                `}>
                                    Placeholder for check listed on and listened before check boxes
                                </p> */}
                                <textarea 
                                    className={`
                                        w-[90%] h-32 mt-3 p-2
                                        rounded-sm
                                        bg-[#2A2C30]
                                        font-text
                                        resize-none
                                        focus:h-96 focus:outline-none
                                    `}
                                    placeholder='Add a review...'
                                    id='review'
                                    name='review'
                                />
                                <div className={`
                                    flex justify-end items-center
                                    w-[462px]
                                `}>
                                    <button 
                                        onClick={() => {
                                            handleSubmit
                                        }}    
                                        className={`
                                            w-full
                                            mt-2 px-4 py-2
                                            rounded-sm
                                            cursor-pointer
                                            bg-accentText
                                            hover:bg-primaryButtonHover hover:text-primaryTextHover
                                        `}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}