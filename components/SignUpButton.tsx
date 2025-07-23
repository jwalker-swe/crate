'use client'

import { useRouter } from "next/navigation"
import { Router } from "next/router"

export default function SignUpButton({ mode}: {mode: 'sign-in' | 'sign-up' }) {

        // const buttonWidth: number = width
        // const buttonHeight: number = height
        const buttonMode: string =  mode

        const router = useRouter();

    return (    

        <button onClick={() => {
            router.push(`/auth/${mode}`)
        }} className={`
            //General Styling
            text-lg text-primaryText font-medium hover:text-primaryTextHover
            my-6 px-5 py-3
            rounded-xl
            bg-primaryButton hover:bg-primaryButtonHover
            cursor-pointer
            transition-colors
            ease-in-out
            duration-200
            //Mobile Styling
            //Desktop Styling
        `}>
            Start your journey for free
        </button>

    )

    // x-5, y-3
}