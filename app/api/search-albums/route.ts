import { searchSpotify } from '@/lib/spotify/search';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!query) {
        return NextResponse.json({ albums: { items: [] } }, { status: 200 });
    }

    try {
        const results = await searchSpotify(query, offset, limit);
        return NextResponse.json(results || { albums: { items: [] } });
    } catch (error) {
        console.error('Error searching albums:', error);
        return NextResponse.json({ albums: { items: [] } }, { status: 500 });
    }
}

