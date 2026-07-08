import { LightningElement, api, track } from 'lwc';

/* SVG coordinate system */
const SVG_W   = 1000;
const SVG_H   = 60;
const T_PAD   = 10;
const B_PAD   = 2;
const CHART_H = SVG_H - T_PAD - B_PAD; // 48 usable units

/* ECG oscillation: sub-steps per data segment, amplitude in SVG units.
 * With vector-effect="non-scaling-stroke" fixing line thickness, the wave
 * amplitude must be larger in SVG units to remain visible as a wavy line. */
const ECG_STEPS = 12;
const ECG_AMP   = 7;

function _fmt(value) {
    if (value == null) return '';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000)    return `$${(Math.round(value / 100) / 10).toFixed(1)}K`;
    return `$${value}`;
}

export default class WealthJourney extends LightningElement {
    @api aumPoints       = [];
    @api liquidityPoints = [];
    @api marketPoints    = [];
    @api carGoalAmount   = 45000;
    @api isMonthlyMode   = false;

    @track _metric     = 'aum';
    @track _hoverIdx   = null;   // follows mouse
    @track _pinnedIdx  = null;   // locked by click/drag

    /* Seed pinned marker to today on first render */
    _markerSeeded = false;
    renderedCallback() {
        if (!this._markerSeeded) {
            const idx = this._activePoints.findIndex(p => p.isToday);
            if (idx >= 0) {
                this._pinnedIdx  = idx;
                this._markerSeeded = true;
            }
        }
    }

    /* ── Metric toggle ───────────────────────────────────────────── */
    get aumBtnClass()       { return this._metric === 'aum'       ? 'c-wj-btn c-wj-btn_on' : 'c-wj-btn'; }
    get liquidityBtnClass() { return this._metric === 'liquidity' ? 'c-wj-btn c-wj-btn_on' : 'c-wj-btn'; }
    get marketBtnClass()    { return this._metric === 'market'    ? 'c-wj-btn c-wj-btn_on c-wj-btn_market' : 'c-wj-btn c-wj-btn_market'; }

    handleSelectAum() {
        this._metric       = 'aum';
        this._pinnedIdx    = null;
        this._markerSeeded = false;  // re-seed for new metric
    }
    handleSelectLiquidity() {
        this._metric       = 'liquidity';
        this._pinnedIdx    = null;
        this._markerSeeded = false;
    }
    handleSelectMarket() {
        this._metric       = 'market';
        this._pinnedIdx    = null;
        this._markerSeeded = false;
    }

    /* ── Layout ──────────────────────────────────────────────────── */
    get rowClass() {
        return this.isMonthlyMode ? 'c-wj-row c-wj-row_monthly' : 'c-wj-row c-wj-row_yearly';
    }

    /* ── Data helpers ────────────────────────────────────────────── */
    get _activePoints() {
        if (this._metric === 'market')    return this.marketPoints    || [];
        if (this._metric === 'liquidity') return this.liquidityPoints || [];
        return this.aumPoints || [];
    }

    /* Display value in label cell — tracks hover/pin */
    get displayValue() {
        const pts      = this._activePoints;
        const activeIdx = this._hoverIdx !== null ? this._hoverIdx : this._pinnedIdx;
        if (activeIdx !== null && pts[activeIdx]) return _fmt(pts[activeIdx].value);
        const today = pts.find(p => p.isToday);
        return today ? _fmt(today.value) : _fmt((pts[pts.length - 1] || {}).value || 0);
    }

    /* ── SVG chart computation ───────────────────────────────────── */
    get svgViewBox() { return `0 0 ${SVG_W} ${SVG_H}`; }

    get chartPoints() {
        const pts   = this._activePoints;
        if (!pts.length) return [];
        const vals  = pts.map(p => p.value);
        const max   = Math.max(...vals);
        const min   = Math.min(...vals);
        // Use min-max normalisation so the line fills the chart height meaningfully
        const range = (max - min) || 1;
        const n     = pts.length;
        return pts.map((p, i) => {
            const cx = String(Math.round(((i + 0.5) / n) * SVG_W * 10) / 10);
            const cy = String(Math.round((T_PAD + (1 - (p.value - min) / range) * CHART_H) * 10) / 10);
            return {
                ...p,
                cx,
                cy,
                dotClass: p.isProjected ? 'c-wj-dot c-wj-dot_proj'
                        : p.isToday    ? 'c-wj-dot c-wj-dot_today'
                        : 'c-wj-dot',
            };
        });
    }

