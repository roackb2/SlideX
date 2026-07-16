# SlideX MCP Server v0.2

Local MCP server for SlideX MotionDoc decks. It lets MCP clients create and validate decks, edit slides and blocks, apply Paper Shader presets, export standalone HTML, and write editable PowerPoint files.

The public `slidex_add_block` surface is intentionally limited to `Text`, `Image`, `Video`, `Icon`, `Table`, and `ShapeRectangle`. `Metric`, `Card`, and `Chart` are not public MCP insertion types. Existing decks may still contain legacy block syntax, but MCP clients cannot add those legacy blocks.

The package also includes built-in slide layout presets matching the SlideX Pitch layout picker, such as Title & Photo, Title & Bullets, Agenda, Key Fact, Quote, Photos - 3 on a page, and Photo. Once installed, MCP clients can list layouts, fetch layout source, create a slide from a layout, append a layout slide, or replace an existing slide with a layout.

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
- `slidex_update_block`
- `slidex_delete_block`
- `slidex_duplicate_block`
- `slidex_reorder_block`
- `slidex_list_slide_layouts`
- `slidex_get_slide_layout`
- `slidex_create_slide_from_layout`
- `slidex_add_slide_from_layout`
- `slidex_replace_slide_with_layout`
- `slidex_delete_slide`
- `slidex_reorder_slide`
- `slidex_export_html`
- `slidex_export_pptx`
- `slidex_list_block_types`
- `slidex_get_motion_doc_schema`
- `slidex_list_shaders`
- `slidex_get_shader`
- `slidex_apply_shader_preset`

Call `slidex_get_motion_doc_schema` (or read `slidex://schema/motion-doc`) before editing an unfamiliar block. It returns current slide fields, the six public add-block types, their generated MotionDoc types, and default props.

## Editable PowerPoint Export

`slidex_export_pptx` requires an absolute `.pptx` `outputPath`. It refuses to overwrite an existing file unless `overwrite` is explicitly `true`. Text, images, tables, icons, shapes, and other compatible content remain editable where possible. Slides that use Paper Shaders or unsupported visual effects receive a rasterized background while compatible foreground objects remain editable.

The package installs its matching Playwright Chromium runtime automatically. If Chromium was skipped during installation, run:

```bash
npx playwright install chromium
```

Example input:

```json
{
  "source": "# Deck\n\n<Slide duration={5}><Text x={10} y={10} w={80} h={20}>Hello</Text></Slide>",
  "outputPath": "/absolute/path/to/deck.pptx",
  "overwrite": false
}
```

## Shader Tools

Use `slidex_list_shaders` to read the current Paper Shader catalog, `slidex_get_shader` to inspect its presets and fields, and `slidex_apply_shader_preset` to apply a catalog preset to a specific slide. Shader IDs and preset names are validated against Animark's current catalog.

## Remote MCP

Animark also exposes an authenticated Streamable HTTP endpoint at `/mcp/`. Remote clients discover OAuth metadata through `/.well-known/oauth-authorization-server` and `/.well-known/oauth-protected-resource/mcp`, register as public PKCE clients, and request `presentations:read` and optionally `presentations:write`.

The Remote profile exposes only presentation-scoped tools:

- presentation source: `slidex_get_presentation`, `slidex_save_presentation`
- block source: `slidex_add_block`, `slidex_update_block`, `slidex_delete_block`, `slidex_duplicate_block`, `slidex_reorder_block`
- layout source: `slidex_list_slide_layouts`, `slidex_get_slide_layout`, `slidex_add_slide_from_layout`, `slidex_replace_slide_with_layout`
- shader source: `slidex_list_shaders`, `slidex_get_shader`, `slidex_apply_shader_preset`
- current schema: `slidex_list_block_types`, `slidex_get_motion_doc_schema`

Every Remote tool requires `presentationId` and validates ownership. Every write additionally requires `expectedRevision`, performs a compare-and-swap save, and triggers Animark's existing private presentation Realtime broadcast so an open Pitch page receives the new revision. Revision conflicts reject the save and require the client to read again.

Remote MCP deliberately does not expose deck creation, template cloning, local HTML/PPTX export, workspace CRUD, presentation deletion, or remote media upload. The Animark server must configure `SUPABASE_SERVICE_ROLE_KEY`; this value is server-only and must never be placed in a browser, MCP client configuration, or any `NEXT_PUBLIC_*` variable.

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
