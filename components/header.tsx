"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { SignInModal } from "@/components/signin-modal";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

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
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg shadow-lg"></div>
          <span className="font-bold text-xl text-white drop-shadow-lg">
            Providence
          </span>
        </Link>

        {/* Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              {session ? (
                <Link href="/bounty" legacyBehavior passHref>
                  <NavigationMenuLink className={getNavLinkClasses("/bounty")}>
                    Bounty
                  </NavigationMenuLink>
                </Link>
              ) : (
                <SignInModal>
                  <span
                    className={getNavLinkClasses("/bounty") + " cursor-pointer"}
                  >
                    Bounty
                  </span>
                </SignInModal>
              )}
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/leaderboard" legacyBehavior passHref>
                <span
                  className={getNavLinkClasses("/leaderboard")}
                >
                  Chronicles
                </span>
              </Link>
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

        {/* Auth Section */}
        <div className="flex items-center space-x-4">
          {/* Wishlist Now Button */}
          <Button
            size="sm"
            className="bg-black text-white border border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300 font-mono text-xs tracking-wider"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            }}
            onClick={() =>
              window.open(
                "https://store.epicgames.com/tr/p/providence-2bff8d",
                "_blank"
              )
            }
          >
            WISHLIST NOW
          </Button>

          {session?.user ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={session.user.image || ""}
                  alt={session.user.name || ""}
                />
                <AvatarFallback>
                  {session.user.name?.charAt(0) ||
                    session.user.email?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline-block text-sm font-medium text-white drop-shadow-md">
                {session.user.name || session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => signOut()}
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
      </div>
    </header>
  );
}
