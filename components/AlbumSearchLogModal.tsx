'use client'

import { useState, useEffect, MouseEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
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
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Check if album is in queue when selected
    useEffect(() => {
        if (selectedAlbum && userId) {
            checkQueueStatus()
        }
    }, [selectedAlbum, userId])

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
                const { data: userAlbum } = await supabase
                    .from('user_albums')
                    .select('queue')
                    .eq('user_id', userId)
                    .eq('album_id', existingAlbum.id)
                    .maybeSingle()

                setIsInQueue(userAlbum?.queue === true)
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

            // Check if user_albums entry exists
            const { data: existingUserAlbum } = await supabase
                .from('user_albums')
                .select('id, rating, review_text, is_favorite, liked, queue')
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

                const currentlyInQueue = existingUserAlbum.queue === true

                if (currentlyInQueue) {
                    // Remove from queue
                    const { error: deleteError } = await supabase
                        .from('user_albums')
                        .delete()
                        .eq('id', existingUserAlbum.id)

                    if (deleteError) {
                        console.error('Error removing from queue:', deleteError)
                        alert('Error: Could not remove from queue. Please try again.')
                    } else {
                        setIsInQueue(false)
                        setFormData(prev => ({ ...prev, addToQueue: false }))
                    }
                } else {
                    // Add to queue
                    const { error: updateError } = await supabase
                        .from('user_albums')
                        .update({ queue: true })
                        .eq('id', existingUserAlbum.id)

                    if (updateError) {
                        console.error('Error adding to queue:', updateError)
                        alert('Error: Could not add to queue. Please try again.')
                    } else {
                        setIsInQueue(true)
                        setFormData(prev => ({ ...prev, addToQueue: true }))
                    }
                }
            } else {
                // Add to queue (insert new entry)
                const { error: insertError } = await supabase
                    .from('user_albums')
                    .insert([
                        {
                            user_id: userId,
                            album_id: dbAlbumId,
                            rating: null,
                            review_text: null,
                            is_favorite: null,
                            liked: null,
                            queue: true
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
                alert('Error: Could not save album. Please try again.')
                setIsSubmitting(false)
                return
            }

            if (user) {
                // Check if entry already exists
                const { data: existingUserAlbum } = await supabase
                    .from('user_albums')
                    .select('id, queue')
                    .eq('user_id', user.id)
                    .eq('album_id', albumId)
                    .maybeSingle()

                if (existingUserAlbum) {
                    // Update existing entry
                    const { error } = await supabase
                        .from('user_albums')
                        .update({
                            rating: formData.rating,
                            review_text: formData.review,
                            is_favorite: formData.liked,
                            queue: false // Remove from queue when logged
                        })
                        .eq('id', existingUserAlbum.id)

                    if (error) {
                        console.error('Error updating data: ', error)
                        alert('Error saving. Please try again.')
                    } else {
                        console.log('Album logged successfully')
                        onClose()
                    }
                } else {
                    // Insert new entry
                    const { error } = await supabase
                        .from('user_albums')
                        .insert([
                            {
                                user_id: user.id,
                                album_id: albumId,
                                rating: formData.rating,
                                review_text: formData.review,
                                is_favorite: formData.liked,
                                queue: false
                            }
                        ])

                    if (error) {
                        console.error('Error inserting data: ', error)
                        alert('Error saving. Please try again.')
                    } else {
                        console.log('Album logged successfully')
                        onClose()
                    }
                }
            }
        } catch (err) {
            console.error('An unexpected error occurred while fetching user data: ', err)
            alert('An error occurred. Please try again.')
        } finally {
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

