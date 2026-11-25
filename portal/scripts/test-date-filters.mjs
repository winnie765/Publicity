import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {testCompiler} from './test-support/compiler.mjs';
const load=testCompiler('.sites-runtime/date-filter-regressions');
const {parseFilterDate,validateFilterDates,presetFilterDates}=await load('app/date-filter-utils.ts');
assert.equal(parseFilterDate('01/01/2026'),'2026-01-01');
assert.equal(parseFilterDate('2026-12-31'),'2026-12-31');
assert.equal(parseFilterDate(' 29/02/2024 '),'2024-02-29');
for(const input of ['1 Sep 2025','01 September 2025','1 sept. 2025','1 SEP 2025'])assert.equal(parseFilterDate(input),'2025-09-01');
assert.equal(parseFilterDate('29 Feb 2024'),'2024-02-29');
for(const input of ['29 Feb 2026','31 Apr 2026','1 Unknown 2026'])assert.equal(parseFilterDate(input),null);
for(const value of ['29/02/2026','31/04/2026','2026-13-01','2026-00-01','2026-01-00','12/31/2026','1/1/2026','garbage','2026-01-01T12:00:00','1800-01-01'])assert.equal(parseFilterDate(value),null,value);
assert.equal(parseFilterDate(''),'');
assert(validateFilterDates('2026-12-31','01/01/2026').includes('Start Date'));
assert.equal(validateFilterDates('01/01/2026','2026-01-01'),'');
assert.equal(validateFilterDates('','2026-01-01'),'');
assert(validateFilterDates('31/02/2026','').includes('valid Start Date'));
assert(validateFilterDates('','31/02/2026').includes('valid End Date'));
const now=new Date('2026-10-14T16:30:00Z'); // Already 15 October in Singapore.
const expected={'This Month':['2026-10-01','2026-10-15'],'This Year':['2026-01-01','2026-10-15']};
for(const [preset,range] of Object.entries(expected))assert.deepEqual(presetFilterDates(preset,now),range,preset);
assert.equal(presetFilterDates('Custom Range',now),null);

const {DateRangePicker}=await load('app/date-picker.tsx');
const html=renderToStaticMarkup(React.createElement(DateRangePicker,{start:'2026-01-01',end:'2026-12-31',onChange:()=>{}}));
assert.equal((html.match(/type="text"/g)||[]).length,2);
for(const text of ['Start Date','End Date','01/01/2026','31/12/2026','Open Start Date calendar','Open End Date calendar','Custom Range'])assert(html.includes(text),text);
assert(!html.includes('Select date range'));
assert(html.indexOf('date-quick-section')>html.indexOf('Open End Date calendar'));
assert(!html.includes('aria-label="Active date range"'));

assert(html.includes('Date Range'));assert(html.includes('Quick Filter'));
assert.equal((html.match(/role="combobox"/g)||[]).length,1);
assert(html.includes('Custom Range'));
assert.equal((await load('app/date-filter-utils.ts')).datePresets.length,3);
assert(!html.includes('aria-pressed='));
console.log('PASS: independent date inputs, calendar controls, strict date parsing, invalid and reversed range validation, leap years, current presets, year boundaries and Singapore timezone.');
