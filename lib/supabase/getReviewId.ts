import { createClient } from '@/lib/supabase/server'

export default async function getReviewId(albumId: string) {

	const supabase = await createClient();

	try {
		const { data, error } = await supabase
			.from("user_albums")
			.select("id")
			.eq("album_id", albumId)
			.single()

		if (error) {
			console.error("Error fetching id: ", error);
			return null;
		}

		if (!data) {
			console.log("No id found");
			return null;
		}

		return data.id;
	} catch (error) {
		console.error("Error fetching data: ", error)
		return null;
	}
}
