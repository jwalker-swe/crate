'use client'

import { useState, useEffect } from 'react';
import { AlbumPageInfoProps } from '@/types/spotify';

export default function AlbumPageInfo({ tracks, totalTracks }: AlbumPageInfoProps) {

    const [infoState, setInfoState] = useState('Track List');

    // Set total number of grid columns to determine how many tracks will be listed in each column
    const gridColumnTotal = 2;
    
    function getRowsPerGridColumn() {
        return Math.ceil(totalTracks / gridColumnTotal);
    }

    const rowsPerGridColumn = getRowsPerGridColumn();

    console.log(`Rows Per Grid Column: `, rowsPerGridColumn);
    console.log(`Total Tracks Fetched: `, totalTracks);
    console.log(`Tracks Fetched: `, tracks);

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
                `}>
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
                `}>
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
                `}>
                    Producers
                </li>
            </ul>
            <div className={`
                //General Styling
                w-full
                grid grid-cols-[${gridColumnTotal}]
                mt-4 p-4
                bg-secondaryBackground
                rounded-lg
                //Mobile Styling
                //Desktop Styling
            `}>
            </div>
        </div>
    )
}