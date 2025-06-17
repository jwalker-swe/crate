import Image from "next/image";
import './globals.css';
import NavBar from "@/components/NavBar";
import Link from "next/link";
import Footer from "@/components/Footer";
import AlbumPreview from "@/components/AlbumPreview";

export default function Home() {
  return (
    <div className={`
      content-container
      w-[1200px] h-fit
      mx-auto py-4
    `}>
      <NavBar />
      <section className={`
        hero-section
        //General Styling
        w-full h-96
        mt-16
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
          Join the community of music enthusiasts. Log our listening, rate albums, and discover new music based on your taste.
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
      <section className={`
        //General Styling
        flex flex-col items-center justify-center gap-8
        mt-16 pb-8
        //Mobile Styling
        //Desktop Styling
      `}>
        <h3 className={`
          //General Styling
          text-2xl text-secondaryText font-sans
          //Mobile Styling
          //Desktop Styling
        `}>
          Albums from all your favorite artist
        </h3>
        <ul className={`
          //General Styling
          w-[1200px]
          grid grid-cols-5 gap-4 grid-rows-1
          //Mobile Styling
          //Desktop Styling
        `}>
          <Link href='#'>
            <li>
              <AlbumPreview height="h-56"/>
            </li>
          </Link>
          <Link href='#'>
            <li>
              <AlbumPreview height="h-56"/>
            </li>
          </Link>
          <Link href='#'>
            <li>
              <AlbumPreview height="h-56"/>
            </li>
          </Link>
          <Link href='#'>
            <li>
              <AlbumPreview height="h-56"/>
            </li>
          </Link>
          <Link href='#'>
            <li>
              <AlbumPreview height="h-56"/>
            </li>
          </Link>
        </ul>
      </section>
      <Footer />
    </div>
  )
}