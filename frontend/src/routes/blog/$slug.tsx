import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const title = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${title} — Drapeva` },
        { name: "description", content: `Read the article ${title} on the Drapeva blog.` },
      ],
    };
  },
  component: JournalDetail,
});

function JournalDetail() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.blog
      .get(slug)
      .then((data) => setPost(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container-luxe py-24 text-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading journal log...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-luxe py-24 text-center">
        <h1 className="font-display text-4xl">Post not found</h1>
        <Link to="/blog" className="mt-6 inline-block border-b border-foreground pb-0.5 eyebrow">
          Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <article className="py-12">
      <div className="container-luxe max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Journal
        </Link>

        <header className="space-y-4">
          <span className="eyebrow text-gold">{post.category}</span>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">{post.title}</h1>
          <div className="flex flex-wrap gap-6 text-xs text-muted-foreground pt-4 border-y border-border py-3">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" /> By {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Published{" "}
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </header>

        <div className="mt-8 overflow-hidden aspect-[16/9] border border-border">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>

        <div className="mt-10 font-sans text-base leading-relaxed text-foreground/80 space-y-6 whitespace-pre-line">
          {post.content}
        </div>
      </div>
    </article>
  );
}
