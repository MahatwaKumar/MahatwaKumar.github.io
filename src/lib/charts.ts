// Chart definitions built at build time from the bundle CSVs (copied into src/data/<slug>/).
// Each chart also carries the table shown by its "View data" toggle.
import { parseCsv, num, round } from './csv';

import f1Results from '../data/f1-car-aerodynamics-cfd/cfd_results_run1_vs_v4.csv?raw';
import f1V4 from '../data/f1-car-aerodynamics-cfd/cfd_v4_component_breakdown.csv?raw';
import f1V3 from '../data/f1-car-aerodynamics-cfd/cfd_v3_component_breakdown_old_floor.csv?raw';
import f1Hist from '../data/f1-car-aerodynamics-cfd/cfd_v4_force_history.csv?raw';
import evSweep from '../data/ev-aerodynamics-range/phase4_sweep.csv?raw';
import evRank from '../data/ev-aerodynamics-range/phase5_ranking.csv?raw';
import evMesh from '../data/ev-aerodynamics-range/phase3_mesh_independence.csv?raw';
import ltLoss from '../data/f1-dirty-air-lap-time-model/model_mean_loss_curves.csv?raw';
import ltDev from '../data/f1-dirty-air-lap-time-model/model_development_scores.csv?raw';
import ltStall from '../data/f1-dirty-air-lap-time-model/model_stall_forecast_test.csv?raw';
import ltBase from '../data/f1-dirty-air-lap-time-model/model_baselines_earlier_version.csv?raw';
import icTorque from '../data/iris-claw/joint_torques.csv?raw';
import icMass from '../data/iris-claw/mass_summary.csv?raw';
import exTorque from '../data/gesture-exosuit/elbow_torque_vs_angle.csv?raw';
import r27Set from '../data/f1-2027-rules-optimal-car/optimal-2027-car-settings_simulated.csv?raw';
import r27Team from '../data/f1-2027-rules-optimal-car/team-gaps_simulated-vs-measured.csv?raw';
import exFree from '../data/gesture-exosuit/verification_freefall_convergence.csv?raw';

export type Point = { x: number; y: number };
export interface Dataset {
  label: string;
  data: (number | null)[] | Point[];
  color: 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6';
  dashed?: boolean;
  type?: 'line' | 'bar' | 'scatter';
  showLine?: boolean;
  pointRadius?: number;
  order?: number;
}
export interface ChartSpec {
  kind: 'bar' | 'line' | 'scatter';
  horizontal?: boolean;
  labels?: string[];
  datasets: Dataset[];
  xLabel: string;
  yLabel: string;
  unit: string;          // appended to tooltip values
  xUnit?: string;
  logX?: boolean;
  logY?: boolean;
  yMin?: number;
  yMax?: number;
  xMin?: number;
  refLine?: { value: number; label: string; axis: 'x' | 'y' };
  decimals?: number;
  height?: number;
  table: { head: string[]; rows: (string | number)[][] };
  source: string;        // bundle file the numbers come from
}

const nice = (s: string) => s.replace(/_/g, ' ');
const pick = <T,>(rows: T[], every: number) => rows.filter((_, i) => i % every === 0);

/* ---------------------------------- F1 CFD ---------------------------------- */
const f1r = Object.fromEntries(parseCsv(f1Results).map((r) => [Object.values(r)[0], r]));
const f1rv = (k: string, col: 'run1' | 'v4') => num(f1r[k][col]);

const v3 = parseCsv(f1V3); const v4 = parseCsv(f1V4);
const g = (rows: typeof v3, name: string) => num(rows.find((r) => r.component === name)?.downforce_N);
const compRows: [string, number, number][] = [
  ['Front wing', g(v3, 'front wing'), g(v4, 'front wing')],
  ['Floor / tunnel underside', g(v3, 'floor/tunnel underside (z < 0.30 m)'), g(v4, 'floor/tunnel underside (z < 0.30 m)')],
  ['Rear wing (main, flap, endplates)', g(v3, 'rear wing main + flap + endplates'), g(v4, 'rear wing main + flap + endplates')],
  ['Beam wing, pylon, crash structure', g(v3, 'beam wing, pylon, crash structure'), g(v4, 'beam wing, pylon, crash structure')],
  ['Wheels and brake ducts', round(g(v3, 'front wheels + ducts') + g(v3, 'rear wheels + ducts'), 1), round(g(v4, 'rotating wheels (total minus car body; split front/rear unknown)') + g(v4, 'front brake ducts') + g(v4, 'rear brake ducts'), 1)],
  ['Body, sidepods, floor top, halo, arms', g(v3, 'everything else (body, sidepods, floor top, halo, arms)'), g(v4, 'everything else (body, sidepods, floor top, halo, arms)')],
];
const hist = parseCsv(f1Hist);

