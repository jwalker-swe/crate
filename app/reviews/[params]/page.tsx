

import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server"
import { ReviewPageParams } from "@/types/spotify";


export default async function Home({ params }: ReviewPageParams) {

    const searchMethod = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    //fetch reviews
    
    //sort reviews
    //display reviews

    return (
        <div
            className={`
                w-full max-w-[1200px] h-fit
                mx-auto py-4 px-4
                lg:w-[1200px] lg:px-0
            `}
        >
            <header>
                <NavBar session={ user ? true : false } />
            </header>
            <main>
                
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}
