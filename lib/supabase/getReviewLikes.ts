import { createClient } from "./server";
import SearchDataForCurrentUser from "./searchDataForCurrentUser";

export default async function getReviewLikes(reviewId: string, userId: string | null) {
	const supabase = await createClient();

	try {
		// Fetch all likes for this review (same approach as getRecentlyReviewed)
		const { data: likesData, error: likesError } = await supabase
			.from("review_likes")
			.select("*")
			.eq("review_id", reviewId);

		if (likesError) {
			console.error("Error fetching likes: ", likesError);
			return { likeCount: 0, userLiked: false };
		}

		// Process likes the same way as recently reviewed section
		if (!likesData || likesData.length === 0) {
			return { likeCount: 0, userLiked: false };
		}

		// Use the same function as recently reviewed to process likes
		if (userId) {
			const likeData = SearchDataForCurrentUser(userId, likesData);
			return {
				likeCount: likeData.count,
				userLiked: likeData.liked
			};
		} else {
			// User not logged in, just return count
			return {
				likeCount: likesData.length,
				userLiked: false
			};
		}

	} catch (error) {
		console.error("Error fetching review likes: ", error);
		return { likeCount: 0, userLiked: false };
	}
}
