import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
// The static site intentionally has no package.json; load its ES module explicitly.
const source = await readFile(new URL('../kit/graph-data.js', import.meta.url), 'utf8');
const {prepareGraphData} = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const data = {series: [
  {id: 'baseline', label: 'Trial', points: [{x: 0, y: 0}, {x: 2, y: 4}]},
  {id: 'comparison', label: 'Trial', points: [{x: 0, y: 0}, {x: 10, y: 100}]},
]};
const all = prepareGraphData(data), only = prepareGraphData(data, 'baseline');
assert.deepEqual([only.xmin, only.xmax, only.ymin, only.ymax], [all.xmin, all.xmax, all.ymin, all.ymax]);
assert.equal(only.shown[0].index, all.shown[0].index);
assert.deepEqual(only.points.map(p => p.key), all.series[0].points.map(p => p.key));
assert.notEqual(all.series[0].points[0].key, all.series[1].points[0].key);
assert.equal(all.shown[0].points.length, 2); // Matching labels must not merge series.
assert.equal(prepareGraphData(data, 'missing').filter, '*');
const translated = prepareGraphData({series: data.series.map(s => ({...s, label: 'Prueba'}))});
assert.deepEqual(translated.points.map(p => p.key), all.points.map(p => p.key));
const invalid = prepareGraphData({series: [{id: 'bad', label: '', points: [{x: NaN, y: 1}, {x: 1, y: Infinity}]}]});
assert.equal(invalid.points.length, 0);
assert.deepEqual([invalid.xmin, invalid.xmax, invalid.ymin, invalid.ymax], [0, 1, 0, 1]);
const fixed = prepareGraphData({...data, xMin: 2, xMax: 2, yMin: -5, yMax: 5});
assert.deepEqual([fixed.xmin, fixed.xmax, fixed.ymin, fixed.ymax], [2, 3, -5, 5]);
const many = prepareGraphData({series: [{id: 'large', label: 'Large', points: Array.from({length: 150000}, (_, i) => ({x:i, y:-i}))}]});
assert.equal(many.xmax, 149999);assert.equal(many.ymin, -149999);
console.log('PASS: stable axes, styling, selection identity, duplicate labels, language parity, invalid/empty data, fixed bounds, 150,000-point dataset.');
