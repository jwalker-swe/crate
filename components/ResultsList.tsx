'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import getReleaseDate from "@/lib/spotify/getReleaseDate";
import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/solid";

interface Results {
    albums: {
        [key: string]: any,
    }[] | undefined,
    artist: {
        [key: string]: any,
    }[] | undefined,
    artistMatchScore: number | undefined
}

export default function ResultsList ({ results, userResults, searchType, sk }: { results: any, userResults?: any[], searchType?: string, sk: string }) {

    const initialAlbums = results?.albums || [];
    const [albums, setAlbums] = useState(initialAlbums);
    const [loading, setLoading] = useState(Array(initialAlbums.length).fill(false));
    const [userLoading, setUserLoading] = useState(Array(userResults?.length || 0).fill(false));
    const [loadingMore, setLoadingMore] = useState(false);
    // Start offset at 20 since we already loaded the first 20 results
    const [offset, setOffset] = useState(20);
    // Assume there are more results if we have albums initially (will be updated by API response)
    const [hasMore, setHasMore] = useState(initialAlbums.length > 0);
    const observerTarget = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const slug = sk.replace(/-/g, ' ');

    const handleClick = (index: number, href: string) => {
        const newLoading = [...loading];
        newLoading[index] = true;
        setLoading(newLoading);
        router.push(href);
    };

    const handleUserClick = (index: number, href: string) => {
        const newUserLoading = [...userLoading];
        newUserLoading[index] = true;
        setUserLoading(newUserLoading);
        router.push(href);
    };

    // Load more albums when scrolling to bottom
    const loadMoreAlbums = useCallback(async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        try {
            const currentOffset = offset;
            const response = await fetch(`/api/search-albums?q=${encodeURIComponent(slug)}&offset=${currentOffset}&limit=20`);
            const data = await response.json();
            
            if (data.albums && data.albums.items) {
                // Filter albums (same logic as arrangeSearch)
                let filteredAlbums = data.albums.items.filter((item: any) => item.album_type.includes('album'));
                
                // Deduplicate within the new batch and prioritize explicit versions
                const albumMap = new Map();
                filteredAlbums.forEach((album: any) => {
                    const key = `${album.name.toLowerCase()}-${album.artists[0]?.name.toLowerCase()}`;
                    const existingAlbum = albumMap.get(key);
                    
                    const hasExplicitTracks = album.tracks && 
                                             album.tracks.items && 
                                             album.tracks.items.some((track: any) => track.explicit === true);
                    
                    if (!existingAlbum) {
                        albumMap.set(key, album);
                    } else {
                        const existingHasExplicitTracks = existingAlbum.tracks && 
                                                          existingAlbum.tracks.items && 
                                                          existingAlbum.tracks.items.some((track: any) => track.explicit === true);
                        
                        if (hasExplicitTracks && !existingHasExplicitTracks) {
                            albumMap.set(key, album);
                        } else if (!hasExplicitTracks && existingHasExplicitTracks) {
                            // Keep existing
                        } else {
                            const newDate = new Date(album.release_date);
                            const existingDate = new Date(existingAlbum.release_date);
                            const dateDiff = Math.abs(newDate.getTime() - existingDate.getTime());
                            const oneDay = 24 * 60 * 60 * 1000;
                            
                            if (dateDiff <= oneDay) {
                                if (album.popularity > existingAlbum.popularity) {
                                    albumMap.set(key, album);
                                }
                            } else {
                                if (newDate > existingDate) {
                                    albumMap.set(key, album);
                                }
                            }
                        }
                    }
                });
                filteredAlbums = Array.from(albumMap.values());
                
                if (filteredAlbums.length > 0) {
                    // Check against existing albums in state - prevent duplicates and prefer explicit
                    setAlbums(prev => {
                        const existingIds = new Set(prev.map(album => album.id));
                        
                        // Create a map of existing albums by name+artist for duplicate checking
                        const existingAlbumsByKey = new Map();
                        prev.forEach(album => {
                            const key = `${album.name.toLowerCase()}-${album.artists[0]?.name.toLowerCase()}`;
                            if (!existingAlbumsByKey.has(key)) {
                                existingAlbumsByKey.set(key, album);
                            } else {
                                // If duplicate exists, check which is explicit and keep that one
                                const existing = existingAlbumsByKey.get(key);
                                const existingHasExplicit = existing.tracks && 
                                                           existing.tracks.items && 
                                                           existing.tracks.items.some((track: any) => track.explicit === true);
                                const currentHasExplicit = album.tracks && 
                                                          album.tracks.items && 
                                                          album.tracks.items.some((track: any) => track.explicit === true);
                                
                                if (currentHasExplicit && !existingHasExplicit) {
                                    existingAlbumsByKey.set(key, album);
                                }
                            }
                        });
                        
                        // Filter new albums: exclude by ID and check for duplicates by name+artist
                        const newAlbums = filteredAlbums.filter(album => {
                            // Exclude if ID already exists
                            if (existingIds.has(album.id)) {
                                return false;
                            }
                            
                            // Check for duplicate by name+artist
                            const key = `${album.name.toLowerCase()}-${album.artists[0]?.name.toLowerCase()}`;
                            const existingAlbum = existingAlbumsByKey.get(key);
                            
                            if (existingAlbum) {
                                // Duplicate found - check explicit status
                                const newHasExplicit = album.tracks && 
                                                      album.tracks.items && 
                                                      album.tracks.items.some((track: any) => track.explicit === true);
                                const existingHasExplicit = existingAlbum.tracks && 
                                                           existingAlbum.tracks.items && 
                                                           existingAlbum.tracks.items.some((track: any) => track.explicit === true);
                                
                                // Only add if new is explicit and existing is not
                                if (newHasExplicit && !existingHasExplicit) {
                                    // Replace the existing one with the explicit version
                                    // We'll need to filter it out from prev and add the new one
                                    return true;
                                } else {
                                    // Don't add - existing is explicit or both are same type
                                    return false;
                                }
                            }
                            
                            // No duplicate found, add it
                            return true;
                        });
                        
                        // If we're replacing albums with explicit versions, remove the clean versions
                        const albumsToKeep = prev.filter(album => {
                            const key = `${album.name.toLowerCase()}-${album.artists[0]?.name.toLowerCase()}`;
                            const replacement = newAlbums.find(newAlbum => 
                                `${newAlbum.name.toLowerCase()}-${newAlbum.artists[0]?.name.toLowerCase()}` === key
                            );
                            
                            if (replacement) {
                                // This album is being replaced by an explicit version
                                return false;
                            }
                            return true;
                        });
                        
                        // Update loading state for new albums only
                        setLoading(prevLoading => [...prevLoading, ...Array(newAlbums.length).fill(false)]);
                        
                        return [...albumsToKeep, ...newAlbums];
                    });
                    
                    // Increment offset by the limit (20) since that's what we requested from Spotify
                    setOffset(prev => prev + 20);
                    
                    // Check if there are more results - if no next URL or we got fewer items than requested
                    if (!data.albums.next || data.albums.items.length < 20) {
                        setHasMore(false);
                    }
                } else {
                    // If we got results but none passed the filter, check if there's a next page
                    // If there's no next URL, we're done
                    if (!data.albums.next) {
                        setHasMore(false);
                    } else {
                        // If there's a next page but no filtered results, try loading more
                        // This handles cases where a page might have no albums (only singles/EPs)
                        setOffset(prev => prev + 20);
                    }
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading more albums:', error);
            setHasMore(false);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, offset, slug]);

    // Intersection Observer for infinite scrolling
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMoreAlbums();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loadingMore, loadMoreAlbums]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Search Results Header */}
            <div className="mb-8 pb-6 border-b border-primaryBorder/30">
                <h1 className="text-3xl md:text-4xl font-bold text-primaryText mb-2 tracking-tight">
                    Search results
                </h1>
                <p className="text-lg text-secondaryText">
                    for "{slug}"
                </p>
            </div>

            {/* User Results Section */}
            {userResults && userResults.length > 0 && (
                <div className="w-full mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-primaryText mb-6">
                        Users
                    </h2>
                    <div className="flex flex-col gap-4">
                        {userResults.map((user: any, index: number) => (
                            <div 
                                key={`user-${index}`} 
                                onClick={() => handleUserClick(index, `/profile/${user.username}`)} 
                                className="
                                    group
                                    relative
                                    cursor-pointer
                                    w-full
                                    p-6
                                    bg-secondaryBackground
                                    rounded-2xl
                                    border border-primaryBorder/30
                                    hover:border-primaryBorder/50
                                    transition-all duration-300 ease-out
                                    hover:shadow-xl
                                    hover:-translate-y-1
                                "
                            >
                                <div className={`
                                    flex items-center gap-4
                                    ${userLoading[index] ? 'opacity-50' : ''}
                                `}>
                                    <div className="relative flex-shrink-0">
                                        {user.avatar_url ? (
                                            <img 
                                                src={user.avatar_url}
                                                alt={user.username}
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-accentText flex items-center justify-center">
                                                <span className="text-2xl font-bold text-white">
                                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        )}
                                        {userLoading[index] && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                                                <div className="loader"></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-semibold text-primaryText mb-1 group-hover:text-accentText transition-colors">
                                            @{user.username}
                                        </h3>
                                        {user.display_name && (
                                            <h4 className="text-base text-accentText mb-2">
                                                {user.display_name}
                                            </h4>
                                        )}
                                        {user.bio && (
                                            <p className="text-sm text-secondaryText line-clamp-2">
                                                {user.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Albums Section */}
            {albums && albums.length > 0 && (
                <div className="w-full">
                    <h2 className="text-2xl md:text-3xl font-bold text-primaryText mb-6">
                        Albums
                    </h2>
                    <div className="flex flex-col gap-4">
                        {albums.map((album: any, index: number) => {
                            const releaseDate = getReleaseDate(album.release_date);

                            return (
                                <div 
                                    key={index} 
                                    onClick={() => handleClick(index, `/album/${album.id}`)} 
                                    className="
                                        group
                                        relative
                                        cursor-pointer
                                        w-full
                                        p-6
                                        bg-secondaryBackground
                                        rounded-2xl
                                        border border-primaryBorder/30
                                        hover:border-primaryBorder/50
                                        transition-all duration-300 ease-out
                                        hover:shadow-xl
                                        hover:-translate-y-1
                                    "
                                >
                                    {loading[index] && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl z-10">
                                            <div className="loader"></div>
                                        </div>
                                    )}
                                    <div className={`
                                        flex items-start gap-4
                                        ${loading[index] ? 'opacity-50' : ''}
                                    `}>
                                        <div className="relative flex-shrink-0">
                                            <img 
                                                src={album.images[1]?.url || album.images[0]?.url} 
                                                width={96} 
                                                height={96}
                                                alt={album.name}
                                                className="rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-semibold text-primaryText mb-1 group-hover:text-accentText transition-colors line-clamp-1">
                                                {album.name}
                                            </h3>
                                            <h4 className="text-base text-accentText mb-2 line-clamp-1">
                                                {album.artists[0]?.name}
                                            </h4>
                                            <p className="text-sm text-secondaryText">
                                                {`${releaseDate.releaseMonth} ${releaseDate.releaseDateInfo[2]}, ${releaseDate.releaseDateInfo[0]}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}                    
                    </div>
                    {/* Observer target for infinite scrolling */}
                    {hasMore && (
                        <div ref={observerTarget} className="w-full py-8 flex justify-center">
                            {loadingMore && (
                                <div className="text-secondaryText">Loading more albums...</div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {(!userResults || userResults.length === 0) && (!albums || albums.length === 0) && (
                <div className="w-full py-16 text-center">
                    <p className="text-lg text-secondaryText">
                        No results found for "{slug}"
                    </p>
                </div>
            )}
        </div>
    )
}
