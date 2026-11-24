import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/navigation/navbar";
import { siteConfig } from "@/data/site";
import { absoluteUrl } from "@/lib/utils";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.association,
  alternateName: siteConfig.name,
  url: absoluteUrl("/"),
  logo: absoluteUrl("/icon.svg"),
  slogan: siteConfig.tagline,
  parentOrganization: { "@type": "CollegeOrUniversity", name: siteConfig.institution },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ashok Rajpath",
    addressLocality: "Patna",
    addressRegion: "Bihar",
    postalCode: "800005",
    addressCountry: "IN",
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
    </>
  );
}
