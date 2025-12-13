'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid'

type WantToListenButtonProps = {
    album: {
        spotify_id: string
        title: string
        artists: any
        release_date: string
        cover_image_url: string
        total_tracks: number
        tracks: any
    }
    albumId: string | null
    userId: string | null
    initialIsInQueue?: boolean
}

export default function WantToListenButton({ album, albumId, userId, initialIsInQueue = false }: WantToListenButtonProps) {
    const [isInWantToListen, setIsInWantToListen] = useState(initialIsInQueue)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    // Update state if initialIsInQueue changes (e.g., after toggle)
    useEffect(() => {
        setIsInWantToListen(initialIsInQueue)
    }, [initialIsInQueue])

    const handleToggle = async () => {
        if (!userId || isLoading) return

        setIsLoading(true)

        try {
            // First, ensure album exists in database
            let dbAlbumId = albumId

            if (!dbAlbumId) {
                // Check if album exists
                const { data: existingAlbum } = await supabase
                    .from('albums')
                    .select('id')
                    .eq('spotify_id', album.spotify_id)
                    .single()

                if (existingAlbum) {
                    dbAlbumId = existingAlbum.id
                } else {
                    // Create album in database
                    const { data: newAlbum, error: insertError } = await supabase
                        .from('albums')
                        .insert([
                            {
                                spotify_id: album.spotify_id,
                                title: album.title,
                                artists: album.artists,
                                release_date: album.release_date,
                                cover_image_url: album.cover_image_url,
                                total_tracks: album.total_tracks,
                                tracks: album.tracks
                            }
                        ])
                        .select('id')
                        .single()

                    if (insertError) {
                        console.error('Error creating album:', insertError)
                        alert('Error: Could not add album to database. Please try again.')
                        setIsLoading(false)
                        return
                    }

                    dbAlbumId = newAlbum.id
                }
            }

            if (!dbAlbumId) {
                console.error('Could not get or create album ID')
                alert('Error: Could not process album. Please try again.')
                setIsLoading(false)
                return
            }

            // Check if user_albums entry exists
            const { data: existingUserAlbum, error: checkError } = await supabase
                .from('user_albums')
                .select('id, rating, review_text, is_favorite, liked, queue')
                .eq('user_id', userId)
                .eq('album_id', dbAlbumId)
                .maybeSingle()

            if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking user album:', checkError)
                alert('Error: Could not check album status. Please try again.')
                setIsLoading(false)
                return
            }

            if (existingUserAlbum) {
                // Check if it's logged (has rating, review, favorite, or liked)
                const isLogged = existingUserAlbum.rating !== null || 
                               existingUserAlbum.review_text !== null || 
                               existingUserAlbum.is_favorite === true || 
                               existingUserAlbum.liked === true

                if (isLogged) {
                    // Can't add to queue if it's already logged
                    alert('This album is already logged. You can\'t add it to queue.')
                    setIsLoading(false)
                    return
                }

                // Check current queue status
                const currentlyInQueue = existingUserAlbum.queue === true

                if (currentlyInQueue) {
                    // Remove from queue - delete the entry since it's only for queue
                    const { error: deleteError } = await supabase
                        .from('user_albums')
                        .delete()
                        .eq('id', existingUserAlbum.id)

                    if (deleteError) {
                        console.error('Error removing from queue:', deleteError)
                        alert('Error: Could not remove from queue. Please try again.')
                    } else {
                        setIsInWantToListen(false)
                    }
                } else {
                    // Add to queue - update existing entry
                    const { error: updateError } = await supabase
                        .from('user_albums')
                        .update({ queue: true })
                        .eq('id', existingUserAlbum.id)

                    if (updateError) {
                        console.error('Error adding to queue:', updateError)
                        alert('Error: Could not add to queue. Please try again.')
                    } else {
                        setIsInWantToListen(true)
                    }
                }
            } else {
                // Add to queue (insert new entry with queue = true)
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
                    setIsInWantToListen(true)
                }
            }
        } catch (err) {
            console.error('Error toggling queue:', err)
            alert('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Don't show button if user is not logged in
    if (!userId) {
        return null
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`
                group
                flex items-center gap-2
                mt-4 px-4 py-2
                rounded-lg
                border
                transition-all duration-300 ease-out
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                    isInWantToListen
                        ? 'bg-accentText/10 border-accentText/30 text-accentText hover:bg-accentText/20'
                        : 'bg-secondaryBackground border-primaryBorder text-secondaryText hover:text-primaryText hover:border-accentText/50'
                }
            `}
        >
            {isLoading ? (
                <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">
                        {isInWantToListen ? 'Removing...' : 'Adding...'}
                    </span>
                </>
            ) : (
                <>
                    {isInWantToListen ? (
                        <>
                            <BookmarkIconSolid className="w-4 h-4" />
                            <span className="font-medium">In Queue</span>
                        </>
                    ) : (
                        <>
                            <BookmarkIcon className="w-4 h-4" />
                            <span className="font-medium">Add to Queue</span>
                        </>
                    )}
                </>
            )}
        </button>
    )
}
