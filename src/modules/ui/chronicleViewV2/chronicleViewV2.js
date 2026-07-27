import { LightningElement, api, track } from 'lwc';

// ── Shared timeline constants (copy from accountDetail for independence) ──
const TIMELINE_YEARS  = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028];
const CURRENT_YEAR   = 2026;
const CURRENT_MONTH  = 'Jul 2026';
function _buildMonthRange(startYear, startMo, endYear, endMo) {
    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const months = [];
    let y = startYear, m = startMo - 1;
    while (y < endYear || (y === endYear && m <= endMo - 1)) {
        months.push(`${MONTH_NAMES[m]} ${y}`);
        m++; if (m > 11) { m = 0; y++; }
    }
    return months;
}
const TIMELINE_MONTHS = _buildMonthRange(2019, 1, 2027, 2);
const CURRENT_MONTH_IDX = TIMELINE_MONTHS.indexOf(CURRENT_MONTH);

// ── Event detail data (copy from accountDetail for independence) ──
// NOTE: Modify EVENT_DETAILS_V2 freely — changes here only affect V2.
// eslint-disable-next-line no-unused-vars
const EVENT_DETAILS_V2 = {}; // Start empty; V2 gets rich details via enrichment

export default class ChronicleViewV2 extends LightningElement {
    @api enrichment = null;

    // ── Timeline mode ─────────────────────────────────────────────
    @track timelineMode     = 'monthly';
    @track _drillYear       = null;
    @track _drillAnimPhase  = 'idle';
    @track _expandingYear   = null;
    @track _activeFilter    = 'all';

    // ── Popover ────────────────────────────────────────────────────
    @track popoverVisible     = false;
    @track popoverEventData   = null;
    popoverPanelStyle         = '';
    popoverArrowRight         = false;
    // V2-only: pre-clamped vertical positioning so the panel never clips the viewport
    popoverNoCenter           = true;   // always true in V2 — we pre-compute top
    popoverArrowTopPx         = null;   // null → CSS default (50%); number → override
    // Avatar icon background: neutral blue for regular pills; insight colour for action-needed
    @track popoverIconBgColor = '#2272b6';

    // ── New event menu ─────────────────────────────────────────────
    @track _newMenuOpen     = false;

    // ── Filter menu ────────────────────────────────────────────────
    @track _filterMenuOpen  = false;

    // ── Timeline Insights panel ────────────────────────────────────
    @track _tlInsightsOpen         = false;
    @track _highlightedPillId      = null;
    @track _highlightedActionLabel = null;

    // ── Breadcrumb / scroll ────────────────────────────────────────
    @track _scrollVisibleYear  = '';
    @track _scrollVisibleMonth = '';

    // ── Sparkle popover ────────────────────────────────────────────
    @track _sparklePopoverSugId = null;
    @track _sparklePopoverStyle = '';
    @track sparklePopoverSug    = null;

    // ── Spatial anchoring ─────────────────────────────────────────
    _pendingScrollColIdx = CURRENT_MONTH_IDX;
    _scrollChainActive   = false;

    // ── Agentic insights ─────────────────────────────────────────
    agenticInsightsEnabled = true;

    // ──────────────────────────────────────────────────────────────
    // Mode getters
    // ──────────────────────────────────────────────────────────────
    get isDrillMode()    { return !!this._drillYear; }
    get isYearlyMode()   { return this.timelineMode === 'yearly' && !this.isDrillMode; }
    get isMonthlyMode()  { return this.timelineMode === 'monthly'; }

    get yearlyBtnClass()  { return this.timelineMode === 'yearly'  ? 'c-tl-toggle__btn c-tl-toggle__btn_active' : 'c-tl-toggle__btn'; }
    get monthlyBtnClass() { return this.isMonthlyMode ? 'c-tl-toggle__btn c-tl-toggle__btn_active' : 'c-tl-toggle__btn'; }

    get drillYearLabel()  { return this._drillYear ? String(this._drillYear) : ''; }

    get timelineTableClass() {
        let cls = 'c-timeline-table';
        if (this.isDrillMode || this.isMonthlyMode) cls += ' c-timeline-table_monthly';
        else cls += ' c-timeline-table_yearly';
        if (this._drillAnimPhase === 'leaving')  cls += ' c-tl-anim-leaving';
        if (this._drillAnimPhase === 'entering') cls += ' c-tl-anim-entering';
        return cls;
    }

