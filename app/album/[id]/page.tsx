//import page dependencies
import Image from "next/image";
import Link from "next/link";
import { notFound } from 'next/navigation';
import { StarIcon } from "@heroicons/react/24/solid";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import getAlbumById from "@/lib/spotify/getAlbumById";
import { AlbumInfo, AlbumPageParams, AlbumType, SpotifyAlbum, SpotifyAlbumsResponse } from "@/types/spotify";
import getReleaseYear from "@/lib/spotify/getReleaseYear";
import getReleaseDate from "@/lib/spotify/getReleaseDate";
import SectionTitle from "@/components/SectionTitle";
import ViewAll from "@/components/ViewAll";
import ReviewPreview from "@/components/ReviewPreview";
import AlbumPageReview from "@/components/AlbumPageReview";
import DisplayAlbumStats from "@/components/DisplayAlbumStats";
import AlbumPageList from "@/components/AlbumPageList";
import UserActivityIcon from "@/components/UserActivityIcon";
import AlbumPageInfo from '@/components/AlbumPageInfo';
import LogOptions from "@/components/LogOptions";


type StateType = string;

export default async function Home({ params }: AlbumPageParams) {

    // Setup state

    // Retrieve album id from url params
    const { id } = await params;
    // console.log(id);

    //Fetch album data based on album id
    const data = await getAlbumById(id);

    const albumInfo: SpotifyAlbum = {
        artists: data.artists,
        id: data.id,
        images: data.images,
        name: data.name,
        release_date: data.release_date,
        total_tracks: data.total_tracks,
        tracks: data.tracks
    }

    // console.log(albumInfo.artists);
    
    //Seperate out release year from release date
    const releaseDate = getReleaseDate(albumInfo.release_date);

    //To Do:
        //Take albumInfo and build out html elements

    

    return (
        <div className={`
            //General Styling
            content-container
            w-[1200px] h-fit
            mx-auto py-4
            //Mobile Styling
            //Desktop Styling
        `}>
            <NavBar />
            <div className={`
                w-[896px]
                mx-auto
                pb-18
            `}>
                {/* Album Hero Section */}
                <section>
                    <div className={`
                        //General Styling
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <div className="
                            //General Styling
                            flex justify-center items-center gap-8
                            pt-16 pb-8
                            //Mobile Styling
                            //Desktop Styling
                        ">
                            <img src={albumInfo.images[0].url} width={320} height={320} alt={`album cover for ${albumInfo.name}`} 
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
                                        text-primaryText text-3xl font-bold font-sans 
                                        //Mobile Styling
                                        //Desktop Styling
                                    `}>
                                        {albumInfo.name}
                                    </h1>
                                    <h2 className={`
                                        artist-name
                                        //General Styling
                                        text-accentText text-3xl font-sans
                                        //Mobile Styling
                                        //Desktop Styling
                                    `}>
                                        {albumInfo.artists[0].name}
                                    </h2>
                                    <div className={`
                                        album-info-container
                                        //General Styling
                                        flex justify-start items-center gap-2
                                        text-secondaryText font-sans
                                        //Mobile Styling
                                        //Desktop Styling
                                    `}>
                                        <span className={`year-of-release`}>
                                            {`${releaseDate.releaseMonth} ${releaseDate.releaseDateInfo[2]}, ${releaseDate.releaseDateInfo[0]}`}
                                        </span>
                                        <div className={`
                                            bg-secondaryText
                                            w-1 h-1
                                            rounded-full
                                        `}>
                                        </div>
                                        <span className={`total-tracks`}>
                                            {`${albumInfo.total_tracks} Songs`}
                                        </span>
                                    </div>
                                </div>
                                <DisplayAlbumStats id={id} />
                                <LogOptions album={albumInfo} />
                            </div>
                        </div>
                        <div className={`
                            //General Styling
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            {/* Display Album Info Component containing info on album track list tab, performed by tab, and producers tab  */}
                            <AlbumPageInfo tracks={albumInfo.tracks.items} totalTracks={albumInfo.total_tracks} />
                        </div>
                    </div>
                </section>
                {/* Album Info Section */}

                {/* Activity From Friends Section */}
                <section className={`
                    w-full
                    mt-16
                `}>
                    <div className={`
                        //General Styling
                        flex justify-between items-center
                        mb-4
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <SectionTitle title="Activity From Friends" />
                        <ViewAll />
                    </div>
                    <div className={`
                        //General Styling
                        w-full
                        flex justify-start items-center gap-2
                        mb-16
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <UserActivityIcon />
                        <UserActivityIcon />
                        <UserActivityIcon />
                    </div>
                </section>
                {/* Popular Reviews Section */}
                <section>
                    <div className={`
                        //General Styling
                        flex justify-between items-center
                        mb-4
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <SectionTitle title="Popular Reviews" />
                        <ViewAll />
                    </div>
                    <div className={`
                        //General Styling
                        grid grid-cols-1 grid-rows-2 gap-4
                        mb-16
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <AlbumPageReview />
                        <AlbumPageReview />
                    </div>
                    {/* <div className={`
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
                        grid grid-cols-1 grid-rows-3 gap-4
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <AlbumPageReview />
                        <AlbumPageReview />
                        <AlbumPageReview />
                    </div> */}
                </section>
                {/* Popular Lists Section */}
                <section>
                    <div className={`
                        //General Styling
                        flex justify-between items-center
                        mb-4
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <SectionTitle title="Popular Lists" />
                        <ViewAll />
                    </div>
                    <div className={`
                        //General Styling
                        grid grid-cols-2 grid-rows-2 gap-4
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <AlbumPageList />
                        <AlbumPageList />
                        <AlbumPageList />
                        <AlbumPageList />
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    )
}