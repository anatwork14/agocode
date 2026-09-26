import type {
  StackRendererContract,
  StackRendererItem,
} from "@/lib/visualization/renderer-contracts";

export type { StackRendererItem };

type StackRendererProps = StackRendererContract;

export function StackRenderer({
  items,
  ariaLabel,
  emptyLabel = "stack empty",
  topFirst = true,
}: StackRendererProps) {
  const visibleItems = topFirst ? [...items].reverse() : [...items];

  return (
    <div className="factorial-stack" role="group" aria-label={ariaLabel}>
      {visibleItems.length ? (
        visibleItems.map((item) => (
          <div
            className={`factorial-frame ${item.state ? `factorial-frame--${item.state}` : ""}`}
            key={item.id}
          >
            <div>
              <span className="mono">{item.title}</span>
              {item.state ? <strong>{item.state}</strong> : null}
            </div>
            {item.detail ? <span className="factorial-frame__local">{item.detail}</span> : null}
          </div>
        ))
      ) : (
        <div className="selection-empty">{emptyLabel}</div>
      )}
    </div>
  );
}
