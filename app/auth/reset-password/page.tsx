'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function ResetPassword() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        // Check if we have a valid session (user clicked the reset link)
        const checkSession = async () => {
            // Wait a bit for Supabase to process the hash if present
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const { data: { session } } = await supabase.auth.getSession()
            const hash = window.location.hash
            
            // If no session and no hash with token, this might be a direct navigation
            if (!session && (!hash || !hash.includes('access_token'))) {
                // Check if there are search params (alternative token format)
                const token = searchParams.get('token')
                const type = searchParams.get('type')
                
                if (!token && type !== 'recovery') {
                    // No valid reset token - show message but don't redirect immediately
                    // User might have clicked the link and it's still processing
                    setError('Please click the password reset link from your email to continue.')
                }
            }
        }
        checkSession()
    }, [router, searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        // Validate passwords
        if (password.length < 6) {
            setError('Password must be at least 6 characters long')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            // Update the password
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            })

            if (updateError) {
                setError(updateError.message)
                setLoading(false)
                return
            }

            // Success - get user info and redirect to profile
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('username')
                    .eq('id', user.id)
                    .single()

                if (profile && profile.username) {
                    setSuccess(true)
                    setTimeout(() => {
                        router.push(`/profile/${profile.username}`)
                    }, 2000)
                } else {
                    setSuccess(true)
                    setTimeout(() => {
                        router.push('/')
                    }, 2000)
                }
            } else {
                setSuccess(true)
                setTimeout(() => {
                    router.push('/auth/sign-in')
                }, 2000)
            }
        } catch (err) {
            console.error('Error resetting password:', err)
            setError('An error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className={`
            w-full max-w-[1200px] h-screen
            mx-auto py-4 px-4
            lg:px-0
            bg-primaryBackground
        `}>
            <section className={`
                w-full h-full
                flex justify-center items-center
                px-4 py-8
                sm:px-8
                lg:px-16
            `}>
                <div className={`
                    w-full max-w-2xl
                    px-6 pt-8 pb-14
                    sm:px-12
                    md:px-20
                    lg:px-32
                    bg-secondaryBackground
                    rounded-lg
                `}>
                    <Link href='/' className={`hover:cursor-pointer`}>
                        <Image src={'/images/crate-logo-cropped.png'} alt='crate logo'
                            width={220} height={25} className={`
                                mx-auto p-4
                                max-w-full h-auto
                            `}
                        />
                    </Link>
                    <h1 className={`
                        text-3xl text-center
                    `}>
                        Reset Your Password
                    </h1>
                    {!success && error && error.includes('Please click') ? (
                        <div className={`
                            mt-8 p-4
                            bg-accentText/10
                            border border-accentText/30
                            rounded-sm
                        `}>
                            <p className={`
                                text-sm text-primaryText
                                text-center
                            `}>
                                {error}
                            </p>
                            <Link 
                                href='/auth/sign-in'
                                className={`
                                    block
                                    mt-3
                                    text-center
                                    text-sm text-accentText
                                    hover:text-primaryButtonHover
                                    transition-colors
                                `}
                            >
                                Go to Sign In
                            </Link>
                        </div>
                    ) : success ? (
                        <div className={`
                            mt-8 p-4
                            bg-accentText/10
                            border border-accentText/30
                            rounded-sm
                        `}>
                            <p className={`
                                text-sm text-primaryText
                                text-center
                            `}>
                                Password reset successfully! Redirecting...
                            </p>
                        </div>
                    ) : error && error.includes('Please click') ? null : (
                        <form onSubmit={handleSubmit} className={`
                            flex flex-col justify-center items-start
                            mt-8 space-y-2
                        `}>
                            <div className={`
                                w-full
                            `}>
                                <label htmlFor='password' className={`
                                    block
                                    text-sm text-secondaryText
                                `}>
                                    New Password
                                </label>
                                <input
                                    type='password'
                                    id='password'
                                    name='password'
                                    placeholder='Enter your new password...'
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className={`
                                        w-full
                                        p-2
                                        text-sm
                                        rounded-sm
                                        bg-primaryBackground
                                        focus:outline-none
                                    `}
                                />
                            </div>
                            <div className={`
                                w-full
                            `}>
                                <label htmlFor='confirmPassword' className={`
                                    block
                                    text-sm text-secondaryText
                                `}>
                                    Confirm New Password
                                </label>
                                <input
                                    type='password'
                                    id='confirmPassword'
                                    name='confirmPassword'
                                    placeholder='Confirm your new password...'
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className={`
                                        w-full
                                        p-2
                                        text-sm
                                        rounded-sm
                                        bg-primaryBackground
                                        focus:outline-none
                                    `}
                                />
                            </div>
                            {error && (
                                <p className={`
                                    w-full
                                    text-sm text-red-500
                                    text-center
                                `}>
                                    {error}
                                </p>
                            )}
                            <button 
                                type='submit' 
                                disabled={loading}
                                className={`
                                    w-full
                                    mt-4 p-3
                                    text-center
                                    bg-accentText
                                    rounded-sm
                                    hover:cursor-pointer
                                    hover:bg-primaryButtonHover
                                    hover:text-primaryTextHover
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                `}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                    <div className={`
                        w-full
                        mt-4
                        flex justify-center items-center
                    `}>
                        <Link href='/auth/sign-in' className={`
                            text-sm text-accentText
                            hover:text-primaryButtonHover
                            transition-colors
                        `}>
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

