import fs from 'node:fs';
import ts from 'typescript';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function compile(file,dependencies={}){
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,module={exports:{}};
 new Function('require','module','exports',js)(name=>dependencies[name]||require(name),module,module.exports);
 return module.exports;
}
const helper=compile('lib/ui-text.ts'),{withoutEmoji}=helper;
const symbols=['\u{1F4C8}','\u2728','\u2699\uFE0F','\u{1F44D}\u{1F3FD}','\u{1F469}\u200D\u{1F4BB}','\u{1F1F8}\u{1F1EC}','1\uFE0F\u20E3','\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}'];
for(const emoji of symbols)assert.equal(withoutEmoji(emoji+' Growth Insight'),'Growth Insight');
const ordinary='GLOW / SEEN | 1,234 followers (+41.6%)\n\u5C0A\u91CD\u3001\u611F\u6069\u3001\u7231\n#ActiveAgeing @seen 09:30 © 2026 ® ™';
assert.equal(withoutEmoji(ordinary),ordinary);
const labels=compile('app/display-labels.ts',{'../lib/ui-text':helper});
assert.equal(labels.displayText('\u{1F3C6} Unclassified'),'Not specified');
assert.equal(labels.executiveInsight({title:'\u{1F4C8} Growth',finding:'\u{1F525} Observed pattern',explanation:'\u{1F4A1} Why it matters',recommendation:'\u{1F3AF} Review next steps'}).action,'Review next steps');
const writing=compile('lib/content-writing.ts',{'./ui-text':helper}),studio=compile('lib/content-studio.ts',{'./ui-text':helper});
const output=Object.fromEntries(['facebook','instagram','workvivo'].map(name=>[name,{english:'\u{1F499} Community story',chinese:'\u{1F499} \u793E\u533A\u6545\u4E8B',combined:'\u{1F499} Community story\n\u793E\u533A\u6545\u4E8B',hashtags:['#Community']}])) ;
assert.equal(writing.validateWriting(output).facebook.english,'Community story');
assert.ok(output.facebook.english.startsWith('\u{1F499}'),'Input records remain untouched');
assert.equal(studio.validateStudio({title:'\u{1F4A1} Draft',draft:'\u{1F499} Story'}).draft,'Story');
assert.throws(()=>studio.validateStudio({title:'\u{1F4A1}',draft:'\u{1F499}'}));
const {validateReport}=compile('lib/intelligence/provider.ts',{'../ui-text':helper,'./types':compile('lib/intelligence/types.ts')});
const pack={scope:'social',filters:{},facts:[{id:'F1'}]},report={summary:{text:'\u{1F4A1} Recorded pattern.',evidenceIds:['F1']},insights:[{title:'\u{1F4C8} Growth',finding:'\u{1F525} A recorded pattern.',explanation:'\u{1F4A1} A hypothesis to review.',recommendation:'\u{1F3AF} Review comparable content.',category:'growth',confidenceLevel:'Low',confidenceReason:'Limited coverage.',evidenceIds:['F1']}],limitations:['Observational evidence.']};
assert.equal(validateReport(report,pack).insights[0].finding,'A recorded pattern.');
for(const root of ['app','components','lib'])for(const file of fs.readdirSync(root,{recursive:true}).filter(file=>/\.(tsx?|css)$/.test(file))){const text=fs.readFileSync(root+'/'+file,'utf8');assert.ok(!/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F]/u.test(text),'Emoji character found in '+root+'/'+file);}
console.log('PASS: UI source scan; emoji sequences, flags, modifiers and keycaps; preserved bilingual text and metrics; AI writing and insights; unchanged inputs. No live AI calls.');
