'use client'

import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Auth() {
    const supabase = createClient()

    const params = useParams()
    const param = params?.param

    const [mode, setMode] = useState(`${param}`)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        displayName: ''
    })

    const router = useRouter()

    // Sync mode with URL param changes
    useEffect(() => {
        if (param && (param === 'sign-in' || param === 'sign-up' || param === 'forgot-password')) {
            setMode(`${param}`)
            setMessage(null)
        }
    }, [param])

    const handleSubmit = async function(e: React.FormEvent) {
        // Prevent page reload
        e.preventDefault();
        setLoading(true)
        setMessage(null)

        // Handle form submission if signing up
        if (mode === 'sign-up') {
            try {
                const { data, error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            username: formData.username,
                            display_name: formData.displayName
                        }
                    }
                })

                if (error) {
                    setMessage({ type: 'error', text: error.message || 'An error occurred while trying to sign up.' })
                } else if (data) {
                    router.push(`/auth/sign-in`)
                }
            } catch (error: any) {
                setMessage({ type: 'error', text: error.message || 'An unexpected error occurred while trying to sign up.' })
            } finally {
                setLoading(false)
            }
        }

        //Handle form submission if signing in
        if (mode === 'sign-in') {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                })

                if (error) {
                    setMessage({ type: 'error', text: error.message || 'Invalid email or password.' })
                } else if (data) {
                    // Get signed-in user's info from Supabase
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        // Fetch the user's profile from your users table
                        const { data: profile, error } = await supabase
                            .from('users')
                            .select('username')
                            .eq('id', user.id)
                            .single();

                        if (profile && profile.username) {
                            router.push(`/profile/${profile.username}`);
                        } else {
                            console.error('Could not find user profile.');
                        }
                    } else {
                        console.error('Could not get user info.');
                    }
                }
            } catch (error: any) {
                setMessage({ type: 'error', text: error.message || 'An unexpected error occurred while trying to sign in.' })
            } finally {
                setLoading(false)
            }
        }

        // Handle password reset request
        if (mode === 'forgot-password') {
            try {
                // Use environment variable for production, fallback to current origin for development
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
                const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                    redirectTo: `${siteUrl}/auth/reset-password`,
                }) 

                if (error) {
                    setMessage({ type: 'error', text: error.message || 'Failed to send password reset email.' })
                } else {
                    setMessage({ 
                        type: 'success', 
                        text: 'Password reset email sent! Please check your inbox and follow the instructions to reset your password.' 
                    })
                }
            } catch (error: any) {
                setMessage({ type: 'error', text: error.message || 'An unexpected error occurred.' })
            } finally {
                setLoading(false)
            }
        }
    }

    const handleChange = function(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
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
                        {mode === 'sign-in' ? 'Log in to your account' : 
                         mode === 'forgot-password' ? 'Reset your password' : 
                         'Sign up for an account'}
                    </h1>
                    {message && (
                        <div className={`
                            w-full mt-4 p-3 rounded-sm
                            ${message.type === 'success' 
                                ? 'bg-green-900/30 text-green-300 border border-green-700' 
                                : 'bg-red-900/30 text-red-300 border border-red-700'}
                        `}>
                            {message.text}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className={`
                        flex flex-col justify-center items-start
                        mt-8 space-y-2
                    `}>
                        {mode === 'sign-up' && (
                            <>
                                <div className={`
                                    w-full
                                `}>
                                    <label htmlFor='username' className={`
                                        block
                                        text-sm text-secondaryText
                                    `}>
                                        Username
                                    </label>
                                    <input
                                        type='text'
                                        id='username'
                                        name='username'
                                        placeholder='Enter a username...'
                                        pattern='[a-zA-Z0-9_]+'
                                        value={formData.username}
                                        onChange={handleChange}
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
                                <label htmlFor='displayName' className={`
                                    block
                                    text-sm text-secondaryText
                                `}>
                                    Display Name (Optional)
                                </label>
                                <input
                                    type='text'
                                    id='displayName'
                                    name='displayName'
                                    placeholder='Enter a display name...'
                                    value={formData.displayName}
                                    onChange={handleChange}
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
                            </>
                        )}
                        <div className={`
                                w-full
                            `}>
                                <label htmlFor='email' className={`
                                    block
                                    text-sm text-secondaryText
                                `}>
                                    Email address
                                </label>
                                <input
                                    type='email'
                                    id='email'
                                    name='email'
                                    placeholder='Enter your email...'
                                    value={formData.email}
                                    onChange={handleChange}
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
                            {mode !== 'forgot-password' && (
                                <div className={`
                                    w-full
                                `}>
                                    <label htmlFor='password' className={`
                                        block
                                        text-sm text-secondaryText
                                    `}>
                                        Password
                                    </label>
                                    <input
                                        type='password'
                                        id='password'
                                        name='password'
                                        placeholder='Enter a password...'
                                        minLength={6}
                                        value={formData.password}
                                        onChange={handleChange}
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
                                    {mode === 'sign-in' && (
                                        <button
                                            type='button'
                                            onClick={() => {
                                                setMode('forgot-password')
                                                setMessage(null)
                                                router.push('/auth/forgot-password')
                                            }}
                                            className={`
                                                mt-2
                                                text-sm text-accentText
                                                hover:text-primaryButtonHover
                                                hover:cursor-pointer
                                            `}
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
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
                                {loading 
                                    ? 'Loading...' 
                                    : mode === 'sign-in' 
                                        ? 'Sign In' 
                                        : mode === 'forgot-password'
                                            ? 'Send Reset Email'
                                            : 'Sign Up'}
                            </button>
                    </form>
                    {mode !== 'forgot-password' && (
                        <div className={`
                            w-full
                            mt-4
                            flex flex-wrap justify-center items-center gap-2
                        `}>
                            <p className={`
                                text-secondaryText
                            `}>
                                {mode === 'sign-in' ? `Don't have an account?` : `Already have an account?`}
                            </p>
                            <button onClick={() => {
                                const newMode = mode === 'sign-in' ? 'sign-up' : 'sign-in'
                                setMode(newMode)
                                setMessage(null)
                                router.push(`/auth/${newMode}`)
                            }} className={`
                                text-accentText
                                hover:cursor-pointer
                                hover:text-primaryButtonHover
                            `}>
                                {mode === 'sign-in' ? `Sign up` : `Log in`}
                            </button>
                        </div>
                    )}
                    {mode === 'forgot-password' && (
                        <div className={`
                            w-full
                            mt-4
                            flex flex-wrap justify-center items-center gap-2
                        `}>
                            <p className={`
                                text-secondaryText
                            `}>
                                Remember your password?
                            </p>
                            <button onClick={() => {
                                setMode('sign-in')
                                setMessage(null)
                                router.push('/auth/sign-in')
                            }} className={`
                                text-accentText
                                hover:cursor-pointer
                                hover:text-primaryButtonHover
                            `}>
                                Back to sign in
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}