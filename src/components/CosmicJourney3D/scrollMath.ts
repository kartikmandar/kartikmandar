export interface Range { start: number; end: number }

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export function cumulativeRanges(lengths: number[]): Range[] {
  const total = lengths.reduce((a, b) => a + b, 0) || 1
  const ranges: Range[] = []
  let acc = 0
  for (const len of lengths) {
    const start = acc / total
    acc += len
    ranges.push({ start, end: acc / total })
  }
  // guard the last end against floating drift
  if (ranges.length) ranges[ranges.length - 1].end = 1
  return ranges
}

export function locate(progress: number, ranges: Range[]): { index: number; local: number } {
  const p = clamp01(progress)
  for (let i = 0; i < ranges.length; i++) {
    const { start, end } = ranges[i]
    if (p < end || i === ranges.length - 1) {
      const span = end - start || 1
      return { index: i, local: clamp01((p - start) / span) }
    }
  }
  return { index: 0, local: 0 }
}

export function chapterOffset(index: number, ranges: Range[]): number {
  return ranges[index]?.start ?? 0
}
