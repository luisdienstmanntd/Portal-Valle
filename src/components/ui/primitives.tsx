import type { ComponentProps, ReactNode } from "react";

export function buttonClass(variant: "primary" | "secondary" | "danger" = "primary") {
  return `button button--${variant}`;
}

export function Button({ variant = "primary", className = "", type = "button", ...props }: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "danger" }) {
  return <button type={type} className={`${buttonClass(variant)} ${className}`} {...props} />;
}

export function Card({ className = "", ...props }: ComponentProps<"section">) {
  return <section className={`card ${className}`} {...props} />;
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "danger"; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function Label(props: ComponentProps<"label">) { return <label {...props} className={`field-label ${props.className ?? ""}`} />; }
export function Input(props: ComponentProps<"input">) { return <input {...props} className={`field-control ${props.className ?? ""}`} />; }
export function Textarea(props: ComponentProps<"textarea">) { return <textarea {...props} className={`field-control ${props.className ?? ""}`} />; }
export function Select(props: ComponentProps<"select">) { return <select {...props} className={`field-control ${props.className ?? ""}`} />; }

export function Table({ caption, children }: { caption: string; children: ReactNode }) {
  return <div className="table-scroll" role="region" aria-label={caption} tabIndex={0}><table className="table"><caption className="sr-only">{caption}</caption>{children}</table></div>;
}
