'use client'

import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { validateUsername, sanitizeUsernameInput } from '@/lib/validation/usernameValidation'
import checkUsernameAvailabilityClient from '@/lib/supabase/checkUsernameAvailabilityClient'

export default function Auth() {
    const supabase = createClient()

    const params = useParams()
    const param = params?.param

    const [mode, setMode] = useState(`${param}`)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [resetEmailSent, setResetEmailSent] = useState(false)
    const [resetError, setResetError] = useState<string | null>(null)
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
            // Validate username
            const usernameValidation = validateUsername(formData.username)
            if (!usernameValidation.valid) {
                setMessage({ type: 'error', text: usernameValidation.error || 'Invalid username' })
                setLoading(false)
                return
            }

            // Check if username is available
            const isAvailable = await checkUsernameAvailabilityClient(formData.username)
            if (!isAvailable) {
                setMessage({ type: 'error', text: 'This username is already taken. Please choose another one.' })
                setLoading(false)
                return
            }

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
                    // Check if error is about email already being registered
                    const errorMessage = error.message?.toLowerCase() || '';
                    if (
                        errorMessage.includes('already registered') ||
                        errorMessage.includes('email already') ||
                        errorMessage.includes('user already exists') ||
                        errorMessage.includes('email address is already') ||
                        error.code === 'signup_disabled' ||
                        error.status === 422
                    ) {
                        setMessage({ 
                            type: 'error', 
                            text: 'This email is already registered. Please sign in instead or use a different email address.' 
                        });
                    } else {
                        setMessage({ type: 'error', text: error.message || 'An error occurred while trying to sign up.' });
                    }
                    setLoading(false);
                    return;
                }

                // Only navigate if there's no error and we have data
                if (data && !error) {
                    router.push(`/auth/sign-in`)
                }
            } catch (error: any) {
                setMessage({ type: 'error', text: error.message || 'An unexpected error occurred while trying to sign up.' })
                setLoading(false)
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
        
        // Sanitize username input in real-time
        if (name === 'username') {
            const sanitized = sanitizeUsernameInput(value)
            setFormData(prev => ({
                ...prev,
                [name]: sanitized
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleForgotPassword = async function(e: React.FormEvent) {
        e.preventDefault()
        setResetError(null)
        setLoading(true)

        if (!formData.email) {
            setResetError('Please enter your email address')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (error) {
                setResetError(error.message)
                setLoading(false)
            } else {
                setResetEmailSent(true)
                setLoading(false)
            }
        } catch (error) {
            console.error('Error sending password reset email:', error)
            setResetError('An error occurred. Please try again.')
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
                        {showForgotPassword ? 'Reset your password' :
                         mode === 'sign-in' ? 'Log in to your account' : 
                         mode === 'forgot-password' ? 'Reset your password' : 
                         'Sign up for an account'}
                    </h1>
                    {showForgotPassword && (
                        <p className={`
                            text-sm text-secondaryText
                            text-center
                            mt-2
                        `}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    )}
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
                                    {showForgotPassword ? 'Email address for password reset' : 'Email address'}
                                </label>
                                <input
                                    type='email'
                                    id='email'
                                    name='email'
                                    placeholder={showForgotPassword ? 'Enter the email associated with your account...' : 'Enter your email...'}
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
                            {mode !== 'forgot-password' && !showForgotPassword && (
                                <div className={`
                                    w-full
                                `}>
                                    <div className={`
                                        flex justify-between items-center
                                        mb-1
                                    `}>
                                        <label htmlFor='password' className={`
                                            block
                                            text-sm text-secondaryText
                                        `}>
                                            Password
                                        </label>
                                        {mode === 'sign-in' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowForgotPassword(true)
                                                    setResetEmailSent(false)
                                                    setResetError(null)
                                                }}
                                                className={`
                                                    text-xs text-accentText
                                                    hover:text-primaryButtonHover
                                                    transition-colors
                                                `}
                                            >
                                                Forgot password?
                                            </button>
                                        )}
                                    </div>
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
                                </div>
                            )}
                            {showForgotPassword ? (
                                <>
                                    {resetEmailSent ? (
                                        <div className={`
                                            w-full
                                            mt-4 p-4
                                            bg-accentText/10
                                            border border-accentText/30
                                            rounded-sm
                                        `}>
                                            <p className={`
                                                text-sm text-primaryText
                                                text-center
                                                font-medium
                                            `}>
                                                Password reset email sent!
                                            </p>
                                            <p className={`
                                                text-xs text-secondaryText
                                                text-center
                                                mt-2
                                            `}>
                                                Check your inbox and follow the instructions to reset your password. The link will expire in 1 hour.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowForgotPassword(false)
                                                    setResetEmailSent(false)
                                                    setFormData(prev => ({ ...prev, email: '' }))
                                                }}
                                                className={`
                                                    w-full
                                                    mt-4 p-2
                                                    text-sm
                                                    text-center
                                                    bg-secondaryBackground
                                                    rounded-sm
                                                    hover:bg-tertiaryBackground
                                                    transition-colors
                                                `}
                                            >
                                                Back to Sign In
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`
                                                w-full
                                                mt-2
                                                p-3
                                                bg-accentText/5
                                                border border-accentText/20
                                                rounded-sm
                                            `}>
                                                <p className={`
                                                    text-xs text-secondaryText
                                                    text-center
                                                `}>
                                                    We'll send a password reset link to the email address you enter below.
                                                </p>
                                            </div>
                                            <button 
                                                type='button'
                                                onClick={handleForgotPassword}
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
                                                {loading ? 'Sending reset email...' : 'Send Password Reset Email'}
                                            </button>
                                            {resetError && (
                                                <p className={`
                                                    mt-2
                                                    text-sm text-red-500
                                                    text-center
                                                `}>
                                                    {resetError}
                                                </p>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowForgotPassword(false)
                                                    setResetError(null)
                                                }}
                                                className={`
                                                    w-full
                                                    mt-2 p-2
                                                    text-sm
                                                    text-center
                                                    text-secondaryText
                                                    hover:text-primaryText
                                                    transition-colors
                                                `}
                                            >
                                                Cancel - Back to Sign In
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
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
                            )}
                    </form>
                    {mode !== 'forgot-password' && !showForgotPassword && (
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