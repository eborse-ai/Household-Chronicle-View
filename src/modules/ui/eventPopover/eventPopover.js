import { LightningElement, api, track } from 'lwc';

const TYPE_INFO = {
    life:        { label: 'LIFE EVENT',        icon: 'utility:event',      avatarClass: 'c-ep-avatar c-ep-avatar_life'        },
    meeting:     { label: 'MEETING',           icon: 'utility:people',     avatarClass: 'c-ep-avatar c-ep-avatar_meeting'     },
    call:        { label: 'CALL',              icon: 'utility:call',       avatarClass: 'c-ep-avatar c-ep-avatar_call'        },
    transaction: { label: 'TRANSACTION',       icon: 'utility:moneybag',   avatarClass: 'c-ep-avatar c-ep-avatar_transaction' },
    goal:        { label: 'FINANCIAL GOAL',    icon: 'utility:priority',   avatarClass: 'c-ep-avatar c-ep-avatar_goal'        },
    financial:   { label: 'FINANCIAL ACCOUNT', icon: 'utility:company',    avatarClass: 'c-ep-avatar c-ep-avatar_financial'   },
    engagement:  { label: 'ENGAGEMENT',        icon: 'utility:people',    avatarClass: 'c-ep-avatar c-ep-avatar_engagement'  },
    opportunity: { label: 'OPPORTUNITY',       icon: 'utility:sparkle',    avatarClass: 'c-ep-avatar c-ep-avatar_opportunity' },
};

export default class EventPopover extends LightningElement {
    /** Full event object (including .detail) from the timeline */
    @api
    get eventData() { return this._eventData; }
    set eventData(val) {
        // Reset AI dismissed state whenever a new event is loaded
        if (val?.id !== this._eventData?.id || val?.detail?.aiInsight !== this._eventData?.detail?.aiInsight) {
            this._aiDismissed = false;
        }
        this._eventData = val;
    }
    _eventData = null;

    /** CSS position string — "top: Xpx; left: Ypx;" */
    @api panelStyle;
    /** Whether the popover arrow is on the right (popover appears to the left of pill) */
    @api arrowRight = false;
    /**
     * When true the panel uses no vertical centering transform (position is pre-clamped
     * by the caller — V2 uses this so the panel never overflows the viewport).
     */
    /** Optional override for the avatar icon circle background colour (e.g. neutral blue in V2) */
    @api iconBgColor = null;

    @api noCenter = false;
    /**
     * Pixel offset from the panel top where the arrow tip should sit.
     * When null (default) the arrow stays at 50% (centred) via CSS.
     */
    @api arrowTopPx  = null;
    @api aiCardGate;   // undefined = default (show if aiInsight exists); false = always hide

    @track _aiDismissed = false;

    get typeInfo() {
        return TYPE_INFO[this._eventData?.type] || TYPE_INFO.financial;
    }

    /** Inline background override for the avatar circle; null = use CSS type class colour */
    get avatarStyle() {
        return this.iconBgColor ? `background: ${this.iconBgColor};` : null;
    }

    get detail() {
        return this._eventData?.detail || {};
    }

    get title() {
        return this._eventData?.label || '';
    }

    get showAiCard() {
        if (this.aiCardGate === false) return false;
        return !this._aiDismissed
            && (!!this.detail.aiInsight || !!this.detail.sentimentInsights?.length);
    }

    get hasSentimentInsights() {
        return !!(this.detail.sentimentInsights && this.detail.sentimentInsights.length);
    }

    get isLifeEvent() {
        return this._eventData?.type === 'life';
    }

    get isGoalEvent() {
        return this._eventData?.type === 'goal';
    }

    get isFinancialEvent() {
        return this._eventData?.type === 'financial';
    }

    get isEngagementEvent() {
        return this._eventData?.type === 'engagement';
    }

    // ── Goal bespoke card getters ─────────────────────────────────
    get goalProgressPct() {
        const d = this.detail;
        const actual = parseFloat((d.actualAmount || '').replace(/[$,]/g, '')) || 0;
        const target = parseFloat((d.targetAmount || '').replace(/[$,]/g, '')) || 1;
        return Math.min(100, Math.round((actual / target) * 100));
    }

    get goalProgressBarStyle() {
        return `width: ${this.goalProgressPct}%`;
    }

    get goalPaceClass() {
        const pace = (this.detail.pace || '').toLowerCase();
        if (pace === 'on track')  return 'c-ep-goal-pace c-ep-goal-pace_ontrack';
        if (pace === 'behind')    return 'c-ep-goal-pace c-ep-goal-pace_behind';
        return 'c-ep-goal-pace c-ep-goal-pace_neutral';
    }

    get todayMarkerStyle() {
        const pct = this.detail.todayPct || 0;
        return `left: ${pct}%`;
    }

    get hasCompetingGoals() {
        return !!(this.detail.competingGoals && this.detail.competingGoals.length);
    }

    get hasLinkedAccount() {
        return !!this.detail.linkedAccount;
    }

    get showCashFlow() {
        return !this.isLifeEvent && !this.isGoalEvent && !this.isFinancialEvent && !this.isEngagementEvent
            && !!(this.detail.cashFlowImpact || this.detail.beneficiaries);
    }

    get statusClass() {
        const s = (this.detail.status || '').toLowerCase();
        if (s === 'at risk')        return 'c-ep-status c-ep-status_risk';
        if (s === 'no plan update') return 'c-ep-status c-ep-status_warn';
        if (s === 'scheduled')      return 'c-ep-status c-ep-status_info';
        if (s === 'predicted')      return 'c-ep-status c-ep-status_neutral';
        return 'c-ep-status';
    }

    get panelClass() {
        return 'c-ep-panel' + (this.noCenter ? ' c-ep-panel_no-center' : '');
    }

    get arrowClass() {
        return this.arrowRight ? 'c-ep-arrow c-ep-arrow_right' : 'c-ep-arrow c-ep-arrow_left';
    }

    /** Inline style for the arrow — overrides the default top:50% when arrowTopPx is set. */
    get arrowStyle() {
        if (this.arrowTopPx == null) return '';
        // rotate(45deg) is already in CSS; only override the top value
        return `top: ${this.arrowTopPx}px; transform: translateY(-50%) rotate(45deg);`;
    }

    handleDismissAi() {
        this._aiDismissed = true;
    }

    handleCtaClick() {
        this.dispatchEvent(new CustomEvent('ctaclick', {
            detail: { action: this.detail.aiActionLabel, sourceId: this._eventData?.id },
            bubbles: true,
            composed: true,
        }));
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleBackdropClick() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}
