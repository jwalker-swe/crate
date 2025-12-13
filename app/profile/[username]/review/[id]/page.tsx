import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import getSelectedReview from "@/lib/supabase/getSelectedReview";
import getReleaseDate from "@/lib/spotify/getReleaseDate";
import DisplayAlbumStats from "@/components/DisplayAlbumStats";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import CommentSection from "@/components/CommentSection";
import getReviewId from "@/lib/supabase/getReviewId";
import getInitialComments from "@/lib/supabase/getInitialComments";
import ReviewRating from "@/components/ReviewRating";
import Link from "next/link";

type CommentType = {
	comment_text: string,
	created_at: string,
	id: string,
	review_id: string,
	updated_at: string,
	user_id: string
}[]

export default async function Home({ params }: { params: Promise<{ id: string; username: string }> }) {

    const urlParams = await params;
	console.log('Params: ', urlParams);
	
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch user data for NavBar
    let userData = null;
    if (user) {
        const { data } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();
        userData = data;
    }

    // Fetch profile user's data (the user who wrote the review)
    const { data: profileUserData } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('username', urlParams.username)
        .single();

    //fetch reviews
	const review_data = await getSelectedReview(urlParams.id, urlParams.username);
	const reviewId = await getReviewId(review_data?.review.album_review_id);
	const initialCommentData = await getInitialComments(reviewId);
	
	console.log("Review Data: ", review_data?.review);
	console.log("Spotify Data: ", review_data?.spotify);
	console.log("Review Id: ", reviewId);
	console.log("Initial Comment Data: ", initialCommentData);

	const release_date = getReleaseDate(review_data?.spotify.release_date);

	const format_date = function(date: any)	{
		let numerical_date: string[] = [date.getFullYear(), date.getMonth()+1, date.getDate()]
		console.log("Numerical date: ", numerical_date);
		const string_date: string = numerical_date.join("-");

		const date_reviewed = getReleaseDate(string_date);
		return date_reviewed;
	}

	const date_reviewed = format_date(review_data?.review.date_review_written);
	console.log("Date reviewed: ", review_data?.review.date_review_written);
	console.log("Date reviewed formated: ", date_reviewed);

	const activeUser = user ? true : false;

    return (
        <div
            className={`
                w-[1200px] h-fit
                mx-auto py-4
				font-system
            `}
        >
            <header>
                <NavBar 
                    session={ user ? true : false } 
                    initialUsername={userData?.username || null}
                    initialAvatarUrl={userData?.avatar_url || null}
                />
            </header>
            <main>
				<div className={`
					w-[896px]
					mx-auto
					pb-18
				`}>
					<section>
						<div className={`
							//General Styling
							//Mobile Styling
							//Desktop Styling `}>
							<div className="
								//General Styling
								flex justify-center items-center gap-8
								pt-16 pb-8
								//Mobile Styling
								//Desktop Styling
							">
								<img src={review_data?.review.album_cover_art} width={320} height={320} alt={`album cover for ${review_data?.spotify.name}`} 
									className={`
										//General Styling
										rounded-lg
										//Mobile Styling
										//Desktop Styling
								`} />
								<div className={`
									//General Styling
									h-[320px]
									flex flex-col justify-center
									//Mobile Styling
									//Desktop Styling
								`}>
									<div className={`
										album-info-container
										//General Styling
										w-136
										flex flex-col justify-center items-left
										//Mobile Styling
										//Desktop Styling
									`}>
										<h1 className={`
											album-title
											//General Styling
											text-primaryText text-3xl font-bold 
											//Mobile Styling
											//Desktop Styling
										`}>
											{review_data?.spotify.name}
										</h1>
										<h2 className={`
											artist-name
											//General Styling
											text-accentText text-3xl 
											//Mobile Styling
											//Desktop Styling
										`}>
											{review_data?.spotify.artists[0].name}
										</h2>
										<div className={`
											album-info-container
											//General Styling
											flex justify-start items-center gap-2
											text-secondaryText 
											//Mobile Styling
											//Desktop Styling
										`}>
											<span className={`year-of-release`}>
												{`${release_date.releaseMonth} ${release_date.releaseDateInfo[2]}, ${release_date.releaseDateInfo[0]}`}
											</span>
											<div className={`
												bg-secondaryText
												w-1 h-1
												rounded-full
											`}>
											</div>
											<span className={`total-tracks`}>
												{`${review_data?.spotify.total_tracks} Songs`}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>
					<section className="
						review-section
						p-8
						bg-secondaryBackground
						rounded-lg
					">
						<div
							className={`
								reviewer-user-info
								flex justify-start items-center gap-4
								pb-2
							`}
						>
							<div
								className={`
									user-profile-icon-container
									w-12 h-12
									rounded-full
									overflow-hidden
									flex-shrink-0
									bg-tertiaryBackground
									flex justify-center items-center
								`}
							>
								{profileUserData?.avatar_url ? (
									<img 
										src={profileUserData.avatar_url} 
										alt={`${urlParams.username}'s profile`}
										className="w-full h-full object-cover"
									/>
								) : (
									<UserCircleIcon
										className={`
											w-12 h-12
											text-secondaryText
										`}
									/>
								)}
							</div>
							<div
								className={`
									w-full
									flex flex-col justify-between items-start
								`}
							>
								<div
									className={`
										w-full
										flex justify-between items-start
									`}
								>
									<div
										className={`
											flex flex-col gap-1
										`}
									>
										<div
											className={`
												flex justify-start items-center gap-2
											`}
										>
											<p
												className={`
													text-secondaryText
												`}
											>
												Review by
											</p>
											<Link
												href={`/profile/${urlParams.username}`}
												className={`
													text-secondaryText
													hover:text-accentText
												`}
											>
												@{urlParams.username}
											</Link>
										</div>
										<ReviewRating rating={review_data?.review.album_rating} />
									</div>
									<p
										className={`
											text-secondaryText
										`}
									>
										{date_reviewed.releaseMonth} {date_reviewed.releaseDateInfo[2]}, {date_reviewed.releaseDateInfo[0]}
									</p>
								</div>

							</div>
						</div> 
						<div
							className={`
								mt-4	
								text-secondaryText
								whitespace-pre-line
							`}
						>
							{review_data?.review.review_text}
						</div>
					</section>
					<CommentSection reviewId={reviewId} userId={user ? user.id : null} commentData={initialCommentData ?? { data: [], usernames: [] }} activeUser={activeUser}/>
				</div>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}


