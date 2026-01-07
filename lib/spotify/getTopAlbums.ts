import getAccessToken from "@/lib/spotify/getAccessToken";

export default async function getTopAlbums() {

    const token = await getAccessToken();
    console.log('Spotify token:', token ? 'Found' : 'Not found');

    if (!token) {
        console.error('Unable to retrieve Spotify access token');
        return [];
    }

    try {
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 60);
        
        // If we're in the first 2 months of the year, also search previous year
        // to catch albums from the last 60 days that might be from previous year
        const currentMonth = new Date().getMonth(); // 0-11
        const shouldIncludePreviousYear = currentMonth < 2; // January (0) or February (1)

        // Search for albums from current year (and previous year if early in year)
        const searchQueries = shouldIncludePreviousYear 
            ? [`year:${currentYear}`, `year:${previousYear}`]
            : [`year:${currentYear}`];
        
        // Fetch albums from all relevant years
        const searchPromises = searchQueries.map(async (searchQuery) => {
            const encodedQuery = encodeURIComponent(searchQuery);
            const searchURL = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=album&limit=50&market=US`;

            // Fetch Albums with caching
            const res = await fetch(searchURL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                next: {
                    revalidate: 86400 // Revalidate every day
                }
            });

            const data = await res.json();
            return data.albums.items;
        });

        const searchResults = await Promise.all(searchPromises);
        const allAlbums = searchResults.flat(); // Combine results from all searches

        const fetchedAlbums = allAlbums.filter((item: any) => item.album_type === 'album');

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
                revalidate: 86400 // Revalidate every day
            }
        });

        const albumDetailsData = await albumDetailsRes.json();

        const popularAlbums = albumDetailsData.albums
            .map((album: any) => ({ album, popularity: album.popularity }))
            .filter((item: any) => item.popularity >= 50)
            .sort((a: any, b: any) => b.popularity - a.popularity);

        console.log('Popular Albums: ', popularAlbums);

        return popularAlbums;

    } catch (err) {
        console.error('Error fetching top albums: ', err);
        return [];
    }
}
