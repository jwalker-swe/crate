'use client'

import { useState, useEffect, MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import calculateAlbumRatingClient from '@/lib/supabase/calculateAlbumRatingClient'
import { XMarkIcon, StarIcon, HeartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid'

type AlbumSearchLogModalProps = {
    isOpen: boolean
    onClose: () => void
    userId: string | null
}

type SearchAlbum = {
    spotify_id: string
    name: string
    artist: string
    imageUrl: string
}

interface FormData {
    rating: number | null
    liked: boolean
    review: string | null
    addToQueue: boolean
}

export default function AlbumSearchLogModal({ isOpen, onClose, userId }: AlbumSearchLogModalProps) {
    const router = useRouter()
    const supabase = createClient()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchAlbum[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedAlbum, setSelectedAlbum] = useState<SearchAlbum | null>(null)
    const [albumDetails, setAlbumDetails] = useState<any>(null)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [hoverRating, setHoverRating] = useState<number>(0)
    const [rating, setRating] = useState<number>(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [existingLog, setExistingLog] = useState<{
        id: string;
        rating: number | null;
        review_text: string | null;
        is_favorite: boolean | null;
        liked: boolean | null;
    } | null>(null)
    const [showEditChoice, setShowEditChoice] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        rating: null,
        liked: false,
        review: null,
        addToQueue: false
    })
    const [isInQueue, setIsInQueue] = useState(false)
    const [isLoadingQueue, setIsLoadingQueue] = useState(false)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
            // Reset state when closing
            setSearchQuery('')
            setSearchResults([])
            setSelectedAlbum(null)
            setAlbumDetails(null)
            setFormData({
                rating: null,
                liked: false,
                review: null,
                addToQueue: false
            })
            setRating(0)
            setHoverRating(0)
            setIsInQueue(false)
            setMessage(null)
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Check if album is in queue and if user has logged it before when selected
    useEffect(() => {
        if (selectedAlbum && userId) {
            checkQueueStatus()
            checkExistingLog()
        }
    }, [selectedAlbum, userId])

    const checkExistingLog = async () => {
        if (!selectedAlbum || !userId) return

        try {
            // Check if album exists in database
            const { data: existingAlbum } = await supabase
                .from('albums')
                .select('id')
                .eq('spotify_id', selectedAlbum.spotify_id)
                .maybeSingle()

            if (existingAlbum) {
                // Check if user has logged this album before
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: existingEntry } = await supabase
                        .from('user_albums')
                        .select('id, rating, review_text, is_favorite, liked, created_at')
                        .eq('user_id', user.id)
                        .eq('album_id', existingAlbum.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle()

                    if (existingEntry) {
                        setExistingLog({
                            id: existingEntry.id,
                            rating: existingEntry.rating,
                            review_text: existingEntry.review_text,
                            is_favorite: existingEntry.is_favorite,
                            liked: existingEntry.liked
                        })
                        // Show choice dialog when existing log is found
                        setShowEditChoice(true)
                    } else {
                        setExistingLog(null)
                        setShowEditChoice(false)
                    }
                }
            } else {
                setExistingLog(null)
                setShowEditChoice(false)
            }
        } catch (error) {
            console.error('Error checking for existing log:', error)
        }
    }

    const searchAlbums = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        try {
            const response = await fetch(`/api/search-albums?q=${encodeURIComponent(query)}`)
            if (!response.ok) throw new Error('Search failed')
            
            const data = await response.json()
            if (data.albums && data.albums.items) {
                const albums = data.albums.items
                    .filter((item: any) => item.album_type === 'album')
                    .slice(0, 10)
                    .map((item: any) => ({
                        spotify_id: item.id,
                        name: item.name,
                        artist: item.artists[0]?.name || 'Unknown Artist',
                        imageUrl: item.images[0]?.url || '/images/album-covers/test-album-cover.png'
                    }))
                setSearchResults(albums)
            }
        } catch (error) {
            console.error('Error searching albums:', error)
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value
        setSearchQuery(query)
        if (query.trim()) {
            searchAlbums(query)
        } else {
            setSearchResults([])
        }
    }

    const handleSelectAlbum = async (album: SearchAlbum) => {
        setSelectedAlbum(album)
        setIsLoadingDetails(true)
        try {
            const response = await fetch(`/api/get-album?id=${encodeURIComponent(album.spotify_id)}`)
            if (!response.ok) throw new Error('Failed to fetch album details')
            const details = await response.json()
            setAlbumDetails(details)
        } catch (error) {
            console.error('Error fetching album details:', error)
            alert('Error loading album details. Please try again.')
        } finally {
            setIsLoadingDetails(false)
        }
    }

    const checkQueueStatus = async () => {
        if (!selectedAlbum || !userId) return

        setIsLoadingQueue(true)
        try {
            // Check if album exists in database
            const { data: existingAlbum } = await supabase
                .from('albums')
                .select('id')
                .eq('spotify_id', selectedAlbum.spotify_id)
                .maybeSingle()

            if (existingAlbum) {
                // Check if in queue
                const { data: queueEntry } = await supabase
                    .from('queue')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('album_id', existingAlbum.id)
                    .maybeSingle()

                setIsInQueue(!!queueEntry)
            } else {
                setIsInQueue(false)
            }
        } catch (error) {
            console.error('Error checking queue status:', error)
        } finally {
            setIsLoadingQueue(false)
        }
    }

    const handleToggleQueue = async () => {
        if (!userId || isLoadingQueue || !selectedAlbum) return

        setIsLoadingQueue(true)

        try {
            // Ensure album exists in database
            let dbAlbumId: string | null = null

            const { data: existingAlbum } = await supabase
                .from('albums')
                .select('id')
                .eq('spotify_id', selectedAlbum.spotify_id)
                .maybeSingle()

            if (existingAlbum) {
                dbAlbumId = existingAlbum.id
            } else if (albumDetails) {
                // Create album in database
                const { data: newAlbum, error: insertError } = await supabase
                    .from('albums')
                    .insert([
                        {
                            spotify_id: selectedAlbum.spotify_id,
                            title: albumDetails.name,
                            artists: albumDetails.artists,
                            release_date: albumDetails.release_date,
                            cover_image_url: albumDetails.images[0]?.url || selectedAlbum.imageUrl,
                            total_tracks: albumDetails.total_tracks,
                            tracks: albumDetails.tracks
                        }
                    ])
                    .select('id')
                    .single()

                if (insertError) {
                    console.error('Error creating album:', insertError)
                    alert('Error: Could not add album to database. Please try again.')
                    setIsLoadingQueue(false)
                    return
                }

                dbAlbumId = newAlbum.id
            }

            if (!dbAlbumId) {
                console.error('Could not get or create album ID')
                alert('Error: Could not process album. Please try again.')
                setIsLoadingQueue(false)
                return
            }

            // Check if user_albums entry exists (to prevent adding to queue if already logged)
            const { data: existingUserAlbum } = await supabase
                .from('user_albums')
                .select('id, rating, review_text, is_favorite, liked')
                .eq('user_id', userId)
                .eq('album_id', dbAlbumId)
                .maybeSingle()

            if (existingUserAlbum) {
                const isLogged = existingUserAlbum.rating !== null || 
                               existingUserAlbum.review_text !== null || 
                               existingUserAlbum.is_favorite === true || 
                               existingUserAlbum.liked === true

                if (isLogged) {
                    alert('This album is already logged. You can\'t add it to queue.')
                    setIsLoadingQueue(false)
                    return
                }
            }

            // Check if album is already in queue
            const { data: existingQueueEntry } = await supabase
                .from('queue')
                .select('id')
                .eq('user_id', userId)
                .eq('album_id', dbAlbumId)
                .maybeSingle()

            if (existingQueueEntry) {
                // Remove from queue
                const { error: deleteError } = await supabase
                    .from('queue')
                    .delete()
                    .eq('id', existingQueueEntry.id)

                if (deleteError) {
                    console.error('Error removing from queue:', deleteError)
                    alert('Error: Could not remove from queue. Please try again.')
                } else {
                    setIsInQueue(false)
                    setFormData(prev => ({ ...prev, addToQueue: false }))
                }
            } else {
                // Add to queue
                const { error: insertError } = await supabase
                    .from('queue')
                    .insert([
                        {
                            user_id: userId,
                            album_id: dbAlbumId
                        }
                    ])

                if (insertError) {
                    console.error('Error adding to queue:', insertError)
                    alert(`Error: Could not add to queue. ${insertError.message || 'Please try again.'}`)
                } else {
                    setIsInQueue(true)
                    setFormData(prev => ({ ...prev, addToQueue: true }))
                }
            }
        } catch (err) {
            console.error('Error toggling queue:', err)
            alert('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoadingQueue(false)
        }
    }

    const getAlbum = async function() {
        if (!selectedAlbum) return null

        try {
            const { data: albumData, error: albumError } = await supabase
                .from('albums')
                .select('id')
                .eq('spotify_id', selectedAlbum.spotify_id)
                .single()
            
            if (albumError && albumError.code !== 'PGRST116') {
                console.error('Error fetching album data: ', albumError)
                return null
            }

            if (albumData) {
                return albumData.id
            } else if (albumDetails) {
                // Create album in database
                const { data: newAlbumData, error: newAlbumError } = await supabase
                    .from('albums')
                    .insert([
                        {
                            spotify_id: selectedAlbum.spotify_id,
                            title: albumDetails.name,
                            artists: albumDetails.artists,
                            release_date: albumDetails.release_date,
                            cover_image_url: albumDetails.images[0]?.url || selectedAlbum.imageUrl,
                            total_tracks: albumDetails.total_tracks,
                            tracks: albumDetails.tracks
                        }
                    ])
                    .select('id')
                    .single()
                
                if (newAlbumError) {
                    console.error('Error inserting album data: ', newAlbumError)
                    return null
                }

                return newAlbumData.id
            }
        } catch (err) {
            console.error('An unexpected error occurred while fetching album data: ', err)
        }
        return null
    }

    const handleSubmit = async function(e: React.FormEvent) {
        e.preventDefault()
        if (!userId || !selectedAlbum) return

        setIsSubmitting(true)

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError) {
                console.error('An error occurred while fetching user data: ', userError)
                setIsSubmitting(false)
                return
            }

            const albumId = await getAlbum()
            if (!albumId) {
                setMessage({ type: 'error', text: 'Error: Could not save album. Please try again.' })
                setIsSubmitting(false)
                return
            }

            if (user) {
                // Check if user recently submitted a review for this album (spam prevention only for reviews)
                // Only check if they're submitting a NEW review (not editing)
                if (!isEditMode && formData.review && formData.review.trim()) {
                    const fiveMinutesAgo = new Date();
                    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
                    const fiveMinutesAgoISO = fiveMinutesAgo.toISOString();

                    const { data: recentReview, error: checkError } = await supabase
                        .from('user_albums')
                        .select('created_at')
                        .eq('user_id', user.id)
                        .eq('album_id', albumId)
                        .not('review_text', 'is', null)
                        .gte('created_at', fiveMinutesAgoISO)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (checkError && checkError.code !== 'PGRST116') {
                        console.error('Error checking for recent review: ', checkError);
                    }

                    if (recentReview) {
                        setMessage({ type: 'error', text: 'You recently submitted a review for this album. Please wait a few minutes before submitting another review.' })
                        setIsSubmitting(false);
                        return;
                    }
                }

                let error;
                
                if (isEditMode && existingLog) {
                    // Update existing entry
                    const { error: updateError } = await supabase
                        .from('user_albums')
                        .update({
                            rating: formData.rating,
                            review_text: formData.review,
                            is_favorite: formData.liked
                        })
                        .eq('id', existingLog.id);

                    error = updateError;
                } else {
                    // Insert new entry (allows multiple ratings per user, but rating calculation uses most recent)
                    const { error: insertError } = await supabase
                        .from('user_albums')
                        .insert([
                            {
                                user_id: user.id,
                                album_id: albumId,
                                rating: formData.rating,
                                review_text: formData.review,
                                is_favorite: formData.liked
                            }
                        ]);
                    
                    error = insertError;
                }

                // Remove from queue if it was in queue
                if (albumId) {
                    const { data: queueEntry } = await supabase
                        .from('queue')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('album_id', albumId)
                        .maybeSingle()

                    if (queueEntry) {
                        await supabase
                            .from('queue')
                            .delete()
                            .eq('id', queueEntry.id)
                    }
                }

                // Update album rating using most recent rating per user
                if (!error && formData.rating !== null && albumId) {
                    // Calculate the new rating using only the most recent rating per user
                    const newRating = await calculateAlbumRatingClient(albumId);
                    
                    // Update the albums table with the calculated rating
                    if (newRating !== null) {
                        const { error: ratingError } = await supabase
                            .from('albums')
                            .update({ rating: newRating })
                            .eq('id', albumId);
                        
                        if (ratingError) {
                            console.error('Error updating album rating: ', ratingError);
                        }
                    }
                }

                if (error) {
                    console.error('Error inserting data: ', error)
                    setMessage({ type: 'error', text: 'Error saving. Please try again.' })
                    setIsSubmitting(false)
                } else {
                    const successMessage = isEditMode 
                        ? 'Album updated successfully!' 
                        : 'Album logged successfully!';
                    console.log(successMessage)
                    setMessage({ type: 'success', text: successMessage })
                    setTimeout(() => {
                        onClose()
                        router.refresh()
                    }, 500)
                }
            }
        } catch (err) {
            console.error('An unexpected error occurred while fetching user data: ', err)
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
            setIsSubmitting(false)
        }
    }

    const handleMouseMove = function(e: MouseEvent<HTMLDivElement>, starIndex: number) {
        const { left, width } = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - left
        const isHalf = x < width / 2
        const value = starIndex - (isHalf ? 0.5 : 0)
        setHoverRating(value)
    }

    const handleClick = function(e: MouseEvent<HTMLDivElement>, starIndex: number) {
        const { left, width } = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - left
        const isHalf = x < width / 2
        const value = starIndex - (isHalf ? 0.5 : 0)
        setRating(value)
        setFormData(prev => ({
            ...prev,
            rating: value
        }))
    }

    const getFillPercent = function(index: number) {
        const active = hoverRating || rating
        const diff = active - index
        if (diff >= 0) {
            return 100
        } else if (diff === -0.5) {
            return 50
        } else {
            return 0
        }
    }

    const handleLiked = function() {
        setFormData(prev => ({
            ...prev,
            liked: !prev.liked
        }))
    }

    if (!isOpen) return null

    return (
        <div 
            className={`
                fixed
                inset-0
                bg-black/50
                backdrop-blur-sm
                z-50
                flex items-center justify-center
                p-4
            `}
            onClick={onClose}
        >
            <div 
                className={`
                    w-full max-w-4xl
                    max-h-[90vh]
                    bg-secondaryBackground
                    rounded-lg
                    shadow-lg
                    overflow-y-auto
                `}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`
                    sticky top-0
                    bg-secondaryBackground
                    border-b border-primaryBorder
                    p-4
                    flex justify-between items-center
                    z-10
                `}>
                    <h2 className={`
                        text-xl font-bold text-primaryText
                    `}>
                        {selectedAlbum ? 'Log Album' : 'Search Albums'}
                    </h2>
                    <button
                        onClick={onClose}
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

                <div className="p-6">
                    {!selectedAlbum ? (
                        // Search View
                        <div>
                            <div className="relative mb-6">
                                <input 
                                    placeholder='Search for an album...' 
                                    className={`
                                        w-full
                                        pl-4 pr-12 py-3
                                        text-sm
                                        bg-primaryBackground
                                        rounded-lg
                                        focus:outline-0
                                        focus:ring-2 focus:ring-accentText
                                        text-primaryText
                                    `}
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    autoFocus
                                />
                                <MagnifyingGlassIcon className={`
                                    absolute 
                                    top-[12px] right-3
                                    w-5 h-5
                                    text-secondaryText
                                `} />
                            </div>

                            {isSearching && (
                                <div className="text-center py-8 text-secondaryText">
                                    Searching...
                                </div>
                            )}

                            {!isSearching && searchResults.length > 0 && (
                                <div className="space-y-2">
                                    {searchResults.map((album) => (
                                        <button
                                            key={album.spotify_id}
                                            onClick={() => handleSelectAlbum(album)}
                                            className={`
                                                w-full
                                                flex items-center gap-4
                                                p-3
                                                bg-primaryBackground
                                                rounded-lg
                                                hover:bg-tertiaryBackground
                                                transition-colors
                                                text-left
                                            `}
                                        >
                                            <img 
                                                src={album.imageUrl} 
                                                alt={album.name}
                                                className="w-16 h-16 rounded object-cover flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-primaryText font-medium truncate">
                                                    {album.name}
                                                </p>
                                                <p className="text-secondaryText text-sm truncate">
                                                    {album.artist}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!isSearching && searchQuery && searchResults.length === 0 && (
                                <div className="text-center py-8 text-secondaryText">
                                    No albums found
                                </div>
                            )}
                        </div>
                    ) : (
                        // Album Selected View
                        <div>
                            {/* Edit or Log Again Choice Dialog */}
                            {showEditChoice && existingLog && (
                                <div className={`
                                    fixed
                                    inset-0
                                    bg-secondarBackground/50
                                    backdrop-blur-3xl
                                    z-50
                                    flex justify-center items-center
                                    p-4
                                `}>
                                    <div className={`
                                        w-full max-w-lg
                                        px-8 py-6
                                        bg-secondaryBackground
                                        rounded-lg
                                    `}>
                                        <h3 className="text-xl font-bold mb-4 text-primaryText">You've logged this album before</h3>
                                        <p className="text-secondaryText mb-6">
                                            Would you like to edit your existing log or create a new entry?
                                        </p>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => {
                                                    // Edit mode - pre-populate form
                                                    setIsEditMode(true);
                                                    setShowEditChoice(false);
                                                    if (existingLog) {
                                                        setFormData({
                                                            rating: existingLog.rating,
                                                            liked: existingLog.liked || false,
                                                            review: existingLog.review_text,
                                                            addToQueue: false
                                                        });
                                                        setRating(existingLog.rating || 0);
                                                    }
                                                }}
                                                className={`
                                                    flex-1
                                                    px-4 py-2.5
                                                    rounded-lg
                                                    bg-accentText
                                                    hover:bg-primaryButtonHover
                                                    hover:text-primaryTextHover
                                                    transition-colors
                                                    h-[42px]
                                                `}
                                            >
                                                Edit Existing
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // New entry mode
                                                    setIsEditMode(false);
                                                    setShowEditChoice(false);
                                                    setExistingLog(null);
                                                    // Reset form
                                                    setFormData({
                                                        rating: null,
                                                        liked: false,
                                                        review: null,
                                                        addToQueue: false
                                                    });
                                                    setRating(0);
                                                    setHoverRating(0);
                                                }}
                                                className={`
                                                    flex-1
                                                    px-4 py-2.5
                                                    rounded-lg
                                                    bg-tertiaryBackground
                                                    hover:bg-primaryBackground
                                                    text-primaryText
                                                    font-medium
                                                    transition-colors
                                                    h-[42px]
                                                `}
                                            >
                                                Log Again
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => {
                                                onClose();
                                            }}
                                            className={`
                                                mt-4
                                                w-full
                                                px-4 py-2
                                                rounded-sm
                                                text-secondaryText
                                                hover:text-primaryText
                                                transition-colors
                                            `}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                            {isLoadingDetails ? (
                                <div className="text-center py-8 text-secondaryText">
                                    Loading album details...
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className={`
                                    w-full
                                `}>
                                    <section className={`
                                        body-container
                                        w-full h-fit mt-4
                                        flex flex-col items-start gap-4
                                        md:flex-row md:justify-between md:gap-8
                                    `}>
                                        <div className={`
                                            cover-container
                                            w-full
                                            flex justify-center
                                            md:w-auto
                                        `}>
                                            <img 
                                                src={selectedAlbum.imageUrl} 
                                                alt={selectedAlbum.name}
                                                width={334} 
                                                height={334} 
                                                className={`
                                                    rounded-sm
                                                    w-full max-w-[200px]
                                                    sm:max-w-[250px]
                                                    md:max-w-[334px] md:w-[334px]
                                                `}
                                            />
                                        </div>
                                        <div className={`
                                            form-container
                                            flex flex-col justify-start items-start flex-grow
                                            w-full
                                            md:w-[512px]
                                        `}>
                                            <h2 className={`
                                                text-3xl font-bold
                                                line-clamp-2
                                            `}>
                                                {albumDetails?.name || selectedAlbum.name}
                                            </h2>
                                            <p className={`
                                                text-accentText
                                            `}>
                                                {albumDetails?.artists[0]?.name || selectedAlbum.artist}
                                            </p>
                                            <div className={`
                                                mt-6
                                                flex justify-start items-center gap-8
                                            `}>
                                                <div className={`
                                                    rating-container
                                                    w-fit h-fit flex justify-start items-center gap-2
                                                `}>
                                                    <h3 className={`
                                                        font-medium
                                                    `}>
                                                        Rating:
                                                    </h3>
                                                    <div className={`
                                                        flex justify-start items-center
                                                    `}>
                                                        {[1, 2, 3, 4, 5].map((i) => {
                                                            const fillPercent = getFillPercent(i)
                                                            return (
                                                                <div 
                                                                    key={i}
                                                                    onMouseMove={(e) => handleMouseMove(e, i)}
                                                                    onMouseLeave={() => setHoverRating(0)}
                                                                    onClick={(e) => handleClick(e, i)}
                                                                    className={`
                                                                        relative 
                                                                        w-6 h-6
                                                                        cursor-pointer
                                                                    `}
                                                                >
                                                                    <StarIcon 
                                                                        className={`
                                                                            w-6 h-6
                                                                            text-secondaryText
                                                                        `}
                                                                    />
                                                                    <div 
                                                                        className={`
                                                                            absolute
                                                                            h-full top-0 left-0
                                                                            overflow-hidden
                                                                            pointer-events-none
                                                                        `}
                                                                        style={{width: `${fillPercent}%`}}
                                                                    >
                                                                        <StarIcon 
                                                                            className={`
                                                                                w-6 h-6
                                                                                text-accentText
                                                                            `}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                                <div className={`
                                                    like-container
                                                    w-fit h-fit
                                                    flex justify-start items-center gap-2
                                                `}>
                                                    <h3 className={`
                                                        font-medium
                                                    `}>
                                                        Like: 
                                                    </h3>
                                                    <button 
                                                        type='button' 
                                                        onClick={handleLiked}
                                                    >
                                                        <HeartIcon 
                                                            className={`
                                                                w-6 h-6
                                                                ${formData.liked ? 'text-accentText' : 'text-secondaryText'}
                                                                hover:text-accentText
                                                                cursor-pointer
                                                            `}
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Add to Queue */}
                                            <div className={`
                                                mt-4
                                                flex justify-start items-center gap-2
                                            `}>
                                                <h3 className={`
                                                    font-medium
                                                `}>
                                                    Queue: 
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={handleToggleQueue}
                                                    disabled={isLoadingQueue}
                                                    className={`
                                                        flex items-center gap-2
                                                        px-3 py-1.5
                                                        rounded-sm
                                                        border
                                                        transition-all
                                                        disabled:opacity-50 disabled:cursor-not-allowed
                                                        ${
                                                            isInQueue
                                                                ? 'bg-accentText/10 border-accentText/30 text-accentText'
                                                                : 'bg-secondaryBackground border-primaryBorder text-secondaryText hover:text-primaryText'
                                                        }
                                                    `}
                                                >
                                                    {isLoadingQueue ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                            <span className="text-sm font-medium">
                                                                {isInQueue ? 'Removing...' : 'Adding...'}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {isInQueue ? (
                                                                <>
                                                                    <BookmarkIconSolid className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">In Queue</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <BookmarkIcon className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">Add to Queue</span>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <div className={`
                                                w-full
                                                md:w-[462px]
                                            `}>
                                                <textarea 
                                                    className={`
                                                        w-full h-32 mt-3 p-2
                                                        rounded-sm
                                                        bg-[#2A2C30]
                                                        font-text
                                                        resize-none
                                                        focus:h-[55vh] focus:outline-none
                                                        text-primaryText
                                                    `}
                                                    placeholder='Add a review...'
                                                    id='review'
                                                    name='review'
                                                    value={formData.review || ''}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        review: e.target.value
                                                    }))}
                                                />
                                                {message && (
                                                    <div className={`
                                                        w-full
                                                        mt-3 px-4 py-3
                                                        rounded-sm
                                                        ${message.type === 'success' 
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                                                            : 'bg-red-500/20 text-red-400 border border-red-500/50'
                                                        }
                                                    `}>
                                                        {message.text}
                                                    </div>
                                                )}
                                                <div className={`
                                                    flex justify-end items-center
                                                    w-full
                                                `}>
                                                    <button 
                                                        type='submit' 
                                                        className={`
                                                            w-full
                                                            mt-2 px-4 py-2
                                                            rounded-sm
                                                            cursor-pointer
                                                            bg-accentText
                                                            hover:bg-primaryButtonHover hover:text-primaryTextHover
                                                            disabled:opacity-50 disabled:cursor-not-allowed
                                                        `}
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

