// Get list of top albums
import { NextApiRequest, NextApiResponse } from "next";

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

// Get access token to access Spotify Web API
async function getAccessToken() {

    if ( !accessToken && Date.now() < tokenExpiresAt ) {
        return accessToken;
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: 
                'Basic ' +
                Buffer.from(`${process.env.SPOTIFY_API_CLIENT_ID}:${process.env.SPOTIFY_API_CLIENT_SECRET}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
        }),
    });

    const data = await response.json();
    accessToken = data.accessToken;

    return accessToken;

}

export default async function handler( req:NextApiRequest, res:NextApiResponse ) {

    const token = await getAccessToken();

    const albumsRes = await fetch(`https://api.spotify.com/v1/browse/new-releases?limit=5`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const albumsData = await albumsRes.json();
    const albums = albumsData.albums.items;

}