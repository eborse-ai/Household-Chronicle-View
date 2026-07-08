import { api, track } from 'lwc';
import LightningModal from 'lightning/modal';

const TYPE_INFO = {
    life:        { label: 'LIFE EVENT',        icon: 'utility:event',      avatarClass: 'c-emodal-avatar c-emodal-avatar_life'        },
    meeting:     { label: 'MEETING',           icon: 'utility:date_input', avatarClass: 'c-emodal-avatar c-emodal-avatar_meeting'     },
    transaction: { label: 'TRANSACTION',       icon: 'utility:moneybag',   avatarClass: 'c-emodal-avatar c-emodal-avatar_transaction' },
    goal:        { label: 'FINANCIAL GOAL',    icon: 'utility:target',     avatarClass: 'c-emodal-avatar c-emodal-avatar_goal'        },
    financial:   { label: 'FINANCIAL ACCOUNT', icon: 'utility:account',    avatarClass: 'c-emodal-avatar c-emodal-avatar_financial'   },
};

export default class EventDetailModal extends LightningModal {
    @api eventData;

    @track _aiDismissed = false;

    get typeInfo() {
        return TYPE_INFO[this.eventData?.type] || TYPE_INFO.financial;
    }

    get detail() {
        return this.eventData?.detail || {};
    }

    get showAiCard() {
        return !this._aiDismissed && !!this.detail.aiInsight;
    }

    get showCashFlow() {
        return !!(this.detail.cashFlowImpact || this.detail.beneficiaries);
    }

    get statusClass() {
        const s = (this.detail.status || '').toLowerCase();
        if (s === 'at risk')        return 'c-emodal-status c-emodal-status_risk';
        if (s === 'no plan update') return 'c-emodal-status c-emodal-status_warn';
        if (s === 'scheduled')      return 'c-emodal-status c-emodal-status_info';
        if (s === 'predicted')      return 'c-emodal-status c-emodal-status_neutral';
        return 'c-emodal-status';
    }

    handleDismissAi() {
        this._aiDismissed = true;
    }

    handleClose() {
        this.close();
    }
}
