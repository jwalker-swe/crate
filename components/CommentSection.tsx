'use client'

import { UserCircleIcon } from "@heroicons/react/24/solid";
import { ChatBubbleOvalLeftIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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
	avatar_url?: string | null;
};

type CommentsPayload = { 
	data: CommentWithReplies[], 
	usernames: any[] 
}

const postComment = async function(reviewId: string, userId: string | null, comment: string, parentCommentId: string | null = null) {
	const supabase = await createClient();

	if (!userId) {
		console.error("User ID is required to post a comment");
		return null;
	}

	try {
		// Build the insert object, only including parent_comment_id if it's not null
		const insertData: any = {
			review_id: reviewId,
			user_id: userId,
			comment_text: comment,
		};

		// Only add parent_comment_id if it's provided (for replies)
		if (parentCommentId) {
			insertData.parent_comment_id = parentCommentId;
		}

		const { data, error } = await supabase
			.from("review_comments")
			.insert([insertData])
			.select()

		if (error) {
			console.error("Error submitting comment: ", error);
			console.error("Error details: ", JSON.stringify(error, null, 2));
			return null;
		}

		console.log("Comment submitted successfully")
		return data[0];
	} catch (error) {
		console.error("Error posting comment: ", error);
		return null;
	}
}

export default function CommentSection ({reviewId, userId, commentData, activeUser}: {reviewId: string, userId: string | null, commentData: CommentsPayload, activeUser: boolean }) {

	const [ commentText, setCommentText ] = useState<string>('');
	const [ comments, setComments ] = useState(commentData);
	const [ replyingTo, setReplyingTo ] = useState<string | null>(null);
	const [ replyText, setReplyText ] = useState<string>('');
	const [ expandedThreads, setExpandedThreads ] = useState<Set<string>>(new Set());

	const toggleThread = (commentId: string) => {
		setExpandedThreads(prev => {
			const newSet = new Set(prev);
			if (newSet.has(commentId)) {
				newSet.delete(commentId);
			} else {
				newSet.add(commentId);
			}
			return newSet;
		});
	};

	const deleteComment = async function(commentId: string) {
		const supabase = await createClient();

		try {
			const { error } = await supabase
				.from("review_comments")
				.delete()
				.eq("id", commentId)

			if (error) {
				console.error("Error deleting comment: ", error);
				return;
			}

			// Recursively remove comment from tree structure
			const removeComment = (commentList: CommentWithReplies[]): CommentWithReplies[] => {
				return commentList
					.filter(comment => comment.id !== commentId)
					.map(comment => ({
						...comment,
						replies: comment.replies ? removeComment(comment.replies) : []
					}));
			};

			setComments(prev => ({
				...prev,
				data: removeComment(prev.data)
			}));

			console.log("Comment deleted successfully");
		} catch (error) {
			console.error("Error deleting comment: ", error);
		}
	}

	const handleReply = async (parentCommentId: string) => {
		if (!replyText.trim()) return;

		const newReply = await postComment(reviewId, userId, replyText, parentCommentId);

		if (newReply) {
			// Fetch username and avatar_url for the new reply
			const supabase = await createClient();
			const { data: usernameData } = await supabase
				.from("users")
				.select("username, avatar_url")
				.eq("id", userId)
				.single();

			if (usernameData) {
				const replyWithUsername: CommentWithReplies = {
					...newReply,
					user_id: newReply.user_id || userId, // Ensure user_id is set
					username: usernameData.username,
					avatar_url: usernameData.avatar_url || null,
					replies: []
				};
				
				console.log('Reply created:', replyWithUsername);
				console.log('Current userId:', userId);
				console.log('Reply user_id:', replyWithUsername.user_id);

				// Add reply to the appropriate parent comment
				const addReplyToComment = (commentList: CommentWithReplies[]): CommentWithReplies[] => {
					return commentList.map(comment => {
						if (comment.id === parentCommentId) {
							return {
								...comment,
								replies: [...(comment.replies || []), replyWithUsername]
							};
						}
						if (comment.replies) {
							return {
								...comment,
								replies: addReplyToComment(comment.replies)
							};
						}
						return comment;
					});
				};

				setComments(prev => ({
					...prev,
					data: addReplyToComment(prev.data)
				}));
			}
		}

		setReplyText('');
		setReplyingTo(null);
	};

	const totalCommentCount = (comments: CommentWithReplies[]): number => {
		return comments.reduce((count, comment) => {
			return count + 1 + (comment.replies ? totalCommentCount(comment.replies) : 0);
		}, 0);
	};

	const renderComment = (comment: CommentWithReplies, isReply: boolean = false, depth: number = 0) => {
		const hasReplies = comment.replies && comment.replies.length > 0;
		const isExpanded = expandedThreads.has(comment.id);
		
		// Debug: Log reply data to help identify the issue
		if (isReply && userId) {
			const canDelete = userId && comment.user_id && String(userId) === String(comment.user_id);
			if (!canDelete) {
				console.log('Reply delete check:', {
					replyId: comment.id,
					userId: userId,
					commentUserId: comment.user_id,
					userIdType: typeof userId,
					commentUserIdType: typeof comment.user_id,
					comment: comment
				});
			}
		}

		return (
			<div
				key={comment.id}
				className={`
					${isReply ? 'w-[calc(100%-2rem)] ml-8 mt-3' : 'w-full mt-4'}
					${isReply ? 'border-l-2 border-tertiaryBackground pl-4' : ''}
					overflow-hidden
				`}
			>
				<div
					className={`
						w-full h-fit
						flex flex-col items-start justify-center gap-1
					`}
				>
					<div
						className={`
							flex justify-start items-center gap-4
							w-full h-full
						`}
					>
						<div
							className={`
								icon-container
								w-fit h-fit
								flex-shrink-0
							`}
						>
							{comment.avatar_url ? (
								<img 
									src={comment.avatar_url} 
									alt={comment.username || 'User'}
									className={`
										w-8 h-8
										rounded-full
										object-cover
									`}
								/>
							) : (
								<UserCircleIcon 
									className={`
										w-8 h-8
										rounded-full
										text-accentText
										bg-white
									`}
								/>
							)}
						</div>
						<div
							className={`
								w-full grow
								flex justify-between items-center
								min-w-0
							`}
						>
							<div
								className={`
									comment-user-info-container
									flex justify-start items-center gap-2
									min-w-0
									flex-shrink
								`}
							>
								<Link
									href={`/profile/${comment.username || ''}`}
									className={`
										username-container
										text-secondaryText
										cursor-pointer
										hover:text-accentText
										truncate
									`}
								>
									@{comment.username || 'unknown'}
								</Link>
							</div> 
							<div
								className={`
									flex items-center gap-2
									flex-shrink-0
								`}
							>
								{activeUser && !isReply && (
									<button
										onClick={() => {
											setReplyingTo(replyingTo === comment.id ? null : comment.id);
											setReplyText('');
										}}
										className={`
											text-xs text-secondaryText
											hover:text-accentText
											transition-colors
										`}
									>
										Reply
									</button>
								)}
								{userId && comment.user_id && String(userId) === String(comment.user_id) && (
									<TrashIcon 
										onClick={async () => {
											if (confirm('Are you sure you want to delete this comment?')) {
												deleteComment(comment.id)
											}
										}}
										className={`
											w-4 h-4
											text-secondaryText
											cursor-pointer
											hover:text-red-500
											transition-colors
											flex-shrink-0
										`}
										title={isReply ? "Delete reply" : "Delete comment"}
									/>
								)}
							</div>
						</div>
					</div>
					<p
						className={`
							ml-12
							text-secondaryText
						`}
					>
						{comment.comment_text}
					</p>
					
					{/* Reply form */}
					{replyingTo === comment.id && (
						<div className="ml-12 mt-2 w-[calc(100%-3rem)]">
							<textarea
								placeholder={`Reply to @${comment.username}...`}
								value={replyText}
								onChange={(e) => setReplyText(e.target.value)}
								maxLength={500}
								className={`
									w-full h-24
									p-2
									text-sm
									resize-none
									rounded-sm
									bg-tertiaryBackground
									focus:outline-none
									box-border
								`}
							/>
							<div className="flex justify-end items-center gap-2 mt-2">
								<button
									onClick={() => {
										setReplyingTo(null);
										setReplyText('');
									}}
									className={`
										px-4 py-1
										text-sm
										text-secondaryText
										hover:text-primaryText
									`}
								>
									Cancel
								</button>
								<button
									onClick={() => handleReply(comment.id)}
									disabled={!replyText.trim()}
									className={`
										px-4 py-1
										text-sm
										bg-primaryButton
										rounded-sm
										hover:bg-primaryButtonHover
										hover:text-primaryTextHover
										disabled:opacity-50
										disabled:cursor-not-allowed
									`}
								>
									Reply
								</button>
							</div>
						</div>
					)}

					{/* Replies section */}
					{hasReplies && (
						<div className="w-[calc(100%-3rem)] ml-12 mt-2">
							<button
								onClick={() => toggleThread(comment.id)}
								className={`
									flex items-center gap-1
									text-xs text-secondaryText
									hover:text-accentText
									transition-colors
								`}
							>
								{isExpanded ? (
									<ChevronUpIcon className="w-4 h-4" />
								) : (
									<ChevronDownIcon className="w-4 h-4" />
								)}
								{isExpanded ? 'Hide' : 'Show'} {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
							</button>
							{isExpanded && (
								<div className="mt-2 w-full">
									{comment.replies!.map(reply => renderComment(reply, true, depth + 1))}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<section
			className={`
				comment-section
				p-8 mt-8
				bg-secondaryBackground
				rounded-lg
			`}
		>
			<div
				className={`
					flex justify-start items-center gap-4
				`}
			>
				<ChatBubbleOvalLeftIcon 
					className={`
						w-8 h-8
						text-accentText
					`}
				/>
				<div
					className={`
						flex justify-start items-center gap-2
					`}
				>
					<h3
						className={`
							font-bold
							text-xl
						`}
					>
						Comments
					</h3>
					<p
						className={`
							text-secondaryText
						`}
					>
						({totalCommentCount(comments.data)})
					</p>
				</div>
			</div>
			{activeUser && (
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						const newComment = await postComment(reviewId, userId, commentText);

						if (newComment) {
						// Fetch username and avatar_url for the new comment
						const supabase = await createClient();
						const { data: usernameData } = await supabase
							.from("users")
							.select("username, avatar_url")
							.eq("id", userId)
							.single();

						if (usernameData) {
							const commentWithUsername: CommentWithReplies = {
								...newComment,
								username: usernameData.username,
								avatar_url: usernameData.avatar_url || null,
								replies: []
							};

								setComments(prev => ({
									...prev,
									data: [commentWithUsername, ...prev.data]
								}));
							}
						}

						setCommentText('');
					}}
				>
					<div
						className={`
							w-full h-fit mt-4 p-4
							bg-tertiaryBackground
							rounded-sm
						`}
					>
						<textarea
							placeholder={`Share your thoughts on this review...`}
							value={commentText}
							onChange={(e) => setCommentText(e.target.value)}
							maxLength={500}
							className={`
								w-full h-36
								resize-none
								overflow-none
								focus:outline-none
							`}
						/>
					</div>
					<div
						className={`
							w-full mt-2
							flex justify-between items-center
						`}
					>
						<div
							className={`
								text-secondaryText
							`}
						>
							{commentText.length}/500
						</div>
						<button
							className={`
								px-6 py-2
								bg-primaryButton
								rounded-sm
								hover:bg-primaryButtonHover
								hover:text-primaryTextHover
								cursor-pointer
							`}
						>
							Submit
						</button>
					</div>
				</form>
			)}
			<div
				className={`
					commment-container
					w-full h-fit mt-8
				`}
			>
				{comments.data.length === 0 ? (
					<p className="text-secondaryText text-center py-8">
						No comments yet. Be the first to share your thoughts!
					</p>
				) : (
					comments.data.map((comment) => (
						<div
							key={comment.id}
							className={`
								w-full h-full pb-6
								border-b-1 border-tertiaryBackground
							`}
						>
							{renderComment(comment)}
						</div>
					))
				)}
			</div>
		</section>
	)
}
