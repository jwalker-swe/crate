import { StarIcon, HeartIcon, ListBulletIcon, QueueListIcon } from "@heroicons/react/24/solid";

export default function DisplayAlbumStats( { id, rating }: {id: any, rating: number}) {

    //Get stats from database by the album id

    //Create html element
    return (
        <div className={`
            //General Styling
            flex justify-start items-center
            mt-4
            //Mobile Styling
            //Desktop Styling
        `}>
            <div className={`
                //General Styling
                flex justify-center items-center gap-1
                //Mobile Styling
                //Desktop Styling
            `}>
                <span className={`
                    //General Styling
                    h-7
                    text-secondaryText text-[20px]
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    {rating ? rating.toFixed(1).toString() : 'N/A'}
                </span>
                <div className={`
                    star-container
                    h-7
                    flex justify-center items-center
                `}>
                    <StarIcon width={16} height={16} className={`
                        text-secondaryText
                    `}/>
                    <StarIcon width={16} height={16} className={`
                        text-secondaryText
                    `}/>
                    <StarIcon width={16} height={16} className={`
                        text-secondaryText
                    `}/>
                    <StarIcon width={16} height={16} className={`
                        text-secondaryText
                    `}/>
                    <StarIcon width={16} height={16} className={`
                        text-secondaryText
                    `}/>
                </div>
                <div className={`
                    //General Styling
                    relative
                    //Mobile Styling
                    //Desktop Styling
                `}>
                </div>
            </div>

        </div>
    );
}