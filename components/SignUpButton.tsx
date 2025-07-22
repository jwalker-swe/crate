'use client'

import { useRouter } from "next/navigation"
import { Router } from "next/router"

export default function SignUpButton({ mode, width, height }: {mode: 'sign-in' | 'sign-up', width: number, height: number}) {

        const buttonWidth: number = width
        const buttonHeight: number = height
        const buttonMode: string =  mode

        const router = useRouter();

    return (    

        <button onClick={() => {
            router.push(`/auth/${mode}`)
        }} className={`
            //General Styling
            text-lg text-primaryText font-medium hover:text-primaryTextHover
            my-6 px-${width} py-${height}
            rounded-xl
            bg-primaryButton hover:bg-primaryButtonHover
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