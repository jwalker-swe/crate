'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import FavoriteAlbumsSelector from './FavoriteAlbumsSelector';

type Album = {
    id: string;
    spotify_id: string;
    name: string;
    artist: string;
    imageUrl: string;
}

type EditProfileFormProps = {
    initialData: {
        username: string;
        display_name: string | null;
        bio: string | null;
        email: string;
        userId: string;
        initialFavorites?: Album[];
    };
}

export default function EditProfileForm({ initialData }: EditProfileFormProps) {
    const supabase = createClient();
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        username: initialData.username || '',
        display_name: initialData.display_name || '',
        bio: initialData.bio || '',
        email: initialData.email || ''
    });
    
    const [favoriteAlbums, setFavoriteAlbums] = useState<Album[]>(initialData.initialFavorites || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Function to save favorite albums to database
    const saveFavoriteAlbums = async (userId: string, albums: Album[]) => {
        console.log('Saving favorite albums:', { userId, albumsCount: albums.length, albums });
        try {
            // First, get all current favorite albums for this user
            const { data: currentFavorites } = await supabase
                .from('user_albums')
                .select(`
                    album_id,
                    albums (
                        spotify_id
                    )
                `)
                .eq('user_id', userId)
                .eq('is_favorite', true);

            const currentSpotifyIds = new Set(
                currentFavorites?.map((item: any) => {
                    const album = Array.isArray(item.albums) ? item.albums[0] : item.albums;
                    return album?.spotify_id;
                }).filter(Boolean) || []
            );

            // Get the spotify_ids of albums we want to keep as favorites
            const newSpotifyIds = new Set(albums.map(album => album.spotify_id));

            // Remove favorites that are no longer in the list
            const toRemove = Array.from(currentSpotifyIds).filter(id => !newSpotifyIds.has(id));
            if (toRemove.length > 0) {
                const { data: albumsToUpdate } = await supabase
                    .from('albums')
                    .select('id')
                    .in('spotify_id', toRemove);

                if (albumsToUpdate && albumsToUpdate.length > 0) {
                    const albumIdsToUpdate = albumsToUpdate.map(a => a.id);
                    await supabase
                        .from('user_albums')
                        .update({ is_favorite: false })
                        .eq('user_id', userId)
                        .in('album_id', albumIdsToUpdate);
                }
            }

            // To preserve order, we need to delete and recreate favorites in the new order
            // First, mark all existing favorites as not favorite (we'll recreate them in order)
            const existingSpotifyIds = Array.from(newSpotifyIds);
            if (existingSpotifyIds.length > 0) {
                const { data: existingAlbums } = await supabase
                    .from('albums')
                    .select('id')
                    .in('spotify_id', existingSpotifyIds);

                if (existingAlbums && existingAlbums.length > 0) {
                    const existingAlbumIds = existingAlbums.map(a => a.id);
                    // Mark as not favorite temporarily so we can recreate in order
                    await supabase
                        .from('user_albums')
                        .update({ is_favorite: false })
                        .eq('user_id', userId)
                        .in('album_id', existingAlbumIds);
                }
            }

            // Now add favorites in the correct order (order matters for created_at timestamps)
            // Process albums sequentially with a small delay to ensure proper ordering
            for (let i = 0; i < albums.length; i++) {
                const album = albums[i];
                // Validate album data
                if (!album.spotify_id || !album.name || !album.artist) {
                    console.error('Invalid album data:', album);
                    continue;
                }

                // Check if album exists in database
                let albumId: string;
                const { data: existingAlbum, error: checkError } = await supabase
                    .from('albums')
                    .select('id')
                    .eq('spotify_id', album.spotify_id)
                    .maybeSingle();

                if (checkError && checkError.code !== 'PGRST116') {
                    console.error('Error checking for existing album:', {
                        error: checkError,
                        spotify_id: album.spotify_id
                    });
                    continue;
                }

                if (existingAlbum) {
                    albumId = existingAlbum.id;
                } else {
                    // Fetch full album data from Spotify via API route
                    let spotifyAlbumData = null;
                    try {
                        const response = await fetch(`/api/get-album?id=${encodeURIComponent(album.spotify_id)}`);
                        if (response.ok) {
                            spotifyAlbumData = await response.json();
                        }
                    } catch (error) {
                        console.error('Error fetching album data from Spotify:', error);
                    }

                    // Prepare album data for insertion
                    let albumData;
                    
                    if (spotifyAlbumData) {
                        // Use full data from Spotify
                        albumData = {
                            spotify_id: album.spotify_id.trim(),
                            title: spotifyAlbumData.name || album.name.trim(),
                            release_date: spotifyAlbumData.release_date || null,
                            cover_image_url: spotifyAlbumData.images?.[0]?.url || album.imageUrl?.trim() || null,
                            artists: spotifyAlbumData.artists || [],
                            tracks: spotifyAlbumData.tracks || null,
                            total_tracks: spotifyAlbumData.total_tracks || null
                        };
                    } else {
                        // Fallback to basic data if Spotify fetch failed
                        // artists should be an array - convert single artist string to array format
                        const artistsArray = album.artist && typeof album.artist === 'string'
                            ? [{ name: album.artist.trim() }]
                            : Array.isArray(album.artist)
                            ? album.artist
                            : [{ name: 'Unknown Artist' }];
                        
                        albumData = {
                            spotify_id: album.spotify_id.trim(),
                            title: album.name.trim(),
                            artists: artistsArray,
                            cover_image_url: album.imageUrl ? album.imageUrl.trim() : null
                        };
                    }

                    // Create new album in database
                    const { data: newAlbum, error: albumError } = await supabase
                        .from('albums')
                        .insert(albumData)
                        .select('id')
                        .single();

                    if (albumError) {
                        console.error('Error creating album:', {
                            message: albumError.message,
                            code: albumError.code,
                            details: albumError.details,
                            hint: albumError.hint,
                            albumData: albumData
                        });
                        continue; // Skip this album if it fails
                    }

                    if (!newAlbum || !newAlbum.id) {
                        console.error('Album created but no ID returned', { newAlbum, albumData });
                        continue;
                    }

                    albumId = newAlbum.id;
                }

                // Check if user_album relationship exists (it might have been marked as not favorite above)
                const { data: existingUserAlbum, error: userAlbumCheckError } = await supabase
                    .from('user_albums')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('album_id', albumId)
                    .maybeSingle();

                if (userAlbumCheckError && userAlbumCheckError.code !== 'PGRST116') {
                    console.error('Error checking for existing user_album:', userAlbumCheckError);
                    continue;
                }

                if (!existingUserAlbum) {
                    // Create new user_album relationship (this will have a new created_at timestamp)
                    const { error: insertError } = await supabase
                        .from('user_albums')
                        .insert({
                            user_id: userId,
                            album_id: albumId,
                            is_favorite: true
                        });

                    if (insertError) {
                        console.error('Error creating user_album relationship:', {
                            error: insertError,
                            userId,
                            albumId
                        });
                        continue;
                    }
                } else {
                    // Recreate the relationship to get a new created_at timestamp for proper ordering
                    // First delete the old one
                    await supabase
                        .from('user_albums')
                        .delete()
                        .eq('id', existingUserAlbum.id);
                    
                    // Then create a new one (this ensures proper ordering)
                    const { error: insertError } = await supabase
                        .from('user_albums')
                        .insert({
                            user_id: userId,
                            album_id: albumId,
                            is_favorite: true
                        });

                    if (insertError) {
                        console.error('Error recreating user_album relationship:', {
                            error: insertError,
                            userId,
                            albumId
                        });
                        continue;
                    }
                }
                
                // Small delay to ensure created_at timestamps are in order
                if (i < albums.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }
        } catch (err) {
            console.error('Error saving favorite albums:', err);
            // Don't throw - allow profile update to succeed even if favorites fail
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                setError('You must be logged in to edit your profile');
                setLoading(false);
                return;
            }

            // Update users table
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    username: formData.username,
                    display_name: formData.display_name || null,
                    bio: formData.bio || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error updating profile:', updateError);
                setError(updateError.message || 'Failed to update profile');
                setLoading(false);
                return;
            }

            // Update email if it changed
            if (formData.email !== initialData.email) {
                const { error: emailError } = await supabase.auth.updateUser({
                    email: formData.email
                });

                if (emailError) {
                    console.error('Error updating email:', emailError);
                    setError(emailError.message || 'Failed to update email');
                    setLoading(false);
                    return;
                }
            }

            // Save favorite albums to database
            try {
                await saveFavoriteAlbums(user.id, favoriteAlbums);
            } catch (favError) {
                console.error('Error saving favorite albums:', favError);
                // Don't block profile update if favorites fail
            }

            setSuccess(true);
            // Redirect to profile page after a short delay
            setTimeout(() => {
                router.push(`/profile/${formData.username}`);
            }, 1500);
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || 'An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className={`
            w-full max-w-[896px]
            mx-auto
            mt-8
            px-4
            lg:px-0
        `}>
            <h1 className={`
                text-3xl font-bold text-primaryText
                mb-8
            `}>
                Edit Profile
            </h1>
            
            <form onSubmit={handleSubmit} className={`
                w-full
                flex flex-col gap-6
            `}>
                {/* Username Field */}
                <div className={`
                    flex flex-col gap-2
                `}>
                    <label htmlFor="username" className={`
                        text-sm font-medium text-primaryText
                    `}>
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                        className={`
                            w-full
                            px-4 py-2
                            rounded-lg
                            bg-secondaryBackground
                            text-primaryText
                            border border-primaryBorder
                            focus:outline-none
                            focus:ring-2 focus:ring-accentText
                        `}
                    />
                </div>

                {/* Display Name Field */}
                <div className={`
                    flex flex-col gap-2
                `}>
                    <label htmlFor="display_name" className={`
                        text-sm font-medium text-primaryText
                    `}>
                        Display Name
                    </label>
                    <input
                        type="text"
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        className={`
                            w-full
                            px-4 py-2
                            rounded-lg
                            bg-secondaryBackground
                            text-primaryText
                            border border-primaryBorder
                            focus:outline-none
                            focus:ring-2 focus:ring-accentText
                        `}
                    />
                </div>

                {/* Email Field */}
                <div className={`
                    flex flex-col gap-2
                `}>
                    <label htmlFor="email" className={`
                        text-sm font-medium text-primaryText
                    `}>
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className={`
                            w-full
                            px-4 py-2
                            rounded-lg
                            bg-secondaryBackground
                            text-primaryText
                            border border-primaryBorder
                            focus:outline-none
                            focus:ring-2 focus:ring-accentText
                        `}
                    />
                </div>

                {/* Bio Field */}
                <div className={`
                    flex flex-col gap-2
                `}>
                    <div className={`
                        flex justify-between items-center
                    `}>
                        <label htmlFor="bio" className={`
                            text-sm font-medium text-primaryText
                        `}>
                            Bio
                        </label>
                        <span className={`
                            text-xs text-secondaryText
                            ${formData.bio.length > 200 ? 'text-red-400' : ''}
                        `}>
                            {formData.bio.length}/200
                        </span>
                    </div>
                    <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Count newlines in the current value
                            const newlineCount = (value.match(/\n/g) || []).length;
                            
                            // Limit to 200 characters total and maximum 1 newline (2 lines total)
                            if (value.length <= 200 && newlineCount <= 1) {
                                setFormData({ ...formData, bio: value });
                            }
                        }}
                        onKeyDown={(e) => {
                            // Prevent Enter if we're at the limit or already have 1 newline
                            const newlineCount = (formData.bio.match(/\n/g) || []).length;
                            if (e.key === 'Enter' && (formData.bio.length >= 200 || newlineCount >= 1)) {
                                e.preventDefault();
                            }
                        }}
                        maxLength={200}
                        rows={4}
                        className={`
                            w-full
                            px-4 py-2
                            rounded-lg
                            bg-secondaryBackground
                            text-primaryText
                            border border-primaryBorder
                            focus:outline-none
                            focus:ring-2 focus:ring-accentText
                            resize-none
                        `}
                    />
                    <p className={`
                        text-xs text-secondaryText
                    `}>
                        Maximum 200 characters and 2 lines
                    </p>
                </div>

                {/* Favorite Albums Section */}
                <div className={`
                    flex flex-col gap-2
                    pt-4
                    border-t border-primaryBorder
                `}>
                    <FavoriteAlbumsSelector
                        initialFavorites={initialData.initialFavorites || []}
                        onFavoritesChange={setFavoriteAlbums}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className={`
                        px-4 py-2
                        rounded-lg
                        bg-red-500/20
                        text-red-400
                        text-sm
                    `}>
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className={`
                        px-4 py-2
                        rounded-lg
                        bg-green-500/20
                        text-green-400
                        text-sm
                    `}>
                        Profile updated successfully! Redirecting...
                    </div>
                )}

                {/* Submit Button */}
                <div className={`
                    flex justify-end gap-4
                    mt-4
                `}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className={`
                            px-6 py-2
                            rounded-lg
                            text-primaryText
                            bg-secondaryBackground
                            hover:bg-primaryBackground
                            transition-colors
                        `}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`
                            px-6 py-2
                            rounded-lg
                            text-primaryText
                            bg-accentText
                            hover:bg-primaryButtonHover
                            hover:text-primaryTextHover
                            transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

