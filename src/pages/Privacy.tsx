import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl"
          >
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: February 11, 2026</p>

            <div className="mt-12 space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
                <p className="mt-3">
                  When you create an account, we collect your email address, name, and authentication details. When you use Postr, we process the content you provide (text, URLs, video links) to generate outputs. We also collect usage data to improve the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
                <ul className="mt-3 list-inside list-disc space-y-2">
                  <li>To provide and maintain the Postr service</li>
                  <li>To process your content generation requests</li>
                  <li>To manage your account and subscription</li>
                  <li>To communicate with you about service updates</li>
                  <li>To improve our AI models and content quality</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">3. Data Storage & Security</h2>
                <p className="mt-3">
                  Your data is stored securely using industry-standard encryption. We use Supabase for data storage with row-level security policies. We do not sell your personal data to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">4. Third-Party Services</h2>
                <p className="mt-3">
                  We use third-party services including Stripe for payment processing, Supabase for authentication and data storage, and AI providers for content generation. Each has their own privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">5. Your Rights</h2>
                <p className="mt-3">
                  You can access, update, or delete your account data at any time through your dashboard settings. You can request a full data export by contacting us at{" "}
                  <a href="mailto:privacy@postr.app" className="text-primary hover:underline">privacy@postr.app</a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">6. Cookies</h2>
                <p className="mt-3">
                  We use essential cookies for authentication and session management. We do not use third-party advertising cookies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
                <p className="mt-3">
                  For privacy-related inquiries, contact us at{" "}
                  <a href="mailto:privacy@postr.app" className="text-primary hover:underline">privacy@postr.app</a>.
                </p>
              </section>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
