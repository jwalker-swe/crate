'use client'

import { createClient } from '@/lib/supabase/client'
import { supabase } from '@/lib/supabase/supabase'
import { useState, useEffect } from 'react'

type FollowButtonProps = {
    profile: string
}

type ViewingOwnProfileProps = {
    userId: string | null,
    profile: string
}

export default function FollowButton({profile, user, following}: {profile: FollowButtonProps, user: string | null, following: boolean}) {

    const supabase = createClient()

    const [userId, setUserId] = useState<string | null>(user)
    const [sameUser, setSameUser] = useState<boolean>(false)
	const [isFollowing, setFollowing] = useState<boolean>(following)

	console.log('User', userId);

    useEffect(() => {
        // Check if signed in
        async function checkIfSignedIn() { 
            const { data: {session}, error: sessionError} = await supabase.auth.getSession()

            if (sessionError) {
                console.error(`Error occured fetching session: `, sessionError)
                return
            } else if (!session) {
                console.log(`User not signed in`)
                return
            } else {
				const { data: { user }, error: userError } = await supabase.auth.getUser()

                if (userError) {
                    console.error(`Error fetching user id: `, userError)
                    return
                } else if (!user) {
                    console.log(`No id found`)
                    return
                } else {
                    setUserId(user.id)
                    return
                }

            }

        }

        checkIfSignedIn()
    }, [])

    useEffect(() => {
    // Check if viewing own profile
        async function checkIfViewingOwnProfile({userId, profile}: ViewingOwnProfileProps) {
            if (!userId) {
                return
            }

            const { data, error } = await supabase
                .from('users')
                .select('username')
                .eq('id', userId)
                .single()

            if (error) {
                console.error(`Error fetching username: `, error)
                return
            }

            if (data?.username === profile) {
                setSameUser(true)
            }
        }

        checkIfViewingOwnProfile({userId, profile})
    }, [userId, profile])


	useEffect(() => {
	
		async function checkIfFollowing({profile, userId}: {profile: string, userId: string}) {
			//get id for profile
			const { data: dataA, errorA } = await supabase
				.from('users')
				.select('*')
				.eq('username', profile)
				.single()

			if (errorA) {
				console.error('Error fetching profile data')
				setFollowing(false)
			}

			const profileId = dataA.id;

			const { data: dataB, errorB } = await supabase
				.from('follows')
				.select('*')
				.eq('follower_id', userId)
				.eq('following_id', profileId)
				.single()

			if (errorB) {
				console.error('Error determining if following user: ', profile)
				setFollowing(false)
				return null
			}

			if (!dataB) {
				setFollowing(false)
				return null
			}

			if (dataB) {
				setFollowing(true);
			}
		}
		
		checkIfFollowing({profile, userId})
	}, [userId, profile, following])


const followUser = async function({profile, userId}: {profile: string, userId: string}) {

	const { data, error } = await supabase
		.from('users')
		.select('*')
		.eq('username', profile)
		.single()

	if (error) {
		console.error('Error fetching profile data: ', error)
		return null
	}

	if (data) {
		const { error } = await supabase
			.from('follows')
			.insert({
					following_id: data.id,
					follower_id: userId
				})

		if (error) {
			console.error('Error following user: ', profile)
		}

		console.log('Successfully followed user: ', profile)
	}
}

const unfollowUser = async function({profile, userId}: {profile: string, userId: string}) {

	const { data, error } = await supabase
		.from('users')
		.select('*')
		.eq('username', profile)
		.single()

	if (error) {
		console.error('Error fetching profile data: ', error)
	}

	if (data) {
		const { error } = await supabase
			.from('follows')
			.delete()
			.match({
					follower_id: userId,
					following_id: data.id
				})

		if (error) {
			console.error('Error unfollowing user: ', profile)
			return null
		}

		console.log('Successfully unfollowed user: ', profile)
	}
}

	console.log('Following: ', isFollowing);

    if (sameUser || !userId) {
        return(
            <></>
        )
    } else {
		
			return (
				<button onClick={() => {
					if (!isFollowing) {
						followUser({profile, userId})
						setFollowing(true)
					} else {
						unfollowUser({profile, userId})
						setFollowing(false)
					}
				}} className={`
					w-[78px] h-8
					rounded-lg
					text-primaryText
					bg-accentText
					hover:cursor-pointer
					hover:bg-primaryButtonHover
					hover:text-primaryTextHover
				`}>
					{ isFollowing ? 'Unfollow' : 'Follow' }
				</button>
			)
    }

}


{/* <button className={`
    w-[78px] h-8
    rounded-lg
    text-primaryText
    bg-accentText
    hover:cursor-pointer
    hover:bg-primaryButtonHover
    hover:text-primaryTextHover
`}>
    Follow
</button> */}
