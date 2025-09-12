"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignInModal } from "@/components/signin-modal";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActivePage = (path: string) => {
    if (path === "/bounty" && pathname === "/bounty") return true;
    if (path === "/leaderboard" && pathname === "/leaderboard") return true;
    return false;
  };

  const getNavLinkClasses = (path: string) => {
    const baseClasses =
      "group inline-flex h-10 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none disabled:pointer-events-none disabled:opacity-50 drop-shadow-md";

    if (isActivePage(path)) {
      return `${baseClasses} bg-primary/20 text-white border border-primary/30`;
    }

    return `${baseClasses} text-white/90 hover:bg-white/10 hover:text-white hover:scale-105 focus:bg-white/10 focus:text-white`;
  };

  return (
    <header className="fixed top-0 z-50 w-full backdrop-blur-md bg-background/10 border-b border-white/10">
      <div className="container mx-auto h-16 items-center flex justify-between px-4">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-3">
            <img src="/sigil.png" alt="Providence" className="h-8 w-8 rounded-lg shadow-lg" />
            <span className="font-bold text-xl text-white drop-shadow-lg">Providence</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              {session ? (
                <NavigationMenuLink asChild>
                  <Link href="/bounty" className={getNavLinkClasses("/bounty")}>
                    Bounty
                  </Link>
                </NavigationMenuLink>
              ) : (
                <SignInModal>
                  <span className={getNavLinkClasses("/bounty") + " cursor-pointer"}>Bounty</span>
                </SignInModal>
              )}
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/leaderboard" className={getNavLinkClasses("/leaderboard")}>
                  Chronicles
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <span className="group inline-flex h-10 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-white/50 cursor-not-allowed relative">
                Terminal
                <span className="absolute -top-1 -right-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                  Soon
                </span>
              </span>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <span className="group inline-flex h-10 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-white/50 cursor-not-allowed relative">
                Inventory
                <span className="absolute -top-1 -right-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                  Soon
                </span>
              </span>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <span className="group inline-flex h-10 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-white/50 cursor-not-allowed relative">
                Gate
                <span className="absolute -top-1 -right-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                  Soon
                </span>
              </span>
            </NavigationMenuItem>
          </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Wishlist Now Button */}
          <Button
            size="sm"
            className="bg-black overflow-hidden text-white border border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300 font-mono text-xs tracking-wider"
            // style={{
            //   clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            // }}
            onClick={() => window.open("https://store.epicgames.com/tr/p/providence-2bff8d", "_blank")}
          >
            WISHLIST NOW
          </Button>

          {session?.user ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                <AvatarFallback>{session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline-block text-sm font-medium text-white drop-shadow-md">
                {session.user.name || session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => {
                  console.log("Sign out clicked");
                  try {
                    signOut({ callbackUrl: "/" });
                  } catch (error) {
                    console.error("Sign out error:", error);
                  }
                }}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <SignInModal>
              <Button size="sm" className="cursor-pointer">
                Login
              </Button>
            </SignInModal>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto">
                  <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-white/20 transition-all">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback>
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-background/95 backdrop-blur-md border border-white/20"
              >
                <DropdownMenuItem
                  className="text-white hover:bg-white/10 cursor-pointer"
                  onClick={() => {
                    console.log("Sign out clicked");
                    try {
                      signOut({ callbackUrl: "/" });
                    } catch (error) {
                      console.error("Sign out error:", error);
                    }
                  }}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-in Menu */}
          <div className="md:hidden fixed top-0 right-0 h-screen w-full bg-black border-l border-white/20 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <img src="/sigil.png" alt="Providence" className="h-8 w-8 rounded-lg shadow-lg" />
                <span className="font-bold text-lg text-white">Menu</span>
              </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 px-6 py-6 space-y-2">
                {session ? (
                  <Link
                    href="/bounty"
                    className="flex items-center px-4 py-4 rounded-lg bg-transparent text-white hover:bg-white/10 transition-all duration-200 text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Bounty
                  </Link>
                ) : (
                  <SignInModal>
                    <span
                      className="flex items-center px-4 py-4 rounded-lg bg-transparent text-white hover:bg-white/10 transition-all duration-200 text-lg font-medium cursor-pointer"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Bounty
                    </span>
                  </SignInModal>
                )}

                <Link
                  href="/leaderboard"
                  className="flex items-center px-4 py-4 rounded-lg bg-transparent text-white hover:bg-white/10 transition-all duration-200 text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Chronicles
                </Link>

                <div className="px-4 py-4 text-white/50 text-lg">
                  <div className="flex items-center justify-between">
                    <span>Terminal</span>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">
                      Soon
                    </span>
                  </div>
                </div>

                <div className="px-4 py-4 text-white/50 text-lg">
                  <div className="flex items-center justify-between">
                    <span>Inventory</span>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">
                      Soon
                    </span>
                  </div>
                </div>

                <div className="px-4 py-4 text-white/50 text-lg">
                  <div className="flex items-center justify-between">
                    <span>Gate</span>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">
                      Soon
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="p-6 border-t border-white/20 space-y-4">
                <Button
                  size="sm"
                  className="w-full bg-black text-white border border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300 font-mono text-xs tracking-wider"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  }}
                  onClick={() => {
                    window.open("https://store.epicgames.com/tr/p/providence-2bff8d", "_blank");
                    setMobileMenuOpen(false);
                  }}
                >
                  WISHLIST NOW
                </Button>

                {session?.user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/5">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback>
                          {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {session.user.name || session.user.email}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full cursor-pointer"
                      onClick={() => {
                        console.log("Sign out clicked");
                        try {
                          signOut({ callbackUrl: "/" });
                          setMobileMenuOpen(false);
                        } catch (error) {
                          console.error("Sign out error:", error);
                        }
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <SignInModal>
                    <Button size="sm" className="w-full cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Button>
                  </SignInModal>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
