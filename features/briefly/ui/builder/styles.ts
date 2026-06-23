export const brieflyBuilderCss = `
.briefly-app { color-scheme: light; }
.briefly-studio {
  color-scheme: dark;
  background: #000000;
}
.briefly-studio .briefly-shell {
  background: #000000;
}
.briefly-studio .briefly-chrome {
  background: #050505 !important;
  border-color: rgba(255,255,255,0.06) !important;
  color: #f4f4f4;
}
.briefly-studio .briefly-main {
  background: #000000 !important;
}
.briefly-studio aside.briefly-chrome {
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.04);
}
.briefly-studio aside.briefly-chrome + .briefly-main + aside.briefly-chrome {
  box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.04);
}
.briefly-studio .briefly-chrome [class*="bg-white"],
.briefly-studio .briefly-chrome [class*="bg-[#f"],
.briefly-studio .briefly-chrome [class*="bg-[#e"] {
  background: #111111 !important;
}
.briefly-studio .briefly-chrome [class*="border-[#c"],
.briefly-studio .briefly-chrome [class*="border-[#d"],
.briefly-studio .briefly-chrome [class*="border-[#e"] {
  border-color: rgba(255,255,255,0.08) !important;
}
.briefly-studio .briefly-chrome [class*="text-[#151515]"],
.briefly-studio .briefly-chrome [class*="text-[#161616]"],
.briefly-studio .briefly-chrome [class*="text-[#242424]"] {
  color: #f4f4f4 !important;
}
.briefly-studio .briefly-chrome [class*="text-[#525252]"],
.briefly-studio .briefly-chrome [class*="text-[#666666]"],
.briefly-studio .briefly-chrome [class*="text-[#686868]"],
.briefly-studio .briefly-chrome [class*="text-[#737373]"],
.briefly-studio .briefly-chrome [class*="text-[#6b6b6b]"] {
  color: rgba(255, 255, 255, 0.56) !important;
}
.briefly-studio .briefly-chrome button,
.briefly-studio .briefly-chrome input,
.briefly-studio .briefly-chrome select,
.briefly-studio .briefly-chrome textarea {
  color: inherit;
}
.briefly-studio .briefly-chrome input:focus,
.briefly-studio .briefly-chrome select:focus,
.briefly-studio .briefly-chrome textarea:focus {
  background: #191919 !important;
  border-color: rgba(255,255,255,0.3) !important;
  box-shadow: none !important;
}
.briefly-studio .briefly-chrome select option {
  background: #101010;
  color: #f4f4f4;
}
.briefly-studio .briefly-property-editor input,
.briefly-studio .briefly-property-editor textarea,
.briefly-studio .briefly-property-editor select {
  background: #0a0a0a !important;
  border-color: rgba(255,255,255,0.08) !important;
  color: #f4f4f4 !important;
}
.briefly-studio .briefly-property-editor input::placeholder,
.briefly-studio .briefly-property-editor textarea::placeholder {
  color: rgba(255, 255, 255, 0.2);
}
.briefly-studio .briefly-property-editor .control-button {
  border-color: rgba(255,255,255,0.08) !important;
  background: #0a0a0a !important;
  color: #f4f4f4 !important;
}
.briefly-studio .briefly-property-editor .briefly-cover-field-label {
  color: #f4f4f4 !important;
}
.briefly-studio .briefly-property-editor .briefly-cover-field-help {
  color: rgba(255, 255, 255, 0.5) !important;
}
.briefly-studio .briefly-property-editor .briefly-cover-image-preview {
  background: #0a0a0a !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
.briefly-studio .briefly-property-editor .briefly-cover-upload-button {
  background: #0a0a0a !important;
  border-color: rgba(255, 255, 255, 0.14) !important;
  color: rgba(255, 255, 255, 0.62) !important;
}
.briefly-studio .briefly-property-editor .briefly-cover-upload-button:hover {
  background: #111111 !important;
  border-color: rgba(96, 165, 250, 0.45) !important;
  color: #f4f4f4 !important;
}
.briefly-studio .briefly-property-editor .briefly-cover-upload-icon {
  background: rgba(255, 255, 255, 0.06) !important;
  color: #93c5fd !important;
}
.briefly-studio .briefly-main > .briefly-chrome {
  background: transparent !important;
  color: #e8e8e8;
}
.briefly-studio .briefly-main > .briefly-chrome [class*="text-[#151515]"],
.briefly-studio .briefly-main > .briefly-chrome [class*="text-[#242424]"] {
  color: #e8e8e8 !important;
}
.briefly-studio .briefly-main > .briefly-chrome [class*="text-[#525252]"],
.briefly-studio .briefly-main > .briefly-chrome [class*="text-[#686868]"] {
  color: rgba(255,255,255,0.5) !important;
}
.briefly-studio .briefly-main > .briefly-chrome [class*="bg-white"] {
  background: rgba(255,255,255,0.06) !important;
}
.briefly-studio .briefly-main > .briefly-chrome [class*="border-[#c"],
.briefly-studio .briefly-main > .briefly-chrome [class*="border-[#d"] {
  border-color: rgba(255,255,255,0.1) !important;
}
.briefly-studio .briefly-chrome .briefly-segment-active {
  background: rgba(255,255,255,0.15) !important;
  color: #ffffff !important;
}
.briefly-studio .briefly-main pre {
  background: #050505 !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
  color: #d8d8d8 !important;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
}
.briefly-studio .briefly-print-area {
  border-radius: 8px;
  box-shadow: 0 34px 120px rgba(0, 0, 0, 0.44);
}
.briefly-print-area .briefly-rich-text p {
  margin: 0;
}
.briefly-print-area .briefly-rich-text p + p,
.briefly-print-area .briefly-rich-text p + ul,
.briefly-print-area .briefly-rich-text p + ol,
.briefly-print-area .briefly-rich-text p + blockquote,
.briefly-print-area .briefly-rich-text ul + p,
.briefly-print-area .briefly-rich-text ol + p,
.briefly-print-area .briefly-rich-text blockquote + p {
  margin-top: 0.75em;
}
.briefly-print-area .briefly-rich-text ul,
.briefly-print-area .briefly-rich-text ol {
  margin: 0.65em 0;
  padding-left: 1.5rem;
}
.briefly-print-area .briefly-rich-text ul {
  list-style: disc;
}
.briefly-print-area .briefly-rich-text ol {
  list-style: decimal;
}
.briefly-print-area .briefly-rich-text li + li {
  margin-top: 0.35em;
}
.briefly-print-area .briefly-rich-text blockquote {
  margin: 0.75em 0;
  border-left: 3px solid var(--border-color);
  padding-left: 1rem;
  color: var(--text-secondary);
  font-style: italic;
}
.briefly-print-area .briefly-rich-text h2,
.briefly-print-area .briefly-rich-text h3 {
  color: inherit;
  font-weight: 700;
  line-height: 1.25;
}
.briefly-print-area .briefly-rich-text h2 {
  margin: 1em 0 0.35em;
  font-size: 1.35em;
}
.briefly-print-area .briefly-rich-text h3 {
  margin: 0.85em 0 0.3em;
  font-size: 1.12em;
}
.briefly-studio .briefly-edit-panel {
  border-color: #333333;
}
.briefly-app ::selection {
  background: rgba(37, 99, 235, 0.84);
  color: #ffffff;
}
.briefly-app .ProseMirror ::selection,
.briefly-app .ProseMirror *::selection {
  background: rgba(37, 99, 235, 0.9);
  color: #ffffff;
}
.briefly-app .cm-selectionBackground {
  background: rgba(37, 99, 235, 0.45) !important;
}
.briefly-app .control-button {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  color: #e8e8e8;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.briefly-app .control-button:hover {
  border-color: rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.06);
}
.briefly-studio .briefly-block-thumbnail {
  border-color: rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, #1a1a1a, #0a0a0a);
}
.briefly-studio .briefly-block-thumbnail-icon {
  color: #60a5fa;
}
.briefly-studio .briefly-code-editor {
  background: #050505;
  border-color: rgba(255, 255, 255, 0.08);
}
.briefly-studio.briefly-theme-light {
  color-scheme: light;
  background: #f4f5f7;
  color: #161616;
}
.briefly-studio.briefly-theme-light .briefly-shell,
.briefly-studio.briefly-theme-light .briefly-main {
  background: #f4f5f7 !important;
}
.briefly-studio.briefly-theme-light .briefly-chrome {
  background: #ffffff !important;
  border-color: rgba(22, 22, 22, 0.1) !important;
  color: #161616;
}
.briefly-studio.briefly-theme-light aside.briefly-chrome {
  box-shadow: inset -1px 0 0 rgba(22, 22, 22, 0.04);
}
.briefly-studio.briefly-theme-light aside.briefly-chrome + .briefly-main + aside.briefly-chrome {
  box-shadow: inset 1px 0 0 rgba(22, 22, 22, 0.04);
}
.briefly-studio.briefly-theme-light .briefly-chrome [class*="bg-[#000000]"],
.briefly-studio.briefly-theme-light .briefly-chrome [class*="bg-[#050505]"],
.briefly-studio.briefly-theme-light .briefly-chrome [class*="bg-[#0a0a0a]"],
.briefly-studio.briefly-theme-light .briefly-chrome [class*="bg-[#111111]"],
.briefly-studio.briefly-theme-light .briefly-chrome [class*="bg-white"] {
  background: #ffffff !important;
}
.briefly-studio.briefly-theme-light .briefly-chrome [class*="border-white"],
.briefly-studio.briefly-theme-light .briefly-chrome [class*="border-[#c"],
.briefly-studio.briefly-theme-light .briefly-chrome [class*="border-[#d"],
.briefly-studio.briefly-theme-light .briefly-chrome [class*="border-[#e"] {
  border-color: rgba(22, 22, 22, 0.1) !important;
}
.briefly-studio.briefly-theme-light .briefly-chrome [class*="text-white"] {
  color: rgba(22, 22, 22, 0.7) !important;
}
.briefly-studio.briefly-theme-light .briefly-chrome [class*="text-white/90"],
.briefly-studio.briefly-theme-light .briefly-chrome [class*="text-white/80"],
.briefly-studio.briefly-theme-light .briefly-chrome [class*="text-white/75"] {
  color: #161616 !important;
}
.briefly-studio.briefly-theme-light .briefly-chrome [class*="text-white/60"],
.briefly-studio.briefly-theme-light .briefly-chrome [class*="text-white/50"],
.briefly-studio.briefly-theme-light .briefly-chrome [class*="text-white/40"] {
  color: rgba(22, 22, 22, 0.56) !important;
}
.briefly-studio.briefly-theme-light .briefly-chrome [class*="hover:text-white"]:hover {
  color: #161616 !important;
}
.briefly-studio.briefly-theme-light .briefly-chrome [class*="hover:bg-white"]:hover {
  background: rgba(22, 22, 22, 0.06) !important;
}
.briefly-studio.briefly-theme-light .briefly-chrome .briefly-segment-active {
  background: #2563eb !important;
  color: #ffffff !important;
}
.briefly-studio.briefly-theme-light .briefly-chrome [class*="text-blue"] {
  color: #2563eb !important;
}
.briefly-studio.briefly-theme-light .briefly-chrome input,
.briefly-studio.briefly-theme-light .briefly-chrome select,
.briefly-studio.briefly-theme-light .briefly-chrome textarea {
  background: #ffffff !important;
  border-color: rgba(22, 22, 22, 0.12) !important;
  color: #161616 !important;
}
.briefly-studio.briefly-theme-light .briefly-chrome input:focus,
.briefly-studio.briefly-theme-light .briefly-chrome select:focus,
.briefly-studio.briefly-theme-light .briefly-chrome textarea:focus {
  background: #ffffff !important;
  border-color: rgba(37, 99, 235, 0.5) !important;
}
.briefly-studio.briefly-theme-light .briefly-chrome select option {
  background: #ffffff;
  color: #161616;
}
.briefly-studio.briefly-theme-light .briefly-property-editor input,
.briefly-studio.briefly-theme-light .briefly-property-editor textarea,
.briefly-studio.briefly-theme-light .briefly-property-editor select {
  background: #ffffff !important;
  border-color: rgba(22, 22, 22, 0.12) !important;
  color: #161616 !important;
}
.briefly-studio.briefly-theme-light .briefly-property-editor input::placeholder,
.briefly-studio.briefly-theme-light .briefly-property-editor textarea::placeholder {
  color: rgba(22, 22, 22, 0.32);
}
.briefly-studio.briefly-theme-light .briefly-property-editor .control-button,
.briefly-studio.briefly-theme-light .control-button {
  border-color: rgba(22, 22, 22, 0.1) !important;
  background: #ffffff !important;
  color: #161616 !important;
}
.briefly-studio.briefly-theme-light .briefly-property-editor .briefly-cover-field-label {
  color: #161616 !important;
}
.briefly-studio.briefly-theme-light .briefly-property-editor .briefly-cover-field-help {
  color: rgba(22, 22, 22, 0.56) !important;
}
.briefly-studio.briefly-theme-light .briefly-property-editor .briefly-cover-image-preview {
  background: #f8fafc !important;
  border-color: rgba(22, 22, 22, 0.12) !important;
}
.briefly-studio.briefly-theme-light .briefly-property-editor .briefly-cover-upload-button {
  background: #f8fafc !important;
  border-color: rgba(22, 22, 22, 0.16) !important;
  color: rgba(22, 22, 22, 0.58) !important;
}
.briefly-studio.briefly-theme-light .briefly-property-editor .briefly-cover-upload-button:hover {
  background: #eff6ff !important;
  border-color: rgba(37, 99, 235, 0.46) !important;
  color: #1d4ed8 !important;
}
.briefly-studio.briefly-theme-light .briefly-property-editor .briefly-cover-upload-icon {
  background: rgba(37, 99, 235, 0.09) !important;
  color: #2563eb !important;
}
.briefly-studio.briefly-theme-light .control-button:hover {
  border-color: rgba(22, 22, 22, 0.18) !important;
  background: #f1f5f9 !important;
}
.briefly-studio.briefly-theme-light .briefly-main > .briefly-chrome {
  background: transparent !important;
  color: #161616;
}
.briefly-studio.briefly-theme-light .briefly-main pre {
  background: #ffffff !important;
  border-color: rgba(22, 22, 22, 0.1) !important;
  color: #161616 !important;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
}
.briefly-studio.briefly-theme-light .briefly-block-thumbnail {
  border-color: rgba(37, 99, 235, 0.16);
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(14, 165, 233, 0.04)),
    linear-gradient(135deg, #ffffff, #eef2f7);
}
.briefly-studio.briefly-theme-light .briefly-block-thumbnail-icon {
  color: #2563eb;
}
.briefly-studio.briefly-theme-light .briefly-code-editor {
  background: #ffffff !important;
  border-color: rgba(22, 22, 22, 0.1) !important;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
}
.briefly-studio.briefly-theme-light .briefly-code-editor .cm-editor,
.briefly-studio.briefly-theme-light .briefly-code-editor .cm-gutters {
  background: #ffffff !important;
}
.briefly-studio.briefly-theme-light .briefly-code-editor .cm-gutters {
  border-right-color: rgba(22, 22, 22, 0.08) !important;
  color: rgba(22, 22, 22, 0.35) !important;
}
.briefly-studio.briefly-theme-light .briefly-print-area {
  box-shadow: 0 34px 120px rgba(15, 23, 42, 0.14);
}
.briefly-studio.briefly-theme-light .briefly-edit-panel {
  border-color: rgba(37, 99, 235, 0.34);
}
@page { size: A4; margin: 18mm; }
@media print {
  html, body { background: #ffffff !important; }
  body { color: #111111 !important; }
  body * { visibility: hidden !important; }
  .briefly-app { min-height: auto !important; background: #ffffff !important; }
  .briefly-studio .briefly-print-wrap { background: #ffffff !important; }
  .briefly-chrome, .briefly-edit-panel { display: none !important; }
  .briefly-shell { display: block !important; height: auto !important; min-height: auto !important; overflow: visible !important; background: #ffffff !important; }
  .briefly-main { display: block !important; height: auto !important; overflow: visible !important; padding: 0 !important; background: #ffffff !important; }
  .briefly-print-wrap { padding: 0 !important; background: #ffffff !important; }
  .briefly-app,
  .briefly-shell,
  .briefly-main,
  .briefly-print-wrap,
  .briefly-print-area,
  .briefly-print-area * {
    visibility: visible !important;
  }
  .lg\\:hidden .briefly-print-area { display: none !important; }
  .briefly-print-area {
    position: absolute !important;
    inset: 0 auto auto 0 !important;
    max-width: none !important;
    width: 100% !important;
    margin: 0 !important;
    border: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  .briefly-print-area .briefly-section-toolbar,
  .briefly-print-area .briefly-upload-placeholder,
  .briefly-print-area .briefly-placeholder-text,
  .briefly-print-area .briefly-footer-editor[data-empty="true"] {
    display: none !important;
  }
  .briefly-print-area .tiptap p.is-editor-empty:first-child::before {
    content: "" !important;
  }
  .briefly-print-area [role="button"] { cursor: default !important; }
  .briefly-print-area .ring-2 { --tw-ring-shadow: 0 0 #0000 !important; }
  .briefly-section { page-break-inside: avoid; break-inside: avoid; }
}
`;
