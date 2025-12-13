'use client'

import { useState, useEffect } from 'react'
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline"
import { HeartIcon } from "@heroicons/react/24/solid";
import ReviewRating from "@/components/ReviewRating"
import Link from "next/link"

type AlbumData = {
	albums: {
		title: string
		spotify_id: string | null
		cover_image_url: string
	} | null
	rating: number | null
	liked: boolean
	review_text: string | null
}

type ViewMode = 'logged' | 'queue'

export default function ProfileAlbumsGrid({
	loggedAlbums, 
	queueAlbums, 
	totalColumns, 
	totalRows
}: {
	loggedAlbums: AlbumData[]
	queueAlbums: AlbumData[]
	totalColumns: number
	totalRows: number
}) {

	const [viewMode, setViewMode] = useState<ViewMode>('logged');
	const [page, setPage] = useState(1);
	const [albumsPerPage, setAlbumsPerPage] = useState(totalColumns * totalRows);
	const [albums, setAlbums] = useState<AlbumData[]>([]);

	// Get current albums based on view mode
	const currentAlbums = viewMode === 'logged' ? loggedAlbums : queueAlbums;

	useEffect(() => {
		setAlbums(currentAlbums.slice(0, page * albumsPerPage));
		setPage(1); // Reset to page 1 when switching views
	}, [viewMode, currentAlbums, albumsPerPage])

	useEffect(() => {
		setAlbums(currentAlbums.slice(0, page * albumsPerPage));
	}, [page, currentAlbums, albumsPerPage])

	function increasePageNumber() {
		setPage(page + 1)
	}

	const hasMore = albums.length < currentAlbums.length;

	return (
		<div className="w-full">
			{/* Toggle Buttons */}
			<div className="mb-8 flex items-center gap-4">
				<button
					onClick={() => setViewMode('logged')}
					className={`
						relative
						px-6 py-2.5
						text-sm font-medium
						rounded-full
						transition-all duration-300 ease-out
						${
							viewMode === 'logged'
								? 'text-primaryText bg-secondaryBackground'
								: 'text-secondaryText hover:text-primaryText'
						}
					`}
				>
					Logged
					{viewMode === 'logged' && (
						<div className="absolute inset-0 rounded-full bg-accentText/10 border border-accentText/30"></div>
					)}
				</button>
				
				<button
					onClick={() => setViewMode('queue')}
					className={`
						relative
						px-6 py-2.5
						text-sm font-medium
						rounded-full
						transition-all duration-300 ease-out
						${
							viewMode === 'queue'
								? 'text-primaryText bg-secondaryBackground'
								: 'text-secondaryText hover:text-primaryText'
						}
					`}
				>
					Queue
					{viewMode === 'queue' && (
						<div className="absolute inset-0 rounded-full bg-accentText/10 border border-accentText/30"></div>
					)}
				</button>

				{/* Count badges */}
				<div className="ml-auto flex items-center gap-4 text-sm text-secondaryText">
					<span className="flex items-center gap-2">
						<span className="w-2 h-2 rounded-full bg-accentText"></span>
						{loggedAlbums.length} logged
					</span>
					<span className="flex items-center gap-2">
						<span className="w-2 h-2 rounded-full bg-secondaryText"></span>
						{queueAlbums.length} in queue
					</span>
				</div>
			</div>

			{/* Albums Grid */}
			<div
				className={`
					grid 
					grid-cols-2 
					sm:grid-cols-3 
					md:grid-cols-4 
					lg:grid-cols-5 
					gap-4 lg:gap-6
					w-full
				`}
			>
				{albums.map((album, index) => {
					// Handle case where albums might be null or spotify_id might be missing
					if (!album.albums || !album.albums.spotify_id) {
						return null;
					}

					return (
						<div
							key={`album: ${album.albums.title}-${index}`}
							className={`
								group
								w-full
								animate-in fade-in
								transition-all duration-300 ease-out
							`}
							style={{
								animationDelay: `${index * 30}ms`
							}}
						>
							{/* Album Cover Card */}
							<Link
								href={`/album/${album.albums.spotify_id}`}
								className={`
									block
									relative
									w-full
									aspect-square
									rounded-2xl
									overflow-hidden
									bg-secondaryBackground
									shadow-lg
									transition-all duration-300 ease-out
									group-hover:shadow-2xl
									group-hover:scale-[1.02]
									group-hover:-translate-y-1
								`}
							>
								<img
									src={album.albums.cover_image_url}
									alt={album.albums.title}
									className={`
										w-full h-full
										object-cover
										transition-transform duration-500 ease-out
										group-hover:scale-110
									`}
								/>
								
								{/* Overlay gradient on hover */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								
								{/* Album title overlay (appears on hover) */}
								<div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
									<p className="text-white text-sm font-medium line-clamp-2">
										{album.albums.title}
									</p>
								</div>

								{/* Queue indicator badge */}
								{viewMode === 'queue' && (
									<div className="absolute top-3 right-3">
										<div className="px-2 py-1 bg-primaryBackground/90 backdrop-blur-sm rounded-full">
											<span className="text-xs text-secondaryText">Queue</span>
										</div>
									</div>
								)}
							</Link>

							{/* Metadata Bar */}
							<div
								className={`
									mt-3
									flex items-center justify-between
									gap-2
									min-h-[24px]
								`}
							>
								{/* Star rating - conditionally shown if rating is not null */}
								<div className="flex-1 min-w-0">
									{album.rating !== null && (
										<ReviewRating rating={album.rating} showNumber={false} />
									)}
								</div>
								
								{/* Icons - conditionally shown */}
								<div
									className={`
										flex items-center gap-2
										opacity-60
										group-hover:opacity-100
										transition-opacity duration-200
									`}
								>
									{/* Liked icon */}
									{ album.liked && (
										<HeartIcon 
											className={`
												w-4 h-4 
												text-accentText
												flex-shrink-0
											`}
										/>
									)}
									{/* Review icon */}
									{ album.review_text !== null && (
										<Bars3BottomLeftIcon 
											className={`
												w-4 h-4 
												text-secondaryText
												flex-shrink-0
											`}
										/>	
									)}
								</div>
							</div>
						</div>
					)	
				})}
			</div>

			{/* Empty State */}
			{albums.length === 0 && (
				<div className="w-full py-16 text-center">
					<p className="text-secondaryText text-lg">
						{viewMode === 'logged' 
							? 'No logged albums yet' 
							: 'No albums in queue yet'
						}
					</p>
				</div>
			)}

			{/* Load More Button */}
			{hasMore && (
				<div
					className={`
						w-full
						flex justify-center items-center
						mt-12 lg:mt-16
					`}
				>
					<button
						onClick={increasePageNumber}
						className={`
							group
							px-8 py-3
							bg-secondaryBackground
							hover:bg-tertiaryBackground
							border border-primaryBorder
							hover:border-accentText/50
							rounded-full
							text-primaryText
							text-sm font-medium
							transition-all duration-300 ease-out
							hover:scale-105
							hover:shadow-lg
							active:scale-95
						`}
					>
						<span className="flex items-center gap-2">
							Load More
							<svg 
								className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" 
								fill="none" 
								viewBox="0 0 24 24" 
								stroke="currentColor"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</span>
					</button>
				</div>
			)}
		</div>
	)
}
