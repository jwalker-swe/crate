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

const MIN_RECENT_ALBUMS = 14; // Minimum albums to fill the section (2 rows of 7)

async function fetchAlbumsFromSpotify(token: string, searchQuery: string): Promise<any[]> {
    const encodedQuery = encodeURIComponent(searchQuery);
    const searchURL = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=album&limit=50&market=US`;
    
    const res = await fetch(searchURL, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error('Error fetching albums from Spotify');
    }

    const data = await res.json();
    return data.albums.items || [];
}

export async function fetchTopAlbums() {
    const token = await getAccessToken();
    if (!token) {
        throw new Error('Failed to get Spotify access token');
    }
    
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    let recentAlbums: any = [];
    let topAlbums: any = [];
    
    // Start with 60 days lookback, expand if needed
    const lookbackDays = [60, 90, 120, 180];
    
    for (const days of lookbackDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        // Determine which years to search based on cutoff date
        const cutoffYear = cutoffDate.getFullYear();
        const searchYears = new Set([currentYear]);
        if (cutoffYear < currentYear) {
            searchYears.add(previousYear);
        }
        
        // Fetch albums from relevant years
        const searchPromises = Array.from(searchYears).map(year => 
            fetchAlbumsFromSpotify(token, `year:${year}`)
        );
        
        const searchResults = await Promise.all(searchPromises);
        const albums = searchResults.flat();
        
        // Filter to albums released within the lookback period
        const filteredAlbums = albums.filter((item: any) => {
            const isAlbum = item.album_type === 'album';
            const releaseDate = new Date(item.release_date);
            const isRecent = releaseDate > cutoffDate;
            return isAlbum && isRecent;
        });
        
        const nonDuplicateAlbums = removeDupes(filteredAlbums);
        recentAlbums = await removeUnpopular(nonDuplicateAlbums, 30, token);
        
        // If we have enough albums, stop expanding the lookback
        if (recentAlbums.length >= MIN_RECENT_ALBUMS) {
            break;
        }
    }
    
    // Sort by release date (newest first)
    recentAlbums.sort((a: any, b: any) => 
        new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    );
    
    topAlbums = await removeUnpopular(recentAlbums, 50, token);

    return { recentAlbums, topAlbums };
}
