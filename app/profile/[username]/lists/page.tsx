import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import ProfileListsGrid from "@/components/ProfileListsGrid";
import Footer from "@/components/Footer";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

type ProfileProps = {
	params: Promise<{
		username: string
	}>
}

export default async function ListsPage({ params }: ProfileProps) {
	const { username } = await params;

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	// Get user data of profile being viewed
	const { data: userData } = await supabase
		.from('users')
		.select('id, username, display_name, bio, avatar_url')
		.eq('username', username)
		.single();

	// If user doesn't exist, show not found
	if (!userData) {
		return (
			<div className="w-full min-h-screen bg-primaryBackground">
				<header>
					<div className="content-container w-full max-w-[1200px] h-fit mx-auto py-4 px-4 lg:w-[1200px] lg:px-0">
						<NavBar
							session={user ? true : false}
							initialUsername={null}
							initialAvatarUrl={null}
							initialUserId={user?.id || null}
						/>
					</div>
				</header>
				<div className="w-full max-w-[896px] mx-auto pb-18 lg:w-[896px] flex flex-col items-center justify-center min-h-[400px]">
					<h1 className="text-2xl font-bold mb-4">User Not Found</h1>
					<p className="text-secondaryText mb-4">
						The user @{username} does not exist.
					</p>
					<Link
						href="/"
						className="text-accentText hover:text-primaryButtonHover transition-colors"
					>
						Return to Home →
					</Link>
				</div>
			</div>
		);
	}

	// Fetch lists created by the user
	const { data: listsData, error: listsError } = await supabase
		.from('lists')
		.select(`
			id,
			name,
			description,
			is_public,
			created_at,
			list_albums (
				album_id,
				position,
				albums (
					id,
					spotify_id,
					title,
					cover_image_url
				)
			)
		`)
		.eq('user_id', userData.id)
		.order('created_at', { ascending: false });

	if (listsError) {
		console.error('Error fetching lists:', JSON.stringify(listsError, null, 2));
		console.error('Error message:', listsError.message);
		console.error('Error details:', listsError.details);
		console.error('Error hint:', listsError.hint);
	}

	// Check if viewing own profile
	const isOwnProfile = user?.id === userData.id;

	return (
		<div className="w-full min-h-screen bg-primaryBackground">
			<header>
				<div className="content-container w-full max-w-[1200px] h-fit mx-auto py-4 px-4 lg:w-[1200px] lg:px-0">
					<NavBar
						session={user ? true : false}
						initialUsername={userData?.username || null}
						initialAvatarUrl={userData?.avatar_url || null}
						initialUserId={user?.id || null}
					/>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 lg:pt-16 pb-24 lg:pb-32">
				{/* Hero Section */}
				<div className="mb-12 lg:mb-16 flex items-center gap-6">
					{/* Profile Picture */}
					<div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-secondaryBackground flex-shrink-0 overflow-hidden flex items-center justify-center">
						{userData?.avatar_url ? (
							<img
								src={userData.avatar_url}
								alt={`${userData.display_name || userData.username}'s profile`}
								className="w-full h-full object-cover"
							/>
						) : (
							<UserCircleIcon className="w-full h-full text-accentText" />
						)}
					</div>

					{/* Text Content */}
					<div className="flex flex-col">
						<h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-primaryText tracking-tight">
							{userData?.display_name || userData?.username}'s Lists
						</h1>
						<p className="text-lg lg:text-xl text-secondaryText mt-1">
							@{userData?.username}
						</p>
						<div className="h-px w-24 bg-gradient-to-r from-accentText to-transparent mt-4"></div>
					</div>
				</div>

				{/* Lists Grid */}
				<ProfileListsGrid
					lists={listsData || []}
					username={username}
					isOwnProfile={isOwnProfile}
				/>
			</main>
			<Footer />
		</div>
	);
}
