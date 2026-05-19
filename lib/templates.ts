export type MotionTemplate = {
  id: string;
  name: string;
  category: string;
  duration: string;
  description: string;
  useCase: string;
  source: string;
};

type BusinessTemplateConfig = {
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

const premiumBusinessTemplates: MotionTemplate[] = [
  createBusinessTemplate({
    id: "revenue-command",
    name: "Revenue Command Center",
    category: "Midnight Blue",
    theme: "dark",
    background: "#07111f",
    mutedBackground: "#0d1728",
    surfaceBackground: "#081220",
    accent: "#72a7ff",
    description: "A polished revenue leadership deck for pipeline health, buyer signals, operating priorities, and executive decisions.",
    useCase: "Revenue reviews, GTM leadership, sales strategy",
    hero: "Revenue Command Center",
    subtitle: "A board-ready operating view for pressure-testing pipeline quality, conversion confidence, and the next commercial moves.",
    metrics: [
      { label: "Pipeline cover", value: "3.4x", caption: "Weighted coverage across committed and high-confidence expansion paths." },
      { label: "Cycle compression", value: "-21%", caption: "Modeled improvement from tighter qualification and proof sequencing." },
      { label: "Expansion pool", value: "$8.6M", caption: "Near-term account upside within the active customer base." }
    ],
    thesis: [
      { icon: "Target", title: "Focus the motion", text: "Prioritize the segments where budget, urgency, and executive sponsorship are already visible." },
      { icon: "MessageSquare", title: "Tighten the proof", text: "Give account teams a sharper narrative for risk, value, timing, and implementation confidence." }
    ],
    chart: { title: "Pipeline quality index", labels: "Create,Qualify,Prove,Commit", values: "42,58,73,86" },
    evidence: [
      { icon: "BadgeCheck", title: "Buyer pattern", text: "Shortlisted opportunities are asking for financial evidence earlier in the process." },
      { icon: "Clock", title: "Decision friction", text: "Late-cycle delays are concentrated in security, enablement, and executive alignment." }
    ],
    strategy: [
      { icon: "Search", title: "Inspect deal shape", text: "Separate real timing from optimistic activity and route weak deals to nurture." },
      { icon: "Layers", title: "Package proof", text: "Turn wins, metrics, and implementation plans into repeatable account evidence." },
      { icon: "Rocket", title: "Accelerate commits", text: "Move exec-facing proposals earlier and reduce the cost of late-stage review." }
    ],
    image: {
      src: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200",
      alt: "Revenue team reviewing a dashboard"
    },
    proofText: "Use this slide for deal room evidence, customer proof, stakeholder maps, or a focused executive discussion.",
    economics: [
      { label: "Productivity release", value: "540h", caption: "Quarterly time returned from fewer narrative rebuilds and cleaner review loops." },
      { label: "Forecast confidence", value: "+18pt", caption: "Expected lift from shared qualification language and deal evidence." }
    ],
    risks: [
      { icon: "CircleAlert", title: "Pipeline inflation", text: "Separate activity volume from executive-sponsored opportunities." },
      { icon: "ShieldCheck", title: "Review discipline", text: "Keep decision artifacts governed so field teams customize without diluting the story." }
    ],
    plan: [
      { title: "01 Segment", text: "Rank opportunities by urgency, sponsor strength, and business impact." },
      { title: "02 Package", text: "Build reusable proof pages for the top two buyer objections." },
      { title: "03 Commit", text: "Turn high-confidence deals into a weekly executive decision review." }
    ]
  }),
  createBusinessTemplate({
    id: "investor-update",
    name: "Investor Update",
    category: "Ivory Finance",
    theme: "light",
    background: "#fff8ef",
    mutedBackground: "#efe5d7",
    surfaceBackground: "#ffffff",
    accent: "#7a4f24",
    description: "A crisp investor update deck for performance, market signals, risk, capital priorities, and operating asks.",
    useCase: "Board meetings, investor updates, founder reporting",
    hero: "Investor Update",
    subtitle: "A concise operating narrative for explaining momentum, constraints, capital allocation, and the decisions that matter next.",
    metrics: [
      { label: "ARR growth", value: "+42%", caption: "Trailing growth from stronger enterprise conversion and expansion." },
      { label: "Gross margin", value: "78%", caption: "Healthy margin profile after cloud optimization and packaging changes." },
      { label: "Runway", value: "24mo", caption: "Operating runway at the current investment pace." }
    ],
    thesis: [
      { icon: "TrendingUp", title: "Momentum is compounding", text: "The strongest growth is coming from fewer, larger accounts with clearer expansion paths." },
      { icon: "Database", title: "Operating data is cleaner", text: "Reporting now connects pipeline, retention, product activation, and cash priorities." }
    ],
    chart: { title: "Quarterly operating index", labels: "Q1,Q2,Q3,Q4", values: "34,51,66,82" },
    evidence: [
      { icon: "UserCheck", title: "Enterprise signal", text: "Expansion discussions increasingly include finance, security, and operating leaders." },
      { icon: "ShieldCheck", title: "Execution confidence", text: "The team has narrowed the roadmap to fewer initiatives with clearer economic value." }
    ],
    strategy: [
      { icon: "BriefcaseBusiness", title: "Fund the core", text: "Protect the GTM and product bets tied directly to enterprise expansion." },
      { icon: "SlidersHorizontal", title: "Tune burn", text: "Shift spend from broad experiments into measured acquisition and retention motions." },
      { icon: "Presentation", title: "Clarify asks", text: "Use every board cycle to decide one resource tradeoff and one growth unlock." }
    ],
    image: {
      src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200",
      alt: "Financial model and operating review"
    },
    proofText: "Use this frame for financial context, market evidence, customer logos, or the board discussion that needs visual grounding.",
    economics: [
      { label: "Net retention", value: "119%", caption: "Expansion remains the clearest lever for efficient growth." },
      { label: "CAC payback", value: "11mo", caption: "Improved sales focus and onboarding speed reduced acquisition drag." }
    ],
    risks: [
      { icon: "CircleAlert", title: "Concentration", text: "A small number of strategic accounts now influences quarterly performance." },
      { icon: "Lock", title: "Governance", text: "Decision rights should stay explicit as the team increases investment pace." }
    ],
    plan: [
      { title: "01 Report", text: "Lock one operating scorecard across finance, product, and GTM." },
      { title: "02 Decide", text: "Approve the next two capital allocation priorities." },
      { title: "03 Track", text: "Tie next board update to measurable adoption, margin, and retention movement." }
    ]
  }),
  createBusinessTemplate({
    id: "product-launch-board",
    name: "Product Launch Board",
    category: "Graphite Green",
    theme: "dark",
    background: "#07120f",
    mutedBackground: "#0e1c17",
    surfaceBackground: "#06100d",
    accent: "#7dd3a8",
    description: "A premium launch strategy deck for positioning, audience clarity, adoption signals, GTM readiness, and launch governance.",
    useCase: "Product launches, GTM readiness, executive launch reviews",
    hero: "Product Launch Board",
    subtitle: "A launch narrative that connects product value, market timing, GTM readiness, and the evidence needed to move with confidence.",
    metrics: [
      { label: "Launch readiness", value: "86%", caption: "Cross-functional confidence across product, sales, success, and support." },
      { label: "Beta adoption", value: "41%", caption: "Target users activating the core workflow within seven days." },
      { label: "Influenced ARR", value: "$3.2M", caption: "Pipeline and expansion opportunities tied to the launch message." }
    ],
    thesis: [
      { icon: "Rocket", title: "The window is open", text: "Customer urgency is visible, but the message needs to be sharper than the feature list." },
      { icon: "Palette", title: "Position around outcomes", text: "The launch should frame a new operating advantage, not just a product release." }
    ],
    chart: { title: "Launch readiness by motion", labels: "Product,Sales,Success,Support", values: "88,76,82,69" },
    evidence: [
      { icon: "MessageSquare", title: "Customer pull", text: "Beta users describe the feature as a workflow unlock rather than a cosmetic improvement." },
      { icon: "Award", title: "Differentiation", text: "The strongest proof comes from speed, confidence, and fewer handoffs." }
    ],
    strategy: [
      { icon: "Target", title: "Name the audience", text: "Concentrate launch energy on users with acute workflow pressure." },
      { icon: "Megaphone", title: "Shape the message", text: "Lead with the before-and-after business outcome." },
      { icon: "Layers", title: "Enable the field", text: "Package demos, proof points, objections, and rollout assets into one system." }
    ],
    image: {
      src: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200",
      alt: "Product team planning a launch"
    },
    proofText: "Use this frame for product screenshots, beta evidence, launch creative, or a focused readiness discussion.",
    economics: [
      { label: "Activation lift", value: "+29%", caption: "Expected improvement from clearer onboarding and use-case-led messaging." },
      { label: "Enablement reuse", value: "6.4x", caption: "Reusable launch materials across sales, success, partner, and executive channels." }
    ],
    risks: [
      { icon: "CircleAlert", title: "Message drift", text: "Too many launch claims can dilute the business outcome." },
      { icon: "Settings", title: "Operational load", text: "Support and success paths need to be ready before broad demand generation." }
    ],
    plan: [
      { title: "01 Validate", text: "Confirm the winning message with five priority customers." },
      { title: "02 Enable", text: "Package demo flow, objection handling, and customer proof." },
      { title: "03 Launch", text: "Release in focused waves with clear adoption and pipeline targets." }
    ]
  }),
  createBusinessTemplate({
    id: "customer-success-qbr",
    name: "Customer Success QBR",
    category: "Mist QBR",
    theme: "light",
    background: "#f6faf8",
    mutedBackground: "#e5ece8",
    surfaceBackground: "#fbfcfa",
    accent: "#145c49",
    description: "A refined QBR deck for customer outcomes, adoption evidence, value realization, renewal health, and next-quarter priorities.",
    useCase: "QBRs, renewal conversations, customer executive reviews",
    hero: "Customer Success QBR",
    subtitle: "A customer-facing executive review that turns usage, value, risk, and next steps into a clear renewal narrative.",
    metrics: [
      { label: "Adoption", value: "74%", caption: "Priority team members active in the core workflow this quarter." },
      { label: "Value realized", value: "$1.1M", caption: "Modeled operating impact from automation, reuse, and avoided rework." },
      { label: "Renewal health", value: "Green", caption: "Sponsor alignment and usage depth support a confident renewal path." }
    ],
    thesis: [
      { icon: "UserCheck", title: "Outcome story is visible", text: "The account is moving from tool usage to measurable operating behavior." },
      { icon: "LineChart", title: "Expansion path is specific", text: "The next opportunity is tied to adjacent teams with similar workflow pressure." }
    ],
    chart: { title: "Adoption by team", labels: "Ops,Sales,CS,Finance", values: "84,72,61,48" },
    evidence: [
      { icon: "BadgeCheck", title: "Proof of value", text: "Users report faster review cycles, less manual coordination, and clearer handoffs." },
      { icon: "MessageSquare", title: "Sponsor narrative", text: "Leadership wants a cleaner rollout story before expanding into new teams." }
    ],
    strategy: [
      { icon: "Search", title: "Inspect usage", text: "Identify the behaviors tied to retention and expansion confidence." },
      { icon: "Layers", title: "Codify playbook", text: "Turn successful team habits into onboarding assets for adjacent groups." },
      { icon: "ArrowUpRight", title: "Open expansion", text: "Connect new team adoption to a quantified operating outcome." }
    ],
    image: {
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200",
      alt: "Customer team in a planning session"
    },
    proofText: "Use this page for usage screenshots, executive quotes, workflow evidence, or the renewal conversation that needs context.",
    economics: [
      { label: "Hours returned", value: "320h", caption: "Quarterly productivity released through repeatable workflows." },
      { label: "Expansion signal", value: "3 teams", caption: "Adjacent teams have requested a scoped rollout review." }
    ],
    risks: [
      { icon: "CircleAlert", title: "Single sponsor", text: "Broaden executive support before renewal negotiation." },
      { icon: "Clock", title: "Adoption plateau", text: "The next quarter needs guided use cases to prevent usage flattening." }
    ],
    plan: [
      { title: "01 Prove", text: "Align on the measurable value already realized." },
      { title: "02 Expand", text: "Prioritize two adjacent teams with clear workflow pressure." },
      { title: "03 Renew", text: "Convert value evidence into a confident commercial path." }
    ]
  }),
  createBusinessTemplate({
    id: "saas-operating-review",
    name: "SaaS Operating Review",
    category: "Electric Slate",
    theme: "dark",
    background: "#081018",
    mutedBackground: "#0e1a24",
    surfaceBackground: "#050b11",
    accent: "#7dd3fc",
    description: "A sophisticated operating review deck for SaaS performance, retention, product adoption, GTM execution, and risk controls.",
    useCase: "Monthly business reviews, SaaS leadership, operating planning",
    hero: "SaaS Operating Review",
    subtitle: "A leadership cadence for translating growth, retention, adoption, and burn into one operating view.",
    metrics: [
      { label: "NRR", value: "116%", caption: "Expansion remains durable across enterprise and strategic customers." },
      { label: "Logo growth", value: "+27%", caption: "New customer acquisition is improving after sharper segment focus." },
      { label: "Burn multiple", value: "1.4x", caption: "Efficiency is improving as growth concentrates in higher-fit motions." }
    ],
    thesis: [
      { icon: "ChartNoAxesCombined", title: "Growth quality matters", text: "The operating model now needs to balance acquisition, retention, and cash discipline." },
      { icon: "SlidersHorizontal", title: "The system is tunable", text: "Each function has a clear lever tied to one growth or efficiency outcome." }
    ],
    chart: { title: "Operating health index", labels: "Growth,Retention,Product,Cash", values: "76,83,69,72" },
    evidence: [
      { icon: "Database", title: "Product usage", text: "Activation is strongest when onboarding is tied to a named operating workflow." },
      { icon: "BriefcaseBusiness", title: "Commercial focus", text: "Best-fit segments are showing faster conversion and better renewal quality." }
    ],
    strategy: [
      { icon: "Target", title: "Concentrate demand", text: "Put spend behind the segments with clear retention and expansion signals." },
      { icon: "MousePointer2", title: "Lift activation", text: "Reduce early friction with simpler setup, guidance, and proof." },
      { icon: "ShieldCheck", title: "Protect margin", text: "Use infrastructure and support signals to contain operational drag." }
    ],
    image: {
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
      alt: "SaaS analytics dashboard"
    },
    proofText: "Use this frame for dashboard evidence, cohort analysis, customer context, or one operating discussion.",
    economics: [
      { label: "Expansion ARR", value: "$5.4M", caption: "Prioritized account opportunities within the current customer base." },
      { label: "Support deflection", value: "-31%", caption: "Expected load reduction from guided onboarding and clearer product flows." }
    ],
    risks: [
      { icon: "CircleAlert", title: "Cohort noise", text: "Average metrics can hide divergent behavior in new and legacy cohorts." },
      { icon: "Lock", title: "Data trust", text: "Operating decisions depend on consistent definitions across teams." }
    ],
    plan: [
      { title: "01 Align", text: "Lock the operating scorecard and owners." },
      { title: "02 Improve", text: "Target activation, expansion, and support friction together." },
      { title: "03 Review", text: "Run the cadence monthly with one decision per function." }
    ]
  }),
  createBusinessTemplate({
    id: "market-entry-strategy",
    name: "Market Entry Strategy",
    category: "Consulting Blue",
    theme: "light",
    background: "#f7fbff",
    mutedBackground: "#e4edf8",
    surfaceBackground: "#ffffff",
    accent: "#183b68",
    description: "A consulting-style market entry deck for opportunity sizing, segment selection, risk, launch sequencing, and executive approval.",
    useCase: "Market entry, category expansion, strategic planning",
    hero: "Market Entry Strategy",
    subtitle: "A decision-ready strategy for choosing the right segment, validating demand, and sequencing market entry with discipline.",
    metrics: [
      { label: "Addressable pool", value: "$420M", caption: "Near-term serviceable opportunity across the first two priority segments." },
      { label: "Entry confidence", value: "78%", caption: "Weighted confidence from demand, access, differentiation, and operating fit." },
      { label: "Payback window", value: "14mo", caption: "Modeled recovery period under the focused entry scenario." }
    ],
    thesis: [
      { icon: "Globe", title: "The market is selective", text: "Entry should start where urgency, access, and differentiation overlap." },
      { icon: "MapPin", title: "Sequencing reduces risk", text: "A narrower first market creates learning before committing broad resources." }
    ],
    chart: { title: "Segment attractiveness", labels: "Demand,Access,Margin,Fit", values: "82,66,74,79" },
    evidence: [
      { icon: "Search", title: "Demand signal", text: "Early interviews show a clear pain cluster in compliance-heavy operators." },
      { icon: "PieChart", title: "Competitive space", text: "Incumbents are strong on scale but weaker on implementation speed." }
    ],
    strategy: [
      { icon: "Target", title: "Pick the beachhead", text: "Choose one segment with measurable urgency and reachable buyers." },
      { icon: "Megaphone", title: "Localize the offer", text: "Adapt proof, pricing, and onboarding to the first market context." },
      { icon: "Calendar", title: "Stage investment", text: "Release resources as validation milestones are met." }
    ],
    image: {
      src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
      alt: "Modern business district"
    },
    proofText: "Use this page for market maps, customer interviews, competitor evidence, or launch geography context.",
    economics: [
      { label: "Pilot revenue", value: "$1.8M", caption: "Modeled first-year revenue from the initial entry cohort." },
      { label: "Channel leverage", value: "2.3x", caption: "Expected reach multiplier from two validated partner routes." }
    ],
    risks: [
      { icon: "CircleAlert", title: "Access risk", text: "The wrong channel path can slow learning and inflate acquisition cost." },
      { icon: "ShieldCheck", title: "Control gate", text: "Expansion should wait until demand, margin, and delivery quality are proven." }
    ],
    plan: [
      { title: "01 Validate", text: "Complete ten buyer interviews and two partner tests." },
      { title: "02 Pilot", text: "Launch a focused offer into the strongest beachhead segment." },
      { title: "03 Scale", text: "Expand only after unit economics and delivery quality are stable." }
    ]
  }),
  createBusinessTemplate({
    id: "brand-partnership-pitch",
    name: "Brand Partnership Pitch",
    category: "Luxury Plum",
    theme: "dark",
    background: "#120815",
    mutedBackground: "#1c1021",
    surfaceBackground: "#0c060f",
    accent: "#f0a6ca",
    description: "A sleek partnership pitch deck for audience fit, campaign value, co-marketing proof, economics, and next steps.",
    useCase: "Strategic partnerships, co-marketing, brand alliances",
    hero: "Brand Partnership Pitch",
    subtitle: "A partnership story that connects audience overlap, campaign mechanics, shared proof, and a clean commercial ask.",
    metrics: [
      { label: "Audience overlap", value: "64%", caption: "Shared high-intent audience across the priority customer profile." },
      { label: "Reach potential", value: "2.1M", caption: "Projected qualified impressions across owned and partner channels." },
      { label: "Pipeline lift", value: "$2.7M", caption: "Modeled sourced and influenced pipeline from the launch campaign." }
    ],
    thesis: [
      { icon: "Heart", title: "The fit is natural", text: "Both brands serve the same operating moment from different angles." },
      { icon: "Megaphone", title: "The story is bigger together", text: "A shared campaign can make the category problem more visible and urgent." }
    ],
    chart: { title: "Campaign contribution mix", labels: "Owned,Partner,Events,PR", values: "52,71,44,38" },
    evidence: [
      { icon: "Users", title: "Audience signal", text: "Engagement data points to a common buyer with shared budget pressure." },
      { icon: "Star", title: "Creative territory", text: "The strongest concept positions both brands as a practical operating advantage." }
    ],
    strategy: [
      { icon: "Palette", title: "Define the creative", text: "Shape one campaign idea with clear editorial and product roles." },
      { icon: "Link", title: "Connect the funnel", text: "Route interest into a shared journey with clear ownership." },
      { icon: "Trophy", title: "Measure shared value", text: "Track attention, leads, pipeline, and relationship depth." }
    ],
    image: {
      src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200",
      alt: "Partnership workshop"
    },
    proofText: "Use this slide for campaign mockups, audience evidence, partner logos, or creative direction.",
    economics: [
      { label: "Lead efficiency", value: "+36%", caption: "Expected improvement from shared audience trust and better creative context." },
      { label: "Content reuse", value: "9 assets", caption: "Campaign system repurposed across events, web, sales, and social." }
    ],
    risks: [
      { icon: "CircleAlert", title: "Brand dilution", text: "Shared creative must preserve a clear role for each partner." },
      { icon: "Settings", title: "Handoff clarity", text: "Lead ownership and follow-up expectations need to be explicit before launch." }
    ],
    plan: [
      { title: "01 Align", text: "Confirm audience, message, campaign promise, and success measures." },
      { title: "02 Build", text: "Produce the campaign system and sales enablement assets." },
      { title: "03 Launch", text: "Run the first campaign wave with weekly performance review." }
    ]
  }),
  createBusinessTemplate({
    id: "ai-transformation-roadmap",
    name: "AI Transformation Roadmap",
    category: "Signal White",
    theme: "light",
    background: "#f8faff",
    mutedBackground: "#e8edf7",
    surfaceBackground: "#ffffff",
    accent: "#3157ff",
    description: "An executive AI roadmap deck for opportunity selection, risk controls, operating model, pilots, and investment approval.",
    useCase: "AI strategy, transformation planning, executive workshops",
    hero: "AI Transformation Roadmap",
    subtitle: "A pragmatic executive roadmap for selecting AI opportunities, governing risk, and turning pilots into operating capability.",
    metrics: [
      { label: "Automation pool", value: "18%", caption: "Share of high-friction workflows ready for near-term augmentation." },
      { label: "Pilot ROI", value: "3.1x", caption: "Modeled return from the first three prioritized workflow pilots." },
      { label: "Risk readiness", value: "72%", caption: "Governance maturity across data, security, review, and accountability." }
    ],
    thesis: [
      { icon: "Sparkles", title: "AI must start with workflow", text: "The highest-value use cases are anchored in repeated decisions and information handoffs." },
      { icon: "ShieldCheck", title: "Governance is an accelerant", text: "Clear controls make teams more confident to adopt, test, and scale." }
    ],
    chart: { title: "AI opportunity score", labels: "Impact,Feasibility,Risk,Adoption", values: "86,72,58,69" },
    evidence: [
      { icon: "Database", title: "Data foundation", text: "The first pilots can use bounded datasets and human review without broad platform change." },
      { icon: "Users", title: "Team readiness", text: "Operators want AI assistance where it reduces review burden and improves consistency." }
    ],
    strategy: [
      { icon: "ScanSearch", title: "Find workflow friction", text: "Map repeated decisions, handoffs, and quality checks before choosing tools." },
      { icon: "KeyRound", title: "Set guardrails", text: "Define data boundaries, review requirements, and escalation paths." },
      { icon: "Rocket", title: "Scale what works", text: "Move from pilots to shared capabilities only after adoption and quality are proven." }
    ],
    image: {
      src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
      alt: "Technology hardware detail"
    },
    proofText: "Use this frame for workflow maps, AI pilot evidence, risk controls, or executive workshop context.",
    economics: [
      { label: "Hours unlocked", value: "1.2k", caption: "Quarterly operating hours addressable through the first pilot wave." },
      { label: "Quality lift", value: "+24%", caption: "Expected improvement in consistency from guided review and standard outputs." }
    ],
    risks: [
      { icon: "Lock", title: "Data exposure", text: "Pilots must keep sensitive data inside approved boundaries." },
      { icon: "CircleAlert", title: "Adoption drag", text: "Teams need workflow-specific enablement, not generic AI training." }
    ],
    plan: [
      { title: "01 Select", text: "Rank workflows by impact, feasibility, risk, and adoption readiness." },
      { title: "02 Pilot", text: "Run three bounded pilots with human review and measured outcomes." },
      { title: "03 Govern", text: "Scale through approved patterns, reusable prompts, and operating controls." }
    ]
  })
];

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
  <Title enter="fadeUp">Growth Investment Memo</Title>
  <Text enter="fadeUp" delay={0.2}>A boardroom-ready narrative for framing the decision, sizing the opportunity, and aligning the next operating move.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#080808" accent="#ffffff" cardFlow="stack" metricFlow="grid">
  <Title enter="slideLeft">Decision summary</Title>
  <Metric label="Value pool" value="$2.4M" caption="Near-term qualified upside across priority accounts and expansion motions." enter="fadeUp" delay={0.1} />
  <Metric label="Win-rate lift" value="+31%" caption="Modeled improvement from sharper proof, packaging, and buyer-specific messaging." enter="fadeUp" delay={0.2} />
  <Metric label="Sales cycle" value="-18%" caption="Expected reduction in time-to-decision from clearer stakeholder alignment." enter="fadeUp" delay={0.3} />
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff" cardFlow="grid">
  <Title enter="fadeUp">Market inflection</Title>
  <Card icon="TrendingUp" layout="horizontal" width="md" title="Demand is concentrating" text="Growth is shifting toward fewer accounts with clearer budgets, stronger urgency, and higher proof requirements." enter="fadeUp" delay={0.1} />
  <Card icon="CircleAlert" layout="horizontal" width="md" title="Generic decks are underperforming" text="Buyers expect board-level clarity: financial impact, implementation confidence, and risk controls in one story." enter="fadeUp" delay={0.2} />
</Slide>

<Slide duration={5} theme="dark" background="#0d0d0d" accent="#f5f5f5">
  <Title enter="slideLeft">Revenue momentum</Title>
  <Chart title="Qualified pipeline index" labels="Q1,Q2,Q3,Q4" values="38,52,71,94" width="lg" height={156} enter="fadeUp" delay={0.2} />
</Slide>

<Slide duration={5} theme="dark" background="#030303" accent="#ffffff" cardFlow="grid">
  <Title enter="fadeUp">Buyer evidence</Title>
  <Card icon="MessageSquare" layout="horizontal" width="lg" title="The repeated question" text="Can the team make the business case specific enough without slowing the sales motion?" enter="fadeUp" delay={0.1} />
  <Card icon="BadgeCheck" layout="horizontal" width="lg" title="The trust trigger" text="A focused deck that pairs commercial outcomes, data, implementation path, and portable export." enter="fadeUp" delay={0.25} />
</Slide>

<Slide duration={5} theme="dark" background="#111111" accent="#ffffff" cardFlow="grid">
  <Title enter="slideLeft">Strategic response</Title>
  <Card icon="Target" title="Sharpen the offer" text="Turn the commercial message into a clear decision case with a specific audience and ask." enter="fadeUp" delay={0.1} />
  <Card icon="Layers" title="Build the proof stack" text="Combine metrics, charts, buyer evidence, operating plan, and risk controls." enter="fadeUp" delay={0.2} />
  <Card icon="Download" title="Make it portable" text="Export MDX and interactive HTML so the work can travel across review and local workflows." enter="fadeUp" delay={0.3} />
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff">
  <ImageBlock fit="cover" src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200" alt="Commercial team reviewing data" enter="fadeIn" delay={0.1} />
  <Text enter="fadeUp" delay={0.25}>Use this frame for product evidence, account context, customer proof, or a leadership working session.</Text>
</Slide>

<Slide duration={5} theme="dark" background="#080808" accent="#f5f5f5" cardFlow="stack" metricFlow="grid">
  <Title enter="fadeUp">Financial impact</Title>
  <Metric label="Productivity release" value="420h" caption="Quarterly effort returned from presentation production, revision, and handoff work." enter="zoomIn" delay={0.1} />
  <Metric label="Cycle velocity" value="2.8x" caption="Faster iteration from editable source, reusable templates, and direct export." enter="zoomIn" delay={0.2} />
</Slide>

<Slide duration={5} theme="dark" background="#0f0f0f" accent="#ffffff">
  <Title enter="slideLeft">Operating adoption</Title>
  <Chart title="Readiness by function" labels="Sales,Success,Product,Ops" values="82,64,48,39" width="lg" height={156} enter="fadeUp" delay={0.2} />
</Slide>

<Slide duration={5} theme="dark" background="#050505" accent="#ffffff" cardFlow="grid">
  <Title enter="fadeUp">Risks and controls</Title>
  <Card icon="Lock" layout="horizontal" width="md" title="Confidentiality" text="Sensitive customer and strategy work can stay in the installed local Studio." enter="fadeUp" delay={0.1} />
  <Card icon="Settings" layout="horizontal" width="md" title="Governance" text="Teams start from approved commercial templates before customizing account-level slides." enter="fadeUp" delay={0.25} />
</Slide>

<Slide duration={5} theme="dark" background="#101010" accent="#ffffff" cardFlow="grid">
  <Title enter="slideLeft">90-day execution plan</Title>
  <Card title="01 Pilot" text="Build one enterprise account deck and one executive operating review." enter="fadeUp" delay={0.1} />
  <Card title="02 Prove" text="Measure edit time, message quality, stakeholder response, and export reliability." enter="fadeUp" delay={0.2} />
  <Card title="03 Scale" text="Turn the winning narrative into governed templates and repeatable local workflows." enter="fadeUp" delay={0.3} />
</Slide>

<Slide duration={5} theme="dark" background="#030303" accent="#ffffff" alignX="center" alignY="center" textAlign="center">
  <Title enter="zoomIn">Decision requested</Title>
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
  <Title enter="fadeUp">Executive Growth Proposal</Title>
  <Text enter="fadeUp" delay={0.2}>A client-ready narrative for aligning the opportunity, proving the business case, and moving leadership toward a clear decision.</Text>
</Slide>

<Slide duration={5} theme="light" background="#f7f7f7" accent="#111111" cardFlow="stack" metricFlow="grid">
  <Title enter="slideLeft">Executive snapshot</Title>
  <Metric label="Revenue upside" value="$4.8M" caption="Modeled impact from the priority motions proposed in this deck." enter="fadeUp" delay={0.1} />
  <Metric label="Retention base" value="94%" caption="Protected revenue from onboarding quality, stakeholder fit, and renewal visibility." enter="fadeUp" delay={0.2} />
  <Metric label="Expansion rate" value="1.7x" caption="Target account growth from packaged proof and sharper commercial sequencing." enter="fadeUp" delay={0.3} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111" cardFlow="grid">
  <Title enter="fadeUp">Commercial thesis</Title>
  <Card icon="Lightbulb" layout="horizontal" width="lg" title="Make the decision simple" text="Senior buyers respond when the story compresses complexity into a clear business case, operating path, and measurable ask." enter="fadeUp" delay={0.1} />
  <Card icon="UserCheck" layout="horizontal" width="lg" title="Make the proof specific" text="The strongest proposal connects market timing, account pain, data, implementation confidence, and team-level outcomes." enter="fadeUp" delay={0.25} />
</Slide>

<Slide duration={5} theme="light" background="#f4f4f4" accent="#111111">
  <Title enter="slideLeft">Where momentum is building</Title>
  <Chart title="Opportunity growth by segment" labels="SMB,Mid,Enterprise,Strategic" values="28,46,73,88" width="lg" height={156} enter="fadeUp" delay={0.2} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111" cardFlow="grid">
  <Title enter="fadeUp">Customer signal</Title>
  <Card icon="MessageSquare" layout="horizontal" width="lg" title="The repeated objection" text="The team believes in the direction, but needs sharper evidence before committing time, budget, and executive attention." enter="fadeUp" delay={0.1} />
  <Card icon="CheckCircle" layout="horizontal" width="lg" title="The conversion moment" text="A concise proposal that frames the financial prize, delivery model, proof points, and next step in one portable deck." enter="fadeUp" delay={0.25} />
</Slide>

<Slide duration={5} theme="light" background="#f8f8f8" accent="#111111" cardFlow="grid">
  <Title enter="slideLeft">Proposal architecture</Title>
  <Card icon="Palette" title="Executive design" text="A restrained white system for proposals, business reviews, and client-facing strategy work." enter="fadeUp" delay={0.1} />
  <Card icon="BarChart3" title="Evidence layer" text="Metrics and charts create a business argument without forcing the audience to decode raw detail." enter="fadeUp" delay={0.2} />
  <Card icon="Code2" title="Editable source" text="MDX keeps the deck readable, flexible, and ready for local workflows after installation." enter="fadeUp" delay={0.3} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <ImageBlock fit="cover" src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1200" alt="Clean architectural detail" enter="fadeIn" delay={0.1} />
  <Text enter="fadeUp" delay={0.25}>Use this page for product evidence, market imagery, customer context, or a quiet visual pause between data-heavy sections.</Text>
</Slide>

<Slide duration={5} theme="light" background="#f6f6f6" accent="#111111" cardFlow="stack" metricFlow="grid">
  <Title enter="fadeUp">Operating leverage</Title>
  <Metric label="Production time" value="-62%" caption="Less time spent formatting, restructuring, and rebuilding presentation logic." enter="zoomIn" delay={0.1} />
  <Metric label="Template reuse" value="8.5x" caption="More repeated use from a small approved slide system built for commercial teams." enter="zoomIn" delay={0.2} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111">
  <Title enter="slideLeft">Readiness by function</Title>
  <Chart title="Implementation readiness" labels="Sales,Marketing,Success,Ops" values="76,59,68,44" width="lg" height={156} enter="fadeUp" delay={0.2} />
</Slide>

<Slide duration={5} theme="light" background="#f8f8f8" accent="#111111" cardFlow="grid">
  <Title enter="fadeUp">Implementation guardrails</Title>
  <Card icon="Lock" layout="horizontal" width="md" title="Private work stays local" text="Installed Studio unlocks local-only editing for confidential customer and strategy work." enter="fadeUp" delay={0.1} />
  <Card icon="FileText" layout="horizontal" width="md" title="Outputs stay portable" text="MDX and interactive HTML exports keep the proposal reviewable without locking it into one tool." enter="fadeUp" delay={0.25} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111" cardFlow="grid">
  <Title enter="slideLeft">Next 30 days</Title>
  <Card title="01 Align" text="Confirm the audience, decision owner, commercial question, and success metric." enter="fadeUp" delay={0.1} />
  <Card title="02 Build" text="Replace the template content with customer-specific proof, financial logic, and delivery detail." enter="fadeUp" delay={0.2} />
  <Card title="03 Review" text="Export MDX and interactive HTML for stakeholder review, then tighten the final executive ask." enter="fadeUp" delay={0.3} />
</Slide>

<Slide duration={5} theme="light" background="#ffffff" accent="#111111" alignX="center" alignY="center" textAlign="center">
  <Title enter="zoomIn">Approve the pilot</Title>
  <Text enter="fadeUp" delay={0.2}>Move forward with one executive-ready proposal workflow, validate the impact, then scale the black and white template system.</Text>
</Slide>`
  },
  ...premiumBusinessTemplates
];

function createBusinessTemplate(config: BusinessTemplateConfig): MotionTemplate {
  const theme = config.theme;
  const mutedBackground = config.mutedBackground;
  const deepBackground = config.surfaceBackground;

  return {
    id: config.id,
    name: config.name,
    category: config.category,
    duration: "60s",
    description: config.description,
    useCase: config.useCase,
    source: `# ${escapeText(config.name)}

${slide(theme, config.background, config.accent, [
  title(config.hero, { w: 68, x: 8, y: 14 }),
  text(config.subtitle, { w: 56, x: 8, y: 45 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Executive snapshot", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  metric(config.metrics[0], { x: 8, y: 35 }),
  metric(config.metrics[1], { x: 37, y: 35 }),
  metric(config.metrics[2], { x: 66, y: 35 })
])}

${slide(theme, deepBackground, config.accent, [
  title("Strategic thesis", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  card(config.thesis[0], { h: 25, w: 40, x: 8, y: 36 }),
  card(config.thesis[1], { h: 25, w: 40, x: 52, y: 36 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Momentum signal", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  chart(config.chart, { h: 42, w: 78, x: 10, y: 34 })
])}

${slide(theme, deepBackground, config.accent, [
  title("Customer evidence", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  card(config.evidence[0], { h: 25, w: 40, x: 8, y: 36 }),
  card(config.evidence[1], { h: 25, w: 40, x: 52, y: 36 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Strategic response", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  card(config.strategy[0], { h: 29, w: 27, x: 8, y: 36 }),
  card(config.strategy[1], { h: 29, w: 27, x: 37, y: 36 }),
  card(config.strategy[2], { h: 29, w: 27, x: 66, y: 36 })
])}

${slide(theme, deepBackground, config.accent, [
  image(config.image, { h: 40, w: 38, x: 9, y: 28 }),
  text(config.proofText, { fontSize: 24, h: 28, w: 36, x: 52, y: 31 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Economic impact", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  metric(config.economics[0], { h: 30, w: 38, x: 8, y: 38 }),
  metric(config.economics[1], { h: 30, w: 38, x: 52, y: 38 })
])}

${slide(theme, deepBackground, config.accent, [
  title("Operating readiness", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  chart({ ...config.chart, title: "Readiness by function" }, { h: 42, w: 76, x: 10, y: 34 })
])}

${slide(theme, mutedBackground, config.accent, [
  title("Risks and controls", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  card(config.risks[0], { h: 25, w: 40, x: 8, y: 36 }),
  card(config.risks[1], { h: 25, w: 40, x: 52, y: 36 })
])}

${slide(theme, deepBackground, config.accent, [
  title("Execution plan", { fontSize: 58, h: 14, w: 62, x: 8, y: 9 }),
  card({ icon: "Calendar", ...config.plan[0] }, { h: 29, w: 27, x: 8, y: 36 }),
  card({ icon: "Settings", ...config.plan[1] }, { h: 29, w: 27, x: 37, y: 36 }),
  card({ icon: "ArrowUpRight", ...config.plan[2] }, { h: 29, w: 27, x: 66, y: 36 })
])}

${slide(theme, config.background, config.accent, [
  title("Decision requested", { enter: "zoomIn", fontSize: 66, h: 16, w: 68, x: 16, y: 28 }),
  text("Approve the focused plan, validate the operating impact, and scale the system through the next executive review cycle.", { h: 16, w: 54, x: 23, y: 52 })
])}`
  };
}

function slide(theme: string, background: string, accent: string, blocks: string[]) {
  return `<Slide duration={5} theme="${theme}" background="${background}" accent="${accent}">
${blocks.map((block) => `  ${block}`).join("\n")}
</Slide>`;
}

function title(value: string, frame: Partial<Frame> = {}) {
  const next = { fontSize: 72, h: 18, w: 64, x: 8, y: 12, ...frame };
  return `<Title enter="${frame.enter ?? "fadeUp"}" fontSize={${next.fontSize}} radius={0} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}}>${escapeText(value)}</Title>`;
}

function text(value: string, frame: Partial<Frame> = {}) {
  const next = { fontSize: 24, h: 16, w: 52, x: 8, y: 38, ...frame };
  return `<Text enter="${frame.enter ?? "fadeUp"}" delay={0.2} fontSize={${next.fontSize}} radius={0} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}}>${escapeText(value)}</Text>`;
}

function card(item: { icon?: string; text: string; title: string }, frame: Frame) {
  return `<Card icon="${item.icon ?? "Sparkles"}" layout="horizontal" width="full" title="${attr(item.title)}" text="${attr(item.text)}" enter="fadeUp" delay={0.16} radius={16} x={${frame.x}} y={${frame.y}} w={${frame.w}} h={${frame.h}} />`;
}

function metric(item: { caption: string; label: string; value: string }, frame: Partial<Frame> = {}) {
  const next = { h: 32, w: 26, x: 8, y: 38, ...frame };
  return `<Metric label="${attr(item.label)}" value="${attr(item.value)}" caption="${attr(item.caption)}" width="full" enter="fadeUp" delay={0.16} radius={16} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}} />`;
}

function chart(item: { labels: string; title: string; values: string }, frame: Partial<Frame> = {}) {
  const next = { h: 42, w: 76, x: 10, y: 34, ...frame };
  return `<Chart title="${attr(item.title)}" labels="${attr(item.labels)}" values="${attr(item.values)}" width="full" height={144} enter="fadeUp" delay={0.18} radius={16} x={${next.x}} y={${next.y}} w={${next.w}} h={${next.h}} />`;
}

function image(item: { alt: string; src: string }, frame: Frame) {
  return `<ImageBlock fit="cover" src="${attr(item.src)}" alt="${attr(item.alt)}" enter="fadeIn" delay={0.1} radius={16} x={${frame.x}} y={${frame.y}} w={${frame.w}} h={${frame.h}} />`;
}

type Frame = {
  enter?: "fadeUp" | "zoomIn";
  fontSize?: number;
  h: number;
  w: number;
  x: number;
  y: number;
};

function attr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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

export const defaultTemplate = motionTemplates[0];
