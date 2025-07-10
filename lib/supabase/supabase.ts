import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Type definitions for your database
export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    username: string
                    display_name: string | null
                    bio: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username: string
                    display_name?: string | null
                    bio?: string | null
                    avatar_url: string | null
                    created_at?: string
                    updated_at?: String
                }
                Update: {
                    id?: string
                    username?: string
                    display_name?: string | null
                    bio?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            albums: {
                Row: {
                    id: string
                    spotify_id: string
                    title: string
                    artist: string
                    release_date: string | null
                    cover_image_url: string | null
                    total_tracks: number | null
                    genres: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    spotify_id: string
                    title: string
                    artist: string
                    release_date?: string | null
                    cover_image_url?: string | null
                    total_tracks?: number | null
                    genres?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    spotify_id?: string
                    title?: string
                    artist?: string
                    release_date?: string | null
                    cover_image_url?: string | null
                    total_tracks?: number | null
                    genres?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
            }
            user_albums: {
                Row: {
                    id: string
                    user_id: string
                    album_id: string
                    rating: number | null
                    review_text: string | null
                    listen_date: string | null
                    is_favorite: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    album_id: string
                    rating?: number | null
                    review_text?: string | null
                    listen_date?: string | null
                    is_favorite?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    album_id?: string
                    rating?: number | null
                    review_text?: string | null
                    listen_date?: string | null
                    is_favorite?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            follows: {
                Row: {
                    id: string
                    follower_id: string
                    following_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    follower_id: string
                    following_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    follower_id?: string
                    following_id?: string
                    created_at?: string
                }
            }
        }
    }
}

// Typed client
export const typedSupabase = createClient<Database>(supabaseUrl, supabaseKey)