    get _baseY() { return String(SVG_H - B_PAD); }

    /* Smooth cubic bezier path for AUM — one control point horizontally centred */
    _buildSmoothPath(pts) {
        if (!pts.length) return '';
        let d = `M${pts[0].cx},${pts[0].cy}`;
        for (let i = 1; i < pts.length; i++) {
            const x0 = Number(pts[i-1].cx), y0 = Number(pts[i-1].cy);
            const x1 = Number(pts[i].cx),   y1 = Number(pts[i].cy);
            const mx = ((x0 + x1) / 2).toFixed(1);
            d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
        }
        return d;
    }

    /*
     * ECG-like path for liquidity: adds sinusoidal sub-waypoints between each
     * data point. sin(t × 2π) = 0 at both t=0 and t=1, so the path connects
     * exactly at each data point with no gap.
     */
    _buildEcgPath(pts) {
        if (!pts.length) return '';
        let d = `M${pts[0].cx},${pts[0].cy}`;
        for (let i = 1; i < pts.length; i++) {
            const x0 = Number(pts[i-1].cx), y0 = Number(pts[i-1].cy);
            const x1 = Number(pts[i].cx),   y1 = Number(pts[i].cy);
            for (let j = 1; j <= ECG_STEPS; j++) {
                const t     = j / ECG_STEPS;
                const baseY = y0 + (y1 - y0) * t;
                /* 2 full sin cycles per segment → always returns to 0 at t=1 */
                const wave  = ECG_AMP * Math.sin(t * 2 * Math.PI * 2);
                d += ` L${(x0 + (x1-x0)*t).toFixed(1)},${(baseY + wave).toFixed(1)}`;
            }
        }
        return d;
    }

    _buildPath(pts) {
        return this._metric === 'liquidity'
            ? this._buildEcgPath(pts)
            : this._buildSmoothPath(pts);
    }

    get solidLinePath() {
        return this._buildPath(this.chartPoints.filter(p => !p.isProjected));
    }

    get dashedLinePath() {
        const all = this.chartPoints;
        const idx = all.findIndex(p => p.isToday);
        const pts = idx >= 0 ? all.slice(idx) : all.filter(p => p.isProjected);
        return pts.length < 2 ? '' : this._buildPath(pts);
    }

    get solidAreaPath() {
        const pts = this.chartPoints.filter(p => !p.isProjected);
        if (!pts.length) return '';
        const line = this._buildPath(pts);
        return `${line} L${pts[pts.length-1].cx},${this._baseY} L${pts[0].cx},${this._baseY} Z`;
    }

    get projectedAreaPath() {
        const all = this.chartPoints;
        const idx = all.findIndex(p => p.isToday);
        const pts = idx >= 0 ? all.slice(idx) : all.filter(p => p.isProjected);
        if (pts.length < 2) return '';
        const line = this._buildPath(pts);
        return `${line} L${pts[pts.length-1].cx},${this._baseY} L${pts[0].cx},${this._baseY} Z`;
    }

    /* Gradient IDs switch with metric */
    get solidFill()     { return 'none'; } // no area fill — pure line graph
    get projFill()      { return 'none'; }
    get lineClass() {
        if (this._metric === 'liquidity') return 'c-wj-line-solid c-wj-line_blue';
        if (this._metric === 'market')    return 'c-wj-line-solid c-wj-line_amber';
        return 'c-wj-line-solid c-wj-line_green';
    }
    get dashedClass() {
        if (this._metric === 'liquidity') return 'c-wj-line-dashed c-wj-line_blue';
        if (this._metric === 'market')    return 'c-wj-line-dashed c-wj-line_amber';
        return 'c-wj-line-dashed c-wj-line_green';
    }

    /* Today vertical bar — positioned at the LEFT EDGE of the today period
     * so it aligns with the Group Timeline's today column border-left.
     * Uses aumPoints (always has isToday) regardless of active metric. */
    get _todayIdx() {
        return (this.aumPoints || []).findIndex(p => p.isToday);
    }
    get showTodayLine() { return this._todayIdx >= 0; }
    get todayBarStyle() {
        const idx = this._todayIdx;
        const n   = (this.aumPoints || []).length;
        if (idx < 0 || !n) return '';
        const pct = ((idx / n) * 100).toFixed(4);
        return `left:${pct}%`;
    }
    /* Keep todayX/todayY2 for the SVG marker dot alignment */
    get todayX()  { const p = this.chartPoints.find(pt => pt.isToday); return p ? p.cx : null; }
    get todayY2() { return String(SVG_H); }

