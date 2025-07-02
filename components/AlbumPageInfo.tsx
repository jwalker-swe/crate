// 'use client'

// import { useState, useEffect } from 'react';

// const [ infoType, setInfoType ] = useState('Track List');

type AlbumPageInfoProps = {
    currentState: string,
    tracks: {
        name: string,
        track_number: number,
        artists: {
            name: String
        }[]
    }[],
    totalTracks: number
}

const gridTotal = 2;

export default function AlbumPageInfo({ currentState, tracks, totalTracks }: AlbumPageInfoProps) {

    // console.log(`Tracks to get info from: `, tracks[1].artists[2].name);

    switch (currentState) {
        case 'Track List':

            // const gridTotal = 2;

            function getTotalTracksPerCol(num_of_tracks: number) {
                let perGrid = Math.ceil(num_of_tracks / gridTotal);

                return perGrid;
            }

            let tracksPerGrid = getTotalTracksPerCol(totalTracks)
            // console.log(`Tracks Per Grid Column: `, tracksPerGrid);
            
            const trackChunks: any = [];

            for (let i = 0; i < gridTotal; i++) {
                const start = i * tracksPerGrid;
                const end = start + tracksPerGrid;

                trackChunks.push(tracks.slice(start, end));
            }

            // console.log(`Tracks For Each Grid Column: `, trackChunks);

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
            )
        case 'Performed By':

            function getRowsPerCol(num_of_tracks: number) {
                let perGrid = Math.ceil(num_of_tracks / gridTotal);

                return perGrid;
            }

            let rowsPerCol: number = getRowsPerCol(totalTracks);
            let artistsData: any[] = [];
            let artistsNames: any[] = [];

            tracks.forEach(track => {
                return artistsData.push(track.artists);
            });

            artistsData.forEach(artists => {
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

                artistsNames.push(currentArtist)
            })
            
            console.log(`Artists Names: `, artistsNames)

            let artistsChunks: any[] = [];

            for (let i = 0; i < gridTotal; i++) {
                const start = i * rowsPerCol;
                const end = start + rowsPerCol;

                artistsChunks.push(artistsNames.slice(start, end));
            }

            console.log(`Artists Chunks: `, artistsChunks);

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
                    {artistsChunks.map((chunk: any, columnIndex: any) => (
                        <div key={columnIndex} className={`
                            column-${columnIndex + 1}
                            flex flex-col gap-2
                            text-secondaryText
                        `}>
                            {chunk.map((artistName: any, itemIndex: any) => {
                                const originalIndex = columnIndex * rowsPerCol + itemIndex;
                                const trackNumber = originalIndex + 1;

                                return (
                                    <span key={itemIndex} className={`
                                        transition-colors duration-200 ease-in-out
                                        hover:text-accentText
                                    `}>
                                        {`${trackNumber}. ${artistName}`}
                                    </span>
                                )
                            })}
                        </div>
                    ))}
                </div>
            )
        case 'Producers':



            return (
                <div>
                </div>
            )
    }
}