

type AlbumPageInfoNavigationProps = {
    currentState: string
}

export default async function AlbumPageInfoNavigation({currentState}: AlbumPageInfoNavigationProps) {

    if ( currentState === 'Track List' ) {
    
        return (
            <div>
                <ul className={`
                    //General Styling
                    flex justify-start items-center gap-6
                    text-secondaryText
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <li className={`
                        //General Styling
                        text-xl text-accentText
                        border-b-1
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Track List
                    </li>
                    <li className={`
                        //General Styling
                        text-xl
                        border-b-1
                        hover:cursor-pointer
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Performed By
                    </li>
                    <li className={`
                        //General Styling
                        text-xl
                        border-b-1
                        hover:cursor-pointer
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Producers
                    </li>
                </ul>
            </div>
        )
    }

    if ( currentState === 'Performed By' ) {
    
        return (
            <div>
                <ul className={`
                    //General Styling
                    flex justify-start items-center gap-6
                    text-secondaryText
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <li className={`
                        //General Styling
                        text-xl
                        border-b-1
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Track List
                    </li>
                    <li className={`
                        //General Styling
                        text-xl text-accentText
                        border-b-1
                        hover:cursor-pointer
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Performed By
                    </li>
                    <li className={`
                        //General Styling
                        text-xl
                        border-b-1
                        hover:cursor-pointer
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Producers
                    </li>
                </ul>
            </div>
        )
    }

    if ( currentState === 'Performed By' ) {
    
        return (
            <div>
                <ul className={`
                    //General Styling
                    flex justify-start items-center gap-6
                    text-secondaryText
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    <li className={`
                        //General Styling
                        text-xl
                        border-b-1
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Track List
                    </li>
                    <li className={`
                        //General Styling
                        text-xl
                        border-b-1
                        hover:cursor-pointer
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Performed By
                    </li>
                    <li className={`
                        //General Styling
                        text-xl text-accentText
                        border-b-1
                        hover:cursor-pointer
                        //Mobile Styling
                        //Desktop Styling
                    `}>
                        Producers
                    </li>
                </ul>
            </div>
        )
    }
}