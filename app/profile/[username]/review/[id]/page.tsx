
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { createClient } from "@/lib/supabase/server";
import { ReviewPageParams } from "@/types/spotify";
import getSelectedReview from "@/lib/supabase/getSelectedReview";

export default async function Home({ params }: ReviewPageParams) {

    const urlParams = await params;
	console.log('Params: ', urlParams);
	
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    //fetch reviews
	const review_data = await getSelectedReview(urlParams.id, urlParams.username);
	console.log("Review Data: ", review_data);
    
    //sort reviews
    //display reviews

    return (
        <div
            className={`
                w-[1200px] h-fit
                mx-auto py-4
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

