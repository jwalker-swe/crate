'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp, SignInData, SignUpData} from '@/lib/supabase/auth';

interface AuthFormProps {
   defaultMode: 'signIn' | 'signUp';
}

export default function AuthForm({ defaultMode = 'signIn' }: AuthFormProps) {

    const [mode, setMode] = useState<'signIn' | 'signUp'>(defaultMode);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        displayName: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()

    const handleSubmit = async function(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            let result

            if ( mode === 'signIn' ) {
                const signinData: SignInData = {
                    email: formData.email,
                    password: formData.password
                }
                result =  await signIn(signinData)
            } else {
                const signupData: SignUpData = {
                    email: formData.email,
                    password: formData.password,
                    username: formData.username,
                    displayName: formData.displayName
                }
                result = await signUp(signupData)
            }

            if (result.success) {
                if (mode === 'signIn') {
                    router.push('/dashboard') /* Change dashboard to profile page */
                } else {
                    setMessage('Account created! Check your email to verify your account.')
                }
            } else {
                setMessage(result.error || 'An error occurred')
            }
        } catch (error) {
            setMessage('An unexpected error occured')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = function(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    switch (mode) {
        case 'signIn':
            return (
                <div className={`
                    //General Styling
                    content-container
                    w-[1200px] h-screen
                    mx-auto py-4
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <section className={`
                        //General Styling
                        w-full h-full
                        flex justify-center items-center 
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <div className={`
                            //General Styling
                            py-8 px-32
                            bg-secondaryBackground
                            rounded-lg
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            <h1 className={`
                                //General Styling
                                text-4xl text-center
                                font-bold
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Sign In
                            </h1>

                            <form onSubmit={handleSubmit} className={`
                                //General Styling
                                flex flex-col justify-center items-start
                                mt-8 space-y-2
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                <div className={`
                                    //General Styling
                                    w-full
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    <label htmlFor='email' className={`
                                        //General Styling
                                        text-sm text-secondaryText
                                        //Mobile Styling
                                        //Desktop Styling
                                    `}>
                                        Email
                                    </label>
                                    <input 
                                        type='email'
                                        id='email'
                                        name='email'
                                        placeholder='Enter your email address...'
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className={`
                                            //General Styling
                                            w-full
                                            p-2
                                            text-sm
                                            rounded-sm
                                            bg-primaryBackground
                                            focus:outline-none
                                            //Mobile Styling
                                            //Desktop Styling
                                        `}
                                    />
                                </div>
                                <div className={`
                                    //General Styling
                                    w-full
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    <label htmlFor='password' className={`
                                        //General Styling
                                        text-sm text-secondaryText
                                        //Mobile Styling
                                        //Desktop Styling
                                    `}>
                                        Password
                                    </label>
                                    <input 
                                        type='password'
                                        id='password'
                                        name='password'
                                        placeholder='Enter your password...'
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className={`
                                            //General Styling
                                            w-full
                                            p-2
                                            text-sm
                                            rounded-sm
                                            bg-primaryBackground
                                            focus:outline-none
                                            //Mobile Styling
                                            //Desktop Styling
                                        `}
                                    />
                                    <button type='submit' disabled={loading} className={`
                                    //General Styling
                                    w-full
                                    mt-8 p-2
                                    rounded-sm
                                    bg-accentText
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    Sign Up
                                </button>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            )
        
        case 'signUp':
            return (
                <div className={`
                    //General Styling
                    content-container
                    w-[1200px] h-screen
                    mx-auto py-4
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <section className={`
                        //General Styling
                        w-full h-full
                        flex justify-center items-center 
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <div className={`
                            //General Styling
                            py-8 px-32
                            bg-secondaryBackground
                            rounded-lg
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            <h1 className={`
                                //General Styling
                                text-4xl text-center
                                font-bold
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                Join Crate
                            </h1>

                            <form onSubmit={handleSubmit} className={`
                                //General Styling
                                flex flex-col justify-center items-start
                                mt-8 space-y-2
                                //Mobile Styling
                                //Desktop Styling
                            `}>
                                <div className={`
                                    //General Styling
                                    w-full
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    <label htmlFor='username' className={`
                                        //General Styling
                                        text-sm text-secondaryText
                                        //Mobile Styling
                                        //Desktop Styling
                                    `}>
                                        Username
                                    </label>
                                    <input 
                                        type='text'
                                        id='username'
                                        name='username'
                                        placeholder='Enter a username...'
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        pattern='[a-zA-Z0-9_]+'
                                        title='Username can only contain letters, number, and underscores'
                                        className={`
                                            //General Styling
                                            w-full
                                            p-2
                                            text-sm
                                            rounded-sm
                                            bg-primaryBackground
                                            focus:outline-none
                                            //Mobile Styling
                                            //Desktop Styling
                                        `}
                                    />
                                </div>
                                <div className={`
                                    //General Styling
                                    w-full
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    <label htmlFor='email' className={`
                                        //General Styling
                                        text-sm text-secondaryText
                                        //Mobile Styling
                                        //Desktop Styling
                                    `}>
                                        Email
                                    </label>
                                    <input 
                                        type='email'
                                        id='email'
                                        name='email'
                                        placeholder='Enter your email address...'
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className={`
                                            //General Styling
                                            w-full
                                            p-2
                                            text-sm
                                            rounded-sm
                                            bg-primaryBackground
                                            focus:outline-none
                                            //Mobile Styling
                                            //Desktop Styling
                                        `}
                                    />
                                </div>
                                <div className={`
                                    //General Styling
                                    w-full
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    <label htmlFor='password' className={`
                                        //General Styling
                                        text-sm text-secondaryText
                                        //Mobile Styling
                                        //Desktop Styling
                                    `}>
                                        Password
                                    </label>
                                    <input 
                                        type='password'
                                        id='password'
                                        name='password'
                                        placeholder='Enter your password...'
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className={`
                                            //General Styling
                                            w-full
                                            p-2
                                            text-sm
                                            rounded-sm
                                            bg-primaryBackground
                                            focus:outline-none
                                            //Mobile Styling
                                            //Desktop Styling
                                        `}
                                    />
                                </div>
                                <button type='submit' disabled={loading} className={`
                                    //General Styling
                                    w-full
                                    mt-8 p-2
                                    rounded-sm
                                    bg-accentText
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    Sign Up
                                </button>
                                {/* <div className={`
                                    //General Styling
                                    w-full
                                    //Mobile Styling
                                    //Desktop Styling
                                `}>
                                    <label htmlFor='displayName' className={`
                                        //General Styling
                                        text-sm text-secondaryText
                                        //Mobile Styling
                                        //Desktop Styling
                                    `}>
                                        Display Name (Optional)
                                    </label>
                                    <input 
                                        type='text'
                                        id='displayName'
                                        name='displayName'
                                        placeholder='Enter a dispay name...'
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        required
                                        className={`
                                            //General Styling
                                            w-full
                                            p-2
                                            text-sm
                                            rounded-sm
                                            bg-primaryBackground
                                            focus:outline-none
                                            //Mobile Styling
                                            //Desktop Styling
                                        `}
                                    />
                                </div> */}
                            </form>
                        </div>
                    </section>
                </div>
            )
    }
}