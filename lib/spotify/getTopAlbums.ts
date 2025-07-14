import getAccessToken from "@/lib/spotify/getAccessToken";
import getAlbumPopularity from "@/lib/spotify/getAlbumPopularity";

export default async function getTopAlbums() {

    const token = await getAccessToken();
    // console.log(token);

    if (!token) {

        console.error('Unable to retrieve Spotify access token');

    } else {
    
        try {

            const currentYear = new Date().getFullYear();
            const oneMonthAgo = new Date();
            oneMonthAgo.setDate(oneMonthAgo.getDate() - 35);

            let albums: any = [];

            const searchQuery = `year:${currentYear}`;
            const encodedQuery = encodeURIComponent(searchQuery);
            const searchURL = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=album&limit=50&market=US`;

            //Fetch Albums
            const res = await fetch(`${searchURL}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await res.json();

            const fetchedAlbums: any[] = [];
            data.albums.items.map((item: any) => {
                if ( item.album_type === 'album' ) {
                    fetchedAlbums.push(item);
                }
            })

            const recentAlbums: any[] = [];
            fetchedAlbums.map((album: any) => {
                const releaseDate = new Date(album.release_date);
                if ( releaseDate >= oneMonthAgo ) {
                    recentAlbums.push(album);
                }
                // console.log(releaseDate)
            })

            const popularAlbums: any[] = [];
            for (const album of recentAlbums ) {
                const res = await fetch(`https://api.spotify.com/v1/albums/${album.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                const popularity = data.popularity;
                if ( popularity >= 80 ) {
                    popularAlbums.push(album);
                }
                console.log(popularity);
            };

            console.log(recentAlbums);
            

            return popularAlbums;

        } catch(err) {

            console.error('Error fetching top albums: ', err);

        }

    }
}