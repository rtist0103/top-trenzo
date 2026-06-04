import Link from "next/link";
import {
  FileText, CheckCircle, Clock, AlertCircle,
  Plus, ArrowRight, TrendingUp, FolderTree,
  Eye, Archive, Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { PublishingChart } from "@/features/dashboard/components/publishing-chart";
import { StatusDonut } from "@/features/dashboard/components/status-donut";

async function getDashboardData() {
  const supabase = await createClient();

  const [
    { count: total },
    { count: published },
    { count: drafts },
    { count: inReview },
    { count: archived },
    { data: recent },
    { data: categoryStats },
    { data: last30Days },
    { data: { user } },
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "review"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "archived"),
    supabase.from("articles").select("id, title, status, created_at, categories(name)").order("created_at", { ascending: false }).limit(8),
    supabase.from("articles").select("category_id, categories(name)").eq("status", "published").not("category_id", "is", null),
    supabase.from("articles").select("published_at").eq("status", "published").gte("published_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()).order("published_at", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  const catMap: Record<string, { name: string; count: number }> = {};
  for (const row of categoryStats ?? []) {
    const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    if (!cat?.name || !row.category_id) continue;
    if (!catMap[row.category_id]) catMap[row.category_id] = { name: cat.name, count: 0 };
    catMap[row.category_id]!.count++;
  }
  const topCategories = Object.values(catMap).sort((a, b) => b.count - a.count).slice(0, 5);

  const dayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const row of last30Days ?? []) {
    const day = (row.published_at as string).slice(0, 10);
    if (day in dayMap) dayMap[day]!++;
  }
  const chartData = Object.entries(dayMap).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    articles: count,
  }));

  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "Admin";

  return {
    stats: { total: total ?? 0, published: published ?? 0, drafts: drafts ?? 0, inReview: inReview ?? 0, archived: archived ?? 0 },
    recent: recent ?? [],
    topCategories,
    chartData,
    firstName,
    isEmpty: (total ?? 0) === 0,
  };
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ElementType }> = {
  published: { label: "Published", variant: "default",     icon: CheckCircle },
  draft:     { label: "Draft",     variant: "secondary",   icon: Clock },
  review:    { label: "Review",    variant: "outline",     icon: AlertCircle },
  archived:  { label: "Archived",  variant: "destructive", icon: Archive },
};

export default async function DashboardPage() {
  const { stats, recent, topCategories, chartData, firstName, isEmpty } = await getDashboardData();

  const statCards = [
    { label: "Total",     value: stats.total,     icon: FileText,    href: "/admin/articles",                  color: "text-blue-500",   bg: "bg-blue-500/10" },
    { label: "Published", value: stats.published, icon: CheckCircle, href: "/admin/articles?status=published", color: "text-green-500",  bg: "bg-green-500/10" },
    { label: "Drafts",    value: stats.drafts,    icon: Clock,       href: "/admin/articles?status=draft",     color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "In Review", value: stats.inReview,  icon: AlertCircle, href: "/admin/articles?status=review",    color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Archived",  value: stats.archived,  icon: Archive,     href: "/admin/articles?status=archived",  color: "text-zinc-500",   bg: "bg-zinc-500/10" },
  ];

  const quickActions = [
    { label: "New Article",  href: "/admin/articles/new",  icon: Plus,       description: "Write and publish" },
    { label: "All Articles", href: "/admin/articles",       icon: FileText,   description: "Browse & manage" },
    { label: "Categories",   href: "/admin/categories",     icon: FolderTree, description: "Organise topics" },
    { label: "View Site",    href: "/",                     icon: Eye,        description: "Public homepage" },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Good {getGreeting()}, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEmpty
              ? "Welcome to your dashboard. Start by creating your first article."
              : "Here's what's happening with your publication today."}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/articles/new">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </Button>
      </div>

      {/* Empty state — only shown when no articles at all */}
      {isEmpty && (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Your newsroom is ready</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              You haven&apos;t published anything yet. Create categories to organise your content, then write your first article.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild>
                <Link href="/admin/articles/new">
                  <Plus className="h-4 w-4 mr-2" /> Write first article
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/categories">
                  <FolderTree className="h-4 w-4 mr-2" /> Set up categories
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stat cards — always visible */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link key={label} href={href}>
            <Card className="p-5 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-primary transition-colors">
                View all <ArrowRight className="h-3 w-3" />
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts — only when there's data */}
      {!isEmpty && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold">Publishing Activity</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Articles published in the last 30 days</p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <PublishingChart data={chartData} />
          </Card>

          <Card className="p-5">
            <div className="mb-5">
              <h2 className="font-semibold">By Status</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Article breakdown</p>
            </div>
            <StatusDonut
              data={[
                { label: "Published", value: stats.published, color: "#22c55e" },
                { label: "Draft",     value: stats.drafts,    color: "#eab308" },
                { label: "Review",    value: stats.inReview,  color: "#f97316" },
                { label: "Archived",  value: stats.archived,  color: "#71717a" },
              ]}
            />
          </Card>
        </div>
      )}

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Recent articles */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-semibold">Recent Articles</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/articles" className="gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <div className="divide-y">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No articles yet</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Articles you create will appear here.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/admin/articles/new">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Write first article
                  </Link>
                </Button>
              </div>
            ) : (
              recent.map((article: {
                id: string;
                title: string;
                status: string | null;
                created_at: string;
                categories: { name: string } | { name: string }[] | null;
              }) => {
                const cat = Array.isArray(article.categories) ? article.categories[0] : article.categories;
                const cfg = statusConfig[article.status ?? "draft"];
                const Icon = cfg?.icon ?? Clock;
                return (
                  <div key={article.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="h-7 w-7 shrink-0 rounded-md bg-muted flex items-center justify-center">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{article.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {cat?.name ?? "Uncategorised"} · {formatDate(article.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <Badge variant={cfg?.variant ?? "secondary"}>{cfg?.label ?? article.status}</Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/articles/${article.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-6">

          {/* Quick actions */}
          <Card className="p-5">
            <h2 className="font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-1">
              {quickActions.map(({ label, href, icon: Icon, description }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted transition-colors group"
                >
                  <div className="h-8 w-8 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto text-transparent group-hover:text-muted-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Top categories — only when there's data */}
          {topCategories.length > 0 ? (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Top Categories</h2>
                <Link href="/admin/categories" className="text-xs text-muted-foreground hover:text-foreground">
                  Manage
                </Link>
              </div>
              <div className="space-y-3">
                {topCategories.map(({ name, count }) => {
                  const pct = stats.published > 0 ? Math.round((count / stats.published) * 100) : 0;
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{name}</span>
                        <span className="text-xs text-muted-foreground">{count} articles</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card className="p-5 border-dashed">
              <div className="flex flex-col items-center text-center py-4">
                <FolderTree className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium">No categories yet</p>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  Organise your articles with categories.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/categories">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add category
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}