    /* ── Draggable marker ────────────────────────────────────────── */
    get _activeMarkerIdx() {
        return this._hoverIdx !== null ? this._hoverIdx : this._pinnedIdx;
    }

    get showMarker()    { return this._activeMarkerIdx !== null; }

    get markerPt() {
        const idx = this._activeMarkerIdx;
        return (idx !== null) ? this.chartPoints[idx] : null;
    }

    get markerX()       { return this.markerPt?.cx ?? null; }
    get markerY()       { return this.markerPt?.cy ?? null; }
    get markerValue()   {
        const idx = this._activeMarkerIdx;
        const pts = this._activePoints;
        return (idx !== null && pts[idx]) ? _fmt(pts[idx].value) : '';
    }
    get markerPeriod()  {
        const idx = this._activeMarkerIdx;
        const pts = this._activePoints;
        return (idx !== null && pts[idx]) ? String(pts[idx].period) : '';
    }

    /* Percentage position (0-100) for HTML tooltip positioning */
    get markerPct() {
        const idx = this._activeMarkerIdx;
        const n   = this._activePoints.length;
        if (idx === null || !n) return 0;
        return ((idx + 0.5) / n) * 100;
    }

    get tooltipStyle() {
        /* Clamp: keep tooltip (≈150px) inside chart area */
        const pct = this.markerPct;
        return `left: ${pct.toFixed(2)}%`;
    }

    /* Marker dot Y position as % of chart height (for HTML div placement) */
    get markerTopPct() {
        const y = this.markerPt?.cy;
        if (y == null) return '50';
        return ((Number(y) / SVG_H) * 100).toFixed(2);
    }

    /* Inline style for the HTML marker dot: position + colour */
    get markerDotStyle() {
        if (!this.showMarker) return '';
        return `left:${this.markerPct.toFixed(2)}%;top:${this.markerTopPct}%;background:${this.dotColor};`;
    }

    get dotColor() {
        if (this._metric === 'liquidity') return '#0176d3';
        if (this._metric === 'market')    return '#f59e0b';
        return '#10b981';
    }

    /* ── Market goal line ────────────────────────────────────────── */
    get showGoalLine() { return this._metric === 'market'; }

    get goalLineY() {
        if (!this.showGoalLine) return null;
        const pts = this.marketPoints || [];
        if (!pts.length) return null;
        const vals  = pts.map(p => p.value);
        const max   = Math.max(...vals);
        const min   = Math.min(...vals);
        const range = (max - min) || 1;
        const goal  = Number(this.carGoalAmount) || 45000;
        // Clamp within SVG bounds
        const raw = T_PAD + (1 - (goal - min) / range) * CHART_H;
        return Math.max(T_PAD, Math.min(SVG_H - B_PAD, raw)).toFixed(1);
    }

    get goalLinePct() {
        if (this.goalLineY === null) return null;
        return ((Number(this.goalLineY) / SVG_H) * 100).toFixed(1);
    }

    get goalLabelStyle() {
        return this.goalLinePct !== null ? `top: calc(${this.goalLinePct}% - 0.65rem)` : '';
    }

    get goalLabelText() {
        const g = Number(this.carGoalAmount) || 45000;
        return `Car Goal · $${(g / 1000).toFixed(0)}K`;
    }

    get tooltipDotStyle() {
        return `background: ${this.dotColor}`;
    }

    /* ── Mouse interaction handlers ──────────────────────────────── */
    handleChartMouseMove(event) {
        const rect  = event.currentTarget.getBoundingClientRect();
        const relX  = event.clientX - rect.left;
        const pct   = Math.max(0, Math.min(1, relX / rect.width));
        const n     = this._activePoints.length;
        this._hoverIdx = Math.min(n - 1, Math.max(0, Math.floor(pct * n)));
    }

    handleChartMouseLeave() {
        this._hoverIdx = null;
    }

    handleChartClick() {
        if (this._hoverIdx !== null) {
            this._pinnedIdx = this._hoverIdx;
        }
    }

    handleChartMouseDown() {
        /* Enable drag: hoverIdx already updates on mousemove, so dragging works */
    }
}
