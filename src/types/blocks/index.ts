export interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  className?: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface FeaturesSectionProps {
  title: string;
  description: string;
  features: FeatureItem[];
  className?: string;
}

export interface CTASectionProps {
  title: string;
  description: string;
  loginButtonText: string;
  leaderboardButtonText: string;
  className?: string;
}

export interface BlockComponentProps {
  children?: React.ReactNode;
  className?: string;
}