// Load environment variables from .env or .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Try to load .env.local first, then .env
const envLocalPath = resolve(process.cwd(), '.env.local');
const envPath = resolve(process.cwd(), '.env');

if (existsSync(envLocalPath)) {
    config({ path: envLocalPath });
} else if (existsSync(envPath)) {
    config({ path: envPath });
}

async function getAccessToken() {
    const clientID = process.env.SPOTIFY_API_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_API_CLIENT_SECRET;

    if (!clientID || !clientSecret) {
        console.error('Missing SPOTIFY_API_CLIENT_ID or SPOTIFY_API_CLIENT_SECRET in .env.local');
        return null;
    }

    const credentials = Buffer.from(`${clientID}:${clientSecret}`).toString('base64');

    try {
        const res = await fetch(`https://accounts.spotify.com/api/token`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('Failed to fetch access token: ', data);
            return null;
        }

        return data.access_token;
    } catch (err) {
        console.error(`Error fetching access token: ${err}`);
        return null;
    }
}

async function compareAlbums() {
    const token = await getAccessToken();
    
    if (!token) {
        console.error('Failed to get access token');
        return;
    }

    const albumIds = ['5jmVg7rwRcgd6ARPAeYNSm', '2Xoteh7uEpea4TohMxjtaq'];
    
    console.log('Fetching albums from Spotify...\n');
    
    const albums = await Promise.all(
        albumIds.map(async (id) => {
            const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!res.ok) {
                throw new Error(`Failed to fetch album ${id}: ${res.status}`);
            }
            
            return res.json();
        })
    );

    const [album1, album2] = albums;

    console.log('='.repeat(80));
    console.log('ALBUM 1:', album1.id);
    console.log('='.repeat(80));
    console.log(JSON.stringify({
        id: album1.id,
        name: album1.name,
        artists: album1.artists.map((a: any) => a.name),
        release_date: album1.release_date,
        release_date_precision: album1.release_date_precision,
        album_type: album1.album_type,
        total_tracks: album1.total_tracks,
        popularity: album1.popularity,
        label: album1.label,
        external_urls: album1.external_urls,
        genres: album1.genres,
        copyrights: album1.copyrights,
        images: album1.images.length
    }, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('ALBUM 2:', album2.id);
    console.log('='.repeat(80));
    console.log(JSON.stringify({
        id: album2.id,
        name: album2.name,
        artists: album2.artists.map((a: any) => a.name),
        release_date: album2.release_date,
        release_date_precision: album2.release_date_precision,
        album_type: album2.album_type,
        total_tracks: album2.total_tracks,
        popularity: album2.popularity,
        label: album2.label,
        external_urls: album2.external_urls,
        genres: album2.genres,
        copyrights: album2.copyrights,
        images: album2.images.length
    }, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('COMPARISON - KEY DIFFERENCES');
    console.log('='.repeat(80));
    
    const differences: string[] = [];
    
    if (album1.name !== album2.name) {
        differences.push(`Name: "${album1.name}" vs "${album2.name}"`);
    }
    
    const artists1 = album1.artists.map((a: any) => a.name).join(', ');
    const artists2 = album2.artists.map((a: any) => a.name).join(', ');
    if (artists1 !== artists2) {
        differences.push(`Artists: "${artists1}" vs "${artists2}"`);
    }
    
    if (album1.release_date !== album2.release_date) {
        differences.push(`Release Date: "${album1.release_date}" vs "${album2.release_date}"`);
    }
    
    if (album1.release_date_precision !== album2.release_date_precision) {
        differences.push(`Release Date Precision: "${album1.release_date_precision}" vs "${album2.release_date_precision}"`);
    }
    
    if (album1.album_type !== album2.album_type) {
        differences.push(`Album Type: "${album1.album_type}" vs "${album2.album_type}"`);
    }
    
    if (album1.total_tracks !== album2.total_tracks) {
        differences.push(`Total Tracks: ${album1.total_tracks} vs ${album2.total_tracks}`);
    }
    
    if (album1.popularity !== album2.popularity) {
        differences.push(`Popularity: ${album1.popularity} vs ${album2.popularity}`);
    }
    
    if (album1.label !== album2.label) {
        differences.push(`Label: "${album1.label}" vs "${album2.label}"`);
    }
    
    const genres1 = album1.genres.join(', ') || 'None';
    const genres2 = album2.genres.join(', ') || 'None';
    if (genres1 !== genres2) {
        differences.push(`Genres: "${genres1}" vs "${genres2}"`);
    }
    
    if (album1.images.length !== album2.images.length) {
        differences.push(`Number of Images: ${album1.images.length} vs ${album2.images.length}`);
    }
    
    // Compare track lists
    if (album1.total_tracks === album2.total_tracks) {
        const tracks1 = album1.tracks.items.map((t: any) => t.name);
        const tracks2 = album2.tracks.items.map((t: any) => t.name);
        
        const sameTracks = tracks1.every((track: string, idx: number) => track === tracks2[idx]);
        if (!sameTracks) {
            differences.push(`Track Lists: Different track names or order`);
            
            // Find specific differences
            tracks1.forEach((track: string, idx: number) => {
                if (track !== tracks2[idx]) {
                    differences.push(`  Track ${idx + 1}: "${track}" vs "${tracks2[idx]}"`);
                }
            });
        }
    }
    
    if (differences.length === 0) {
        console.log('No differences found in key fields!');
    } else {
        differences.forEach(diff => console.log(`- ${diff}`));
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('FULL ALBUM DATA (for detailed inspection)');
    console.log('='.repeat(80));
    console.log('\nAlbum 1 Full Data:');
    console.log(JSON.stringify(album1, null, 2));
    console.log('\nAlbum 2 Full Data:');
    console.log(JSON.stringify(album2, null, 2));
}

compareAlbums().catch(console.error);