/* ------------------------------- EV aero/range ------------------------------ */
const evLabels: Record<string, string> = {
  combined_best: 'All winning changes combined', diffuser_5deg: 'Smooth floor + 5° diffuser', diffuser_10deg: 'Smooth floor + 10° diffuser',
  underbody_smooth: 'Smooth floor only', wheels_covered: 'Wheel covers', ride_height_low: 'Ride height −30 mm', camera_pods: 'Camera pods instead of mirrors',
  arch_gap_small: 'Smaller wheel-arch gap', boat_tail_12deg: 'Boat tail 12° (sides)', boat_tail_8deg: 'Boat tail 8° (sides)', ride_height_high: 'Ride height +30 mm',
};
const sweep = parseCsv(evSweep);
const coarse = sweep.filter((r) => r.level === 'coarse' && r.config !== 'baseline');
const med = (c: string) => { const r = sweep.find((s) => s.level === 'medium' && s.config === c); return r ? round(num(r.d_cda_pct), 1) : null; };
const rank = parseCsv(evRank).filter((r) => r.config);
const meshRows = parseCsv(evMesh);
const cda = meshRows.find((r) => r.quantity === 'cda_m2')!;

/* ------------------------------- Lap-time model ----------------------------- */
const loss = parseCsv(ltLoss);
const dev = parseCsv(ltDev).sort((a, b) => num(b.S_skill) - num(a.S_skill));
const stall = parseCsv(ltStall);
const bases = parseCsv(ltBase);

/* ------------------------------ Iris / Exosuit ------------------------------ */
const tq = parseCsv(icTorque);
const mass = parseCsv(icMass).filter((r) => !/^(ALL|COMPONENT)/.test(r.group));
const ext = parseCsv(exTorque);
const exf = parseCsv(exFree);

/* ------------------------- F1 2027 rules: optimal car ------------------------- */
const r27s = parseCsv(r27Set).reverse();
const r27t = parseCsv(r27Team);

