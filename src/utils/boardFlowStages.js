// Lays QrReaderV2 readers out into left-to-right stages based on the flow
// graph (each reader's previousReaders), so the whole process is visible at
// once instead of a flat, context-free list of station names. A reader with
// more than one previousReader (a convergence point, e.g. a PCB line fed by
// two SMD lines) lands one stage after the deepest of its predecessors.
export function buildStages(readers) {
  const byId = {};
  readers.forEach((r) => (byId[r.id] = r));

  const depthCache = {};
  const depthOf = (reader, guard = new Set()) => {
    if (depthCache[reader.id] !== undefined) return depthCache[reader.id];
    if (!reader.previousReaders || reader.previousReaders.length === 0) {
      depthCache[reader.id] = 0;
      return 0;
    }
    if (guard.has(reader.id)) return 0; // defend against unexpected cycles
    guard.add(reader.id);

    const depths = reader.previousReaders.map((p) => {
      const prev = byId[p.id];
      return prev ? depthOf(prev, guard) + 1 : 0;
    });
    const depth = Math.max(...depths);
    depthCache[reader.id] = depth;
    return depth;
  };

  const stages = {};
  readers.forEach((r) => {
    const depth = depthOf(r);
    if (!stages[depth]) stages[depth] = [];
    stages[depth].push(r);
  });

  Object.values(stages).forEach((list) =>
    list.sort((a, b) => {
      const lineA = a.line ? a.line.name : "";
      const lineB = b.line ? b.line.name : "";
      return lineA === lineB
        ? a.position - b.position
        : lineA.localeCompare(lineB);
    })
  );

  return Object.keys(stages)
    .sort((a, b) => Number(a) - Number(b))
    .map((depth) => stages[depth]);
}

// A reader is terminal (nothing comes after it in the graph) if no other
// reader lists it as a previousReader.
export function terminalReaderIds(readers) {
  const referenced = new Set();
  readers.forEach((r) =>
    (r.previousReaders || []).forEach((p) => referenced.add(p.id))
  );
  return new Set(readers.filter((r) => !referenced.has(r.id)).map((r) => r.id));
}
