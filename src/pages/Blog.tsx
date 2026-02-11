import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const posts = [
  {
    title: "Why Every Developer Should Build a Personal Brand in 2026",
    excerpt: "The tech job market is evolving. Here's why your online presence matters more than ever, and how to start building it today.",
    date: "Feb 8, 2026",
    category: "Personal Branding",
    readTime: "5 min read",
  },
  {
    title: "From YouTube Video to 10 LinkedIn Posts: A Complete Workflow",
    excerpt: "Learn how to repurpose a single video into a week's worth of engaging LinkedIn content using Postr's video pipeline.",
    date: "Feb 3, 2026",
    category: "Tutorials",
    readTime: "7 min read",
  },
  {
    title: "The Anatomy of a Viral Tech Post on X (Twitter)",
    excerpt: "We analyzed 500 high-performing tech posts to find what makes them tick. Here are the patterns we uncovered.",
    date: "Jan 28, 2026",
    category: "Insights",
    readTime: "6 min read",
  },
  {
    title: "How to Write for Reddit Without Getting Downvoted",
    excerpt: "Reddit is a goldmine for tech creators — if you know the rules. Here's our guide to authentic engagement.",
    date: "Jan 20, 2026",
    category: "Platform Tips",
    readTime: "4 min read",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 py-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            The Postr <span className="text-primary">Blog</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Tips, insights, and strategies for tech creators who want to grow their audience.
          </motion.p>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {posts.map((post, i) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group cursor-pointer rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read more <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">More articles coming soon. Stay tuned!</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
