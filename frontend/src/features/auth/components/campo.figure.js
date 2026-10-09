// Figura Hairline hecha con la skill hairline-create: el hub del login con tractor, camión, cosechadora y tolva.
/** Campo: a hub with four tiles on dashed links and four machines round it: tractor, truck, combine, grain cart.
 * The tile under the pointer rises and its link turns solid; a machine drives in along its link instead. */
import HL from '@/ui/components/hairline/kernel';

const {
  Cam, clamp, circ, facing, fillet, fit, hull, open, poly, proj, ringAt, rrect, run, seg,
  spring, stepS, tdone, tset, tval, tween, disposer, mk, pointer, put, register, solid, reducedMotion,
} = HL;

const D = 52, HS = 10, T = 3, HUB = 18, HT = 8, E = 3 * D / 2 - 4, HIT = 40, STEP = 70, MAXD = 22;
const FALL = [1, 0.5, 0.2, 0.06, 0];
const UP = { k: 70, c: 14 }, DOWN = { k: 40, c: 12.4 }, DRAW = { k: 120, c: 21, eps: 2e-3 }, RETRACT = { k: 36, c: 11.6, eps: 2e-3 };
// [i, j, kind]: on screen the combine is at the top, the truck right, the grain cart at the bottom, the tractor left
const CELLS = [[-1, -1, "harvester"], [0, -1, 0], [1, -1, "truck"], [1, 0, 0], [1, 1, "tolva"], [0, 1, 0], [-1, 1, "tractor"], [-1, 0, 0]];
const JIT = [[0, 0], [-2, 1.5], [0, 0], [-2.5, -1], [0, 0], [-1.5, 2], [0, 0], [-2, -2.5]];
const R2 = Math.SQRT1_2;
const K = { tractor: 0.6, truck: 0.5, harvester: 0.6, tolva: 0.55 }, HALF = { tractor: 11, truck: 12.5, harvester: 13, tolva: 7 };
/** A machine's axes: along it and across it. Most face the hub side-on; the combine faces it head-on; the cart lies side-on. */
const axes = (t) => (t.kind === "harvester" ? [t.dir, [R2, -R2]] : t.kind === "tolva" ? [[R2, -R2], [R2, R2]] : [t.dir, [R2, R2]]);

/** A local ring (u along the vehicle, v across) placed in the world at o, along a, across c. */
const xf = (ring, o, a, c) => ring.map((q) => ({ u: o[0] + q.u * a[0] + q.v * c[0], v: o[1] + q.u * a[1] + q.v * c[1], nu: q.nu * a[0] + q.nv * c[0], nv: q.nu * a[1] + q.nv * c[1] }));

/** The machines' parts, back to front, in their own frame. Wheels and tires are [u, R, v0, v1]; a tire shows no face. */
const VEHICLES = {
  tractor: [
    ["wheel", -8, 9, -10, -6], ["wheel", 11, 5.5, -7.5, -4.5],
    ["box", -2, -4, 17, 4, 2.5, 6, 13],          // hood
    ["box", 9, -1.2, 11.4, 1.2, 1, 13, 23],      // exhaust stack
    ["box", -14, -5.5, -2, 5.5, 2, 8, 26],       // cabin
    ["box", -15, -6.5, -1, 6.5, 2.5, 26, 27.6],  // roof
    ["win", 5.5, [[-12.5, 15], [-3.5, 15], [-3.5, 24], [-12.5, 24]]],
    ["wheel", -8, 9, 6, 10], ["wheel", 11, 5.5, 4.5, 7.5],
  ],
  truck: [
    ["wheel", -20, 4.5, -9, -5.5], ["wheel", -12, 4.5, -9, -5.5], ["wheel", 17, 4.5, -9, -5.5],
    ["box", -24, -5, 22, 5, 2, 5, 9.5],          // chassis
    ["box", -25, -8, 10, 8, 2.5, 9.5, 28],       // cargo box
    ["rib", 8, -24, 9, 19],                      // a rib along the box's side
    ["taper", 12, -7, 24, 7, 12, -6.5, 20, 6.5, 9.5, 24], // cab with a raked windscreen
    ["win", 7, [[14, 15], [20.4, 15], [18.9, 22], [14, 22]]],
    ["wheel", -20, 4.5, 5.5, 9], ["wheel", -12, 4.5, 5.5, 9], ["wheel", 17, 4.5, 5.5, 9],
  ],
  // head-on, so back to front runs along u: steer tires, body, grain tank, folded auger, drive tires, cab, feeder, header, reel
  harvester: [
    ["tire", -12, 4, -8.5, -5.5], ["tire", -12, 4, 5.5, 8.5], ["box", -15, -7, 4, 7, 2.5, 6, 20], ["box", -13, -6, 1, 6, 2, 20, 25],
    ["tube", -12, -8, 23, 3, -8, 23, 1.3], ["tire", 1, 7.5, -11, -7.5], ["tire", 1, 7.5, 7.5, 11], ["box", 2, -4.5, 10, 4.5, 2, 13, 26],
    ["winF", 10, [[-3.2, 16], [3.2, 16], [3.2, 24], [-3.2, 24]]], ["box", 8, -3.5, 16, 3.5, 1.5, 4, 11],
    ["box", 15, -17, 22, 17, 2.5, 1, 6], ["box", 15.5, -16, 20.5, 16, 2.4, 7, 11.5],
  ],
  // grain cart: far wheel, drawbar, a hopper wider at the top, the auger up its front corner and its spout, near wheel
  tolva: [
    ["wheel", -3, 6, -10, -6.5], ["box", 10, -1, 24, 1, 0.8, 4, 6], ["taper", -11, -4.5, 9, 4.5, -16, -8, 15, 8, 7, 20],
    ["tube", 12, 4, 9, 19, 4, 31, 1.6], ["tube", 19, 4, 31, 22.5, 4, 27.5, 1.3], ["wheel", -3, 6, 6.5, 10],
  ],
};

