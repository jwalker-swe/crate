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
import { createClient } from "@/lib/supabase/server";
import PopularReviewPreview from "@/components/PopularReviewPreview";
import getAlbumIdBySpotifyId from "@/lib/supabase/getAlbumIdBySpotifyId";


type StateType = string;

export default async function Home({ params }: AlbumPageParams) {

    // Setup state
    const supabase = await createClient();
    const { data: { user } }: any = await supabase.auth.getUser();  

    // Retrieve album id from url params
    const urlParams = await params;
    const spotifyId = urlParams.id;
    const albumId = await getAlbumIdBySpotifyId(spotifyId);


    // First, try to get album data from our database
    const { data: existingAlbum, error: dbError } = await supabase
        .from('albums')
        .select('*')
        .eq('spotify_id', spotifyId)
        .single();

    let albumInfo;
    let spotifyAlbumInfo;

    if (existingAlbum && !dbError) {
        // Album exists in database, use it
        console.log('Album found in database');
        albumInfo = existingAlbum;
        
        // Fetch latest data from Spotify to ensure database is up to date
        spotifyAlbumInfo = await getAlbumById(spotifyId);
        
        if (spotifyAlbumInfo) {
            // Check if data is outdated and update if necessary
            const fieldsToCompare = {
                title: albumInfo.title !== spotifyAlbumInfo.name,
                release_date: albumInfo.release_date !== spotifyAlbumInfo.release_date,
                cover_image_url: albumInfo.cover_image_url !== spotifyAlbumInfo.images[0].url,
                artists: JSON.stringify(albumInfo.artists) !== JSON.stringify(spotifyAlbumInfo.artists),
                tracks: JSON.stringify(albumInfo.tracks) !== JSON.stringify(spotifyAlbumInfo.tracks)
            };

            const isOutdated = Object.values(fieldsToCompare).some(isFieldOutdated => isFieldOutdated);

            if (isOutdated) {
                console.log(`Album data for ${spotifyId} is outdated. Updating...`);
                const { error } = await supabase
                    .from('albums')
                    .update({
                        title: spotifyAlbumInfo.name,
                        release_date: spotifyAlbumInfo.release_date,
                        cover_image_url: spotifyAlbumInfo.images[0].url,
                        artists: spotifyAlbumInfo.artists,
                        tracks: spotifyAlbumInfo.tracks,
                    })
                    .eq('spotify_id', spotifyId);

                if (error) {
                    console.error('Error updating album data: ', error);
                } else {
                    // Update local variable with latest data
                    albumInfo.title = spotifyAlbumInfo.name;
                    albumInfo.release_date = spotifyAlbumInfo.release_date;
                    albumInfo.cover_image_url = spotifyAlbumInfo.images[0].url;
                    albumInfo.artists = spotifyAlbumInfo.artists;
                    albumInfo.tracks = spotifyAlbumInfo.tracks;
                    console.log(`Successfully updated album data for ${spotifyId}`);
                }
            }
        }
    } else {
        // Album doesn't exist in database, fetch from Spotify and add to database
        console.log('Album not found in database, fetching from Spotify...');
        spotifyAlbumInfo = await getAlbumById(spotifyId);
        
        if (!spotifyAlbumInfo) {
            throw new Error('Album not found on Spotify');
        }

        // Create album data object
        albumInfo = {
            title: spotifyAlbumInfo.name,
            release_date: spotifyAlbumInfo.release_date,
            cover_image_url: spotifyAlbumInfo.images[0].url,
            artists: spotifyAlbumInfo.artists,
            tracks: spotifyAlbumInfo.tracks,
            total_tracks: spotifyAlbumInfo.total_tracks,
            rating: null
        };

        // Add album to database
        console.log(`Adding new album to database: ${spotifyAlbumInfo.name}`);
        const { error: insertError } = await supabase
            .from('albums')
            .insert({
                spotify_id: spotifyId,
                title: spotifyAlbumInfo.name,
                release_date: spotifyAlbumInfo.release_date,
                cover_image_url: spotifyAlbumInfo.images[0].url,
                artists: spotifyAlbumInfo.artists,
                tracks: spotifyAlbumInfo.tracks,
                total_tracks: spotifyAlbumInfo.total_tracks,
                rating: null
            });

        if (insertError) {
            console.error('Error adding album to database: ', insertError);
        } else {
            console.log(`Successfully added album to database: ${spotifyAlbumInfo.name}`);
        }
    }

    
    // Seperate out release year from release date
    const releaseDate = getReleaseDate(albumInfo.release_date);

    return (
        <div className={`
            //General Styling
            content-container
            w-[1200px] h-fit
            mx-auto py-4
            //Mobile Styling
            //Desktop Styling
        `}>
            <NavBar session={user ? true : false} />
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
                            <img src={albumInfo.cover_image_url} width={320} height={320} alt={`album cover for ${albumInfo.name}`} 
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
                                        {albumInfo.title}
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
                                <DisplayAlbumStats id={spotifyId} rating={albumInfo.rating} />
                                <LogOptions album={albumInfo} session={user ? true : false} />
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
                        <ViewAll pageLink="activity" />
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
                        <ViewAll pageLink="reviews" />
                    </div>
                    <div className={`
                        //General Styling
                        mb-16
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                       <PopularReviewPreview albumId={albumId} nReviewsToDisplay={2}/> 
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
                        <ViewAll pageLink="lists" />
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