import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import getAllPopularReviews from '@/lib/supabase/getAllPopularReviews';
import getAllRecentReviews from '@/lib/supabase/getAllRecentReviews';
import getAllHighestRatedReviews from '@/lib/supabase/getAllHighestRatedReviews';
import getAllFollowingReviews from '@/lib/supabase/getAllFollowingReviews';
import getAllTrendingReviews from '@/lib/supabase/getAllTrendingReviews';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const sortType = searchParams.get('sortType');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const userId = searchParams.get('userId');

        if (!sortType) {
            return NextResponse.json({ error: 'Missing sortType' }, { status: 400 });
        }

        // Fetch all reviews for the sort type (we need all to sort properly)
        let allData: any = null;
        
        switch (sortType) {
            case 'popular':
                allData = await getAllPopularReviews(10000); // Fetch a large number
                break;
            case 'recent':
                allData = await getAllRecentReviews(10000);
                break;
            case 'highestRated':
                allData = await getAllHighestRatedReviews(10000);
                break;
            case 'following':
                if (!userId) {
                    return NextResponse.json({ reviews: [], albums: [], users: [], likes: [], hasMore: false });
                }
                allData = await getAllFollowingReviews(userId, 10000);
                break;
            case 'trending':
                allData = await getAllTrendingReviews(10000);
                break;
            default:
                return NextResponse.json({ error: 'Invalid sortType' }, { status: 400 });
        }

        if (!allData || !allData.reviews || allData.reviews.length === 0) {
            return NextResponse.json({ reviews: [], albums: [], users: [], likes: [], hasMore: false });
        }

        // Calculate pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const hasMore = endIndex < allData.reviews.length;

        // Get paginated slice
        const paginatedReviews = allData.reviews.slice(startIndex, endIndex);
        const paginatedAlbums = allData.albums.slice(startIndex, endIndex);
        const paginatedUsers = allData.users.slice(startIndex, endIndex);
        const paginatedLikes = allData.likes.slice(startIndex, endIndex);

        return NextResponse.json({
            reviews: paginatedReviews,
            albums: paginatedAlbums,
            users: paginatedUsers,
            likes: paginatedLikes,
            hasMore
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

