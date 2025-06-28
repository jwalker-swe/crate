import getAccessToken from "@/lib/spotify/getAccessToken";

export default async function getTopAlbums() {

    const token = await getAccessToken();
    console.log(token);

    if (!token) {

        console.error('Unable to retrieve Spotify access token');

    } else {
    
        try {

            const searchURL = 'https://api.spotify.com/v1/search?q=';
            const searchQuery: any = ['tag:new'];
            const encodedQuery = encodeURIComponent(searchQuery);

            const browseURL = 'https://api.spotify.com/v1/browse/new-releases?';

            const res = await fetch(`${searchURL}${encodedQuery}&type=album&limit=50`, {
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