import { NextResponse } from 'next/server';
import getAccessToken from '@/lib/spotify/getAccessToken';

export async function GET() {
    try {
        const token = await getAccessToken();
        
        if (!token) {
            return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
        }

        const albumIds = ['5jmVg7rwRcgd6ARPAeYNSm', '2Xoteh7uEpea4TohMxjtaq'];
        
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

        // Extract key information
        const album1Data = {
            id: album1.id,
            name: album1.name,
            artists: album1.artists.map((a: any) => a.name),
            release_date: album1.release_date,
            release_date_precision: album1.release_date_precision,
            album_type: album1.album_type,
            total_tracks: album1.total_tracks,
            popularity: album1.popularity,
            label: album1.label,
            genres: album1.genres,
            copyrights: album1.copyrights,
            images_count: album1.images.length,
            tracks: album1.tracks.items.map((t: any) => ({ name: t.name, track_number: t.track_number }))
        };

        const album2Data = {
            id: album2.id,
            name: album2.name,
            artists: album2.artists.map((a: any) => a.name),
            release_date: album2.release_date,
            release_date_precision: album2.release_date_precision,
            album_type: album2.album_type,
            total_tracks: album2.total_tracks,
            popularity: album2.popularity,
            label: album2.label,
            genres: album2.genres,
            copyrights: album2.copyrights,
            images_count: album2.images.length,
            tracks: album2.tracks.items.map((t: any) => ({ name: t.name, track_number: t.track_number }))
        };

        // Find differences
        const differences: any = {};
        
        if (album1Data.name !== album2Data.name) {
            differences.name = { album1: album1Data.name, album2: album2Data.name };
        }
        
        const artists1 = album1Data.artists.join(', ');
        const artists2 = album2Data.artists.join(', ');
        if (artists1 !== artists2) {
            differences.artists = { album1: artists1, album2: artists2 };
        }
        
        if (album1Data.release_date !== album2Data.release_date) {
            differences.release_date = { album1: album1Data.release_date, album2: album2Data.release_date };
        }
        
        if (album1Data.release_date_precision !== album2Data.release_date_precision) {
            differences.release_date_precision = { album1: album1Data.release_date_precision, album2: album2Data.release_date_precision };
        }
        
        if (album1Data.album_type !== album2Data.album_type) {
            differences.album_type = { album1: album1Data.album_type, album2: album2Data.album_type };
        }
        
        if (album1Data.total_tracks !== album2Data.total_tracks) {
            differences.total_tracks = { album1: album1Data.total_tracks, album2: album2Data.total_tracks };
        }
        
        if (album1Data.popularity !== album2Data.popularity) {
            differences.popularity = { album1: album1Data.popularity, album2: album2Data.popularity };
        }
        
        if (album1Data.label !== album2Data.label) {
            differences.label = { album1: album1Data.label, album2: album2Data.label };
        }
        
        const genres1 = album1Data.genres.join(', ') || 'None';
        const genres2 = album2Data.genres.join(', ') || 'None';
        if (genres1 !== genres2) {
            differences.genres = { album1: genres1, album2: genres2 };
        }
        
        if (album1Data.images_count !== album2Data.images_count) {
            differences.images_count = { album1: album1Data.images_count, album2: album2Data.images_count };
        }
        
        // Compare tracks
        if (album1Data.tracks.length === album2Data.tracks.length) {
            const trackDifferences: any[] = [];
            album1Data.tracks.forEach((track1: any, idx: number) => {
                const track2 = album2Data.tracks[idx];
                if (track1.name !== track2.name || track1.track_number !== track2.track_number) {
                    trackDifferences.push({
                        position: idx + 1,
                        album1: track1,
                        album2: track2
                    });
                }
            });
            if (trackDifferences.length > 0) {
                differences.tracks = trackDifferences;
            }
        } else {
            differences.tracks = {
                count: { album1: album1Data.tracks.length, album2: album2Data.tracks.length },
                note: 'Different number of tracks'
            };
        }

        return NextResponse.json({
            album1: album1Data,
            album2: album2Data,
            differences: Object.keys(differences).length > 0 ? differences : 'No differences found in key fields',
            full_data: {
                album1: album1,
                album2: album2
            }
        }, { status: 200 });
        
    } catch (error: any) {
        console.error('Error comparing albums:', error);
        return NextResponse.json({ 
            error: 'Failed to compare albums', 
            message: error.message 
        }, { status: 500 });
    }
}

