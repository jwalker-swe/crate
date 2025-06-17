import { StarIcon, UserGroupIcon, ArrowTrendingUpIcon, MusicalNoteIcon, HeartIcon, ListBulletIcon } from "@heroicons/react/24/outline";

type FeatureDescriptionTypes = {
    featureName: string
}

export default function FeatureDescription({ featureName }: FeatureDescriptionTypes ) {

    if ( featureName === 'track' ) {
        return (
            <div className={`
                flex flex-col items-start justify-center
                p-8
                rounded-2xl
                bg-secondaryBackground
            `}>
                <div className={`
                    p-4 mb-4
                    rounded-lg
                    bg-accentText
                `}>
                    <StarIcon width={24} height={24}/>
                </div>
                <span className={`
                    //General Styling
                    text-xl font-sans
                    mb-3
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Track & Rate Albums
                </span>
                <p className={`
                    //General Styling
                    text-secondaryText
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Log every album you listen to and rate them on a 5-star scale. Build your personal music database and track your listening habits over time.
                </p>
            </div>
        )
    }

    if ( featureName === 'connect' ) {
        return (
            <div className={`
                flex flex-col items-start justify-center
                p-8
                rounded-2xl
                bg-secondaryBackground
            `}>
                <div className={`
                    p-4 mb-4
                    rounded-lg
                    bg-accentText
                `}>
                    <UserGroupIcon width={24} height={24}/>
                </div>
                <span className={`
                    //General Styling
                    text-xl font-sans
                    mb-3
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Connect & Follow
                </span>
                <p className={`
                    //General Styling
                    text-secondaryText
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Follow friends and discover new music through their activity. See what others are listening to and get personalized recommendations.
                </p>
            </div>
        )
    }

    if ( featureName === 'lists' ) {
        return (
            <div className={`
                flex flex-col items-start justify-center
                p-8
                rounded-2xl
                bg-secondaryBackground
            `}>
                <div className={`
                    p-4 mb-4
                    rounded-lg
                    bg-accentText
                `}>
                    <ListBulletIcon width={24} height={24}/>
                </div>
                <span className={`
                    //General Styling
                    text-xl font-sans
                    mb-3
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Create Lists
                </span>
                <p className={`
                    //General Styling
                    text-secondaryText
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Curate themed playlists and share your favorite albums. From "Best of 2024" to "Rainy Day Vibes" - organize your music your way.
                </p>
            </div>
        )
    }

    if ( featureName === 'insights' ) {
        return (
            <div className={`
                flex flex-col items-start justify-center
                p-8
                rounded-2xl
                bg-secondaryBackground
            `}>
                <div className={`
                    p-4 mb-4
                    rounded-lg
                    bg-accentText
                `}>
                    <ArrowTrendingUpIcon width={24} height={24}/>
                </div>
                <span className={`
                    //General Styling
                    text-xl font-sans
                    mb-3
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Music Insights
                </span>
                <p className={`
                    //General Styling
                    text-secondaryText
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Get detailed statistics about your listening habits. Discover your most-played genres, favorite artists, and music trends.
                </p>
            </div>
        )
    }

    if ( featureName === 'reviews' ) {
        return (
            <div className={`
                flex flex-col items-start justify-center
                p-8
                rounded-2xl
                bg-secondaryBackground
            `}>
                <div className={`
                    p-4 mb-4
                    rounded-lg
                    bg-accentText
                `}>
                    <MusicalNoteIcon width={24} height={24}/>
                </div>
                <span className={`
                    //General Styling
                    text-xl font-sans
                    mb-3
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Write Reviews
                </span>
                <p className={`
                    //General Styling
                    text-secondaryText
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Share your thoughts and deep-dive into albums with detailed reviews. Help others discover great music through your insights.
                </p>
            </div>
        )
    }

    if ( featureName === 'favorites' ) {
        return (
            <div className={`
                flex flex-col items-start justify-center
                p-8
                rounded-2xl
                bg-secondaryBackground
            `}>
                <div className={`
                    p-4 mb-4
                    rounded-lg
                    bg-accentText
                `}>
                    <HeartIcon width={24} height={24}/>
                </div>
                <span className={`
                    //General Styling
                    text-xl font-sans
                    mb-3
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Showcase Favorites
                </span>
                <p className={`
                    //General Styling
                    text-secondaryText
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Highlight your all-time favorite albums on your profile. Let others know what music defines you and discover shared tastes.
                </p>
            </div>
        )
    }
}