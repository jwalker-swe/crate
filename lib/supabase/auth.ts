import { supabase } from './supabase'

export interface SignUpData {
    email: string
    password: string
    username: string
    displayName?: string
}

export interface SignInData {
    email: string
    password: string
}

export interface AuthResult {
    success: boolean
    error?: string
    user?: any
}

export async function signUp(data: SignUpData): Promise<AuthResult> {
    try {
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password
        })

        if (authError) {
            return { success: false, error: authError.message }
        }

        // 2. Create user profile
        if (authData.user) {
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    username: data.username,
                    display_name: data.displayName || data.username,
                })

            if (profileError) {
                return { success: false, error: profileError.message }
            }
        }

        return { success: true, user: authData.user }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }
    }
}

export async function signIn(data: SignInData): Promise<AuthResult> {
    try {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, user: authData.user }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }
    }
}

export async function signOut(): Promise<void> {
    await supabase.auth.signOut()
}

export async function resetPassword(email: string): Promise<AuthResult> {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email)

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }
    }
}