import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/sigil.png"
                alt="Providence"
                className="h-8 w-8 rounded-lg"
              />
              <span className="font-bold text-xl">Providence</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Explore, craft, and survive in the dangerous Slipworlds. Your
              legacy awaits in the abyss.
            </p>
            <div className="mt-6 flex space-x-4">
              <Link
                href="https://x.com/playprovidence"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="https://discord.com/invite/9mxcWFfzXh"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="sr-only">Discord</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </Link>
              <Link
                href="https://www.facebook.com/PlayProvidence"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669c1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Link>
              <Link
                href="https://www.instagram.com/playprovidence.io/"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.987 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297L3.771 17.36c-.784-.784-1.297-1.862-1.297-3.056c0-2.385 1.932-4.317 4.317-4.317c1.194 0 2.272.513 3.056 1.297l1.669-1.355c.807-.875 1.958-1.365 3.255-1.365c2.385 0 4.317 1.932 4.317 4.317c0 1.194-.513 2.272-1.297 3.056l-1.669 1.355c-.807.875-1.958 1.365-3.255 1.365z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Game */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Game</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="https://playprovidence.io/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  The Game
                </Link>
              </li>
              <li>
                <Link
                  href="/bounty"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Bounty
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Chronicles
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Community</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="https://discord.com/invite/9mxcWFfzXh"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Discord
                </Link>
              </li>
              <li>
                <Link
                  href="https://playprovidence.io/faq"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Dynasty Studios */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Dynasty Studios
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="https://playprovidence.io/the-team"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  The Team
                </Link>
              </li>
              <li>
                <Link
                  href="https://playprovidence.io/careers"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="https://playprovidence.io/press"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Press
                </Link>
              </li>
              <li>
                <Link
                  href="https://playprovidence.io/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2024 Dynasty Studios. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Link
                href="https://playprovidence.io/terms-of-use"
                className="hover:text-primary transition-colors"
              >
                Terms of Use
              </Link>
              <span>•</span>
              <Link
                href="https://playprovidence.io/privacy-policy"
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <span>•</span>
              <Link
                href="https://store.epicgames.com/p/providence-2bff8d"
                className="hover:text-primary transition-colors"
              >
                Early Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
