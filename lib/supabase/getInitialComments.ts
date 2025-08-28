import { createClient } from "@/lib/supabase/server";

export default async function getInitialComments(reviewId: string) {
	const supabase = await createClient();

	try {
		const { data, error } = await supabase
			.from("review_comments")
			.select("*")
			.eq("review_id", reviewId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching comments: ", error);
			return null;
		}

		if (!data || data.length === 0) {
			console.log("No comments found");
			return { data: [], usernames: [] };
		}

		// Extract unique user IDs from comments
		const userIds = [...new Set(data.map(comment => comment.user_id))];
		
		// Batch fetch all usernames in a single query
		const { data: usersData, error: usernameError } = await supabase
			.from("users")
			.select("id, username")
			.in("id", userIds);

		if (usernameError) {
			console.error("Error fetching usernames: ", usernameError);
			return null;
		}

		// Create a lookup map for O(1) access
		const usersMap = new Map(usersData?.map(user => [user.id, user]) || []);
		
		// Build usernames array in the same order as comments
		const usernames = data.map(comment => usersMap.get(comment.user_id) || null);

		return { data, usernames };

	} catch (error) {
		console.error("Error fetching comment data: ", error);
		return null;
	}
}
