# SlideX Pitch

SlideX Pitch is a focused presentation workspace for arranging content on a precise canvas, establishing the visual direction of each slide with solid fills and motion backgrounds, and creating editable presentations for playback and export.

SlideX MCP extends this workflow by allowing compatible AI clients to create, inspect, edit, and export presentations through the Model Context Protocol.

## Code Repository

Public repository:

https://github.com/zz41354899/SlideX

## Built with Codex and GPT-5.6

SlideX was meaningfully extended during OpenAI Build Week using OpenAI Codex with GPT-5.6.

Codex was the main development interface used to inspect the existing repository, edit files, run commands, execute tests, and report validation results.

GPT-5.6 was used within Codex sessions to understand product requirements, reason across multiple files, evaluate architecture and security tradeoffs, review implementation details, and help debug issues.

I communicated with Codex primarily in Traditional Chinese using natural-language instructions. I did not maintain separate conversations with Codex and GPT-5.6. Codex was the interface interacting with the repository, while GPT-5.6 was the model used within those development sessions.

## How Codex and GPT-5.6 Were Used

### Repository Analysis and Architecture

Codex inspected the existing Next.js application structure, routing, feature boundaries, MotionDoc presentation engine, Supabase integration, MCP modules, and shared utilities before changes were implemented.

GPT-5.6 helped reason about where new functionality should be placed and how changes would affect the editor, presentation storage, MCP server, authentication flow, and export system.

### MCP Implementation

Codex and GPT-5.6 helped design and implement SlideX MCP, including:

- Local and remote MCP server support
- Presentation discovery and selection
- Slide and block inspection
- Canvas node discovery
- Position and size updates using stable node IDs
- Slide layout creation and replacement
- Presentation revision checking
- Conflict-safe presentation updates
- Secure private image uploads
- MCP installation and testing documentation

### Presentation Workflow

Codex assisted with the implementation and refinement of:

- Presentation creation and editing
- Slide structure and layout tools
- MotionDoc parsing and validation
- Presentation preview
- Editable PowerPoint export
- Interactive HTML export
- Guest demonstration persistence
- Agent conversation and presentation synchronization

### Database and Persistence

Codex and GPT-5.6 were used to review and improve:

- Supabase schema design
- Row Level Security policies
- Private Storage buckets
- Presentation ownership rules
- Agent session records
- Atomic compare-and-swap updates using `source_revision`
- Protection against silent conflicts between the editor and an AI agent

### Security Review

The development process included reviews of:

- Service Role Key boundaries
- OAuth and PKCE authorization
- Storage ownership validation
- UUID-based image paths
- SVG upload restrictions
- Image cleanup before presentation deletion
- MotionDoc URL filtering
- Exported HTML escaping
- Content Security Policy protections
- Sanitized PPTX logs and error messages

### Testing and Validation

Codex was used to run and review:

- Automated tests
- TypeScript validation
- ESLint
- Production builds
- Targeted assertions
- Diff inspection
- Regression checks

I reviewed the resulting code, interface changes, validation output, and product behavior before deciding what to merge or deploy.

## Work Completed During OpenAI Build Week

SlideX existed before the hackathon. The following features were newly added or meaningfully extended after July 13, 2026:

- SlideX local and remote MCP server integration
- MCP presentation discovery and editing tools
- Canvas node discovery and precise position updates
- Secure MCP image upload workflow
- Presentation revision and conflict handling
- Agent and editor synchronization
- PPTX log redaction and error sanitization
- Traditional Chinese localization for the demo experience
- MCP installation, configuration, and testing documentation

## Relevant Commits

- [`884ff9b`](https://github.com/zz41354899/SlideX/commit/884ff9bdb868dda784b0ada21733e0fb0574110c)  
  Release MCP 0.3.0 with canvas discovery tools.

- [`0b8f6e8`](https://github.com/zz41354899/SlideX/commit/0b8f6e8b8289704fd602434300839562ad52d1bd)  
  Add secure MCP image uploads and improve MCP authorization.

- [`61fbe65`](https://github.com/zz41354899/SlideX/commit/61fbe65fbcf1729e6191d34cb7592c300aa26b56)  
  Send presentation revisions to the agent.

- [`497e593`](https://github.com/zz41354899/SlideX/commit/497e59348d4dd6fb587b77594dff89a257f34a09)  
  Improve presentation synchronization, persistent block identity, recovery drafts, and atomic updates.

- [`f2b6698`](https://github.com/zz41354899/SlideX/commit/f2b6698f209c45555bb1a6b3e5a13f7c714ede45)  
  Add PPTX console redaction and error sanitization.

- [`9d47a86`](https://github.com/zz41354899/SlideX/commit/9d47a86974f5f14b46349bded6d03ee420e570b2)  
  Add SlideX MCP installation, configuration, local MCP, and remote MCP documentation.

The primary Codex `/feedback` Session ID has been provided separately through the Devpost submission form.

## Demo Environment

The demonstration video uses Antigravity as the MCP client.

Antigravity is only the client used to connect to and demonstrate SlideX MCP. SlideX MCP is the project being submitted.

The relationship is:

- SlideX MCP provides the presentation tools and workflow.
- Antigravity calls those tools as an MCP-compatible client.
- Codex with GPT-5.6 was used to develop and extend the project.

## Runtime and Data Usage

Codex and GPT-5.6 were development tools for this project. They are not required runtime dependencies of the current SlideX browser application.

The repository does not expose an OpenAI API key to the frontend, and user presentations are not automatically sent to OpenAI.

If a production model API is added in the future, it will require a separate server-side API boundary, user consent, data-processing documentation, usage limits, and corresponding security policies.

## Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The presentation workspace is available at:

```text
http://localhost:3000/workspace/pitch
```

The application redirects to `/en` or `/zh-TW` according to the selected locale.

## MCP

Run the local MCP server:

```bash
npx -y @z7589xxz758/slidex-mcp-server
```

Example MCP client configuration:

```json
{
  "mcpServers": {
    "slidex": {
      "command": "npx",
      "args": ["-y", "@z7589xxz758/slidex-mcp-server"]
    }
  }
}
```

Remote MCP endpoint:

```text
https://slidexdeck.com/mcp
```

Remote MCP OAuth requires separate server-only `MCP_OAUTH_RATE_LIMIT_SECRET` and
`MCP_OAUTH_AUDIT_HMAC_SECRET` values with at least 32 random bytes each. Apply
pending Supabase migrations before deploying code that uses atomic token
families, one-time consent requests, and deidentified security events. OAuth
registration, consent, and token endpoints are rate limited; the normal `/mcp`
transport is not. Successful authenticated MCP responses expose only aggregate
`auth`, `store`, `handler`, and `total` durations through `Server-Timing`.

## Validation

```bash
npm run lint
npm run build
```

After the OAuth migration is applied to the target environment, run the real
Next HTTP bearer chain with:

```bash
REMOTE_MCP_SMOKE_BASE_URL=https://slidexdeck.com npm run mcp:test:remote
```

Without `REMOTE_MCP_SMOKE_BASE_URL`, the smoke test keeps its store-level and
in-memory MCP coverage and reports the HTTP bearer chain as skipped.

The live token-endpoint burst test is opt-in because it deliberately exhausts
the shared rate-limit bucket. Run it only in an isolated validation window:

```bash
REMOTE_MCP_SMOKE_BASE_URL=https://slidexdeck.com \
REMOTE_MCP_SMOKE_VERIFY_RATE_LIMIT=1 npm run mcp:test:remote
```
