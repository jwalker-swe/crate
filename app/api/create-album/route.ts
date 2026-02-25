import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import getAlbumById from '@/lib/spotify/getAlbumById';

export async function POST(request: NextRequest) {
    try {
        const { spotify_id } = await request.json();

        if (!spotify_id) {
            return NextResponse.json({ error: 'Missing spotify_id' }, { status: 400 });
        }

        const supabase = await createClient();

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if album already exists
        const { data: existingAlbum } = await supabase
            .from('albums')
            .select('id')
            .eq('spotify_id', spotify_id)
            .maybeSingle();

        if (existingAlbum) {
            return NextResponse.json({ id: existingAlbum.id });
        }

        // Fetch album details from Spotify
        const albumDetails = await getAlbumById(spotify_id);

        if (!albumDetails) {
            return NextResponse.json({ error: 'Failed to fetch album from Spotify' }, { status: 500 });
        }

        // Insert album into database
        const { data: newAlbum, error: insertError } = await supabase
            .from('albums')
            .insert({
                spotify_id: spotify_id,
                title: albumDetails.name,
                artists: albumDetails.artists?.[0]?.name || 'Unknown Artist',
                release_date: albumDetails.release_date,
                cover_image_url: albumDetails.images?.[0]?.url || null,
                total_tracks: albumDetails.total_tracks
            })
            .select('id')
            .single();

        if (insertError) {
            console.error('Error inserting album:', insertError);
            return NextResponse.json({ error: 'Failed to create album' }, { status: 500 });
        }

        return NextResponse.json({ id: newAlbum.id });
    } catch (error) {
        console.error('Error in create-album API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
