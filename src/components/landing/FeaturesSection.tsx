import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Video, FileSearch, Lightbulb, FileText, Brain, Sparkles } from "lucide-react";

// Platform logos as simple SVG components
const LinkedInIcon = () => <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>;
const XIcon = () => <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>;
const ThreadsIcon = () => <svg viewBox="0 0 192 192" className="h-6 w-6" fill="currentColor">
    <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.398c-15.09 0-27.632 6.497-35.302 18.27l13.186 9.045c5.706-8.667 14.468-12.876 26.116-12.876h.282c10.122.062 17.763 3.004 22.705 8.74 3.594 4.174 5.991 9.878 7.18 17.081a83.793 83.793 0 0 0-22.364-2.742c-26.118 0-42.884 13.752-43.643 35.777-.394 11.48 4.23 22.306 13.021 30.475 8.331 7.74 19.205 11.802 30.616 11.426 15.09-.497 26.89-6.258 35.063-17.12 6.21-8.253 10.083-18.815 11.596-31.683 6.937 4.193 12.08 9.743 14.805 16.545 4.612 11.518 4.882 30.46-9.478 44.82-12.613 12.613-27.771 18.087-50.744 18.26-25.476-.192-44.735-8.374-57.26-24.328-11.69-14.89-17.734-36.03-17.963-62.829.229-26.8 6.273-47.94 17.963-62.83C62.527 19.373 81.786 11.19 107.262 11c25.632.192 45.095 8.474 57.848 24.62 6.254 7.914 10.98 17.608 14.08 28.67l15.378-4.148c-3.652-13.02-9.449-24.582-17.298-34.51C161.182 5.846 137.543-3.755 107.158-4h-.208c-30.22.244-53.666 9.83-69.678 28.5C21.778 42.548 14.063 68.147 13.776 99.86v.28c.287 31.712 8.002 57.312 23.496 75.36 16.012 18.67 39.458 28.256 69.678 28.5h.208c27.263-.193 46.696-7.24 63.007-22.815 20.892-19.946 20.04-45.062 13.478-61.463-4.708-11.775-14.015-21.317-26.96-27.738-.054-.027-.11-.05-.146-.068Zm-49.146 55.755c-12.656.417-25.849-4.96-26.163-17.087-.233-9.024 6.39-19.138 28.238-19.138 2.5 0 4.9.127 7.19.364 5.108.529 9.912 1.533 14.366 2.958-1.632 22.597-12.466 32.464-23.631 32.903Z" />
  </svg>;
const RedditIcon = () => <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
  </svg>;
