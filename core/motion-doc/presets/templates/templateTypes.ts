export type MotionTemplate = {
  id: string;
  name: string;
  category: string;
  duration: string;
  description: string;
  useCase: string;
  source: string;
};

export type BusinessTemplateConfig = {
  accent: string;
  background: string;
  category: string;
  chart: {
    labels: string;
    title: string;
    values: string;
  };
  description: string;
  economics: Array<{
    caption: string;
    label: string;
    value: string;
  }>;
  evidence: Array<{
    icon: string;
    text: string;
    title: string;
  }>;
  hero: string;
  id: string;
  image: {
    alt: string;
    src: string;
  };
  mutedBackground: string;
  metrics: Array<{
    caption: string;
    label: string;
    value: string;
  }>;
  name: string;
  plan: Array<{
    text: string;
    title: string;
  }>;
  proofText: string;
  risks: Array<{
    icon: string;
    text: string;
    title: string;
  }>;
  strategy: Array<{
    icon: string;
    text: string;
    title: string;
  }>;
  subtitle: string;
  surfaceBackground: string;
  theme: "dark" | "light";
  thesis: Array<{
    icon: string;
    text: string;
    title: string;
  }>;
  useCase: string;
};
