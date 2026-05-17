export type MotionTemplate = {
  id: string;
  name: string;
  category: string;
  duration: string;
  description: string;
  useCase: string;
  source: string;
};

export const motionTemplates: MotionTemplate[] = [
  {
    id: "black-commercial",
    name: "Black Boardroom",
    category: "Black",
    duration: "60s",
    description: "A premium 12-page boardroom deck with decision framing, market context, value pools, metrics, charts, risks, and a clear executive ask.",
    useCase: "Board updates, growth strategy, enterprise sales narratives",
    source: `# Black Boardroom

<Slide duration={5} theme="dark" background="#030303" accent="#ffffff" alignX="left" alignY="center" textAlign="left">
  <Title enter="fadeUp" mb={18}>Growth Investment Memo</Title>
  <Text enter="fadeUp" delay={0.2}>A boardroom-ready narrative for framing the decision, sizing the opportunity, and aligning the next operating move.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#080808" accent="#ffffff" cardFlow="stack" metricFlow="grid">
  <Title enter="slideLeft" mb={18}>Decision summary</Title>
  <Metric label="Value pool" value="$2.4M" caption="Near-term qualified upside across priority accounts and expansion motions." enter="fadeUp" delay={0.1} />
  <Metric label="Win-rate lift" value="+31%" caption="Modeled improvement from sharper proof, packaging, and buyer-specific messaging." enter="fadeUp" delay={0.2} />
  <Metric label="Sales cycle" value="-18%" caption="Expected reduction in time-to-decision from clearer stakeholder alignment." enter="fadeUp" delay={0.3} />
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff" cardFlow="grid">
  <Title enter="fadeUp" mb={16}>Market inflection</Title>
  <Card icon="TrendingUp" layout="horizontal" width="md" title="Demand is concentrating" text="Growth is shifting toward fewer accounts with clearer budgets, stronger urgency, and higher proof requirements." enter="fadeUp" delay={0.1} />
  <Card icon="CircleAlert" layout="horizontal" width="md" title="Generic decks are underperforming" text="Buyers expect board-level clarity: financial impact, implementation confidence, and risk controls in one story." enter="fadeUp" delay={0.2} />
</Slide>

<Slide duration={5} theme="dark" background="#0d0d0d" accent="#f5f5f5">
  <Title enter="slideLeft" mb={18}>Revenue momentum</Title>
  <Chart title="Qualified pipeline index" labels="Q1,Q2,Q3,Q4" values="38,52,71,94" width="lg" height={156} enter="fadeUp" delay={0.2} />
</Slide>

<Slide duration={5} theme="dark" background="#030303" accent="#ffffff" cardFlow="grid">
  <Title enter="fadeUp" mb={16}>Buyer evidence</Title>
  <Card icon="MessageSquare" layout="horizontal" width="lg" title="The repeated question" text="Can the team make the business case specific enough without slowing the sales motion?" enter="fadeUp" delay={0.1} />
  <Card icon="BadgeCheck" layout="horizontal" width="lg" title="The trust trigger" text="A focused deck that pairs commercial outcomes, data, implementation path, and portable export." enter="fadeUp" delay={0.25} />
</Slide>

<Slide duration={5} theme="dark" background="#111111" accent="#ffffff" cardFlow="grid">
  <Title enter="slideLeft" mb={18}>Strategic response</Title>
  <Card icon="Target" title="Sharpen the offer" text="Turn the commercial message into a clear decision case with a specific audience and ask." enter="fadeUp" delay={0.1} />
  <Card icon="Layers" title="Build the proof stack" text="Combine metrics, charts, buyer evidence, operating plan, and risk controls." enter="fadeUp" delay={0.2} />
  <Card icon="Download" title="Make it portable" text="Export MDX and interactive HTML so the work can travel across review and local workflows." enter="fadeUp" delay={0.3} />
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <ImageBlock fit="cover" src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200" alt="Commercial team reviewing data" enter="fadeIn" delay={0.1} mb={18} />
  <Text enter="fadeUp" delay={0.25}>Use this frame for product evidence, account context, customer proof, or a leadership working session.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#080808" accent="#f5f5f5" cardFlow="stack" metricFlow="grid">
  <Title enter="fadeUp" mb={16}>Financial impact</Title>
  <Metric label="Productivity release" value="420h" caption="Quarterly effort returned from presentation production, revision, and handoff work." enter="zoomIn" delay={0.1} />
  <Metric label="Cycle velocity" value="2.8x" caption="Faster iteration from editable source, reusable templates, and direct export." enter="zoomIn" delay={0.2} />
</Slide>

<Slide duration={5} theme="dark" background="#0f0f0f" accent="#ffffff">
  <Title enter="slideLeft" mb={18}>Operating adoption</Title>
  <Chart title="Readiness by function" labels="Sales,Success,Product,Ops" values="82,64,48,39" width="lg" height={156} enter="fadeUp" delay={0.2} />
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff" cardFlow="grid">
  <Title enter="fadeUp" mb={16}>Risks and controls</Title>
  <Card icon="Lock" layout="horizontal" width="md" title="Confidentiality" text="Sensitive customer and strategy work can stay in the installed local Studio." enter="fadeUp" delay={0.1} />
  <Card icon="Settings" layout="horizontal" width="md" title="Governance" text="Teams start from approved commercial templates before customizing account-level slides." enter="fadeUp" delay={0.25} />
</Slide>

<Slide duration={5} theme="dark" background="#101010" accent="#ffffff" cardFlow="grid">
  <Title enter="slideLeft" mb={18}>90-day execution plan</Title>
  <Card title="01 Pilot" text="Build one enterprise account deck and one executive operating review." enter="fadeUp" delay={0.1} />
  <Card title="02 Prove" text="Measure edit time, message quality, stakeholder response, and export reliability." enter="fadeUp" delay={0.2} />
  <Card title="03 Scale" text="Turn the winning narrative into governed templates and repeatable local workflows." enter="fadeUp" delay={0.3} />
</Slide>

<Slide duration={5} theme="dark" background="#030303" accent="#ffffff" alignX="center" alignY="center" textAlign="center">
  <Title enter="zoomIn" mb={16}>Decision requested</Title>
  <Text enter="fadeUp" delay={0.2}>Approve a focused commercial pilot, validate the operating impact, then expand the black and white template system.</Text>
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

<Slide duration={5} theme="light" background="#ffffff" accent="#111111" alignX="left" alignY="center" textAlign="left">
  <Title enter="fadeUp" mb={18}>Executive Growth Proposal</Title>
  <Text enter="fadeUp" delay={0.2}>A client-ready narrative for aligning the opportunity, proving the business case, and moving leadership toward a clear decision.</Text>
</Slide>

<Slide duration={5} theme="light" background="#f7f7f7" accent="#111111" cardFlow="stack" metricFlow="grid">
  <Title enter="slideLeft" mb={18}>Executive snapshot</Title>
  <Metric label="Revenue upside" value="$4.8M" caption="Modeled impact from the priority motions proposed in this deck." enter="fadeUp" delay={0.1} />
  <Metric label="Retention base" value="94%" caption="Protected revenue from onboarding quality, stakeholder fit, and renewal visibility." enter="fadeUp" delay={0.2} />
  <Metric label="Expansion rate" value="1.7x" caption="Target account growth from packaged proof and sharper commercial sequencing." enter="fadeUp" delay={0.3} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111" cardFlow="grid">
  <Title enter="fadeUp" mb={16}>Commercial thesis</Title>
  <Card icon="Lightbulb" layout="horizontal" width="lg" title="Make the decision simple" text="Senior buyers respond when the story compresses complexity into a clear business case, operating path, and measurable ask." enter="fadeUp" delay={0.1} />
  <Card icon="UserCheck" layout="horizontal" width="lg" title="Make the proof specific" text="The strongest proposal connects market timing, account pain, data, implementation confidence, and team-level outcomes." enter="fadeUp" delay={0.25} />
</Slide>

<Slide duration={5} theme="light" background="#f4f4f4" accent="#111111">
  <Title enter="slideLeft" mb={18}>Where momentum is building</Title>
  <Chart title="Opportunity growth by segment" labels="SMB,Mid,Enterprise,Strategic" values="28,46,73,88" width="lg" height={156} enter="fadeUp" delay={0.2} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111" cardFlow="grid">
  <Title enter="fadeUp" mb={16}>Customer signal</Title>
  <Card icon="MessageSquare" layout="horizontal" width="lg" title="The repeated objection" text="The team believes in the direction, but needs sharper evidence before committing time, budget, and executive attention." enter="fadeUp" delay={0.1} />
  <Card icon="CheckCircle" layout="horizontal" width="lg" title="The conversion moment" text="A concise proposal that frames the financial prize, delivery model, proof points, and next step in one portable deck." enter="fadeUp" delay={0.25} />
</Slide>

<Slide duration={5} theme="light" background="#f8f8f8" accent="#111111" cardFlow="grid">
  <Title enter="slideLeft" mb={18}>Proposal architecture</Title>
  <Card icon="Palette" title="Executive design" text="A restrained white system for proposals, business reviews, and client-facing strategy work." enter="fadeUp" delay={0.1} />
  <Card icon="BarChart3" title="Evidence layer" text="Metrics and charts create a business argument without forcing the audience to decode raw detail." enter="fadeUp" delay={0.2} />
  <Card icon="Code2" title="Editable source" text="MDX keeps the deck readable, flexible, and ready for local workflows after installation." enter="fadeUp" delay={0.3} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <ImageBlock fit="cover" src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1200" alt="Clean architectural detail" enter="fadeIn" delay={0.1} mb={18} />
  <Text enter="fadeUp" delay={0.25}>Use this page for product evidence, market imagery, customer context, or a quiet visual pause between data-heavy sections.</Text>
</Slide>

<Slide duration={5} theme="light" background="#f6f6f6" accent="#111111" cardFlow="stack" metricFlow="grid">
  <Title enter="fadeUp" mb={16}>Operating leverage</Title>
  <Metric label="Production time" value="-62%" caption="Less time spent formatting, restructuring, and rebuilding presentation logic." enter="zoomIn" delay={0.1} />
  <Metric label="Template reuse" value="8.5x" caption="More repeated use from a small approved slide system built for commercial teams." enter="zoomIn" delay={0.2} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <Title enter="slideLeft" mb={18}>Readiness by function</Title>
  <Chart title="Implementation readiness" labels="Sales,Marketing,Success,Ops" values="76,59,68,44" width="lg" height={156} enter="fadeUp" delay={0.2} />
</Slide>

<Slide duration={5} theme="light" background="#f8f8f8" accent="#111111" cardFlow="grid">
  <Title enter="fadeUp" mb={16}>Implementation guardrails</Title>
  <Card icon="Lock" layout="horizontal" width="md" title="Private work stays local" text="Installed Studio unlocks local-only editing for confidential customer and strategy work." enter="fadeUp" delay={0.1} />
  <Card icon="FileText" layout="horizontal" width="md" title="Outputs stay portable" text="MDX and interactive HTML exports keep the proposal reviewable without locking it into one tool." enter="fadeUp" delay={0.25} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111" cardFlow="grid">
  <Title enter="slideLeft" mb={18}>Next 30 days</Title>
  <Card title="01 Align" text="Confirm the audience, decision owner, commercial question, and success metric." enter="fadeUp" delay={0.1} />
  <Card title="02 Build" text="Replace the template content with customer-specific proof, financial logic, and delivery detail." enter="fadeUp" delay={0.2} />
  <Card title="03 Review" text="Export MDX and interactive HTML for stakeholder review, then tighten the final executive ask." enter="fadeUp" delay={0.3} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111" alignX="center" alignY="center" textAlign="center">
  <Title enter="zoomIn" mb={16}>Approve the pilot</Title>
  <Text enter="fadeUp" delay={0.2}>Move forward with one executive-ready proposal workflow, validate the impact, then scale the black and white template system.</Text>
</Slide>`
  }
];

