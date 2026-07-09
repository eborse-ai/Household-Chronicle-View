import { LightningElement, api, track } from 'lwc';

const TYPE_INFO = {
    life:        { label: 'LIFE EVENT',        icon: 'utility:event',      avatarClass: 'c-ep-avatar c-ep-avatar_life'        },
    meeting:     { label: 'MEETING',           icon: 'utility:date_input', avatarClass: 'c-ep-avatar c-ep-avatar_meeting'     },
    transaction: { label: 'TRANSACTION',       icon: 'utility:moneybag',   avatarClass: 'c-ep-avatar c-ep-avatar_transaction' },
    goal:        { label: 'FINANCIAL GOAL',    icon: 'utility:priority',   avatarClass: 'c-ep-avatar c-ep-avatar_goal'        },
    financial:   { label: 'FINANCIAL ACCOUNT', icon: 'standard:financial_account', avatarClass: 'c-ep-avatar c-ep-avatar_financial'   },
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
        return !this._aiDismissed && (!!this.detail.aiInsight || !!this.detail.sentimentInsights?.length);
    }

    get hasSentimentInsights() {
        return !!(this.detail.sentimentInsights && this.detail.sentimentInsights.length);
    }

    get showCashFlow() {
        return !!(this.detail.cashFlowImpact || this.detail.beneficiaries);
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

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleBackdropClick() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}
