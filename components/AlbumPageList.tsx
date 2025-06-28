import { HeartIcon, UserCircleIcon } from "@heroicons/react/24/solid";

export default function AlbumPageList() {
    return (
        <div className={`
            //General Styling
            flex justify-start items-center gap-4
            p-4
            bg-secondaryBackground
            rounded-xl
            //Mobile Styling
            //Desktop Styling
        `}>
            <div className={`
                list-thumbnail-container
                //General Styling
                w-36 h-full
                bg-white
                rounded-lg
                //Mobile Styling
                //Desktop Styling
            `}>
            </div>
            <div className={`
                list-info-container
                //General Styling
                flex-grow-1
                h-full
                flex flex-col justify-start items-start
                //Mobile Styling
                //Desktop Styling
            `}>
                <h3 className={`
                    list-title
                    //General Styling
                    text-lg text-primaryText font-sans font-bold
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    Favorite Albums 2025
                </h3>
                <div className={`
                    post-info-container
                    //General Styling
                    w-full
                    flex justify-start items-center gap-2
                    mb-3
                    text-xs text-secondaryText font-sans 
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <div className={`
                        user-info-container
                        //General Styling
                        flex justify-center items-center gap-1
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <div className={`
                            user-profile-image
                            w-4 h-4
                            rounded-full
                            bg-white
                        `}>
                            <UserCircleIcon width={16} height={16} className={`
                                text-secondaryText
                            `}/>
                        </div>
                        <span className={`
                            user-name
                            //General Styling
                            text-xs text-secondaryText font-sans 
                            //Mobile Styling
                            //Desktop Styling
                        `}>
                            @john_doe
                        </span>
                    </div>
                    <div className={`
                        list-stats
                        //General Styling
                        flex justify-center items-center gap-2
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        <span className={`
                            list-album-count
                        `}>
                            15 Albums
                        </span>
                        <div className={`
                            list-total-likes
                            flex justify-center items-center gap-[2px]
                        `}>
                            <HeartIcon width={16} height={16} className={`
                                text-secondaryText
                            `} />
                            <span>
                                34k
                            </span>
                        </div>
                    </div>
                </div>
                <p className={`
                    list-description
                    //General Styling
                    max-w-64
                    line-clamp-3
                    text-xs
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    I asked reddit whats one movie everyone should watch at least once in their lifetime to create a list of movies that everyone should watch. 

                    Link to thread:
                    www.reddit.com/r/movies/comments/178uqki/whats_a_movie_you_think_everyone_has_to_watch_at/

                    Feel free to comment your progress on the list or any movies you think should be added or maybe even removed. Thanks.
                </p>
            </div>
        </div>
    )
}