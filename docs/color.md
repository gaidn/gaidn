# 颜色系统和主题架构文档

## 概述

本项目采用基于 CSS 自定义属性（CSS Variables）和 Tailwind CSS v4 的现代主题系统，实现了灵活的浅色/深色主题切换和统一的设计令牌管理。

## 文件结构

```
src/app/
├── layout.tsx          # 根布局，引入全局样式
├── globals.css         # 全局样式，导入主题文件
└── theme.css          # 主题系统核心文件
```

## 引用链路径

```
src/app/layout.tsx (根布局)
    ↓ import "@/app/globals.css"
src/app/globals.css
    ↓ @import "./theme.css"
src/app/theme.css (主题定义)
    ↓ 通过 @theme inline 暴露给 Tailwind CSS
Tailwind CSS 类名 (bg-primary, text-foreground 等)
    ↓ 在组件中使用
React 组件 (Button, Card 等 UI 组件)
```

## 主题文件详解 (src/app/theme.css)

### 1. 浅色主题定义

```css
:root {
  /* 基础颜色 */
  --background: oklch(0.9613 0.0111 89.7227);      /* 页面背景色 */
  --foreground: oklch(0.3438 0.0269 95.7226);      /* 主要文本色 */
  --card: oklch(0.9818 0.0054 95.0986);            /* 卡片背景色 */
  --card-foreground: oklch(0.1908 0.0020 106.5859); /* 卡片文本色 */
  
  /* 交互颜色 */
  --primary: oklch(0.6171 0.1375 39.0427);         /* 主色调 */
  --primary-foreground: oklch(1.0000 0 0);         /* 主色调文本 */
  --secondary: oklch(0.9245 0.0138 92.9892);       /* 次要颜色 */
  --secondary-foreground: oklch(0.4334 0.0177 98.6048); /* 次要文本 */
  
  /* 状态颜色 */
  --destructive: oklch(0.1908 0.0020 106.5859);    /* 危险/删除色 */
  --muted: oklch(0.9341 0.0153 90.2390);           /* 静音/禁用色 */
  --accent: oklch(0.9245 0.0138 92.9892);          /* 强调色 */
  
  /* 边框和输入 */
  --border: oklch(0.8847 0.0069 97.3627);          /* 边框色 */
  --input: oklch(0.7621 0.0156 98.3528);           /* 输入框背景 */
  --ring: oklch(0.6171 0.1375 39.0427);            /* 焦点环颜色 */
  
  /* 图表颜色 */
  --chart-1: oklch(0.5583 0.1276 42.9956);
  --chart-2: oklch(0.6898 0.1581 290.4107);
  --chart-3: oklch(0.8816 0.0276 93.1280);
  --chart-4: oklch(0.8822 0.0403 298.1792);
  --chart-5: oklch(0.5608 0.1348 42.0584);
  
  /* 侧边栏颜色 */
  --sidebar: oklch(0.9663 0.0080 98.8792);
  --sidebar-foreground: oklch(0.3590 0.0051 106.6524);
  --sidebar-primary: oklch(0.6171 0.1375 39.0427);
  --sidebar-primary-foreground: oklch(0.9881 0 0);
  --sidebar-accent: oklch(0.9245 0.0138 92.9892);
  --sidebar-accent-foreground: oklch(0.3250 0 0);
  --sidebar-border: oklch(0.9401 0 0);
  --sidebar-ring: oklch(0.7731 0 0);
  
  /* 字体系列 */
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  
  /* 设计令牌 */
  --radius: 0.5rem;              /* 默认圆角 */
  --spacing: 0.25rem;            /* 基础间距 */
  
  /* 阴影系统 */
  --shadow-2xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-xs: 0 1px 3px 0px hsl(0 0% 0% / 0.05);
  --shadow-sm: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10);
  --shadow-md: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10);
  --shadow-lg: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10);
  --shadow-xl: 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10);
  --shadow-2xl: 0 1px 3px 0px hsl(0 0% 0% / 0.25);
}
```

### 2. 深色主题定义

```css
.dark {
  /* 深色主题会覆盖相应的 CSS 变量 */
  --background: oklch(0.2679 0.0036 106.6427);     /* 深色背景 */
  --foreground: oklch(0.8074 0.0142 93.0137);      /* 深色文本 */
  --primary: oklch(0.6724 0.1308 38.7559);         /* 深色主色调 */
  /* 其他变量类似... */
}
```

