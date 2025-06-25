// Get list of top albums
import type { NextApiRequest, NextApiResponse } from "next";

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

// Get access token to access Spotify Web API
async function getAccessToken() {

    if ( accessToken && Date.now() < tokenExpiresAt ) {
        return accessToken;
    }

    const clientID = process.env.SPOTIFY_API_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_API_CLIENT_SECRET;


    if ( !clientID || !clientSecret ) {
        console.error('Missing SPOTIFY_API_CLIENT_ID or SPOTIFY_API_CLIENT_SECRET');
        return null;
    }

    const credentials = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');

    try {

        const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                Authorization: 
                    `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('Failed to get access token:', data);
            return null
        }
        
        accessToken = data.access_token;
        console.log(`Access Token: ${accessToken}`);
        tokenExpiresAt = Date.now() + data.expires_in * 1000;

        return accessToken;

    } catch (err) {

        console.error('Error fetching access token:', err);
        return null;

    }

}

export default async function handler( req: NextApiRequest, res: NextApiResponse ) {

    const token = await getAccessToken();
    console.log(token);
    
    if (!token) {

        return res.status(500).json({error: 'Unable to retrieve Spotify access token'});

    }

    try {

        const albumsRes = await fetch(`https://api.spotify.com/v1/browse/new-releases?limit=30`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await albumsRes.json();
        console.log(data);

        if (!albumsRes.ok) {
            return res.status(albumsRes.status).json({error: data});
        }

        return res.status(200).json(data);

    } catch (err) {

        console.error('Error fetching top albums:', err);
        return res.status(500).json({error: 'Failedd to fetch top albums'});

    }


}