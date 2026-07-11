import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      ".next-turbo/**",
      ".next-build/**",
      ".next-dev/**",
      "out/**",
      "packages/*/dist/**",
      "public/vendor/**",
      "src-tauri/target/**",
      "node_modules/**",
      "next-env.d.ts"
    ]
  },
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/set-state-in-effect": "off"
    }
  },
  {
    files: ["app/**/*.{ts,tsx}", "common/**/*.{ts,tsx}", "core/**/*.{ts,tsx}", "features/**/*.{ts,tsx}"],
    plugins: {
      boundaries
    },
    settings: {
      "boundaries/include": ["app/**/*", "common/**/*", "core/**/*", "features/**/*"],
      "boundaries/elements": [
        { type: "app", pattern: "app/**/*", mode: "full" },
        { type: "common-lib", pattern: "common/lib/**/*", mode: "full" },
        { type: "common-ui", pattern: "common/ui/**/*", mode: "full" },
        { type: "common-util", pattern: "common/util/**/*", mode: "full" },
        { type: "core-domain", pattern: "core/*/domain/**/*", mode: "full" },
        { type: "core-application", pattern: "core/*/application/**/*", mode: "full" },
        { type: "core-infrastructure", pattern: "core/*/infrastructure/**/*", mode: "full" },
        { type: "core-presets", pattern: "core/*/presets/**/*", mode: "full" },
        { type: "feature-public", pattern: "features/*/index.ts", mode: "full" },
        { type: "feature-domain", pattern: "features/*/domain/**/*", mode: "full" },
        { type: "feature-application", pattern: "features/*/application/**/*", mode: "full" },
        { type: "feature-infrastructure", pattern: "features/*/infrastructure/**/*", mode: "full" },
        { type: "feature-ui", pattern: "features/*/ui/**/*", mode: "full" }
      ]
    },
    rules: {
      "boundaries/no-unknown": "error",
      "boundaries/no-unknown-files": "error",
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: { type: "app" },
              allow: { to: { type: ["app", "common-lib", "common-ui", "common-util", "core-presets", "feature-public"] } }
            },
            {
              from: { type: "common-ui" },
              allow: { to: { type: ["common-lib", "common-ui", "common-util"] } }
            },
            {
              from: { type: "common-lib" },
              allow: { to: { type: ["common-lib", "common-util"] } }
            },
            {
              from: { type: "common-util" },
              allow: { to: { type: "common-util" } }
            },
            {
              from: { type: "core-domain" },
              allow: { to: { type: ["core-domain", "common-util"] } }
            },
            {
              from: { type: "core-application" },
              allow: { to: { type: ["core-domain", "core-application", "common-util"] } }
            },
            {
              from: { type: "core-infrastructure" },
              allow: { to: { type: ["core-domain", "core-application", "core-infrastructure", "common-util"] } }
            },
            {
              from: { type: "core-presets" },
              allow: { to: { type: ["core-domain", "core-application", "core-presets", "common-util"] } }
            },
            {
              from: { type: "feature-public" },
              allow: { to: { type: ["common-lib", "common-ui", "common-util", "core-domain", "core-application", "core-infrastructure", "core-presets", "feature-domain", "feature-application", "feature-infrastructure", "feature-ui"] } }
            },
            {
              from: { type: "feature-domain" },
              allow: { to: { type: ["common-util", "core-domain", "core-application", "feature-domain"] } }
            },
            {
              from: { type: "feature-application" },
              allow: { to: { type: ["common-util", "core-domain", "core-application", "feature-domain", "feature-application"] } }
            },
            {
              from: { type: "feature-infrastructure" },
              allow: { to: { type: ["common-util", "core-domain", "core-application", "feature-domain", "feature-application", "feature-infrastructure"] } }
            },
            {
              from: { type: "feature-ui" },
              allow: { to: { type: ["common-lib", "common-ui", "common-util", "core-domain", "core-application", "core-infrastructure", "core-presets", "feature-domain", "feature-application", "feature-infrastructure", "feature-ui"] } }
            }
          ]
        }
      ]
    }
  }
];

export default eslintConfig;
