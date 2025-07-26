import type { HeroSectionProps } from "@/types/blocks";
import { cn } from "@/lib/utils";

export function HeroSection({ 
  title, 
  subtitle, 
  description, 
  className 
}: HeroSectionProps): JSX.Element {
  return (
    <section className={cn(
      "relative py-32 px-4 text-center overflow-hidden",
      className
    )}>
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 -z-10">
        {/* 主要渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-muted/50"></div>
        
        {/* 动态装饰圆圈 */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/12 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -top-20 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* 浮动粒子装饰 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/6 w-2 h-2 bg-primary/40 rounded-full animate-ping delay-300"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-accent/60 rounded-full animate-ping delay-700"></div>
          <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-primary/30 rounded-full animate-ping delay-1100"></div>
          <div className="absolute top-1/2 right-1/6 w-1 h-1 bg-accent/40 rounded-full animate-ping delay-1500"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* 主标题 - 入场动画 */}
        <div className="animate-fadeInUp">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight">
            <span className="text-foreground">
              {title}
            </span>
          </h1>
        </div>
        
        {/* 副标题 - 延迟入场动画 */}
        <div className="animate-fadeInUp delay-200">
          <p className="text-xl md:text-3xl lg:text-4xl text-foreground/90 mb-12 font-light tracking-wide">
            {subtitle}
          </p>
        </div>
        
        {/* 描述文字 - 玻璃质感卡片 */}
        <div className="animate-fadeInUp delay-400">
          <div className="max-w-3xl mx-auto">
            <div className="relative backdrop-blur-sm bg-card/30 border border-border/20 rounded-2xl p-8 shadow-2xl">
              {/* 卡片内部光晕 */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl"></div>
              
              <p className="text-lg md:text-xl text-card-foreground leading-relaxed relative z-10">
                {description}
              </p>
              
              {/* 装饰性边框高光 */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* 装饰性底部渐变 */}
        <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-32 bg-gradient-to-t from-background/80 to-transparent pointer-events-none"></div>
      </div>
    </section>
  );
}