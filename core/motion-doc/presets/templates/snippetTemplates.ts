export const snippetTemplates = [
  {
    id: "slide",
    label: "Slide",
    code: `<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <Text fontSize={72} fontWeight={800} x={8} y={12} w={64} h={18}>New slide title</Text>
  <Text fontSize={24} x={8} y={38} w={52} h={9}>
    Add supporting copy here.
  </Text>
</Slide>`
  },
  {
    id: "snip-title",
    label: "Display Title",
    code: `<Text fontSize={96} fontWeight={700} lineHeight={1} x={7} y={16} w={76} h={24}>Display headline</Text>`
  },
  {
    id: "snip-body",
    label: "Body Text",
    code: `<Text fontSize={24} fontWeight={560} lineHeight={1.12} x={10} y={44} w={46} h={9}>Body copy</Text>`
  },
  {
    id: "snip-card",
    label: "Proof Point",
    code: `<Icon icon="Sparkles" size={42} strokeWidth={1.5} x={8} y={38} w={5} h={8} />
<Text fontSize={24} fontWeight={700} x={8} y={50} w={40} h={8}>Key point</Text>
<Text fontSize={18} lineHeight={1.5} x={8} y={62} w={40} h={18}>Describe one benefit or detail.</Text>`
  },
  {
    id: "snip-metric",
    label: "Text Metric",
    code: `<Text fontSize={64} fontWeight={800} x={8} y={38} w={32} h={14}>$2.4M</Text>
<Text fontSize={20} fontWeight={600} x={8} y={60} w={32} h={8}>Pipeline</Text>
<Text fontSize={16} lineHeight={1.4} x={8} y={74} w={32} h={14}>Qualified revenue influenced this quarter.</Text>`
  },
  {
    id: "chart",
    label: "Chart",
    code: `<Chart title="Quarterly traction" labels="Q1,Q2,Q3,Q4" values="42,58,73,91" width="lg" height={144} enter="fadeUp" delay={0.2} radius={16} x={8} y={36} w={70} h={42} />`
  },
  {
    id: "snip-image",
    label: "Cover Image",
    code: `<ImageBlock fit="cover" src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=85&w=2400" alt="Retro Setup" enter="fadeIn" delay={0.2} radius={16} x={10} y={20} w={80} h={54} />`
  }
];
