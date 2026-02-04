import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { User } from "lucide-react";

const productLinks = [
  { label: "Features", href: "/product", isRoute: true },
  { label: "Use Cases", href: "/use-cases", isRoute: true },
  { label: "Pricing", href: "/pricing", isRoute: true },
  { label: "Docs", href: "/docs", isRoute: true },
];

const companyLinks = [
  { label: "About", href: "#", isRoute: false },
  { label: "Blog", href: "#", isRoute: false },
  { label: "Careers", href: "#", isRoute: false },
  { label: "Contact", href: "#", isRoute: false },
];

const legalLinks = [
  { label: "Privacy", href: "#", isRoute: false },
  { label: "Terms", href: "#", isRoute: false },
];

const Footer = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const renderLink = (link: { label: string; href: string; isRoute: boolean }, index: number) => {
    const className = "text-sm text-muted-foreground transition-colors hover:text-primary";

    if (link.isRoute) {
      return (
        <motion.div
          key={link.label}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 + index * 0.05 }}
        >
          <Link to={link.href} className={className}>
            {link.label}
          </Link>
        </motion.div>
      );
    }
    return (
      <motion.div
        key={link.label}
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1 + index * 0.05 }}
      >
        <a href={link.href} className={className}>
          {link.label}
        </a>
      </motion.div>
    );
  };

  return (
    <footer ref={ref} className="border-t border-border bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-5">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="md:col-span-2"
          >
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-black text-primary-foreground">P</span>
              </div>
              <span className="text-xl font-bold text-foreground">Postr</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Transform your ideas into engaging content for LinkedIn, X, Threads, Reddit, Instagram, Tiktok and
              Youtube.
            </p>

            {/* About Creator Link */}
            <motion.a
              href="#"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <User className="h-4 w-4" />
              About me, creator of Postr
            </motion.a>
          </motion.div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Product</h4>
            <div className="mt-4 flex flex-col gap-3">{productLinks.map((link, index) => renderLink(link, index))}</div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <div className="mt-4 flex flex-col gap-3">{companyLinks.map((link, index) => renderLink(link, index))}</div>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <div className="mt-4 flex flex-col gap-3">{legalLinks.map((link, index) => renderLink(link, index))}</div>
          </div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row"
        >
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Postr. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Built for tech creators, by tech creators.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
