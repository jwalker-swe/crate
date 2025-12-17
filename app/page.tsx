import Image from "next/image";
import './globals.css';
import NavBar from "@/components/NavBar";
import Link from "next/link";
import Footer from "@/components/Footer";
import AlbumPreview from "@/components/AlbumPreview";
import FeatureDescription from "@/components/FeatureDescription";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import ViewAll from "@/components/ViewAll";
import { Suspense } from "react";
import SectionTitle from "@/components/SectionTitle";
import ArticlePreview from "@/components/ArticlePreview";
import { SpotifyAlbumsResponse, SpotifyAlbums } from "@/types/spotify";
import { createClient } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase/supabase";
import SignUpButton from "@/components/SignUpButton";
import HomePageReviewPreview from "@/components/HomePageReviewPreview";
import TopAlbumsLoading from "@/components/TopAlbumsLoading";
import TopAlbumsSection from "@/components/TopAlbumsSection";
import JustReviewed from "@/components/JustReviewed";
import getFollowingActivity from "@/lib/supabase/getFollowingActivity";
import getFollowingReviews from "@/lib/supabase/getFollowingReviews";
import ActivityFeedItem from "@/components/ActivityFeedItem";
import getTopAlbumsFromFollowing from "@/lib/supabase/getTopAlbumsFromFollowing";
import TopAlbumsFromFollowing from "@/components/TopAlbumsFromFollowing";

//Create function to get Album data