const YouTubeIcon = () => <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>;
const TikTokIcon = () => <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>;
const features = [{
  icon: Video,
  title: "Video to transcript extraction",
  description: "Upload any video and get clean, accurate transcripts instantly."
}, {
  icon: FileSearch,
  title: "Structured content scoring",
  description: "AI analyzes your content's structure, clarity, and engagement potential."
}, {
  icon: Lightbulb,
  title: "Narrative improvement advice",
  description: "Get actionable suggestions to strengthen your storytelling and flow."
}, {
  icon: Brain,
  title: "Psychological hooks",
  description: "Generate attention-grabbing hooks using proven psychological frameworks."
}];
const textPlatforms = [{
  icon: LinkedInIcon,
  name: "LinkedIn posts",
  color: "text-[#0A66C2]"
}, {
  icon: XIcon,
  name: "X threads",
  color: "text-foreground"
}, {
  icon: ThreadsIcon,
  name: "Threads posts",
  color: "text-foreground"
}, {
  icon: RedditIcon,
  name: "Reddit discussions",
  color: "text-[#FF4500]"
}];
const videoPlatforms = [{
  icon: InstagramIcon,
  name: "Instagram Reels",
  color: "text-[#E4405F]"
}, {
  icon: YouTubeIcon,
  name: "YouTube Shorts",
  color: "text-[#FF0000]"
}, {
  icon: TikTokIcon,
  name: "TikTok scripts",
  color: "text-foreground"
}];
const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px"
  });
  return <section ref={ref} className="relative border-t border-border py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(187,92%,42%,0.03),transparent_70%)]" />

      <div className="container relative mx-auto px-4">
        <motion.div initial={{
        opacity: 0,
        y: 40
      }} animate={isInView ? {
        opacity: 1,
        y: 0
      } : {}} transition={{
        duration: 0.6
      }} className="text-center">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            Features
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Everything you need to{" "}
            <span className="gradient-text">create and publish</span>
          </h2>
        </motion.div>

        {/* Main Features - Alternating Layout */}
        <div className="mx-auto mt-16 max-w-5xl space-y-16">
          {features.map((feature, index) => <motion.div key={index} initial={{
          opacity: 0,
          x: index % 2 === 0 ? -40 : 40
        }} animate={isInView ? {
          opacity: 1,
          x: 0
        } : {}} transition={{
          duration: 0.6,
          delay: 0.2 + index * 0.1
        }} className={`flex flex-col items-center gap-8 md:flex-row ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
              {/* Feature Visual */}
              <motion.div whileHover={{
            scale: 1.05
          }} className="flex h-48 w-full items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 md:w-1/2">
                <feature.icon className="h-20 w-20 text-primary/60" />
              </motion.div>

              {/* Feature Content */}
              <div className="w-full text-center md:w-1/2 md:text-left">
                <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
                <p className="mt-3 text-lg text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>)}
        </div>

        {/* Platform Outputs - Text Platforms */}
        <motion.div initial={{
        opacity: 0,
        y: 40
      }} animate={isInView ? {
        opacity: 1,
        y: 0
      } : {}} transition={{
        duration: 0.6,
        delay: 0.6
      }} className="mx-auto mt-24 max-w-5xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-sm font-medium text-accent">
              <FileText className="h-4 w-4" />
              Text Content
            </span>
            <h3 className="mt-4 text-xl font-bold text-foreground">
              Generate posts for social platforms
            </h3>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {textPlatforms.map((platform, index) => <motion.div key={index} initial={{
            opacity: 0,
            scale: 0.9
          }} animate={isInView ? {
            opacity: 1,
            scale: 1
          } : {}} transition={{
            duration: 0.4,
            delay: 0.7 + index * 0.1
          }} whileHover={{
            y: -4,
            scale: 1.02
          }} className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                <div className={`${platform.color} transition-transform group-hover:scale-110`}>
                  <platform.icon />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                  {platform.name}
                </span>
              </motion.div>)}
          </div>
        </motion.div>

        {/* Platform Outputs - Video Scripts */}
        <motion.div initial={{
        opacity: 0,
        y: 40
      }} animate={isInView ? {
        opacity: 1,
        y: 0
      } : {}} transition={{
        duration: 0.6,
        delay: 0.8
      }} className="mx-auto mt-16 max-w-5xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary text-[\"#944dff\"] ">
              <Sparkles className="h-4 w-4" />
              Short-Form Video Scripts
            </span>
            <h3 className="mt-4 text-xl font-bold text-foreground">
              Scripts with psychological hooks that capture attention
            </h3>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {videoPlatforms.map((platform, index) => <motion.div key={index} initial={{
            opacity: 0,
            scale: 0.9
          }} animate={isInView ? {
            opacity: 1,
            scale: 1
          } : {}} transition={{
            duration: 0.4,
            delay: 0.9 + index * 0.1
          }} whileHover={{
            y: -4,
            scale: 1.02
          }} className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-gradient-to-br from-card to-secondary/50 p-8 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                <div className={`${platform.color} transition-transform group-hover:scale-110`}>
                  <platform.icon />
                </div>
                <span className="font-medium text-foreground">{platform.name}</span>
                <span className="text-xs text-muted-foreground">with psychological hooks</span>
              </motion.div>)}
          </div>
        </motion.div>
      </div>
    </section>;
};
export default FeaturesSection;