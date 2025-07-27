import PageLayout from "@/components/PageLayout";
import { Suspense } from "react";
import { RankingList } from "@/components/RankingList";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

function RankingListSkeleton(): JSX.Element {
  return (
    <div className="grid gap-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-6 rounded-lg border bg-card">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("leaderboard.page");
  
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function Leaderboard(): Promise<JSX.Element> {
  const t = await getTranslations("leaderboard.page");

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold">{t("title")}</h1>
          <p className="text-lg text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>

        <Suspense fallback={<RankingListSkeleton />}>
          <RankingList />
        </Suspense>
      </div>
    </PageLayout>
  );
} 