import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/supabase";
import getAccessToken from "@/lib/spotify/getAccessToken";

type ResponseData = {
    artists: {
        name: string
    }[]
    spotify_id: string,
    title: string,
    release_data: string
    cover_image_url: string,
    total_tracks: number,
    tracks: {
        href: string,
        items: {
            name: string,
            artists: {
                name: string
            }[]
        }[]
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { id } = req.query
    // Determine by id if album is present in Crate database
    // return album info to populate page if it is
    // else we'll fetch the data from the Spotify Web API
    console.log(id);

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
                    return res.status(200).json(data);
                }


            } catch (err) {
                console.error('An unexpected error occurred while fetching data from Spotify: ', err)
            }
        } else {
        
            return res.status(200).json(albumData)

        }
    } catch (err) {
        return res.status(500).json({
            message: 'An unexpected error occurred while fething album data'
        })
    }

}
