//import page dependencies
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from 'next/navigation';
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
import WantToListenButton from "@/components/WantToListenButton"
import getFriendsActivity from "@/lib/supabase/getFriendsActivity";
import calculateAlbumRating from "@/lib/supabase/calculateAlbumRating";


type StateType = string;

export default async function Home({ params }: AlbumPageParams) {

    // Setup state
    const supabase = await createClient();
    const { data: { user } }: any = await supabase.auth.getUser();
    
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

    // Retrieve album id from url params
    const urlParams = await params;
    const urlId = urlParams.id;
    
    // Check if the ID is a UUID (database ID) or a Spotify ID
    // UUIDs are 36 characters with dashes: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(urlId);
    
    let existingAlbum;
    let dbError;
    let spotifyId: string;
    let albumId: string | null = null;
    
    if (isUUID) {
        // It's a database ID, fetch it and redirect to use spotify_id
        const { data, error } = await supabase
            .from('albums')
            .select('*')
            .eq('id', urlId)
            .single();
        
        // If album not found by database ID, it doesn't exist
        if (error || !data) {
            notFound();
        }
        
        // Redirect to use spotify_id in URL
        if (data.spotify_id) {
            redirect(`/album/${data.spotify_id}`);
        } else {
            notFound();
        }
    } else {
        // It's a Spotify ID, always check database first
        spotifyId = urlId;
        
        const { data, error } = await supabase
        .from('albums')
        .select('*')
        .eq('spotify_id', spotifyId)
        .single();
        
        existingAlbum = data;
        dbError = error;
        
        // If we found the album, use its database ID for queries
        if (data?.id) {
            albumId = data.id;
        }
    }

    let albumInfo;
    let spotifyAlbumInfo;

    if (existingAlbum && !dbError) {
        // Album exists in database, use it
        console.log('Album found in database');
        albumInfo = existingAlbum;
        
        // Check if track list or total_tracks is missing
        const needsTrackData = !albumInfo.tracks || !albumInfo.total_tracks;
        
        // Only fetch from Spotify if:
        // 1. Critical data is missing (tracks), OR
        // 2. Album hasn't been updated in the last 7 days
        const shouldCheckForUpdates = needsTrackData || (() => {
            if (!albumInfo.updated_at) return true;
            const lastUpdated = new Date(albumInfo.updated_at);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return lastUpdated < sevenDaysAgo;
        })();
        
        if (shouldCheckForUpdates) {
            // Fetch latest data from Spotify to ensure database is up to date
            // This is done conditionally to reduce API calls
            try {
                spotifyAlbumInfo = await getAlbumById(spotifyId);
                
                if (spotifyAlbumInfo) {
                    // Check if data is outdated or missing track information
                    const fieldsToCompare = {
                        title: albumInfo.title !== spotifyAlbumInfo.name,
                        release_date: albumInfo.release_date !== spotifyAlbumInfo.release_date,
                        cover_image_url: albumInfo.cover_image_url !== spotifyAlbumInfo.images[0].url,
                        artists: JSON.stringify(albumInfo.artists) !== JSON.stringify(spotifyAlbumInfo.artists),
                        tracks: JSON.stringify(albumInfo.tracks) !== JSON.stringify(spotifyAlbumInfo.tracks),
                        total_tracks: albumInfo.total_tracks !== spotifyAlbumInfo.total_tracks
                    };

                    const isOutdated = Object.values(fieldsToCompare).some(isFieldOutdated => isFieldOutdated);
                    const needsUpdate = isOutdated || needsTrackData;

                    if (needsUpdate) {
                        console.log(`Album data for ${spotifyId} needs update. Updating...`);
                        const updateData: any = {
                            title: spotifyAlbumInfo.name,
                            release_date: spotifyAlbumInfo.release_date,
                            cover_image_url: spotifyAlbumInfo.images[0].url,
                            artists: spotifyAlbumInfo.artists,
                            updated_at: new Date().toISOString()
                        };
                        
                        // Always update tracks and total_tracks if missing or outdated
                        if (needsTrackData || fieldsToCompare.tracks) {
                            updateData.tracks = spotifyAlbumInfo.tracks;
                        }
                        if (needsTrackData || fieldsToCompare.total_tracks) {
                            updateData.total_tracks = spotifyAlbumInfo.total_tracks;
                        }
                        
                        const { error } = await supabase
                            .from('albums')
                            .update(updateData)
                            .eq('id', albumId!);

                        if (error) {
                            console.error('Error updating album data: ', error);
                        } else {
                            // Update local variable with latest data
                            albumInfo.title = spotifyAlbumInfo.name;
                            albumInfo.release_date = spotifyAlbumInfo.release_date;
                            albumInfo.cover_image_url = spotifyAlbumInfo.images[0].url;
                            albumInfo.artists = spotifyAlbumInfo.artists;
                            if (needsTrackData || fieldsToCompare.tracks) {
                                albumInfo.tracks = spotifyAlbumInfo.tracks;
                            }
                            if (needsTrackData || fieldsToCompare.total_tracks) {
                                albumInfo.total_tracks = spotifyAlbumInfo.total_tracks;
                            }
                            console.log(`Successfully updated album data for ${spotifyId}`);
                        }
                    }
                }
            } catch (error) {
                // If Spotify API call fails, continue with database data
                console.error(`Error fetching Spotify data for ${spotifyId}, using database data:`, error);
            }
        }
    } else {
        // Album doesn't exist in database, fetch from Spotify and add to database
        console.log('Album not found in database, fetching from Spotify...');
        spotifyAlbumInfo = await getAlbumById(spotifyId);
        
        if (!spotifyAlbumInfo) {
            notFound();
        }

        // Add album to database
        console.log(`Adding new album to database: ${spotifyAlbumInfo.name}`);
        const { data: insertedAlbum, error: insertError } = await supabase
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
            })
            .select('id')
            .single();

        if (insertError) {
            console.error('Error adding album to database: ', insertError);
            throw new Error('Failed to add album to database');
        } else {
            console.log(`Successfully added album to database: ${spotifyAlbumInfo.name}`);
            // Use the database ID for queries, but keep spotify_id in URL
            if (insertedAlbum?.id) {
                albumId = insertedAlbum.id;
                // Set albumInfo from Spotify data (which matches what we just inserted)
                albumInfo = {
                    id: insertedAlbum.id,
                    spotify_id: spotifyId,
                    title: spotifyAlbumInfo.name,
                    release_date: spotifyAlbumInfo.release_date,
                    cover_image_url: spotifyAlbumInfo.images[0].url,
                    artists: spotifyAlbumInfo.artists,
                    tracks: spotifyAlbumInfo.tracks,
                    total_tracks: spotifyAlbumInfo.total_tracks,
                    rating: null
                };
            } else {
                notFound();
            }
        }
    }
    
    // Ensure we have a valid albumId - if not, the album doesn't exist
    if (!albumId) {
        notFound();
    }

    
    // Seperate out release year from release date
    const releaseDate = getReleaseDate(albumInfo.release_date);

    // Check if album is in user's queue (server-side)
    let isInQueue = false;
    if (user && albumId) {
        const { data: queueEntry } = await supabase
            .from('queue')
            .select('id')
            .eq('user_id', user.id)
            .eq('album_id', albumId)
            .maybeSingle();

        isInQueue = !!queueEntry;
    }

    // Get friends' activity for this album
    const friendsActivity = user && albumId ? await getFriendsActivity(albumId, user.id) : [];

    // Calculate album rating using only the most recent rating per user
    let calculatedRating: number | null = null;
    if (albumId) {
        calculatedRating = await calculateAlbumRating(albumId);
        
        // Update the albums.rating field for caching if it's different
        if (calculatedRating !== albumInfo.rating) {
            await supabase
                .from('albums')
                .update({ rating: calculatedRating })
                .eq('id', albumId);
            albumInfo.rating = calculatedRating;
        } else if (calculatedRating !== null) {
            // Use calculated rating even if albums.rating is already set
            albumInfo.rating = calculatedRating;
        }
    }

    return (
        <div className={`
            //General Styling
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
            <div className={`
                w-full max-w-[896px]
                mx-auto
                pb-18 px-4
                lg:w-[896px] lg:px-0
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
                            flex flex-col gap-4
                            pt-8 pb-8
                            sm:flex-row sm:items-start
                            lg:justify-center lg:gap-8 lg:pt-16 lg:items-center
                        ">
                            <div className="
                                flex flex-row items-center gap-4
                                sm:flex-1
                            ">
                                <img src={albumInfo.cover_image_url} width={320} height={320} alt={`album cover for ${albumInfo.name}`} 
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
                                            {albumInfo.title}
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
                                            {albumInfo.artists[0].name}
                                        </h2>
                                        <div className={`
                                            album-info-container
                                            //General Styling
                                            flex justify-start items-center gap-2
                                            text-secondaryText font-sans text-xs
                                            sm:text-sm
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
                                    <div className="hidden sm:block">
                                        <div className="flex items-center gap-3">
                                            <WantToListenButton 
                                                album={albumInfo} 
                                                albumId={albumId}
                                                userId={user?.id || null}
                                                initialIsInQueue={isInQueue}
                                            />
                                            <LogOptions album={albumInfo} session={user ? true : false} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="sm:hidden">
                                <div className="flex flex-col gap-3 w-full">
                                    <WantToListenButton 
                                        album={albumInfo} 
                                        albumId={albumId}
                                        userId={user?.id || null}
                                        initialIsInQueue={isInQueue}
                                    />
                                    <LogOptions album={albumInfo} session={user ? true : false} />
                                </div>
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
                        {friendsActivity.length > 0 ? (
                            friendsActivity.slice(0, 5).map((activity, index) => (
                                <UserActivityIcon
                                    key={activity.user_id}
                                    username={activity.username}
                                    avatarUrl={activity.avatar_url}
                                    activityType={activity.activity_type}
                                    rating={activity.rating}
                                    spotifyId={spotifyId}
                                    userAlbumId={activity.user_album_id}
                                    hasReview={activity.activity_type === 'reviewed'}
                                />
                            ))
                        ) : (
                            <p className="text-secondaryText text-sm">
                                No activity from friends yet
                            </p>
                        )}
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
                        <ViewAll pageLink={`album/${urlId}/reviews`} />
                    </div>
                    <div className={`
                        //General Styling
                        mb-16
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                       <PopularReviewPreview albumId={albumId!} nReviewsToDisplay={2}/> 
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
                        grid grid-cols-1 gap-4
                        md:grid-cols-2
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
