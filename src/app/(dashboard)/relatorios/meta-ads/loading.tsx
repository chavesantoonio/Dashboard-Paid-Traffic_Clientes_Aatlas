import { PageShell } from "@/components/layout/page-shell";

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-28 animate-pulse rounded bg-muted" />
        <div className="h-7 w-7 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-7 w-24 animate-pulse rounded bg-muted" />
      <div className="h-3 w-36 animate-pulse rounded bg-muted" />
    </div>
  );
}

function SkeletonGroup({ cols = 4 }: { cols?: number }) {
  return (
    <div className="space-y-3">
      <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      <div className={`grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-${cols}`}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export default function MetaAdsLoading() {
  return (
    <PageShell
      title="Meta Ads"
      breadcrumbs={[{ label: "Relatórios" }, { label: "Meta Ads" }]}
    >
      <div className="space-y-6">
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
        <SkeletonGroup cols={4} />
        <SkeletonGroup cols={4} />
        <SkeletonGroup cols={2} />
      </div>
    </PageShell>
  );
}
