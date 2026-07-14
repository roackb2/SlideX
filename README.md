# SlideX Pitch

SlideX Pitch is a focused presentation workspace for arranging content on a precise canvas, establishing each slide's visual direction with monochrome fills, and creating editable motion for playback and export.

## Code Repository

Public repository: [https://github.com/zz41354899/Animark](https://github.com/zz41354899/Animark)

## How Codex and GPT-5.6 Were Used

OpenAI Codex was used throughout the development of this project, with GPT-5.6 selected in supported Codex sessions as a development partner for programming, cross-file reasoning, security review, and verification. Codex worked directly with the local repository by reading the existing code, editing files, running commands, and reporting validation results. GPT-5.6 helped interpret requirements, analyze relationships between components, evaluate design tradeoffs, and generate or review implementation details.

The main areas of use included:

- **Repository analysis and architecture:** Inspecting Next.js routes, feature boundaries, the MotionDoc core, Supabase adapters, and shared modules before deciding where each change should live.
- **Feature implementation and refactoring:** Assisting with the presentation workspace, guest demo persistence, authentication callbacks, the Next.js proxy, first-login onboarding, image uploads, and presentation persistence.
- **Database design:** Refining the single-user MVP Supabase schema, column-level grants, RLS policies, the private Storage bucket, `agent_sessions`, and atomic compare-and-swap writes using `source_revision` so the Editor and Agent cannot silently overwrite each other.
- **Security review:** Checking the Service Role Key boundary, rejecting SVG uploads, enforcing UUID image paths, validating Storage ownership, ordering image cleanup before presentation deletion, filtering MotionDoc URLs, escaping exported HTML, and applying Content Security Policy protections.
- **Testing and verification:** Adding or running automated tests and using linting, TypeScript and production builds, diff inspection, and targeted assertions to check for regressions.
- **Documentation:** Maintaining the README, Supabase specification, security report, and pre-deployment acceptance criteria so the implementation, permission model, and documented limitations remain aligned.

### How I Usually Work with Codex

I normally communicate with Codex directly in Traditional Chinese. I do not rewrite every request into a special prompt format, and I do not hold separate conversations with Codex and GPT-5.6. Codex is the interface that works with the repository, edits files, and runs validation. GPT-5.6 is the model used within the Codex session to understand context and reason through the task.

I usually do not provide a complete technical specification in a single message. I begin with the clearest current problem and narrow the scope through several rounds of discussion:

1. **Describe the product problem first.** For example, I may explain that the Supabase SQL has become too complex, the login flow is incorrect, a UI element is too small, or deleting a presentation could leave Storage images behind.
2. **Add non-negotiable constraints.** I explicitly state requirements such as never exposing the Service Role Key to the frontend, temporarily disabling SVG uploads, using UUID-based image paths, or limiting the current release to a single-user MVP.
3. **Ask Codex to inspect the current implementation.** I expect Codex to review the existing schema, repositories, UI, and data flow before editing the project instead of returning a generic example designed for an empty codebase.
4. **Refine the scope through follow-up messages.** If an initial proposal is too broad, I narrow it further. For example, workspace membership and collaboration can be postponed while Agent support must still retain `source_revision`, atomic compare-and-swap writes, and `agent_sessions`.
5. **Request implementation and verification.** Once the requirements are clear, I ask Codex to update the actual files, merge SQL, review RLS, and run the tests, lint, build, or other checks appropriate to the change.
6. **Review and iterate.** I inspect the diff, UI, or report and continue the discussion when something needs to be removed, reduced in scope, or strengthened with an additional security condition.

The recent Supabase work followed this exact process. I began with the single-user MVP direction and gradually added requirements for image security, column-level permissions, guest demo persistence, the login proxy, first-login onboarding, and protection against Agent and Editor write conflicts. Codex and GPT-5.6 repeatedly checked those requirements against the same repository and consolidated them into one migration, a CAS function, Agent session RLS, an Edge Function deletion flow, and a system report.

The typical collaboration workflow is:

1. I provide the goal, current problem, constraints, and completion criteria in natural language.
2. Codex inspects the relevant repository files and gathers the current implementation context.
3. GPT-5.6 helps reason about cross-file effects, data flow, authorization boundaries, and regression risks.
4. Codex implements the agreed approach in the workspace and runs the relevant tests, lint checks, and production build.
5. I review the diff, visual result, and validation output and retain final control over product decisions, merging, and deployment.

Codex and GPT-5.6 are development tools for this project, not current runtime dependencies of the SlideX browser application. The repository does not expose an OpenAI API key to the frontend, and user presentations are not automatically sent to OpenAI. If a production model API is added in the future, it will require a separate server-side API boundary, user consent, data-processing documentation, usage limits, and corresponding security policies.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The home page and Pitch redirect to `/en` or `/zh-TW` according to the selected locale. The presentation workspace is available at `/workspace/pitch`.

## Validation

```bash
npm run lint
npm run build
```
