import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
    return (
        <footer className="w-full border-t border-white/10 bg-black/90 pt-12 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <h3 className="font-mono text-xl font-bold tracking-widest">
                            SPIEL<span className="text-secondary">NOVA</span>
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Dein ultimatives VR-Erlebnis in Ingolstadt. Tauche ein in neue Welten im West Park.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Erlebnisse</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/shooter_games" className="hover:text-primary transition-colors">
                                    VR Shooter
                                </Link>
                            </li>
                            <li>
                                <Link href="/escaperooms" className="hover:text-primary transition-colors">
                                    Escape Rooms
                                </Link>
                            </li>
                            <li>
                                <Link href="/simulators" className="hover:text-primary transition-colors">
                                    Simulatoren
                                </Link>
                            </li>
                            <li>
                                <Link href="/buchen" className="hover:text-primary transition-colors">
                                    Jetzt Buchen
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Rechtliches</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/oeffnungszeiten" className="hover:text-primary transition-colors">
                                    Öffnungszeiten
                                </Link>
                            </li>
                            <li>
                                <Link href="/impressum" className="hover:text-primary transition-colors">
                                    Impressum
                                </Link>
                            </li>
                            <li>
                                <Link href="/datenschutz" className="hover:text-primary transition-colors">
                                    Datenschutz
                                </Link>
                            </li>
                            <li>
                                <Link href="/agb" className="hover:text-primary transition-colors">
                                    AGB
                                </Link>
                            </li>
                            <li>
                                <Link href="/epilepsie" className="hover:text-primary transition-colors">
                                    Epilepsie Warnung
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Kontakt</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>West Park, Ingolstadt</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-primary" />
                                <span>+49 15754497518</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-primary" />
                                <span>info@spielnova.de</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} Spielnova. Alle Rechte vorbehalten.
                </div>
            </div>
        </footer>
    )
}
