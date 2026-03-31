import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    try {
        // Verify the request is authorized
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Revalidate the news page
        revalidatePath('/news');
        
        return NextResponse.json({ 
            success: true, 
            message: 'News page revalidated',
            revalidated: true,
            now: Date.now()
        });
    } catch (error) {
        console.error('Error revalidating news page:', error);
        return NextResponse.json({ 
            error: 'Failed to revalidate',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