    get timelineMemberHeaderLabel() {
        const src = this.isYearlyMode
            ? (this.enrichment?.timelineMembers        || [])
            : (this.enrichment?.monthlyTimelineMembers || []);
        return `Members (${src.length})`;
    }

    get timelineMetaText() {
        const source = this.isYearlyMode
            ? (this.enrichment?.timelineMembers        || [])
            : (this.enrichment?.monthlyTimelineMembers || []);
        const total = source.reduce((sum, m) => sum + m.events.length, 0);
        return `${total} item${total !== 1 ? 's' : ''} • No filters applied`;
    }

    // ── Filter ────────────────────────────────────────────────────
    get filterMenuOpen() { return this._filterMenuOpen; }

    get activeFilterLabel() {
        const map = { all: 'Show All', life: 'Life Event', engagement: 'Meeting', goal: 'Financial Goal', financial: 'Financial Account' };
        return map[this._activeFilter] || 'Show All';
    }

    get filterOptions() {
        return [
            { value: 'all',        label: 'Show All'          },
            { value: 'life',       label: 'Life Event'        },
            { value: 'engagement', label: 'Meeting'        },
            { value: 'goal',       label: 'Financial Goal'    },
            { value: 'financial',  label: 'Financial Account' },
        ].map(o => ({ ...o, isActive: o.value === this._activeFilter }));
    }

    // ── New menu ──────────────────────────────────────────────────
    get newMenuOpen() { return this._newMenuOpen; }

    // ── Timeline Insights ─────────────────────────────────────────
    get tlInsightsOpen() { return this._tlInsightsOpen; }

    get tlInsightsBtnClass() {
        return this._tlInsightsOpen
            ? 'c-tl-ctrl-btn c-tl-ctrl-btn_active'
            : 'c-tl-ctrl-btn';
    }

    // V2: top panel is inline — no right-margin needed
    get groupTimelineClass() { return 'c-group-timeline'; }

    /** Map of timelineEventId → badge type for action-needed insights (Gap/Alert/Opportunity only). */
    get _insightPillMap() {
        const map = {};
        for (const h of this.tlInsightsHighlights) {
            if (h.badgeLabel === 'Gap' || h.badgeLabel === 'Alert' || h.badgeLabel === 'Opportunity') {
                map[h.timelineEventId] = h.badgeLabel.toLowerCase(); // 'gap' | 'alert' | 'opportunity'
            }
        }
        return map;
    }

    get tlInsightsHighlights() {
        const CAT_LIFE       = 'Life Event Gaps';
        const CAT_REL        = 'Relationship Health';
        const CAT_GEN        = 'Generational Wealth Readiness';
        const highlights = [
            { id: 'h1', badgeLabel: 'Gap',         badgeClass: 'c-badge c-badge_gap',         category: CAT_LIFE,  title: 'Open 529 Savings Plan for Emma',             description: 'Emma was born in April 2026 — no 529 plan has been opened.',                                  actionLabel: 'Start 529 Plan',       timelineEventId: 'e23' },
            { id: 'h2', badgeLabel: 'Opportunity',  badgeClass: 'c-badge c-badge_opportunity',  category: CAT_REL,   title: 'Engage Sara in the Planning Conversation',    description: 'Sara has been absent from the last two annual reviews (2025, 2026).',                    actionLabel: 'Create Meeting',       timelineEventId: 'e14' },
            // h3 (RSU Vesting / Predicted) intentionally removed from V2 timeline insights panel
            { id: 'h5', badgeLabel: 'Alert',        badgeClass: 'c-badge c-badge_alert',        category: CAT_GEN,   title: 'New-Car Goal at Risk from Market Dip',        description: 'The $45K car goal relies on brokerage growth. A recent market dip has put the timeline at risk.',  actionLabel: 'Review Goal', timelineEventId: 'e10' },
        ];
        return highlights.map(h => ({
            ...h,
            isActive:  h.timelineEventId === this._highlightedPillId,
            cardClass: 'c-tli-card' + (h.timelineEventId === this._highlightedPillId ? ' c-tli-card_active' : ''),
        }));
    }