export const charts: Record<string, ChartSpec> = {
  'r27-wing': {
    kind: 'bar', horizontal: true, labels: r27s.map((r) => r.circuit), xLabel: 'Downforce level run (package + trim, simulated)', yLabel: '', unit: '', decimals: 2, height: 520, xMin: 0.7,
    refLine: { value: 1.05, label: 'deepest legal 2027 rear wing', axis: 'x' },
    datasets: [{ label: 'Downforce level (simulated optimum)', color: 'c1', data: r27s.map((r) => num(r.downforce_level_run)) }],
    table: { head: ['Circuit', 'Package', 'Downforce level', 'Deploy below (km/h)', 'Super-clip before braking (m)', 'Race lap (s, simulated)'], rows: r27s.slice().reverse().map((r) => [r.circuit, r.package, r.downforce_level_run, r.deploy_below_kmh, r.superclip_before_braking_m, r.race_lap_s_simulated]) },
    source: 'optimal-2027-car-settings_simulated.csv',
  },
  'r27-teams': {
    kind: 'bar', horizontal: true, labels: r27t.map((r) => r.team), xLabel: 'Gap to the fastest car (%)', yLabel: '', unit: '%', decimals: 2, height: 460, xMin: 0,
    datasets: [
      { label: 'Real 2026 race pace (measured)', color: 'c2', data: r27t.map((r) => num(r.real_2026_season_race_pace_gap_pct_measured)) },
      { label: 'Model team car, scaled ×0.70 (simulated)', color: 'c1', data: r27t.map((r) => num(r.model_gap_scaled_pct_simulated)) },
    ],
    table: { head: ['Team', 'Model gap (%, simulated)', 'Model gap scaled (%, simulated)', 'Real race-pace gap (%, measured)'], rows: r27t.map((r) => [r.team, r.model_gap_pct_simulated, r.model_gap_scaled_pct_simulated, r.real_2026_season_race_pace_gap_pct_measured]) },
    source: 'team-gaps_simulated-vs-measured.csv',
  },
  'f1-forces': {
    kind: 'bar', labels: ['Drag', 'Downforce'], xLabel: '', yLabel: 'Force, full car at 50 m/s (N)', unit: 'N', decimals: 0,
    datasets: [
      { label: 'Run 1: placeholder floor, fixed wheels', data: [f1rv('drag (N)', 'run1'), f1rv('downforce (N)', 'run1')], color: 'c6' },
      { label: 'v4: venturi floor, rotating wheels', data: [f1rv('drag (N)', 'v4'), f1rv('downforce (N)', 'v4')], color: 'c1' },
    ],
    table: {
      head: ['Quantity (full car, 50 m/s, mean of last 100 iterations)', 'Run 1', 'v4'],
      rows: parseCsv(f1Results).map((r) => Object.values(r)),
    },
    source: 'cfd_results_run1_vs_v4.csv',
  },
  'f1-components': {
    kind: 'bar', horizontal: true, labels: compRows.map((r) => r[0]), xLabel: 'Downforce (N); negative = lift', yLabel: '', unit: 'N', decimals: 0, height: 380,
    datasets: [
      { label: 'Old placeholder floor (v3, iteration-350 snapshot)', data: compRows.map((r) => r[1]), color: 'c6' },
      { label: 'Venturi floor (v4)', data: compRows.map((r) => r[2]), color: 'c1' },
    ],
    table: { head: ['Component', 'v3 downforce (N)', 'v4 downforce (N)'], rows: compRows },
    source: 'cfd_v3_component_breakdown_old_floor.csv, cfd_v4_component_breakdown.csv',
  },
  'f1-convergence': {
    kind: 'line', xLabel: 'Iteration', yLabel: 'Force, full car (N)', unit: 'N', decimals: 0, yMin: 0,
    datasets: [
      { label: 'Downforce', data: pick(hist, 2).map((r) => ({ x: num(r.iteration), y: num(r.downforce_full_car_N) })), color: 'c1', pointRadius: 0 },
      { label: 'Drag', data: pick(hist, 2).map((r) => ({ x: num(r.iteration), y: num(r.drag_full_car_N) })), color: 'c2', pointRadius: 0 },
      { label: 'Rear-axle load', data: pick(hist, 2).map((r) => ({ x: num(r.iteration), y: num(r.rear_axle_load_full_car_N) })), color: 'c3', pointRadius: 0 },
    ],
    table: { head: ['Iteration', 'Drag (N)', 'Downforce (N)', 'Rear-axle load (N)'], rows: pick(hist, 25).map((r) => [r.iteration, round(num(r.drag_full_car_N), 0), round(num(r.downforce_full_car_N), 0), round(num(r.rear_axle_load_full_car_N), 0)]) },
    source: 'cfd_v4_force_history.csv',
  },

  'ev-drag-change': {
    kind: 'bar', horizontal: true, labels: coarse.map((r) => evLabels[r.config] ?? nice(r.config)), xLabel: 'Change in drag area Cd·A vs baseline (%)', yLabel: '', unit: '%', decimals: 1, height: 440,
    refLine: { value: -0.6, label: 'mesh noise ±0.6 %', axis: 'x' },
    datasets: [
      { label: 'Coarse mesh (every configuration)', data: coarse.map((r) => round(num(r.d_cda_pct), 1)), color: 'c1' },
      { label: 'Medium mesh (check on the large changes)', data: coarse.map((r) => med(r.config)), color: 'c2' },
    ],
    table: { head: ['Configuration', 'ΔCd·A coarse (%)', 'ΔCd·A medium (%)', 'Cd (coarse)', 'Δrange at 120 km/h (km)'], rows: coarse.map((r) => [evLabels[r.config] ?? r.config, round(num(r.d_cda_pct), 1), med(r.config) ?? '–', round(num(r.cd), 3), round(num(r.d_range_km_120), 0)]) },
    source: 'phase4_sweep.csv',
  },
  'ev-range': {
    kind: 'bar', horizontal: true, labels: rank.map((r) => evLabels[r.config] ?? nice(r.config)), xLabel: 'Range gained per charge (km, predicted)', yLabel: '', unit: 'km', decimals: 0, height: 440,
    datasets: [
      { label: 'Steady 120 km/h', data: rank.map((r) => round(num(r.d_range_km_120), 0)), color: 'c1' },
      { label: 'EPA HWFET highway cycle', data: rank.map((r) => round(num(r.d_range_km_cycle), 0)), color: 'c3' },
    ],
    table: { head: ['Configuration', 'Δrange 120 km/h (km)', 'Δrange HWFET (km)', 'Cd·A gain (%)'], rows: rank.map((r) => [evLabels[r.config] ?? r.config, round(num(r.d_range_km_120), 0), round(num(r.d_range_km_cycle), 0), round(num(r.gain_cda_pct), 1)]) },
    source: 'phase5_ranking.csv',
  },
  'ev-mesh': {
    kind: 'line', xLabel: 'Mesh size (thousand cells, half car)', yLabel: 'Baseline Cd·A (m²)', unit: 'm²', decimals: 4, yMin: 0.70, yMax: 0.74,
    datasets: [{ label: 'Baseline Cd·A', data: [{ x: 383, y: num(cda.coarse) }, { x: 625, y: num(cda.medium) }, { x: 858, y: num(cda.fine) }], color: 'c1', pointRadius: 5 }],
    table: { head: ['Mesh', 'Cells', 'Cd·A (m²)', 'Cd'], rows: [['Coarse', '383k', round(num(cda.coarse), 4), 0.3137], ['Medium', '625k', round(num(cda.medium), 4), 0.31187], ['Fine', '858k', round(num(cda.fine), 4), 0.31335]] },
    source: 'phase3_mesh_independence.csv',
  },

  'lt-loss': {
    kind: 'line', xLabel: 'Gap to the car ahead (s)', yLabel: 'Time lost per lap (s)', unit: 's', xUnit: 's', decimals: 3, yMin: 0,
    datasets: [
      { label: 'Measured on real passes', color: 'c6', dashed: true, pointRadius: 0, data: loss.map((r) => ({ x: num(r.gap_s), y: num(r.measured_s_per_lap) })) },
      { label: 'My model (frozen version)', color: 'c1', pointRadius: 0, data: loss.map((r) => ({ x: num(r.gap_s), y: num(r.frozen_model_s_per_lap) })) },
      { label: 'Curve from FIA CFD wake figures', color: 'c2', pointRadius: 0, data: loss.map((r) => ({ x: num(r.gap_s), y: num(r.fia_curve_s_per_lap) })) },
    ],
    table: { head: ['Gap (s)', 'Measured (s/lap)', 'Model (s/lap)', 'FIA curve (s/lap)'], rows: loss.map((r) => [r.gap_s, round(num(r.measured_s_per_lap), 3), round(num(r.frozen_model_s_per_lap), 3), round(num(r.fia_curve_s_per_lap), 3)]) },
    source: 'model_mean_loss_curves.csv',
  },
  'lt-circuits': {
    kind: 'bar', horizontal: true, labels: dev.map((r) => r.circuit), xLabel: 'Skill S: share of the no-effect error removed', yLabel: '', unit: '', decimals: 3, height: 460, xMin: 0,
    refLine: { value: 0.5, label: 'pass mark 0.5', axis: 'x' },
    datasets: [{ label: 'Skill S (each circuit held out in turn)', color: 'c1', data: dev.map((r) => num(r.S_skill)) }],
    table: { head: ['Circuit', 'Segment passes', 'S', 'Verdict'], rows: dev.map((r) => [r.circuit, num(r.segment_passes).toLocaleString('en-US'), r.S_skill, r.verdict]) },
    source: 'model_development_scores.csv',
  },
  'lt-stall': {
    kind: 'line', labels: stall.map((r) => r.laps_ahead), xLabel: 'Forecast made this many laps before the stall', yLabel: 'Mean error of stall gap (s)', unit: 's', decimals: 3, yMin: 0,
    datasets: [
      { label: 'My model', color: 'c1', pointRadius: 4, data: stall.map((r) => num(r.model_error_s)) },
      { label: 'FIA curve', color: 'c2', pointRadius: 4, data: stall.map((r) => num(r.fia_curve_error_s)) },
      { label: 'Constant guess', color: 'c5', pointRadius: 4, data: stall.map((r) => num(r.constant_guess_error_s)) },
      { label: 'Gap stays as now', color: 'c3', pointRadius: 4, data: stall.map((r) => num(r.gap_stays_as_now_error_s)) },
    ],
    table: { head: ['Laps ahead', 'Plateaus', 'Model (s)', 'FIA curve (s)', 'Constant guess (s)', 'Gap stays as now (s)'], rows: stall.map((r) => [r.laps_ahead, r.plateaus, r.model_error_s, r.fia_curve_error_s, r.constant_guess_error_s, r.gap_stays_as_now_error_s]) },
    source: 'model_stall_forecast_test.csv',
  },
  'lt-baselines': {
    kind: 'bar', horizontal: true, labels: bases.map((r) => r.description.split(':')[0].replace(/^physics with/, 'Physics with')), xLabel: 'Mean skill S over 16 development circuits', yLabel: '', unit: '', decimals: 3, xMin: 0, height: 300,
    datasets: [{ label: 'Mean S (earlier model version)', color: 'c1', data: bases.map((r) => round(num(r.mean_S), 3)) }],
    table: { head: ['Baseline', 'Mean S', 'Circuits with S ≥ 0.5', 'Fitted numbers'], rows: bases.map((r) => [r.description, round(num(r.mean_S), 3), r.circuits_S_ge_0_5 ?? r['circuits_S_ge_0.5'], r.fitted_numbers]) },
    source: 'model_baselines_earlier_version.csv',
  },

  'ic-torque': {
    kind: 'bar', labels: tq.map((r) => nice(r.joint).replace(/^J(\d) /, 'J$1 ')), xLabel: '', yLabel: 'Torque (kg·cm)', unit: 'kg·cm', decimals: 1,
    datasets: [
      { label: 'Required, worst case (static)', color: 'c2', data: tq.map((r) => num(r.required_torque_kgcm)) },
      { label: 'Servo rating (datasheet)', color: 'c1', data: tq.map((r) => num(r.servo_rating_kgcm)) },
    ],
    table: { head: ['Joint', 'Required (N·m)', 'Required (kg·cm)', 'Servo rating (kg·cm)', 'Safety factor'], rows: tq.map((r) => [nice(r.joint), r.required_torque_Nm, r.required_torque_kgcm, r.servo_rating_kgcm, r.safety_factor]) },
    source: 'joint_torques.csv',
  },
  'ic-mass': {
    kind: 'bar', horizontal: true, labels: mass.map((r) => r.group), xLabel: 'Mass (g, predicted)', yLabel: '', unit: 'g', decimals: 1, height: 280,
    datasets: [{ label: 'Mass by group', color: 'c1', data: mass.map((r) => num(r.total_mass_g)) }],
    table: { head: ['Group', 'Mass (g)'], rows: parseCsv(icMass).map((r) => [r.group, r.total_mass_g]) },
    source: 'mass_summary.csv',
  },

  'ex-torque': {
    kind: 'line', xLabel: 'Elbow angle (°)', yLabel: 'Elbow torque (N·m)', unit: 'N·m', xUnit: '°', decimals: 2, yMin: 0, yMax: 9,
    refLine: { value: 8, label: '8 N·m drive rating', axis: 'y' },
    datasets: [
      { label: 'Large adult, full load', color: 'c2', pointRadius: 3, data: ext.filter((r) => r.person === 'large').map((r) => ({ x: num(r.elbow_angle_deg), y: num(r.full_load_Nm) })) },
      { label: 'Median adult, full load', color: 'c1', pointRadius: 3, data: ext.filter((r) => r.person === 'median').map((r) => ({ x: num(r.elbow_angle_deg), y: num(r.full_load_Nm) })) },
      { label: 'Median adult, arm only', color: 'c6', dashed: true, pointRadius: 0, data: ext.filter((r) => r.person === 'median').map((r) => ({ x: num(r.elbow_angle_deg), y: num(r.arm_only_Nm) })) },
    ],
    table: { head: ['User', 'Angle (°)', 'Arm only (N·m)', 'Arm + brace (N·m)', 'Full load (N·m)'], rows: ext.map((r) => [r.person, r.elbow_angle_deg, r.arm_only_Nm, r.arm_plus_brace_Nm, r.full_load_Nm]) },
    source: 'elbow_torque_vs_angle.csv (static gravity torque; full load includes 0.5 kg in the hand)',
  },
  'ex-freefall': {
    kind: 'scatter', logX: true, logY: true, xLabel: 'Time step (ms, log scale)', yLabel: 'Final-speed error vs exact (%)', unit: '%', xUnit: 'ms', decimals: 7,
    datasets: [
      { label: 'Median adult', color: 'c1', showLine: true, pointRadius: 4, data: exf.filter((r) => r.person === 'median').map((r) => ({ x: num(r.dt_ms), y: Math.abs(num(r.speed_error_pct)) })) },
      { label: 'Large adult', color: 'c2', showLine: true, pointRadius: 4, data: exf.filter((r) => r.person === 'large').map((r) => ({ x: num(r.dt_ms), y: Math.abs(num(r.speed_error_pct)) })) },
    ],
    table: { head: ['User', 'Step (ms)', 'Fall time (s)', 'Final speed (rad/s)', 'Exact (rad/s)', 'Error (%)'], rows: exf.map((r) => [r.person, r.dt_ms, r.fall_time_s, r.final_speed_rad_s, r.exact_speed_rad_s, r.speed_error_pct]) },
    source: 'verification_freefall_convergence.csv (absolute error shown on the log axis)',
  },
};
