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
  <Title enter="fadeUp" fontSize={78} fontWeight={800} h={24} w={84} x={8} y={20}>Growth Investment Memo</Title>
  <Text enter="fadeUp" delay={0.2} fontSize={22} lineHeight={1.5} h={20} w={64} x={8} y={48}>A boardroom-ready narrative for framing the decision, sizing the opportunity, and aligning the next operating move.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#080808" accent="#ffffff">
  <Title enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Decision summary</Title>
  <Metric label="Value pool" value="$2.4M" caption="Near-term qualified upside across priority accounts and expansion motions." enter="fadeUp" delay={0.1} radius={24} h={36} w={26} x={8} y={32} />
  <Metric label="Win-rate lift" value="+31%" caption="Modeled improvement from sharper proof, packaging, and buyer-specific messaging." enter="fadeUp" delay={0.2} radius={24} h={36} w={26} x={37} y={32} />
  <Metric label="Sales cycle" value="-18%" caption="Expected reduction in time-to-decision from clearer stakeholder alignment." enter="fadeUp" delay={0.3} radius={24} h={36} w={26} x={66} y={32} />
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <Title enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Market inflection</Title>
  <Card icon="TrendingUp" layout="vertical" title="Demand is concentrating" text="Growth is shifting toward fewer accounts with clearer budgets, stronger urgency, and higher proof requirements." enter="fadeUp" delay={0.1} radius={24} h={42} w={48} x={8} y={32} />
  <Card icon="CircleAlert" layout="vertical" title="Generic decks are underperforming" text="Buyers expect board-level clarity: financial impact, implementation confidence, and risk controls in one story." enter="fadeUp" delay={0.2} radius={24} h={42} w={32} x={60} y={32} />
</Slide>

<Slide duration={5} theme="dark" background="#0d0d0d" accent="#f5f5f5">
  <Title enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Revenue momentum</Title>
  <Chart title="Qualified pipeline index" labels="Q1,Q2,Q3,Q4" values="38,52,71,94" width="full" height={180} enter="fadeUp" delay={0.2} radius={24} h={52} w={84} x={8} y={30} />
</Slide>

<Slide duration={5} theme="dark" background="#030303" accent="#ffffff">
  <Title enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Buyer evidence</Title>
  <Card icon="MessageSquare" layout="vertical" title="The repeated question" text="Can the team make the business case specific enough without slowing the sales motion?" enter="fadeUp" delay={0.1} radius={24} h={40} w={46} x={8} y={32} />
  <Card icon="BadgeCheck" layout="vertical" title="The trust trigger" text="A focused deck that pairs commercial outcomes, data, implementation path, and portable export." enter="fadeUp" delay={0.25} radius={24} h={40} w={34} x={58} y={32} />
</Slide>

<Slide duration={5} theme="dark" background="#111111" accent="#ffffff">
  <Title enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Strategic response</Title>
  <Card icon="Target" layout="vertical" title="Sharpen the offer" text="Turn the commercial message into a clear decision case with a specific audience and ask." enter="fadeUp" delay={0.1} radius={24} h={44} w={25} x={8} y={32} />
  <Card icon="Layers" layout="vertical" title="Build the proof stack" text="Combine metrics, charts, buyer evidence, operating plan, and risk controls." enter="fadeUp" delay={0.2} radius={24} h={44} w={28} x={35} y={32} />
  <Card icon="Download" layout="vertical" title="Make it portable" text="Export MDX and interactive HTML so the work can travel across review and local workflows." enter="fadeUp" delay={0.3} radius={24} h={44} w={25} x={65} y={32} />
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <ImageBlock fit="cover" src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200" alt="Commercial team reviewing data" enter="fadeIn" delay={0.1} radius={24} h={70} w={42} x={8} y={15} />
  <Text enter="fadeUp" delay={0.25} fontSize={24} lineHeight={1.5} h={52} w={36} x={56} y={24}>Use this frame for product evidence, account context, customer proof, or a leadership working session.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#080808" accent="#f5f5f5">
  <Title enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Financial impact</Title>
  <Metric label="Productivity release" value="420h" caption="Quarterly effort returned from presentation production, revision, and handoff work." enter="zoomIn" delay={0.1} radius={24} h={40} w={36} x={12} y={32} />
  <Metric label="Cycle velocity" value="2.8x" caption="Faster iteration from editable source, reusable templates, and direct export." enter="zoomIn" delay={0.2} radius={24} h={40} w={36} x={52} y={32} />
