'use client'

import { UserCircleIcon } from "@heroicons/react/24/solid";
import { ChatBubbleOvalLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type CommentsPayload = { data: any[], usernames: any[] }


const postComment = async function(reviewId: string, userId: string | null, comment: string) {

	const supabase = await createClient();

	try {
		const { data, error } = await supabase
			.from("review_comments")
			.insert([
				{
					review_id: reviewId,
					user_id: userId,
					comment_text: comment,
				}
			])
			.select()

		if (error) {
			console.error("Error submitting comment: ", error);
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

			// Find the index of the comment being deleted and remove both comment and corresponding username
			setComments(prev => {
				const commentIndex = prev.data.findIndex(comment => comment.id === commentId);
				return {
					...prev,
					data: prev.data.filter(comment => comment.id !== commentId),
					usernames: prev.usernames.filter((_, index) => index !== commentIndex)
				};
			});

			console.log("Comment deleted successfully");
		} catch (error) {
			console.error("Error deleting comment: ", error);
		}
	}

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
						(3)
					</p>
				</div>
			</div>
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					const newComment = await postComment(reviewId, userId, commentText);

					if (newComment) {
						// Fetch username for the new comment
						const supabase = await createClient();
						const { data: usernameData } = await supabase
							.from("users")
							.select("username")
							.eq("id", userId)
							.single();

						if (usernameData) {
							setComments(prev => ({
								data: [newComment, ...prev.data],
								usernames: [usernameData, ...prev.usernames]
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
			<div
				className={`
					commment-container
					w-full h-fit mt-8
				`}
			>
				{comments.data.map((comment, index) => {
					return (
						<div
							key={`comment-container-${index}`}
							className={`
								w-full h-full pb-6 mt-4
								border-b-1 border-tertiaryBackground
							`}
						>
							{/* build out elements for displaying comments */}
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
										`}
									>
										<UserCircleIcon 
											className={`
												w-8 h-8
												rounded-full
												text-accentText
												bg-white
											`}
										/>
									</div>
									<div
										className={`
											w-full grow
											flex justify-between items-center
										`}
									>
										<div
											className={`
												comment-user-info-container
												flex justify-start items-center gap-2
											`}
										>
											<Link
												href={`/profile/${comments.usernames[index].username}`}
												className={`
													username-container
													text-secondaryText
													cursor-pointer
													hover:text-accentText
												`}
											>
												@{comments.usernames[index].username}
											</Link>
										</div> 
										<div
											className={`
												
											`}
										>
											{userId === comment.user_id && (
												<TrashIcon 
													onClick={async () => {
														deleteComment(comment.id)
													}}
													className={`
														w-4 h-4
														text-secondaryText
														cursor-pointer
														hover:text-accentText
													`}
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
							</div>
						</div>
					)
				})}	
			</div>
		</section>
	)
}
