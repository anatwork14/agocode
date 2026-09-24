"use client";

import { useState } from "react";

type Operation = "read" | "insert" | "delete";

const operations: Record<Operation, {
  label: string;
  prompt: string;
  arrayCost: string;
  listCost: string;
  arrayExplanation: string;
  listExplanation: string;
}> = {
  read: {
    label: "Read item #4",
    prompt: "You know which position you want. Which structure reaches it with less traversal?",
    arrayCost: "O(1)",
    listCost: "O(n)",
    arrayExplanation: "Contiguous storage lets the address be calculated directly from the starting address and index.",
    listExplanation: "A linked list must follow next pointers from the head until it reaches the requested position.",
  },
  insert: {
    label: "Insert in the middle",
    prompt: "The insertion position is already known. Which structure changes less existing data?",
    arrayCost: "O(n)",
    listCost: "O(1)*",
    arrayExplanation: "Array elements after the insertion point may need to shift, and a full relocation may be required if capacity is exhausted.",
    listExplanation: "With a pointer to the previous node already in hand, insertion only rewires a small number of links.",
  },
  delete: {
    label: "Delete from the middle",
    prompt: "The deletion position is already known. Which structure avoids shifting the tail?",
    arrayCost: "O(n)",
    listCost: "O(1)*",
    arrayExplanation: "Removing an array element can require shifting later elements so the logical sequence remains contiguous.",
    listExplanation: "With the relevant node location already known, deletion can bypass that node by changing links.",
  },
};

export function ArrayListTradeoffLab() {
  const [operation, setOperation] = useState<Operation>("read");
  const current = operations[operation];

  return (
    <div className="structure-lab">
      <div className="structure-lab__controls" aria-label="Choose an operation to compare">
        {(Object.keys(operations) as Operation[]).map((key) => (
          <button
            className={`button ${operation === key ? "button--primary" : ""}`}
            type="button"
            key={key}
            onClick={() => setOperation(key)}
            aria-pressed={operation === key}
          >
            {operations[key].label}
          </button>
        ))}
      </div>

      <p className="structure-lab__prompt">{current.prompt}</p>

      <div className="structure-compare">
        <section>
          <div className="eyebrow">Array · contiguous</div>
          <div className="array-memory-strip" aria-label="Array values stored contiguously">
            {["A", "B", "C", "D", "E"].map((value, index) => (
              <div className={operation === "read" && index === 3 ? "array-memory-cell array-memory-cell--active" : "array-memory-cell"} key={value}>
                <span className="mono">{index}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="structure-cost">
            <strong className="mono">{current.arrayCost}</strong>
            <p>{current.arrayExplanation}</p>
          </div>
        </section>

        <section>
          <div className="eyebrow">Linked list · scattered</div>
          <div className="linked-memory-strip" aria-label="Linked list nodes at scattered addresses">
            {[
              ["0x14", "A"],
              ["0x61", "B"],
              ["0x2C", "C"],
              ["0x90", "D"],
              ["0x37", "E"],
            ].map(([address, value], index, nodes) => (
              <div className="linked-node-wrap" key={address}>
                <div className={operation === "read" && index <= 3 ? "linked-node linked-node--visited" : "linked-node"}>
                  <span className="mono">{address}</span>
                  <strong>{value}</strong>
                </div>
                {index < nodes.length - 1 ? <span className="linked-arrow" aria-hidden="true">→</span> : null}
              </div>
            ))}
          </div>
          <div className="structure-cost">
            <strong className="mono">{current.listCost}</strong>
            <p>{current.listExplanation}</p>
          </div>
        </section>
      </div>

      <p className="structure-footnote">
        * Linked-list insertion/deletion is constant-time only after the relevant node or predecessor has already been located. Finding that position can still require a linear traversal.
      </p>
    </div>
  );
}
