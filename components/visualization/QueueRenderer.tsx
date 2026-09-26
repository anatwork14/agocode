import type {
  QueueRendererContract,
  QueueRendererItem,
} from "@/lib/visualization/renderer-contracts";

export type { QueueRendererItem };

type QueueRendererProps = QueueRendererContract;

export function QueueRenderer({ items, ariaLabel, emptyLabel = "queue empty" }: QueueRendererProps) {
  return (
    <div className="queue-renderer" role="group" aria-label={ariaLabel}>
      <div className="queue-renderer__labels" aria-hidden="true">
        <span>front · dequeue</span>
        <span>enqueue · back</span>
      </div>
      <div className="queue-renderer__track">
        {items.length ? items.map((item, index) => (
          <div
            className={`queue-renderer__item ${item.state ? `queue-renderer__item--${item.state}` : ""}`}
            key={item.id}
          >
            <span className="mono">{item.label}</span>
            {item.detail ? <small>{item.detail}</small> : null}
            {index === 0 ? <em>next</em> : null}
          </div>
        )) : <div className="queue-renderer__empty">{emptyLabel}</div>}
      </div>
    </div>
  );
}
