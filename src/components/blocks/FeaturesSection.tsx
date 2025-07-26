import type { FeaturesSectionProps } from "@/types/blocks";
import { cn } from "@/lib/utils";

export function FeaturesSection({ 
  title, 
  description, 
  features, 
  className 
}: FeaturesSectionProps): JSX.Element {
  return (
    <section className={cn(
      "py-24 px-4 relative overflow-hidden",
      className
    )}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-primary/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-accent/6 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* 标题部分 */}
        <div className="text-center mb-20 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight">
            <span className="text-foreground">
              {title}
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* 特性网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className={cn(
                  "group relative animate-fadeInUp",
                  index === 0 && "delay-200",
                  index === 1 && "delay-400", 
                  index === 2 && "delay-600",
                  index === 3 && "delay-800",
                  index === 4 && "delay-1000",
                  index === 5 && "delay-1200"
                )}
              >
                {/* 玻璃质感卡片 */}
                <div className="relative backdrop-blur-sm bg-card/60 border border-border/30 rounded-2xl p-8 h-full transition-all duration-500 group-hover:transform group-hover:translateY(-8px) group-hover:scale-105">
                  
                  {/* 悬停时的光晕效果 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* 悬停时的外发光 */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10"></div>
                  
                  {/* 内容 */}
                  <div className="relative z-10">
                    {/* 图标和标题 */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="relative">
                        {/* 图标背景 */}
                        <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                          <Icon className="h-8 w-8 text-primary group-hover:text-primary/90 transition-colors duration-300" />
                        </div>
                        
                        {/* 图标后发光效果 */}
                        <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </h3>
                      </div>
                    </div>
                    
                    {/* 描述文字 */}
                    <p className="text-muted-foreground leading-relaxed text-base md:text-lg group-hover:text-card-foreground transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* 装饰性边框高光 */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                    <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                    <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
                  </div>

                  {/* 内部反射效果 */}
                  <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* 卡片下方阴影增强 */}
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-2xl transform translate-y-8 opacity-0 group-hover:opacity-50 transition-all duration-500 -z-10"></div>
              </div>
            );
          })}
        </div>

        {/* 底部装饰渐变 */}
        <div className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-6xl h-32 bg-gradient-to-t from-background/60 to-transparent pointer-events-none"></div>
      </div>
    </section>
  );
}