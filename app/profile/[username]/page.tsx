import AlbumPageList from "@/components/AlbumPageList";
import AlbumPreview from "@/components/AlbumPreview";
import FollowButton from "@/components/FollowButton";
import NavBar from "@/components/NavBar";
import ProfileStat from "@/components/ProfileStat";
import FollowerModal from "@/components/FollowerModal";
import FollowingModal from "@/components/FollowingModal";
import SectionTitle from "@/components/SectionTitle";
import ViewAll from "@/components/ViewAll";
import Footer from "@/components/Footer";
import { UserCircleIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import { createClient } from "@/lib/supabase/server";
import JustReviewed from "@/components/JustReviewed";
import getUserRecentReviews from "@/lib/supabase/getUserRecentReviews";
import Link from "next/link";
// import { createServerSupabaseClient } from '@/lib/supabase/server'

type ProfileProps = {
    params: Promise<{
        username: string
    }>
}

interface FollowingUser {
	following_id: string;
	users: {
		id: string;
		username: string;
		display_name: string | null;
		avatar_url: string | null;
	}
}

interface FollowerUser {
	following_id: string;
	users: {
		id: string;
		username: string;
		display_name: string | null;
		avatar_url: string | null;
	}
}

let followingUsers: FollowingUser[] = [];
let followerUsers: FollowerUser[] = [];

export default async function Profile({ params }: ProfileProps) {

	const supabase = await createClient();

    const { username } =  await params
    const { data: { user }, error } = await supabase.auth.getUser()

	// Get profile user's data
    const { data: profileUserData, error: profileUserError } = await supabase
		.from('users')
        .select('id, username, display_name, bio, avatar_url, created_at, is_vip')
		.eq('username', username)
        .single();





	// Get user following
	try {
		const { data: followingData, error: followingError } = await supabase
			.from('follows')
			.select(`
				following_id,
				users!follows_following_id_fkey (
					id,
					username,
					display_name,
					avatar_url
				)
			`)
			.eq('follower_id', profileUserData.id)

		if ( followingError ) {
			console.error('Error fetching following: ', followingError)
			followingUsers = [];
		}

		if ( !followingData || followingData.length === 0 ) {
			followingUsers = [];
		}

		followingUsers = followingData;
	} catch ( error ) {
		console.error('Unexpected error fetching following: ', error)
	}





	// Get user followers
	try {
		const { data: followerData, error: followerError } = await supabase
			.from('follows')
			.select(`
				follower_id,
				users!follows_follower_id_fkey (
					id,
					username,
					display_name,
					avatar_url
				)
			`)
			.eq('following_id', profileUserData.id)

		if ( followerError ) {
			console.error('Error fetching followers: ', followerError)
		}

		if ( !followerData || followerData.length === 0 ) {
			followerUsers = [];
		}

		followerUsers = followerData;
	} catch ( error ) {
		console.error('Unexpected error fetching followers: ', error)
	}





    // If user doesn't exist, return 404
    if (profileUserError || !profileUserData) {
        return (
            <div className={`
                w-full max-w-[1200px] h-fit
                mx-auto py-4 px-4
                lg:w-[1200px] lg:px-0
            `}>
                <NavBar 
                    session={user ? true : false} 
                    initialUsername={null}
                    initialAvatarUrl={null}
                    initialUserId={user?.id || null}
                />
                <div className={`
                    w-full max-w-[896px]
                    mx-auto
                    pb-18
                    lg:w-[896px]
                    flex flex-col items-center justify-center
                    min-h-[400px]
                `}>
                    <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
                    <p className="text-secondaryText mb-4">
                        The user @{username} does not exist.
                    </p>
                    <Link 
                        href="/"
                        className="text-accentText hover:text-primaryButtonHover transition-colors"
                    >
                        Return to Home →
                    </Link>
                </div>
            </div>
        )
    }





    // Get favorite albums for the profile user
    let favoriteAlbumsData: any[] = [];

    if (profileUserData?.id) {
        try {
            // Get favorites from the favorites table
            const { data: favoritesData, error: favoritesError } = await supabase
                .from('favorites')
                .select('album_id, created_at')
                .eq('user_id', profileUserData.id)
                .order('created_at', { ascending: true })
                .limit(5);

            if (favoritesError) {
                console.error('Error fetching favorites:', {
                    message: favoritesError.message,
                    code: favoritesError.code,
                    details: favoritesError.details,
                    hint: favoritesError.hint,
                    userId: profileUserData.id
                });
            } else if (favoritesData && favoritesData.length > 0) {
                // Get the album IDs in order
                const albumIds = favoritesData.map(f => f.album_id);
                
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
                    
                    // Combine the data in the expected format, preserving the order from favoritesData
                    favoriteAlbumsData = favoritesData
                        .map(f => {
                            const album = albumMap.get(f.album_id);
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





    // Fetch user's recent reviews for the JustReviewed component
    const userRecentReviewsData = await getUserRecentReviews(username, 6);

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
                initialUserId={user?.id || null}
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
                            <UserCircleIcon width={96} height={96} className={`text-secondaryText w-full h-full`} />
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
                                {/* Edit/Follow button - hidden on mobile, shown on desktop */}
                                <div className="hidden md:block">
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
                            </div>
                            <div className={`
                                flex items-center gap-2
                                mb-4
                            `}>
                            <h2 className={`
                                username
                                text-secondaryText text-lg
                            `}>
                                @{username}
                            </h2>
                                {profileUserData?.is_vip && (
                                    <CheckBadgeIcon 
                                        className="w-5 h-5 text-amber-400"
                                        title="VIP"
                                    />
                                )}
                            </div>
                            {profileUserData?.bio && (
                            <p className={`
                                user-bio
                                text-secondaryText text-sm
                                line-clamp-2
                                    whitespace-pre-wrap
                                    text-center
                                    md:text-left
                                    mb-4
                                `}>
                                    {profileUserData.bio}
                                </p>
                            )}
                            {/* Edit/Follow button - shown on mobile, hidden on desktop */}
                            <div className="md:hidden flex justify-center mt-4">
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
                        </div>
                    </div>
                    <div className={`
                        user-stats-container
                        flex justify-center items-center gap-8
                    `}>
                        <ProfileStat statName={'albums'} username={username} />
						<FollowerModal 
							followerData={followerUsers} 
							userId={profileUserData?.id}
							currentUserId={user?.id || null}
							isOwnProfile={isOwnProfile}
						/>
						<FollowingModal 
							followingData={followingUsers} 
							userId={profileUserData?.id}
							currentUserId={user?.id || null}
							isOwnProfile={isOwnProfile}
						/>	
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
                            {userRecentReviewsData && (
                                <JustReviewed 
                                    columns={1} 
                                    rows={3} 
                                    gap={4} 
                                    data={userRecentReviewsData} 
                                    user={user}
                                    pageLink={`profile/${username}/review`}
                                />
                            )}
                            {/* Component to feth favorite albums based on username */}
                        </div>
                    </section>
                </div>
            </div>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}
