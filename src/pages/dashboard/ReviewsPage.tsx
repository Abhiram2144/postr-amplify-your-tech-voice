import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MessageSquareText, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errors";
import { format } from "date-fns";
import type { UserProfile } from "@/components/dashboard/DashboardLayout";

interface DashboardContext {
  profile: UserProfile | null;
}

interface UserFeedbackEntry {
  id: string;
  rating: number;
  category: string;
  subject: string | null;
  message: string;
  status: string | null;
  created_at: string | null;
}

const ratingValues = [1, 2, 3, 4, 5];

const feedbackCategories = [
  { value: "general", label: "General" },
  { value: "feature_request", label: "Feature request" },
  { value: "bug_report", label: "Bug report" },
  { value: "billing", label: "Billing" },
  { value: "support", label: "Support" },
  { value: "other", label: "Other" },
];

const ReviewsPage = () => {
  const { profile } = useOutletContext<DashboardContext>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [feedbackHistory, setFeedbackHistory] = useState<UserFeedbackEntry[]>([]);

  const loadFeedback = useCallback(async () => {
    if (!user) {
      setFeedbackHistory([]);
      setLoadingFeedback(false);
      return;
    }

    setLoadingFeedback(true);

    try {
      const { data, error } = await supabase
        .from("user_feedback")
        .select("id, rating, category, subject, message, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      setFeedbackHistory((data ?? []) as UserFeedbackEntry[]);
    } catch (error) {
      console.error("Error loading feedback:", error);
    } finally {
      setLoadingFeedback(false);
    }
  }, [user]);

  useEffect(() => {
    void loadFeedback();
  }, [loadFeedback]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      toast({
        title: "Add your feedback",
        description: "Tell us what should be better before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("user_feedback").insert({
        user_id: user.id,
        rating,
        category,
        subject: subject.trim() || null,
        message: trimmedMessage,
        page_context: "dashboard_reviews",
        source: "dashboard",
      });

      if (error) throw error;

      toast({
        title: "Feedback sent",
        description: "Thanks. We use every review to shape the product.",
      });

      setSubject("");
      setMessage("");
      setCategory("general");
      setRating(5);
      await loadFeedback();
    } catch (error) {
      toast({
        title: "Could not send feedback",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="space-y-8"
      >
        <div className="flex flex-col gap-3">
          <Badge className="w-fit gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border-primary/20">
            <MessageSquareText className="h-3.5 w-3.5" />
            Reviews
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Share feedback</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Tell us what is working, what is missing, and what should feel better. Your review goes straight into our product backlog.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-primary/15 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Leave a review
              </CardTitle>
              <CardDescription>
                Keep it short or write as much as you need. We read the details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label className="text-sm font-medium">How would you rate Postr?</Label>
                    <span className="text-sm text-muted-foreground">{rating}/5</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {ratingValues.map((value) => {
                      const active = value <= rating;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          aria-pressed={rating === value}
                          className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-3 transition-all duration-200 ${
                            rating === value
                              ? "border-primary bg-primary/10 text-primary shadow-sm"
                              : active
                              ? "border-primary/25 bg-primary/5 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          }`}
                        >
                          <Star className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
                          <span className="text-sm font-semibold">{value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="feedback-subject">Subject</Label>
                    <Input
                      id="feedback-subject"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      placeholder="What would you like us to improve?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback-category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="feedback-category">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {feedbackCategories.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback-message">Your feedback</Label>
                  <Textarea
                    id="feedback-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Share what feels great, what feels missing, or what you want us to build next."
                    className="min-h-[180px]"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Submitted as {profile?.full_name || profile?.email || "your account"}.
                  </p>
                  <Button type="submit" variant="hero" className="gap-2 sm:self-end" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {submitting ? "Sending..." : "Send review"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden border-border/70">
              <CardHeader>
                <CardTitle>What to include</CardTitle>
                <CardDescription>
                  Specific feedback helps us move faster.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>• What you were trying to do</p>
                <p>• What felt confusing or slow</p>
                <p>• What feature would have made the difference</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/70">
              <CardHeader>
                <CardTitle>Recent reviews</CardTitle>
                <CardDescription>
                  Your last few submissions from the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingFeedback ? (
                  <div className="space-y-3">
                    <div className="h-20 rounded-xl bg-muted/60 animate-pulse" />
                    <div className="h-20 rounded-xl bg-muted/60 animate-pulse" />
                  </div>
                ) : feedbackHistory.length > 0 ? (
                  feedbackHistory.map((entry) => (
                    <div key={entry.id} className="rounded-xl border bg-muted/20 p-4 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {entry.category.replace(/[_-]+/g, " ")}
                        </Badge>
                        {entry.status ? (
                          <Badge variant="outline" className="capitalize">
                            {entry.status}
                          </Badge>
                        ) : null}
                        <div className="flex items-center gap-1 text-amber-500">
                          {ratingValues.map((value) => (
                            <Star
                              key={value}
                              className={`h-3.5 w-3.5 ${value <= entry.rating ? "fill-current" : "text-muted-foreground/30"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {entry.subject || "Untitled feedback"}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-3 mt-1">{entry.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.created_at ? format(new Date(entry.created_at), "MMM d, yyyy · h:mm a") : "Recently submitted"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No reviews yet. Submit the first one above.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewsPage;