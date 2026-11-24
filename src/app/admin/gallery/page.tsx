import Image from "next/image";
import { removeGalleryItem, toggleGalleryItem } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { GalleryForm } from "@/components/admin/gallery-form";
import { Badge } from "@/components/ui/badge";
import { listGallery, listGalleryCategories } from "@/lib/data/content";

export const metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  const [items, categories] = await Promise.all([listGallery({ includeUnpublished: true }), listGalleryCategories()]);
  const name = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  return (
    <>
      <AdminHeader title="Gallery" description="Upload genuine Newton House photographs. Every image needs descriptive alt text." />
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Add a photograph">
          <div className="p-6">
            <GalleryForm categories={categories} />
          </div>
        </Panel>
        <Panel title={`Library (${items.length})`} className="xl:col-span-2">
          <ul className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((g) => (
              <li key={g.id} className="flex flex-col ring-1 ring-line">
                <div className="relative aspect-[4/3] bg-navy">
                  <Image src={g.imageUrl} alt={g.alt} fill sizes="(min-width: 1024px) 18vw, 45vw" className="object-cover" unoptimized={g.imageUrl.startsWith("data:")} />
                  {!g.published ? <Badge variant="neutral" className="absolute left-2 top-2">Hidden</Badge> : null}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="text-sm font-semibold text-ink">{g.title}</p>
                  <p className="text-xs text-muted-strong">{name(g.categorySlug)}</p>
                  <div className="mt-auto flex gap-1 pt-3">
                    <ActionButton size="sm" variant="outline" action={toggleGalleryItem.bind(null, g.id, !g.published)}>
                      {g.published ? "Hide" : "Publish"}
                    </ActionButton>
                    <ActionButton size="sm" variant="ghost" className="text-brick" action={removeGalleryItem.bind(null, g.id)} confirmMessage={`Remove "${g.title}" from the gallery?`}>
                      Remove
                    </ActionButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