export const snippetTemplates = [
  {
    id: "slide",
    label: "Slide",
    code: `<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <Title enter="fadeUp" mb={16}>New slide title</Title>
  <Text enter="fadeUp" delay={0.25}>
    Add supporting copy here.
  </Text>
</Slide>`
  },
  {
    id: "title",
    label: "Title",
    code: `<Title enter="fadeUp" mb={16}>Slide headline</Title>`
  },
  {
    id: "card",
    label: "Card",
    code: `<Card icon="Sparkles" layout="horizontal" title="Key point" text="Describe one benefit or detail." enter="fadeUp" delay={0.2} mb={12} />`
  },
  {
    id: "metric",
    label: "Metric",
    code: `<Metric label="Pipeline" value="$2.4M" caption="Qualified revenue influenced this quarter." width="sm" enter="fadeUp" delay={0.2} mb={12} />`
  },
  {
    id: "chart",
    label: "Chart",
    code: `<Chart title="Quarterly traction" labels="Q1,Q2,Q3,Q4" values="42,58,73,91" width="lg" height={144} enter="fadeUp" delay={0.2} mb={12} />`
  },
  {
    id: "image",
    label: "Image",
    code: `<ImageBlock fit="cover" src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200" alt="Uploaded image" enter="fadeIn" delay={0.2} />`
  }
];

export const defaultTemplate = motionTemplates[0];
