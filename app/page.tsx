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
import getTopAlbums from '@/lib/spotify/getTopAlbums';
import { createClient } from "@/lib/supabase/client";
import { supabase } from "@/lib/supabase/supabase";
import SignUpButton from "@/components/SignUpButton";
import HomePageReviewPreview from "@/components/HomePageReviewPreview";
import TopAlbumsLoading from "@/components/TopAlbumsLoading";
import TopAlbumsSection from "@/components/TopAlbumsSection";

//Create function to get Album data

export default async function Home() {

  const supabase = await createClient();
      const { data: { user } }: any = await supabase.auth.getUser();
      console.log('User: ', user)


  //Get Album Data
  const recentTopAlbums: any = await getTopAlbums();

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

  recentTopAlbums.forEach((item: any) => {
    albumTitle.push(item.album.name);
    albumArtist.push(item.album.artists[0].name)
    albumID.push(item.album.id);
    albumImage.push(item.album.images[0].url)

  })

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


  return (
    <div className={`
      content-container
      w-[1200px] h-fit
      mx-auto py-4
    `}>
      {/*NavBar*/}
      <NavBar session={user ? true : false} />
      {/* Hero Section */}
      <section className={`
        hero-section
        //General Styling
        w-full h-96
        mt-16 mb-8
        font-sans
        flex flex-col items-center justify-center
        //Mobile Styling
        //Desktop Styling
      `}>
        <h1 className={`
          //General Styling
          text-6xl text-center
          font-sans font-bold 
          //Mobile Styling
          Desktop Styling
        `}>
          Track, rate, and share
          <br></br>
           your <span className={`text-accentText`}>music journey</span>
        </h1>
        <p className={`
          //General Styling
          w-2xl
          text-2xl text-secondaryText text-center
          my-4
          //Mobile Styling
          //Desktop Styling
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
        //Mobile Styling
        //Desktop Styling
      `}>
        <div className={`
          //General Styling
          w-[1200px]
          flex items-center justify-between
          //Mobile Styling
          //Desktop Styling
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
        //Mobile Styling
        //Desktop Styling
      `}>
        <h2 className={`
          //General Styling
          text-4xl text-primaryText
          font-sans font-bold mb-4
          //Mobile Styling
          //Desktop Styling
        `}>
          Discover Your Music Journey
        </h2>
        <p className={`
          //General Styling
          text-xl text-secondaryText
          //Mobile Styling
          //Desktop Styling
        `}>
          Track your habits, connect with fellow music lovers, and explore new sounds like never before
        </p>
      </div>
      {/* Features Section */}
      <section className={`
        features-section
        //General Styling
        w-[1200px] mb-16 pb-8
        //Mobile Styling
        //Desktop Styling
      `}>
        <div className={`
          feature-container
          //General Styling
          grid grid-cols-3 grid-rows-2 gap-4
          //Mobile Styling
          //Desktop Styling
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
        //Mobile Styling
        //Desktop Styling
      `}>
        <h2 className={`
          //General Styling
          text-4xl text-primaryText
          font-sans font-bold mb-4
          //Mobile Styling
          //Desktop Styling
        `}>
          Hear Every Opinion
        </h2>
        <p className={`
          //General Styling
          text-xl text-secondaryText
          //Mobile Styling
          //Desktop Styling
        `}>
          See what the crowd hears-browse fellow listeners' reviews and join the conversation
        </p>
      </div>
      {/* Recent Reviews Section */}
      <section className={`
        //General Styling
        w-[1200px] h-[488px] mb-16 pb-8
        //Mobile Styling
        //Desktop Styling
      `}>
        <div className={`
          //General Styling
          flex justify-between items-center
          mb-4
          //Mobile Styling
          //Desktop Styling
        `}>
          <SectionTitle title="Recent Reviews" />
          <ViewAll />
        </div>
        <HomePageReviewPreview recentReviewData={recentReviews} />
      </section>
      {/* Tag Line */}
      <div className={`
        //General Styling
        w-full
        flex flex-col justify-center items-center
        mb-16 pb-8
        //Mobile Styling
        //Desktop Styling
      `}>
        <h2 className={`
          //General Styling
          text-4xl text-primaryText
          font-sans font-bold mb-4
          //Mobile Styling
          //Desktop Styling
        `}>
          From the Crate
        </h2>
        <p className={`
          //General Styling
          text-xl text-secondaryText
          //Mobile Styling
          //Desktop Styling
        `}>
          Catch the latest drops, headlines, and stories shaping the world of music.
        </p>
      </div>
      {/* News Section */}
      <section className={`
        //General Styling
        flex flex-col items-center justify-center
        mt-16 mb-16 pb-8
        //Mobile Styling
        //Desktop Styling
      `}>
        <div className={`
          //General Styling
          w-[1200px]
          flex items-center justify-between
          mb-4
          //Mobile Styling
          //Desktop Styling
        `}>
          <SectionTitle title={'Latest News'} />
          <ViewAll />
        </div>
        <div className={`
          //General Styling
          w-[1200px]
          grid grid-cols-3 grid-rows-1 gap-4 justify-center
          mb-14 mx-auto 
          //Mobile Styling
          //Desktop Styling
        `}>
          <ArticlePreview />
          <ArticlePreview />
          <ArticlePreview />
        </div>
      </section>
      {/* Call to Action Section */}
      <section className={`
        //General Styling
        w-[1200px]
        flex flex-col justify-center items-center
        mt-16 mb-16 p-16
        text-center
        bg-secondaryBackground
        rounded-lg
        //Mobile Styling
        //Desktop Styling
      `}>
        <h3 className={`
          //General Styling
          text-3xl text-primaryText font-bold
          //Mobile Styling
          //Desktop Styling
        `}>
          Join the Crate community
        </h3>
        <p className={`
          //General Styling
          w-lg
          text-secondaryText font-sans
          //Mobile Styling
          //Desktop Styling
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

