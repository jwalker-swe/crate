import getAccessToken from "./getAccessToken";
import { search } from 'fast-fuzzy'

export async function searchSpotify(query: string) {
    try {
        const token = await getAccessToken();
        const searchParams = await encodeURIComponent(query)

        // console.log('Encoded Search Params', searchParams);

        const response = await fetch(`https://api.spotify.com/v1/search?q=${searchParams}&type=album,artist&limit=20`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new Error ('No results found')
        }

        const searchData = await response.json();
        return searchData
    } catch (error) {
        console.error(`Error fetching data from Spotify: `, error)
        return
    } 
}
