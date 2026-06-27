# briefly-mcp-server

MCP server for Briefly Builder and Briefly Review.

It exposes tools for creating structured Briefly project briefs, parsing/exporting Briefly MDX, extracting document structure, and preparing review prompts from rubrics.

## Quick Start

Install globally:

```bash
npm install -g @z7589xxz758/briefly-mcp-server
```

Then point your MCP client at the installed server:

```bash
briefly-mcp-server
```

Package page: https://www.npmjs.com/package/@z7589xxz758/briefly-mcp-server

## Use With MCP Clients

Global install config:

```json
{
  "mcpServers": {
    "briefly": {
      "command": "briefly-mcp-server"
    }
  }
}
```

Or launch with npx:

```json
{
  "mcpServers": {
    "briefly": {
      "command": "npx",
      "args": ["-y", "@z7589xxz758/briefly-mcp-server"]
    }
  }
}
```

## Local Development

From the Animark repository root:

```bash
npm install
npm --silent run briefly:mcp
```

MCP client config for local development:

```json
{
  "mcpServers": {
    "briefly": {
      "command": "npm",
      "args": ["--silent", "run", "briefly:mcp"],
      "cwd": "/absolute/path/to/Animark"
    }
  }
}
```

## Tools

- `briefly_list_rubrics`
- `briefly_get_rubric`
- `briefly_extract_structure`
- `briefly_review_asset`
- `briefly_list_builder_blocks`
- `briefly_create_brief`
- `briefly_parse_brief`
- `briefly_add_section`
- `briefly_update_section`
- `briefly_export_brief`
- `briefly_export_pdf`

`briefly_export_pdf` uses a local Chrome or Chromium executable in headless mode. If Chrome is not in a standard location, set `CHROME_PATH` or pass `chromePath`.

## Resources

- `briefly://rubrics`
- `briefly://rubrics/course-planning`
- `briefly://rubrics/brand-guidelines`
- `briefly://rubrics/document-clarity`
- `briefly://builder/blocks`
- `briefly://builder/schema`

## Review Model

The server does not call OpenAI, Anthropic, or any external LLM API. `briefly_review_asset` fetches and cleans the asset, loads the selected rubric, and returns a review-ready prompt for the host MCP client to reason over.
