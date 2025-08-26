import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import { ReviewPageParams } from "@/types/spotify";
import getSelectedReview from "@/lib/supabase/getSelectedReview";
import getReleaseDate from "@/lib/spotify/getReleaseDate";
import DisplayAlbumStats from "@/components/DisplayAlbumStats";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import CommentSection from "@/components/CommentSection";
import getReviewId from "@/lib/supabase/getReviewId";
import getInitialComments from "@/lib/supabase/getInitialComments";

type CommentType = {
	comment_text: string,
	created_at: string,
	id: string,
	review_id: string,
	updated_at: string,
	user_id: string
}[]

export default async function Home({ params }: ReviewPageParams) {

    const urlParams = await params;
	console.log('Params: ', urlParams);
	
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    //fetch reviews
	const review_data = await getSelectedReview(urlParams.id, urlParams.username);
	const reviewId = await getReviewId(review_data.review.album_review_id);
	const initialCommentData = await getInitialComments(reviewId);
	
	console.log("Review Data: ", review_data.review);
	console.log("Spotify Data: ", review_data.spotify);
	console.log("Review Id: ", reviewId);
	console.log("Initial Comment Data: ", initialCommentData);

	const release_date = getReleaseDate(review_data.spotify.release_date);

	const format_date = function(date)	{
		let numerical_date: string[] = [date.getFullYear(), date.getMonth(), date.getDay()]
		const string_date: string = numerical_date.join("-");

		const date_reviewed = getReleaseDate(string_date);
		return date_reviewed;
	}

	const date_reviewed = format_date(review_data.review.date_review_written);

    return (
        <div
            className={`
                w-[1200px] h-fit
                mx-auto py-4
				font-system
            `}
        >
            <header>
                <NavBar session={ user ? true : false } />
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
								<img src={review_data.review.album_cover_art} width={320} height={320} alt={`album cover for ${review_data.spotify.name}`} 
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
											{review_data.spotify.name}
										</h1>
										<h2 className={`
											artist-name
											//General Styling
											text-accentText text-3xl 
											//Mobile Styling
											//Desktop Styling
										`}>
											{review_data.spotify.artists[0].name}
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
												{`${review_data.spotify.total_tracks} Songs`}
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
									w-9 h-9
									rounded-full
									bg-white
									flex justify-center items-center
								`}
							>	
								<UserCircleIcon
									className={`
										w-9 h-9
										text-accentText
									`}
								/>
							</div>
							<div
								className={`
									w-full
									flex flex-col justify-between items-start
								`}
							>
								<p
									className={`
										text-secondaryText
									`}
								>
									Review by @{urlParams.username}
								</p>
								<p
									className={`
										text-secondaryText
									`}
								>
									written {date_reviewed.releaseMonth} {date_reviewed.releaseDateInfo[2]}, {date_reviewed.releaseDateInfo[0]}
								</p>

							</div>
						</div>
						<div
							className={`
								mt-4	
								text-secondaryText
								whitespace-pre-line
							`}
						>
							{review_data.review.review_text}
						</div>
					</section>
 
					<CommentSection reviewId={reviewId} userId={user.id} commentData={initialCommentData} />
				</div>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}


