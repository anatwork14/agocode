import type { ReactNode } from "react";

type LabHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  meta?: ReactNode;
  className?: string;
};

export function LabHeader({
  eyebrow,
  title,
  meta,
  className = "lab-panel__header",
}: LabHeaderProps) {
  return (
    <div className={className}>
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h3>{title}</h3>
      </div>
      {meta ? <div>{meta}</div> : null}
    </div>
  );
}

type Metric = {
  label: string;
  value: ReactNode;
};

export function MetricStrip({ metrics }: { metrics: readonly Metric[] }) {
  return (
    <dl className="lab-status">
      {metrics.map((metric) => (
        <div key={metric.label}>
          <dt>{metric.label}</dt>
          <dd>{metric.value}</dd>
        </div>
      ))}
    </dl>
  );
}
