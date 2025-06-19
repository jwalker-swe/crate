type SectionTitleProps = {
    title: string
}

export default function SectionTitle({ title }: SectionTitleProps) {
    return (
        <div className={`
            //General Styling
            flex justify-start items-center gap-2
            //Mobile Styling
            //Desktop Styling
        `}>
            <span className={`
                //General Styling
                text-xl text-accentText font-bold
                //Mobile Styling
                //Desktop Styling
            `}>
                |
            </span>
            <h3 className={`
                //General Styling
                text-xl text-secondaryText font-sans
                //Mobile Styling
                //Desktop Styling
            `}>
                {title}
            </h3>
        </div>
    ) 
}