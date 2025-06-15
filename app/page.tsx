import Image from "next/image";
import './globals.css';
import NavBar from "@/components/NavBar";
import Link from "next/link";

export default function Home() {
  return (
    <div className={`
      content-container
      w-[1200px] h-screen
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
            text-lg
            my-6 px-4 py-2
            rounded-lg
            bg-primaryButton
            //Mobile Styling
            //Desktop Styling
          `}>
            Start your journey for free
          </div>
        </Link>
      </section>
      <section className={`
      
      `}>
      </section>
    </div>
  )
}