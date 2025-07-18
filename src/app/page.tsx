import PageLayout from "@/components/PageLayout";
import { HeroSection, FeaturesSection, LeaderboardSection, CTASection } from "@/components/blocks";
import { Github, Users, Trophy, Shield, Globe, Code } from "lucide-react";
import { FeatureItem } from "@/types/blocks";

export default function Home(): JSX.Element {
  const features: FeatureItem[] = [
    {
      title: "GitHub 身份认证",
      description: "使用 GitHub 账号一键登录，基于真实的开发者身份建立可信的社区网络。",
      icon: Github,
    },
    {
      title: "开发者画像",
      description: "展示基于 GitHub 数据的个人资料，包括项目贡献、技术栈和社区活跃度。",
      icon: Code,
    },
    {
      title: "社区排行榜",
      description: "发现优秀的 AI 开发者，基于多维度评估的公开透明排名系统。",
      icon: Trophy,
    },
    {
      title: "去中心化网络",
      description: "建立去中心化的开发者网络，不受单一平台控制，保障数据自由。",
      icon: Globe,
    },
    {
      title: "公开透明",
      description: "所有数据和算法公开透明，社区治理民主化，让每个开发者都有发言权。",
      icon: Shield,
    },
    {
      title: "自由协作",
      description: "促进开发者之间的自由协作，共同推动 AI 技术的发展和创新。",
      icon: Users,
    },
  ];

  return (
    <PageLayout>
      <HeroSection
        title="GAIDN"
        subtitle="Global AI Developer Network"
        description="以 GitHub 身份为基础的 AI 开发者网络平台，致力于建立一个去中心化、自由协作、公开透明的开发者生态系统。连接全球 AI 开发者，共同推动技术进步与创新。"
      />

      <FeaturesSection
        title="核心特性"
        description="GAIDN 通过先进的技术架构和开放的理念，为全球 AI 开发者提供一个可信、透明、自由的协作平台。"
        features={features}
      />

      <LeaderboardSection
        title="GAIDN 开发者榜单"
        description="基于 GitHub 数据的多维度评估系统，展示全球 AI 开发者的技术实力和社区贡献。透明公开的排名算法，让每个开发者都能获得公正的认可。"
        buttonText="查看开发者榜单"
      />

      <CTASection
        title="加入 GAIDN 社区"
        description="立即加入我们的去中心化开发者网络，与全球 AI 开发者建立联系，共同推动技术创新的未来。"
        loginButtonText="GitHub 登录，加入榜单"
        leaderboardButtonText="查看开发者榜单"
      />
    </PageLayout>
  );
}
