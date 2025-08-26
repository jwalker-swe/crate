'use client'

import { UserCircleIcon } from "@heroicons/react/24/solid";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CommentType = {
	comment: string,
	user: string,
	date_posted: string,
	total_likes: number
}[]


export default function CommentSection ({reviewId, userId, commentData}: {reviewId: string, userId: string, commentData: CommentType}) {

	const [ commentText, setCommentText ] = useState<string>('');
	const [ userStatus, setUserStatus ] = useState<boolean>(false);
	const [ comments, setComments ] = useState(commentData);

	console.log("comments: ", comments);

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
							key={index}
						>
							{/* build out elements for displaying comments */}
						</div>
					)
				})}	
			</div>
		</section>
	)
}
