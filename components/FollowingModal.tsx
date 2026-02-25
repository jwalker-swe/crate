'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

type FollowingModalProps = {
	count: number
	userId: string
	currentUserId?: string | null
}

type UserInfo = {
	id: string
	username: string
	display_name: string | null
	avatar_url: string | null
}

type FollowingUser = {
	following_id: string
	users: UserInfo | UserInfo[]
}

export default function FollowingModal({ count, userId, currentUserId }: FollowingModalProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [following, setFollowing] = useState<FollowingUser[]>([])
	const [loading, setLoading] = useState(false)
	const [pendingUnfollows, setPendingUnfollows] = useState<Set<string>>(new Set())

	const supabase = createClient()
	const isOwnProfile = currentUserId === userId

	useEffect(() => {
		if (isOpen && following.length === 0) {
			fetchFollowing()
		}
	}, [isOpen])

	async function fetchFollowing() {
		setLoading(true)
		try {
			const { data, error } = await supabase
				.from('follows')
				.select(`
					following_id,
					users!follows_following_id_fkey (
						id,
						username,
						display_name,
						avatar_url
					)
				`)
				.eq('follower_id', userId)

			if (error) {
				console.error('Error fetching following:', error)
				return
			}

			if (data) {
				setFollowing(data as FollowingUser[])
			}
		} catch (error) {
			console.error('Unexpected error fetching following:', error)
		} finally {
			setLoading(false)
		}
	}

	function togglePendingUnfollow(followingId: string) {
		setPendingUnfollows(prev => {
			const newSet = new Set(prev)
			if (newSet.has(followingId)) {
				newSet.delete(followingId)
			} else {
				newSet.add(followingId)
			}
			return newSet
		})
	}

	async function handleClose() {
		if (pendingUnfollows.size > 0 && currentUserId) {
			const unfollowPromises = Array.from(pendingUnfollows).map(followingId =>
				supabase
					.from('follows')
					.delete()
					.eq('follower_id', currentUserId)
					.eq('following_id', followingId)
			)

			try {
				await Promise.all(unfollowPromises)
				setFollowing(prev =>
					prev.filter(item => !pendingUnfollows.has(item.following_id))
				)
			} catch (error) {
				console.error('Error unfollowing users:', error)
			}

			setPendingUnfollows(new Set())
		}
		setIsOpen(false)
	}

	return (
		<>
			{/* Clickable Stat */}
			<button
				onClick={() => setIsOpen(true)}
				className="flex flex-col justify-center items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
			>
				<h3 className="text-xl">{count}</h3>
				<p>following</p>
			</button>

			{/* Modal Backdrop */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
					onClick={handleClose}
				>
					{/* Modal Content */}
					<div
						className="bg-secondaryBackground rounded-xl w-full max-w-md max-h-[70vh] overflow-hidden"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="flex items-center justify-between p-4 border-b border-primaryBorder">
							<h2 className="text-lg font-semibold text-primaryText">Following</h2>
							<button
								onClick={handleClose}
								className="text-secondaryText hover:text-primaryText transition-colors"
							>
								<XMarkIcon className="w-6 h-6" />
							</button>
						</div>

						{/* List */}
						<div className="overflow-y-auto max-h-[calc(70vh-60px)]">
							{loading ? (
								<div className="p-8 text-center text-secondaryText">Loading...</div>
							) : following.length === 0 ? (
								<div className="p-8 text-center text-secondaryText">Not following anyone yet</div>
							) : (
								<ul className="divide-y divide-primaryBorder">
									{following.map((item) => {
										const isPendingUnfollow = pendingUnfollows.has(item.following_id)
										const userInfo = Array.isArray(item.users) ? item.users[0] : item.users

										return (
											<li
												key={item.following_id}
												className={`flex items-center justify-between p-4 ${isPendingUnfollow ? 'opacity-50' : ''
													}`}
											>
												<Link
													href={`/profile/${userInfo?.username}`}
													className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
													onClick={handleClose}
												>
													{userInfo?.avatar_url ? (
														<img
															src={userInfo.avatar_url}
															alt=""
															className="w-10 h-10 rounded-full object-cover"
														/>
													) : (
														<div className="w-10 h-10 rounded-full bg-accentText/20" />
													)}
													<div>
														<p className={`font-medium ${isPendingUnfollow ? 'line-through text-secondaryText' : 'text-primaryText'}`}>
															{userInfo?.display_name || userInfo?.username}
														</p>
														<p className="text-secondaryText text-sm">
															@{userInfo?.username}
														</p>
													</div>
												</Link>

												{/* Unfollow button - only show on own profile */}
												{isOwnProfile && (
													<button
														onClick={() => togglePendingUnfollow(item.following_id)}
														className={`
															px-3 py-1.5 text-sm rounded-lg transition-colors
															${isPendingUnfollow
																? 'bg-accentText text-primaryText hover:bg-primaryButtonHover'
																: 'bg-tertiaryBackground text-secondaryText hover:bg-secondaryBackground hover:text-primaryText'
															}
														`}
													>
														{isPendingUnfollow ? 'Undo' : 'Unfollow'}
													</button>
												)}
											</li>
										)
									})}
								</ul>
							)}
						</div>

						{/* Pending changes notice */}
						{pendingUnfollows.size > 0 && (
							<div className="p-3 bg-tertiaryBackground border-t border-primaryBorder text-center text-sm text-secondaryText">
								{pendingUnfollows.size} unfollow{pendingUnfollows.size > 1 ? 's' : ''} pending — will apply when you close
							</div>
						)}
					</div>
				</div>
			)}
		</>
	)
}
