import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// 创建类型安全的导航函数
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);