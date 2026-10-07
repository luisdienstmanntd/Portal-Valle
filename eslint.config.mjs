import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextVitals, ...nextTypescript, { ignores: ["work/**", ".next-check/**", ".next-verify/**", ".next-program/**"] }];

export default eslintConfig;
