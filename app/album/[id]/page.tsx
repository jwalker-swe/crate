//import page dependencies
import Image from "next/image";
import Link from "next/link";
import { notFound } from 'next/navigation';
import { StarIcon } from "@heroicons/react/24/solid";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { use } from 'react';


export default async function Home() {

    return (
        <div className={`
            //General Styling
            content-container
            w-[1200px] h-fit
            mx-auto py-4
            //Mobile Styling
            //Desktop Styling
        `}>
            <NavBar />
            <Footer />
        </div>
    )
}