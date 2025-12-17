

import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server"
import { ReviewPageParams } from "@/types/spotify";


export default async function Home({ params }: ReviewPageParams) {

    const searchMethod = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch user data for NavBar
    let userData = null;
    if (user) {
        const { data } = await supabase
            .from('users')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();
        userData = data;
    }

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
                <NavBar 
                    session={ user ? true : false } 
                    initialUsername={userData?.username || null}
                    initialAvatarUrl={userData?.avatar_url || null}
                    initialUserId={user?.id || null}
                />
            </header>
            <main>
                
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}
