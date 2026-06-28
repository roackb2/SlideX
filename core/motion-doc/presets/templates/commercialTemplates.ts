import type { MotionTemplate } from "@/core/motion-doc/presets/templates/templateTypes";

export const commercialTemplates: MotionTemplate[] = [
  {
    id: "black-commercial",
    name: "Black Boardroom",
    category: "Black",
    duration: "60s",
    description: "A premium 12-page boardroom deck with decision framing, market context, value pools, metrics, charts, risks, and a clear executive ask.",
    useCase: "Board updates, growth strategy, enterprise sales narratives",
    source: `# Black Boardroom

<Slide duration={5} theme="dark" background="#030303" accent="#ffffff" shader="aurora" shaderIntensity={0.6} shaderColor1="#ffffff" shaderColor2="#030303" shaderColor3="#27272a" textColor="#ffffff">
  <Text enter="fadeUp" fontSize={78} fontWeight={800} h={24} w={84} x={8} y={20}>Growth Investment Memo</Text>
  <Text enter="fadeUp" delay={0.2} fontSize={22} lineHeight={1.5} h={20} x={8} y={56} w={64}>A boardroom-ready narrative for framing the decision, sizing the opportunity, and aligning the next operating move.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#080808" accent="#ffffff">
  <Text enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Decision summary</Text>
  <Text fontSize={64} fontWeight={800} x={8} y={32} w={26} h={14}>$2.4M</Text>
  <Text fontSize={20} fontWeight={600} x={8} y={58} w={26} h={8}>Value pool</Text>
  <Text fontSize={16} lineHeight={1.4} x={8} y={74} w={26} h={14}>Near-term qualified upside across priority accounts and expansion motions.</Text>

  <Text fontSize={64} fontWeight={800} x={37} y={32} w={26} h={14}>+31%</Text>
  <Text fontSize={20} fontWeight={600} x={37} y={58} w={26} h={8}>Win-rate lift</Text>
  <Text fontSize={16} lineHeight={1.4} x={37} y={74} w={26} h={14}>Modeled improvement from sharper proof, packaging, and buyer-specific messaging.</Text>

  <Text fontSize={64} fontWeight={800} x={66} y={32} w={26} h={14}>-18%</Text>
  <Text fontSize={20} fontWeight={600} x={66} y={58} w={26} h={8}>Sales cycle</Text>
  <Text fontSize={16} lineHeight={1.4} x={66} y={74} w={26} h={14}>Expected reduction in time-to-decision from clearer stakeholder alignment.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <Text enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Market inflection</Text>
  <Icon icon="TrendingUp" size={42} strokeWidth={1.5} x={8} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={8} y={52} w={40} h={8}>Demand is concentrating</Text>
  <Text fontSize={18} lineHeight={1.5} x={8} y={68} w={40} h={18}>Growth is shifting toward fewer accounts with clearer budgets, stronger urgency, and higher proof requirements.</Text>

  <Icon icon="CircleAlert" size={42} strokeWidth={1.5} x={50} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={50} y={52} w={40} h={8}>Generic decks are underperforming</Text>
  <Text fontSize={18} lineHeight={1.5} x={50} y={68} w={40} h={18}>Buyers expect board-level clarity: financial impact, implementation confidence, and risk controls in one story.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#0d0d0d" accent="#f5f5f5">
  <Text enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Revenue momentum</Text>
  <Chart title="Qualified pipeline index" labels="Q1,Q2,Q3,Q4" values="38,52,71,94" width="full" height={180} enter="fadeUp" delay={0.2} radius={24} h={52} w={84} x={8} y={30} />
</Slide>

<Slide duration={5} theme="dark" background="#030303" accent="#ffffff">
  <Text enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Buyer evidence</Text>
  <Icon icon="MessageSquare" size={42} strokeWidth={1.5} x={8} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={8} y={52} w={40} h={8}>The repeated question</Text>
  <Text fontSize={18} lineHeight={1.5} x={8} y={68} w={40} h={18}>Can the team make the business case specific enough without slowing the sales motion?</Text>

  <Icon icon="BadgeCheck" size={42} strokeWidth={1.5} x={50} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={50} y={52} w={40} h={8}>The trust trigger</Text>
  <Text fontSize={18} lineHeight={1.5} x={50} y={68} w={40} h={18}>A focused deck that pairs commercial outcomes, data, implementation path, and portable export.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#111111" accent="#ffffff">
  <Text enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Strategic response</Text>
  <Icon icon="Target" size={42} strokeWidth={1.5} x={8} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={8} y={52} w={26} h={8}>Sharpen the offer</Text>
  <Text fontSize={18} lineHeight={1.5} x={8} y={68} w={26} h={18}>Turn the commercial message into a clear decision case with a specific audience and ask.</Text>

  <Icon icon="Layers" size={42} strokeWidth={1.5} x={37} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={37} y={52} w={26} h={8}>Build the proof stack</Text>
  <Text fontSize={18} lineHeight={1.5} x={37} y={68} w={26} h={18}>Combine metrics, charts, buyer evidence, operating plan, and risk controls.</Text>

  <Icon icon="Download" size={42} strokeWidth={1.5} x={66} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={66} y={52} w={26} h={8}>Make it portable</Text>
  <Text fontSize={18} lineHeight={1.5} x={66} y={68} w={26} h={18}>Export MDX and interactive HTML so the work can travel across review and local workflows.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <ImageBlock fit="cover" src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200" alt="Commercial team reviewing data" enter="fadeIn" delay={0.1} radius={24} h={70} w={42} x={8} y={15} />
  <Text enter="fadeUp" delay={0.25} fontSize={24} lineHeight={1.5} h={52} w={36} x={56} y={30}>Use this frame for product evidence, account context, customer proof, or a leadership working session.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#080808" accent="#f5f5f5">
  <Text enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Financial impact</Text>
  <Text fontSize={64} fontWeight={800} x={8} y={32} w={40} h={14}>420h</Text>
  <Text fontSize={20} fontWeight={600} x={8} y={58} w={40} h={8}>Productivity release</Text>
  <Text fontSize={16} lineHeight={1.4} x={8} y={74} w={40} h={14}>Quarterly effort returned from presentation production, revision, and handoff work.</Text>

  <Text fontSize={64} fontWeight={800} x={50} y={32} w={40} h={14}>2.8x</Text>
  <Text fontSize={20} fontWeight={600} x={50} y={58} w={40} h={8}>Cycle velocity</Text>
  <Text fontSize={16} lineHeight={1.4} x={50} y={74} w={40} h={14}>Faster iteration from editable source, reusable templates, and direct export.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#0f0f0f" accent="#ffffff">
  <Text enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Operating adoption</Text>
  <Chart title="Readiness by function" labels="Sales,Success,Product,Ops" values="82,64,48,39" width="full" height={180} enter="fadeUp" delay={0.2} radius={24} h={52} w={84} x={8} y={30} />
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <Text enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Risks and controls</Text>
  <Icon icon="Lock" size={42} strokeWidth={1.5} x={8} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={8} y={52} w={40} h={8}>Confidentiality</Text>
  <Text fontSize={18} lineHeight={1.5} x={8} y={68} w={40} h={18}>Sensitive customer and strategy work can stay in the installed local Pitch.</Text>

  <Icon icon="Settings" size={42} strokeWidth={1.5} x={50} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={50} y={52} w={40} h={8}>Governance</Text>
  <Text fontSize={18} lineHeight={1.5} x={50} y={68} w={40} h={18}>Teams start from approved commercial templates before customizing account-level slides.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#101010" accent="#ffffff">
  <Text enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>90-day execution plan</Text>
  <Icon icon="Calendar" size={42} strokeWidth={1.5} x={8} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={8} y={52} w={26} h={8}>01 Pilot</Text>
  <Text fontSize={18} lineHeight={1.5} x={8} y={68} w={26} h={18}>Build one enterprise account deck and one executive operating review.</Text>

  <Icon icon="CheckCircle" size={42} strokeWidth={1.5} x={37} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={37} y={52} w={26} h={8}>02 Prove</Text>
  <Text fontSize={18} lineHeight={1.5} x={37} y={68} w={26} h={18}>Measure edit time, message quality, stakeholder response, and export reliability.</Text>

  <Icon icon="ArrowUpRight" size={42} strokeWidth={1.5} x={66} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={66} y={52} w={26} h={8}>03 Scale</Text>
  <Text fontSize={18} lineHeight={1.5} x={66} y={68} w={26} h={18}>Turn the winning narrative into governed templates and repeatable local workflows.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#030303" accent="#ffffff" shader="waves" shaderColor1="#171717" shaderColor2="#030303" shaderColor3="#27272a" shaderIntensity={0.3}>
  <Text enter="zoomIn" fontSize={72} fontWeight={800} h={20} w={80} x={10} y={24} textAlign="center">Decision requested</Text>
  <Text enter="fadeUp" delay={0.2} fontSize={24} lineHeight={1.6} h={24} x={10} y={56} w={70} textAlign="center">Approve a focused commercial pilot, validate the operating impact, then expand the black and white template system.</Text>
</Slide>`
  },

  {
    id: "white-commercial",
    name: "White Executive",
    category: "White",
    duration: "60s",
    description: "A polished 12-page executive proposal deck with a consulting-style structure, clean metrics, customer proof, implementation logic, and a precise decision page.",
    useCase: "Client proposals, investor updates, quarterly business reviews",
    source: `# White Executive

<Slide duration={5} theme="light" background="#ffffff" accent="#111111" shader="aurora" shaderIntensity={0.5} shaderColor1="#111111" shaderColor2="#ffffff" shaderColor3="#d4d4d8" textColor="#111111">
  <Text enter="fadeUp" fontSize={78} fontWeight={800} h={24} w={84} x={8} y={20}>Executive Growth Proposal</Text>
  <Text enter="fadeUp" delay={0.2} fontSize={22} lineHeight={1.5} h={20} x={8} y={56} w={64}>A client-ready narrative for aligning the opportunity, proving the business case, and moving leadership toward a clear decision.</Text>
</Slide>

<Slide duration={5} theme="light" background="#f7f7f7" accent="#111111">
  <Text enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Executive snapshot</Text>
  <Text fontSize={64} fontWeight={800} x={8} y={32} w={26} h={14}>$4.8M</Text>
  <Text fontSize={20} fontWeight={600} x={8} y={58} w={26} h={8}>Revenue upside</Text>
  <Text fontSize={16} lineHeight={1.4} x={8} y={74} w={26} h={14}>Modeled impact from the priority motions proposed in this deck.</Text>

  <Text fontSize={64} fontWeight={800} x={37} y={32} w={26} h={14}>94%</Text>
  <Text fontSize={20} fontWeight={600} x={37} y={58} w={26} h={8}>Retention base</Text>
  <Text fontSize={16} lineHeight={1.4} x={37} y={74} w={26} h={14}>Protected revenue from onboarding quality, stakeholder fit, and renewal visibility.</Text>

  <Text fontSize={64} fontWeight={800} x={66} y={32} w={26} h={14}>1.7x</Text>
  <Text fontSize={20} fontWeight={600} x={66} y={58} w={26} h={8}>Expansion rate</Text>
  <Text fontSize={16} lineHeight={1.4} x={66} y={74} w={26} h={14}>Target account growth from packaged proof and sharper commercial sequencing.</Text>
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <Text enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Commercial thesis</Text>
  <Icon icon="Lightbulb" size={42} strokeWidth={1.5} x={8} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={8} y={52} w={40} h={8}>Make the decision simple</Text>
  <Text fontSize={18} lineHeight={1.5} x={8} y={68} w={40} h={18}>Senior buyers respond when the story compresses complexity into a clear business case, operating path, and measurable ask.</Text>

  <Icon icon="UserCheck" size={42} strokeWidth={1.5} x={50} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={50} y={52} w={40} h={8}>Make the proof specific</Text>
  <Text fontSize={18} lineHeight={1.5} x={50} y={68} w={40} h={18}>The strongest proposal connects market timing, account pain, data, implementation confidence, and team-level outcomes.</Text>
</Slide>

<Slide duration={5} theme="light" background="#f4f4f4" accent="#111111">
  <Text enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Where momentum is building</Text>
  <Chart title="Opportunity growth by segment" labels="SMB,Mid,Enterprise,Strategic" values="28,46,73,88" width="full" height={180} enter="fadeUp" delay={0.2} radius={24} h={52} w={84} x={8} y={30} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <Text enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Customer signal</Text>
  <Icon icon="MessageSquare" size={42} strokeWidth={1.5} x={8} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={8} y={52} w={40} h={8}>The repeated objection</Text>
  <Text fontSize={18} lineHeight={1.5} x={8} y={68} w={40} h={18}>The team believes in the direction, but needs sharper evidence before committing time, budget, and executive attention.</Text>

  <Icon icon="CheckCircle" size={42} strokeWidth={1.5} x={50} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={50} y={52} w={40} h={8}>The conversion moment</Text>
  <Text fontSize={18} lineHeight={1.5} x={50} y={68} w={40} h={18}>A concise proposal that frames the financial prize, delivery model, proof points, and next step in one portable deck.</Text>
</Slide>

<Slide duration={5} theme="light" background="#f8f8f8" accent="#111111">
  <Text enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Proposal architecture</Text>
  <Icon icon="Palette" size={42} strokeWidth={1.5} x={8} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={8} y={52} w={26} h={8}>Executive design</Text>
  <Text fontSize={18} lineHeight={1.5} x={8} y={68} w={26} h={18}>A restrained white system for proposals, business reviews, and client-facing strategy work.</Text>

  <Icon icon="BarChart3" size={42} strokeWidth={1.5} x={37} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={37} y={52} w={26} h={8}>Evidence layer</Text>
  <Text fontSize={18} lineHeight={1.5} x={37} y={68} w={26} h={18}>Metrics and charts create a business argument without forcing the audience to decode raw detail.</Text>

  <Icon icon="Code2" size={42} strokeWidth={1.5} x={66} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={66} y={52} w={26} h={8}>Editable source</Text>
  <Text fontSize={18} lineHeight={1.5} x={66} y={68} w={26} h={18}>MDX keeps the deck readable, flexible, and ready for local workflows after installation.</Text>
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <ImageBlock fit="cover" src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1200" alt="Clean architectural detail" enter="fadeIn" delay={0.1} radius={24} h={70} w={42} x={8} y={15} />
  <Text enter="fadeUp" delay={0.25} fontSize={24} lineHeight={1.5} h={52} w={36} x={56} y={30}>Use this page for product evidence, market imagery, customer context, or a quiet visual pause between data-heavy sections.</Text>
</Slide>

<Slide duration={5} theme="light" background="#f6f6f6" accent="#111111">
  <Text enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Operating leverage</Text>
  <Text fontSize={64} fontWeight={800} x={8} y={32} w={40} h={14}>-62%</Text>
  <Text fontSize={20} fontWeight={600} x={8} y={58} w={40} h={8}>Production time</Text>
  <Text fontSize={16} lineHeight={1.4} x={8} y={74} w={40} h={14}>Less time spent formatting, restructuring, and rebuilding presentation logic.</Text>

  <Text fontSize={64} fontWeight={800} x={50} y={32} w={40} h={14}>8.5x</Text>
  <Text fontSize={20} fontWeight={600} x={50} y={58} w={40} h={8}>Template reuse</Text>
  <Text fontSize={16} lineHeight={1.4} x={50} y={74} w={40} h={14}>More repeated use from a small approved slide system built for commercial teams.</Text>
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <Text enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Readiness by function</Text>
  <Chart title="Implementation readiness" labels="Sales,Marketing,Success,Ops" values="76,59,68,44" width="full" height={180} enter="fadeUp" delay={0.2} radius={24} h={52} w={84} x={8} y={30} />
</Slide>

<Slide duration={5} theme="light" background="#f8f8f8" accent="#111111">
  <Text enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Implementation guardrails</Text>
  <Icon icon="Lock" size={42} strokeWidth={1.5} x={8} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={8} y={52} w={40} h={8}>Private work stays local</Text>
  <Text fontSize={18} lineHeight={1.5} x={8} y={68} w={40} h={18}>Installed Pitch unlocks local-only editing for confidential customer and strategy work.</Text>

  <Icon icon="FileText" size={42} strokeWidth={1.5} x={50} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={50} y={52} w={40} h={8}>Outputs stay portable</Text>
  <Text fontSize={18} lineHeight={1.5} x={50} y={68} w={40} h={18}>MDX and interactive HTML exports keep the proposal reviewable without locking it into one tool.</Text>
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <Text enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Next 30 days</Text>
  <Icon icon="CheckCircle" size={42} strokeWidth={1.5} x={8} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={8} y={52} w={26} h={8}>01 Align</Text>
  <Text fontSize={18} lineHeight={1.5} x={8} y={68} w={26} h={18}>Confirm the audience, decision owner, commercial question, and success metric.</Text>

  <Icon icon="Layers" size={42} strokeWidth={1.5} x={37} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={37} y={52} w={26} h={8}>02 Build</Text>
  <Text fontSize={18} lineHeight={1.5} x={37} y={68} w={26} h={18}>Replace the template content with customer-specific proof, financial logic, and delivery detail.</Text>

  <Icon icon="Download" size={42} strokeWidth={1.5} x={66} y={32} w={5} h={8} />
  <Text fontSize={24} fontWeight={700} x={66} y={52} w={26} h={8}>03 Review</Text>
  <Text fontSize={18} lineHeight={1.5} x={66} y={68} w={26} h={18}>Export MDX and interactive HTML for stakeholder review, then tighten the final executive ask.</Text>
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111" shader="mesh" shaderColor1="#ffffff" shaderColor2="#f4f4f5" shaderColor3="#d4d4d8" shaderIntensity={0.4}>
  <Text enter="zoomIn" fontSize={72} fontWeight={800} h={20} w={80} x={10} y={24} textAlign="center">Approve the pilot</Text>
  <Text enter="fadeUp" delay={0.2} fontSize={24} lineHeight={1.6} h={24} x={10} y={56} w={70} textAlign="center">Move forward with one executive-ready proposal workflow, validate the impact, then scale the black and white template system.</Text>
</Slide>`
  }
];
