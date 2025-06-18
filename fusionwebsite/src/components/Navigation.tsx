"use client";

import Link from "next/link";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import { User, Settings, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Automatic OTP Detection",
    href: "/features",
    description:
      "Detect & Copy OTPs To Clipboard Automatically.",
  },
  {
    title: "Quick Mail Summary",
    href: "/features",
    description: "Get a summary of your emails.",
  },
  {
    title: "Multiple Account Management",
    href: "/features",
    description: "Manage multiple email accounts from one interface.",
  },
  {
    title: "Multiple Login Support",
    href: "/features",
    description: "Login with Apple, Google, Microsoft and more providers.",
  },
  {
    title: "AI Mail Agent",
    href: "/features",
    description: "Intelligent AI assistant to help manage your emails.",
  },
  {
    title: "Easy Notification Popups",
    href: "/features",
    description: "Get instant notifications for important emails.",
  },
]

// ListItem component for navigation
function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

export default function Navigation() {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-full flex justify-center">
      <NavigationMenu className="dark bg-zinc-800/30 backdrop-blur-md px-4 py-2 rounded-md text-white relative z-50 w-auto border border-zinc-700/50 shadow-lg " viewport={false} orientation="horizontal">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Home</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md" 
                          href="/"
                        >
                          <div className="mt-4 mb-2 text-lg font-medium">
                            Fusion Mail
                          </div>
                          <p className="text-muted-foreground text-sm leading-tight">
                           The best way to manage your emails.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/docs" title="Introduction">
                      Your own multiple mail accounts organizer and manager  powered by AI.
                    </ListItem>
                    <ListItem href="/docs/installation" title="Installation">
                      Install the extension and start using it available for all browsers.
                    </ListItem>
                    <ListItem href="/docs/primitives/typography" title="FAQ">
                      Frequently Asked Questions.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem className="hidden sm:block">
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {components.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem className="hidden sm:block">
                <NavigationMenuTrigger>Contact</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link href="mailto:sudhanshuk1140@gmail.com">Email Us</Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link href="#contact-form" className="cursor-pointer">Contact Form</Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link href="#">Set up a meeting</Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/pricing">Pricing</Link>
              </NavigationMenuLink>
                </NavigationMenuItem>
              
                <NavigationMenuItem className="hidden sm:block">
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/about">About Us</Link>
              </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem className="hidden sm:block">
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/privacy">Privacy Policy</Link>
              </NavigationMenuLink>
                </NavigationMenuItem>
              {/* <NavigationMenuItem className="hidden sm:block">
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/try">Try Now</Link>
              </NavigationMenuLink>
                </NavigationMenuItem> */}

        
              
              <NavigationMenuItem>
                {status === "loading" ? (
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Loading...
                  </NavigationMenuLink>
                ) : session ? (
                  <div className="relative">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className= {navigationMenuTriggerStyle()}>
                          <User className="mr-2 h-4 w-4 " />
                          Account
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="w-56 bg-zinc-800 border-zinc-700 text-white z-[9999]" 
                        align="end"
                        sideOffset={5}
                        avoidCollisions={true}
                        sticky="always"
                        side="bottom"
                        alignOffset={0}
                      >
                        <DropdownMenuItem asChild>
                          <Link href="/settings" className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/payments" className="cursor-pointer">
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Payments</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href="/login">Login</Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
      </div>
  );
} 