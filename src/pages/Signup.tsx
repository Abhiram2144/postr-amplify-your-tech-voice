import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";

const benefits = [
  "Free plan with 5 generations/month",
  "No credit card required",
  "Cancel anytime",
];

const Signup = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - Form */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mx-auto w-full max-w-sm"
        >
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-black text-primary-foreground">P</span>
            </div>
            <span className="text-xl font-bold">Postr</span>
          </Link>

          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-2 text-muted-foreground">
            Start creating content in minutes
          </p>

          <form className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-secondary"
              />
            </div>

            <Button variant="hero" className="w-full" type="submit">
              Create account
            </Button>
          </form>

          <ul className="mt-6 space-y-2">
            {benefits.map((benefit, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="h-4 w-4 text-accent" />
                {benefit}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right panel - Visual */}
      <div className="hidden flex-1 items-center justify-center bg-card lg:flex">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
            <span className="text-4xl font-black text-accent">P</span>
          </div>
          <h2 className="mt-6 text-2xl font-bold">
            Join <span className="gradient-text">10,000+</span> tech creators
          </h2>
          <p className="mt-4 text-muted-foreground">
            Developers, founders, and engineers trust Postr to help them build
            their presence online.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;