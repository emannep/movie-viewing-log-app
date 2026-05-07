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
      // 既存コードへの影響が大きいため警告どまりにする
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
]
