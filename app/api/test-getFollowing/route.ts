import getFollowing from '@/lib/supabase/getFollowing';
import { NextResponse } from 'next/server';

export async function GET() {
	const result = await getFollowing('6f487e2d-1965-461a-94f2-3c914b82bf5d');
	return NextResponse.json(result);
}