    /** Groups the flat insights list into the 3 named sections for V2's top panel. */
    get groupedInsights() {
        const SECTION_ORDER = [
            'Life Event Gaps',
            'Relationship Health',
            'Generational Wealth Readiness',
        ];
        const buckets = {};
        for (const h of this.tlInsightsHighlights) {
            const cat = h.category || 'Other';
            if (!buckets[cat]) buckets[cat] = [];
            buckets[cat].push(h);
        }
        const ordered = SECTION_ORDER.filter(c => buckets[c]);
        return ordered.map((c, i) => ({
            id:         `grp-${i}`,
            label:      c,
            cards:      buckets[c],
            groupClass: 'c-tli-group' + (i < ordered.length - 1 ? ' c-tli-group_sep' : ''),
        }));
    }

    // ── Breadcrumb ────────────────────────────────────────────────
    get showBreadcrumb() { return this.isMonthlyMode || this.isDrillMode; }

    get scrollVisibleYear() {
        if (this._scrollVisibleYear) return this._scrollVisibleYear;
        return this.isDrillMode
            ? String(this._drillYear)
            : CURRENT_MONTH.split(' ')[1];
    }

    // Quarter derived from the currently-visible month while scrolling
    get scrollVisibleQuarter() {
        const MONTH_TO_Q = {
            Jan: 'Q1', Feb: 'Q1', Mar: 'Q1',
            Apr: 'Q2', May: 'Q2', Jun: 'Q2',
            Jul: 'Q3', Aug: 'Q3', Sep: 'Q3',
            Oct: 'Q4', Nov: 'Q4', Dec: 'Q4',
        };
        const month = this._scrollVisibleMonth || CURRENT_MONTH.split(' ')[0];
        return MONTH_TO_Q[month] || 'Q1';
    }

    _qClass(q) {
        const active = this.scrollVisibleQuarter === q;
        return 'c-tl-breadcrumb__q' + (active ? ' c-tl-breadcrumb__q_active' : '');
    }
    get q1Class() { return this._qClass('Q1'); }
    get q2Class() { return this._qClass('Q2'); }
    get q3Class() { return this._qClass('Q3'); }
    get q4Class() { return this._qClass('Q4'); }

    // ── Context menu stubs ────────────────────────────────────────
    get timelineContextMenuOpen()  { return false; }
    get timelineContextMenuStyle() { return ''; }
    get timelineContextMenuItems() { return []; }

    // ── Sparkle popover ───────────────────────────────────────────
    get sparklePopoverVisible() { return !!this.sparklePopoverSug; }

    // ── Timeline columns ──────────────────────────────────────────
    get timelineColumns() {
        const Q_MAP       = { Jan: 'Q1', Apr: 'Q2', Jul: 'Q3', Oct: 'Q4' };
        const MONTH_TO_Q  = { Jan: 1, Feb: 1, Mar: 1, Apr: 2, May: 2, Jun: 2, Jul: 3, Aug: 3, Sep: 3, Oct: 4, Nov: 4, Dec: 4 };
        if (this.isYearlyMode) {
            return TIMELINE_YEARS.map((yr) => {
                const isToday     = yr === CURRENT_YEAR;
                const isPredicted = yr > CURRENT_YEAR;
                return {
                    key: yr,
                    label: isToday ? `• ${yr}` : String(yr),
                    yearLabelClass: isToday
                        ? 'c-timeline-year-label c-timeline-year-label_today'
                        : 'c-timeline-year-label',
                    isToday,
                    isPredicted,
                    showTodayPill: isToday,
                    isYearStart: false, isQuarterStart: false, quarterLabel: null,
                    headerCellClass: 'c-timeline-year-col c-timeline-header__cell'
                        + (isToday     ? ' c-timeline-header__cell_today_yr'  : '')
                        + (isPredicted ? ' c-timeline-header__cell_predicted' : ''),
                };
            });
        }
        return TIMELINE_MONTHS.map((m, idx) => {
            const isToday        = m === CURRENT_MONTH;
            const isPredicted    = idx > CURRENT_MONTH_IDX;
            const month          = m.split(' ')[0];
            const year           = m.split(' ')[1];
            const isYearStart    = month === 'Jan';
            const quarterLabel   = Q_MAP[month] || null;
            const isQuarterStart = !!quarterLabel;
            const quarterNum     = MONTH_TO_Q[month] || 1;
            // Even quarters get a subtle tinted band; odd quarters are plain white
            const quarterBandClass = quarterNum % 2 === 0 ? ' c-timeline-col_q-even' : '';
            return {
                key: m,
                label: m.slice(0, 3),
                year,
                isYearStart,
                isQuarterStart,
                quarterLabel,
                quarterBandClass,
                yearLabelClass: 'c-timeline-year-label',
                isToday,
                isPredicted,
                showTodayPill: isToday,
                headerCellClass: 'c-timeline-year-col c-timeline-header__cell'
                    + (isYearStart                    ? ' c-timeline-header__cell_year-start' : '')
                    + (isQuarterStart && !isYearStart ? ' c-timeline-header__cell_q-start'    : '')
                    + (isToday                        ? ' c-timeline-header__cell_today'      : '')
                    + (isPredicted                    ? ' c-timeline-header__cell_predicted'  : '')
                    + quarterBandClass,
            };
        });
    }

