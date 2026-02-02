import { Link } from "react-router-dom";

const Footer = () => {
  const productLinks = [
    { label: "Features", href: "/product", isRoute: true },
    { label: "Use Cases", href: "/use-cases", isRoute: true },
    { label: "Pricing", href: "/pricing", isRoute: true },
    { label: "Documentation", href: "/docs", isRoute: true },
  ];

  const companyLinks = [
    { label: "About", href: "#about", isRoute: false },
    { label: "Blog", href: "#blog", isRoute: false },
    { label: "Careers", href: "#careers", isRoute: false },
  ];

  const legalLinks = [
    { label: "Privacy", href: "#privacy", isRoute: false },
    { label: "Terms", href: "#terms", isRoute: false },
  ];

  const renderLink = (link: { label: string; href: string; isRoute: boolean }) => {
    if (link.isRoute) {
      return (
        <Link
          to={link.href}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {link.label}
        </Link>
      );
    }
    return (
      <a
        href={link.href}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {link.label}
      </a>
    );
  };

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-black text-primary-foreground">P</span>
              </div>
              <span className="text-xl font-bold">Postr</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Content intelligence for tech creators. Transform your ideas into
              high-quality posts across platforms.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold">Product</h3>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold">Company</h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold">Legal</h3>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Postr. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              X
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;