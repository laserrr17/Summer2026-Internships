import Link from 'next/link';
import { Github } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-background/40 backdrop-blur-sm mt-auto">
            <div className="container mx-auto py-8 px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-foreground">
                            Summer 2026 Internship Tracker
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Built with Next.js, Tailwind CSS, and Supabase.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            href="https://github.com/SimplifyJobs/Summer2026-Internships"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm"
                        >
                            <Github className="h-4 w-4" />
                            <span>Data Source</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
