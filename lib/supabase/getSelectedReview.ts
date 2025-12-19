import { createClient } from "@/lib/supabase/server";
// Create function to get selected review information
// Now accepts the UUID of the user_albums row instead of spotify_id and username
export default async function getSelectedReview(reviewId: string) {

	const supabase = await createClient();

	try {
		// Fetch the review (user_albums row) by its UUID
		const { data: reviewData, error: reviewError } = await supabase
			.from('user_albums')
			.select('*')
			.eq('id', reviewId)
			.single();

		if (reviewError) {
			console.error("Error fetching review data: ", reviewError);
			return null;
		}

		if (!reviewData) {
			console.error("Review not found");
			return null;
		}

		// Fetch album data using the album_id from the review
		const { data: albumData, error: albumError } = await supabase
			.from('albums')
			.select('*')
			.eq('id', reviewData.album_id)
			.single();

		if (albumError || !albumData) {
			console.error("Error fetching album data: ", albumError);
			return null;
		}

		// Format Spotify-like data from database
		// Format artists from database (handle both string and array formats)
		// Check both 'artist' (singular) and 'artists' (plural) to handle schema differences
		const artistData = (albumData as any).artists || albumData.artist;
		const artists = artistData 
			? (typeof artistData === 'string' 
				? [{ name: artistData }] 
				: Array.isArray(artistData) 
					? artistData.map((a: any) => 
						typeof a === 'string' 
							? { name: a } 
							: (a && typeof a === 'object' && 'name' in a ? a : { name: String(a) })
					  ).filter((a: any) => a && a.name)
					: [])
			: [];

		// Format images from cover_image_url
		const images = albumData.cover_image_url 
			? [{ url: albumData.cover_image_url }] 
			: [];

		// Create Spotify-like object from database data
		const spotify = {
			id: albumData.spotify_id,
			name: albumData.title,
			artists: artists,
			images: images,
			release_date: albumData.release_date || null,
			tracks: albumData.tracks || null,
			total_tracks: albumData.total_tracks || null
		};

		const review_text = reviewData.review_text;
		const date_review_written = new Date(reviewData.created_at);
		const album_rating = reviewData.rating;
		const album_liked = reviewData.liked;
		const album_cover_art = albumData.cover_image_url;
		const album_review_id = albumData.id;

		const review = { review_text, date_review_written, album_rating, album_liked, album_cover_art, album_review_id };

		return {review, spotify};

	} catch (err) {
		console.error("Error: ", err);
		return null;
	}
}
