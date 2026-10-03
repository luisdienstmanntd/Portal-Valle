import type { SVGProps } from "react";

const paths = {
  sun: "M12 3v1m0 16v1M3 12h1m16 0h1M5.6 5.6l.7.7m11.4 11.4.7.7m0-12.8-.7.7M6.3 17.7l-.7.7M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  calendar: "M8 3v4m8-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm3 9h2m4 0h2m-8 3h2",
  week: "M4 5h16v15H4V5Zm4-2v4m8-4v4M4 10h16M9 10v10m6-10v10",
  sparkles: "m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3Z",
  pool: "M3 19c2-2 4 2 6 0s4 2 6 0 4 2 6 0M3 15c2-2 4 2 6 0s4 2 6 0 4 2 6 0M8 12V5a2 2 0 0 1 4 0m4 7V5a2 2 0 0 1 4 0M8 7h8m-8 4h8",
  gym: "M3 8v8m3-11v14m12-14v14m3-11v8M6 12h12",
  dining: "M6 3v6m-3-6v6a3 3 0 0 0 6 0V3M6 12v9m12-18c-3 3-4 6-4 9h4m0-9v18",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2-5h4l1 3 3 1 3 2v6l-3 2-3 1-1 3h-4l-1-3-3-1-3-2V9l3-2 3-1 1-3Z",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
  info: "M12 11v6m0-10v.1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]} /></svg>;
}
