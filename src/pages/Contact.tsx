import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Mail, MessageSquare, HelpCircle } from "lucide-react";

const channels = [
  {
    icon: Mail,
    title: "Email Us",
    description: "For general inquiries and partnerships.",
    action: "hello@postr.app",
    href: "mailto:hello@postr.app",
  },
  {
    icon: HelpCircle,
    title: "Support",
    description: "Need help with your account or a feature?",
    action: "support@postr.app",
    href: "mailto:support@postr.app",
  },
  {
    icon: MessageSquare,
    title: "Feedback",
    description: "Have an idea or suggestion? We'd love to hear it.",
    action: "feedback@postr.app",
    href: "mailto:feedback@postr.app",
  },
];

const Contact = () => {
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
            Get in <span className="text-primary">Touch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            We're a small team and we read every message. Reach out — we'd love to hear from you.
          </motion.p>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
            {channels.map((channel, i) => (
              <motion.a
                key={channel.title}
                href={channel.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/30"
              >
                <channel.icon className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">{channel.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{channel.description}</p>
                <p className="mt-3 text-sm font-medium text-primary group-hover:underline">{channel.action}</p>
              </motion.a>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
