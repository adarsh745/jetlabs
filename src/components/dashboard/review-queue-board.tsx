"use client";

import { useDeferredValue, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ReviewDecision } from "@prisma/client";
import { Clock3, Eye, Filter, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { submitReviewAction } from "@/lib/actions/review-actions";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewQueueData, ReviewQueueItem } from "@/types/aoip";

type QueueTab = "all" | "pending" | "re-review" | "sla";

function urgencyVariant(urgency: ReviewQueueItem["urgency"]) {
  if (urgency === "Critical") {
    return "destructive";
  }

  if (urgency === "High") {
    return "outline";
  }

  return "secondary";
}

type ReviewQueueBoardProps = {
  initialData: ReviewQueueData;
};

export function ReviewQueueBoard({ initialData }: ReviewQueueBoardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<QueueTab>("all");
  const [query, setQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [selectedReview, setSelectedReview] = useState<ReviewQueueItem | null>(null);
  const [draftVerdict, setDraftVerdict] = useState<ReviewDecision>(ReviewDecision.APPROVED);
  const [draftScore, setDraftScore] = useState("80");
  const [draftFeedback, setDraftFeedback] = useState("");
  const [isSubmittingReview, startReviewTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const filteredQueue = initialData.queue.filter((item) => {
    if (
      deferredQuery &&
      !`${item.team} ${item.project} ${item.submissionTitle} ${item.preview}`
        .toLowerCase()
        .includes(deferredQuery.toLowerCase())
    ) {
      return false;
    }

    if (batchFilter !== "All" && item.batch !== batchFilter) {
      return false;
    }

    if (urgencyFilter !== "All" && item.urgency !== urgencyFilter) {
      return false;
    }

    if (activeTab === "pending" && item.status !== "Pending") {
      return false;
    }

    if (activeTab === "re-review" && item.status !== "Re-review") {
      return false;
    }

    if (activeTab === "sla" && item.status !== "SLA risk") {
      return false;
    }

    return true;
  });

  const columns: DataTableColumn<ReviewQueueItem>[] = [
    {
      key: "team",
      header: "Team",
      cell: (item) => (
        <div className="space-y-1">
          <p className="font-medium text-foreground">{item.team}</p>
          <p className="text-sm text-muted-foreground">{item.project}</p>
        </div>
      ),
    },
    {
      key: "submission",
      header: "Submission",
      cell: (item) => (
        <div className="space-y-1">
          <p className="font-medium text-foreground">{item.submissionTitle}</p>
          <p className="text-sm text-muted-foreground">{item.submittedAt}</p>
        </div>
      ),
    },
    {
      key: "urgency",
      header: "Urgency",
      cell: (item) => (
        <div className="space-y-2">
          <Badge variant={urgencyVariant(item.urgency)}>{item.urgency}</Badge>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {item.status}
          </p>
        </div>
      ),
    },
    {
      key: "score",
      header: "Score hint",
      cell: (item) => <span className="text-sm text-muted-foreground">{item.scoreHint}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (item) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedReview(item)}>
            <Eye className="size-4" />
            Preview
          </Button>
          <Button size="sm" onClick={() => setSelectedReview(item)}>
            <PencilLine className="size-4" />
            Grade
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageContainer
        eyebrow="Faculty review"
        title="Review Queue"
        description="An operational lane for fast, consistent weekly reviews with urgency cues, evidence previews, and live grading actions."
        actions={
          <Button variant="outline">
            <Filter className="size-4" />
            Export queue view
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <StatsCard
            label={initialData.stats[0]?.label ?? "Pending reviews"}
            value={initialData.stats[0]?.value ?? "0"}
            detail={initialData.stats[0]?.detail ?? "No queue pressure"}
            tone={initialData.stats[0]?.tone}
            icon={Clock3}
          />
          <StatsCard
            label={initialData.stats[1]?.label ?? "SLA risk"}
            value={initialData.stats[1]?.value ?? "0"}
            detail={initialData.stats[1]?.detail ?? "No overdue items"}
            tone={initialData.stats[1]?.tone}
            icon={Filter}
          />
          <StatsCard
            label={initialData.stats[2]?.label ?? "Average score"}
            value={initialData.stats[2]?.value ?? "N/A"}
            detail={initialData.stats[2]?.detail ?? "No completed reviews"}
            tone={initialData.stats[2]?.tone}
            icon={PencilLine}
          />
          <StatsCard
            label={initialData.stats[3]?.label ?? "Review completion"}
            value={initialData.stats[3]?.value ?? "0%"}
            detail={initialData.stats[3]?.detail ?? "Queue movement will appear here"}
            icon={Eye}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
          <AnalyticsChart
            title="Review analytics"
            description="Queue pressure, completions, and overdue load by weekly cycle."
            data={initialData.analytics}
            type="bar"
            series={[
              { key: "pending", label: "Pending", color: "var(--color-chart-2)" },
              { key: "completed", label: "Completed", color: "var(--color-chart-1)" },
              { key: "overdue", label: "Overdue", color: "var(--color-chart-4)" },
            ]}
          />

          <Card>
            <CardHeader className="space-y-2">
              <CardTitle>Quick grading templates</CardTitle>
              <CardDescription>
                Reusable review intents for fast-path operational commentary.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {initialData.templates.map((template) => (
                <div
                  key={template}
                  className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
                >
                  {template}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as QueueTab)}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="re-review">Re-review</TabsTrigger>
                <TabsTrigger value="sla">SLA risk</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search team, project, or submission"
              />
              <Select value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)}>
                {["All", ...new Set(initialData.queue.map((item) => item.batch))].map(
                  (option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ),
                )}
              </Select>
              <Select
                value={urgencyFilter}
                onChange={(event) => setUrgencyFilter(event.target.value)}
              >
                {["All", "Low", "Medium", "High", "Critical"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

            <DataTable
              columns={columns}
              data={filteredQueue}
              getRowId={(item) => item.id}
              emptyState={
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">No reviews match the active filters.</p>
                  <p className="text-sm text-muted-foreground">Try widening the queue filters or switching tabs.</p>
                </div>
              }
            />
          </CardContent>
        </Card>
      </PageContainer>

      <Modal open={selectedReview !== null} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <ModalContent>
          <ModalHeader>
            <div>
              <ModalTitle>{selectedReview?.submissionTitle ?? "Submission preview"}</ModalTitle>
              <ModalDescription>
                {selectedReview ? `${selectedReview.team} · ${selectedReview.project}` : "Review details"}
              </ModalDescription>
            </div>
            <ModalCloseButton onClick={() => setSelectedReview(null)} />
          </ModalHeader>
          <ModalBody className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {selectedReview?.rubric.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-sm leading-7 text-muted-foreground">
                {selectedReview?.preview}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="verdict">Decision</label>
                <Select
                  id="verdict"
                  value={draftVerdict}
                  onChange={(event) => setDraftVerdict(event.target.value as ReviewDecision)}
                >
                  {[
                    ReviewDecision.APPROVED,
                    ReviewDecision.REVISION_REQUIRED,
                    ReviewDecision.REJECTED,
                    ReviewDecision.ESCALATED,
                  ].map((option) => (
                    <option key={option} value={option}>
                      {option.replaceAll("_", " ")}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="score">Score</label>
                <Input
                  id="score"
                  type="number"
                  min={0}
                  max={100}
                  value={draftScore}
                  onChange={(event) => setDraftScore(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">{selectedReview?.scoreHint}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="feedback">Feedback</label>
              <Textarea
                id="feedback"
                value={draftFeedback}
                onChange={(event) => setDraftFeedback(event.target.value)}
                placeholder="Write structured, actionable faculty feedback for this submission."
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setSelectedReview(null)}>
              Close preview
            </Button>
            <Button
              disabled={isSubmittingReview}
              onClick={() => {
                if (!selectedReview) {
                  return;
                }

                startReviewTransition(async () => {
                  const score = Number.parseInt(draftScore, 10);
                  const result = await submitReviewAction({
                    submissionId: selectedReview.id,
                    decision: draftVerdict,
                    score: Number.isFinite(score) ? score : 0,
                    comments: draftFeedback,
                  });

                  if (!result.success) {
                    toast.error(result.message);
                    return;
                  }

                  toast.success("Review submitted.");
                  setSelectedReview(null);
                  setDraftVerdict(ReviewDecision.APPROVED);
                  setDraftScore("80");
                  setDraftFeedback("");
                  router.refresh();
                });
              }}
            >
              {isSubmittingReview ? "Submitting review..." : "Submit review"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
