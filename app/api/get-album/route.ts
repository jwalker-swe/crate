import { NextRequest, NextResponse } from 'next/server';
import getAlbumById from '@/lib/spotify/getAlbumById';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const spotifyId = searchParams.get('id');

    if (!spotifyId) {
        return NextResponse.json({ error: 'Missing album ID' }, { status: 400 });
    }

    try {
        const albumData = await getAlbumById(spotifyId);
        return NextResponse.json(albumData);
    } catch (error) {
        console.error('Error fetching album from Spotify:', error);
        return NextResponse.json({ error: 'Failed to fetch album' }, { status: 500 });
    }
}

