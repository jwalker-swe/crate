import getAccessToken from "./getAccessToken";

export default async function getAlbumPopularity(id: string, accessToken: string) {
    const token = accessToken;
    
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
    
        const data = await res.json();
        const popularity: number = await data.popularity;
        // console.log(data);
    
        return popularity;
}