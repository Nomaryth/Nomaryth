import Image from 'next/image';
import LogoPng from '../../assets/Noma1ColorIcon.png';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="Nomaryth Home">
      <Image
        src={LogoPng}
        alt="Nomaryth Logo"
        width={32}
        height={32}
        className="h-8 w-8 object-contain"
        priority
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}