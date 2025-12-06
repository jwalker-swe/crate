import AlbumPageList from "@/components/AlbumPageList";
import AlbumPreview from "@/components/AlbumPreview";
import FollowButton from "@/components/FollowButton";
import NavBar from "@/components/NavBar";
import ProfileStat from "@/components/ProfileStat";
import SectionTitle from "@/components/SectionTitle";
import ViewAll from "@/components/ViewAll";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { createClient } from "@/lib/supabase/server";
import RecentlyListened from "@/components/RecentlyListened";
import Link from "next/link";
// import { createServerSupabaseClient } from '@/lib/supabase/server'

type ProfileProps = {
    params: Promise<{
        username: string
    }>
}

export default async function Profile({ params }: ProfileProps) {

	const supabase = await createClient();

    const { username } =  await params
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Get profile user's data
    const { data: profileUserData } = await supabase
        .from('users')
        .select('id, username, display_name, bio, avatar_url')
        .eq('username', username)
        .single();

    // Get favorite albums for the profile user
    let favoriteAlbumsData: any[] = [];
    if (profileUserData?.id) {
        try {
            // First, get the user_albums entries that are favorites
            const { data: userAlbumsData, error: userAlbumsError } = await supabase
                .from('user_albums')
                .select('album_id, created_at')
                .eq('user_id', profileUserData.id)
                .eq('is_favorite', true)
                .order('created_at', { ascending: true })
                .limit(5);

            if (userAlbumsError) {
                console.error('Error fetching user_albums:', {
                    message: userAlbumsError.message,
                    code: userAlbumsError.code,
                    details: userAlbumsError.details,
                    hint: userAlbumsError.hint,
                    userId: profileUserData.id
                });
            } else if (userAlbumsData && userAlbumsData.length > 0) {
                // Get the album IDs in order
                const albumIds = userAlbumsData.map(ua => ua.album_id);
                
                // Fetch the albums
                const { data: albumsData, error: albumsError } = await supabase
                    .from('albums')
                    .select('id, spotify_id, title, artists, cover_image_url')
                    .in('id', albumIds);

                if (albumsError) {
                    console.error('Error fetching albums:', {
                        message: albumsError.message,
                        code: albumsError.code,
                        details: albumsError.details,
                        hint: albumsError.hint
                    });
                } else if (albumsData) {
                    // Create a map for quick lookup
                    const albumMap = new Map(albumsData.map(album => [album.id, album]));
                    
                    // Combine the data in the expected format, preserving the order from userAlbumsData
                    favoriteAlbumsData = userAlbumsData
                        .map(ua => {
                            const album = albumMap.get(ua.album_id);
                            if (!album) return null;
                            return {
                                album_id: album.id,
                                albums: album
                            };
                        })
                        .filter(Boolean) as any[];
                }
            }
        } catch (err: any) {
            console.error('Unexpected error fetching favorite albums:', err);
        }
    }
    
    // Get current user's username to check if viewing own profile
    let currentUserUsername: string | null = null;
    let isFollowing: boolean = false;
    
    if (user) {
        const { data: userData } = await supabase
            .from('users')
            .select('username')
            .eq('id', user.id)
            .single();
        currentUserUsername = userData?.username || null;
        
        // Check if current user is following the profile user
        if (currentUserUsername !== username && profileUserData) {
            // Check if follow relationship exists
            const { data: followData } = await supabase
                .from('follows')
                .select('id')
                .eq('follower_id', user.id)
                .eq('following_id', profileUserData.id)
                .single();
            
            isFollowing = !!followData;
        }
    }
    
    // Check if viewing own profile
    const isOwnProfile = currentUserUsername === username;
    
    // Fetch current user's data for NavBar
    let currentUserData = null;
    if (user) {
        const { data } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();
        currentUserData = data;
    }

    return (
        <div className={`
            w-full max-w-[1200px] h-fit
            mx-auto py-4 px-4
            lg:w-[1200px] lg:px-0
        `}>
            <NavBar 
                session={user ? true : false} 
                initialUsername={currentUserData?.username || null}
                initialAvatarUrl={currentUserData?.avatar_url || null}
            />
            <div className={`
                profile-body
                w-full max-w-[896px]
                mx-auto
                pb-18
                lg:w-[896px]
            `}>
                <div className={`
                    profile-header
                    w-full
                    mt-8
                    flex flex-col gap-4
                    md:flex-row md:justify-between md:items-start md:mt-16
                `}>
                    <div className={`
                        user-profile-info
                        flex flex-col items-center gap-4
                        md:flex-row md:items-start
                    `}>
                        <div className={`
                            user-avatar-container
                            w-20 h-20
                            md:w-24 md:h-24
                            rounded-full
                            bg-secondaryBackground
                            flex-shrink-0
                            overflow-hidden
                            flex items-center justify-center
                        `}>
                            {profileUserData?.avatar_url ? (
                                <img 
                                    src={profileUserData.avatar_url} 
                                    alt={`${profileUserData.display_name || profileUserData.username}'s profile`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserCircleIcon width={96} height={96} className={`text-accentText w-full h-full`} />
                            )}
                        </div>
                        <div className={`
                            user-info-container
                            w-full
                            md:w-96
                            flex flex-col items-center justify-center
                            md:items-start
                        `}>
                            <div className={`
                                flex flex-col items-center gap-2
                                md:flex-row md:justify-between md:items-center md:gap-8
                                w-full
                            `}>
                                <h1 className={`
                                    text-2xl
                                    line-clamp-1
                                `}>
                                    {profileUserData?.display_name || profileUserData?.username || 'User'}
                                </h1>
                                {isOwnProfile ? (
                                    <Link href={`/profile/${username}/edit`}>
                                        <button className={`
                                            w-auto
                                            min-w-[100px]
                                            h-8
                                            px-4
                                            rounded-lg
                                            text-primaryText
                                            bg-tertiaryBackground
                                            hover:cursor-pointer
                                            hover:bg-secondaryBackground
                                            hover:text-primaryTextHover
                                            transition-colors
                                        `}>
                                            Edit Profile
                                        </button>
                                    </Link>
                                ) : (
                                    <FollowButton 
                                        profile={{profile: username}} 
                                        user={user?.id || null}
                                        initialFollowing={isFollowing}
                                    />
                                )}
                            </div>
                            <h2 className={`
                                username
                                text-secondaryText text-lg
                            `}>
                                @{username}
                            </h2>
                            {profileUserData?.bio && (
                                <p className={`
                                    user-bio
                                    text-secondaryText text-sm
                                    line-clamp-2
                                    whitespace-pre-wrap
                                `}>
                                    {profileUserData.bio}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className={`
                        user-stats-container
                        flex justify-center items-center gap-8
                    `}>
                        <ProfileStat statName={'albums'} username={username} />
                        <ProfileStat statName={'followers'} username={username} />
                        <ProfileStat statName={'following'} username={username} />
                    </div>
                </div>
                <div className={`
                    main-container
                    w-full max-w-[896px]
                    mx-auto mt-18
                    pb-18
                    px-4
                    lg:w-[896px] lg:px-0
                `}>
                    <section className={`
                        favorite-albums
                    `}>
                        <div className={`
                            favorite-albums-container
                        `}>
                            <div className={`
                                flex justify-between items-center
                            `}>
                                <SectionTitle title={'Favorite Albums'} />
                            </div>
                            <div className={`
                                flex justify-center mt-4
                                w-full
                            `}>
                                {favoriteAlbumsData && favoriteAlbumsData.length > 0 ? (
                                    <ul className={`
                                        grid-container
                                        mx-auto
                                        grid grid-cols-2 gap-4
                                        sm:grid-cols-6 sm:gap-4
                                        lg:grid-cols-5 lg:gap-5
                                        w-full
                                        max-w-full
                                    `}>
                                        {favoriteAlbumsData.map((item: any, index: number) => {
                                            // Handle both array and object formats for albums relationship
                                            const album = Array.isArray(item.albums) ? item.albums[0] : item.albums;
                                            if (!album || !album.id) {
                                                console.warn('Invalid album data:', item);
                                                return null;
                                            }
                                            
                                            // Handle artists field - could be array, string, or object
                                            let artistName = 'Unknown Artist';
                                            if (album.artists) {
                                                if (Array.isArray(album.artists)) {
                                                    // If it's an array, get the first artist's name
                                                    artistName = album.artists[0]?.name || album.artists[0] || 'Unknown Artist';
                                                } else if (typeof album.artists === 'string') {
                                                    artistName = album.artists;
                                                } else if (album.artists.name) {
                                                    artistName = album.artists.name;
                                                }
                                            }
                                            
                                            // Layout logic:
                                            // Mobile: First album full width (col-span-2), larger size
                                            // sm: Row 1 - 2 equal columns (col-span-3 each), Row 2 - 3 equal columns (col-span-2 each)
                                            // lg: All albums col-span-1 (5 columns in one row)
                                            const isFirstAlbum = index === 0;
                                            const isSecondAlbum = index === 1;
                                            const isThirdToFifthAlbum = index >= 2 && index <= 4;
                                            
                                            let colSpanClass = '';
                                            if (isFirstAlbum) {
                                                colSpanClass = 'col-span-2 sm:col-span-3 lg:col-span-1';
                                            } else if (isSecondAlbum) {
                                                colSpanClass = 'sm:col-span-3 lg:col-span-1';
                                            } else if (isThirdToFifthAlbum) {
                                                colSpanClass = 'sm:col-span-2 lg:col-span-1';
                                            } else {
                                                colSpanClass = 'sm:col-span-2 lg:col-span-1';
                                            }
                                            
                                            return (
                                                <li
                                                    key={album.id || `album-${index}`}
                                                    className={colSpanClass}
                                                >
                                                    <AlbumPreview
                                                        id={album.id}
                                                        coverHeight={isFirstAlbum ? 200 : 160}
                                                        name={album.title || 'Unknown Album'}
                                                        artist={artistName}
                                                        imageUrl={album.cover_image_url || '/images/album-covers/test-album-cover.png'}
                                                    />
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p className={`
                                        text-secondaryText text-sm
                                        py-8
                                    `}>
                                        No favorite albums yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                    <section className={`
                        recently-listened
                        mt-16
                    `}>
                        <div className={`
                            favorite-albums-container
                        `}>
                            <div className={`
                                flex justify-between items-center
                            `}>
                                <SectionTitle title={'Recently Reviewed'} />
                                <ViewAll pageLink="reviews" />
                            </div>
                            <RecentlyListened username={username} />
                            {/* Component to feth favorite albums based on username */}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
