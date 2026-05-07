import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

export default [
  {
    ignores: [".next/**", "out/**", "build/**", "dist/**", "node_modules/**", "eslint.config.mjs"],
  },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // "can be written as ..." 系の提案をCLIで拾いやすくする
      "no-unneeded-ternary": "warn",
      "prefer-template": "warn",
    },
  },
]
