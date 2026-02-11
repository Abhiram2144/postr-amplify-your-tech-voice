import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Users, Target, Zap, Heart } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "We believe every tech professional has valuable insights to share. Postr makes it effortless to turn those insights into engaging content.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "Built by creators who understand the challenges of consistent content creation in the tech space.",
  },
  {
    icon: Zap,
    title: "Speed & Quality",
    description: "We refuse to compromise. Postr delivers both — lightning-fast generation with professional-grade output.",
  },
  {
    icon: Heart,
    title: "Creator Empowerment",
    description: "Our goal is to amplify your voice, not replace it. Every piece of content sounds like you, only better.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            About <span className="text-primary">Postr</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Postr was born from a simple frustration: tech professionals have incredible knowledge but struggle to share it consistently on social media. We're here to change that.
          </motion.p>
        </section>

        {/* Story */}
        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border bg-card p-8 sm:p-12"
            >
              <h2 className="text-2xl font-bold text-foreground">Our Story</h2>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                  As a tech creator, I spent hours every week crafting posts for LinkedIn, X, and other platforms. The ideas were there, but turning them into polished, platform-optimized content was a grind.
                </p>
                <p>
                  Postr started as a personal tool — a way to take raw ideas, articles, and even YouTube videos and transform them into ready-to-publish posts. When friends and colleagues started asking for access, I knew we were onto something.
                </p>
                <p>
                  Today, Postr helps hundreds of tech professionals build their personal brand without sacrificing their evenings and weekends to content creation.
                </p>
              </div>
              <p className="mt-6 text-sm font-medium text-primary">— AR, Founder of Postr</p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-center text-3xl font-bold text-foreground">What We Stand For</h2>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-2">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <value.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
