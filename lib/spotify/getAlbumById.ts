import { SpotifyAlbumsResponse } from "@/types/spotify";
import getAccessToken from "./getAccessToken";

export default async function getAlbumById(id: string) {

    const token = await getAccessToken();

    if (!token) {
        console.error('Failed to fetch access token');
    } 

    // console.log('Token: ', token);

    const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch album');
    }

    const data: SpotifyAlbumsResponse = await res.json();
    // console.log(data);

    return data;
}