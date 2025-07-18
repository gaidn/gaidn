"use client";

import { LeaderboardSectionProps } from "@/types/blocks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import Link from "next/link";

export function LeaderboardSection({ 
  title, 
  description, 
  buttonText,
  className 
}: LeaderboardSectionProps): JSX.Element {
  return (
    <section className={cn(
      "py-16 px-4 bg-muted/30",
      className
    )}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold">
            {title}
          </h2>
        </div>
        
        <div className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto space-y-2 leading-relaxed">
          {description.split('。').filter(sentence => sentence.trim()).map((sentence, index, array) => (
            <p key={index} className="leading-7">
              {sentence.trim()}{index < array.length - 1 ? '。' : ''}
            </p>
          ))}
        </div>

        <Button
          size="lg"
          variant="secondary"
          className="flex items-center gap-2 px-6 py-3 text-base font-medium hover:scale-102 transition-all duration-300 shadow-lg hover:shadow-xl -mt-2"
          asChild
        >
          <Link href="/leaderboard">
            <Trophy className="h-5 w-5" />
            {buttonText}
          </Link>
        </Button>
      </div>
    </section>
  );
}