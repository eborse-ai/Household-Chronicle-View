import { LightningElement, api } from 'lwc';
import { linkHref } from '../../../router';

export default class WorkspaceTabBar extends LightningElement {
    @api tabs = [];
    @api activeTabId = null;

    get hasTabs() {
        return this.tabs && this.tabs.length > 0;
    }

    get tabsWithState() {
        return (this.tabs || []).map((tab) => {
            const isActive = tab.id === this.activeTabId;
            return {
                ...tab,
                href: linkHref(tab.path),
                isActive,
                itemClass: isActive
                    ? 'c-workspace-tab c-workspace-tab-active'
                    : 'c-workspace-tab',
                ariaSelected: isActive ? 'true' : 'false',
            };
        });
    }

    handleTabClick(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.id;
        this.dispatchEvent(
            new CustomEvent('tabactivate', {
                detail: { id },
                bubbles: true,
                composed: true,
            })
        );
    }

    handleTabClose(event) {
        event.preventDefault();
        event.stopPropagation();
        const id = event.currentTarget.dataset.id;
        this.dispatchEvent(
            new CustomEvent('tabclose', {
                detail: { id },
                bubbles: true,
                composed: true,
            })
        );
    }
}
