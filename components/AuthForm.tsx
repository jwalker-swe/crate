'use client'

import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/supabase'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Auth() {
    const params = useParams()
    const param = params?.param

    const [mode, setMode] = useState(`${param}`)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        displayName: ''
    })

    const router = useRouter()

    const handleSubmit = async function(e: React.FormEvent) {
        // Prevent page reload
        e.preventDefault();

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

                if (data) {
                    router.push(`/auth/sign-in`)
                }
            } catch (error) {
                console.error('An error occurred while trying to sign up.', error)
            }
        }

        //Handle form submission if signing in
        if (mode === 'sign-in') {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                })

                if (data) {
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
            } catch (error) {
                console.error('An unexpected error occurred while trying to sign in.', error)
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
            w-[1200px] h-screen
            mx-auto py-4
            bg-primaryBackground
        `}>
            <section className={`
                w-full h-full
                flex justify-center items-center
                px-16 py-8
            `}>
                <div className={`
                    w-2xl
                    px-32 pt-8 pb-14
                    bg-secondaryBackground
                    rounded-lg
                `}>
                    <Link href='/' className={`hover:cursor-pointer`}>
                        <Image src={'/images/crate-logo-cropped.png'} alt='crate logo'
                            width={220} height={25} className={`
                                mx-auto p-4
                            `}
                        />
                    </Link>
                    <h1 className={`
                        text-3xl text-center
                    `}>
                        {mode === 'sign-in' ? 'Log in to your account' : 'Sign up for an account'}
                    </h1>
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
                            </div>
                            <button type='submit' className={`
                                w-full
                                mt-4 p-3
                                text-center
                                bg-accentText
                                rounded-sm
                                hover:cursor-pointer
                                hover:bg-primaryButtonHover
                                hover:text-primaryTextHover
                            `}>
                                {mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
                            </button>
                    </form>
                    <div className={`
                        w-full
                        mt-4
                        flex justify-center items-center gap-2
                    `}>
                        <p className={`
                            text-secondaryText
                        `}>
                            {mode === 'sign-in' ? `Don't have an account?` : `Already have an account?`}
                        </p>
                        <button onClick={() => {
                            setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
                        }} className={`
                            text-accentText
                            hover:cursor-pointer
                            hover:text-primaryButtonHover
                        `}>
                            {mode === 'sign-in' ? `Sign up` : `Log in`}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}