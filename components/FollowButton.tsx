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

export default function FollowButton({profile, user}: {profile: FollowButtonProps, user: string | null}) {

    const supabase = createClient()

    const [userId, setUserId] = useState<string | null>(user)
    const [sameUser, setSameUser] = useState<boolean>(false)
	const [following, setFollowing] = useState<boolean>(false)
     
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
                console.log(`User signed in`)
                const { data: { user }, error: userError } = await supabase.auth.getUser()

                if (userError) {
                    console.error(`Error fetching user id: `, userError)
                    return
                } else if (!user) {
                    console.log(`No id found`)
                    return
                } else {
                    console.log(`User id found`)
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

        checkIfViewingOwnProfile({userId, profile: profile.profile})
    }, [userId, profile])


	useEffect(() => {
	
		async function checkIfFollowing({profile, userId}: {profile: string, userId: string}) {
			//get id for profile
			const { data, error } = await supabase
				.from('users')
				.select('*')
				.eq('username', profile)
				.single()

			if (error) {
				console.error('Error fetching profile data')
			}

			const profileId = data.id;

			if (profileId === userId) {
				setFollowing(true);
			}
		}
		
		if (userId) {
			checkIfFollowing({profile: profile.profile, userId})
		}
	}, [userId, profile])


const followUser = async function({profile, userId}: {profile: string, userId: string}) {
	const { data: { user }, error } = await supabase
		.from('users')
		.select('*')
		.eq('username', profile)
		.single()

	if (error) {
		console.error('Error fetching profile data: ', profile)
	}

	const profileId = await user.id;

	const { error: followError } = await supabase
		.from('follows')
		.insert({ 
					following_id: profile,
					follower_id: userId		
				})
	
	if (followError) {
		console.error('Error following user: ', profile)
	}

	console.log('successfully followed user: ', profile)
}

    if (sameUser || !userId) {
        return(
            <></>
        )
    } else {
		if (!following) {
			return (
				<button onClick={() => {
					followUser({profile: profile.profile, userId})	
				}} className={`
					w-[78px] h-8
					rounded-lg
					text-primaryText
					bg-accentText
					hover:cursor-pointer
					hover:bg-primaryButtonHover
					hover:text-primaryTextHover
				`}>
					Follow
				</button>
			)
		} else {
			return (
				<button
					onClick={() => {

					}}
					className={`
						w-[78px] h-8
						rounded-lg
						text-primaryText
						bg-accentText
						cursor-pointer
						hover:bg-primaryButtonHover
						hover:text-primaryTextHover
					`}
				>
					Unfollow
				</button>
			)
		}
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
