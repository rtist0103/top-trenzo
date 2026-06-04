import Link from "next/link";
import Image from "next/image";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import { getSettingsMap } from "@/features/settings/repositories/settings.repositories";
import { getAllCategories } from "@/repositories/category.repositories";

export default async function PublicFooter() {
  const [s, categories] = await Promise.all([
    getSettingsMap(),
    getAllCategories(),
  ]);

  const socialLinks = [
    { href: s.twitter_url,   icon: FaXTwitter,   label: "Twitter"   },
    { href: s.facebook_url,  icon: FaFacebookF,  label: "Facebook"  },
    { href: s.instagram_url, icon: FaInstagram,  label: "Instagram" },
    { href: s.linkedin_url,  icon: FaLinkedinIn, label: "LinkedIn"  },
    { href: s.youtube_url,   icon: FaYoutube,    label: "YouTube"   },
  ].filter((item) => item.href);

  const logo = s.logo_url || "";
  const siteName = s.site_name || "TopTrenzo";

  return (
    <footer className="mt-16 border-t bg-foreground text-background">
      {/* Red accent top bar */}
      <div className="h-1 w-full bg-primary" />

      <div className="container-wrapper py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* ── Brand col ── */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              {logo ? (
                <Image
                  src={logo}
                  alt={siteName}
                  width={150}
                  height={36}
                  className="object-contain h-9 w-auto brightness-0 invert"
                />
              ) : (
                <div>
                  <p className="text-2xl font-bold tracking-tight leading-none">
                    <span className="text-background">TOP</span>
                    <span className="text-primary">TRENZO</span>
                  </p>
                  <p className="text-[9px] tracking-[0.2em] uppercase mt-1 text-background/50">
                    Trends That Matter
                  </p>
                </div>
              )}
            </Link>

            {s.footer_text && (
              <p className="text-sm text-background/60 leading-relaxed max-w-sm mb-6">
                {s.footer_text}
              </p>
            )}

            {/* Social icons */}
            {socialLinks.length > 0 && (
              <div className="flex gap-2">
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex items-center justify-center h-9 w-9 rounded-full border border-background/20 text-background/60 hover:bg-primary hover:border-primary hover:text-white transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── Topics col ── */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-background/40 mb-4 flex items-center gap-2">
              <span className="inline-block w-4 h-0.5 bg-primary" />
              Topics
            </h4>
            <ul className="space-y-2">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-background/60 hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact + Links col ── */}
          <div className="space-y-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-background/40 mb-4 flex items-center gap-2">
                <span className="inline-block w-4 h-0.5 bg-primary" />
                Quick Links
              </h4>
              <ul className="space-y-2">
                {[
                  { href: "/",       label: "Home"        },
                  { href: "/news",   label: "Latest News" },
                  { href: "/search", label: "Search"      },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-background/60 hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {(s.support_email || s.contact_phone || s.address) && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-background/40 mb-4 flex items-center gap-2">
                  <span className="inline-block w-4 h-0.5 bg-primary" />
                  Contact
                </h4>
                <ul className="space-y-2">
                  {s.support_email && (
                    <li>
                      <a
                        href={`mailto:${s.support_email}`}
                        className="text-sm text-background/60 hover:text-primary transition-colors break-all"
                      >
                        {s.support_email}
                      </a>
                    </li>
                  )}
                  {s.contact_phone && (
                    <li>
                      <a
                        href={`tel:${s.contact_phone}`}
                        className="text-sm text-background/60 hover:text-primary transition-colors"
                      >
                        {s.contact_phone}
                      </a>
                    </li>
                  )}
                  {s.address && (
                    <li className="text-sm text-background/60 leading-relaxed">
                      {s.address}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40 order-2 sm:order-1">
            {s.copyright_text ||
              `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}
          </p>
          <div className="flex gap-6 order-1 sm:order-2">
            {[
              { href: "#", label: "Privacy Policy"  },
              { href: "#", label: "Terms of Service" },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-background/40 hover:text-primary transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}