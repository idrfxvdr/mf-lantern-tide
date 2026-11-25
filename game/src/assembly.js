// Assembly: check if plate contents match a recipe
import { RECIPE_MAP, INGREDIENTS } from './recipes.js';

export function checkAssembly(plate, recipeId) {
  const recipe = RECIPE_MAP[recipeId];
  if (!recipe) return null;
  return matchSteps(recipe.steps, plate);
}

export function matchSteps(steps, plate) {
  if (!plate || plate.length === 0) return null;
  const plateSet = plate.map(p => `${p.ing}:${p.state}`);
  const stepSet = steps.map(s => `${s.ing}:${s.state}`);

  // Perfect match
  if (plateSet.length === stepSet.length && plateSet.every((s, i) => s === stepSet[i] || plateSet.includes(stepSet[i]))) {
    // Sort comparison
    const s1 = [...plateSet].sort().join('|');
    const s2 = [...stepSet].sort().join('|');
    if (s1 === s2) return 'perfect';
  }

  // Partial match: check coverage
  let matched = 0;
  for (const step of steps) {
    const key = `${step.ing}:${step.state}`;
    if (plateSet.includes(key)) matched++;
  }
  if (matched === stepSet.length) return 'perfect';
  if (matched >= stepSet.length * 0.6) return 'partial';
  return null;
}

export function getAssemblyProgress(plate, recipe) {
  if (!plate || plate.length === 0) return 0;
  if (!recipe) return 0;
  const steps = recipe.steps;
  let matched = 0;
  const plateSet = plate.map(p => `${p.ing}:${p.state}`);
  for (const step of steps) {
    if (plateSet.includes(`${step.ing}:${step.state}`)) matched++;
  }
  return matched / steps.length;
}

export function autoServe(station, orderManager, score, particles) {
  const plate = station.contents;
  if (!plate || plate.length === 0) return null;

  const result = orderManager.checkServe(plate);
  if (result) {
    station.contents = [];
    score.addPoints(result.points, result.order.recipe.name);
    particles.emitServe(station.x, station.y);
    return result;
  }
  return null;
}
