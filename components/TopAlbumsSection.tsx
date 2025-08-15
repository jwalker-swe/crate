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
      <AlbumPreview coverHeight={224} id={albums[0].id} name={albums[0].title} artist={albums[0].artist} imageUrl={albums[0].images} />
      <AlbumPreview coverHeight={224} id={albums[1].id} name={albums[1].title} artist={albums[1].artist} imageUrl={albums[1].images} />
      <AlbumPreview coverHeight={224} id={albums[2].id} name={albums[2].title} artist={albums[2].artist} imageUrl={albums[2].images} />
      <AlbumPreview coverHeight={224} id={albums[3].id} name={albums[3].title} artist={albums[3].artist} imageUrl={albums[3].images} />
      <AlbumPreview coverHeight={224} id={albums[4].id} name={albums[4].title} artist={albums[4].artist} imageUrl={albums[4].images} />
    </ul>
  );
}