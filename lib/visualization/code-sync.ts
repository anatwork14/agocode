export type SemanticCodeLine<LineId extends string = string> = {
  id: LineId;
  text: string;
};

export function codeLineNumberForId<LineId extends string>(
  lines: readonly SemanticCodeLine<LineId>[],
  id: LineId,
) {
  const index = lines.findIndex((line) => line.id === id);
  return index >= 0 ? index + 1 : null;
}

export function validateSemanticCodeLines<LineId extends string>(
  lines: readonly SemanticCodeLine<LineId>[],
  activeIds: readonly LineId[],
) {
  const errors: string[] = [];
  const ids = new Set<LineId>();

  for (const line of lines) {
    if (!line.id.trim()) errors.push("Code lines require a non-empty semantic id.");
    if (ids.has(line.id)) errors.push(`Duplicate semantic code-line id: ${line.id}`);
    ids.add(line.id);
  }

  for (const id of new Set(activeIds)) {
    if (!ids.has(id)) errors.push(`Trace references unknown semantic code-line id: ${id}`);
  }

  return errors;
}
