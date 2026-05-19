"use client";

import { startTransition, useDeferredValue, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Building2,
  Compass,
  Search,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { toggleProblemBookmarkAction } from "@/lib/actions/problem-actions";
import type { ProblemMarketData } from "@/types/aoip";

type ActiveTab = "all" | "recommended" | "saved" | "industry";

type ProblemMarketBoardProps = {
  initialData: ProblemMarketData;
};

export function ProblemMarketBoard({ initialData }: ProblemMarketBoardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [problemData, setProblemData] = useState(initialData);
  const [isBookmarkPending, startBookmarkTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const visibleProblems = [...problemData.problems]
    .filter((problem) => {
      if (
        deferredQuery &&
        !`${problem.title} ${problem.summary} ${problem.tags.join(" ")}`
          .toLowerCase()
          .includes(deferredQuery.toLowerCase())
      ) {
        return false;
      }

      if (
        categoryFilter !== "All" &&
        problem.category !== categoryFilter &&
        problem.domain !== categoryFilter
      ) {
        return false;
      }

      if (difficultyFilter !== "All" && problem.difficulty !== difficultyFilter) {
        return false;
      }

      if (activeTab === "recommended" && problem.fitScore < 88) {
        return false;
      }

      if (activeTab === "saved" && !problem.saved) {
        return false;
      }

      if (activeTab === "industry" && problem.source !== "Industry") {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.fitScore - left.fitScore);

  const facultyRecommended = problemData.problems.filter(
    (problem) => problem.source === "Faculty",
  );
  const savedCount = problemData.problems.filter((problem) => problem.saved).length;
  const liveStats = problemData.stats.map((stat, index) =>
    index === 3
      ? {
          ...stat,
          value: `${savedCount}`,
        }
      : stat,
  );

  function handleToggleBookmark(problemId: string) {
    startBookmarkTransition(async () => {
      const result = await toggleProblemBookmarkAction({
        problemId,
      });

      if (!result.success) {
        return;
      }

      setProblemData((current) => ({
        ...current,
        problems: current.problems.map((problem) =>
          problem.id === problemId
            ? {
                ...problem,
                saved: result.bookmarked ?? !problem.saved,
              }
            : problem,
        ),
      }));
      router.refresh();
    });
  }

  return (
    <PageContainer
      eyebrow="Student research"
      title="Problem Market"
      description="Discover high-signal academic and industry problem briefs that already fit how Syntra teams research, execute, and publish."
      actions={
        <Button variant="outline">
          <Bookmark className="size-4" />
          Saved problems
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <StatsCard
          label={liveStats[0]?.label ?? "Open briefs"}
          value={liveStats[0]?.value ?? "0"}
          detail={liveStats[0]?.detail ?? "No discovery briefs found"}
          icon={Compass}
        />
        <StatsCard
          label={liveStats[1]?.label ?? "Recommended"}
          value={liveStats[1]?.value ?? "0"}
          detail={liveStats[1]?.detail ?? "Recommendation engine is warming up"}
          tone={liveStats[1]?.tone}
          icon={Sparkles}
        />
        <StatsCard
          label={liveStats[2]?.label ?? "Industry-backed"}
          value={liveStats[2]?.value ?? "0"}
          detail={liveStats[2]?.detail ?? "No industry briefs loaded"}
          icon={Building2}
        />
        <StatsCard
          label={liveStats[3]?.label ?? "Saved"}
          value={liveStats[3]?.value ?? "0"}
          detail={liveStats[3]?.detail ?? "No bookmarks retained yet"}
          icon={Bookmark}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as ActiveTab)}
              >
                <TabsList>
                  <TabsTrigger value="all">All briefs</TabsTrigger>
                  <TabsTrigger value="recommended">Recommended</TabsTrigger>
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                  <TabsTrigger value="industry">Industry</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-11"
                    placeholder="Search domains, faculty notes, and startup-grade briefs"
                    value={query}
                    onChange={(event) =>
                      startTransition(() => setQuery(event.target.value))
                    }
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  {problemData.categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
                <Select
                  value={difficultyFilter}
                  onChange={(event) => setDifficultyFilter(event.target.value)}
                >
                  {["All", "Beginner", "Intermediate", "Advanced"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {visibleProblems.map((problem, index) => (
              <motion.article
                key={problem.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: index * 0.03 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{problem.domain}</Badge>
                      <Badge variant="outline">{problem.difficulty}</Badge>
                      <Badge variant="outline">{problem.source}</Badge>
                      {problem.saved ? <Badge variant="default">Saved</Badge> : null}
                    </div>
                    <div>
                      <h3>{problem.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {problem.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row items-center gap-4 lg:flex-col lg:items-end">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Fit score
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                        {problem.fitScore}
                      </p>
                    </div>
                    <Badge variant="outline">{problem.trend}</Badge>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {problem.tags.map((tag) => (
                    <span
                      key={`${problem.id}-${tag}`}
                      className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Recommended by
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {problem.recommendedBy}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">Preview brief</Button>
                    <Button
                      disabled={isBookmarkPending}
                      onClick={() => handleToggleBookmark(problem.id)}
                    >
                      {problem.saved ? "Saved to workspace" : "Save to workspace"}
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle>Trending discovery lanes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {problemData.trending.map((trend) => (
                <div
                  key={trend.id}
                  className="rounded-2xl border border-border bg-muted/40 p-4"
                >
                  <p className="text-sm font-semibold text-foreground">{trend.title}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {trend.momentum}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-2">
              <CardTitle>Faculty recommended</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {facultyRecommended.map((problem) => (
                <div key={problem.id} className="rounded-2xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{problem.title}</p>
                    <Badge variant="secondary">{problem.fitScore}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {problem.recommendedBy}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
