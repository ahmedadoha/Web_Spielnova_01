"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Zap } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <div className="border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center px-4 md:px-6">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    {/* Replaced generic icon with Logo Image or styled text */}
                    <div className="relative h-8 w-8">
                        {/* Fallback to Icon if logo fails, but we'll try to use text mostly or the image if valid */}
                        <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <span className="hidden font-mono text-lg font-bold tracking-widest sm:inline-block">
                        SPIEL<span className="text-secondary">NOVA</span>
                    </span>
                </Link>
                <div className="hidden md:flex">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <Link href="/buchen" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Buchen
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Erlebnisse</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                        <ListItem href="/shooter_games" title="VR Shooter">
                                            Action-geladene Multiplayer Shooter (2-4 Spieler).
                                        </ListItem>
                                        <ListItem href="/escaperooms" title="VR Escape Rooms">
                                            Knifflige Rätsel in immersiven Welten (2-4 Spieler).
                                        </ListItem>
                                        <ListItem href="/simulators" title="Simulatoren">
                                            Erlebe Paragliding und Flug-Simulationen.
                                        </ListItem>
                                        <ListItem href="/arcade" title="Arcade">
                                            Klassische Arcade Games für zwischendurch.
                                        </ListItem>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/preise" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Preise & Infos
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/kontakt" legacyBehavior passHref>
                                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                        Kontakt
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="ml-auto flex items-center space-x-4">
                    <ModeToggle />
                    <Button asChild className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all hover:shadow-[0_0_25px_rgba(0,240,255,0.8)]">
                        <Link href="/buchen">Jetzt Buchen</Link>
                    </Button>

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="border-l-white/10 bg-black/95">
                            <SheetTitle className="text-left text-lg font-bold mb-4">
                                SPIEL<span className="text-secondary">NOVA</span>
                            </SheetTitle>
                            <div className="flex flex-col space-y-4 py-4">
                                <Link href="/buchen" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                                    Buchen
                                </Link>
                                <Link href="/shooter_games" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                                    VR Shooter
                                </Link>
                                <Link href="/escaperooms" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                                    VR Escape Rooms
                                </Link>
                                <Link href="/simulators" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                                    Simulatoren
                                </Link>
                                <Link href="/preise" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                                    Preise & Infos
                                </Link>
                                <Link href="/kontakt" onClick={() => setIsOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
                                    Kontakt
                                </Link>
                                <Button asChild className="mt-4 bg-primary text-primary-foreground font-bold shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                                    <Link href="/buchen" onClick={() => setIsOpen(false)}>Jetzt Buchen</Link>
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"
