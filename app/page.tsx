import Image from "next/image";
import './globals.css';
import NavBar from "@/components/NavBar";
import Link from "next/link";
import Footer from "@/components/Footer";
import AlbumPreview from "@/components/AlbumPreview";
import FeatureDescription from "@/components/FeatureDescription";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import ViewAll from "@/components/ViewAll";
import SectionTitle from "@/components/SectionTitle";
import ArticlePreview from "@/components/ArticlePreview";
import ReviewPreview from "@/components/ReviewPreview";
import { SpotifyAlbumsResponse } from "@/types/spotify";
import getTopAlbums from '@/lib/spotify/getTopAlbums';

//Create function to get Album data

export default async function Home() {

  //Get Album Data
  const res = await getTopAlbums();
  const musicData: SpotifyAlbumsResponse = res
  console.log(musicData);
  const musicItems = musicData.albums.items;

  const albumsOnly = musicItems.filter((item) => item.album_type === 'album');
  console.log(albumsOnly);

  // console.log(albumItems);

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

  albumsOnly.forEach(item => {
    albumTitle.push(item.name);
    albumArtist.push(item.artists[0].name)
    albumID.push(item.id);
    albumImage.push(item.images[0].url)

  })

  let albums: AlbumProps = {
    title: albumTitle,
    artist: albumArtist,
    id: albumID,
    images: albumImage
  }

  console.log('Albums:', albums);

  return (
    <div className={`
      content-container
      w-[1200px] h-fit
      mx-auto py-4
    `}>
      {/*NavBar*/}
      <NavBar />
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
        <Link href='#'>
          <div className={`
            //General Styling
            text-lg text-primaryText font-medium hover:text-primaryTextHover
            my-6 px-5 py-3
            rounded-xl
            bg-primaryButton hover:bg-primaryButtonHover
            transition-colors
            ease-in-out
            duration-200
            //Mobile Styling
            //Desktop Styling
          `}>
            Start your journey for free
          </div>
        </Link>
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
        <ul className={`
          //General Styling
          w-[1200px]
          grid grid-cols-[224px_224px_224px_224px_224px] gap-5 grid-rows-1
          mx-auto items-center justify-center
          //Mobile Styling
          //Desktop Styling
        `}>
          <AlbumPreview coverHeight={224} id={albums.id[0]} name={albums.title[0]} artist={albums.artist[0]} imageUrl={albums.images[0]} />
          <AlbumPreview coverHeight={224} id={albums.id[1]} name={albums.title[1]} artist={albums.artist[1]} imageUrl={albums.images[1]} />
          <AlbumPreview coverHeight={224} id={albums.id[2]} name={albums.title[2]} artist={albums.artist[2]} imageUrl={albums.images[2]} />
          <AlbumPreview coverHeight={224} id={albums.id[3]} name={albums.title[3]} artist={albums.artist[3]} imageUrl={albums.images[3]} />
          <AlbumPreview coverHeight={224} id={albums.id[4]} name={albums.title[4]} artist={albums.artist[4]} imageUrl={albums.images[4]} />

        </ul>
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
        <div className={`
          //General Styling
          grid grid-cols-2 grid-rows-2 justify-center gap-6
          //Mobile Styling
          //Desktop Styling
        `}>
          <ReviewPreview />
          <ReviewPreview />
          <ReviewPreview />
          <ReviewPreview />
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