'use client'

import { useState, useEffect } from 'react'
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline"
import { HeartIcon } from "@heroicons/react/24/solid";
import ReviewRating from "@/components/ReviewRating"

export default function ProfileAlbumsGrid({initialAlbumData, totalColumns, totalRows}: {initialAlbumData: any, totalColumns: number, totalRows: number}) {

	const [page, setPage] = useState(1);
	const [albumsPerPage, setAlbumsPerPage] = useState(totalColumns * totalRows);
	const [albums, setAlbums] = useState([]);

	useEffect(() => {
		setAlbums(initialAlbumData.slice(0, page * albumsPerPage))
	}, [page])

	function increasePageNumber() {
		setPage(page + 1)
	}

	return (
		<div
			className={`
				w-full h-fit mx-auto
			`}
		>
			<div
				className={`
					album-grid-container
					w-full h-fit mx-auto
					grid grid-cols-5 grid-rows-auto gap-4
					rounded-lg
				`}
			>
				{albums.map(album => {
					return (
						<div
							key={`album: ${album.albums.title}`}
							className={`w-full h-full`}
						>
							<a
								href={`/album/${album.albums.spotify_id}`}
								className={`
									transition-transform ease-in-out duration-150
									scale-105
								`}
							>
								<img
									src={album.albums.cover_image_url}
									className={`
										rounded-lg
										transition-transform ease-in-out duration-150
										hover:scale-105 hover:border-3 hover:border-accentText
									`}
								/>
							</a>
							<div
								className={`
									my-1
									flex justify-between items-center
									w-full h-fit
								`}
							>
								{/* Star rating - conditionally shown if rating is not null */}
								{album.rating !== null && (
									<ReviewRating rating={album.rating} showNumber={false} />
								)}
								
								{/* Review and liked icon - conditionally shown if review_text is not null */}
								<div
									className={`
										flex gap-1 items-center justify-center
									`}
								>
									{/* Create liked icon */}
									{ album.liked && (
										<HeartIcon 
											className={`
												w-4 text-secondaryText
											`}
										/>
									)}
									{ album.review_text !== null && (
										<Bars3BottomLeftIcon 
											className={`
												w-4 text-secondaryText
											`}
										/>	
									)}
								</div>
							</div>
						</div>
					)	
				})}
			</div>
			<div
				className={`
					load-more-container
					w-full h-fit mx-auto my-8
					flex justify-center items-center
				`}
			>
				<button
					onClick={() => {
						increasePageNumber()
					}}
					className={`
						w-fit h-fit px-8 py-2
						bg-primaryButton
						rounded-lg
						transition-color ease-in-out duration-150
						hover:cursor-pointer hover:bg-primaryButtonHover
					`}
				>
					Load More
				</button>
			</div>
		</div>
	)
}
