import { LightningElement, track } from 'lwc';

export default class GlobalHeader extends LightningElement {

    @track _version = 'v1';

    get v1BtnClass() { return 'c-gh-ver-btn' + (this._version === 'v1' ? ' c-gh-ver-btn_active' : ''); }
    get v2BtnClass() { return 'c-gh-ver-btn' + (this._version === 'v2' ? ' c-gh-ver-btn_active' : ''); }
    get v3BtnClass() { return 'c-gh-ver-btn' + (this._version === 'v3' ? ' c-gh-ver-btn_active' : ''); }
    get v4BtnClass() { return 'c-gh-ver-btn' + (this._version === 'v4' ? ' c-gh-ver-btn_active' : ''); }

    handleVersionToggle(event) {
        const version = event.currentTarget.dataset.version;
        this._version = version;
        // Broadcast to any listening page component via a window-level event
        window.dispatchEvent(new CustomEvent('chronicleversionchange', { detail: { version } }));
    }

    handleAgentforceClick() {
        this.dispatchEvent(new CustomEvent('panelselect', {
            detail: { name: 'agentforce_panel', defaultAgent: 'agentforce' },
            bubbles: true,
            composed: true
        }));
    }

    handleTrailheadClick() {
        this.dispatchEvent(new CustomEvent('panelselect', {
            detail: { name: 'trailhead_panel' },
            bubbles: true,
            composed: true
        }));
    }

    handleSettingsClick() {
        this.dispatchEvent(new CustomEvent('panelselect', {
            detail: { name: 'settings_panel' },
            bubbles: true,
            composed: true
        }));
    }

    handleNotificationClick() {
        this.dispatchEvent(new CustomEvent('panelselect', {
            detail: { name: 'notification_panel' },
            bubbles: true,
            composed: true
        }));
    }
}