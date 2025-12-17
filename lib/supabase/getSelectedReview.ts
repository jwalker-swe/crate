import { createClient } from "@/lib/supabase/server";
import getAlbumById from "@/lib/spotify/getAlbumById";
import getAccessToken from "@/lib/spotify/getAccessToken";
// Create function to get selected review information
// Now accepts the UUID of the user_albums row instead of spotify_id and username
export default async function getSelectedReview(reviewId: string) {

	const supabase = await createClient();
	const token = await getAccessToken();

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

		// Fetch Spotify data
		try {
			const spotify_response = await fetch(`https://api.spotify.com/v1/albums/${albumData.spotify_id}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!spotify_response || !spotify_response.ok) {
				console.error("Error fetching Spotify data");
				return null;
			}

			const spotify = await spotify_response.json();

			const review_text = reviewData.review_text;
			const date_review_written = new Date(reviewData.created_at);
			const album_rating = reviewData.rating;
			const album_liked = reviewData.liked;
			const album_cover_art = albumData.cover_image_url;
			const album_review_id = albumData.id;

			const review = { review_text, date_review_written, album_rating, album_liked, album_cover_art, album_review_id };

			return {review, spotify};

		} catch (err) {
			console.error("Spotify API error: ", err);
			return null;
		}

	} catch (err) {
		console.error("Error: ", err);
		return null;
	}
}
