'use client'

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import FavoriteAlbumsSelector from './FavoriteAlbumsSelector';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { XMarkIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '@heroicons/react/24/outline';
import { validateUsername, sanitizeUsernameInput } from '@/lib/validation/usernameValidation';
import checkUsernameAvailabilityClient from '@/lib/supabase/checkUsernameAvailabilityClient';

type Album = {
    id?: string; // Optional - only present if already in database
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
        avatar_url: string | null;
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
    
    // Profile picture states
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData.avatar_url || null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [removedAvatar, setRemovedAvatar] = useState(false);
    
    // Cropping modal states
    const [showCropModal, setShowCropModal] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number; displayWidth: number; displayHeight: number } | null>(null);

    // Image processing function with crop data
    const processImage = (imageSrc: string, zoom: number, position: { x: number; y: number }, containerSize: number = 500): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                // Set canvas size to 400x400
                const outputSize = 400;
                canvas.width = outputSize;
                canvas.height = outputSize;

                // Calculate how the image is displayed in the container
                const imgAspect = img.width / img.height;
                const containerAspect = 1; // Square container
                
                let displayWidth: number;
                let displayHeight: number;
                
                if (imgAspect > containerAspect) {
                    // Image is wider - fit to container height
                    displayHeight = containerSize;
                    displayWidth = displayHeight * imgAspect;
                } else {
                    // Image is taller - fit to container width
                    displayWidth = containerSize;
                    displayHeight = displayWidth / imgAspect;
                }
                
                // Apply zoom to displayed dimensions
                const zoomedDisplayWidth = displayWidth * zoom;
                const zoomedDisplayHeight = displayHeight * zoom;
                
                // Calculate scale from displayed size to original image size
                const scaleToOriginal = img.width / zoomedDisplayWidth;
                
                // The crop area is a square in the center of the container
                // Position offset is in pixels relative to container center
                // Convert to original image coordinates
                const cropSizeInOriginal = containerSize * scaleToOriginal;
                const offsetXInOriginal = -position.x * scaleToOriginal;
                const offsetYInOriginal = -position.y * scaleToOriginal;
                
                // Calculate source crop area (centered on image, then offset)
                const imgCenterX = img.width / 2;
                const imgCenterY = img.height / 2;
                
                const sourceX = imgCenterX - (cropSizeInOriginal / 2) + offsetXInOriginal;
                const sourceY = imgCenterY - (cropSizeInOriginal / 2) + offsetYInOriginal;
                
                // Clamp to image bounds
                const clampedX = Math.max(0, Math.min(sourceX, img.width - cropSizeInOriginal));
                const clampedY = Math.max(0, Math.min(sourceY, img.height - cropSizeInOriginal));
                const clampedSize = Math.min(cropSizeInOriginal, img.width - clampedX, img.height - clampedY);

                // Draw cropped image
                ctx.drawImage(
                    img,
                    clampedX, clampedY, clampedSize, clampedSize,
                    0, 0, outputSize, outputSize
                );

                // Convert to WebP blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to process image'));
                        }
                    },
                    'image/webp',
                    0.9 // Quality (0.9 = 90%)
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = imageSrc;
        });
    };

    // Upload image to Supabase Storage
    const uploadImage = async (imageSrc: string, zoom: number, position: { x: number; y: number }, userId: string, containerSize: number = 500): Promise<string> => {
        try {
            // Process the image first with crop data
            const processedBlob = await processImage(imageSrc, zoom, position, containerSize);
            
            if (!processedBlob) {
                throw new Error('Failed to process image - no blob generated');
            }
            
            // Generate unique filename
            const timestamp = Date.now();
            const filePath = `${userId}/${timestamp}.webp`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('profile-pictures')
                .upload(filePath, processedBlob, {
                    contentType: 'image/webp',
                    upsert: false
                });

            if (error) {
                console.error('Supabase storage upload error:', {
                    message: error.message,
                    error: error
                });
                
                // Provide user-friendly error messages
                if (error.message?.includes('Bucket not found') || error.message?.includes('does not exist')) {
                    throw new Error('Storage bucket not configured. Please create a "profile-pictures" bucket in Supabase Storage.');
                } else if (error.message?.includes('new row violates row-level security')) {
                    throw new Error('Permission denied. Please check your Supabase Storage bucket policies.');
                } else {
                    throw new Error(error.message || 'Failed to upload image to storage');
                }
            }

            if (!data) {
                throw new Error('Upload succeeded but no data returned');
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(filePath);

            if (!urlData?.publicUrl) {
                throw new Error('Failed to get public URL for uploaded image');
            }

            return urlData.publicUrl;
        } catch (err: any) {
            console.error('Error uploading image:', {
                message: err?.message,
                error: err,
                stack: err?.stack
            });
            throw err;
        }
    };

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageError(null);

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setImageError('Please select a JPG, PNG, or WebP image');
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            setImageError('Image must be less than 2MB');
            return;
        }

        // Store file for upload
        setSelectedFile(file);
        setRemovedAvatar(false);

        // Create preview and open crop modal
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageSrc = e.target?.result as string;
            setCropImageSrc(imageSrc);
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            setImageDimensions(null); // Will be set when image loads
            setShowCropModal(true);
        };
        reader.readAsDataURL(file);
    };
    
    // Calculate position bounds based on image size and zoom
    const calculatePositionBounds = () => {
        if (!imageDimensions || !imageContainerRef.current) {
            return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
        }

        const container = imageContainerRef.current;
        const containerSize = container.clientWidth;
        
        // Calculate displayed image size after zoom
        const zoomedWidth = imageDimensions.displayWidth * zoom;
        const zoomedHeight = imageDimensions.displayHeight * zoom;
        
        // Calculate maximum allowed offset
        // The image center can move, but the crop area (container) must always show image content
        const maxOffsetX = Math.max(0, (zoomedWidth - containerSize) / 2);
        const maxOffsetY = Math.max(0, (zoomedHeight - containerSize) / 2);
        
        return {
            minX: -maxOffsetX,
            maxX: maxOffsetX,
            minY: -maxOffsetY,
            maxY: maxOffsetY
        };
    };

    // Handle mouse down for dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };
    
    // Handle mouse move for dragging
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Constrain position to bounds
        const bounds = calculatePositionBounds();
        const constrainedX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
        const constrainedY = Math.max(bounds.minY, Math.min(bounds.maxY, newY));
        
        setPosition({
            x: constrainedX,
            y: constrainedY
        });
    };
    
    // Handle mouse up
    const handleMouseUp = () => {
        setIsDragging(false);
    };
    
    // Handle zoom change and constrain position
    const handleZoomChange = (newZoom: number) => {
        setZoom(newZoom);
        // Recalculate position bounds after zoom changes and constrain position
        setTimeout(() => {
            const bounds = calculatePositionBounds();
            setPosition(prev => ({
                x: Math.max(bounds.minX, Math.min(bounds.maxX, prev.x)),
                y: Math.max(bounds.minY, Math.min(bounds.maxY, prev.y))
            }));
        }, 0);
    };
    
    // Handle crop confirmation
    const handleCropConfirm = async () => {
        if (!cropImageSrc) return;
        
        // Create preview of cropped image
        try {
            const containerSize = imageContainerRef.current?.clientWidth || 500;
            const blob = await processImage(cropImageSrc, zoom, position, containerSize);
            const previewUrl = URL.createObjectURL(blob);
            setPreviewUrl(previewUrl);
            setShowCropModal(false);
        } catch (err: any) {
            setImageError(err.message || 'Failed to process image');
        }
    };
    
    // Handle crop cancel
    const handleCropCancel = () => {
        setShowCropModal(false);
        setCropImageSrc(null);
        setPreviewUrl(null);
        setSelectedFile(null);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle remove avatar
    const handleRemoveAvatar = () => {
        setAvatarUrl(null);
        setPreviewUrl(null);
        setSelectedFile(null);
        setRemovedAvatar(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Function to save favorite albums to database
    const saveFavoriteAlbums = async (userId: string, albums: Album[]) => {
        console.log('Saving favorite albums:', { userId, albumsCount: albums.length, albums });
        try {
            // Remove duplicates from the input array (by spotify_id)
            const uniqueAlbums = albums.filter((album, index, self) => 
                index === self.findIndex(a => a.spotify_id === album.spotify_id)
            );

            if (uniqueAlbums.length !== albums.length) {
                console.log('Removed duplicates from favorites list');
            }

            // First, get all current favorite albums for this user to check for duplicates
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

            // Remove duplicates from database - if there are multiple entries for the same album, keep only one
            if (currentFavorites && currentFavorites.length > 0) {
                // Group favorites by album_id to find duplicates
                const albumIdSet = new Set<string>();
                const duplicateAlbumIds: string[] = [];
                
                for (const fav of currentFavorites) {
                    if (albumIdSet.has(fav.album_id)) {
                        // This album_id appears multiple times
                        if (!duplicateAlbumIds.includes(fav.album_id)) {
                            duplicateAlbumIds.push(fav.album_id);
                        }
                    } else {
                        albumIdSet.add(fav.album_id);
                    }
                }

                // For each duplicate album_id, get all entries and keep only one (most recent)
                for (const albumId of duplicateAlbumIds) {
                    const { data: duplicateEntries } = await supabase
                        .from('user_albums')
                        .select('id, created_at')
                        .eq('user_id', userId)
                        .eq('album_id', albumId)
                        .eq('is_favorite', true)
                        .order('created_at', { ascending: false });

                    if (duplicateEntries && duplicateEntries.length > 1) {
                        // Keep the first (most recent) and remove the rest
                        const idsToDelete = duplicateEntries.slice(1).map((e: any) => e.id);
                        if (idsToDelete.length > 0) {
                            await supabase
                                .from('user_albums')
                                .delete()
                                .in('id', idsToDelete);
                        }
                    }
                }
            }

            // Get the spotify_ids of albums we want to keep as favorites
            const newSpotifyIds = new Set(uniqueAlbums.map(album => album.spotify_id));

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

            // Process albums to add/update as favorites
            // IMPORTANT: Only update is_favorite on existing user_albums entries
            // Do NOT create new entries - favorites should not log albums
            for (let i = 0; i < uniqueAlbums.length; i++) {
                const album = uniqueAlbums[i];
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
                    // Album doesn't exist in database - we need to create it
                    // But we still won't create a user_albums entry for favorites
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

                // Check if user_album relationship exists
                // IMPORTANT: Only update existing entries - do NOT create new ones for favorites
                const { data: existingUserAlbum, error: userAlbumCheckError } = await supabase
                    .from('user_albums')
                    .select('id, rating, review_text, liked')
                    .eq('user_id', userId)
                    .eq('album_id', albumId)
                    .maybeSingle();

                if (userAlbumCheckError && userAlbumCheckError.code !== 'PGRST116') {
                    console.error('Error checking for existing user_album:', userAlbumCheckError);
                    continue;
                }

                if (existingUserAlbum) {
                    // Entry exists - just update is_favorite to true
                    // This won't create a new log entry since the entry already exists
                    const { error: updateError } = await supabase
                        .from('user_albums')
                        .update({ is_favorite: true })
                        .eq('id', existingUserAlbum.id);

                    if (updateError) {
                        console.error('Error updating favorite status:', {
                            error: updateError,
                            userId,
                            albumId
                        });
                        continue;
                    }
                } else {
                    // No user_albums entry exists - do NOT create one
                    // Favorites should not log albums - only rating, review, or like should create entries
                    console.log('Skipping favorite for album without existing user_albums entry:', album.spotify_id);
                    continue;
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
        setImageError(null);

        // Validate username
        const usernameValidation = validateUsername(formData.username);
        if (!usernameValidation.valid) {
            setError(usernameValidation.error || 'Invalid username');
            setLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                setError('You must be logged in to edit your profile');
                setLoading(false);
                return;
            }

            // Check if username is available (only if it changed)
            if (formData.username !== initialData.username) {
                const isAvailable = await checkUsernameAvailabilityClient(formData.username, user.id);
                if (!isAvailable) {
                    setError('This username is already taken. Please choose another one.');
                    setLoading(false);
                    return;
                }
            }

            // Handle profile picture upload/removal
            let newAvatarUrl: string | null = avatarUrl;
            
            if (removedAvatar) {
                // User wants to remove avatar
                if (initialData.avatar_url) {
                    // Extract file path from URL to delete old file
                    try {
                        const urlParts = initialData.avatar_url.split('/');
                        const filePath = urlParts.slice(-2).join('/'); // Get {user_id}/{filename}
                        await supabase.storage
                            .from('profile-pictures')
                            .remove([filePath]);
                    } catch (err) {
                        console.error('Error deleting old avatar:', err);
                        // Continue even if deletion fails
                    }
                }
                newAvatarUrl = null;
            } else if (selectedFile && cropImageSrc) {
                // User selected a new image and cropped it
                setUploading(true);
                try {
                    // Delete old avatar if it exists
                    if (initialData.avatar_url) {
                        try {
                            const urlParts = initialData.avatar_url.split('/');
                            const filePath = urlParts.slice(-2).join('/');
                            await supabase.storage
                                .from('profile-pictures')
                                .remove([filePath]);
                        } catch (err) {
                            console.error('Error deleting old avatar:', err);
                            // Continue even if deletion fails
                        }
                    }

                    // Upload new image with crop data
                    const containerSize = imageContainerRef.current?.clientWidth || 500;
                    newAvatarUrl = await uploadImage(cropImageSrc, zoom, position, user.id, containerSize);
                    setAvatarUrl(newAvatarUrl);
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    setCropImageSrc(null);
                } catch (err: any) {
                    setImageError(err.message || 'Failed to upload image');
                    setUploading(false);
                    setLoading(false);
                    return;
                }
                setUploading(false);
            }

            // Update users table
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    username: formData.username,
                    display_name: formData.display_name || null,
                    bio: formData.bio || null,
                    avatar_url: newAvatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error updating profile:', updateError);
                // Check if it's a unique constraint violation
                if (updateError.code === '23505' || updateError.message?.includes('unique') || updateError.message?.includes('duplicate')) {
                    setError('This username is already taken. Please choose another one.');
                } else {
                    setError(updateError.message || 'Failed to update profile');
                }
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
                    // Check if error is about email already being registered
                    const errorMessage = emailError.message?.toLowerCase() || '';
                    if (
                        errorMessage.includes('already registered') ||
                        errorMessage.includes('email already') ||
                        errorMessage.includes('user already exists') ||
                        errorMessage.includes('email address is already')
                    ) {
                        setError('This email is already registered. Please use a different email address.');
                    } else {
                        setError(emailError.message || 'Failed to update email');
                    }
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
                {/* Profile Picture Section */}
                <div className={`
                    flex flex-col gap-4
                    items-center
                    pb-6
                    border-b border-primaryBorder
                `}>
                    <label className={`
                        text-sm font-medium text-primaryText
                    `}>
                        Profile Picture
                    </label>
                    <div className={`
                        flex flex-col items-center gap-4
                    `}>
                        {/* Avatar Preview */}
                        <div className={`
                            w-32 h-32
                            rounded-full
                            bg-secondaryBackground
                            flex items-center justify-center
                            overflow-hidden
                            flex-shrink-0
                        `}>
                            {previewUrl ? (
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                />
                            ) : avatarUrl && !removedAvatar ? (
                                <img 
                                    src={avatarUrl} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserCircleIcon className="w-full h-full text-accentText" />
                            )}
                        </div>
                        
                        {/* File Input */}
                        <div className={`
                            flex flex-col items-center gap-2
                        `}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="avatar-upload"
                                disabled={uploading}
                            />
                            <label
                                htmlFor="avatar-upload"
                                className={`
                                    px-4 py-2
                                    rounded-lg
                                    text-primaryText
                                    bg-secondaryBackground
                                    hover:bg-primaryBackground
                                    cursor-pointer
                                    transition-colors
                                    ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {uploading ? 'Processing...' : 'Choose Image'}
                            </label>
                            <p className={`
                                text-xs text-secondaryText
                            `}>
                                JPG, PNG, or WebP. Max 2MB.
                            </p>
                        </div>

                        {/* Remove Button */}
                        {(avatarUrl && !removedAvatar) && (
                            <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                className={`
                                    px-4 py-2
                                    rounded-lg
                                    text-red-400
                                    bg-red-500/20
                                    hover:bg-red-500/30
                                    transition-colors
                                    text-sm
                                `}
                            >
                                Remove Picture
                            </button>
                        )}

                        {/* Image Error */}
                        {imageError && (
                            <p className={`
                                text-sm text-red-400
                            `}>
                                {imageError}
                            </p>
                        )}
                    </div>
                </div>

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
                        onChange={(e) => {
                            const sanitized = sanitizeUsernameInput(e.target.value);
                            setFormData({ ...formData, username: sanitized });
                        }}
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
                        disabled={loading || uploading}
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
                        {loading || uploading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
            
            {/* Crop Modal */}
            {showCropModal && cropImageSrc && (
                <div 
                    className={`
                        fixed
                        inset-0
                        bg-black/70
                        backdrop-blur-sm
                        z-50
                        flex items-center justify-center
                        p-4
                    `}
                    onClick={handleCropCancel}
                >
                    <div 
                        className={`
                            w-full max-w-2xl
                            bg-secondaryBackground
                            rounded-lg
                            p-6
                            shadow-lg
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`
                            flex justify-between items-center
                            mb-4
                        `}>
                            <h2 className={`
                                text-xl font-bold text-primaryText
                            `}>
                                Crop Profile Picture
                            </h2>
                            <button
                                onClick={handleCropCancel}
                                className={`
                                    p-1
                                    rounded-lg
                                    hover:bg-primaryBackground
                                    transition-colors
                                    cursor-pointer
                                `}
                            >
                                <XMarkIcon className={`
                                    w-6 h-6
                                    text-secondaryText
                                    hover:text-primaryText
                                `} />
                            </button>
                        </div>
                        
                        <div className={`
                            flex flex-col gap-4
                        `}>
                            {/* Crop Area */}
                            <div 
                                ref={imageContainerRef}
                                className={`
                                    relative
                                    w-full
                                    bg-primaryBackground
                                    rounded-lg
                                    overflow-hidden
                                    flex items-center justify-center
                                `}
                                style={{
                                    aspectRatio: '1 / 1',
                                    maxHeight: '500px',
                                    maxWidth: '500px',
                                    margin: '0 auto'
                                }}
                            >
                                <div
                                    className={`
                                        w-full h-full
                                        relative
                                        cursor-move
                                    `}
                                    style={{
                                        aspectRatio: '1 / 1'
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                >
                                    <img
                                        ref={imageRef}
                                        src={cropImageSrc}
                                        alt="Crop"
                                        className={`
                                            absolute
                                            top-1/2 left-1/2
                                            select-none
                                            pointer-events-none
                                        `}
                                        style={{
                                            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                                            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                            maxWidth: 'none',
                                            maxHeight: 'none',
                                            width: 'auto',
                                            height: 'auto',
                                            objectFit: 'contain'
                                        }}
                                        draggable={false}
                                        onLoad={(e) => {
                                            const img = e.currentTarget;
                                            const container = imageContainerRef.current;
                                            if (container) {
                                                const containerSize = Math.min(container.clientWidth, container.clientHeight);
                                                const imgAspect = img.naturalWidth / img.naturalHeight;
                                                
                                                let displayWidth: number;
                                                let displayHeight: number;
                                                
                                                if (imgAspect > 1) {
                                                    // Image is wider - fit to container height
                                                    displayHeight = containerSize;
                                                    displayWidth = displayHeight * imgAspect;
                                                    img.style.width = `${displayWidth}px`;
                                                    img.style.height = `${displayHeight}px`;
                                                } else {
                                                    // Image is taller - fit to container width
                                                    displayWidth = containerSize;
                                                    displayHeight = displayWidth / imgAspect;
                                                    img.style.width = `${displayWidth}px`;
                                                    img.style.height = `${displayHeight}px`;
                                                }
                                                
                                                // Store image dimensions for position calculations
                                                setImageDimensions({
                                                    width: img.naturalWidth,
                                                    height: img.naturalHeight,
                                                    displayWidth,
                                                    displayHeight
                                                });
                                                
                                                // Reset position when image loads
                                                setPosition({ x: 0, y: 0 });
                                            }
                                        }}
                                    />
                                    {/* Circular crop overlay - darkened area outside circle */}
                                    <div 
                                        className={`
                                            absolute
                                            inset-0
                                            pointer-events-none
                                        `}
                                        style={{
                                            background: 'rgba(0, 0, 0, 0.5)',
                                            maskImage: 'radial-gradient(circle, transparent 0%, transparent calc(50% - 2px), black calc(50% - 2px))',
                                            WebkitMaskImage: 'radial-gradient(circle, transparent 0%, transparent calc(50% + 70px), black calc(50% - 2px))'
                                        }}
                                    />
                                    {/* Circular border */}
                                    <div className={`
                                        absolute
                                        pointer-events-none
                                        rounded-full
                                        border-4 border-accentText
                                        shadow-lg
                                    `}
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '100%',
                                        height: '100%',
                                        boxSizing: 'border-box'
                                    }}
                                    />
                                </div>
                            </div>
                            
                            {/* Zoom Controls */}
                            <div className={`
                                flex flex-col items-center gap-2
                                w-full
                            `}>
                                <div className={`
                                    flex items-center justify-center gap-4
                                    w-full
                                `}>
                                    <MagnifyingGlassMinusIcon className={`
                                        w-5 h-5
                                        text-secondaryText
                                        flex-shrink-0
                                    `} />
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="3"
                                        step="0.1"
                                        value={zoom}
                                        onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                                        className={`
                                            flex-1
                                            h-2
                                            bg-secondaryBackground
                                            rounded-lg
                                            appearance-none
                                            cursor-pointer
                                            [&::-webkit-slider-thumb]:appearance-none
                                            [&::-webkit-slider-thumb]:w-4
                                            [&::-webkit-slider-thumb]:h-4
                                            [&::-webkit-slider-thumb]:rounded-full
                                            [&::-webkit-slider-thumb]:bg-accentText
                                            [&::-webkit-slider-thumb]:cursor-pointer
                                            [&::-moz-range-thumb]:w-4
                                            [&::-moz-range-thumb]:h-4
                                            [&::-moz-range-thumb]:rounded-full
                                            [&::-moz-range-thumb]:bg-accentText
                                            [&::-moz-range-thumb]:border-0
                                            [&::-moz-range-thumb]:cursor-pointer
                                        `}
                                    />
                                    <MagnifyingGlassPlusIcon className={`
                                        w-5 h-5
                                        text-secondaryText
                                        flex-shrink-0
                                    `} />
                                </div>
                                <span className={`
                                    text-sm text-secondaryText
                                `}>
                                    {Math.round(zoom * 100)}%
                                </span>
                            </div>
                            
                            {/* Instructions */}
                            <p className={`
                                text-xs text-secondaryText
                                text-center
                            `}>
                                Drag to reposition • Use slider to zoom
                            </p>
                            
                            {/* Action Buttons */}
                            <div className={`
                                flex justify-end gap-4
                                mt-2
                            `}>
                                <button
                                    type="button"
                                    onClick={handleCropCancel}
                                    className={`
                                        px-4 py-2
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
                                    type="button"
                                    onClick={handleCropConfirm}
                                    className={`
                                        px-4 py-2
                                        rounded-lg
                                        text-primaryText
                                        bg-accentText
                                        hover:bg-primaryButtonHover
                                        hover:text-primaryTextHover
                                        transition-colors
                                    `}
                                >
                                    Confirm Crop
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

