import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock } from "lucide-react";

const Careers = () => {
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
            Join the <span className="text-primary">Team</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            We're building the future of content creation for tech professionals. Want to be part of it?
          </motion.p>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl">
            {/* Why Join */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border bg-card p-8 sm:p-12"
            >
              <h2 className="text-2xl font-bold text-foreground">Why Postr?</h2>
              <ul className="mt-6 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Remote-first — work from anywhere in the world</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Small, focused team where every contribution matters</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Work at the intersection of AI and content creation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Competitive equity packages for early team members</span>
                </li>
              </ul>
            </motion.div>

            {/* No Openings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center"
            >
              <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No Open Positions Right Now</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We don't have any openings at the moment, but we're always looking for talented people.
                Drop us a line at{" "}
                <a href="mailto:careers@postr.app" className="text-primary hover:underline">
                  careers@postr.app
                </a>{" "}
                and tell us what you'd bring to the team.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