</Slide>

<Slide duration={5} theme="dark" background="#0f0f0f" accent="#ffffff">
  <Title enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Operating adoption</Title>
  <Chart title="Readiness by function" labels="Sales,Success,Product,Ops" values="82,64,48,39" width="full" height={180} enter="fadeUp" delay={0.2} radius={24} h={52} w={84} x={8} y={30} />
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <Title enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Risks and controls</Title>
  <Card icon="Lock" layout="vertical" title="Confidentiality" text="Sensitive customer and strategy work can stay in the installed local Studio." enter="fadeUp" delay={0.1} radius={24} h={42} w={34} x={8} y={32} />
  <Card icon="Settings" layout="vertical" title="Governance" text="Teams start from approved commercial templates before customizing account-level slides." enter="fadeUp" delay={0.25} radius={24} h={42} w={46} x={46} y={32} />
</Slide>

<Slide duration={5} theme="dark" background="#101010" accent="#ffffff">
  <Title enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>90-day execution plan</Title>
  <Card title="01 Pilot" text="Build one enterprise account deck and one executive operating review." enter="fadeUp" delay={0.1} radius={24} h={44} w={25} x={8} y={32} />
  <Card title="02 Prove" text="Measure edit time, message quality, stakeholder response, and export reliability." enter="fadeUp" delay={0.2} radius={24} h={44} w={28} x={35} y={32} />
  <Card title="03 Scale" text="Turn the winning narrative into governed templates and repeatable local workflows." enter="fadeUp" delay={0.3} radius={24} h={44} w={25} x={65} y={32} />
</Slide>

<Slide duration={5} theme="dark" background="#030303" accent="#ffffff">
  <Title enter="zoomIn" fontSize={72} fontWeight={800} h={20} w={80} x={10} y={24} textAlign="center">Decision requested</Title>
  <Text enter="fadeUp" delay={0.2} fontSize={24} lineHeight={1.6} h={24} w={70} x={15} y={50} textAlign="center">Approve a focused commercial pilot, validate the operating impact, then expand the black and white template system.</Text>
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
  <Title enter="fadeUp" fontSize={78} fontWeight={800} h={24} w={84} x={8} y={20}>Executive Growth Proposal</Title>
  <Text enter="fadeUp" delay={0.2} fontSize={22} lineHeight={1.5} h={20} w={64} x={8} y={48}>A client-ready narrative for aligning the opportunity, proving the business case, and moving leadership toward a clear decision.</Text>
</Slide>

<Slide duration={5} theme="light" background="#f7f7f7" accent="#111111">
  <Title enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Executive snapshot</Title>
  <Metric label="Revenue upside" value="$4.8M" caption="Modeled impact from the priority motions proposed in this deck." enter="fadeUp" delay={0.1} radius={24} h={36} w={26} x={8} y={32} />
  <Metric label="Retention base" value="94%" caption="Protected revenue from onboarding quality, stakeholder fit, and renewal visibility." enter="fadeUp" delay={0.2} radius={24} h={36} w={26} x={37} y={32} />
  <Metric label="Expansion rate" value="1.7x" caption="Target account growth from packaged proof and sharper commercial sequencing." enter="fadeUp" delay={0.3} radius={24} h={36} w={26} x={66} y={32} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <Title enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Commercial thesis</Title>
  <Card icon="Lightbulb" layout="vertical" title="Make the decision simple" text="Senior buyers respond when the story compresses complexity into a clear business case, operating path, and measurable ask." enter="fadeUp" delay={0.1} radius={24} h={42} w={48} x={8} y={32} />
  <Card icon="UserCheck" layout="vertical" title="Make the proof specific" text="The strongest proposal connects market timing, account pain, data, implementation confidence, and team-level outcomes." enter="fadeUp" delay={0.25} radius={24} h={42} w={32} x={60} y={32} />
</Slide>

