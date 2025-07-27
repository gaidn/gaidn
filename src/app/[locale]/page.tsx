import PageLayout from "@/components/PageLayout";
import { HeroSection, FeaturesSection, LeaderboardSection, CTASection, ChineseIntroSection } from "@/components/blocks";
import { Github, Users, Trophy, Shield, Globe, Code } from "lucide-react";
import type { FeatureItem } from "@/types/blocks";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function Home({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<JSX.Element> {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const t = await getTranslations();

  const features: FeatureItem[] = [
    {
      title: t("home.features.github_auth.title"),
      description: t("home.features.github_auth.description"),
      icon: Github,
    },
    {
      title: t("home.features.developer_profile.title"),
      description: t("home.features.developer_profile.description"),
      icon: Code,
    },
    {
      title: t("home.features.community_leaderboard.title"),
      description: t("home.features.community_leaderboard.description"),
      icon: Trophy,
    },
    {
      title: t("home.features.developer_network.title"),
      description: t("home.features.developer_network.description"),
      icon: Globe,
    },
    {
      title: t("home.features.transparency.title"),
      description: t("home.features.transparency.description"),
      icon: Shield,
    },
    {
      title: t("home.features.free_collaboration.title"),
      description: t("home.features.free_collaboration.description"),
      icon: Users,
    },
  ];

  return (
    <PageLayout>
      <HeroSection
        title={t("home.hero.title")}
        subtitle={t("home.hero.subtitle")}
        description={t("home.hero.description")}
      />

      <ChineseIntroSection />

      <FeaturesSection
        title={t("home.features.title")}
        description={t("home.features.description")}
        features={features}
      />

      <LeaderboardSection
        title={t("home.leaderboard_section.title")}
        description={t("home.leaderboard_section.description")}
        buttonText={t("home.leaderboard_section.button_text")}
      />

      <CTASection
        title={t("home.cta.title")}
        description={t("home.cta.description")}
        loginButtonText={t("home.cta.login_button_text")}
        leaderboardButtonText={t("home.cta.leaderboard_button_text")}
      />
    </PageLayout>
  );
}
