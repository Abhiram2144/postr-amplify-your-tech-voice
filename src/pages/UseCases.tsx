import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Rocket, GraduationCap, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const useCases = [
  {
    icon: Code,
    title: "Developers",
    subtitle: "Building in public",
    description:
      "Share your coding journey, explain technical concepts, and build in public. Postr helps you articulate complex ideas in ways that resonate with other developers.",
    examples: [
      "Side project updates",
      "Technical deep dives",
      "Code review insights",
      "Learning in public",
    ],
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Rocket,
    title: "Founders",
    subtitle: "Growing authority",
    description:
      "Build authority while building your startup. Share your journey, lessons learned, and technical decisions without spending hours on content creation.",
    examples: [
      "Startup journey posts",
      "Technical decision logs",
      "Product updates",
      "Founder insights",
    ],
    color: "from-orange-500 to-red-500",
  },
  {
    icon: GraduationCap,
    title: "Students",
    subtitle: "Sharing learnings",
    description:
      "Document your learning journey and build a professional presence before graduation. Turn your coursework and projects into shareable content.",
    examples: [
      "Learning summaries",
      "Project showcases",
      "Interview prep content",
      "Career building posts",
    ],
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Briefcase,
    title: "Professionals",
    subtitle: "Improving visibility",
    description:
      "Stand out in your career by sharing your expertise. Postr helps engineers and tech professionals build visibility without the content creation overhead.",
    examples: [
      "Industry insights",
      "Career advice",
      "Technical tutorials",
      "Professional updates",
    ],
    color: "from-blue-500 to-cyan-500",
  },
];

const UseCases = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? useCases.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === useCases.length - 1 ? 0 : prev + 1));
  };

  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const normalizedDiff = ((diff + useCases.length) % useCases.length);
    
    // Handle wrapping for visual display
    let visualDiff = diff;
    if (normalizedDiff > useCases.length / 2) {
      visualDiff = diff - useCases.length;
    } else if (normalizedDiff < -useCases.length / 2) {
      visualDiff = diff + useCases.length;
    }

    const isActive = index === activeIndex;
    const isNeighbor = Math.abs(visualDiff) === 1;
    const isHidden = Math.abs(visualDiff) > 1;

    return {
      opacity: isActive ? 1 : isNeighbor ? 0.5 : 0,
      scale: isActive ? 1 : isNeighbor ? 0.85 : 0.7,
      x: visualDiff * 180,
      zIndex: isActive ? 10 : isNeighbor ? 5 : 0,
      display: isHidden ? "none" : "flex",
    };
  };

  const activeCase = useCases[activeIndex];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Built for people who{" "}
              <span className="gradient-text">ship and share</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              See how different tech professionals use Postr to grow their presence
              and share their expertise.
            </p>
          </motion.div>

          {/* Carousel Section */}
          <div className="mt-16 sm:mt-20">
            {/* Cards Carousel */}
            <div className="relative flex items-center justify-center">
              {/* Previous Button */}
              <button
                onClick={goToPrev}
                className="absolute left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:left-8 md:left-16"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Cards Container */}
              <div className="relative flex h-[280px] w-full items-center justify-center overflow-hidden sm:h-[320px]">
                {useCases.map((useCase, index) => {
                  const style = getCardStyle(index);
                  const Icon = useCase.icon;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={false}
                      animate={style}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      onClick={() => setActiveIndex(index)}
                      className="absolute flex h-[220px] w-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-border bg-card shadow-lg sm:h-[260px] sm:w-[180px]"
                      style={{ display: style.display }}
                    >
                      {/* Gradient Background */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${useCase.color} opacity-10`} />
                      
                      {/* Icon */}
                      <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${useCase.color} sm:h-20 sm:w-20`}>
                        <Icon className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="relative mt-4 text-base font-bold text-foreground sm:text-lg">
                        {useCase.title}
                      </h3>
                      <p className="relative mt-1 text-xs text-muted-foreground sm:text-sm">
                        {useCase.subtitle}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNext}
                className="absolute right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:right-8 md:right-16"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="mt-6 flex justify-center gap-2">
              {useCases.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-6 bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Content Area */}
            <div className="mx-auto mt-10 max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border border-border bg-muted/50 p-6 sm:p-8"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
                    {/* Description */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                        {activeCase.title}
                      </h3>
                      <p className="mt-3 leading-relaxed text-muted-foreground">
                        {activeCase.description}
                      </p>
                    </div>

                    {/* Examples */}
                    <div className="lg:w-56">
                      <h4 className="text-sm font-semibold text-muted-foreground">
                        Example content
                      </h4>
                      <ul className="mt-3 space-y-2">
                        {activeCase.examples.map((example, i) => (
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
              </AnimatePresence>
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center sm:mt-16"
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
