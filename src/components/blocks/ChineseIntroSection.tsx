import type { BlockComponentProps } from "@/types/blocks";
import { cn } from "@/lib/utils";

export function ChineseIntroSection({ className }: BlockComponentProps): JSX.Element {
  return (
    <section className={cn(
      "relative py-32 px-4 overflow-hidden",
      className
    )}>
      {/* 增强背景装饰 */}
      <div className="absolute inset-0 -z-10">
        {/* 主渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/40"></div>
        
        {/* 动态装饰元素 */}
        <div className="absolute top-1/6 left-1/6 w-80 h-80 bg-gradient-to-r from-primary/12 to-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/6 right-1/6 w-96 h-96 bg-gradient-to-l from-accent/12 to-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/8 rounded-full blur-2xl animate-pulse delay-2000"></div>
        
        {/* 传统文化装饰元素 */}
        <div className="absolute top-1/4 right-1/8 opacity-10">
          <div className="w-32 h-32 border border-primary/20 rounded-full"></div>
          <div className="absolute top-2 left-2 w-28 h-28 border border-accent/20 rounded-full"></div>
        </div>
        <div className="absolute bottom-1/4 left-1/8 opacity-10">
          <div className="w-24 h-24 border border-accent/20 rounded-full"></div>
          <div className="absolute top-1 left-1 w-22 h-22 border border-primary/20 rounded-full"></div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        {/* 标题部分 */}
        <div className="text-center mb-20 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-wide">
            <span className="text-foreground">GAIDN</span>
            <span className="mx-4 text-muted-foreground">·</span>
            <span className="text-foreground">盖德恩</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Global AI Developer Network，全球AI开发者网络
          </p>
        </div>
        
        {/* 主要内容区域 */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-20 lg:gap-32">
          {/* 左侧：中文名称解释 */}
          <div className="flex flex-col items-center lg:items-start gap-10 animate-fadeInUp delay-200">
            {/* 盖世英雄 */}
            <div className="group relative cursor-pointer">
              <div className="flex items-center gap-8 transition-all duration-500 group-hover:scale-110">
                {/* 主字 */}
                <div className="relative">
                  <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
                    盖
                  </span>
                  {/* 字体后发光 */}
                  <div className="absolute inset-0 text-4xl md:text-5xl lg:text-6xl font-bold text-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    盖
                  </div>
                </div>
                
                {/* 成语解释 */}
                <div className="flex gap-3 text-2xl md:text-3xl font-medium tracking-wider">
                  {["世", "英", "雄"].map((char, index) => (
                    <span 
                      key={index}
                      className={cn(
                        "text-foreground group-hover:text-primary transition-all duration-300",
                        `delay-[${index * 100}ms]`
                      )}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 悬停装饰线 */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500"></div>
            </div>
            
            {/* 德才兼备 */}
            <div className="group relative cursor-pointer">
              <div className="flex items-center gap-8 transition-all duration-500 group-hover:scale-110">
                <div className="relative">
                  <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-accent">
                    德
                  </span>
                  <div className="absolute inset-0 text-4xl md:text-5xl lg:text-6xl font-bold text-accent/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    德
                  </div>
                </div>
                
                <div className="flex gap-3 text-2xl md:text-3xl font-medium tracking-wider">
                  {["才", "兼", "备"].map((char, index) => (
                    <span 
                      key={index}
                      className={cn(
                        "text-foreground group-hover:text-accent transition-all duration-300",
                        `delay-[${index * 100}ms]`
                      )}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-primary group-hover:w-full transition-all duration-500"></div>
            </div>
            
            {/* 恩泽天下 */}
            <div className="group relative cursor-pointer">
              <div className="flex items-center gap-8 transition-all duration-500 group-hover:scale-110">
                <div className="relative">
                  <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-foreground">
                    恩
                  </span>
                  <div className="absolute inset-0 text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-foreground/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    恩
                  </div>
                </div>
                
                <div className="flex gap-3 text-2xl md:text-3xl font-medium tracking-wider">
                  {["泽", "天", "下"].map((char, index) => (
                    <span 
                      key={index}
                      className={cn(
                        "text-foreground group-hover:text-primary transition-all duration-300",
                        `delay-[${index * 100}ms]`
                      )}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500"></div>
            </div>
          </div>

          {/* 右侧：理念文字 */}
          <div className="max-w-lg animate-fadeInUp delay-400">
            <div className="relative backdrop-blur-sm bg-card/40 border border-border/20 rounded-2xl p-8">
              {/* 卡片内容 */}
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-card-foreground">
                  开放协作理念
                </h3>
                <p className="text-lg md:text-xl leading-relaxed text-card-foreground mb-6">
                  我们相信，通过开放透明的协作方式，能够激发更多创新，推动 AI 技术的健康发展。
                </p>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
                  让每一位开发者都能在这个平台上找到属于自己的位置，共同构建更美好的技术未来。
                </p>
              </div>
              
              {/* 卡片装饰 */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 rounded-2xl"></div>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-6xl h-32 bg-gradient-to-t from-background/80 to-transparent pointer-events-none"></div>
      </div>
    </section>
  );
} 