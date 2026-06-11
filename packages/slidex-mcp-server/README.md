# slidex-mcp-server

MCP server for SlideX MotionDoc decks. It lets MCP clients create decks, read templates, validate MDX, edit slides, add blocks, and export standalone HTML.

Current authoring syntax uses `<Slide>` with `Text`, `Icon`, `Chart`, `ImageBlock`, and `VideoBlock`. New MCP block insertion only creates the current authoring blocks.

The package also includes built-in slide layout presets matching the SlideX Studio layout picker, such as Title & Photo, Title & Bullets, Agenda, Key Fact, Quote, Photos - 3 on a page, and Photo. Once installed, MCP clients can list layouts, fetch layout source, create a slide from a layout, append a layout slide, or replace an existing slide with a layout.

## Quick Start

Run the server directly without installing:

```bash
npx -y @z7589xxz758/slidex-mcp-server
```

## Use With MCP Clients

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

## Local Development

From the SlideX repository root:

```bash
npm install
npm run mcp
```

When connecting through stdio, prefer the silent npm form:

```json
{
  "mcpServers": {
    "slidex": {
      "command": "npm",
      "args": ["--silent", "run", "mcp"],
      "cwd": "/absolute/path/to/Animark"
    }
  }
}
```

## Tools

- `slidex_parse_motion_doc`
- `slidex_validate_motion_doc`
- `slidex_list_templates`
- `slidex_get_template`
- `slidex_create_deck`
- `slidex_create_from_template`
- `slidex_update_slide_props`
- `slidex_replace_slide`
- `slidex_add_block`
- `slidex_list_slide_layouts`
- `slidex_get_slide_layout`
- `slidex_create_slide_from_layout`
- `slidex_add_slide_from_layout`
- `slidex_replace_slide_with_layout`
- `slidex_delete_slide`
- `slidex_reorder_slide`
- `slidex_export_html`
- `slidex_list_block_types`

`slidex_add_block` currently accepts `Text`, `Image`, `Video`, `ChartBar`, `ChartLine`, `ChartArea`, `ChartPie`, `ChartDonut`, and `Icon`.

## Built-in Slide Layouts

`slidex_list_slide_layouts` currently returns 16 installable layout presets:

- `title`
- `title-photo`
- `title-alt-photo`
- `title-bullets`
- `bullets`
- `title-bullets-photo`
- `title-bullets-small-video`
- `title-bullets-large-video`
- `chapter`
- `only-title`
- `agenda`
- `statement`
- `key-fact`
- `quote`
- `photos-3`
- `photo`

Layout resources are also available at `slidex://slide-layouts` and `slidex://slide-layouts/{layoutId}`.

## Dynamic Workspace Skills

When the server starts, it dynamically scans the current working directory (`process.cwd()`) for a `.agents/skills` folder. If found, it reads the `SKILL.md` files and automatically registers them as:
- **MCP Prompts**: `skill_<folder_name>` (e.g., `skill_high_end_visual_design`)
- **MCP Resources**: `workspace://skills/<folder_name>`

This allows the AI to adapt to the specific design guidelines, tones, and automated workflows of the workspace it is running in!
