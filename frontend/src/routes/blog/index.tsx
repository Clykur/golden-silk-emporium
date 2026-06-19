import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Calendar, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "The Journal — Drapeva" },
      {
        name: "description",
        content:
          "Artisan stories, saree drape guides, styling tips, and bridal fashion insights from the Drapeva studio.",
      },
    ],
  }),
  component: JournalIndex,
});

function JournalIndex() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.blog
      .list()
      .then((data) => setPosts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-14 md:py-20 text-center">
          <p className="eyebrow flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4 text-gold" /> The Journal
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">Atelier Diaries</h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>
      </div>

      <div className="container-luxe py-16">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground animate-pulse py-20">
            Fetching journal logs...
          </p>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-xl text-muted-foreground">
              No posts have been published yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="border border-border bg-champagne/5 hover-lift">
                <div className="aspect-[3/2] overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex gap-4 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span className="text-gold font-medium">{post.category}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="font-display text-xl leading-tight truncate">{post.title}</h2>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>
                  <div className="pt-2 border-t border-border mt-4">
                    <Link
                      to="/blog/$slug"
                      params={{ slug: post.slug }}
                      className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-foreground hover:text-gold transition-colors"
                    >
                      Read Post <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
