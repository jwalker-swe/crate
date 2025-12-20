'use client'

import [useState, useEffect] from 'react';
import { createClient } from '@/lib/supabase/client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/Link';

type FollowingModalProps = {
	count: number
	userId: string
}

type FollowingUser = {
	following_id: string
	users: {
		id: string
		username: string
		display_name: string || null
		avatar_url: string || null
	}
}

export default function FollowingModal({ count, userId }: FollowingModalProps) {

	const [isOpen, setIsOpen] = useState(false)
	const [following, setFollowing] = useState<FollowingUser[]>([])
	const [loading, setLoading] = useState(false)

	const supabase = createClient();

	const fetchFollowing = async function() {
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

			if ( error ) {
				console.error('Error fetching following: ', error);
				return [];
			}

			if ( !data ) {
				return [];
			}

			return data

		} catch {
			console.error('Unexpected error fetching following: ', error)
		}

		setLoading(false)
	}

	const unFollow = async function(following_id: string) {
		//Work on logic for unFollowing
	}

	useEffect(() => {
		if ( isOpen && following.length === 0 ) {
			fetchFollowing()
		}
	}, [isOpen])

}
