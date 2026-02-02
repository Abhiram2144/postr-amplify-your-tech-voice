import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What input formats does Postr support?",
    answer:
      "Postr supports video files (MP4, MOV, WebM), audio files (MP3, WAV), and text input including scripts, notes, and raw ideas. Simply paste or upload your content to get started.",
  },
  {
    question: "Which platforms can Postr generate content for?",
    answer:
      "Postr generates platform-specific content for LinkedIn, X (Twitter), Threads, and Reddit. Each output is formatted and optimized for that platform's unique culture and engagement patterns.",
  },
  {
    question: "How is Postr different from ChatGPT or other AI writers?",
    answer:
      "Postr is built specifically for tech content creators. It analyzes your content structure first, provides improvement advice, and then generates platform-native outputs. Generic AI tools just generate—Postr thinks first.",
  },
  {
    question: "Can I customize the tone and style of outputs?",
    answer:
      "Yes! Pro users can adjust tone settings to match their personal voice. The system learns from your preferences over time to create more consistent, on-brand content.",
  },
  {
    question: "How accurate is the video transcription?",
    answer:
      "Our transcription is highly accurate for clear audio. For best results, use videos with minimal background noise and clear speech. You can also edit transcripts before generating posts.",
  },
  {
    question: "Is my content stored or used for training?",
    answer:
      "Your content is processed securely and not used to train our models. We respect your intellectual property and maintain strict privacy standards.",
  },
];

const Docs = () => {
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
              Documentation
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              How <span className="gradient-text">Postr</span> works
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Everything you need to know about using Postr effectively.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-16 max-w-3xl"
          >
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="mt-8">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Docs;