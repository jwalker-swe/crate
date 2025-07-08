import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, Database } from '@/lib/supabase/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthState {
    user: User | null
    profile: UserProfile | null
    loading: boolean
    signOut: () => Promise<void>
}

export function useAuth(): AuthState {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            try {
                const { data: { session }  } = await supabase.auth.getSession()
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchUserProfile(session.user.id)
                }
            } catch (error) {
                console.error('Error getting session: ', error)
            } finally {
                setLoading(false)
            }
        }

        getSession()

        //Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchUserProfile(session.user.id)
                } else {
                    setProfile(null)
                }

                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile: ', error)
                return
            }

            setProfile(data)
        } catch (error) {
            console.error('Error fetching profile: ', error)
        }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error('Error signing out: ', error)
        }
    }

    return {
        user,
        profile,
        loading,
        signOut
    }

}