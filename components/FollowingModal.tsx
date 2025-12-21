'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';


interface FollowingUser {
	following_id: string
	users: {
		id: string
		username: string
		display_name: string | null
		avatar_url: string | null
	}
}

type FollowingModalProps = {
	followingData: FollowingUser[]
	userId: string | undefined  // Profile user's ID (whose following list we're viewing)
	currentUserId?: string | null  // Logged-in user's ID
	isOwnProfile: boolean  // Whether viewing own profile
}



export default function FollowingModal({ followingData, userId, currentUserId, isOwnProfile }: FollowingModalProps) {

	const [isOpen, setIsOpen] = useState(false)
	
	// Track which users the logged-in user is currently following
	// (only needed when viewing someone else's profile)
	const [loggedInUserFollowing, setLoggedInUserFollowing] = useState<string[]>([])
	
	// Track loading state per user (for individual button loading states)
	const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set())
	
	const supabase = createClient()

	// Handle model closing and opening
	useEffect(() => {
		// Set page scroll
		if ( isOpen ) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}

	}, [isOpen])

	// Initialize or fetch logged-in user's following
	useEffect(() => {
		if (currentUserId && isOpen) {
			if (isOwnProfile) {
				// When viewing own profile, initialize from followingData
				const followingIds = followingData.map(item => item.following_id)
				setLoggedInUserFollowing(followingIds)
			} else {
				// When viewing someone else's profile, fetch from database
				fetchLoggedInUserFollowing()
			}
		}
	}, [isOpen, isOwnProfile, currentUserId, followingData])

	const fetchLoggedInUserFollowing = async () => {
		if (!currentUserId) return
		
		const { data, error } = await supabase
			.from('follows')
			.select('following_id')
			.eq('follower_id', currentUserId)
		
		if (error) {
			console.error('Error fetching logged-in user following:', error)
			return
		}
		
		if (data) {
			const followingIds = data.map(item => item.following_id)
			setLoggedInUserFollowing(followingIds)
		}
	}

	const handleFollowClick = async (followingId: string) => {
		if (!currentUserId) return
		
		// Prevent multiple clicks while processing
		if (loadingUsers.has(followingId)) return
		
		const isCurrentlyFollowing = loggedInUserFollowing.includes(followingId)
		
		// Set loading state for this user
		setLoadingUsers(prev => new Set(prev).add(followingId))
		
		try {
			if (isCurrentlyFollowing) {
				// Unfollow the user
				const { error } = await supabase
					.from('follows')
					.delete()
					.eq('follower_id', currentUserId)
					.eq('following_id', followingId)
				
				if (error) {
					console.error('Error unfollowing user:', error)
					return
				}
				
				// Update state immediately
				setLoggedInUserFollowing(prev => prev.filter(id => id !== followingId))
			} else {
				// Follow the user
				const { error } = await supabase
					.from('follows')
					.insert({
						follower_id: currentUserId,
						following_id: followingId
					})
				
				if (error) {
					console.error('Error following user:', error)
					return
				}
				
				// Update state immediately
				setLoggedInUserFollowing(prev => [...prev, followingId])
			}
		} catch (error) {
			console.error('Unexpected error:', error)
		} finally {
			// Remove loading state
			setLoadingUsers(prev => {
				const newSet = new Set(prev)
				newSet.delete(followingId)
				return newSet
			})
		}
	}

	const getButtonState = (followingId: string) => {
		// Check if logged-in user is currently following this user
		const isCurrentlyFollowing = loggedInUserFollowing.includes(followingId)
		
		return {
			text: isCurrentlyFollowing ? 'Following' : 'Follow',
			isFollowing: isCurrentlyFollowing
		}
	}

	const onClose = () => {
		setIsOpen(false)
	}

	return (
		<>
			{ !isOpen ? (
				<div
					className={`
						flex flex-col justify-center items-center gap-1
						hover:cursor-pointer
					`}
					onClick={() => setIsOpen(true) }
				>
					<h3
						className={`text-xl`}
					>
						{followingData.length}
					</h3>
					<p>
						following
					</p>
				</div>
			) : (
				<div
					className={`
						modal-bg
						fixed inset-0
						bg-black/50
						backdrop-blur-lg
						z-50
						flex items-center justify-center
						p-4
					`}
				>
					<div
						className={`
							modal-container
							min-w-140 h-fit
							flex flex-col justify-center items-center
							bg-secondaryBackground
							rounded-2xl
							z-100
							overflow-hidden
						`}
						onClick={(e) => e.stopPropagation()}
					>
						<div
							className={`
								w-full h-full p-4
								flex justify-between items-center gap-32
								border-b-1 border-primaryBorder
							`}
						>
							<h2
								className={`
									text-xl font-bold text-primaryText
								`}
							>
								Following
							</h2>
							<button
								onClick={() => onClose()}
							>
								<XMarkIcon className={`
									w-6 h-6 text-secondaryText 
									hover:text-primaryText hover:cursor-pointer
								`} />
							</button>
						</div>
						<ul
							className={`
								following-list-container p-4
								w-full max-h-78
								overflow-y-auto
							`}
						>
							<div
								className={`
									flex flex-col gap-4 
								`}
							>
								{followingData.map((item) => {
									return (
										<li
											key={item.following_id}
										>
											<div
												className={`
													w-full h-fit
													flex justify-between items-center
												`}
											>
											<Link
												href={`/profile/${item.users.username}`}
												onClick={() => onClose()}
												className={`
													w-full h-fit
													flex justify-start items-center gap-3
													hover:cursor-pointer
													hover:opacity-80
													transition-opacity
												`}
											>
												{ item.users.avatar_url ? (
													<>
														<img 
															src={item.users.avatar_url}
															className={`
																w-11 h-11
																rounded-full
															`}
														/>
														<div
															className={`
																flex flex-col justify-center items-start
															`}
														>
															<h4
																className={`
																	text-sm font-bold
																`}
															>
																{item.users.display_name}
															</h4>
															<p
																className={`
																	text-sm text-secondaryText
																`}
															>
																@{item.users.username}
															</p>
														</div>
													</>
												) : (
													<>
														<div
															className={`
																w-11 h-11
																rounded-full
																flex items-center justify-center
															`}
														>
															<UserCircleIcon className="w-11 h-11 text-secondaryText" />
														</div>
														<div
															className={`
																flex flex-col justify-center items-start
															`}
														>
															<h4
																className={`
																	text-sm font-bold
																`}
															>
																{item.users.display_name}
															</h4>
															<p
																className={`
																	text-sm text-secondaryText
																`}
															>
																@{item.users.username}
															</p>
														</div>
													</>
												)}
											</Link>
											{currentUserId && item.following_id !== currentUserId && (() => {
												const buttonState = getButtonState(item.following_id)
												const isLoading = loadingUsers.has(item.following_id)
												return (
													<button
														onClick={(e) => {
															e.stopPropagation()
															handleFollowClick(item.following_id)
														}}
														disabled={isLoading}
														className={`
															rounded-lg
															transition-all ease-in-out duration-250
															hover:cursor-pointer
															px-3 py-1.5
															text-sm
															min-w-[90px]
															disabled:opacity-50 disabled:cursor-not-allowed
															${buttonState.isFollowing 
																? 'bg-primaryBackground brightness-175 hover:bg-secondaryBackground' 
																: 'bg-primaryButton hover:bg-primaryButtonHover'
															}
														`}
													>
														<span className={buttonState.isFollowing ? 'brightness-75' : ''}>
															{isLoading ? '...' : buttonState.text}
														</span>
													</button>
												)
											})()}
										</div>
										</li>
									)
								})}
							</div>
						</ul>
					</div>
				</div>
			)}
		</>
	)

}
