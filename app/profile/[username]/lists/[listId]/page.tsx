import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/Footer";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import ListAlbumsGrid from "@/components/ListAlbumsGrid";

type PageProps = {
	params: Promise<{
		username: string
		listId: string
	}>
}

export default async function ListDetailPage({ params }: PageProps) {
	const { username, listId } = await params;

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	// Get user data of profile being viewed
	const { data: userData } = await supabase
		.from('users')
		.select('id, username, display_name, bio, avatar_url')
		.eq('username', username)
		.single();

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
					<Link href="/" className="text-accentText hover:text-primaryButtonHover transition-colors">
						Return to Home →
					</Link>
				</div>
			</div>
		);
	}

	// Fetch the specific list with its albums
	const { data: listData, error: listError } = await supabase
		.from('lists')
		.select(`
			id,
			name,
			description,
			is_public,
			user_id,
			created_at,
			list_albums (
				id,
				album_id,
				position,
				added_at,
				albums (
					id,
					spotify_id,
					title,
					artist,
					cover_image_url,
					release_date
				)
			)
		`)
		.eq('id', listId)
		.eq('user_id', userData.id)
		.single();

	if (listError || !listData) {
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
				<div className="w-full max-w-[896px] mx-auto pb-18 lg:w-[896px] flex flex-col items-center justify-center min-h-[400px]">
					<h1 className="text-2xl font-bold mb-4">List Not Found</h1>
					<p className="text-secondaryText mb-4">This list doesn't exist or is private.</p>
					<Link
						href={`/profile/${username}/lists`}
						className="text-accentText hover:text-primaryButtonHover transition-colors"
					>
						← Back to Lists
					</Link>
				</div>
			</div>
		);
	}

	// Check if viewing own profile
	const isOwnProfile = user?.id === userData.id;

	// Sort albums by position
	const sortedAlbums = listData.list_albums
		.sort((a, b) => a.position - b.position)
		.map(la => la.albums)
		.filter(Boolean);

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
				{/* Back Link */}
				<Link
					href={`/profile/${username}/lists`}
					className="inline-flex items-center gap-2 text-secondaryText hover:text-primaryText transition-colors mb-8"
				>
					<ArrowLeftIcon className="w-4 h-4" />
					Back to Lists
				</Link>

				{/* Hero Section */}
				<div className="mb-12 lg:mb-16">
					<div className="flex items-start gap-6">
						{/* List Cover Collage */}
						<div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-2xl bg-secondaryBackground flex-shrink-0 overflow-hidden">
							{sortedAlbums.length >= 4 ? (
								<div className="grid grid-cols-2 grid-rows-2 w-full h-full">
									{sortedAlbums.slice(0, 4).map((album: any, i: number) => (
										<div key={album.id} className="relative overflow-hidden">
											<img
												src={album.cover_image_url}
												alt={album.title}
												className="w-full h-full object-cover"
											/>
										</div>
									))}
								</div>
							) : sortedAlbums.length > 0 ? (
								<img
									src={(sortedAlbums[0] as any).cover_image_url}
									alt={(sortedAlbums[0] as any).title}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<span className="text-secondaryText text-sm">No albums</span>
								</div>
							)}
						</div>

						{/* Text Content */}
						<div className="flex flex-col flex-1">
							<p className="text-sm text-secondaryText uppercase tracking-wider mb-2">List</p>
							<h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-primaryText tracking-tight">
								{listData.name}
							</h1>
							{listData.description && (
								<p className="text-secondaryText mt-3 max-w-2xl">
									{listData.description}
								</p>
							)}
							<div className="flex items-center gap-4 mt-4">
								<Link
									href={`/profile/${username}`}
									className="flex items-center gap-2 text-secondaryText hover:text-primaryText transition-colors"
								>
									{userData?.avatar_url ? (
										<img
											src={userData.avatar_url}
											alt={userData.display_name || userData.username}
											className="w-6 h-6 rounded-full object-cover"
										/>
									) : (
										<UserCircleIcon className="w-6 h-6 text-accentText" />
									)}
									<span className="text-sm">{userData?.display_name || userData?.username}</span>
								</Link>
								<span className="text-secondaryText text-sm">•</span>
								<span className="text-secondaryText text-sm">
									{sortedAlbums.length} {sortedAlbums.length === 1 ? 'album' : 'albums'}
								</span>
								{!listData.is_public && (
									<span className="px-2 py-0.5 bg-tertiaryBackground text-secondaryText text-xs rounded-full">
										Private
									</span>
								)}
							</div>
							<div className="h-px w-24 bg-gradient-to-r from-accentText to-transparent mt-6"></div>
						</div>
					</div>
				</div>

				{/* Albums Grid */}
				<ListAlbumsGrid
					albums={sortedAlbums as any[]}
					isOwnProfile={isOwnProfile}
					listId={listId}
				/>
			</main>
			<Footer />
		</div>
	);
}
