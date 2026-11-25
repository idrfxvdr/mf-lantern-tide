// assembly.js - plating logic: the plate is a multiset of (ingredient, state) items.
// Recipes match in any order; a half-built plate never matches.

export function itemSig(it) {
  return `${it.ing}:${it.state}`;
}

export function plateSignature(items) {
  return (items || []).map(itemSig).sort().join('|');
}

export function recipeSignature(steps) {
  return (steps || []).map(itemSig).sort().join('|');
}

// Exact multiset match: same number of items and same ingredient:state pairs.
export function matchesRecipe(steps, plate) {
  if (!plate || plate.length !== (steps || []).length) return false;
  return plateSignature(plate) === recipeSignature(steps);
}

export function addToPlate(plate, item, max = 5) {
  if (!plate || plate.length >= max) return false;
  plate.push({ ...item });
  return true;
}

export function removeFromPlate(plate) {
  if (!plate || !plate.length) return null;
  return plate.pop();
}

export function clearPlate(plate) {
  if (plate) plate.length = 0;
}