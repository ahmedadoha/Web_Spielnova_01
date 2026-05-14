"use client"

import Image from "next/image"
import Link from "next/link"
import { Clock, Users } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface GameCardProps {
    title: string
    description: string
    imageSrc: string
    duration?: string
    players?: string
    href: string
    category?: string
    buttonText?: string
    hideFooter?: boolean
    onClickImage?: () => void
}

export function GameCard({
    title,
    description,
    imageSrc,
    duration,
    players,
    href,
    category,
    buttonText,
    hideFooter,
    onClickImage,
}: GameCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card className="flex h-full flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]">
                {onClickImage ? (
                    // Simulators: clicking image opens the video player
                    <div
                        className="relative aspect-video w-full overflow-hidden cursor-pointer group/img"
                        onClick={onClickImage}
                    >
                        <Image
                            src={imageSrc}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover/img:scale-110"
                        />
                        {category && (
                            <Badge className="absolute right-3 top-3 bg-black/70 text-foreground hover:bg-black/90 backdrop-blur-md border-secondary/50">
                                {category}
                            </Badge>
                        )}
                    </div>
                ) : (
                    // All other pages: clicking the image navigates to the game detail page
                    <Link href={href} className="relative aspect-video w-full overflow-hidden block group/img">
                        <Image
                            src={imageSrc}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover/img:scale-110"
                        />
                        {category && (
                            <Badge className="absolute right-3 top-3 bg-black/70 text-foreground hover:bg-black/90 backdrop-blur-md border-secondary/50">
                                {category}
                            </Badge>
                        )}
                    </Link>
                )}
                <CardHeader>
                    <CardTitle className="line-clamp-1 text-xl font-bold tracking-wide">{title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                        {description}
                    </CardDescription>
                </CardContent>
                {!hideFooter && (
                    <CardFooter>
                        <Button asChild className="w-full font-bold group bg-secondary/10 text-secondary hover:bg-secondary hover:text-secondary-foreground border border-secondary/20">
                            <Link href={href}>
                                {buttonText || "Details & Buchen"}
                            </Link>
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </motion.div>
    )
}
