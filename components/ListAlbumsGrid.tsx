'use client'

import { useState } from 'react'
import Link from "next/link"

type Album = {
	id: string;
	spotify_id: string;
	title: string;
	artists: { name: string }[] | null;
	cover_image_url: string;
}

type ListAlbumsGridProps = {
	albums: Album[];
	listId: string;
	isOwnList: boolean;
}

export default function ListAlbumsGrid({ albums, listId, isOwnList }: ListAlbumsGridProps) {
	const [page, setPage] = useState(1);
	const albumsPerPage = 20;
	
	const displayedAlbums = albums.slice(0, page * albumsPerPage);
	const hasMore = displayedAlbums.length < albums.length;

	return (
		<div className="w-full">
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
				{displayedAlbums.map((album, index) => {
					if (!album || !album.spotify_id) {
						return null;
					}

					const artistName = album.artists?.[0]?.name || 'Unknown Artist';

					return (
						<div
							key={`${album.id}-${index}`}
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
								href={`/album/${album.spotify_id}`}
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
									src={album.cover_image_url}
									alt={album.title}
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
										{album.title}
									</p>
								</div>

								{/* Position badge */}
								<div className="absolute top-3 left-3">
									<div className="w-7 h-7 bg-primaryBackground/90 backdrop-blur-sm rounded-full flex items-center justify-center">
										<span className="text-xs font-medium text-primaryText">{index + 1}</span>
									</div>
								</div>
							</Link>

							{/* Album Info */}
							<div className="mt-3">
								<p className="text-sm font-medium text-primaryText line-clamp-1">
									{album.title}
								</p>
								<p className="text-xs text-secondaryText line-clamp-1">
									{artistName}
								</p>
							</div>
						</div>
					)	
				})}
			</div>

			{/* Empty State */}
			{albums.length === 0 && (
				<div className="w-full py-16 text-center">
					<p className="text-secondaryText text-lg">
						No albums in this list yet
					</p>
				</div>
			)}

			{/* Load More Button */}
			{hasMore && (
				<div className="w-full flex justify-center items-center mt-12 lg:mt-16">
					<button
						onClick={() => setPage(page + 1)}
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
