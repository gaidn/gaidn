"use client";

import { CTASectionProps } from "@/types/blocks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Github, Trophy } from "lucide-react";
import Link from "next/link";

export function CTASection({ 
  title, 
  description, 
  loginButtonText,
  leaderboardButtonText,
  className 
}: CTASectionProps): JSX.Element {
  return (
    <section className={cn(
      "py-20 px-4",
      className
    )}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {title}
        </h2>
        
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="flex items-center gap-2 px-8 py-6 text-lg font-medium hover:scale-105 transition-all duration-300"
            onClick={() => window.location.href = "/auth/signin"}
          >
            <Github className="h-5 w-5" />
            {loginButtonText}
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="flex items-center gap-2 px-8 py-6 text-lg font-medium hover:scale-105 transition-all duration-300"
            asChild
          >
            <Link href="/leaderboard">
              <Trophy className="h-5 w-5" />
              {leaderboardButtonText}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}