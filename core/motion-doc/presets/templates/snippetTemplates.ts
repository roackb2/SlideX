export const snippetTemplates = [
  {
    id: "slide",
    label: "Slide",
    code: `<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <Title enter="fadeUp" fontSize={72} radius={0} x={8} y={12} w={64} h={18}>New slide title</Title>
  <Text enter="fadeUp" delay={0.25} fontSize={24} radius={0} x={8} y={38} w={52} h={16}>
    Add supporting copy here.
  </Text>
</Slide>`
  },
  {
    id: "title",
    label: "Title",
    code: `<Title enter="fadeUp" fontSize={72} radius={0} x={8} y={12} w={64} h={18}>Slide headline</Title>`
  },
  {
    id: "card",
    label: "Card",
    code: `<Card icon="Sparkles" layout="horizontal" title="Key point" text="Describe one benefit or detail." enter="fadeUp" delay={0.2} radius={16} x={8} y={38} w={40} h={32} />`
  },
  {
    id: "metric",
    label: "Metric",
    code: `<Metric label="Pipeline" value="$2.4M" caption="Qualified revenue influenced this quarter." width="sm" enter="fadeUp" delay={0.2} radius={16} x={8} y={38} w={32} h={36} />`
  },
  {
    id: "chart",
    label: "Chart",
    code: `<Chart title="Quarterly traction" labels="Q1,Q2,Q3,Q4" values="42,58,73,91" width="lg" height={144} enter="fadeUp" delay={0.2} radius={16} x={8} y={36} w={70} h={42} />`
  },
  {
    id: "image",
    label: "Image",
    code: `<ImageBlock fit="cover" src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200" alt="Uploaded image" enter="fadeIn" delay={0.2} radius={16} x={10} y={20} w={80} h={54} />`
  }
];
