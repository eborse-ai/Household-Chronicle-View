import { LightningElement } from 'lwc';
import { getAllAccounts } from 'data/accounts';

const COLUMNS = [
    {
        label: 'Account Name',
        fieldName: 'name',
        type: 'button',
        sortable: true,
        typeAttributes: {
            label: { fieldName: 'name' },
            variant: 'base',
            name: 'view',
        },
    },
    { label: 'Type', fieldName: 'type', sortable: true },
    { label: 'Members', fieldName: 'members', sortable: false, wrapText: true },
    { label: 'Member Count', fieldName: 'memberCount', type: 'number', sortable: true },
    { label: 'Billing City', fieldName: 'billingCity', sortable: true },
    { label: 'Billing State', fieldName: 'billingState', sortable: true },
    { label: 'Phone', fieldName: 'phone', type: 'phone' },
    { label: 'Rating', fieldName: 'rating', sortable: true },
    { label: 'Owner', fieldName: 'owner', sortable: true },
    {
        label: 'Total Giving',
        fieldName: 'totalGiving',
        type: 'currency',
        sortable: true,
        typeAttributes: { currencyCode: 'USD', minimumFractionDigits: 0 },
    },
    { label: 'Last Activity', fieldName: 'lastActivityDate', type: 'date', sortable: true },
    {
        type: 'action',
        typeAttributes: {
            rowActions: [
                { label: 'View', name: 'view' },
                { label: 'Edit', name: 'edit' },
                { label: 'Delete', name: 'delete' },
            ],
        },
    },
];

export default class Accounts extends LightningElement {
    columns = COLUMNS;
    data = [];
    sortedBy = 'name';
    sortedDirection = 'asc';
    searchTerm = '';

    connectedCallback() {
        this.data = getAllAccounts();
    }

    get filteredData() {
        if (!this.searchTerm) {
            return this.data;
        }
        const term = this.searchTerm.toLowerCase();
        return this.data.filter(
            (acct) =>
                acct.name.toLowerCase().includes(term) ||
                acct.members.toLowerCase().includes(term) ||
                acct.billingCity.toLowerCase().includes(term) ||
                acct.owner.toLowerCase().includes(term)
        );
    }

    get metaText() {
        const count = this.filteredData.length;
        const sortField = this.columns.find((c) => c.fieldName === this.sortedBy)?.label;
        let text = `${count} item${count !== 1 ? 's' : ''}`;
        if (sortField) {
            text += ` \u2022 Sorted by ${sortField}`;
        }
        text += ' \u2022 Updated a few seconds ago';
        return text;
    }

    handleSearch(event) {
        this.searchTerm = event.detail.value;
    }

    handleSort(event) {
        const { fieldName, sortDirection } = event.detail;
        const clonedData = [...this.data];

        clonedData.sort((a, b) => {
            let aVal = a[fieldName] ?? '';
            let bVal = b[fieldName] ?? '';

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.data = clonedData;
        this.sortedBy = fieldName;
        this.sortedDirection = sortDirection;
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        if (action.name === 'view') {
            this.dispatchEvent(
                new CustomEvent('opentab', {
                    detail: {
                        id: row.id,
                        label: row.name,
                        iconName: 'standard:account',
                        path: `/accounts/${row.id}`,
                    },
                    bubbles: true,
                    composed: true,
                })
            );
        } else if (action.name === 'delete') {
            this.data = this.data.filter((item) => item.id !== row.id);
        }
    }
}
