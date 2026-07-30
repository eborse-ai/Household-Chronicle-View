import { LightningElement, api, track } from 'lwc';

export default class AgentforcePanel extends LightningElement {
    /** Set by the app shell based on which trigger opened the panel.
     *  Uses a setter so the panel reacts instantly when the prop changes
     *  (e.g. switching from Financial Advisor → Agentforce without remounting). */
    @api
    get defaultAgent() { return this._defaultAgent; }
    set defaultAgent(value) {
        this._defaultAgent  = value || 'agentforce';
        this._agentType     = this._defaultAgent;
        this._pendingAgent  = this._defaultAgent;
        this._agentSwitcherOpen = false; // close switcher on agent switch
    }
    _defaultAgent = 'agentforce';

    @track _agentType         = 'agentforce';
    @track _agentSwitcherOpen = false;
    @track _pendingAgent      = 'agentforce'; // staged selection before confirming

    // ── Getters ──────────────────────────────────────────────────
    get agentTitle() {
        return this._agentType === 'agentforce' ? 'Agentforce' : 'Financial Advisor Assistant';
    }

    get agentSwitcherOpen() { return this._agentSwitcherOpen; }

    get isAgentforcePending()       { return this._pendingAgent === 'agentforce'; }
    get isFinancialAdvisorPending() { return this._pendingAgent === 'financial_advisor'; }

    get agentforceOptionClass() {
        return 'c-af-agent-option-row' + (this._pendingAgent === 'agentforce' ? ' c-af-agent-option-row_selected' : '');
    }

    get financialAdvisorOptionClass() {
        return 'c-af-agent-option-row' + (this._pendingAgent === 'financial_advisor' ? ' c-af-agent-option-row_selected' : '');
    }

    get agentDesc() {
        return this._agentType === 'agentforce'
            ? 'Hi, I\'m Agentforce! I can do things like search for information, summarize records, and draft and revise emails. What can I help you with?'
            : 'Hi, I\'m your Financial Advisor Assistant! I can analyse household plans, model financial goals, surface planning gaps, and help prepare for client conversations. What can I help you with?';
    }

    get suggestions() {
        if (this._agentType === 'agentforce') {
            // Generic prompts for the header-triggered Agentforce panel
            return [
                { id: 's1', label: '"Summarize this record"' },
                { id: 's2', label: '"What are the next steps?"' },
                { id: 's3', label: '"Help me draft a message"' },
            ];
        }
        // Finance-specific prompts for the in-page Financial Advisor Assistant panel
        return [
            { id: 's1', label: '"Summarize the last 12 months in five lines."' },
            { id: 's2', label: '"Any goals at risk?"' },
            { id: 's3', label: '"Anything time-sensitive I should act on?"' },
        ];
    }

    // ── Handlers ─────────────────────────────────────────────────
    handleClose() {
        this.dispatchEvent(new CustomEvent('panelclose', { bubbles: true, composed: true }));
    }

    handleToggleAgentSwitcher(event) {
        event.stopPropagation();
        this._pendingAgent    = this._agentType; // reset pending to current on open
        this._agentSwitcherOpen = !this._agentSwitcherOpen;
    }

    handlePendingAgentSelect(event) {
        event.stopPropagation();
        this._pendingAgent = event.currentTarget.dataset.agent;
    }

    handleConfirmAgent(event) {
        event.stopPropagation();
        this._agentType         = this._pendingAgent;
        this._agentSwitcherOpen = false;
    }

    handleCancelAgentSwitcher(event) {
        event.stopPropagation();
        this._agentSwitcherOpen = false;
    }

    handleStopProp(event) {
        event.stopPropagation();
    }
}
