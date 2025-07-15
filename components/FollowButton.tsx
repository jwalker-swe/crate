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

export default function FollowButton({profile}: FollowButtonProps) {

    const supabase = createClient()

    const [userId, setUserId] = useState<string | null>(null)
    const [sameUser, setSameUser] = useState<boolean>(false)

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

        checkIfViewingOwnProfile({userId, profile})
    }, [userId, profile])

    if (sameUser || !userId) {
        return(
            <></>
        )
    } else {
        return (
            <button onClick={() => {

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