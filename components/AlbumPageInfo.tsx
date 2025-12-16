'use client'

import { useState, useEffect } from 'react';
import { AlbumPageInfoProps } from '@/types/spotify';

export default function AlbumPageInfo({ tracks, totalTracks }: AlbumPageInfoProps) {

    // Set all state variable for Album Info Section. This let us dynamically load
    // different information to display
    const [infoState, setInfoState] = useState('Track List');



    // Set total number of grid columns to determine how many tracks will be listed in each column
    const gridColumnTotal = 2;
    
    function getRowsPerGridColumn() {
        return Math.ceil(totalTracks / gridColumnTotal);
    }

    const rowsPerGridColumn = getRowsPerGridColumn();

    let trackChunks: any[] = [];

    for(let i = 0; i < gridColumnTotal; i++) {
        const start = i * rowsPerGridColumn;
        const end = start + rowsPerGridColumn;

        trackChunks.push(tracks.slice(start, end));
    }

    let artistChunks: any[] = [];
    let artistData: any[] = [];
    let artistNames: any[] = [];

    tracks.forEach(track => {
        return artistData.push(track.artists)
    });

    artistData.forEach(artists => {
        let currentArtist: any[] = [];
        artists.map((artist: any, artistIndex: any) => {
            let name: string;
            if ( artistIndex > 0 ) {
                name = ' ' + artist.name;
            } else {
                name = artist.name;
            }
            currentArtist.push(name);
        })
        artistNames.push(currentArtist)
    })

    for (let i = 0; i < gridColumnTotal; i++) {
        const start = i * rowsPerGridColumn;
        const end = start + rowsPerGridColumn;

        artistChunks.push(artistNames.slice(start, end));
    }

    return (
        <div className={`
            w-full
            flex flex-col justify-start items-start
            mt-8
        `}>
            {/* Segmented Control - Framer Style */}
            <div className={`
                w-full
                flex items-center
                mb-8
                p-1
                bg-secondaryBackground/80
                rounded-xl
                backdrop-blur-sm
                border border-primaryBorder/20
            `}>
                <button
                    onClick={() => setInfoState('Track List')}
                    className={`
                        flex-1
                        px-4 py-2.5
                        text-sm font-medium
                        rounded-lg
                        transition-all duration-300 ease-out
                        ${infoState === 'Track List' 
                            ? 'bg-tertiaryBackground text-primaryText shadow-sm' 
                            : 'text-secondaryText hover:text-primaryText'
                        }
                    `}
                >
                    Track List
                </button>
                <button
                    onClick={() => setInfoState('Performed By')}
                    className={`
                        flex-1
                        px-4 py-2.5
                        text-sm font-medium
                        rounded-lg
                        transition-all duration-300 ease-out
                        ${infoState === 'Performed By' 
                            ? 'bg-tertiaryBackground text-primaryText shadow-sm' 
                            : 'text-secondaryText hover:text-primaryText'
                        }
                    `}
                >
                    Performed By
                </button>
            </div>

            {/* Track List Content - Framer Style */}
            {infoState === 'Track List' && (
                <div className={`
                    w-full
                    bg-secondaryBackground/90
                    backdrop-blur-md
                    rounded-2xl
                    border border-primaryBorder/20
                    p-6
                    sm:p-8
                    shadow-sm
                `}>
                    <div className={`
                        w-full
                        grid grid-cols-1
                        md:grid-cols-2
                        gap-x-10 gap-y-4
                    `}>
                        {trackChunks.map((chunk: any, columnIndex: number) => (
                            <div key={columnIndex} className={`
                                flex flex-col gap-4
                            `}> 
                                {chunk.map((songTitle: any, itemIndex: number) => {
                                    const originalIndex = columnIndex * rowsPerGridColumn + itemIndex;
                                    const trackNumber = originalIndex + 1;

                                    return (
                                        <div 
                                            key={itemIndex} 
                                            className={`
                                                flex items-center gap-4
                                                group
                                                py-2
                                                -mx-2 px-2
                                                rounded-lg
                                                transition-all duration-200 ease-out
                                                hover:bg-accentText/8
                                            `}
                                        >
                                            <span className={`
                                                text-secondaryText
                                                text-xs
                                                font-semibold
                                                min-w-[2.5rem]
                                                flex-shrink-0
                                                tracking-wider
                                                group-hover:text-accentText
                                                transition-colors duration-200
                                            `}>
                                                {String(trackNumber).padStart(2, '0')}
                                            </span>
                                            <span className={`
                                                text-primaryText
                                                text-sm
                                                flex-1
                                                group-hover:text-accentText
                                                transition-colors duration-200
                                            `}>
                                                {songTitle.name}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Performed By Content - Framer Style */}
            {infoState === 'Performed By' && (
                <div className={`
                    w-full
                    bg-secondaryBackground/90
                    backdrop-blur-md
                    rounded-2xl
                    border border-primaryBorder/20
                    p-6
                    sm:p-8
                    shadow-sm
                `}>
                    <div className={`
                        w-full
                        grid grid-cols-1
                        md:grid-cols-2
                        gap-x-10 gap-y-4
                    `}>
                        {artistChunks.map((chunk: any, columnIndex: any) => (
                            <div key={columnIndex} className={`
                                flex flex-col gap-4
                            `}>
                                {chunk.map((artistName: any, artistIndex: any) => {
                                    const originalIndex: number = columnIndex * rowsPerGridColumn + artistIndex;
                                    const trackNumber: number = originalIndex + 1;

                                    return (
                                        <div 
                                            key={artistIndex} 
                                            className={`
                                                flex items-center gap-4
                                                group
                                                py-2
                                                -mx-2 px-2
                                                rounded-lg
                                                transition-all duration-200 ease-out
                                                hover:bg-accentText/8
                                            `}
                                        >
                                            <span className={`
                                                text-secondaryText
                                                text-xs
                                                font-semibold
                                                min-w-[2.5rem]
                                                flex-shrink-0
                                                tracking-wider
                                                group-hover:text-accentText
                                                transition-colors duration-200
                                            `}>
                                                {String(trackNumber).padStart(2, '0')}
                                            </span>
                                            <span className={`
                                                text-primaryText
                                                text-sm
                                                flex-1
                                                group-hover:text-accentText
                                                transition-colors duration-200
                                            `}>
                                                {Array.isArray(artistName) ? artistName.join(', ') : artistName}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}