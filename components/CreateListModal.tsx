'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { XMarkIcon, MagnifyingGlassIcon, PlusIcon, TrashIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

type SearchAlbum = {
	spotify_id: string
	name: string
	artist: string
	imageUrl: string
}

type SelectedAlbum = {
	spotify_id: string
	name: string
	artist: string
	imageUrl: string
	dbId?: string
}

type CreateListModalProps = {
	isOpen: boolean
	onClose: () => void
	username: string
}

export default function CreateListModal({ isOpen, onClose, username }: CreateListModalProps) {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [isPublic, setIsPublic] = useState(true)
	const [selectedAlbums, setSelectedAlbums] = useState<SelectedAlbum[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<SearchAlbum[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const supabase = createClient()
	const router = useRouter()
	const contentRef = useRef<HTMLDivElement>(null)
	const searchSectionRef = useRef<HTMLDivElement>(null)

	// Scroll search section into view when search results appear
	useEffect(() => {
		if (searchResults.length > 0 && searchSectionRef.current) {
			searchSectionRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			})
		}
	}, [searchResults])

	async function searchAlbums(query: string) {
		if (!query.trim()) {
			setSearchResults([])
			return
		}

		setIsSearching(true)
		try {
			const response = await fetch(`/api/search-albums?q=${encodeURIComponent(query)}`)
			if (!response.ok) throw new Error('Search failed')

			const data = await response.json()
			if (data.albums && data.albums.items) {
				const albums = data.albums.items
					.filter((item: any) => item.album_type === 'album')
					.slice(0, 10)
					.map((item: any) => ({
						spotify_id: item.id,
						name: item.name,
						artist: item.artists[0]?.name || 'Unknown Artist',
						imageUrl: item.images[0]?.url || '/images/album-covers/test-album-cover.png'
					}))
				
				// Filter out already selected albums
				const filteredResults = albums.filter(
					(album: SearchAlbum) => !selectedAlbums.some(selected => selected.spotify_id === album.spotify_id)
				)
				setSearchResults(filteredResults)
			}
		} catch (err) {
			console.error('Error searching albums:', err)
			setSearchResults([])
		} finally {
			setIsSearching(false)
		}
	}

	function addAlbum(album: SearchAlbum) {
		setSelectedAlbums(prev => [...prev, album])
		setSearchResults(prev => prev.filter(a => a.spotify_id !== album.spotify_id))
		setSearchQuery('')
	}

	function removeAlbum(spotifyId: string) {
		setSelectedAlbums(prev => prev.filter(a => a.spotify_id !== spotifyId))
	}

	function moveAlbum(index: number, direction: 'up' | 'down') {
		const newAlbums = [...selectedAlbums]
		const newIndex = direction === 'up' ? index - 1 : index + 1
		if (newIndex < 0 || newIndex >= newAlbums.length) return
		[newAlbums[index], newAlbums[newIndex]] = [newAlbums[newIndex], newAlbums[index]]
		setSelectedAlbums(newAlbums)
	}

	async function getOrCreateAlbumInDb(album: SelectedAlbum): Promise<string | null> {
		try {
			const response = await fetch('/api/create-album', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ spotify_id: album.spotify_id })
			})

			if (!response.ok) {
				const errorData = await response.json()
				console.error('Error creating album:', errorData)
				return null
			}

			const data = await response.json()
			return data.id
		} catch (err) {
			console.error('Error in getOrCreateAlbumInDb:', err)
			return null
		}
	}

	async function handleSubmit() {
		if (!name.trim()) {
			setError('Please enter a name for your list')
			return
		}

		setIsSubmitting(true)
		setError(null)

		try {
			// Get current user
			const { data: { user } } = await supabase.auth.getUser()
			if (!user) {
				setError('You must be logged in to create a list')
				setIsSubmitting(false)
				return
			}

			// Create the list
			const { data: listData, error: listError } = await supabase
				.from('lists')
				.insert({
					user_id: user.id,
					name: name.trim(),
					description: description.trim() || null,
					is_public: isPublic
				})
				.select('id')
				.single()

			if (listError) {
				console.error('Error creating list:', listError)
				setError('Failed to create list. Please try again.')
				setIsSubmitting(false)
				return
			}

			// Add albums to the list
			if (selectedAlbums.length > 0) {
				const albumInserts: { list_id: string; album_id: string; position: number }[] = []

				for (let i = 0; i < selectedAlbums.length; i++) {
					const album = selectedAlbums[i]
					const dbId = await getOrCreateAlbumInDb(album)
					if (dbId) {
						albumInserts.push({
							list_id: listData.id,
							album_id: dbId,
							position: i
						})
					}
				}

				if (albumInserts.length > 0) {
					const { error: albumsError } = await supabase
						.from('list_albums')
						.insert(albumInserts)

					if (albumsError) {
						console.error('Error adding albums to list:', albumsError)
					}
				}
			}

			// Reset form and close modal
			setName('')
			setDescription('')
			setIsPublic(true)
			setSelectedAlbums([])
			setSearchQuery('')
			setSearchResults([])
			onClose()
			router.refresh()
		} catch (err) {
			console.error('Unexpected error creating list:', err)
			setError('An unexpected error occurred. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	function handleClose() {
		setName('')
		setDescription('')
		setIsPublic(true)
		setSelectedAlbums([])
		setSearchQuery('')
		setSearchResults([])
		setError(null)
		onClose()
	}

	if (!isOpen) return null

	return (
		<div
			className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
			onClick={handleClose}
		>
			<div
				className="bg-secondaryBackground rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-primaryBorder flex-shrink-0">
					<h2 className="text-xl font-semibold text-primaryText">Create New List</h2>
					<button
						onClick={handleClose}
						className="text-secondaryText hover:text-primaryText transition-colors"
					>
						<XMarkIcon className="w-6 h-6" />
					</button>
				</div>

				{/* Content */}
				<div ref={contentRef} className="flex-1 overflow-y-auto p-4 space-y-6">
					{/* Error message */}
					{error && (
						<div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
							{error}
						</div>
					)}

					{/* Name Input */}
					<div>
						<label className="block text-sm font-medium text-primaryText mb-2">
							List Name <span className="text-red-400">*</span>
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="My Favorite Albums"
							className="w-full px-4 py-3 bg-primaryBackground border border-primaryBorder rounded-lg text-primaryText placeholder:text-secondaryText focus:outline-none focus:border-accentText transition-colors"
							maxLength={100}
						/>
					</div>

					{/* Description Input */}
					<div>
						<label className="block text-sm font-medium text-primaryText mb-2">
							Description <span className="text-secondaryText">(optional)</span>
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="A collection of albums that..."
							rows={3}
							className="w-full px-4 py-3 bg-primaryBackground border border-primaryBorder rounded-lg text-primaryText placeholder:text-secondaryText focus:outline-none focus:border-accentText transition-colors resize-none"
							maxLength={500}
						/>
					</div>

					{/* Privacy Toggle */}
					<div>
						<label className="block text-sm font-medium text-primaryText mb-3">
							Visibility
						</label>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setIsPublic(true)}
								className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
									isPublic
										? 'bg-accentText/10 border-accentText text-accentText'
										: 'bg-primaryBackground border-primaryBorder text-secondaryText hover:border-accentText/50'
								}`}
							>
								<GlobeAltIcon className="w-5 h-5" />
								<span>Public</span>
							</button>
							<button
								type="button"
								onClick={() => setIsPublic(false)}
								className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
									!isPublic
										? 'bg-accentText/10 border-accentText text-accentText'
										: 'bg-primaryBackground border-primaryBorder text-secondaryText hover:border-accentText/50'
								}`}
							>
								<LockClosedIcon className="w-5 h-5" />
								<span>Private</span>
							</button>
						</div>
						<p className="text-xs text-secondaryText mt-2">
							{isPublic 
								? 'Anyone can view this list on your profile'
								: 'Only you can see this list'
							}
						</p>
					</div>

					{/* Album Search */}
					<div ref={searchSectionRef}>
						<label className="block text-sm font-medium text-primaryText mb-2">
							Add Albums <span className="text-secondaryText">(optional)</span>
						</label>
						<div className="relative">
							<MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondaryText" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value)
									searchAlbums(e.target.value)
								}}
								placeholder="Search for albums..."
								className="w-full pl-12 pr-4 py-3 bg-primaryBackground border border-primaryBorder rounded-lg text-primaryText placeholder:text-secondaryText focus:outline-none focus:border-accentText transition-colors"
							/>
						</div>

						{/* Search Results */}
						{searchQuery && (
							<div className="mt-2 bg-primaryBackground border border-primaryBorder rounded-lg overflow-hidden max-h-80 overflow-y-auto">
								{isSearching ? (
									<div className="p-4 text-center text-secondaryText">Searching...</div>
								) : searchResults.length === 0 ? (
									<div className="p-4 text-center text-secondaryText">No albums found</div>
								) : (
									<ul>
										{searchResults.map(album => (
											<li
												key={album.spotify_id}
												onClick={() => addAlbum(album)}
												className="flex items-center gap-3 p-3 hover:bg-tertiaryBackground cursor-pointer transition-colors"
											>
												<img
													src={album.imageUrl}
													alt={album.name}
													className="w-10 h-10 rounded object-cover"
												/>
												<div className="flex-1 min-w-0">
													<p className="text-primaryText text-sm font-medium truncate">{album.name}</p>
													<p className="text-secondaryText text-xs truncate">{album.artist}</p>
												</div>
												<PlusIcon className="w-5 h-5 text-accentText flex-shrink-0" />
											</li>
										))}
									</ul>
								)}
							</div>
						)}
					</div>

					{/* Selected Albums */}
					{selectedAlbums.length > 0 && (
						<div>
							<label className="block text-sm font-medium text-primaryText mb-2">
								Selected Albums ({selectedAlbums.length})
							</label>
							<ul className="space-y-2">
								{selectedAlbums.map((album, index) => (
									<li
										key={album.spotify_id}
										className="flex items-center gap-3 p-3 bg-primaryBackground border border-primaryBorder rounded-lg"
									>
										<span className="text-secondaryText text-sm w-6 text-center">{index + 1}</span>
										<img
											src={album.imageUrl}
											alt={album.name}
											className="w-12 h-12 rounded object-cover"
										/>
										<div className="flex-1 min-w-0">
											<p className="text-primaryText text-sm font-medium truncate">{album.name}</p>
											<p className="text-secondaryText text-xs truncate">{album.artist}</p>
										</div>
										<div className="flex items-center gap-1">
											<button
												onClick={() => moveAlbum(index, 'up')}
												disabled={index === 0}
												className="p-1 text-secondaryText hover:text-primaryText disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
											>
												<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
												</svg>
											</button>
											<button
												onClick={() => moveAlbum(index, 'down')}
												disabled={index === selectedAlbums.length - 1}
												className="p-1 text-secondaryText hover:text-primaryText disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
											>
												<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
												</svg>
											</button>
											<button
												onClick={() => removeAlbum(album.spotify_id)}
												className="p-1 text-secondaryText hover:text-red-400 transition-colors"
											>
												<TrashIcon className="w-4 h-4" />
											</button>
										</div>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-3 p-4 border-t border-primaryBorder flex-shrink-0">
					<button
						onClick={handleClose}
						className="px-6 py-2.5 text-secondaryText hover:text-primaryText transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={isSubmitting || !name.trim()}
						className="px-6 py-2.5 bg-accentText text-primaryText font-medium rounded-lg hover:bg-primaryButtonHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? 'Creating...' : 'Create List'}
					</button>
				</div>
			</div>
		</div>
	)
}
