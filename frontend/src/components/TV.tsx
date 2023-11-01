export default function TV({ contentUrl }: { contentUrl: string }) {
  return (
    <div className="relative w-full aspect-[1299/864] overflow-hidden pt-[5%] pr-[16%] pb-[20%]">
      <img src="/tv.png" className="absolute top-0 w-full drop-shadow-xl" />
      <img src={contentUrl} className="w-[90%]" />
    </div>
  );
}
