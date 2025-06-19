import Link from "next/link"
import { ArrowRightIcon } from "@heroicons/react/24/solid"

export default function ViewAll() {
    return (
        <div className={`
            //General Styling
            //Mobile Styling
            //Desktop Styling
        `}>
            <Link href='#' className={`
                //General Styling
                flex justify-between items-center gap-2
                text-accentText
                transition-colors duration-200 ease-in-out hover:text-primaryText
                //Mobile Styling
                //Desktop Styling
            `}>
                <span className={`
                    //General Styling
                    //Mobile Styling
                    //Desktop Styling
                `}>
                    View All
                </span>
                <ArrowRightIcon width={16} height={16} className={`
                //General Styling
                //Mobile Styling
                //Desktop Styling
              `} />
            </Link>
        </div>
    )
}