import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import ProfileAlbumsGrid from "@/components/ProfileAlbumsGrid"
import Footer from "@/components/Footer";

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
	const { data: loggedAlbums } = await supabase
		.from('user_albums')
		.select('*, albums(id, spotify_id, title, cover_image_url)')
		.eq('user_id', userData?.id)
		.or('rating.not.is.null, review_text.not.is.null, is_favorite.not.is.null, liked.not.is.null')
		.order('created_at', { ascending: false })

	console.log('logged album data: ', loggedAlbums)


	// For queue albums - only get albums where queue = true
	const { data: wantToListenAlbums } = await supabase
		.from('user_albums')
		.select('*, albums(id, spotify_id, title, cover_image_url)')
		.eq('user_id', userData?.id)
		.eq('queue', true)
		.order('created_at', { ascending: false })

	console.log('want to listen album data: ', wantToListenAlbums)


	// Build page
	return (
		<div
			className={`
				w-full min-h-screen
				bg-primaryBackground
			`}
		>
			<header>
				<div className={`
					content-container
					w-full max-w-[1200px] h-fit
					mx-auto py-4 px-4
					lg:w-[1200px] lg:px-0
				`}>
					<NavBar
						session={user ? true : false}
						initialUsername={userData?.username || null }
						initialAvatarUrl={userData?.avatar_url || null}
					/>
				</div>
			</header>
			
			<main
				className={`
					max-w-7xl
					mx-auto
					px-6 lg:px-8
					pt-12 lg:pt-16
					pb-24 lg:pb-32
				`}
			>
				{/* Hero Section */}
				<div className="mb-12 lg:mb-16">
					<h1
						className={`
							text-4xl lg:text-5xl xl:text-6xl
							font-bold
							text-primaryText
							mb-3
							tracking-tight
						`}
					>	
						{userData?.display_name || userData?.username}'s Log
					</h1>
					<div className="h-px w-24 bg-gradient-to-r from-accentText to-transparent mt-4"></div>
				</div>

				{/* Albums Grid with Toggle */}
				<ProfileAlbumsGrid 
					loggedAlbums={loggedAlbums || []}
					queueAlbums={wantToListenAlbums || []}
					totalColumns={8} 
					totalRows={4} 
				/>
			</main>
			<Footer />
		</div>
	)

}
