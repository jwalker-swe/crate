'use client'

import { createClient } from '@/lib/supabase/client'
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
    const [loading, setLoading] = useState<boolean>(false)
     
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
            // First get the profile user's id from username
            const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('id')
                .eq('username', profile)
                .single()

            if (profileError || !profileData) {
                console.error('Error fetching profile data')
                return
            }

            const profileId = profileData.id

            // Check if there's a follow relationship
            const { data: followData, error: followError } = await supabase
                .from('follows')
                .select('id')
                .eq('follower_id', userId)
                .eq('following_id', profileId)
                .single()

            if (followError && followError.code !== 'PGRST116') {
                // PGRST116 = no rows found, which is expected when not following
                console.error('Error checking follow status:', followError)
                return
            }

            if (followData) {
                setFollowing(true)
            }
        }
        
        if (userId) {
            checkIfFollowing({profile: profile.profile, userId})
        }
    }, [userId, profile])


    const followUser = async function({profile, userId}: {profile: string, userId: string}) {
        setLoading(true)
        
        const { data: profileData, error } = await supabase
            .from('users')
            .select('id')
            .eq('username', profile)
            .single()

        if (error || !profileData) {
            console.error('Error fetching profile data: ', profile)
            setLoading(false)
            return
        }

        const followingId = profileData.id

        const { error: followError } = await supabase
            .from('follows')
            .insert({ 
                following_id: followingId,
                follower_id: userId        
            })
        
        if (followError) {
            console.error('Error following user: ', profile)
            setLoading(false)
            return
        }

        console.log('Successfully followed user: ', profile)
        setFollowing(true)
        setLoading(false)
    }

    const unfollowUser = async function({profile, userId}: {profile: string, userId: string}) {
        setLoading(true)
        
        const { data: profileData, error } = await supabase
            .from('users')
            .select('id')
            .eq('username', profile)
            .single()

        if (error || !profileData) {
            console.error('Error fetching profile data: ', profile)
            setLoading(false)
            return
        }

        const followingId = profileData.id

        const { error: unfollowError } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', userId)
            .eq('following_id', followingId)
        
        if (unfollowError) {
            console.error('Error unfollowing user: ', profile)
            setLoading(false)
            return
        }

        console.log('Successfully unfollowed user: ', profile)
        setFollowing(false)
        setLoading(false)
    }

    if (sameUser || !userId) {
        return null
    }

    if (!following) {
        return (
            <button 
                onClick={() => followUser({profile: profile.profile, userId})}
                disabled={loading}
                className={`
                    w-[78px] h-8
                    rounded-lg
                    text-primaryText
                    bg-accentText
                    hover:cursor-pointer
                    hover:bg-primaryButtonHover
                    hover:text-primaryTextHover
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
            >
                {loading ? '...' : 'Follow'}
            </button>
        )
    } else {
        return (
            <button
                onClick={() => unfollowUser({profile: profile.profile, userId})}
                disabled={loading}
                className={`
                    w-[78px] h-8
                    rounded-lg
                    text-primaryText
                    bg-accentText
                    cursor-pointer
                    hover:bg-primaryButtonHover
                    hover:text-primaryTextHover
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
            >
                {loading ? '...' : 'Unfollow'}
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
