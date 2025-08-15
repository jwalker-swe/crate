export default function TopAlbumsLoading() {
  return (
    <div className={`
      //General Styling
      w-[1200px]
      grid grid-cols-[224px_224px_224px_224px_224px] gap-5 grid-rows-1
      mx-auto items-center justify-center
      //Mobile Styling
      //Desktop Styling
    `}>
      <div className="w-[224px] h-[300px] bg-secondaryBackground animate-pulse rounded-lg"></div>
      <div className="w-[224px] h-[300px] bg-secondaryBackground animate-pulse rounded-lg"></div>
      <div className="w-[224px] h-[300px] bg-secondaryBackground animate-pulse rounded-lg"></div>
      <div className="w-[224px] h-[300px] bg-secondaryBackground animate-pulse rounded-lg"></div>
      <div className="w-[224px] h-[300px] bg-secondaryBackground animate-pulse rounded-lg"></div>
    </div>
  );
}