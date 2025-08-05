import { createClient } from "@/lib/supabase/server"

type ProfileStatProps = {
    statName: string,
    username: string
}

export default async function ProfileStat({ statName, username }: ProfileStatProps) {

    const supabase = await createClient()

    let id: string | null = null
    let following: number | null = null
    let followers: number | null = null
    let albumsListened: number | null = null

    // Fetch user username
    try {
        const {data: userData, error: userError} = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single()

        if (userError) {
            console.error(`Error fetching user id: `, userError)
            return null
        }

        id = userData?.id

        // Fetch user followers by username lookup
        const {count: followerCount, error: followerError} = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', id)

        if (followerError) {
            console.error('Error determining number of followers: ', followerError)
            return 0
        }

        followers = followerCount

        // Fetch user following by username lookup
        const {count: followingCount, error: followingError} = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', id)

        if (followingError) {
            console.error(`Error determing following count: `, followingError)
            return 0
        }

        following = followingCount

        // Fetch user's count of albums listened to
        const {count: albumCount, error: albumError} = await supabase
            .from('user_albums')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', id)

        if (albumError) {
            console.error('Error determining number of albums listened: ', albumError)
        }

        albumsListened = albumCount

    } catch (error) {
        console.error(`Couldn't fetch user id: `, error)
    }

    switch (statName) {
        case 'followers':
            return (
                <div className={`
                    flex flex-col justify-center items-center gap-1
                `}>
                    <h3 className={`
                        text-xl
                    `}>
                        {following}
                    </h3>
                    <p>
                        {statName}
                    </p>
                </div>
            )
        
        case 'following':
            return(
                <div className={`
                    flex flex-col justify-center items-center gap-1
                `}>
                    <h3 className={`
                        text-xl
                    `}>
                        {followers}
                    </h3>
                    <p>
                        {statName}
                    </p>
                </div>
            )

        case 'albums':
            return (
                <div className={`
                    flex flex-col justify-center items-center gap-1
                `}>
                    <h3 className={`
                        text-xl
                    `}>
                        {albumsListened}
                    </h3>
                    <p>
                        {statName}
                    </p>
                </div>
            )
    }
        
}
