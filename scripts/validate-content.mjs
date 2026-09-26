import { canonicalExercises } from "../lib/knowledge/all-exercises.ts";
import { goodrichExerciseReferences } from "../lib/knowledge/goodrich-workbook.ts";
import { syllabusTracks } from "../lib/knowledge/syllabus.ts";
import { primaryLearnerJourneys } from "../lib/navigation/primary-journeys.ts";
import { atlasPatterns } from "../lib/practice/atlas-recognition.ts";

const errors = [];

function requireText(value, label) {
  if (typeof value !== "string" || !value.trim()) errors.push(`${label} must be non-empty text.`);
}

function requireUnique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) errors.push(`${label} contains duplicate id: ${value}`);
    seen.add(value);
  }
}

function requireTextList(values, label) {
  if (!Array.isArray(values) || !values.length) {
    errors.push(`${label} must contain at least one item.`);
    return;
  }
  values.forEach((value, index) => requireText(value, `${label}[${index}]`));
}

requireUnique(syllabusTracks.map((track) => track.id), "syllabus tracks");
const syllabusModules = syllabusTracks.flatMap((track) => track.modules);
requireUnique(syllabusModules.map((module) => module.id), "syllabus modules");

for (const track of syllabusTracks) {
  requireText(track.id, "syllabus track id");
  requireText(track.number, `syllabus track ${track.id} number`);
  requireText(track.title, `syllabus track ${track.id} title`);
  requireText(track.purpose, `syllabus track ${track.id} purpose`);
  if (!track.modules.length) errors.push(`syllabus track ${track.id} must contain modules.`);

  for (const module of track.modules) {
    requireText(module.id, `syllabus module id in ${track.id}`);
    requireText(module.title, `syllabus module ${module.id} title`);
    requireText(module.question, `syllabus module ${module.id} question`);
    requireTextList(module.outcomes, `syllabus module ${module.id} outcomes`);
    requireTextList(module.topics, `syllabus module ${module.id} topics`);
    requireTextList(module.sources, `syllabus module ${module.id} sources`);
    if (module.route && !module.route.startsWith("/")) {
      errors.push(`syllabus module ${module.id} route must be an internal absolute path.`);
    }
  }
}

requireUnique(canonicalExercises.map((exercise) => exercise.id), "canonical exercises");
for (const exercise of canonicalExercises) {
  requireText(exercise.id, "canonical exercise id");
  requireText(exercise.title, `canonical exercise ${exercise.id} title`);
  requireText(exercise.source, `canonical exercise ${exercise.id} source`);
  requireText(exercise.sourceChapter, `canonical exercise ${exercise.id} source chapter`);
  requireText(exercise.domain, `canonical exercise ${exercise.id} domain`);
  requireText(exercise.kind, `canonical exercise ${exercise.id} kind`);
  requireText(exercise.level, `canonical exercise ${exercise.id} level`);
  requireText(exercise.lens, `canonical exercise ${exercise.id} structural lens`);
  requireTextList(exercise.tags, `canonical exercise ${exercise.id} tags`);
  if (exercise.route && !exercise.route.startsWith("/")) {
    errors.push(`canonical exercise ${exercise.id} route must be an internal absolute path.`);
  }
}

requireUnique(goodrichExerciseReferences.map((exercise) => exercise.id), "Goodrich exercise ids");
requireUnique(goodrichExerciseReferences.map((exercise) => exercise.sourceId), "Goodrich source ids");
for (const exercise of goodrichExerciseReferences) {
  requireText(exercise.id, "Goodrich exercise id");
  requireText(exercise.sourceId, `Goodrich exercise ${exercise.id} source id`);
  requireText(exercise.chapterTitle, `Goodrich exercise ${exercise.id} chapter title`);
  if (!Number.isInteger(exercise.chapter) || exercise.chapter < 1) errors.push(`Goodrich exercise ${exercise.id} has invalid chapter.`);
  if (!Number.isInteger(exercise.number) || exercise.number < 1) errors.push(`Goodrich exercise ${exercise.id} has invalid number.`);
}

requireUnique(atlasPatterns.map((pattern) => pattern.id), "Atlas pattern ids");
for (const pattern of atlasPatterns) {
  requireText(pattern.id, "Atlas pattern id");
  requireText(pattern.label, `Atlas pattern ${pattern.id} label`);
  requireText(pattern.clue, `Atlas pattern ${pattern.id} clue`);
  requireText(pattern.firstQuestion, `Atlas pattern ${pattern.id} first question`);
  requireTextList(pattern.terms, `Atlas pattern ${pattern.id} terms`);
}

requireUnique(primaryLearnerJourneys.map((journey) => journey.id), "primary learner journeys");
for (const journey of primaryLearnerJourneys) {
  requireText(journey.id, "primary learner journey id");
  requireText(journey.label, `primary learner journey ${journey.id} label`);
  if (journey.routes.length < 2) errors.push(`primary learner journey ${journey.id} requires at least two route steps.`);
  for (const route of journey.routes) {
    if (!route.startsWith("/")) errors.push(`primary learner journey ${journey.id} contains non-internal route: ${route}`);
  }
}

if (errors.length) {
  console.error(`Content validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Content schemas valid: ${syllabusTracks.length} tracks, ${syllabusModules.length} modules, `
  + `${canonicalExercises.length} canonical exercises, ${goodrichExerciseReferences.length} Goodrich references, `
  + `${atlasPatterns.length} structural families, ${primaryLearnerJourneys.length} primary journeys.`,
);
