import { createClient } from "./server" 

export default async function getFollowing(activeUserID: string | null) {

	// Return early if activeUserID is not provided
	if ( !activeUserID ) {
		return [];
	}
	
	const supabase = await createClient();

	try {
		//Get following data based on whose profile is being viewed
		const { data: followingData, error: followingError } = await supabase
			.from('follows')
			.select(`
				following_id,
				users!follows_following_id_fkey (
					id,
					username,
					display_name,
					avatar_url
				)
			`)
			.eq('follower_id', activeUserID)

		if ( followingError ) {
			console.error("Error fetching users following: ", followingError)
			return [];
		}

		if ( !followingData || followingData.length == 0 ) {
			return [];
		}

		return followingData;
	} catch ( error ) {
		console.error('Unexpected error fetching user following: ', error)
	}
		

}

