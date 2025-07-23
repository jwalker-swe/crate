import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/supabase";
import getAccessToken from "@/lib/spotify/getAccessToken";

type AlbumDataProps = {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { id } = req.query

    // Determine by id if album is present in Crate database
    // return album info to populate page if it is
    // else we'll fetch the data from the Spotify Web API

    try {
    
        const { data: albumData, error: albumError } = await supabase
            .from('albums')
            .select('*')
            .eq('spotify_id', id)
            .single()

        if (albumError) {
            console.error('Error fetching data from Crate: ', albumError)
        }

        if (!albumData) {

            try {

                // Get Access Token for Spotify Web Api
                const token = await getAccessToken()

                // Fetch album data from Spotify Web Api
                const spotifyRes = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                })  

                if (!spotifyRes.ok) {
                    throw new Error('Failed to fetch album from Spotify');
                } else {
                    const data = await spotifyRes.json()  
                    const spotifyAlbumData: AlbumDataProps = {
                        artists: data.artists,
                        spotify_id: data.id,
                        title: data.name,
                        release_date: data.release_date,
                        cover_image_url: data.images[0].url,
                        total_tracks: data.total_tracks,
                        tracks: data.tracks,
                        rating: null
                    }

                    return res.status(200).json(spotifyAlbumData);
                }


            } catch (err) {
                console.error('An unexpected error occurred while fetching data from Spotify: ', err)
            }
        } else {

            // Set rating to null by default before trying to fetch ratings from crate db
            const crateAlbumData: AlbumDataProps = {
                artists: albumData.artists,
                spotify_id: albumData.spotify_id,
                title: albumData.title,
                release_date: albumData.release_date,
                cover_image_url: albumData.cover_image_url,
                total_tracks: albumData.total_tracks,
                tracks: albumData.tracks, 
                rating: albumData.rating
            }

            return res.status(200).json(crateAlbumData)
            
        }
    } catch (err) {
        return res.status(500).json({
            message: 'An unexpected error occurred while fething album data'
        })
    }

}
