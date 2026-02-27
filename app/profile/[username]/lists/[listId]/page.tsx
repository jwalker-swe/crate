import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/Footer";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { HeartIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { notFound } from "next/navigation";
import ListAlbumsGrid from "@/components/ListAlbumsGrid";

type PageProps = {
	params: Promise<{
		username: string;
		listId: string;
	}>;
};

export default async function ListDetailPage({ params }: PageProps) {
	const { username, listId } = await params;

	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	// Fetch current user data for navbar
	let currentUserData = null;
	if (user) {
		const { data } = await supabase
			.from('users')
			.select('username, avatar_url')
			.eq('id', user.id)
			.single();
		currentUserData = data;
	}

	// Fetch the list with its albums
	const { data: list, error: listError } = await supabase
		.from('lists')
		.select(`
			id,
			name,
			description,
			is_public,
			created_at,
			user_id,
			list_albums (
				album_id,
				position,
				albums (
					id,
					spotify_id,
					title,
					artists,
					cover_image_url
				)
			)
		`)
		.eq('id', listId)
		.single();

	if (listError || !list) {
		console.error('List fetch error:', JSON.stringify(listError, null, 2));
		notFound();
	}

	// Fetch the list owner separately
	const { data: listOwner } = await supabase
		.from('users')
		.select('id, username, display_name, avatar_url')
		.eq('id', list.user_id)
		.single();
	
	// Verify the URL username matches the list owner
	if (!listOwner || listOwner.username !== username) {
		notFound();
	}

	// Fetch like count separately (if list_likes table exists)
	let likeCount = 0;
	let hasLiked = false;
	const { data: likes, count } = await supabase
		.from('list_likes')
		.select('user_id', { count: 'exact' })
		.eq('list_id', listId);
	
	if (likes) {
		likeCount = count || 0;
		hasLiked = user ? likes.some(like => like.user_id === user.id) : false;
	}

	// Sort albums by position
	const sortedAlbums = list.list_albums
		?.sort((a, b) => a.position - b.position)
		.map(la => {
			const album = Array.isArray(la.albums) ? la.albums[0] : la.albums;
			return album;
		})
		.filter(Boolean) || [];

	// Format the date
	const createdDate = new Date(list.created_at).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const isOwnList = user?.id === listOwner?.id;

	return (
		<div className="w-full min-h-screen bg-primaryBackground">
			<header>
				<div className="content-container w-full max-w-[1200px] h-fit mx-auto py-4 px-4 lg:w-[1200px] lg:px-0">
					<NavBar
						session={user ? true : false}
						initialUsername={currentUserData?.username || null}
						initialAvatarUrl={currentUserData?.avatar_url || null}
						initialUserId={user?.id || null}
					/>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 lg:pt-16 pb-24 lg:pb-32">
				{/* Hero Section */}
				<div className="mb-12 lg:mb-16">
					{/* List Title */}
					<h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-primaryText tracking-tight mb-4">
						{list.name}
					</h1>

					{/* Creator Info */}
					<Link 
						href={`/profile/${listOwner?.username}`}
						className="flex items-center gap-3 mb-6 group w-fit"
					>
						<div className="w-10 h-10 rounded-full bg-secondaryBackground overflow-hidden flex items-center justify-center">
							{listOwner?.avatar_url ? (
								<img
									src={listOwner.avatar_url}
									alt={`${listOwner.display_name || listOwner.username}'s profile`}
									className="w-full h-full object-cover"
								/>
							) : (
								<UserCircleIcon className="w-full h-full text-secondaryText" />
							)}
						</div>
						<div className="flex flex-col">
							<span className="text-primaryText font-medium group-hover:text-accentText transition-colors">
								{listOwner?.display_name || listOwner?.username}
							</span>
							<span className="text-sm text-secondaryText">
								@{listOwner?.username}
							</span>
						</div>
					</Link>

					{/* Stats Row */}
					<div className="flex items-center gap-6 text-sm text-secondaryText mb-6">
						<span className="flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-accentText"></span>
							{sortedAlbums.length} {sortedAlbums.length === 1 ? 'album' : 'albums'}
						</span>
						<span className="flex items-center gap-1">
							<HeartIcon className="w-4 h-4 text-secondaryText" />
							{likeCount} {likeCount === 1 ? 'like' : 'likes'}
						</span>
						<span>
							Created {createdDate}
						</span>
					</div>

					{/* Description */}
					{list.description && (
						<p className="text-secondaryText text-base lg:text-lg max-w-3xl mb-6">
							{list.description}
						</p>
					)}

					<div className="h-px w-24 bg-gradient-to-r from-accentText to-transparent"></div>
				</div>

				{/* Albums Grid */}
				<ListAlbumsGrid 
					albums={sortedAlbums}
					listId={listId}
					isOwnList={isOwnList}
				/>
			</main>
			<Footer />
		</div>
	);
}