### 3. Tailwind CSS 集成

```css
@theme inline {
  /* 将 CSS 变量暴露给 Tailwind CSS */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ...更多颜色映射 */
  
  /* 字体映射 */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);
  
  /* 圆角系统 */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  
  /* 阴影映射 */
  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}
```

## 全局样式应用 (src/app/globals.css)

```css
@import "tailwindcss";
@import "./theme.css";

@plugin "tailwindcss-animate";

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;  /* 使用主题变量 */
  }
}

/* 为特定元素应用主题样式 */
input, select, textarea {
  @apply border-border outline-ring/50 bg-background;
}

button {
  @apply cursor-pointer border-border outline-ring/50;
}
```

## 组件中的使用方式

### 1. 在 UI 组件中使用

```tsx
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
  }
)
```

### 2. 在业务组件中使用

```tsx
// 直接使用 Tailwind 类名
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">
  <h2 className="text-foreground font-semibold">卡片标题</h2>
  <p className="text-muted-foreground">卡片描述文本</p>
  <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
    主要按钮
  </button>
</div>
```

## 主题切换机制

### 1. 工作原理

- 当用户切换主题时，HTML 根元素的 `class` 会添加或移除 `.dark` 类
- CSS 变量会自动切换到对应的值（通过 CSS 优先级）
- 所有使用这些变量的 Tailwind 类名会自动更新样式
- 无需重新渲染组件，实现平滑的主题切换

### 2. 实现示例

```tsx
// 主题切换组件示例
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="bg-background border border-border p-2 rounded"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  )
}
```

## 技术特点

### 1. Tailwind CSS v4 新特性
- 使用 `@theme inline` 指令，无需传统的 `tailwind.config.js`
- 直接在 CSS 中定义设计令牌
- 更简洁的配置方式

### 2. OKLCH 颜色空间
- 使用现代的 OKLCH 颜色格式
- 提供更好的色彩感知一致性
- 支持更精确的颜色调整

### 3. CSS 变量响应式
- 通过 CSS 优先级自动切换主题
- 支持实时主题切换
- 高性能的样式更新

### 4. 设计系统标准化
- 遵循 shadcn/ui 的设计令牌规范
- 统一的命名约定
- 完整的语义化颜色系统

## 扩展和自定义

### 1. 添加新颜色

```css
:root {
  --custom-color: oklch(0.5 0.2 180);
}

.dark {
  --custom-color: oklch(0.7 0.15 180);
}

@theme inline {
  --color-custom: var(--custom-color);
}
```

### 2. 添加新的设计令牌

```css
:root {
  --custom-spacing: 1.5rem;
  --custom-border-width: 2px;
}

@theme inline {
  --spacing-custom: var(--custom-spacing);
  --border-custom: var(--custom-border-width);
}
```

### 3. 在组件中使用自定义颜色

```tsx
<div className="bg-custom text-custom-foreground">
  自定义颜色组件
</div>
```

## 最佳实践

1. **优先使用语义化颜色**：使用 `bg-primary` 而不是 `bg-blue-500`
2. **保持一致性**：所有颜色都应该通过 theme.css 定义
3. **避免硬编码颜色**：不要在组件中直接使用颜色值
4. **测试主题切换**：确保所有组件在两种主题下都正常显示
5. **使用设计令牌**：圆角、间距、阴影等都应该使用预定义的令牌

## 调试和开发

### 1. 查看当前主题变量
```javascript
// 在浏览器控制台中查看当前 CSS 变量值
getComputedStyle(document.documentElement).getPropertyValue('--primary')
```

### 2. 动态修改主题变量
```javascript
// 临时修改 CSS 变量进行测试
document.documentElement.style.setProperty('--primary', 'oklch(0.7 0.2 50)')
```

### 3. 主题调试工具
- 使用浏览器开发者工具的 CSS 变量面板
- 检查元素时查看计算后的样式值
- 使用 Tailwind CSS DevTools 扩展

通过这套主题系统，项目实现了高度模块化和可维护的设计令牌管理，让整个应用可以通过单一配置文件管理所有的视觉设计元素。