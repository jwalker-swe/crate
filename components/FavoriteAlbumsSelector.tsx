'use client'

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

type Album = {
    id?: string; // Optional - only present if already in database
    spotify_id: string;
    name: string;
    artist: string;
    imageUrl: string;
}

type FavoriteAlbumsSelectorProps = {
    initialFavorites?: Album[];
    onFavoritesChange?: (favorites: Album[]) => void;
}

export default function FavoriteAlbumsSelector({ initialFavorites = [], onFavoritesChange }: FavoriteAlbumsSelectorProps) {
    const [favorites, setFavorites] = useState<Album[]>(initialFavorites);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Update favorites when initialFavorites changes (e.g., when component remounts with new data)
    useEffect(() => {
        if (initialFavorites && initialFavorites.length > 0) {
            setFavorites(initialFavorites);
        }
    }, [initialFavorites]);

    useEffect(() => {
        if (onFavoritesChange) {
            onFavoritesChange(favorites);
        }
    }, [favorites, onFavoritesChange]);

    const searchAlbums = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`/api/search-albums?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            
            const data = await response.json();
            if (data.albums && data.albums.items) {
                const albums = data.albums.items
                    .filter((item: any) => item.album_type === 'album')
                    .slice(0, 10)
                    .map((item: any) => ({
                        spotify_id: item.id,
                        name: item.name,
                        artist: item.artists[0]?.name || 'Unknown Artist',
                        imageUrl: item.images[0]?.url || '/images/album-covers/test-album-cover.png'
                    }));
                setSearchResults(albums);
                setShowResults(true);
            }
        } catch (error) {
            console.error('Error searching albums:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim()) {
            searchAlbums(query);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    const addFavorite = (album: { spotify_id: string; name: string; artist: string; imageUrl: string }) => {
        if (favorites.length >= 5) {
            alert('You can only select up to 5 favorite albums');
            return;
        }

        // Check if album is already in favorites
        if (favorites.some(fav => fav.spotify_id === album.spotify_id)) {
            alert('This album is already in your favorites');
            return;
        }

        // Add album to favorites (temporarily, will be saved to DB on form submit)
        const newFavorite: Album = {
            spotify_id: album.spotify_id,
            name: album.name,
            artist: album.artist,
            imageUrl: album.imageUrl
        };

        setFavorites([...favorites, newFavorite]);
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
    };

    const removeFavorite = (spotifyId: string) => {
        // Remove album from favorites (will be saved to DB on form submit)
        setFavorites(favorites.filter(fav => fav.spotify_id !== spotifyId));
    };

    return (
        <div className={`
            flex flex-col gap-4
        `}>
            <div className={`
                flex flex-col gap-2
            `}>
                <label className={`
                    text-sm font-medium text-primaryText
                `}>
                    Favorite Albums ({favorites.length}/5)
                </label>
                <div className={`
                    relative
                `}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search for albums..."
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
                    {showResults && searchResults.length > 0 && (
                        <div className={`
                            absolute z-10
                            w-full mt-2
                            max-h-64 overflow-y-auto
                            bg-secondaryBackground
                            border border-primaryBorder
                            rounded-lg
                            shadow-lg
                        `}>
                            {searchResults.map((album, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => addFavorite(album)}
                                    className={`
                                        w-full
                                        flex items-center gap-3
                                        px-4 py-3
                                        hover:bg-primaryBackground
                                        transition-colors
                                        text-left
                                    `}
                                >
                                    <img
                                        src={album.imageUrl}
                                        alt={album.name}
                                        className="w-12 h-12 rounded object-cover"
                                    />
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-primaryText text-sm font-medium truncate">
                                            {album.name}
                                        </span>
                                        <span className="text-secondaryText text-xs truncate">
                                            {album.artist}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Favorites */}
            {favorites.length > 0 && (
                <div className={`
                    grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4
                `}>
                    {favorites.map((album, index) => (
                        <div
                            key={album.spotify_id || index}
                            className={`
                                relative
                                group
                            `}
                        >
                            <div className={`
                                relative
                                w-full
                                aspect-square
                                rounded-lg
                                overflow-hidden
                            `}>
                                <img
                                    src={album.imageUrl}
                                    alt={album.name}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFavorite(album.spotify_id)}
                                    className={`
                                        absolute top-2 right-2
                                        w-6 h-6
                                        rounded-full
                                        bg-red-500
                                        flex items-center justify-center
                                        opacity-0 group-hover:opacity-100
                                        transition-opacity
                                        hover:bg-red-600
                                    `}
                                >
                                    <XMarkIcon className="w-4 h-4 text-white" />
                                </button>
                            </div>
                            <div className={`
                                mt-2
                                px-2
                            `}>
                                <p className={`
                                    text-sm text-primaryText
                                    line-clamp-1
                                    overflow-hidden
                                `}>
                                    {album.name}
                                </p>
                                <p className={`
                                    text-xs text-secondaryText
                                    line-clamp-1
                                    overflow-hidden
                                `}>
                                    {album.artist}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