<Slide duration={5} theme="light" background="#f4f4f4" accent="#111111">
  <Title enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Where momentum is building</Title>
  <Chart title="Opportunity growth by segment" labels="SMB,Mid,Enterprise,Strategic" values="28,46,73,88" width="full" height={180} enter="fadeUp" delay={0.2} radius={24} h={52} w={84} x={8} y={30} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <Title enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Customer signal</Title>
  <Card icon="MessageSquare" layout="vertical" title="The repeated objection" text="The team believes in the direction, but needs sharper evidence before committing time, budget, and executive attention." enter="fadeUp" delay={0.1} radius={24} h={40} w={46} x={8} y={32} />
  <Card icon="CheckCircle" layout="vertical" title="The conversion moment" text="A concise proposal that frames the financial prize, delivery model, proof points, and next step in one portable deck." enter="fadeUp" delay={0.25} radius={24} h={40} w={34} x={58} y={32} />
</Slide>

<Slide duration={5} theme="light" background="#f8f8f8" accent="#111111">
  <Title enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Proposal architecture</Title>
  <Card icon="Palette" layout="vertical" title="Executive design" text="A restrained white system for proposals, business reviews, and client-facing strategy work." enter="fadeUp" delay={0.1} radius={24} h={44} w={25} x={8} y={32} />
  <Card icon="BarChart3" layout="vertical" title="Evidence layer" text="Metrics and charts create a business argument without forcing the audience to decode raw detail." enter="fadeUp" delay={0.2} radius={24} h={44} w={28} x={35} y={32} />
  <Card icon="Code2" layout="vertical" title="Editable source" text="MDX keeps the deck readable, flexible, and ready for local workflows after installation." enter="fadeUp" delay={0.3} radius={24} h={44} w={25} x={65} y={32} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <ImageBlock fit="cover" src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1200" alt="Clean architectural detail" enter="fadeIn" delay={0.1} radius={24} h={70} w={42} x={8} y={15} />
  <Text enter="fadeUp" delay={0.25} fontSize={24} lineHeight={1.5} h={52} w={36} x={56} y={24}>Use this page for product evidence, market imagery, customer context, or a quiet visual pause between data-heavy sections.</Text>
</Slide>

<Slide duration={5} theme="light" background="#f6f6f6" accent="#111111">
  <Title enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Operating leverage</Title>
  <Metric label="Production time" value="-62%" caption="Less time spent formatting, restructuring, and rebuilding presentation logic." enter="zoomIn" delay={0.1} radius={24} h={40} w={36} x={12} y={32} />
  <Metric label="Template reuse" value="8.5x" caption="More repeated use from a small approved slide system built for commercial teams." enter="zoomIn" delay={0.2} radius={24} h={40} w={36} x={52} y={32} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <Title enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Readiness by function</Title>
  <Chart title="Implementation readiness" labels="Sales,Marketing,Success,Ops" values="76,59,68,44" width="full" height={180} enter="fadeUp" delay={0.2} radius={24} h={52} w={84} x={8} y={30} />
</Slide>

<Slide duration={5} theme="light" background="#f8f8f8" accent="#111111">
  <Title enter="fadeUp" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Implementation guardrails</Title>
  <Card icon="Lock" layout="vertical" title="Private work stays local" text="Installed Studio unlocks local-only editing for confidential customer and strategy work." enter="fadeUp" delay={0.1} radius={24} h={42} w={34} x={8} y={32} />
  <Card icon="FileText" layout="vertical" title="Outputs stay portable" text="MDX and interactive HTML exports keep the proposal reviewable without locking it into one tool." enter="fadeUp" delay={0.25} radius={24} h={42} w={46} x={46} y={32} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <Title enter="slideLeft" fontSize={54} fontWeight={700} h={15} w={84} x={8} y={10}>Next 30 days</Title>
  <Card title="01 Align" text="Confirm the audience, decision owner, commercial question, and success metric." enter="fadeUp" delay={0.1} radius={24} h={44} w={25} x={8} y={32} />
  <Card title="02 Build" text="Replace the template content with customer-specific proof, financial logic, and delivery detail." enter="fadeUp" delay={0.2} radius={24} h={44} w={28} x={35} y={32} />
  <Card title="03 Review" text="Export MDX and interactive HTML for stakeholder review, then tighten the final executive ask." enter="fadeUp" delay={0.3} radius={24} h={44} w={25} x={65} y={32} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <Title enter="zoomIn" fontSize={72} fontWeight={800} h={20} w={80} x={10} y={24} textAlign="center">Approve the pilot</Title>
  <Text enter="fadeUp" delay={0.2} fontSize={24} lineHeight={1.6} h={24} w={70} x={15} y={50} textAlign="center">Move forward with one executive-ready proposal workflow, validate the impact, then scale the black and white template system.</Text>
</Slide>`
  }
];
