// lib/burnout.ts
// Frontend utility for burnout category display

export function get_burnout_category(score: number) {
  if (score < 25) return { level: 'low', label: 'Doing Well 🌱', color: 'emerald' }
  if (score < 50) return { level: 'moderate', label: 'Some Strain 🌤️', color: 'amber' }
  if (score < 75) return { level: 'high', label: 'High Stress ⚠️', color: 'orange' }
  return { level: 'critical', label: 'Burnout Risk 🔴', color: 'red' }
}
