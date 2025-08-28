import getAccessToken from "./getAccessToken";
import { createClient } from "../supabase/server";
import { search } from 'fast-fuzzy'

export async function searchSpotify(query: string) {
    try {
        const token = await getAccessToken();
        const searchParams = await encodeURIComponent(query)

        // console.log('Encoded Search Params', searchParams);

        const response = await fetch(`https://api.spotify.com/v1/search?q=${searchParams}&type=album,artist&limit=20`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new Error ('No results found')
        }

        const searchData = await response.json();
        
        // Deduplicate albums and prioritize explicit versions
        if (searchData.albums && searchData.albums.items) {
            const albumMap = new Map();
            
            searchData.albums.items.forEach((album: any) => {
                // Create a unique key based on album name and artist
                const key = `${album.name.toLowerCase()}-${album.artists[0]?.name.toLowerCase()}`;
                
                const existingAlbum = albumMap.get(key);
                
                if (!existingAlbum) {
                    // First occurrence of this album
                    albumMap.set(key, album);
                } else {
                    // Duplicate found - prioritize explicit version
                    if (album.explicit && !existingAlbum.explicit) {
                        albumMap.set(key, album);
                    }
                    // If both are explicit or both are clean, keep the first one
                }
            });
            
            // Convert back to array
            searchData.albums.items = Array.from(albumMap.values());
        }
        
        return searchData
    } catch (error) {
        console.error(`Error fetching data from Spotify: `, error)
        return
    } 
}

export async function searchUsers(query: string) {
    try {
        const supabase = await createClient();
        
        // Remove @ symbol and search for users
        const username = query.startsWith('@') ? query.slice(1) : query;
        
        const { data: users, error } = await supabase
            .from('users')
            .select('id, username, display_name, avatar_url, bio')
            .or(`username.ilike.%${username}%,display_name.ilike.%${username}%`)
            .limit(10);

        if (error) {
            console.error('Error searching users: ', error);
            return [];
        }

        return users || [];
    } catch (error) {
        console.error('Error in user search: ', error);
        return [];
    }
}

export async function universalSearch(query: string) {
    try {
        // If query starts with @, search for users only
        if (query.startsWith('@')) {
            const users = await searchUsers(query);
            return {
                type: 'users',
                users,
                spotify: null
            };
        }
        
        // Otherwise, search Spotify (and optionally users without @)
        const [spotifyResults, userResults] = await Promise.all([
            searchSpotify(query),
            searchUsers(query) // Also search users for non-@ queries
        ]);

        return {
            type: 'mixed',
            users: userResults,
            spotify: spotifyResults
        };
    } catch (error) {
        console.error('Error in universal search: ', error);
        return {
            type: 'error',
            users: [],
            spotify: null
        };
    }
}
