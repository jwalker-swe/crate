import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import ProfileAlbumsGrid from "@/components/ProfileAlbumsGrid"

type ProfileProps = {
	params: Promise<{
			username: string
	}> 
}

export default async function Home({ params }: ProfileProps ) {
	
	// Get username of profile being viewed based on url params
	const { username } = await params;

	// Determine if user is currently logged in
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser(); 

	// Get user data of profile being viewed
	const { data: userData } = await supabase
		.from('users')
		.select('id, username, display_name, bio, avatar_url')
		.eq('username', username)
		.single()


	// Fetch albums logged by user of profile being viewed
	const { data: albumData } = await supabase
		.from('user_albums')
		.select('*, albums(*)')
		.eq('user_id', userData.id)
		.or('rating.not.is.null, review_text.not.is.null, is_favorite.not.is.null, liked.not.is.null')
		.order('created_at', { ascending: false })

	console.log('logged album data: ', albumData)


	// Build page
	return (
		<div
			className={`
			    body-container
				w-full max-w-[1200px] h-fit
		        mx-auto py-4 px-4
		        lg:w-[1200px] lg:px-0
			`}
		>
			<header>
				<NavBar
					session={user ? true : false}
					initialUsername={userData?.username || null }
					initialAvatarUrl={userData?.avatar_url || null}
				/>
			</header>
			<main
				className={`
					main-container
					w-full h-full max-w-[896px]
					mx-auto
				`}
			>
				<h1
					className={`
						title-container
					`}
				>	
					{`${userData.display_name}'s`} Log
				</h1>
				 <ProfileAlbumsGrid initialAlbumData={albumData} totalColumns={8} totalRows={4} /> 
			</main>
		</div>
	)

}
