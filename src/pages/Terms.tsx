import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";

const Terms = () => {
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
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: February 11, 2026</p>

            <div className="mt-12 space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
                <p className="mt-3">
                  By accessing or using Postr, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
                <p className="mt-3">
                  Postr is a content generation platform that helps tech professionals create social media content from various inputs including text, URLs, and video links. The service uses AI to generate and optimize content for multiple platforms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
                <ul className="mt-3 list-inside list-disc space-y-2">
                  <li>You must provide accurate information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>One person or entity per account — no shared accounts</li>
                  <li>You must be at least 18 years old to use Postr</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">4. Content Ownership</h2>
                <p className="mt-3">
                  You retain ownership of the input content you provide and the generated outputs. By using Postr, you grant us a limited license to process your content solely for the purpose of providing the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">5. Usage Limits & Billing</h2>
                <p className="mt-3">
                  Free accounts have limited monthly generations. Paid plans offer higher limits as described on our pricing page. Subscriptions are billed monthly and can be cancelled at any time. Refunds are handled on a case-by-case basis.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">6. Prohibited Uses</h2>
                <ul className="mt-3 list-inside list-disc space-y-2">
                  <li>Generating spam, misleading, or harmful content</li>
                  <li>Attempting to reverse-engineer or exploit the AI systems</li>
                  <li>Violating any applicable laws or third-party rights</li>
                  <li>Reselling generated content as an automated service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
                <p className="mt-3">
                  Postr is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">8. Changes to Terms</h2>
                <p className="mt-3">
                  We may update these terms from time to time. Continued use of Postr after changes constitutes acceptance. We will notify users of material changes via email.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">9. Contact</h2>
                <p className="mt-3">
                  Questions about these terms? Contact us at{" "}
                  <a href="mailto:legal@postr.app" className="text-primary hover:underline">legal@postr.app</a>.
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

export default Terms;
