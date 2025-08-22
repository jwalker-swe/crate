import { createClient } from "@/lib/supabase/server";
import getAlbumById from "@/lib/spotify/getAlbumById";
import getAccessToken from "@/lib/spotify/getAccessToken";
// Create function to get selected review information
export default async function getSelectedReview(spotify_id: string, username: string) {

	const supabase = await createClient();
	const token = await getAccessToken();

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

			const spotify_response = await fetch(`https://api.spotify.com/v1/albums/${spotify_id}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (!spotify_response) {
				console.log("No album found");
				return null;
			}

			const spotify = await spotify_response.json();

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
				const album_review_id = albumData.id;

				const review = { review_text, date_review_written, album_rating, album_liked, album_cover_art, album_review_id };

				return {review, spotify};

			} catch (err) {
				console.error("Error: ", err);
			}
	
		} catch (err) {
			console.error("Spotify API error: ", err);
		}


	} catch (err) {
		console.error("Error: ", err);
		return null;
	}
}
