import getAccessToken from "./getAccessToken"

const RECENT_ALBUMS_TARGET = 21;
const TOP_ALBUMS_TARGET = 12;

function removeDupes(albums: any[], existingAlbums: any[] = []) {
    const seen = new Set<string>();
    
    // Add existing albums to seen set
    existingAlbums.forEach((album) => {
        const artistNames = album.artists.map((a: any) => a.name).join(',').toLowerCase();
        const key = `${album.name.toLowerCase()}__${artistNames}`;
        seen.add(key);
    });
    
    return albums.filter((album) => {
        const artistNames = album.artists.map((a: any) => a.name).join(',').toLowerCase();
        const key = `${album.name.toLowerCase()}__${artistNames}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
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

    return filtered;
}

async function fetchAlbumsPage(token: string, query: string, offset: number = 0, limit: number = 50) {
    const encodedQuery = encodeURIComponent(query);
    const searchURL = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=album&limit=${limit}&offset=${offset}&market=US`;
    
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
    
    const token = await getAccessToken()
    
    if (!token) {
        throw new Error('Failed to get Spotify access token');
    }
    
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    let recentAlbums: any[] = [];
    let topAlbums: any[] = [];
    let offset = 0;
    const limit = 50;
    let daysBack = 60;
    
    // Keep fetching until we have 21 recent albums
    while (recentAlbums.length < RECENT_ALBUMS_TARGET) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);
        
        // Try current year first, then include previous year if needed
        const searchQuery = recentAlbums.length < RECENT_ALBUMS_TARGET / 2 
            ? `year:${currentYear}` 
            : `year:${currentYear} OR year:${previousYear}`;
        
        const albums = await fetchAlbumsPage(token, searchQuery, offset, limit);
        
        if (albums.length === 0) {
            // No more albums available, extend the date range
            daysBack += 30;
            offset = 0;
            
            // Safety: don't go back more than a year
            if (daysBack > 365) break;
            continue;
        }
        
        // Filter to only albums (not singles/compilations) released within the date range
        const filteredAlbums = albums.filter((item: any) => {
            const isAlbum = item.album_type === 'album';
            const releaseDate = new Date(item.release_date);
            const isRecent = releaseDate > cutoffDate;
            return isAlbum && isRecent;
        });
        
        // Remove duplicates (checking against already collected albums)
        const uniqueAlbums = removeDupes(filteredAlbums, recentAlbums);
        
        // Filter by popularity
        const popularAlbums = await removeUnpopular(uniqueAlbums, 50, token);
        
        recentAlbums = [...recentAlbums, ...popularAlbums];
        
        offset += limit;
        
        // Safety: don't make too many requests
        if (offset > 200) {
            daysBack += 30;
            offset = 0;
        }
    }
    
    // Trim to exactly 21
    recentAlbums = recentAlbums.slice(0, RECENT_ALBUMS_TARGET);
    
    // Top albums are the most popular from recent albums, sorted by popularity
    topAlbums = recentAlbums
        .filter((album: any) => album.popularity > 60)
        .sort((a: any, b: any) => b.popularity - a.popularity)
        .slice(0, TOP_ALBUMS_TARGET);
    
    // If we don't have enough top albums, add more from recent albums
    if (topAlbums.length < TOP_ALBUMS_TARGET) {
        const remaining = recentAlbums
            .filter((album: any) => !topAlbums.includes(album))
            .sort((a: any, b: any) => b.popularity - a.popularity);
        topAlbums = [...topAlbums, ...remaining].slice(0, TOP_ALBUMS_TARGET);
    }

    return { recentAlbums, topAlbums };
}
