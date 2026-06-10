import Link from "next/link";
import Image from "next/image";

type Props = {
  logoUrl?: string | null;
  siteName?: string;
  /**
   * "default"  – navbar, mobile drawer  (dark image, dark text on light bg)
   * "inverted" – footer                  (image inverted to white on dark bg)
   * "dark"     – admin sidebar, login left panel (image inverted + brightened on dark bg)
   */
  variant?: "default" | "inverted" | "dark";
  /** Tailwind height class for the image e.g. "h-9" (default) or "h-12" for larger contexts */
  imageHeight?: string;
  className?: string;
  href?: string;
};

export function BrandLogo({
  logoUrl,
  siteName = "TopTrenzo",
  variant = "default",
  imageHeight = "h-9",
  className = "",
  href = "/",
}: Props) {
  // On dark backgrounds the logo needs to be made white so it shows up
  const imageClass = [
    "object-contain w-auto",
    imageHeight,
    variant === "dark"     ? "brightness-0 invert"        : "",
    variant === "inverted" ? "brightness-0 invert"        : "",
  ].filter(Boolean).join(" ");

  const topClass =
    variant === "dark" || variant === "inverted" ? "text-white" : "text-foreground";

  const taglineClass =
    variant === "dark"
      ? "text-white/50"
      : variant === "inverted"
      ? "text-white/50"
      : "text-muted-foreground";

  const textSize =
    imageHeight === "h-12" ? "text-2xl" : "text-xl";

  return (
    <Link href={href} className={`inline-flex items-center gap-3 shrink-0 ${className}`}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={siteName}
          width={180}
          height={48}
          className={imageClass}
          priority
        />
      ) : (
        <div>
          <p className={`${textSize} font-bold tracking-tight leading-none ${topClass}`}>
            <span>TOP</span>
            <span className="text-primary">TRENZO</span>
          </p>
          <p className={`text-[9px] tracking-[0.2em] uppercase mt-0.5 ${taglineClass}`}>
            Trends That Matter
          </p>
        </div>
      )}
    </Link>
  );
}