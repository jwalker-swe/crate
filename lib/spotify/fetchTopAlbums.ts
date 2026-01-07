import getAccessToken from "./getAccessToken"

function removeDupes(albums: any[]) {
    const seen = new Set<string>();
    return albums.filter((album) => {
        const artistNames = album.artists.map((a: any) => a.name).join(',').toLowerCase();
        const key = `${album.name.toLowerCase()}__${artistNames}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    })

    
}

async function removeUnpopular(albums: any[], minPopularity: number, token: any) {
    const results = await Promise.all(
        albums.map(async (album) => {
            const res = await fetch(`https://api.spotify.com/v1/albums/${album.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const data = await res.json()

            return {
                ...album,
                popularity: data.popularity
            }
        })
    );

    const filtered = results.filter((album) => {
        return album.popularity > minPopularity;
    })

    // console.log('Results: ', results);
    return filtered;
}

export async function fetchTopAlbums() {
    
    const token = await getAccessToken()
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 60);
    
    // If we're in the first 2 months of the year, also search previous year
    // to catch albums from the last 60 days that might be from previous year
    const currentMonth = new Date().getMonth(); // 0-11
    const shouldIncludePreviousYear = currentMonth < 2; // January (0) or February (1)

    let albums: any = [];
    let nonDuplicateAlbums: any = [];
    let recentAlbums: any = [];
    let topAlbums: any = [];

    // Search for albums from current year (and previous year if early in year)
    const searchQueries = shouldIncludePreviousYear 
        ? [`year:${currentYear}`, `year:${previousYear}`]
        : [`year:${currentYear}`];
    
    // Fetch albums from all relevant years
    const searchPromises = searchQueries.map(async (searchQuery) => {
        const encodedQuery = encodeURIComponent(searchQuery);
        const searchURL = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=album&limit=50&market=US`;
        
        const res = await fetch(`${searchURL}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error ('Error fetching top albums');
        }

        const data = await res.json()
        return data.albums.items;
    });
    
    const searchResults = await Promise.all(searchPromises);
    albums = searchResults.flat(); // Combine results from all searches
    
    recentAlbums = albums.filter((item: any) => {
        const isAlbum = item.album_type === 'album';
        const releaseDate = new Date(item.release_date);
        const isRecent = releaseDate > oneMonthAgo;

        return isAlbum && isRecent;
    })

    nonDuplicateAlbums = await removeDupes(recentAlbums); 
    
    recentAlbums = await removeUnpopular(nonDuplicateAlbums, 30, token);
    topAlbums = await removeUnpopular(recentAlbums, 50, token)

    return {recentAlbums, topAlbums};
}
