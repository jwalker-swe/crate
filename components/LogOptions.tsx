'use client'

import getReleaseDate from '@/lib/spotify/getReleaseDate'
import getReleaseYear from '@/lib/spotify/getReleaseYear'
import { SpotifyAlbum } from '@/types/spotify'
import { HeartIcon, StarIcon, XMarkIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import React, {useState, useEffect, MouseEvent } from 'react'
import StarRating from './StarRating'
import { createClient } from '@/lib/supabase/client'

interface FormData {
    rating: number | null,
    liked: boolean,
    review: string | null,
}

type AlbumProps = {
    artists: {
        name: string
    }[],
    spotify_id: string
    title: string
    release_date: string
    cover_image_url: string
    total_tracks: number
    tracks: {
        items: {
            name: string,
            track_number: number,
            duration: number
        }[]
    }[]
    rating: null | number
}

const supabase = createClient();


export default function LogOptions({ album, session }: {album: AlbumProps, session: any}) {

    const [activeSession, setActiveSession] = useState<boolean>(session);
    const [logging, setLogging] = useState<boolean>(false);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [rating, setRating] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        rating: null,
        liked: false,
        review: null
    });
    const releaseDate = getReleaseDate(album.release_date);

    const getActiveSession = async function () {
        try {
            const {data: sessionData, error: sessionError} = await supabase.auth.getSession();

            if (sessionError) {
                console.error('Error fetching session data: ', sessionError);
                setActiveSession;
                return
            }
            if (!sessionData.session) {
                console.log('No user session active: ', sessionData);
                setActiveSession(false);
                return
            }
            if (sessionData.session) {
                // console.log('User session active: ', sessionData);
                setActiveSession(true);
                return 
            }
        } catch (err) {
            console.error('An unexpected error occurred while fetching session data: ', err);
        }
    }

    const handleOpen = function() {
        setLogging(true);
    };

    const handleClose = function() {
        setLogging(false);
    };

    const getAlbum = async function() {
            try {
                const { data: albumData, error: albumError } = await supabase
                    .from('albums')
                    .select('id')
                    .eq('spotify_id', album.spotify_id)
                    .single()
                
                if (albumError && albumError.code !== 'PGRST116') {
                    console.error('Error fetching album data: ', albumError)
                    return
                }

                if (albumData) {
                    return albumData.id
                } else {
                    const { data: newAlbumData, error: newAlbumError } = await supabase
                        .from('albums')
                        .insert([
                            {
                                spotify_id: album.spotify_id,
                                title: album.title,
                                artists: album.artists,
                                release_date: album.release_date,
                                cover_image_url: album.cover_image_url,
                                total_tracks: album.total_tracks,
                                tracks: album.tracks
                            }
                        ])
                        .select('id')
                        .single()
                    
                    if (newAlbumError) {
                        console.error('Error inserting album data: ', newAlbumError)
                        return
                    }

                    return newAlbumData.id
                }
            } catch (err) {
                console.error('An unexpected error occurred while fetching album data: ', err)
            }
    }

    const handleSubmit = async function(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true);

        //Send form data to database
        try {
            const {data: { user }, error: userError} = await supabase.auth.getUser();
            if (userError) {
                console.error('An error occurred while fetching user data: ', userError)
            }

            const albumId = await getAlbum();
            console.log('AlbumId: ', albumId);

            if (user) {
                const { error } = await supabase
                    .from('user_albums')
                    .insert([
                        {
                            user_id: user.id,
                            album_id: albumId,
                            rating: formData.rating,
                            review_text: formData.review,
                            is_favorite: formData.liked, // Map 'liked' to 'is_favorite' database column
                        }
                    ])
                    if (error) {
                        console.error('Error inserting data: ', error)
                    } else {
                        console.log('Review submitted successfully')
                        handleClose()
                    }
            }
        } catch (err) {
            console.error('An unexpected error occurred while fetching user data: ', err)
        }
        setIsSubmitting(false);
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
        setFormData(prev => ({
            ...prev,
            rating: value
        }));
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

    useEffect(() => {
        getActiveSession()
    }, [])


    if (activeSession) {
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
                        w-full max-w-[942px] h-fit
                        mx-4
                        p-4
                        bg-secondaryBackground
                        rounded-lg
                        drop-shadow-
                        sm:p-6
                        md:p-8 md:mx-auto
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
                            flex flex-col items-start gap-4
                            md:flex-row md:justify-between md:gap-8
                        `}>
                            <div className={`
                                cover-container
                                w-full
                                flex justify-center
                                md:w-auto
                            `}>
                                <img src={album.cover_image_url} width={334} height={334} className={`
                                    rounded-sm
                                    w-full max-w-[200px]
                                    sm:max-w-[250px]
                                    md:max-w-[334px] md:w-[334px]
                                `}/>
                            </div>
                            <div className={`
                                form-container
                                flex flex-col justify-start items-start flex-grow
                                w-full
                                md:w-[512px]
                            `}>
                                <h2 className={`
                                    text-3xl font-bold
                                    line-clamp-2
                                `}>
                                    {album.title}
                                </h2>
                                <p className={`
                                    text-accentText
                                `}>
                                    {album.artists[0].name}
                                </p>
                                <form onSubmit={handleSubmit}
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
                                            <button type='button' onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    liked: !prev.liked
                                                }))
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
                                            focus:h-[55vh] focus:outline-none
                                        `}
                                        placeholder='Add a review...'
                                        id='review'
                                        name='review'
                                        value={formData.review || ''}
                                        onChange={(e) => setFormData(prev => (
                                            {
                                                ...prev,
                                                review: e.target.value 
                                            }
                                        ))}
                                    />
                                    <div className={`
                                        flex justify-end items-center
                                        w-full
                                        md:w-[462px]
                                    `}>
                                        <button 
                                            type='submit' 
                                            className={`
                                                w-full
                                                mt-2 px-4 py-2
                                                rounded-sm
                                                cursor-pointer
                                                bg-accentText
                                                hover:bg-primaryButtonHover hover:text-primaryTextHover
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                            `}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </section>
                    </div>
                </div>
            </>
        )
    } else {
        return (
            <></>
        )
    }
}