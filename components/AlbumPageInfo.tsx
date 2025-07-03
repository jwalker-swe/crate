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

    // console.log(`Rows Per Grid Column: `, rowsPerGridColumn);
    // console.log(`Total Tracks Fetched: `, totalTracks);
    // console.log(`Tracks Fetched: `, tracks);

    let trackChunks: any[] = [];

    for(let i = 0; i < gridColumnTotal; i++) {
        const start = i * rowsPerGridColumn;
        const end = start + rowsPerGridColumn;

        trackChunks.push(tracks.slice(start, end));
    }

    console.log(`Track Chunks: `, trackChunks);


    return (
        <div className={`
            //General Styling
            w-full
            flex flex-col justify-start items-start
            //Mobile Stylings
            //Desktop Styling
        `}>
            <ul className={`
                //General Styling
                flex justify-start items-center
                text-xl text-secondaryText
                //Mobile Styling
                //Desktop Styling
            `}>
                <li className={`
                    //General Styling
                    mr-4
                    ${infoState === 'Track List' ? 'text-accentText border-accentText': 'border-secondaryText'}
                    ${infoState !== 'Track List' ? 'hover:text-accentText hover:border-accentText hover:cursor-pointer': ''}
                    border-b-2
                    //Mobile Styling
                    //Desktop Styling
                `} onClick={() => {
                    if ( infoState !== 'Track List' ) {
                        setInfoState('Track List');
                    }
                }}>
                    Track List
                </li>
                <li className={`
                    //General Styling
                    mr-4
                    ${infoState === 'Performed By' ? 'text-accentText border-accentText': 'border-secondaryText'}
                    ${infoState !== 'Performed By' ? 'hover:text-accentText hover:border-accentText hover:cursor-pointer': ''}
                    border-b-2
                    //Mobile Styling
                    //Desktop Styling
                `} onClick={() => {
                    if ( infoState !== 'Performed By' ) {
                        setInfoState('Performed By');
                    }
                }}>
                    Performed By
                </li>
                <li className={`
                    //General Styling
                    mr-4
                    ${infoState === 'Producers' ? 'text-accentText border-accentText': 'border-secondaryText'}
                    ${infoState !== 'Producers' ? 'hover:text-accentText hover:border-accentText hover:cursor-pointer': ''}
                    border-b-2
                    //Mobile Styling
                    //Desktop Styling
                `} onClick={() => {
                    if ( infoState !== 'Producers' ) {
                        setInfoState('Producers');
                    }
                }}>
                    Producers
                </li>
            </ul>
            <div className={`
                //General Styling
                w-full
                ${infoState !== 'Track List' ? 'hidden' : ''}
                grid grid-cols-${gridColumnTotal}
                mt-4 p-4
                bg-secondaryBackground
                rounded-lg
                //Mobile Styling
                //Desktop Styling
            `}>
                {trackChunks.map((chunk: any, columnIndex: number) => (
                    <div key={columnIndex} className={`
                        column-${columnIndex + 1}
                        flex flex-col gap-2
                        text-secondaryText
                    `}> 
                        {chunk.map((songTitle: any, itemIndex: number) => {
                            const originalIndex = columnIndex * rowsPerGridColumn + itemIndex;
                            const trackNumber = originalIndex + 1;

                            return (
                                <span key={itemIndex} className={`
                                    transition-colors duration-200 ease-in-out
                                    hover:text-accentText
                                `}>
                                    {`${trackNumber}. ${songTitle.name}`}
                                </span>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}