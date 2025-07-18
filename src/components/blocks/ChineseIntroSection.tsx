import { BlockComponentProps } from "@/types/blocks";
import { cn } from "@/lib/utils";

export function ChineseIntroSection({ className }: BlockComponentProps): JSX.Element {
  return (
    <section className={cn(
      "relative py-28 px-4 overflow-hidden",
      className
    )}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-slate-100 dark:bg-slate-800/30 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-slate-100 dark:bg-slate-800/30 blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">GAIDN</span>
            <span className="mx-2">·</span>
            <span>盖德恩</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Global AI Developer Network，全球AI开发者网络
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32">
          {/* 左侧：中文名称解释（竖排） */}
          {/* 中文名称解释：一行一个成语，横向四字排列 */}
          <div className="flex flex-col items-center md:items-start gap-8 text-xl md:text-2xl font-semibold ml-8 md:ml-16">
            {/* 盖世英雄 */}
            <div className="flex items-center gap-6 group transition-all duration-300 hover:scale-105">
              <span className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200">盖</span>
              <div className="flex gap-2 tracking-wide">
                <span className="text-slate-600 dark:text-slate-300">世</span>
                <span className="text-slate-600 dark:text-slate-300">英</span>
                <span className="text-slate-600 dark:text-slate-300">雄</span>
              </div>
            </div>
            
            {/* 德才兼备 */}
            <div className="flex items-center gap-6 group transition-all duration-300 hover:scale-105">
              <span className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200">德</span>
              <div className="flex gap-2 tracking-wide">
                <span className="text-slate-600 dark:text-slate-300">才</span>
                <span className="text-slate-600 dark:text-slate-300">兼</span>
                <span className="text-slate-600 dark:text-slate-300">备</span>
              </div>
            </div>
            
            {/* 恩泽天下 */}
            <div className="flex items-center gap-6 group transition-all duration-300 hover:scale-105">
              <span className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200">恩</span>
              <div className="flex gap-2 tracking-wide">
                <span className="text-slate-600 dark:text-slate-300">泽</span>
                <span className="text-slate-600 dark:text-slate-300">天</span>
                <span className="text-slate-600 dark:text-slate-300">下</span>
              </div>
            </div>
          </div>



          {/* 右侧：简化的介绍文字 */}
          <div className="max-w-md text-center md:text-left mt-8 md:mt-0">
            <p className="text-lg leading-relaxed text-muted-foreground">
              我们相信，通过开放透明的协作方式，能够激发更多创新，推动 AI 技术的健康发展。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 