    get timelineYears() { return this.timelineColumns; }

    // ── Timeline rows ─────────────────────────────────────────────
    get timelineRows() {
        if (!this.enrichment) return [];
        const cols = this.timelineColumns;
        // V2: All pills share a single neutral-blue base class.
        // Type differentiation comes from iconography only (per legend).
        const PILL = {
            life:        'c-event-pill',
            engagement:  'c-event-pill',
            meeting:     'c-event-pill',
            goal:        'c-event-pill',
            financial:   'c-event-pill',
        };
        // Build map: eventId → 'gap' | 'alert' | 'opportunity' for action-needed pills
        const insightMap = this._insightPillMap;
        const TYPE_DOT = {
            life:        'c-type-dot c-type-dot_life',
            engagement:  'c-type-dot c-type-dot_engagement',
            meeting:     'c-type-dot c-type-dot_meeting',
            goal:        'c-type-dot c-type-dot_goal',
            financial:   'c-type-dot c-type-dot_financial',
        };
        const TYPE_ICON = {
            life:       'utility:event',
            engagement: 'utility:people',
            meeting:    'utility:event',
            goal:       'standard:goal',
            financial:  'utility:company',
        };
        const TYPE_ICON_BADGE = {
            life:       'c-pill-icon-badge c-pill-icon-badge_life',
            engagement: 'c-pill-icon-badge c-pill-icon-badge_engagement',
            meeting:    'c-pill-icon-badge c-pill-icon-badge_meeting',
            goal:       'c-pill-icon-badge c-pill-icon-badge_goal',
            financial:  'c-pill-icon-badge c-pill-icon-badge_financial',
        };
        const TYPE_FILTER_MAP = { life: 'life', engagement: 'engagement', goal: 'goal', financial: 'financial' };
        const filterType = TYPE_FILTER_MAP[this._activeFilter] || null;

        const members = this.isYearlyMode
            ? (this.enrichment.timelineMembers        || [])
            : (this.enrichment.monthlyTimelineMembers || []);

        return members.map((m, idx) => ({
            ...m,
            isPrimary: idx === 0,
            yearCells: cols.map((col) => {
                const evts = m.events
                    .filter((e) => this.isYearlyMode ? e.year === col.key : e.month === col.key)
                    .map((e) => {
                        const highlighted = e.id === this._highlightedPillId;
                        return {
                            ...e,
                            pillClass:        (PILL[e.type] || 'c-event-pill')
                                                + (insightMap[e.id] ? ` c-event-pill_${insightMap[e.id]}` : '')
                                                + (highlighted ? ' c-pill_highlighted' : ''),
                            isGoal:           e.type === 'goal',
                            isFinancial:      e.type === 'financial',
                            quickActionLabel: null, // V2: chip removed — action lives in insight card CTA + popover
                            detail:           (this.enrichment?.eventDetails || {})[e.id] || null,
                            isCritical:       false,
                            isShared:         false,
                            typeDotClass:     TYPE_DOT[e.type]       || 'c-type-dot',
                            iconName:         TYPE_ICON[e.type]      || 'utility:record',
                            iconBadgeClass:   TYPE_ICON_BADGE[e.type]|| 'c-pill-icon-badge',
                        };
                    });

                const milestoneEvts = evts
                    .filter(e => !['meeting', 'engagement'].includes(e.type))
                    .filter(e => !filterType || e.type === filterType);

                const engagementEvts = evts
                    .filter(e => ['meeting', 'engagement'].includes(e.type))
                    .map(e => ({
                        ...e,
                        engDotClass: 'c-eng-dot c-eng-dot_' + e.type,
                        showAsPill:  this.isMonthlyMode || this.isDrillMode,
                    }));

                const uniqueTypes = [...new Set(milestoneEvts.map(e => e.type))];
                const _borderMods =
                      (col.isYearStart && !col.isToday                        ? ' c-timeline-row__cell_year-start' : '')
                    + (col.isQuarterStart && !col.isYearStart && !col.isToday ? ' c-timeline-row__cell_q-start'    : '')
                    + (col.isToday && this.isYearlyMode                       ? ' c-timeline-row__cell_today_yr'   : '')
                    + (col.isToday && !this.isYearlyMode                      ? ' c-timeline-row__cell_today'      : '')
                    + (col.isPredicted                                        ? ' c-timeline-row__cell_predicted'  : '');

                return {
                    key:    `${m.memberId}-${col.key}`,
                    msKey:  `${m.memberId}-${col.key}-ms`,
                    engKey: `${m.memberId}-${col.key}-eng`,
                    year:   col.key,
                    cellClass:           'c-timeline-year-col c-timeline-row__cell c-milestone-cell' + _borderMods,
                    engagementCellClass: 'c-timeline-year-col c-timeline-row__cell c-engagement-cell' + _borderMods,
                    events:           milestoneEvts,
                    eventCount:       milestoneEvts.length,
                    typeDots:         (() => {
                                          // Neutral-blue dots for regular types
                                          const dots = uniqueTypes.map(t => ({ type: t, dotClass: TYPE_DOT[t] || 'c-type-dot' }));
                                          // Add insight-signal dots for any event in this cell that has a gap/alert/opportunity
                                          const insightTypes = [...new Set(
                                              milestoneEvts.map(e => insightMap[e.id]).filter(Boolean)
                                          )];
                                          insightTypes.forEach(t => dots.push({ type: t, dotClass: `c-type-dot c-type-dot_${t}` }));
                                          return dots;
                                      })(),
                    showCount:        this.isYearlyMode && milestoneEvts.length > 0,
                    showEvents:       !this.isYearlyMode,
                    engagementEvents: engagementEvts,
                    hasEngagement:    engagementEvts.length > 0,
                    sparkles:         [],
                    hasSparkles:      false,
                    hasConnectorBelow: false,
                    hasConnectorAbove: false,
                };
            }),
        }));
    }

