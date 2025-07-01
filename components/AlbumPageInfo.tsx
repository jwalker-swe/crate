// 'use client'

// import { useState, useEffect } from 'react';

// const [ infoType, setInfoType ] = useState('Track List');

type AlbumPageInfoProps = {
    currentState: string,
    tracks: {
        name: string,
        track_number: number
    }[],
    totalTracks: number
}

export default function AlbumPageInfo({ currentState, tracks, totalTracks }: AlbumPageInfoProps) {

    switch (currentState) {
        case 'Track List':

            const gridTotal = 2;

            function getTotalTracksPerCol(num_of_tracks: number) {
                let perGrid = Math.ceil(num_of_tracks / gridTotal);

                return perGrid;
            }

            let tracksPerGrid = getTotalTracksPerCol(totalTracks)
            console.log(`Tracks Per Grid Column: `, tracksPerGrid);
            
            const trackChunks: any = [];

            for (let i = 0; i < gridTotal; i++) {
                const start = i * tracksPerGrid;
                const end = start + tracksPerGrid;

                trackChunks.push(tracks.slice(start, end));
            }

            console.log(`Tracks For Each Grid Column: `, trackChunks);

            return (
                <div className={`
                    container
                    //General Styling
                    grid grid-cols-${gridTotal} gap-4
                    mt-4
                    p-4
                    rounded-lg
                    bg-secondaryBackground 
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    {trackChunks.map((chunk: any, columnIndex: any) => (
                        <div key={columnIndex} className={`
                            column-${columnIndex + 1}
                            flex flex-col gap-2
                            text-secondaryText
                        `}>
                            {chunk.map((songTitle: any, itemIndex: any) => {
                                const originalIndex = columnIndex * tracksPerGrid + itemIndex;
                                const trackNumber = originalIndex + 1;

                                return (
                                    <span key={itemIndex} className={`
                                    `}>
                                        {`${trackNumber}. ${songTitle.name}`}
                                    </span>
                                )
                            })}
                        </div>
                    ))}
                </div>
            )
        case 'Features':
            return (
                <div>
                </div>
            )
        case 'Producers':
            return (
                <div>
                </div>
            )
    }
}