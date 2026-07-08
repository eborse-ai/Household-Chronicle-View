import { LightningElement, api } from 'lwc';

export default class AiSuggestionsPanel extends LightningElement {
    @api suggestions        = [];
    @api focusedSuggestionId = null;

    get pendingCount() {
        return (this.suggestions || []).filter((s) => !s.isAdded).length;
    }

    /* After every render, scroll the focused card into view */
    renderedCallback() {
        if (!this.focusedSuggestionId) return;
        const card = this.template.querySelector(`[data-sug-id="${this.focusedSuggestionId}"]`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleAdd(event) {
        const id = event.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('add', { detail: { id } }));
    }

    handleDismiss(event) {
        const id = event.currentTarget.dataset.id;
        this.dispatchEvent(new CustomEvent('dismiss', { detail: { id } }));
    }

    handleBackdropClick() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}
