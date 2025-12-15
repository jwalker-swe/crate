import { createClient } from "@/lib/supabase/server";

type CommentWithReplies = {
	id: string;
	review_id: string;
	user_id: string;
	comment_text: string;
	parent_comment_id: string | null;
	created_at: string;
	updated_at: string;
	replies?: CommentWithReplies[];
	username?: string | null;
};

export default async function getInitialComments(reviewId: string) {
	const supabase = await createClient();

	try {
		const { data, error } = await supabase
			.from("review_comments")
			.select("*")
			.eq("review_id", reviewId)
			.order("created_at", { ascending: true }); // Changed to ascending to maintain chronological order

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
		
		// Add username to each comment and organize into tree structure
		const commentsWithUsernames: CommentWithReplies[] = data.map(comment => ({
			...comment,
			username: usersMap.get(comment.user_id)?.username || null,
			replies: []
		}));

		// Organize comments into tree structure (top-level comments and their replies)
		const topLevelComments: CommentWithReplies[] = [];
		const commentsMap = new Map<string, CommentWithReplies>();

		// First pass: create map of all comments
		commentsWithUsernames.forEach(comment => {
			commentsMap.set(comment.id, comment);
		});

		// Second pass: organize into tree
		commentsWithUsernames.forEach(comment => {
			if (!comment.parent_comment_id) {
				// Top-level comment
				topLevelComments.push(comment);
			} else {
				// Reply - add to parent's replies array
				const parent = commentsMap.get(comment.parent_comment_id);
				if (parent) {
					if (!parent.replies) {
						parent.replies = [];
					}
					parent.replies.push(comment);
				}
			}
		});

		// Sort top-level comments by created_at descending (newest first)
		topLevelComments.sort((a, b) => 
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		);

		// Sort replies within each comment by created_at ascending (oldest first)
		topLevelComments.forEach(comment => {
			if (comment.replies) {
				comment.replies.sort((a, b) => 
					new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
				);
			}
		});

		// Flatten for backward compatibility (for existing code that expects flat array)
		const flatData = topLevelComments.flatMap(comment => {
			const result = [comment];
			if (comment.replies) {
				result.push(...comment.replies);
			}
			return result;
		});

		const usernames = flatData.map(comment => ({ username: comment.username }));

		return { 
			data: topLevelComments, // Return tree structure
			flatData, // Also return flat structure for backward compatibility
			usernames 
		};

	} catch (error) {
		console.error("Error fetching comment data: ", error);
		return null;
	}
}
