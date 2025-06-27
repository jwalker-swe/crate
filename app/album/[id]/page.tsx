//import page dependencies
import Image from "next/image";
import Link from "next/link";
import { notFound } from 'next/navigation';
import { StarIcon } from "@heroicons/react/24/solid";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { use } from 'react';
import getAlbumById from "@/lib/spotify/getAlbumById";
import { AlbumPageParams, AlbumType } from "@/types/spotify";


export default async function Home({ params }: AlbumPageParams) {

    // Retrieve album id from url params
    const { id } = await params;

    //Fetch album data based on album id
    let albumData = await getAlbumById(id);
    console.log(albumData);

    

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