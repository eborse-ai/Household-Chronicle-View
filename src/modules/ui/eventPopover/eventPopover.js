import { LightningElement, api, track } from 'lwc';

const TYPE_INFO = {
    life:        { label: 'LIFE EVENT',        icon: 'utility:event',      avatarClass: 'c-ep-avatar c-ep-avatar_life'        },
    meeting:     { label: 'MEETING',           icon: 'utility:date_input', avatarClass: 'c-ep-avatar c-ep-avatar_meeting'     },
    transaction: { label: 'TRANSACTION',       icon: 'utility:moneybag',   avatarClass: 'c-ep-avatar c-ep-avatar_transaction' },
    goal:        { label: 'FINANCIAL GOAL',    icon: 'utility:priority',   avatarClass: 'c-ep-avatar c-ep-avatar_goal'        },
    financial:   { label: 'FINANCIAL ACCOUNT', icon: 'utility:company',    avatarClass: 'c-ep-avatar c-ep-avatar_financial'   },
    engagement:  { label: 'ENGAGEMENT',        icon: 'utility:people',    avatarClass: 'c-ep-avatar c-ep-avatar_engagement'  },
};

export default class EventPopover extends LightningElement {
    /** Full event object (including .detail) from the timeline */
    @api eventData;
    /** CSS position string — "top: Xpx; left: Ypx;" */
    @api panelStyle;
    /** Whether the popover arrow is on the right (popover appears to the left of pill) */
    @api arrowRight = false;

    @track _aiDismissed = false;

    get typeInfo() {
        return TYPE_INFO[this.eventData?.type] || TYPE_INFO.financial;
    }

    get detail() {
        return this.eventData?.detail || {};
    }

    get title() {
        return this.eventData?.label || '';
    }

    get showAiCard() {
        return !this._aiDismissed
            && !!this.detail.isCritical
            && (!!this.detail.aiInsight || !!this.detail.sentimentInsights?.length);
    }

    get hasSentimentInsights() {
        return !!(this.detail.sentimentInsights && this.detail.sentimentInsights.length);
    }

    get isLifeEvent() {
        return this.eventData?.type === 'life';
    }

    get isGoalEvent() {
        return this.eventData?.type === 'goal';
    }

    get isFinancialEvent() {
        return this.eventData?.type === 'financial';
    }

    get isEngagementEvent() {
        return this.eventData?.type === 'engagement';
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

    get arrowClass() {
        return this.arrowRight ? 'c-ep-arrow c-ep-arrow_right' : 'c-ep-arrow c-ep-arrow_left';
    }

    handleDismissAi() {
        this._aiDismissed = true;
    }

    handleCtaClick() {
        this.dispatchEvent(new CustomEvent('ctaclick', {
            detail: { action: this.detail.aiActionLabel },
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
