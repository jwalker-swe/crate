'use client'

import { UserCircleIcon } from "@heroicons/react/24/solid";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CommentProps = {
	comment: string,
	user: string,
	date_posted: string,
	total_likes: number
}[]

const fetchReviewId = async function(albumId: string) {

	const supabase = await createClient();
	
	try {

		const { data, error } = await supabase
			.from("user_albums")
			.select("id")
			.eq("album_id", albumId)
			.single()

		if ( error ) {
			console.error(error);
		}

		if ( !data ) {
			console.log("No id found")
		}

		return data.id;

	} catch (error) {
		console.error("Error fetching id", error);
	}

}


const fetchInitialComments = async function(albumId: string) {

	const supabase = await createClient();
	const review_id = await fetchReviewId(albumId);

	// Fetch comments
	try {

		const { data, error } = await supabase
			.from("review_comments")
			.select("*")
			.eq("review_id", review_id)
			.order("created_at", { ascending: true });

		if ( error ) {
			console.error(error);
		}

		if ( !data ) {
			console.log("No comments found.")
			return null;
		}

		return data;

	} catch (error) {
		console.error("Error fetching comments", error);
	}

}


const postComment = async function(albumId: string, userId: string, text: string) {

	const supabase = await createClient();
	const review_id = await fetchReviewId(albumId);

	console.log("review id: ", review_id);
	console.log("user id: ", userId);

	// Post comment
	try {

		const { error } = await supabase
			.from("review_comments")
			.insert([
				{
					review_id: review_id,
					user_id: userId,
					comment_text: text,
				},
			])
			.select();

		if (error) {
			console.error("Error posting comment", error);
		}

		console.log("Comment posted successfully");

	} catch (error) {
		console.error(error);
	}

}

export default function CommentSection ({albumId, userId}: {albumId: string, userId: string}) {

	const reviewId = async function() {
		const data = await fetchReviewId(albumId);
		return data;
	}
	console.log("review_id: ", reviewId);


	//console.log("albumId: ", albumId);

	const [ commentText, setCommentText ] = useState<string>('');
	const [ userStatus, setUserStatus ] = useState<boolean>(false);
	const [ comments, setComments ] = useState<CommentProps>([]);

	//const initialComments = fetchInitialComments(review_id);
	//console.log(initialComments);

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
					await postComment(albumId, userId, commentText);
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
					w-full h-fit
				`}
			>
				
			</div>
		</section>
	)
}
