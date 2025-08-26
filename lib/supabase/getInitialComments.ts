import { createClient } from "@/lib/supabase/server";

export default async function getInitialComments(reviewId: string) {
	const supabase = await createClient();

	try {
		const { data, error } = await supabase
			.from("review_comments")
			.select("*")
			.eq("review_id", reviewId)
			.order("created_at", { ascending: true });

		if (error) {
			console.error("Error fetching comments: ", error);
		}

		if (!data) {
			console.log("No comments found");
		}

		try {
			let usernames = [];
			
			for (const element of data) {
				const currentId = element.user_id;

				const { data: usernameData, error: usernameError } = await supabase
					.from("users")
					.select("username")
					.eq("id", currentId)
					.single()

				if (error) {
					return null;
				}

				if (!data) {
					return null;
				}

				usernames.push(usernameData);
			}

			return { data, usernames };
		} catch (error) {
			 console.error("Error fetching comment username: ", error);
		}

	} catch (error) {
		console.error("Error fetching comment data: ", error);
	}
}
