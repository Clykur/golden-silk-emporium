import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { productsApi, collectionsApi } from "@/lib/api";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/collections/$slug")({
  head: ({ params }) => {
    const name = params.slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return {
      meta: [
        { title: `${name} — Drapeva` },
        { name: "description", content: `Browse pieces from our ${name} edit.` },
      ],
    };
  },
  component: CollectionDetail,
});

function CollectionDetail() {
  const { slug } = Route.useParams();

  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: collectionsApi.list,
  });

  const collectionInfo = collections.find((c: any) => c.slug === slug);
  const displayName = collectionInfo?.name || slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products", undefined, slug],
    queryFn: () => productsApi.list({ collection: slug }),
  });

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[40svh] min-h-[300px] w-full overflow-hidden bg-ink text-background flex items-center justify-center">
        {collectionInfo?.image && (
          <img src={collectionInfo.image} alt={displayName} className="absolute inset-0 h-full w-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-background/25" />
        <div className="relative text-center z-10 px-4">
          <p className="eyebrow text-gold">{collectionInfo?.tagline || "Atelier Edit"}</p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl text-foreground">{displayName}</h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>
      </div>

      <div className="container-luxe py-16">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-champagne/40" /></div>)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-xl text-muted-foreground">No pieces in this edit just yet.</p>
            <Link to="/shop" search={{}} className="mt-4 inline-block border-b border-foreground pb-0.5 eyebrow">Return to shop</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
