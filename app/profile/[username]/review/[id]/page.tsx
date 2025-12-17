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
import getReviewLikes from "@/lib/supabase/getReviewLikes";
import ReviewRating from "@/components/ReviewRating";
import LikeButton from "@/components/LikeButton";
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

    //fetch reviews - urlParams.id is now the UUID of the user_albums row
	const review_data = await getSelectedReview(urlParams.id);
	const reviewId = urlParams.id; // The review ID is the UUID itself
	const initialCommentData = await getInitialComments(reviewId);
	const likeData = await getReviewLikes(reviewId, user?.id || null);
	
	console.log("Review Data: ", review_data?.review);
	console.log("Spotify Data: ", review_data?.spotify);
	console.log("Review Id: ", reviewId);
	console.log("Initial Comment Data: ", initialCommentData);
	console.log("Like Data: ", likeData);

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
                w-full min-h-screen
                bg-primaryBackground
            `}
        >
            <header>
                <div className={`
                    content-container
                    w-full max-w-[1200px] h-fit
                    mx-auto py-4 px-4
                    lg:w-[1200px] lg:px-0
                `}>
                    <NavBar 
                        session={ user ? true : false } 
                        initialUsername={userData?.username || null}
                        initialAvatarUrl={userData?.avatar_url || null}
                    />
                </div>
            </header>
            <main>
				<div className={`
					w-full max-w-[896px]
					mx-auto
					pb-18 px-4
					lg:w-[896px] lg:px-0
				`}>
					<section>
						<div className={`
							//General Styling
							//Mobile Styling
							//Desktop Styling 
						`}>
							<div className="
								//General Styling
								flex flex-col gap-4
								pt-8 pb-8
								sm:flex-row sm:items-start sm:gap-4
								lg:justify-center lg:gap-8 lg:pt-16 lg:items-center
							">
								<div className="
									flex flex-row items-center gap-4
									sm:flex-1
								">
									<img src={review_data?.review.album_cover_art} width={320} height={320} alt={`album cover for ${review_data?.spotify.name}`} 
										className={`
											//General Styling
											rounded-lg
											w-32 h-32
											flex-shrink-0
											object-cover
											min-h-[140px]
											sm:w-40 sm:h-40 sm:min-h-[180px]
											md:w-52 md:h-52 md:min-h-[208px]
											lg:w-[320px] lg:h-[320px] lg:min-h-[320px]
										`} />
									<div className={`
										//General Styling
										h-auto
										flex flex-col justify-center
										flex-grow min-w-0
									`}
									style={{
										maxHeight: '100%'
									}}
									>
										<div className={`
											album-info-container
											//General Styling
											w-full
											flex flex-col justify-center items-start
											//Mobile Styling
											//Desktop Styling
										`}>
											<h1 className={`
												album-title
												//General Styling
												text-primaryText text-lg font-bold font-sans 
												line-clamp-2
												sm:text-xl
												md:text-2xl
												lg:text-3xl
											`}>
												{review_data?.spotify.name}
											</h1>
											<h2 className={`
												artist-name
												//General Styling
												text-accentText text-base font-sans
												line-clamp-1
												sm:text-lg
												md:text-xl
												lg:text-3xl
											`}>
												{review_data?.spotify.artists[0].name}
											</h2>
											<div className={`
												album-info-container
												//General Styling
												flex flex-wrap justify-start items-center gap-2
												text-secondaryText font-sans text-xs
												sm:text-sm
											`}>
												<span className={`year-of-release whitespace-nowrap`}>
													{`${release_date.releaseMonth} ${release_date.releaseDateInfo[2]}, ${release_date.releaseDateInfo[0]}`}
												</span>
												<div className={`
													bg-secondaryText
													w-1 h-1
													rounded-full
													flex-shrink-0
												`}>
												</div>
												<span className={`total-tracks whitespace-nowrap`}>
													{`${review_data?.spotify.total_tracks} Songs`}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>
					<section className="
						review-section
						p-4
						sm:p-6
						md:p-8
						bg-secondaryBackground
						rounded-lg
						mt-8
					">
						<div
							className={`
								reviewer-user-info
								flex flex-col sm:flex-row justify-start items-start sm:items-center gap-4
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
									gap-2
								`}
							>
								<div
									className={`
										w-full
										flex flex-col sm:flex-row justify-between items-start sm:items-center
										gap-2 sm:gap-4
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
												flex-wrap
											`}
										>
											<p
												className={`
													text-secondaryText text-sm
												`}
											>
												Review by
											</p>
											<Link
												href={`/profile/${urlParams.username}`}
												className={`
													text-secondaryText text-sm
													hover:text-accentText
												`}
											>
												@{urlParams.username}
											</Link>
										</div>
										<ReviewRating rating={review_data?.review.album_rating} />
									</div>
									<div
										className={`
											flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6
										`}
									>
										<p
											className={`
												text-secondaryText text-sm
												whitespace-nowrap
											`}
										>
											{date_reviewed.releaseMonth} {date_reviewed.releaseDateInfo[2]}, {date_reviewed.releaseDateInfo[0]}
										</p>
										<div
											className={`
												flex items-center gap-2
												px-3 py-1.5
												rounded-md
												bg-tertiaryBackground/50
												border border-tertiaryBackground
											`}
										>
											<LikeButton 
												size={4} 
												likeData={likeData?.userLiked || false} 
												reviewId={reviewId} 
												likeTotal={likeData?.likeCount || 0} 
												user={activeUser}
											/>
										</div>
									</div>
								</div>

							</div>
						</div> 
						<div
							className={`
								mt-4	
								text-secondaryText text-sm sm:text-base
								whitespace-pre-line
							`}
						>
							{review_data?.review.review_text}
						</div>
					</section>
					<CommentSection 
						reviewId={reviewId} 
						userId={user ? user.id : null} 
						commentData={initialCommentData ?? { data: [], usernames: [] }} 
						activeUser={activeUser}
					/>
				</div>
            </main>
            <Footer />
        </div>
    )
}


