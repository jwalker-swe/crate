import getAccessToken from "@/lib/spotify/getAccessToken";

export default async function getTopAlbums() {

    const token = await getAccessToken();

    if (!token) {
        console.error('Unable to retrieve Spotify access token');
        return;
    }

    try {
        const currentYear = new Date().getFullYear();
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

        const searchQuery = `year:${currentYear}`;
        const encodedQuery = encodeURIComponent(searchQuery);
        const searchURL = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=album&limit=50&market=US`;

        // Fetch Albums with caching
        const res = await fetch(searchURL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            next: {
                revalidate: 604800 // Revalidate every week
            }
        });

        const data = await res.json();

        const fetchedAlbums = data.albums.items.filter((item: any) => item.album_type === 'album');

        const recentAlbums = fetchedAlbums.filter((album: any) => {
            const releaseDate = new Date(album.release_date);
            return releaseDate >= oneMonthAgo;
        });

        const albumIds = recentAlbums.map((album: any) => album.id);

        if (albumIds.length === 0) {
            return [];
        }

        const albumDetailsRes = await fetch(`https://api.spotify.com/v1/albums?ids=${albumIds.join(',')}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            next: {
                revalidate: 604800 // Revalidate every week
            }
        });

        const albumDetailsData = await albumDetailsRes.json();

        const popularAlbums = albumDetailsData.albums
            .map((album: any) => ({ album, popularity: album.popularity }))
            .filter((item: any) => item.popularity >= 75)
            .sort((a: any, b: any) => b.popularity - a.popularity);

        return popularAlbums;

    } catch (err) {
        console.error('Error fetching top albums: ', err);
    }
}