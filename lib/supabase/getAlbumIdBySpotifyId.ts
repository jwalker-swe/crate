import { createClient } from "./server";


export default async function getAlbumIdBySpotifyId(spotifyId: string) {

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('albums')
        .select('id')
        .eq('spotify_id', spotifyId)
        .single();
        
    if (error) {
        console.error('Error fetching album id: ', error);
        return null;
    }

    if (!data) {
        console.log('No album id found');
        return null;
    }

    return data.id;
        
}