export default async function Home() {

  const supabase = await createClient();
      const { data: { user } }: any = await supabase.auth.getUser();
      console.log('User: ', user)
      
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


  //Get Album Data

  interface AlbumProps {
    title: string[],
    artist: string[],
    id: string[],
    images: string[]
  }

  let albumTitle: string[] = [];
  let albumArtist: string[] = [];
  let albumID: string[] = [];
  let albumImage: string[] = [];


  let albums: AlbumProps = {
    title: albumTitle,
    artist: albumArtist,
    id: albumID,
    images: albumImage
  }

  type userDataProps = {
    avatar_url: string | null,
    bio: string | null,
    created_at: string,
    display_name: string | null,
    id: string,
    updated_at: string,
    username: string,
  }[]

  //Get recent reviews to populate recent review section
  const getRecentReviewData = async function() {
    try {
      const {data: reviewData, error: reviewError} = await supabase
        .from('user_albums')
        .select('*')
        .not('review_text', 'is', null)
        .order('created_at', {ascending: false})
        .limit(4)

      if (reviewError) {
        console.error(`Error fetching reviews: `, reviewError);
        return null
      } 
      if (!reviewData || reviewData.length === 0) {
        console.log(`No reviews found`);
        return null
      }
      
      // Extract unique user and album IDs
      const userIds = [...new Set(reviewData.map(review => review.user_id))];
      const albumIds = [...new Set(reviewData.map(review => review.album_id))];
      
      // Fetch all users and albums in parallel with batch queries
      const [usersResult, albumsResult] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .in('id', userIds),
        supabase
          .from('albums')
          .select('*')
          .in('id', albumIds)
      ]);

      if (usersResult.error) {
        console.error(`Error fetching users: `, usersResult.error);
      }
      if (albumsResult.error) {
        console.error(`Error fetching albums: `, albumsResult.error);
      }

      // Create lookup maps for O(1) access
      const usersMap = new Map(usersResult.data?.map(user => [user.id, user]) || []);
      const albumsMap = new Map(albumsResult.data?.map(album => [album.id, album]) || []);

      // Combine the data
      const reviewUserData = reviewData.map(review => ({
        ...review,
        user: usersMap.get(review.user_id) || null,
        album: albumsMap.get(review.album_id) || null
      }));

      return reviewUserData
    } catch (err) {
      console.error(`An unexpected error occurred while fetching recent reviews: `, err)
      return null
    }
  }

  const recentReviews = await getRecentReviewData()
  
  // Get activity from users being followed (for signed-in users)
  const followingActivity = user ? await getFollowingActivity(user.id, 10) : [];
  const justReviewedData = user ? await getFollowingReviews(user.id, 6) : null;
  const topAlbumsFromFollowing = user ? await getTopAlbumsFromFollowing(user.id, 5) : null;

  // If user is signed in, show different content
  if (user) {
    return (
      <div className={`
        content-container
        w-full max-w-[1200px] h-fit
        mx-auto py-4 px-4
        lg:w-[1200px] lg:px-0
      `}>
        <NavBar 
          session={user ? true : false} 
          initialUsername={userData?.username || null}
          initialAvatarUrl={userData?.avatar_url || null}
          initialUserId={user?.id || null}
        />
        
        <main className={`
          w-full max-w-[1200px]
          mx-auto
          pb-16 pt-8 px-4
          lg:px-0
        `}>
          {/* Top Albums Section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <SectionTitle title={topAlbumsFromFollowing ? "Top Albums from Following" : "Top Albums"} />
            </div>
            {topAlbumsFromFollowing && topAlbumsFromFollowing.length > 0 ? (
              <TopAlbumsFromFollowing albums={topAlbumsFromFollowing} />
            ) : (
              <Suspense fallback={<TopAlbumsLoading />}>
                <TopAlbumsSection />
              </Suspense>
            )}
          </section>

          {/* Activity from Following */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <SectionTitle title="Activity from Following" />
              {followingActivity.length > 0 && <ViewAll pageLink="activity" />}
            </div>
            {followingActivity.length > 0 ? (
              <div className={`
                w-full
                flex flex-col gap-3
              `}>
                {followingActivity.slice(0, 5).map((activity) => (
                  <ActivityFeedItem
                    key={`${activity.user_id}-${activity.album_id}-${activity.created_at}`}
                    username={activity.username}
                    activityType={activity.activity_type}
                    rating={activity.rating}
                    albumTitle={activity.album_title}
                    albumCover={activity.album_cover}
                    albumSpotifyId={activity.album_spotify_id}
                    albumId={activity.album_id}
                    userAlbumId={activity.user_album_id}
                    createdAt={activity.created_at}
                  />
                ))}
              </div>
            ) : (
              <div className={`
                w-full
                p-8
                bg-secondaryBackground
                rounded-lg
                text-center
              `}>
                <p className="text-secondaryText mb-4">
                  You're not following anyone yet.
                </p>
                <Link 
                  href="/search"
                  className="text-accentText hover:text-primaryButtonHover transition-colors"
                >
                  Discover users to follow →
                </Link>
              </div>
            )}
          </section>

          {/* Recently Reviewed Section */}
          {justReviewedData && (
            <section className="mb-12"> 
              <JustReviewed 
                columns={2} 
                rows={3} 
                gap={4} 
                data={justReviewedData} 
                user={user}
              />
            </section>
          )}
 
        </main>
        
        <Footer />
      </div>
    );
  }

  // Original marketing/homepage for non-signed-in users
  return (
    <div className={`
      content-container
      w-full max-w-[1200px] h-fit
      mx-auto py-4 px-4
      lg:w-[1200px] lg:px-0
    `}>
      {/*NavBar*/}
      <NavBar 
        session={user ? true : false} 
        initialUsername={userData?.username || null}
        initialAvatarUrl={userData?.avatar_url || null}
        initialUserId={user?.id || null}
      />
      {/* Hero Section */}
      <section className={`
        hero-section
        //General Styling
        w-full h-auto min-h-[300px]
        mt-8 mb-8
        font-sans
        flex flex-col items-center justify-center
        px-4
        md:min-h-[400px] md:mt-12 md:mb-8
        lg:h-96 lg:mt-16 lg:px-0
      `}>
        <h1 className={`
          //General Styling
          text-xl text-center
          font-sans font-bold 
          leading-tight
          line-clamp-2
          overflow-hidden
          px-2
          sm:text-2xl
          md:text-3xl
          lg:text-4xl
          xl:text-5xl
          2xl:text-6xl
        `}>
          Track, rate, and share
          <br></br>
           your <span className={`text-accentText`}>music journey</span>
        </h1>
        <p className={`
          //General Styling
          w-full max-w-2xl
          text-base text-secondaryText text-center
          my-4 px-4
          md:text-lg
          lg:text-2xl lg:px-0
        `}>
          Join the community of music enthusiasts. Log your listening, rate albums, and discover new music based on your taste.
        </p>
        <SignUpButton mode="sign-up"/>
      </section>
      {/* Top Albums Preview Section */}
      <section className={`
        //General Styling
        flex flex-col items-center justify-center gap-8
        mt-8 mb-16 pb-8
        w-full px-4
        lg:px-0
      `}>
        <div className={`
          //General Styling
          w-full max-w-[1200px]
          flex items-center justify-between
          lg:w-[1200px]
        `}>
          {/* <SectionTitle title={'Albums from all your favorite artist'} />
          <ViewAll /> */}
        </div>
        <Suspense fallback={<TopAlbumsLoading />}>
          <TopAlbumsSection />
        </Suspense>
      </section>
      {/* Tag Line */}
      <div className={`
        //General Styling
        w-full
        flex flex-col justify-center items-center
        mb-16 pb-8
      `}>
        <h2 className={`
          //General Styling
          text-2xl text-primaryText
          font-sans font-bold mb-4
          text-center px-4
          md:text-3xl
          lg:text-4xl lg:px-0
        `}>
          Discover Your Music Journey
        </h2>
        <p className={`
          //General Styling
          text-sm text-secondaryText
          text-center px-4
          md:text-base
          lg:text-xl lg:px-0
        `}>
          Track your habits, connect with fellow music lovers, and explore new sounds like never before
        </p>
      </div>
      {/* Features Section */}
      <section className={`
        features-section
        //General Styling
        w-full max-w-[1200px] mb-16 pb-8 px-4
        lg:w-[1200px] lg:px-0
      `}>
        <div className={`
          feature-container
          //General Styling
          grid grid-cols-1 gap-4
          md:grid-cols-2
          lg:grid-cols-3 lg:grid-rows-2
        `}>
          <FeatureDescription featureName="track" />
          <FeatureDescription featureName="connect" />
          <FeatureDescription featureName="lists" />
          <FeatureDescription featureName="insights" />
          <FeatureDescription featureName="reviews" />
          <FeatureDescription featureName="favorites" />
        </div>
      </section>
      {/* Tag Line */}
      <div className={`
        //General Styling
        w-full
        flex flex-col justify-center items-center
        mb-16 pb-8
      `}>
        <h2 className={`
          //General Styling
          text-2xl text-primaryText
          font-sans font-bold mb-4
          text-center px-4
          md:text-3xl
          lg:text-4xl lg:px-0
        `}>
          Hear Every Opinion
        </h2>
        <p className={`
          //General Styling
          text-sm text-secondaryText
          text-center px-4
          md:text-base
          lg:text-xl lg:px-0
        `}>
          See what the crowd hears-browse fellow listeners' reviews and join the conversation
        </p>
      </div>
      {/* Recent Reviews Section */}
      <section className={`
        //General Styling
        w-full max-w-[1200px] h-auto mb-16 pb-8 px-4
        lg:w-[1200px] lg:h-[488px] lg:px-0
      `}>
        <div className={`
          //General Styling
          flex justify-between items-center
          mb-4
          //Mobile Styling
          //Desktop Styling
        `}>
          <SectionTitle title="Recent Reviews" />
          <ViewAll pageLink="reviews" />
        </div>
        <HomePageReviewPreview recentReviewData={recentReviews} />
      </section>
      {/* Tag Line */}
      <div className={`
        //General Styling
        w-full
        flex flex-col justify-center items-center
        mb-16 pb-8
      `}>
        <h2 className={`
          //General Styling
          text-2xl text-primaryText
          font-sans font-bold mb-4
          text-center px-4
          md:text-3xl
          lg:text-4xl lg:px-0
        `}>
          From the Crate
        </h2>
        <p className={`
          //General Styling
          text-sm text-secondaryText
          text-center px-4
          md:text-base
          lg:text-xl lg:px-0
        `}>
          Catch the latest drops, headlines, and stories shaping the world of music.
        </p>
      </div>
      {/* News Section */}
      <section className={`
        //General Styling
        flex flex-col items-center justify-center
        mt-16 mb-16 pb-8
        w-full px-4
        lg:px-0
      `}>
        <div className={`
          //General Styling
          w-full max-w-[1200px]
          flex items-center justify-between
          mb-4
          lg:w-[1200px]
        `}>
          <SectionTitle title={'Latest News'} />
          <ViewAll pageLink="news" />
        </div>
        <div className={`
          //General Styling
          w-full max-w-[1200px]
          grid grid-cols-1 gap-4 justify-center
          mb-14 mx-auto 
          md:grid-cols-2
          lg:w-[1200px] lg:grid-cols-3 lg:grid-rows-1
        `}>
          <ArticlePreview />
          <ArticlePreview />
          <ArticlePreview />
        </div>
      </section>
      {/* Call to Action Section */}
      <section className={`
        //General Styling
        w-full max-w-[1200px]
        flex flex-col justify-center items-center
        mt-16 mb-16 p-8
        text-center
        bg-secondaryBackground
        rounded-lg
        mx-4
        md:p-12
        lg:w-[1200px] lg:p-16 lg:mx-0
      `}>
        <h3 className={`
          //General Styling
          text-xl text-primaryText font-bold
          md:text-2xl
          lg:text-3xl
        `}>
          Join the Crate community
        </h3>
        <p className={`
          //General Styling
          w-full max-w-lg
          text-sm text-secondaryText font-sans
          md:text-base
          lg:text-base
        `}>
          Track your music journey, discover new albums, and connect with music lovers from around the world.
        </p>
        <div className={`
          //General Styling
          flex justify-center items-center gap-4
          mt-6
          //Mobile Styling
          //Desktop Styling
        `}>
          <Link href='#'>
            <div className={`
              //General Styling
               px-4 py-2
              bg-primaryButton hover:bg-primaryButtonHover
              text-primaryText hover:text-primaryTextHover
              rounded-lg
              //Mobile Styling
              //Desktop Styling
            `}>
              <h4 className={`
                //General Styling
                //Mobile Styling
                //Dekstop Styling
              `}>
                Sign Up Now
              </h4>
            </div>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}

