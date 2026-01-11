"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
    title: string
    subtitle?: string
    className?: string
    centered?: boolean
}

export function SectionHeader({ title, subtitle, className, centered = true }: SectionHeaderProps) {
    return (
        <div className={cn("mb-12 space-y-4", centered && "text-center", className)}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        {title}
                    </span>
                </h2>
                {subtitle && (
                    <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-primary to-secondary" />
                )}
                {subtitle && (
                    <p className={cn("mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl", !centered && "mx-0")}>
                        {subtitle}
                    </p>
                )}
            </motion.div>
        </div>
    )
}
