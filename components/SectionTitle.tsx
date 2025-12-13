type SectionTitleProps = {
    title: string
}

export default function SectionTitle({ title }: SectionTitleProps) {
    return (
        <div className="flex justify-start items-center gap-3">
            <div className="h-6 w-1 bg-gradient-to-b from-accentText to-transparent rounded-full"></div>
            <h3 className="text-2xl md:text-3xl font-bold text-primaryText tracking-tight">
                {title}
            </h3>
        </div>
    ) 
}