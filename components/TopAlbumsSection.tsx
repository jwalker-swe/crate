import getTopAlbums from '@/lib/spotify/getTopAlbums';
import AlbumPreview from './AlbumPreview';

export default async function TopAlbumsSection() {
  const recentTopAlbums: any = await getTopAlbums();

  // Handle case where getTopAlbums returns null or undefined
  if (!recentTopAlbums || !Array.isArray(recentTopAlbums)) {
    return (
      <div className={`
        //General Styling
        w-full max-w-[1200px]
        flex justify-center items-center
        text-secondaryText
        py-8 px-4
        lg:w-[1200px] lg:px-0
      `}>
        No albums available at the moment.
      </div>
    );
  }

  let albums = recentTopAlbums.map((item: any) => ({
    title: item.album.name,
    artist: item.album.artists[0].name,
    id: item.album.id,
    images: item.album.images[0].url
  }));

  return (
    <ul className={`
      //General Styling
      w-full max-w-[1200px]
      grid grid-cols-2 gap-4
      mx-auto items-center justify-center
      px-4
      sm:grid-cols-3 sm:gap-5
      md:grid-cols-4
      lg:w-[1200px] lg:grid-cols-[224px_224px_224px_224px_224px] lg:px-0
    `}>
      {albums.slice(0, 5).map((album: any, index: number) => {
        // Ensure even distribution and never show odd number when multiple rows:
        // - Mobile (2 cols): Show 4 albums (2 rows of 2 each, even) - hide 5th (would be 3 rows: 2+2+1, odd)
        // - Small (3 cols): Show 3 albums (1 row only, odd is fine) - hide 4th and 5th
        // - Medium (4 cols): Show 4 albums (1 row only, even) - hide 5th (would be 2 rows: 4+1, odd)
        // - Large (5 cols): Show all 5 albums (1 row only, odd is fine)
        let hideClasses = '';
        if (index === 3) {
          // Hide 4th album on small screens (3 cols) to keep 1 row of 3
          // Show on mobile (2 cols), medium (4 cols), and large (5 cols)
          hideClasses = 'block sm:hidden md:block';
        } else if (index === 4) {
          // Hide 5th album on mobile (2 cols) - would create 3 rows with odd total (2+2+1)
          // Hide 5th album on small (3 cols) - would create 2 rows with odd total (3+2)
          // Hide 5th album on medium (4 cols) - would create 2 rows with odd total (4+1)
          // Show on large (5 cols) - only 1 row, so odd is fine
          hideClasses = 'hidden lg:block';
        }
        
        return (
          <li 
            key={album.id || index}
            className={hideClasses}
          >
        <AlbumPreview
          coverHeight={224}
          id={album.id}
          name={album.title}
          artist={album.artist}
          imageUrl={album.images}
        />
          </li>
        );
      })}
    </ul>
  );
}