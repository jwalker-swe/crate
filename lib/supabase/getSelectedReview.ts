import { createClient } from "@/lib/supabase/server";
import getAlbumById from "@/lib/spotify/getAlbumById";

// Create function to get selected review information
export default async function getSelectedReview(spotify_id: string, username: string) {

	const supabase = await createClient();

	// fetch album info by spotify_id
	try {

		const { data: albumData, error: albumError } = await supabase
			.from('albums')
			.select('*')
			.eq('spotify_id', spotify_id)
			.single()

		if (albumError) {
			console.error("Error fetching album data: ", albumError);
			return null;
		}

		if (!albumData) {
			throw new Error("No album data found");
			return null;
		}

		try {

			const {data, error} = await supabase
				.from('user_albums')
				.select('*')
				.eq('album_id', albumData.id)
				.single()

			if (error) {
				console.error("Error fetching review data: ", error);
				return null;
			}

			if (!data) {
				throw new Error("Error fetching review info");
				return null;
			}

			const review_text = data.review_text;
			const date_review_written = new Date(data.created_at);
			const album_rating = data.rating;
			const album_liked = data.liked;
			const album_cover_art = albumData.cover_image_url;

			const review_data = { review_text, date_review_written, album_rating, album_liked, album_cover_art };

			return review_data;

		} catch (err) {
			console.error("Error: ", err);
		}

	} catch (err) {
		console.error("Error: ", err);
		return null;
	}
}
