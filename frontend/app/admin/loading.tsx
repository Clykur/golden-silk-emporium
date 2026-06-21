export default function AdminLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
          Loading module...
        </p>
      </div>
    </div>
  );
}
