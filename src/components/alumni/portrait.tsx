import Image from "next/image";
import { Emblem } from "@/components/brand/emblem";
import { cn, initials } from "@/lib/utils";

/**
 * Member portrait. Uses the uploaded photograph when available, otherwise an
 * elegant monogram — we never substitute stock or generated faces.
 */
export function Portrait({
  name,
  photoUrl,
  className,
  sizes = "(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw",
  textClassName,
}: {
  name: string;
  photoUrl: string | null;
  className?: string;
  sizes?: string;
  textClassName?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-navy", className)}>
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={`Portrait of ${name}`}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          unoptimized={photoUrl.startsWith("data:")}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_30%_20%,#173957_0%,#0b1f38_70%)]" role="img" aria-label={`Monogram for ${name}`}>
          <Emblem className="absolute -bottom-6 -right-6 size-36 text-gold/[0.07]" title="" />
          <span className={cn("font-serif text-5xl font-medium tracking-wide text-gold transition-transform duration-700 group-hover:scale-105", textClassName)}>
            {initials(name)}
          </span>
        </div>
      )}
    </div>
  );
}
