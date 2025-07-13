import { supabase } from "../supabase/supabase";

export default async function getFavoriteAlbums(username: string) {

    let id: string | null = null
    let favorites: any

    try {
        //Get user id
        const {data, error} = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single()

        if (error) {
            console.error(`Couldn't fetch user id: `, error)
        }

        id = data?.id

        const {data: albumData, error: albumError} = await supabase
            .from('user_albums')
            .select(`
                album_id
                albums (
                    id,
                    title,
                    artist,
                    cover_image_url,
                    spotify_id
                )
            `)
            .eq('user_id', id)
            .eq('is_favorite', true)
            .single()

        if (albumError) {
            console.log(`Error fetching user's favorite albums: `, albumError)
        }

        favorites = albumData

        console.log(favorites)
            
    } catch (error) {
        console.error(`An unexpected error occured while fetching user's favorite albums: `, error)
    }


    
}