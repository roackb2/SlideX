import type { MotionTemplate } from "@/core/motion-doc/presets/templates/templateTypes";

export const commercialTemplates: MotionTemplate[] = [
  {
    id: "black-commercial",
    name: "Black Boardroom",
    category: "Black",
    duration: "60s",
    description: "A premium 8-page boardroom deck with decision framing, market context, metrics, visual proof, operating strategy, execution plan, and a clear executive ask.",
    useCase: "Board updates, growth strategy, enterprise sales narratives",
    source: `# Black Boardroom

<Slide duration={5} theme="dark" background="#030303" accent="#ffffff" shader="god-rays" shaderPreset="Linear" shaderIntensity={0.79} shaderSoftness={0.25} shaderDetail={0.41} shaderSpeed={0.5} shaderColor1="#000000" shaderColor2="#eeeeee" shaderColor3="#ffffff" shaderColor4="#d4d4d8" shaderColor5="#525252" shaderColor6="#fafafa" textColor="#ffffff">
  <Text enter="zoomIn" fontSize={84} fontWeight={800} h={28} w={90} x={5} y={18} textAlign="center">Growth Investment Memo</Text>
  <Text enter="fadeUp" delay={0.2} fontSize={24} lineHeight={1.6} h={22} w={70} x={15} y={56} textAlign="center">A boardroom-ready narrative for framing the decision, sizing the opportunity, and aligning the next operating move.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#080808" accent="#ffffff">
  <Text enter="slideLeft" fontSize={58} fontWeight={700} h={16} w={86} x={7} y={12}>Decision summary</Text>
  
  <Text enter="fadeUp" delay={0.2} fontSize={72} fontWeight={800} x={7} y={36} w={27} h={16}>$2.4M</Text>
  <Text enter="fadeUp" delay={0.25} fontSize={22} fontWeight={600} x={7} y={54} w={27} h={8}>Value pool</Text>
  <Text enter="fadeUp" delay={0.3} fontSize={17} lineHeight={1.5} x={7} y={64} w={27} h={16}>Near-term qualified upside across priority accounts and expansion motions.</Text>

  <Text enter="fadeUp" delay={0.25} fontSize={72} fontWeight={800} x={36.5} y={36} w={27} h={16}>+31%</Text>
  <Text enter="fadeUp" delay={0.3} fontSize={22} fontWeight={600} x={36.5} y={54} w={27} h={8}>Win-rate lift</Text>
  <Text enter="fadeUp" delay={0.35} fontSize={17} lineHeight={1.5} x={36.5} y={64} w={27} h={16}>Modeled improvement from sharper proof, packaging, and buyer-specific messaging.</Text>

  <Text enter="fadeUp" delay={0.3} fontSize={72} fontWeight={800} x={66} y={36} w={27} h={16}>-18%</Text>
  <Text enter="fadeUp" delay={0.35} fontSize={22} fontWeight={600} x={66} y={54} w={27} h={8}>Sales cycle</Text>
  <Text enter="fadeUp" delay={0.4} fontSize={17} lineHeight={1.5} x={66} y={64} w={27} h={16}>Expected reduction in time-to-decision from clearer stakeholder alignment.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <Text enter="slideLeft" fontSize={58} fontWeight={700} h={16} w={86} x={7} y={12}>Market inflection</Text>
  
  <Icon icon="TrendingUp" enter="zoomIn" delay={0.15} size={48} strokeWidth={1.5} x={7} y={34} w={6} h={10} />
  <Text enter="fadeUp" delay={0.2} fontSize={26} fontWeight={700} x={15} y={34} w={78} h={10}>Demand is concentrating</Text>
  <Text enter="fadeUp" delay={0.25} fontSize={19} lineHeight={1.6} x={15} y={46} w={78} h={18}>Growth is shifting toward fewer accounts with clearer budgets, stronger urgency, and higher proof requirements.</Text>

  <Icon icon="CircleAlert" enter="zoomIn" delay={0.4} size={48} strokeWidth={1.5} x={7} y={64} w={6} h={10} />
  <Text enter="fadeUp" delay={0.45} fontSize={26} fontWeight={700} x={15} y={64} w={78} h={10}>Generic decks are underperforming</Text>
  <Text enter="fadeUp" delay={0.5} fontSize={19} lineHeight={1.6} x={15} y={76} w={78} h={18}>Buyers expect board-level clarity: financial impact, implementation confidence, and risk controls in one story.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#0d0d0d" accent="#f5f5f5">
  <Text enter="slideLeft" fontSize={58} fontWeight={700} h={16} w={86} x={7} y={12}>Revenue momentum</Text>
  <Chart title="Qualified pipeline index" labels="Q1,Q2,Q3,Q4" values="38,52,71,94" width="full" height={210} enter="fadeUp" delay={0.25} radius={32} h={56} w={86} x={7} y={34} />
</Slide>

<Slide duration={5} theme="dark" background="#030303" accent="#ffffff">
  <ImageBlock fit="cover" src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=85&w=2400" alt="Commercial team reviewing data" enter="fadeIn" delay={0.15} radius={32} h={64} w={46} x={7} y={18} />
  <Text enter="fadeUp" delay={0.2} fontSize={28} lineHeight={1.6} h={52} w={36} x={57} y={26}>Use this frame for product evidence, account context, customer proof, or a leadership working session.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#111111" accent="#ffffff">
  <Text enter="slideLeft" fontSize={58} fontWeight={700} h={16} w={86} x={7} y={12}>Strategic response</Text>
  
  <Icon icon="Target" enter="zoomIn" delay={0.15} size={48} strokeWidth={1.5} x={7} y={34} w={6} h={10} />
  <Text enter="fadeUp" delay={0.2} fontSize={26} fontWeight={700} x={7} y={48} w={27} h={10}>Sharpen the offer</Text>
  <Text enter="fadeUp" delay={0.25} fontSize={18} lineHeight={1.6} x={7} y={60} w={27} h={22}>Turn the commercial message into a clear decision case with a specific audience and ask.</Text>

  <Icon icon="Layers" enter="zoomIn" delay={0.2} size={48} strokeWidth={1.5} x={36.5} y={34} w={6} h={10} />
  <Text enter="fadeUp" delay={0.25} fontSize={26} fontWeight={700} x={36.5} y={48} w={27} h={10}>Build the proof stack</Text>
  <Text enter="fadeUp" delay={0.3} fontSize={18} lineHeight={1.6} x={36.5} y={60} w={27} h={22}>Combine metrics, charts, buyer evidence, operating plan, and risk controls.</Text>

  <Icon icon="Download" enter="zoomIn" delay={0.25} size={48} strokeWidth={1.5} x={66} y={34} w={6} h={10} />
  <Text enter="fadeUp" delay={0.3} fontSize={26} fontWeight={700} x={66} y={48} w={27} h={10}>Make it portable</Text>
  <Text enter="fadeUp" delay={0.35} fontSize={18} lineHeight={1.6} x={66} y={60} w={27} h={22}>Export MDX and interactive HTML so the work can travel across review and local workflows.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <Text enter="slideLeft" fontSize={58} fontWeight={700} h={16} w={86} x={7} y={12}>90-day execution plan</Text>
  
  <Icon icon="CalendarClock" enter="zoomIn" delay={0.15} size={48} strokeWidth={1.5} x={7} y={30} w={6} h={10} />
  <Text enter="fadeUp" delay={0.2} fontSize={26} fontWeight={700} x={15} y={30} w={78} h={10}>01 Pilot</Text>
  <Text enter="fadeUp" delay={0.25} fontSize={19} lineHeight={1.6} x={15} y={42} w={78} h={18}>Build one enterprise account deck and one executive operating review.</Text>

  <Icon icon="Settings" enter="zoomIn" delay={0.4} size={48} strokeWidth={1.5} x={7} y={54} w={6} h={10} />
  <Text enter="fadeUp" delay={0.45} fontSize={26} fontWeight={700} x={15} y={54} w={78} h={10}>02 Prove</Text>
  <Text enter="fadeUp" delay={0.5} fontSize={19} lineHeight={1.6} x={15} y={66} w={78} h={18}>Measure edit time, message quality, stakeholder response, and export reliability.</Text>

  <Icon icon="CheckCircle" enter="zoomIn" delay={0.65} size={48} strokeWidth={1.5} x={7} y={78} w={6} h={10} />
  <Text enter="fadeUp" delay={0.7} fontSize={26} fontWeight={700} x={15} y={78} w={78} h={10}>03 Scale</Text>
  <Text enter="fadeUp" delay={0.75} fontSize={19} lineHeight={1.6} x={15} y={90} w={78} h={18}>Turn the winning narrative into governed templates and repeatable workflows.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#030303" accent="#ffffff" shader="water" shaderPreset="Streaming" shaderColor1="#082f49" shaderColor2="#ffffff" shaderColor3="#0ea5e9" shaderColor4="#bae6fd" shaderColor5="#030303" shaderColor6="#f0f9ff" shaderIntensity={0} shaderSoftness={0.5} shaderDetail={0.5} shaderSpeed={2}>
  <Text enter="zoomIn" fontSize={80} fontWeight={800} h={22} w={80} x={10} y={28} textAlign="center">Decision requested</Text>
  <Text enter="fadeUp" delay={0.2} fontSize={26} lineHeight={1.6} h={24} x={13} y={56} w={74} textAlign="center">Approve a focused commercial pilot, validate the operating impact, then expand the black and white template system.</Text>
</Slide>`
  },

  {
    id: "white-commercial",
    name: "White Executive",
    category: "White",
    duration: "60s",
    description: "A polished 8-page executive proposal deck with a consulting-style structure, clean metrics, strategic context, visual proof, operational scaling, and a precise decision page.",
    useCase: "Client proposals, investor updates, quarterly business reviews",
    source: `# White Executive

<Slide duration={5} theme="light" background="#ffffff" accent="#111111" shader="paper-texture" shaderPreset="Default" shaderIntensity={0.4} shaderSoftness={0.3} shaderDetail={0.3} shaderColor1="#ffffff" shaderColor2="#9fadbc" shaderColor3="#f4f4f5" shaderColor4="#d4d4d8" shaderColor5="#71717a" shaderColor6="#ffffff" textColor="#111111">
  <Text enter="zoomIn" fontSize={84} fontWeight={800} h={28} w={90} x={5} y={18} textAlign="center">Executive Growth Proposal</Text>
  <Text enter="fadeUp" delay={0.2} fontSize={24} lineHeight={1.6} h={22} w={70} x={15} y={56} textAlign="center">A client-ready narrative for aligning the opportunity, proving the business case, and moving leadership toward a clear decision.</Text>
</Slide>

<Slide duration={5} theme="light" background="#f7f7f7" accent="#111111">
  <Text enter="slideLeft" fontSize={58} fontWeight={700} h={16} w={86} x={7} y={12}>Executive snapshot</Text>
  
  <Text enter="fadeUp" delay={0.2} fontSize={72} fontWeight={800} x={7} y={36} w={27} h={16}>$4.8M</Text>
  <Text enter="fadeUp" delay={0.25} fontSize={22} fontWeight={600} x={7} y={54} w={27} h={8}>Revenue upside</Text>
  <Text enter="fadeUp" delay={0.3} fontSize={17} lineHeight={1.5} x={7} y={64} w={27} h={16}>Modeled impact from the priority motions proposed in this deck.</Text>

  <Text enter="fadeUp" delay={0.25} fontSize={72} fontWeight={800} x={36.5} y={36} w={27} h={16}>94%</Text>
  <Text enter="fadeUp" delay={0.3} fontSize={22} fontWeight={600} x={36.5} y={54} w={27} h={8}>Retention base</Text>
  <Text enter="fadeUp" delay={0.35} fontSize={17} lineHeight={1.5} x={36.5} y={64} w={27} h={16}>Protected revenue from onboarding quality, stakeholder fit, and renewal visibility.</Text>

  <Text enter="fadeUp" delay={0.3} fontSize={72} fontWeight={800} x={66} y={36} w={27} h={16}>1.7x</Text>
  <Text enter="fadeUp" delay={0.35} fontSize={22} fontWeight={600} x={66} y={54} w={27} h={8}>Expansion rate</Text>
  <Text enter="fadeUp" delay={0.4} fontSize={17} lineHeight={1.5} x={66} y={64} w={27} h={16}>Target account growth from packaged proof and sharper commercial sequencing.</Text>
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <Text enter="slideLeft" fontSize={58} fontWeight={700} h={16} w={86} x={7} y={12}>Commercial thesis</Text>
  
  <Icon icon="Lightbulb" enter="zoomIn" delay={0.15} size={48} strokeWidth={1.5} x={7} y={34} w={6} h={10} />
  <Text enter="fadeUp" delay={0.2} fontSize={26} fontWeight={700} x={15} y={34} w={78} h={10}>Make the decision simple</Text>
  <Text enter="fadeUp" delay={0.25} fontSize={19} lineHeight={1.6} x={15} y={46} w={78} h={18}>Senior buyers respond when the story compresses complexity into a clear business case, operating path, and measurable ask.</Text>

  <Icon icon="UserCheck" enter="zoomIn" delay={0.4} size={48} strokeWidth={1.5} x={7} y={64} w={6} h={10} />
  <Text enter="fadeUp" delay={0.45} fontSize={26} fontWeight={700} x={15} y={64} w={78} h={10}>Make the proof specific</Text>
  <Text enter="fadeUp" delay={0.5} fontSize={19} lineHeight={1.6} x={15} y={76} w={78} h={18}>The strongest proposal connects market timing, account pain, data, implementation confidence, and team-level outcomes.</Text>
</Slide>

<Slide duration={5} theme="light" background="#f4f4f4" accent="#111111">
  <Text enter="slideLeft" fontSize={58} fontWeight={700} h={16} w={86} x={7} y={12}>Where momentum is building</Text>
  <Chart title="Opportunity growth by segment" labels="SMB,Mid,Enterprise,Strategic" values="28,46,73,88" width="full" height={210} enter="fadeUp" delay={0.25} radius={32} h={56} w={86} x={7} y={34} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <ImageBlock fit="cover" src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=85&w=2400" alt="Clean architectural detail" enter="fadeIn" delay={0.15} radius={32} h={64} w={46} x={7} y={18} />
  <Text enter="fadeUp" delay={0.2} fontSize={28} lineHeight={1.6} h={52} w={36} x={57} y={26}>Use this page for product evidence, market imagery, customer context, or a quiet visual pause between data-heavy sections.</Text>
</Slide>

<Slide duration={5} theme="light" background="#f8f8f8" accent="#111111">
  <Text enter="slideLeft" fontSize={58} fontWeight={700} h={16} w={86} x={7} y={12}>Proposal architecture</Text>
  
  <Icon icon="Palette" enter="zoomIn" delay={0.15} size={48} strokeWidth={1.5} x={7} y={34} w={6} h={10} />
  <Text enter="fadeUp" delay={0.2} fontSize={26} fontWeight={700} x={7} y={48} w={27} h={10}>Executive design</Text>
  <Text enter="fadeUp" delay={0.25} fontSize={18} lineHeight={1.6} x={7} y={60} w={27} h={22}>A restrained white system for proposals, business reviews, and client-facing strategy work.</Text>

  <Icon icon="BarChart3" enter="zoomIn" delay={0.2} size={48} strokeWidth={1.5} x={36.5} y={34} w={6} h={10} />
  <Text enter="fadeUp" delay={0.25} fontSize={26} fontWeight={700} x={36.5} y={48} w={27} h={10}>Evidence layer</Text>
  <Text enter="fadeUp" delay={0.3} fontSize={18} lineHeight={1.6} x={36.5} y={60} w={27} h={22}>Metrics and charts create a business argument without forcing the audience to decode raw detail.</Text>

  <Icon icon="Code2" enter="zoomIn" delay={0.25} size={48} strokeWidth={1.5} x={66} y={34} w={6} h={10} />
  <Text enter="fadeUp" delay={0.3} fontSize={26} fontWeight={700} x={66} y={48} w={27} h={10}>Editable source</Text>
  <Text enter="fadeUp" delay={0.35} fontSize={18} lineHeight={1.6} x={66} y={60} w={27} h={22}>MDX keeps the deck readable, flexible, and ready for local workflows after installation.</Text>
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <Text enter="slideLeft" fontSize={58} fontWeight={700} h={16} w={86} x={7} y={12}>Next 30 days</Text>
  
  <Icon icon="CheckCircle" enter="zoomIn" delay={0.15} size={48} strokeWidth={1.5} x={7} y={30} w={6} h={10} />
  <Text enter="fadeUp" delay={0.2} fontSize={26} fontWeight={700} x={15} y={30} w={78} h={10}>01 Align</Text>
  <Text enter="fadeUp" delay={0.25} fontSize={19} lineHeight={1.6} x={15} y={42} w={78} h={18}>Confirm the audience, decision owner, commercial question, and success metric.</Text>

  <Icon icon="Layers" enter="zoomIn" delay={0.4} size={48} strokeWidth={1.5} x={7} y={54} w={6} h={10} />
  <Text enter="fadeUp" delay={0.45} fontSize={26} fontWeight={700} x={15} y={54} w={78} h={10}>02 Build</Text>
  <Text enter="fadeUp" delay={0.5} fontSize={19} lineHeight={1.6} x={15} y={66} w={78} h={18}>Replace the template content with customer-specific proof, financial logic, and delivery detail.</Text>

  <Icon icon="Download" enter="zoomIn" delay={0.65} size={48} strokeWidth={1.5} x={7} y={78} w={6} h={10} />
  <Text enter="fadeUp" delay={0.7} fontSize={26} fontWeight={700} x={15} y={78} w={78} h={10}>03 Review</Text>
  <Text enter="fadeUp" delay={0.75} fontSize={19} lineHeight={1.6} x={15} y={90} w={78} h={18}>Export MDX and interactive HTML for stakeholder review, then tighten the final executive ask.</Text>
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111" shader="static-mesh-gradient" shaderPreset="Sea" shaderColor1="#013b65" shaderColor2="#03738c" shaderColor3="#a3d3ff" shaderColor4="#f2faef" shaderColor5="#ffffff" shaderColor6="#e0f2fe" shaderIntensity={0.53} shaderSoftness={0.5} shaderDetail={0} shaderSpeed={0}>
  <Text enter="zoomIn" fontSize={80} fontWeight={800} h={22} w={80} x={10} y={28} textAlign="center">Approve the pilot</Text>
  <Text enter="fadeUp" delay={0.2} fontSize={26} lineHeight={1.6} h={24} w={74} x={13} y={56} textAlign="center">Move forward with one executive-ready proposal workflow, validate the impact, then scale the black and white template system.</Text>
</Slide>`
  }
];