/** Every path of a vehicle standing at o, as [d, class] in paint order. */
function vehicle(P, front, kind, o, a0, c0) {
  const k = K[kind], a = [a0[0] * k, a0[1] * k], c = [c0[0] * k, c0[1] * k], Z = (z) => z * k;
  const W = (u, v, z) => P(o[0] + u * a[0] + v * c[0], o[1] + u * a[1] + v * c[1], z * k);
  const out = [];
  for (const [t, ...p] of VEHICLES[kind]) {
    if (t === "wheel" || t === "tire") {
      const [u, R, v0, v1] = p, near = v1 > 0 ? v1 : v0, ring = circ(1, 20);
      const at = (v, r) => ring.map((q) => W(u + q.u * r, v, R + q.v * r));
      out.push([poly(hull(at(v0, R).concat(at(v1, R)))), "sil"]);
      if (v1 > 0 && t === "wheel") out.push([poly(at(near, R)), "nf"], [poly(at(near, R * 0.42)), "nf lo"]);
    } else if (t === "box") {
      const [u0, v0, u1, v1, r, z0, z1] = p, b = Math.min(1.1, (v1 - v0) / 3);
      const ring = xf(rrect(u0, v0, u1, v1, r, 4), o, a, c), inner = xf(rrect(u0 + b, v0 + b, u1 - b, v1 - b, r - b, 4), o, a, c);
      const sil = poly(hull(ringAt(P, ring, Z(z0)).concat(ringAt(P, ring, Z(z1))))) + open(ringAt(P, run(ring, front), Z(z1)));
      out.push([sil, "sil"], [poly(ringAt(P, inner, Z(z1))), "nf lo"]);
    } else if (t === "taper") {
      const [u0, v0, u1, v1, U0, V0, U1, V1, z0, z1] = p, foot = xf(rrect(u0, v0, u1, v1, 2, 4), o, a, c);
      const top = xf(rrect(U0, V0, U1, V1, 2, 4), o, a, c), inner = xf(rrect(U0 + 1, V0 + 1, U1 - 1, V1 - 1, 1, 4), o, a, c);
      out.push([poly(hull(ringAt(P, foot, Z(z0)).concat(ringAt(P, top, Z(z1))))) + open(ringAt(P, run(top, front), Z(z1))), "sil"], [poly(ringAt(P, inner, Z(z1))), "nf lo"]);
    } else if (t === "win") out.push([poly(fillet(p[1].map(([u, z]) => W(u, p[0], z)), p[1].map(() => 1.6))), "nf lo"]);
    else if (t === "winF") out.push([poly(fillet(p[1].map(([v, z]) => W(p[0], v, z)), p[1].map(() => 1.6))), "nf lo"]);
    else if (t === "tube") {
      const [u0, v0, z0, u1, v1, z1, r] = p, ring = circ(r, 12), end = (u, v, z) => ring.map((q) => W(u + q.u, v + q.v, z));
      out.push([poly(hull(end(u0, v0, z0).concat(end(u1, v1, z1)))), "sil"]);
    } else if (t === "rib") out.push([seg(W(p[1], p[0], p[3]), W(p[2], p[0], p[3])), "nf lo"]);
  }
  return out;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer(); let lift = value;
  const C = Cam(45, 0.5, 1.66);
  const pts = [[-E, -E, 0], [E, -E, 0], [E, E, 0], [-E, E, 0], [-D - 20, D + 20, 30], [D + 20, -D - 20, 30]];
  CELLS.forEach(([i, j], k) => pts.push([i * D - HS, j * D - HS, 24 * 1.15 + T], [i * D + HS, j * D + HS, 24 * 1.15 + T]));
  fit(C, pts, 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the ground grid, then the dashed links: both lie under every plate
  let d = "";
  for (let v = -E; v <= E + 1; v += D / 2) d += seg(P(v, -E, 0), P(v, E, 0)) + seg(P(-E, v, 0), P(E, v, 0));
  mk("path", { d, class: "nf lo" }, g);
  const items = CELLS.map(([i, j, kind], k) => {
    const x = i * D + JIT[k][0], y = j * D + JIT[k][1], m = Math.max(Math.abs(x), Math.abs(y));
    const it = { k, kind, x, y, a: (HUB + 2) / m, b: 1 - (kind ? (HALF[kind] * R2) / m : HS / m), sp: spring(0, { ...UP }), lk: spring(0, { ...DRAW }), hw: tween(0, 220), drawn: NaN, due: 0, tgt: 0, pend: false, on: false };
    const n = Math.max(2, Math.round((Math.hypot(x, y) * (it.b - it.a)) / 6));
    let dd = "";
    for (let s = 0; s < n; s++) { const u0 = it.a + ((it.b - it.a) * (s + 0.15)) / n, u1 = it.a + ((it.b - it.a) * (s + 0.65)) / n; dd += seg(P(x * u0, y * u0, 0), P(x * u1, y * u1, 0)); }
    mk("path", { d: dd, class: "nf dash" }, g);
    return it;
  });
  items.slice().sort((p, q) => Math.atan2(p.y, p.x) - Math.atan2(q.y, q.x)).forEach((t, n) => { t.n = n; });
  for (const t of items) { t.slot = mk("path", { class: "nf lo" }, g); t.line = mk("path", { class: "nf hi" }, g); }

  // hub and items back to front; vehicles lie along a diagonal, so their depth is one number
  let mark;
  for (const t of [...items, null].sort((p, q) => (p ? p.x + p.y : 0) - (q ? q.x + q.y : 0))) {
    if (!t) { const r = rrect(-HUB, -HUB, HUB, HUB, 7, 8);
      put(solid(g), { sil: poly(hull(ringAt(P, r, 0).concat(ringAt(P, r, HT)))) + open(ringAt(P, run(r, front), HT)), crease: poly(ringAt(P, rrect(-HUB + 1.3, -HUB + 1.3, HUB - 1.3, HUB - 1.3, 5.7, 8), HT)) });
      mk("path", { d: poly(ringAt(P, rrect(-HUB + 2.8, -HUB + 2.8, HUB - 2.8, HUB - 2.8, 4.2, 8), HT)), class: "nf lo" }, g);
      mark = mk("path", { d: poly(ringAt(P, rrect(-7, -7, 7, 7, 2, 8), HT)), class: "nf hi" }, g);
      continue; }
    if (t.kind) { t.dir = [-Math.sign(t.x) * R2, -Math.sign(t.y) * R2];
      t.els = vehicle(P, front, t.kind, [t.x, t.y], ...axes(t)).map(([, cls]) => mk("path", { class: cls }, g));
    } else { t.ring = rrect(t.x - HS, t.y - HS, t.x + HS, t.y + HS, 4, 8); t.el = solid(g);
      t.inner = rrect(t.x - HS + 1.1, t.y - HS + 1.1, t.x + HS - 1.1, t.y + HS - 1.1, 2.9, 8); }
  }

  const hubW = tween(1, 240); let hubOn = true;
  function draw(t, now) {
    const s = Math.max(0, t.sp.x), l = clamp(t.lk.x, 0, 1), on = tval(t.hw, now) > 0.5;
    if (s !== t.drawn) { t.drawn = s;
      if (t.kind) {
        const dv = Math.min(s * 1.1, MAXD), o = [t.x + t.dir[0] * dv, t.y + t.dir[1] * dv];
        vehicle(P, front, t.kind, o, ...axes(t)).forEach(([dd], i) => t.els[i].setAttribute("d", dd));
      } else {
        put(t.el, { sil: poly(hull(ringAt(P, t.ring, s).concat(ringAt(P, t.ring, s + T)))) + open(ringAt(P, run(t.ring, front), s + T)), crease: poly(ringAt(P, t.inner, s + T)) });
        t.slot.setAttribute("d", s > 0.4 ? poly(ringAt(P, t.ring, 0)) : "");
      }
    }
    if (on !== t.on) { t.on = on;
      if (t.kind) t.els.forEach((el) => { if (el.classList.contains("sil") || el.classList.contains("hi")) { el.classList.toggle("sil", !on); el.classList.toggle("hi", on); } });
      else t.el.sil.classList.toggle("hi", on);
    }
    const e = t.a + (t.b - t.a) * l;
    t.line.setAttribute("d", l > 2e-3 ? seg(P(t.x * t.a, t.y * t.a, 0), P(t.x * e, t.y * e, 0)) : "");
  }

  const B = register(stage, (dt, now) => { let moving = false;
    for (const t of items) {
      if (t.pend) { if (now >= t.due) { t.pend = false; Object.assign(t.sp, t.tgt > t.sp.t ? UP : DOWN); t.sp.t = t.tgt; } else moving = true; }
      if (stepS(t.sp, dt) | stepS(t.lk, dt) || !tdone(t.hw, now)) moving = true;
      draw(t, now);
    }
    const hw = tval(hubW, now) > 0.5;
    if (hw !== hubOn) { hubOn = hw; mark.setAttribute("class", hw ? "nf hi" : "nf lo"); }
    if (!tdone(hubW, now)) moving = true;
    return moving;
  });
  bag.add(B.unregister);

  // hit points at rest: a tile's top, a vehicle's middle; they never move
  const tops = items.map((t) => P(t.x, t.y, t.kind ? 7 : T)), hubAt = P(0, 0, HT);
  let act = -1;
  function hit([sx, sy]) {
    if (Math.hypot(sx - hubAt[0], sy - hubAt[1]) < 30) return -1;
    let a = -1, best = HIT;
    tops.forEach((q, k) => { const m = Math.hypot(sx - q[0], sy - q[1]); if (m < best) { best = m; a = k; } });
    if (a !== act && act >= 0) { const held = Math.hypot(sx - tops[act][0], sy - tops[act][1]); if (held < HIT && best > 0.8 * held) return act; }
    return a;
  }
  const hops = (t, from) => Math.min((t.n - from + 8) % 8, (from - t.n + 8) % 8);
  const NAMES = { truck: "camion", tractor: "tractor", harvester: "cosechadora", tolva: "tolva" }, name = (t) => NAMES[t.kind] ?? "lote " + (t.k + 1);
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? items[a].n : items[act].n; act = a;
    items.forEach((t) => {
      const hop = hops(t, from), tgt = a < 0 ? 0 : lift * FALL[hop], rising = tgt > t.tgt;
      t.due = now + (reducedMotion() ? 0 : rising ? hop * STEP : a < 0 ? (4 - hop) * 25 : hop === 0 ? 60 : 0);
      const on = t.k === a; t.tgt = tgt; t.pend = true;
      Object.assign(t.lk, on ? DRAW : RETRACT); t.lk.t = on ? 1 : 0;
      t.hw.dur = on ? 220 : 260; tset(t.hw, on ? 1 : 0, now, on ? 60 : 0);
    });
    hubW.dur = a < 0 ? 280 : 200; tset(hubW, a < 0 ? 1 : 0, now, a < 0 ? 180 : 0);
    read.textContent = a < 0 ? "rest" : name(items[a]);
    B.wake();
  }
  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  const set = (v) => { lift = v; if (act >= 0) { const from = items[act].n; items.forEach((t) => { t.tgt = t.sp.t = lift * FALL[hops(t, from)]; t.pend = false; }); B.wake(); } };
  return { set, destroy: bag.dispose };
}

const campo = {
  name: "campo",
  means: "A hub with four lots and four farm machines round it: the lot under the pointer rises, a machine drives in.",
  rules: [1, 2, 4, 9],
  range: [10, 16, 24],
  tour: [[76, 177], [205, 112], [328, 179], [201, 243], null],
  mount,
};

export default campo;
