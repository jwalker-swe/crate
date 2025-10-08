import getTopAlbums from '@/lib/spotify/getTopAlbums';
import AlbumPreview from './AlbumPreview';

export default async function TopAlbumsSection() {
  const recentTopAlbums: any = await getTopAlbums();

  let albums = recentTopAlbums.map((item: any) => ({
    title: item.album.name,
    artist: item.album.artists[0].name,
    id: item.album.id,
    images: item.album.images[0].url
  }));

  return (
    <ul className={`
      //General Styling
      w-[1200px]
      grid grid-cols-[224px_224px_224px_224px_224px] gap-5 grid-rows-1
      mx-auto items-center justify-center
      //Mobile Styling
      //Desktop Styling
    `}>
      {albums.slice(0, 5).map((album: any, index: number) => (
        <AlbumPreview
          key={album.id || index}
          coverHeight={224}
          id={album.id}
          name={album.title}
          artist={album.artist}
          imageUrl={album.images}
        />
      ))}
    </ul>
  );
}