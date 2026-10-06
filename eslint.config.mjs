import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextVitals, ...nextTypescript, { ignores: [".next-check/**", ".next-verify/**", ".next-resilience/**"] }];

export default eslintConfig;
