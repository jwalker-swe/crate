import getAccessToken from "@/lib/spotify/getAccessToken";

export default async function getTopAlbums() {

    const token = await getAccessToken();
    console.log(token);

    if (!token) {

        console.error('Unable to retrieve Spotify access token');

    } else {
    
        try {
        
            const res = await fetch('https://api.spotify.com/v1/search?q=year:2025&type=album&limit=50', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await res.json();
            // console.log(data);

            return data;

        } catch(err) {

            console.error('Error fetching top albums: ', err);

        }

    }
}