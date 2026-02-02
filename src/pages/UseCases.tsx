import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Rocket, GraduationCap, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const useCases = [
  {
    icon: Code,
    title: "Developers",
    description:
      "Share your coding journey, explain technical concepts, and build in public. Postr helps you articulate complex ideas in ways that resonate with other developers.",
    examples: [
      "Side project updates",
      "Technical deep dives",
      "Code review insights",
      "Learning in public",
    ],
  },
  {
    icon: Rocket,
    title: "Founders",
    description:
      "Build authority while building your startup. Share your journey, lessons learned, and technical decisions without spending hours on content creation.",
    examples: [
      "Startup journey posts",
      "Technical decision logs",
      "Product updates",
      "Founder insights",
    ],
  },
  {
    icon: GraduationCap,
    title: "Students",
    description:
      "Document your learning journey and build a professional presence before graduation. Turn your coursework and projects into shareable content.",
    examples: [
      "Learning summaries",
      "Project showcases",
      "Interview prep content",
      "Career building posts",
    ],
  },
  {
    icon: Briefcase,
    title: "Tech Professionals",
    description:
      "Stand out in your career by sharing your expertise. Postr helps engineers and tech professionals build visibility without the content creation overhead.",
    examples: [
      "Industry insights",
      "Career advice",
      "Technical tutorials",
      "Professional updates",
    ],
  },
];

const UseCases = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
              Use Cases
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              Built for people who{" "}
              <span className="gradient-text">ship and share</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              See how different tech professionals use Postr to grow their presence
              and share their expertise.
            </p>
          </motion.div>

          <div className="mx-auto mt-16 max-w-5xl space-y-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="rounded-2xl border border-border bg-card p-8"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
                  <div className="flex-1">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                      <useCase.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="mt-4 text-2xl font-bold">{useCase.title}</h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      {useCase.description}
                    </p>
                  </div>
                  <div className="lg:w-64">
                    <h4 className="text-sm font-semibold text-muted-foreground">
                      Example content
                    </h4>
                    <ul className="mt-3 space-y-2">
                      {useCase.examples.map((example, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-foreground"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">
                Get started free
                <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UseCases;