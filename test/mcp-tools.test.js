import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import OperatorDataManager from '../wiki/operator-data-manager.js';
import * as getOperatorTool from '../tools/get_operator.js';
import * as searchOperatorsTool from '../tools/search_operators.js';
import * as listOperatorsTool from '../tools/list_operators.js';
import * as suggestWorkflowTool from '../tools/suggest_workflow.js';
import * as getTutorialTool from '../tools/get_tutorial.js';
import * as listTutorialsTool from '../tools/list_tutorials.js';
import * as getPythonApiTool from '../tools/get_python_api.js';
import * as searchPythonApiTool from '../tools/search_python_api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '..');
const wikiPath = join(repoRoot, 'wiki');

const operatorDataManager = new OperatorDataManager({
  wikiPath,
  dataPath: join(wikiPath, 'data'),
  processedPath: join(wikiPath, 'data', 'processed'),
  searchIndexPath: join(wikiPath, 'data', 'search-index'),
  enablePersistence: true,
  autoIndex: true,
  tdDocsPath: join(wikiPath, 'docs', 'python'),
  progressCallback: null,
  progressInterval: 1000
});

await operatorDataManager.initialize();

const workflowPatterns = JSON.parse(
  await readFile(join(repoRoot, 'data', 'patterns.json'), 'utf-8')
);

const operatorsList = await operatorDataManager.listOperators({ limit: 5 });
const sampleOperatorName = operatorsList.operators?.[0]?.name;
assert.ok(sampleOperatorName, 'Expected at least one operator');

const sampleOperator = await operatorDataManager.getOperator(sampleOperatorName, {
  show_examples: false,
  show_tips: false,
  show_parameters: false
});
const sampleOperatorDisplay = sampleOperator.displayName || sampleOperator.name;

const tutorialList = await operatorDataManager.listTutorials({ limit: 1 });
const sampleTutorial = tutorialList.tutorials?.[0];
const sampleTutorialName = sampleTutorial?.displayName || sampleTutorial?.name;
assert.ok(sampleTutorialName, 'Expected at least one tutorial');

const resolvedTutorial = await operatorDataManager.getTutorial(sampleTutorialName);
assert.ok(resolvedTutorial, 'Expected tutorial lookup');
const sampleTutorialDisplay = resolvedTutorial.displayName || resolvedTutorial.name;

const pythonClassName = Array.from(operatorDataManager.pythonApi.pythonClasses.keys())[0];
assert.ok(pythonClassName, 'Expected at least one Python API class');
const pythonClassEntry = operatorDataManager.pythonApi.pythonClasses.get(pythonClassName);
assert.ok(pythonClassEntry, 'Expected Python API class entry');
const pythonClassDisplay = pythonClassEntry.displayName || pythonClassEntry.className;

const toolContext = { operatorDataManager, workflowPatterns };

test('initializes operator data with tutorials and Python API classes', () => {
  const stats = operatorDataManager.getSystemStats();
  assert.ok(operatorDataManager.entries.size > 0, 'Expected operator entries');
  assert.ok(operatorDataManager.tutorials.size > 0, 'Expected tutorial entries');
  assert.ok(operatorDataManager.pythonApi.pythonClasses.size > 0, 'Expected Python API classes');
  assert.ok(stats.searchStats.totalEntries > 0, 'Expected search index entries');
});

test('get_operator returns formatted operator details', async () => {
  const response = await getOperatorTool.handler(
    { name: sampleOperatorName, show_examples: false, show_tips: false },
    toolContext
  );
  assert.equal(response.content?.[0]?.type, 'text');
  assert.ok(response.content[0].text.startsWith(`# ${sampleOperatorDisplay}`));
});

test('search_operators returns results for a known operator term', async () => {
  const query = sampleOperatorName.split(' ')[0];
  const response = await searchOperatorsTool.handler({ query }, toolContext);
  assert.equal(response.content?.[0]?.type, 'text');
  assert.ok(response.content[0].text.includes(`# Search Results for "${query}"`));
});

test('list_operators respects category filtering', async () => {
  const category = operatorsList.operators[0].category;
  const response = await listOperatorsTool.handler({ category }, toolContext);
  assert.equal(response.content?.[0]?.type, 'text');
  assert.ok(response.content[0].text.includes(`# TouchDesigner Operators`));
  assert.ok(response.content[0].text.includes(`in **${category.toUpperCase()}** category`));
});

test('suggest_workflow returns a formatted response', async () => {
  const response = await suggestWorkflowTool.handler(
    { current_operator: sampleOperatorName },
    toolContext
  );
  assert.equal(response.content?.[0]?.type, 'text');
  assert.ok(
    /Workflow Suggestions for|No workflow suggestions found for/.test(response.content[0].text)
  );
});

test('list_tutorials returns available tutorials', async () => {
  const response = await listTutorialsTool.handler({}, toolContext);
  assert.equal(response.content?.[0]?.type, 'text');
  assert.ok(response.content[0].text.includes('Available TouchDesigner Tutorials'));
});

test('get_tutorial returns formatted tutorial details', async () => {
  const response = await getTutorialTool.handler(
    { name: sampleTutorialDisplay, include_content: false },
    toolContext
  );
  assert.equal(response.content?.[0]?.type, 'text');
  assert.ok(response.content[0].text.startsWith(`# ${sampleTutorialDisplay}`));
});

test('get_python_api returns formatted class documentation', async () => {
  const response = await getPythonApiTool.handler(
    { class_name: pythonClassName, show_members: false, show_methods: false, show_inherited: false },
    toolContext
  );
  assert.equal(response.content?.[0]?.type, 'text');
  assert.ok(response.content[0].text.startsWith(`# ${pythonClassDisplay}`));
});

test('search_python_api returns results for a known class term', async () => {
  const query = pythonClassName.slice(0, 4);
  const response = await searchPythonApiTool.handler({ query }, toolContext);
  assert.equal(response.content?.[0]?.type, 'text');
  assert.ok(response.content[0].text.includes(`# Python API Search Results for "${query}"`));
});
