import { HeroSectionProps } from "@/types/blocks";
import { cn } from "@/lib/utils";

export function HeroSection({ 
  title, 
  subtitle, 
  description, 
  className 
}: HeroSectionProps): JSX.Element {
  return (
    <section className={cn(
      "relative py-20 px-4 text-center",
      className
    )}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          {title}
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-medium">
          {subtitle}
        </p>
        
        <div className="max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}