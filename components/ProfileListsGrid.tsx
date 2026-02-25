'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline'
import CreateListModal from './CreateListModal'
import EditListModal from './EditListModal'

type Album = {
	id: string
	spotify_id: string
	title: string
	artist?: string
	cover_image_url: string
}

type ListAlbum = {
	album_id: string
	position: number
	albums: Album | Album[] | null
}

type List = {
	id: string
	name: string
	description: string | null
	is_public: boolean
	created_at: string
	list_albums: ListAlbum[]
}

type ProfileListsGridProps = {
	lists: List[]
	username: string
	isOwnProfile: boolean
}

export default function ProfileListsGrid({ lists, username, isOwnProfile }: ProfileListsGridProps) {
	const [displayedLists, setDisplayedLists] = useState(lists.slice(0, 12))
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [editingList, setEditingList] = useState<List | null>(null)
	const hasMore = displayedLists.length < lists.length

	function loadMore() {
		const currentLength = displayedLists.length
		const nextBatch = lists.slice(0, currentLength + 12)
		setDisplayedLists(nextBatch)
	}

	return (
		<div className="w-full">
			{/* Header with count and create button */}
			<div className="mb-8 flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-4 text-sm text-secondaryText">
					<span className="flex items-center gap-2">
						<span className="w-2 h-2 rounded-full bg-accentText"></span>
						<span>{lists.length} {lists.length === 1 ? 'list' : 'lists'}</span>
					</span>
				</div>

				{isOwnProfile && (
					<button
						onClick={() => setIsCreateModalOpen(true)}
						className="flex items-center gap-2 px-4 py-2 bg-accentText text-primaryText text-sm font-medium rounded-full hover:bg-primaryButtonHover transition-colors"
					>
						<PlusIcon className="w-4 h-4" />
						Create List
					</button>
				)}
			</div>

			{/* Lists Grid */}
			{displayedLists.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{displayedLists.map((list, index) => {
						const coverAlbums = list.list_albums
							.sort((a, b) => a.position - b.position)
							.slice(0, 4)
							.map(la => Array.isArray(la.albums) ? la.albums[0] : la.albums)
							.filter(Boolean) as Album[]

						return (
							<div
								key={list.id}
								className="relative group"
								style={{ animationDelay: `${index * 50}ms` }}
							>
								{/* Edit Button - only visible on own profile */}
								{isOwnProfile && (
									<button
										onClick={(e) => {
											e.preventDefault()
											e.stopPropagation()
											setEditingList(list)
										}}
										className="absolute top-3 right-3 z-10 p-2 bg-primaryBackground/80 backdrop-blur-sm rounded-full text-secondaryText hover:text-primaryText hover:bg-primaryBackground transition-all opacity-0 group-hover:opacity-100"
									>
										<PencilIcon className="w-4 h-4" />
									</button>
								)}

								<Link
									href={`/profile/${username}/lists/${list.id}`}
									className="block"
								>
									<div className="bg-secondaryBackground rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1">
										{/* Cover Art Collage */}
										<div className="aspect-square relative bg-tertiaryBackground">
											{coverAlbums.length >= 4 ? (
												<div className="grid grid-cols-2 grid-rows-2 w-full h-full">
													{coverAlbums.slice(0, 4).map((album, i) => (
														<div key={album.id} className="relative overflow-hidden">
															<img
																src={album.cover_image_url}
																alt={album.title}
																className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
															/>
														</div>
													))}
												</div>
											) : coverAlbums.length > 0 ? (
												<img
													src={coverAlbums[0].cover_image_url}
													alt={coverAlbums[0].title}
													className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<span className="text-secondaryText text-sm">No albums</span>
												</div>
											)}

											{/* Overlay gradient */}
											<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
										</div>

										{/* List Info */}
										<div className="p-4">
											<h3 className="text-primaryText font-semibold text-lg line-clamp-1 group-hover:text-accentText transition-colors">
												{list.name}
											</h3>
											{list.description && (
												<p className="text-secondaryText text-sm mt-1 line-clamp-2">
													{list.description}
												</p>
											)}
											<div className="flex items-center gap-3 mt-3 text-xs text-secondaryText">
												<span>{list.list_albums.length} {list.list_albums.length === 1 ? 'album' : 'albums'}</span>
												{!list.is_public && (
													<span className="px-2 py-0.5 bg-tertiaryBackground rounded-full">
														Private
													</span>
												)}
											</div>
										</div>
									</div>
								</Link>
							</div>
						)
					})}
				</div>
			) : (
				<div className="w-full py-16 text-center">
					<p className="text-secondaryText text-lg">
						{isOwnProfile ? "You haven't created any lists yet" : "No lists yet"}
					</p>
					{isOwnProfile && (
						<button
							onClick={() => setIsCreateModalOpen(true)}
							className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-accentText text-primaryText font-medium rounded-full hover:bg-primaryButtonHover transition-colors"
						>
							<PlusIcon className="w-5 h-5" />
							Create Your First List
						</button>
					)}
				</div>
			)}

			{/* Load More Button */}
			{hasMore && (
				<div className="w-full flex justify-center items-center mt-12 lg:mt-16">
					<button
						onClick={loadMore}
						className="group px-8 py-3 bg-secondaryBackground hover:bg-tertiaryBackground border border-primaryBorder hover:border-accentText/50 rounded-full text-primaryText text-sm font-medium transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg active:scale-95"
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

			{/* Create List Modal */}
			<CreateListModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				username={username}
			/>

			{/* Edit List Modal */}
			{editingList && (
				<EditListModal
					isOpen={!!editingList}
					onClose={() => setEditingList(null)}
					list={editingList}
				/>
			)}
		</div>
	)
}
