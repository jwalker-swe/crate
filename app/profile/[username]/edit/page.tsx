import NavBar from "@/components/NavBar";
import EditProfileForm from "@/components/EditProfileForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type ProfileEditProps = {
    params: Promise<{
        username: string
    }>
}

export default async function ProfileEdit({ params }: ProfileEditProps) {
    const supabase = await createClient();
    const { username } = await params;
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect if not logged in
    if (!user) {
        redirect('/auth/sign-in');
    }

    // Get current user's username to verify they're editing their own profile
    const { data: currentUserData } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

    // Redirect if trying to edit someone else's profile
    if (currentUserData?.username !== username) {
        redirect(`/profile/${currentUserData?.username || ''}`);
    }

    // Fetch user's current profile data
    const { data: profileData } = await supabase
        .from('users')
        .select('username, display_name, bio, avatar_url')
        .eq('id', user.id)
        .single();

    // Fetch current favorite albums
    let initialFavorites: any[] = [];
    try {
        // First, get the user_albums entries that are favorites
        const { data: userAlbumsData } = await supabase
            .from('user_albums')
            .select('album_id, created_at')
            .eq('user_id', user.id)
            .eq('is_favorite', true)
            .order('created_at', { ascending: true })
            .limit(5);

        if (userAlbumsData && userAlbumsData.length > 0) {
            // Get the album IDs in order
            const albumIds = userAlbumsData.map(ua => ua.album_id);
            
            // Fetch the albums
            const { data: albumsData } = await supabase
                .from('albums')
                .select('id, spotify_id, title, artists, cover_image_url')
                .in('id', albumIds);

            if (albumsData) {
                // Create a map for quick lookup
                const albumMap = new Map(albumsData.map((album: any) => [album.id, album]));
                
                // Map to the format expected by FavoriteAlbumsSelector, preserving the order from userAlbumsData
                initialFavorites = userAlbumsData
                    .map(ua => {
                        const album = albumMap.get(ua.album_id);
                        if (!album) return null;
                        
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
                        
                        return {
                            id: album.id,
                            spotify_id: album.spotify_id,
                            name: album.title,
                            artist: artistName,
                            imageUrl: album.cover_image_url || '/images/album-covers/test-album-cover.png'
                        };
                    })
                    .filter(Boolean) as any[];
            }
        }
    } catch (error) {
        console.error('Error fetching favorite albums for edit page:', error);
    }

    const initialData = {
        username: profileData?.username || '',
        display_name: profileData?.display_name || null,
        bio: profileData?.bio || null,
        email: user.email || '',
        userId: user.id,
        avatar_url: profileData?.avatar_url || null,
        initialFavorites
    };

    return (
        <div className={`
            w-full max-w-[1200px] h-fit
            mx-auto py-4 px-4
            pb-24 lg:pb-32
            lg:w-[1200px] lg:px-0
        `}>
            <NavBar 
                session={user ? true : false} 
                initialUsername={profileData?.username || null}
                initialAvatarUrl={profileData?.avatar_url || null}
                initialUserId={user?.id || null}
            />
            <EditProfileForm initialData={initialData} />
        </div>
    );
}

