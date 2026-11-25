// recipes.js - 8 original ingredients and 8 original recipes for Lantern Tide.
// A recipe is a multiset of (ingredient, state) steps; the plate may be assembled in any order.

export const INGREDIENTS = {
  rice:     { name: 'Rice',     color: '#FFF6E5', accent: '#c7c2b6' },
  fish:     { name: 'Fish',     color: '#a8d8ea', accent: '#7ab8cc' },
  shrimp:   { name: 'Shrimp',   color: '#ffb7b2', accent: '#e8908a' },
  cabbage:  { name: 'Cabbage',  color: '#82c98a', accent: '#5ba868' },
  tofu:     { name: 'Tofu',     color: '#fffbe6', accent: '#e8dfc0' },
  egg:      { name: 'Egg',      color: '#ffe066', accent: '#ddc040' },
  mushroom: { name: 'Mushroom', color: '#c9a96e', accent: '#a8844a' },
  nori:     { name: 'Nori',     color: '#2d5a27', accent: '#1a3a18' },
};

// States: raw, chopped, fried, steamed, burned
export const STATES = ['raw', 'chopped', 'fried', 'steamed', 'burned'];

export const RECIPES = [
  {
    id: 'tide_rice',
    name: 'Tide Rice',
    points: 30,
    steps: [{ ing: 'rice', state: 'steamed' }],
  },
  {
    id: 'reef_platter',
    name: 'Reef Platter',
    points: 50,
    steps: [{ ing: 'fish', state: 'chopped' }, { ing: 'rice', state: 'steamed' }],
  },
  {
    id: 'lantern_shrimp',
    name: 'Lantern Shrimp',
    points: 40,
    steps: [{ ing: 'shrimp', state: 'chopped' }, { ing: 'shrimp', state: 'steamed' }],
  },
  {
    id: 'market_greens',
    name: 'Market Greens',
    points: 35,
    steps: [{ ing: 'cabbage', state: 'chopped' }, { ing: 'mushroom', state: 'chopped' }],
  },
  {
    id: 'cloud_tofu',
    name: 'Cloud Tofu',
    points: 45,
    steps: [{ ing: 'tofu', state: 'chopped' }, { ing: 'egg', state: 'fried' }],
  },
  {
    id: 'night_roll',
    name: 'Night Roll',
    points: 60,
    steps: [{ ing: 'fish', state: 'chopped' }, { ing: 'rice', state: 'steamed' }, { ing: 'nori', state: 'raw' }],
  },
  {
    id: 'ember_bowl',
    name: 'Ember Bowl',
    points: 55,
    steps: [{ ing: 'shrimp', state: 'fried' }, { ing: 'tofu', state: 'fried' }, { ing: 'rice', state: 'steamed' }],
  },
  {
    id: 'harbor_miso',
    name: 'Harbor Miso',
    points: 40,
    steps: [{ ing: 'tofu', state: 'chopped' }, { ing: 'nori', state: 'raw' }, { ing: 'egg', state: 'fried' }],
  },
];

export const RECIPE_MAP = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

// Valid state transitions for the pan / steamer.
export function canTransition(fromState, toState) {
  if (fromState === 'burned') return false;
  if (fromState === toState) return true;
  if (fromState === 'raw' && (toState === 'chopped' || toState === 'fried' || toState === 'steamed')) return true;
  if (fromState === 'chopped' && (toState === 'fried' || toState === 'steamed')) return true;
  if ((fromState === 'fried' || fromState === 'steamed') && toState === 'burned') return true;
  return false;
}

export function nextState(state) {
  if (state === 'raw') return 'chopped';
  if (state === 'chopped') return 'fried';
  return 'burned';
}