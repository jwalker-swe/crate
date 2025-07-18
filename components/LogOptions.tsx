'use client'

import { SpotifyAlbum } from '@/types/spotify'
import { XMarkIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import {useState, useEffect } from 'react'


export default function LogOptions({ album }: {album: SpotifyAlbum}) {

    const [logging, setLogging] = useState<boolean>(false)
    const [size, setSize] = useState<string>('0')

    const handleOpen = function() {
        setLogging(true);
    }

    const handleClose = function() {
        setLogging(false);
    }

    console.log('Album Info: ', album)

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
                    flex flex-col justify-start items-start
                    bg-secondaryBackground
                    shadow-[0_0_60px_10px]
                    shadow-primaryButtonHover/10
                    p-8
                    rounded-lg
                    w-3xl h-96
                    z-100
                `}>
                    <div className={`
                        w-full
                        flex justify-end items-center
                    `}>
                        <button onClick={handleClose}>
                            <XMarkIcon className={`
                                w-8 h-8
                                text-secondaryText
                                hover:cursor-pointer hover:text-primaryTextHover
                            `}/>
                        </button>
                    </div>
                    <div className={`
                        mt-4
                        flex justify-between items-start gap-4
                    `}>
                        <img src={album.images[0].url} width={248} height={248} className={`
                            rounded-lg
                        `}/>
                        <div className={`
                            flex flex-col justify-start items-center
                        `}>
                            <h2 className={`
                                text-3xl
                                font-bold
                                line-clamp-1
                            `}>
                                {album.name}
                            </h2>
                            <div className={`
                                flex 
                            `}>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}