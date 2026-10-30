// Keep comparison geometry and identity independent of the visible filter.
export function prepareGraphData(data, filter = '*') {
  const series = data.series.map((s, index) => ({
    ...s, index,
    points: s.points.flatMap((p, pointIndex) => Number.isFinite(p.x) && Number.isFinite(p.y)
      ? [{...p, series: s.label, seriesId: s.id, key: `${encodeURIComponent(s.id)}:${pointIndex}`}]
      : []),
  })).filter(s => s.points.length);
  const activeFilter = filter === '*' || series.some(s => s.id === filter) ? filter : '*';
  const shown = series.filter(s => activeFilter === '*' || s.id === activeFilter);
  // Reduce rather than spreading large arrays into Math.min/max.
  const bounds = series.flatMap(s => s.points).reduce((b, p) => ({
    xmin: Math.min(b.xmin, p.x), xmax: Math.max(b.xmax, p.x),
    ymin: Math.min(b.ymin, p.y), ymax: Math.max(b.ymax, p.y),
  }), {xmin: 0, xmax: 1, ymin: 0, ymax: 1});
  const xmin = data.xMin ?? bounds.xmin, ymin = data.yMin ?? bounds.ymin;
  let xmax = data.xMax ?? bounds.xmax, ymax = data.yMax ?? bounds.ymax;
  if (xmax === xmin) xmax = xmin + 1;
  if (ymax === ymin) ymax = ymin + 1;
  return {series, shown, points: shown.flatMap(s => s.points), filter: activeFilter, xmin, xmax, ymin, ymax};
}
