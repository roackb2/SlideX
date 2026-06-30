import { createBusinessTemplate } from "@/core/motion-doc/presets/templates/templateFactory";
import type { MotionTemplate } from "@/core/motion-doc/presets/templates/templateTypes";

export const premiumBusinessTemplates: MotionTemplate[] = [
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
      src: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=85&w=2400",
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
      src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=85&w=2400",
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
      src: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=85&w=2400",
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
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=85&w=2400",
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
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=85&w=2400",
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
      src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=85&w=2400",
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
      src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=85&w=2400",
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
    id: "digital-transformation-roadmap",
    name: "Digital Transformation Roadmap",
    category: "Signal White",
    theme: "light",
    background: "#f8faff",
    mutedBackground: "#e8edf7",
    surfaceBackground: "#ffffff",
    accent: "#3157ff",
    description: "An executive transformation roadmap deck for opportunity selection, risk controls, operating model, pilots, and investment approval.",
    useCase: "Transformation strategy, operating model, executive workshops",
    hero: "Digital Transformation Roadmap",
    subtitle: "A pragmatic executive roadmap for selecting automation opportunities, governing risk, and turning pilots into operating capability.",
    metrics: [
      { label: "Automation pool", value: "18%", caption: "Share of high-friction workflows ready for near-term augmentation." },
      { label: "Pilot ROI", value: "3.1x", caption: "Modeled return from the first three prioritized workflow pilots." },
      { label: "Risk readiness", value: "72%", caption: "Governance maturity across data, security, review, and accountability." }
    ],
    thesis: [
      { icon: "Sparkles", title: "Transformation starts with workflow", text: "The highest-value use cases are anchored in repeated decisions and information handoffs." },
      { icon: "ShieldCheck", title: "Governance is an accelerant", text: "Clear controls make teams more confident to adopt, test, and scale." }
    ],
    chart: { title: "Opportunity score", labels: "Impact,Feasibility,Risk,Adoption", values: "86,72,58,69" },
    evidence: [
      { icon: "Database", title: "Data foundation", text: "The first pilots can use bounded datasets and human review without broad platform change." },
      { icon: "Users", title: "Team readiness", text: "Operators want guided assistance where it reduces review burden and improves consistency." }
    ],
    strategy: [
      { icon: "ScanSearch", title: "Find workflow friction", text: "Map repeated decisions, handoffs, and quality checks before choosing tools." },
      { icon: "KeyRound", title: "Set guardrails", text: "Define data boundaries, review requirements, and escalation paths." },
      { icon: "Rocket", title: "Scale what works", text: "Move from pilots to shared capabilities only after adoption and quality are proven." }
    ],
    image: {
      src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=85&w=2400",
      alt: "Technology hardware detail"
    },
    proofText: "Use this frame for workflow maps, pilot evidence, risk controls, or executive workshop context.",
    economics: [
      { label: "Hours unlocked", value: "1.2k", caption: "Quarterly operating hours addressable through the first pilot wave." },
      { label: "Quality lift", value: "+24%", caption: "Expected improvement in consistency from guided review and standard outputs." }
    ],
    risks: [
      { icon: "Lock", title: "Data exposure", text: "Pilots must keep sensitive data inside approved boundaries." },
      { icon: "CircleAlert", title: "Adoption drag", text: "Teams need workflow-specific enablement, not generic training." }
    ],
    plan: [
      { title: "01 Select", text: "Rank workflows by impact, feasibility, risk, and adoption readiness." },
      { title: "02 Pilot", text: "Run three bounded pilots with human review and measured outcomes." },
      { title: "03 Govern", text: "Scale through approved patterns, reusable playbooks, and operating controls." }
    ]
  }),
  createBusinessTemplate({
    id: "talent-strategy-review",
    name: "Talent Strategy Review",
    category: "Graphite Green",
    theme: "dark",
    background: "#05110d",
    mutedBackground: "#0b1a14",
    surfaceBackground: "#07140f",
    accent: "#67e8a3",
    description: "An executive review for organizational design, headcount planning, performance metrics, and culture investments.",
    useCase: "HR leadership, talent strategy, headcount planning",
    hero: "Talent Strategy Review",
    subtitle: "A leadership view on organizational health, performance density, and where we need to deploy headcount next.",
    metrics: [
      { label: "Performance density", value: "82%", caption: "High-performers as a percentage of critical roles." },
      { label: "Time to hire", value: "34d", caption: "Average days to close priority engineering and sales reqs." },
      { label: "Voluntary attrition", value: "4.2%", caption: "Quarterly churn, stable within expected bands." }
    ],
    thesis: [
      { icon: "Users", title: "Talent is our constraint", text: "Capital is available, but shipping velocity depends on filling the remaining critical nodes." },
      { icon: "TrendingUp", title: "Internal mobility works", text: "We are seeing faster ramp times from internal transfers than external senior hires." }
    ],
    chart: { title: "Headcount by function", labels: "Eng,Sales,Product,G&A", values: "142,88,45,31" },
    evidence: [
      { icon: "MessageSquare", title: "Engagement scores", text: "Teams report high clarity on goals, but friction in cross-functional execution." },
      { icon: "Award", title: "Manager quality", text: "Retention correlates heavily with manager tenure and training completion." }
    ],
    strategy: [
      { icon: "Target", title: "Focus hiring", text: "Concentrate recruiting capacity on the top 5 critical gaps." },
      { icon: "Layers", title: "Develop leaders", text: "Roll out the management accelerator program to new front-line managers." },
      { icon: "ShieldCheck", title: "Protect culture", text: "Maintain strict hiring bars even as growth pressure increases." }
    ],
    image: {
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=85&w=2400",
      alt: "Team collaboration"
    },
    proofText: "Use this slide for org charts, engagement survey data, or recruiting pipeline reviews.",
    economics: [
      { label: "Cost per hire", value: "-12%", caption: "Efficiency gained from internal recruiting motion." },
      { label: "Ramp time", value: "45d", caption: "Faster productivity from standardized onboarding." }
    ],
    risks: [
      { icon: "CircleAlert", title: "Burnout risk", text: "High utilization in core engineering teams needs immediate balancing." },
      { icon: "Lock", title: "Comp compression", text: "Monitor market bands to prevent retention risks in key roles." }
    ],
    plan: [
      { title: "01 Assess", text: "Review Q2 performance and promotion cycle outcomes." },
      { title: "02 Plan", text: "Finalize Q3 headcount allocation by department." },
      { title: "03 Execute", text: "Launch the targeted leadership development program." }
    ]
  })
];