    // ──────────────────────────────────────────────────────────────
    // renderedCallback — spatial anchoring
    // ──────────────────────────────────────────────────────────────
    renderedCallback() {
        if (this._pendingScrollColIdx !== null && !this._scrollChainActive) {
            const colIdx = this._pendingScrollColIdx;
            this._scrollChainActive = true;
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            requestAnimationFrame(() => this._scrollToColumn(colIdx, 0));
        }
    }

    _scrollToColumn(colIdx, attempt) {
        if (attempt > 15) {
            this._pendingScrollColIdx = null;
            this._scrollChainActive   = false;
            return;
        }
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            const body = this.template.querySelector('.c-group-timeline__body');
            if (!body || body.offsetWidth === 0 || body.scrollWidth <= body.offsetWidth) {
                this._scrollToColumn(colIdx, attempt + 1);
                return;
            }
            const COL_W_PX    = 8.5 * 16;
            const MEMBER_W_PX = 12  * 16;
            const visibleW  = body.offsetWidth - MEMBER_W_PX;
            const colCenter = MEMBER_W_PX + colIdx * COL_W_PX + COL_W_PX / 2;
            const target    = Math.max(0, Math.round(colCenter - MEMBER_W_PX - visibleW / 2));
            body.scrollLeft = target;
            if (body.scrollLeft === 0 && target > 0) {
                this._scrollToColumn(colIdx, attempt + 1);
                return;
            }
            const landedIdx   = Math.max(0, Math.floor((body.scrollLeft) / COL_W_PX));
            const landedMonth = TIMELINE_MONTHS[Math.min(landedIdx, TIMELINE_MONTHS.length - 1)] || '';
            this._scrollVisibleYear   = landedMonth.split(' ')[1] || '';
            this._pendingScrollColIdx = null;
            this._scrollChainActive   = false;
        }, 100 + attempt * 100);
    }

    // ──────────────────────────────────────────────────────────────
    // Mode handlers
    // ──────────────────────────────────────────────────────────────
    handleTimelineMode(event) {
        if (this._drillAnimPhase !== 'idle') return;
        const mode = event.currentTarget.dataset.mode;
        if (mode === this.timelineMode && !this.isDrillMode) return;
        this._drillAnimPhase    = 'leaving';
        this._scrollVisibleYear = '';
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            this.timelineMode    = mode;
            this._drillYear      = null;
            this._expandingYear  = null;
            this._drillAnimPhase = 'entering';
            if (mode === 'monthly') this._pendingScrollColIdx = CURRENT_MONTH_IDX;
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => { this._drillAnimPhase = 'idle'; }, 380);
        }, 270);
    }

    // Keep legacy button handlers in case anything still references them
    handleSetYearly()  { this.timelineMode = 'yearly';  this._drillYear = null; }
    handleSetMonthly() { this.timelineMode = 'monthly'; this._drillYear = null; }

    handleYearExpand(event) {
        event.stopPropagation();
        const year = Number(event.currentTarget.dataset.year);
        if (this._drillAnimPhase !== 'idle') return;
        this._expandingYear  = year;
        this._drillAnimPhase = 'leaving';
        this._scrollVisibleYear = '';
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            this._drillYear      = year;
            this._drillAnimPhase = 'entering';
            this._pendingScrollColIdx = Math.max(0, (year - 2019) * 12);
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => { this._drillAnimPhase = 'idle'; }, 380);
        }, 270);
    }

    handleDrillBack() {
        if (this._drillAnimPhase !== 'idle') return;
        this._drillAnimPhase    = 'leaving';
        this._scrollVisibleYear = '';
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            this._drillYear      = null;
            this._expandingYear  = null;
            this._drillAnimPhase = 'entering';
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => { this._drillAnimPhase = 'idle'; }, 380);
        }, 270);
    }

    // ──────────────────────────────────────────────────────────────
    // New event menu handlers
    // ──────────────────────────────────────────────────────────────
    handleToggleNewMenu(event) {
        event.stopPropagation();
        this._newMenuOpen   = !this._newMenuOpen;
        if (this._newMenuOpen) this._filterMenuOpen = false;
    }

    handleNewMenuSelect(event) {
        event.stopPropagation();
        this._newMenuOpen = false;
        // stub — V2 does not open a modal yet
        console.log('V2 New menu select:', event.currentTarget.dataset.type);
    }

    // ──────────────────────────────────────────────────────────────
    // Agentforce CTA
    // ──────────────────────────────────────────────────────────────
    handleAskAgentforce() {
        this.dispatchEvent(new CustomEvent('panelselect', {
            detail: { name: 'agentforce_panel', defaultAgent: 'financial_advisor' },
            bubbles: true,
            composed: true,
        }));
    }

    // ──────────────────────────────────────────────────────────────
    // Filter menu handlers
    // ──────────────────────────────────────────────────────────────
    handleToggleFilterMenu(event) {
        event.stopPropagation();
        this._filterMenuOpen = !this._filterMenuOpen;
        if (this._filterMenuOpen) this._newMenuOpen = false;
    }

    handleSetFilter(event) {
        event.stopPropagation();
        this._activeFilter   = event.currentTarget.dataset.value;
        this._filterMenuOpen = false;
    }

    // ──────────────────────────────────────────────────────────────
    // Timeline Insights handlers
    // ──────────────────────────────────────────────────────────────
    handleToggleTlInsights() {
        this._tlInsightsOpen = !this._tlInsightsOpen;
        if (!this._tlInsightsOpen) {
            this._highlightedPillId      = null;
            this._highlightedActionLabel = null;
        }
    }

    handleInsightCardClick(event) {
        const eventId = event.currentTarget.dataset.eventId;
        if (!eventId) return;
        const isSame = this._highlightedPillId === eventId;
        this._highlightedPillId      = isSame ? null : eventId;
        this._highlightedActionLabel = isSame ? null : (() => {
            const h = this.tlInsightsHighlights.find(i => i.timelineEventId === eventId);
            return h ? h.actionLabel : null;
        })();
        // Close any existing popover before navigating; it will re-open at the new pill
        this.popoverVisible   = false;
        this.popoverEventData = null;

        if (!this._highlightedPillId) return;

        // If in yearly overview, pills aren't in the DOM — auto-drill into the event's year first
        if (this.isYearlyMode) {
            const members = this.enrichment?.timelineMembers || [];
            let targetYear = null;
            for (const m of members) {
                const e = (m.events || []).find((ev) => ev.id === eventId);
                if (e) { targetYear = e.year; break; }
            }
            if (targetYear) {
                this._expandingYear  = targetYear;
                this._drillAnimPhase = 'leaving';
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                setTimeout(() => {
                    this._drillYear      = targetYear;
                    this._drillAnimPhase = 'entering';
                    this._pendingScrollColIdx = Math.max(0, (targetYear - 2019) * 12);
                    // eslint-disable-next-line @lwc/lwc/no-async-operation
                    setTimeout(() => {
                        this._drillAnimPhase = 'idle';
                        this._v2ScrollAndReveal(eventId);
                    }, 420);
                }, 270);
                return;
            }
        }
        // Monthly / drill mode — pills in DOM, scroll after repaint
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        requestAnimationFrame(() => { this._v2ScrollAndReveal(eventId); });
    }

    /** Scroll the highlighted pill into view, then open its detail popover.
     *  Uses .c-event-pill as a scope guard so insight-card divs (which also
     *  carry data-event-id and appear earlier in the DOM) are never matched. */
    _v2ScrollAndReveal(eventId) {
        const pillEl = this.template.querySelector(`.c-event-pill[data-event-id="${eventId}"]`);
        if (!pillEl) return;
        pillEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        // Open the detail popover after the smooth-scroll animation settles (~500 ms)
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => { this._v2OpenPopoverForPill(eventId); }, 500);
    }

    /** Programmatically open the event-detail popover for a pill identified by eventId.
     *  Mirrors the position logic in handlePillClick but works without a click event. */
    _v2OpenPopoverForPill(eventId) {
        const pillEl = this.template.querySelector(`.c-event-pill[data-event-id="${eventId}"]`);
        if (!pillEl) return;

        const layout = this._computePopoverLayout(pillEl.getBoundingClientRect());
        this.popoverPanelStyle = layout.panelStyle;
        this.popoverArrowRight = layout.arrowRight;
        this.popoverArrowTopPx = layout.arrowTopPx;

        // Find the matching event in the current timelineRows
        let found = null;
        for (const row of this.timelineRows) {
            for (const cell of row.yearCells) {
                const ev = cell.events.find(ev => ev.id === eventId)
                        || (cell.engagementEvents || []).find(ev => ev.id === eventId);
                if (ev) { found = ev; break; }
            }
            if (found) break;
        }
        if (!found) return;

        this.popoverEventData   = found;
        this.popoverIconBgColor = this._pillIconBgColor(found.id);
        this.popoverVisible     = true;
    }

    handleInsightCta(event) {
        // Stop the click from also triggering handleInsightCardClick (highlight/scroll)
        event.stopPropagation();
        const action = event.currentTarget.dataset.action;
        if (!action) return;
        // Bubble to parent (accountDetail) which owns all modals
        this.dispatchEvent(new CustomEvent('highlightaction', {
            detail: { action },
            bubbles: true,
            composed: true,
        }));
    }

    handleHighlightAction(event) {
        const action = event.currentTarget.dataset.action;
        if (!action) return;
        // Bubble the action up to the parent page (accountDetail) which owns the modals
        this.dispatchEvent(new CustomEvent('highlightaction', {
            detail: { action },
            bubbles: true,
            composed: true,
        }));
    }

    // ──────────────────────────────────────────────────────────────
    // Timeline scroll → breadcrumb
    // ──────────────────────────────────────────────────────────────
    handleTimelineScroll(event) {
        if (!this.isMonthlyMode && !this.isDrillMode) return;
        const scrollLeft  = event.currentTarget.scrollLeft;
        const COL_W_PX    = 8.5 * 16;
        const MEMBER_W_PX = 12  * 16;
        const colIdx = Math.max(0, Math.floor((scrollLeft - MEMBER_W_PX + COL_W_PX * 0.5) / COL_W_PX));
        const ms    = TIMELINE_MONTHS[Math.min(colIdx, TIMELINE_MONTHS.length - 1)] || '';
        const [mon = '', label = ''] = ms.split(' ');
        if (label !== this._scrollVisibleYear)  this._scrollVisibleYear  = label;
        if (mon   !== this._scrollVisibleMonth) this._scrollVisibleMonth = mon;
    }

    // ──────────────────────────────────────────────────────────────
    // Timeline cell click (context menu stub)
    // ──────────────────────────────────────────────────────────────
    handleTimelineCellClick() { /* stub — no context menu in V2 yet */ }

    // ──────────────────────────────────────────────────────────────
    // Shared viewport-safe layout helper
    // ──────────────────────────────────────────────────────────────
    /**
     * Compute a viewport-clamped panel position and an arrow offset that keeps
     * the tip pointing at the pill even after the panel has been pushed away from
     * the viewport edge.
     *
     * Returns { panelStyle, arrowRight, arrowTopPx }
     * — panelStyle uses an absolute `top` (no translateY needed)
     * — arrowTopPx is the pixel offset from the panel top for the arrow tip
     */
    _computePopoverLayout(rect) {
        const POPOVER_WIDTH  = 410;
        const POPOVER_H_EST  = 500; // conservative height estimate (max-height is 580px)
        const MARGIN         = 8;

        // Horizontal
        let left = rect.right + 14;
        let arrowRight = false;
        if (left + POPOVER_WIDTH > window.innerWidth - MARGIN) {
            left = rect.left - POPOVER_WIDTH - 4;
            arrowRight = true;
        }
        left = Math.max(MARGIN, left);

        // Vertical: center on pill, then clamp so panel stays within viewport
        const pillCenterY = rect.top + rect.height / 2;
        const idealTop    = pillCenterY - POPOVER_H_EST / 2;
        const top         = Math.max(MARGIN, Math.min(idealTop, window.innerHeight - POPOVER_H_EST - MARGIN));

        // Arrow tip: how far from the panel's top edge should it sit?
        const arrowY    = pillCenterY - top;
        // Keep arrow at least 20px inside the panel on both ends
        const arrowTopPx = Math.max(20, Math.min(arrowY, POPOVER_H_EST - 20));

        return {
            panelStyle: `top: ${top}px; left: ${left}px;`,
            arrowRight,
            arrowTopPx,
        };
    }

    // ──────────────────────────────────────────────────────────────
    // Pill click → popover
    // ──────────────────────────────────────────────────────────────
    handlePillClick(event) {
        event.stopPropagation();
        const rect   = event.currentTarget.getBoundingClientRect();
        const layout = this._computePopoverLayout(rect);
        this.popoverPanelStyle = layout.panelStyle;
        this.popoverArrowRight = layout.arrowRight;
        this.popoverArrowTopPx = layout.arrowTopPx;
        const eventId = event.currentTarget.dataset.eventId;
        let found = null;
        for (const row of this.timelineRows) {
            for (const cell of row.yearCells) {
                const ev = cell.events.find(ev => ev.id === eventId) || cell.engagementEvents.find(ev => ev.id === eventId);
                if (ev) { found = ev; break; }
            }
            if (found) break;
        }
        if (!found) return;
        this.popoverEventData   = found;
        this.popoverIconBgColor = this._pillIconBgColor(found.id);
        this.popoverVisible     = true;
    }

    /** Returns the avatar icon background colour for the popover based on insight type. */
    _pillIconBgColor(eventId) {
        const INSIGHT_COLORS = {
            gap:         '#f59e0b', // amber — matches c-event-pill_gap border
            alert:       '#f87171', // red   — matches c-event-pill_alert border
            opportunity: '#4ade80', // green — matches c-event-pill_opportunity border
        };
        const insightType = this._insightPillMap[eventId];
        // intentional static: #2272b6 — accessible neutral blue matching V2 pill border
        return INSIGHT_COLORS[insightType] || '#2272b6';
    }

    handleClosePopover()  { this.popoverVisible = false; this.popoverEventData = null; }
    handlePopoverCta(event) {
        const action = event?.detail?.action;
        this.handleClosePopover();
        if (!action) return;
        // Delegate to parent (accountDetail) which owns the modals
        this.dispatchEvent(new CustomEvent('highlightaction', {
            detail: { action },
            bubbles: true,
            composed: true,
        }));
    }

    handlePillQuickAction(event) {
        event.stopPropagation();
        const action = event.currentTarget.dataset.action;
        this._highlightedPillId      = null;
        this._highlightedActionLabel = null;
        console.log('V2 quick action:', action); // stub
    }

    // ──────────────────────────────────────────────────────────────
    // Sparkle popover (stub)
    // ──────────────────────────────────────────────────────────────
    handleSparkleClick()        { /* stub */ }
    handleCloseSparklePopover() { this.sparklePopoverSug = null; }
}
