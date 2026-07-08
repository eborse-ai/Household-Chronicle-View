import { LightningElement, api, track } from 'lwc';

const ZOOM_STEPS = [50, 75, 100, 125, 150];

export default class RelationshipMap extends LightningElement {
    @api accountName = '';
    @api members = [];
    @api recommendations = [];

    isMembersExpanded = true;
    _zoomIndex = 2; // default 100%

    // First member starts expanded by default
    @track _expandedMemberIds = { rm1: true };

    @track _showRecsPanel  = false;
    @track _isRefreshing   = false;
    @track _dismissedIds   = {};
    @track _addedIds       = {};
    @track _dismissToast   = null;   // { name } while visible
    _toastTimer            = null;
    @track _addModalRec       = null;   // rec under review in the add-modal
    @track _modalStep         = 1;      // 1 = select/no-record, 2 = add details / create form
    @track _selectedRecordIdx = null;   // index of chosen duplicate
    @track _modalRole         = '';
    @track _modalStatus       = 'Active';
    @track _modalSalutation   = 'Mr';
    @track _modalFirstName    = '';
    @track _modalLastName     = '';

    // ── Members ─────────────────────────────────────────────────

    get memberCount() {
        return (this.members || []).length;
    }

    get membersChevron() {
        return this.isMembersExpanded ? 'utility:chevrondown' : 'utility:chevronright';
    }

    get decoratedMembers() {
        return (this.members || []).map(m => ({
            ...m,
            isExpanded:  !!this._expandedMemberIds[m.id],
            chevronIcon: this._expandedMemberIds[m.id] ? 'utility:chevrondown' : 'utility:chevronright',
            cardClass:   'c-rel-map-member-card' + (this._expandedMemberIds[m.id] ? ' c-rel-map-member-card_open' : ''),
        }));
    }

    handleToggleMembers() {
        this.isMembersExpanded = !this.isMembersExpanded;
    }

    handleToggleMember(event) {
        const id = event.currentTarget.dataset.id;
        this._expandedMemberIds = {
            ...this._expandedMemberIds,
            [id]: !this._expandedMemberIds[id],
        };
    }

    handleStopProp(event) {
        event.stopPropagation();
    }

    // ── Zoom ────────────────────────────────────────────────────

    get zoomLabel() {
        return `${ZOOM_STEPS[this._zoomIndex]}%`;
    }

    handleZoomIn() {
        if (this._zoomIndex < ZOOM_STEPS.length - 1) {
            this._zoomIndex += 1;
        }
    }

    handleZoomOut() {
        if (this._zoomIndex > 0) {
            this._zoomIndex -= 1;
        }
    }

    // ── Recommendations panel ────────────────────────────────────

    get pendingCount() {
        let count = 0;
        (this.recommendations || []).forEach(group => {
            (group.items || []).forEach(item => {
                if (!this._dismissedIds[item.id]) {
                    count++;
                }
            });
        });
        return count;
    }

    get hasPending() {
        return this.pendingCount > 0;
    }

    get pendingLabel() {
        const n = this.pendingCount;
        return `${n} pending suggestion${n !== 1 ? 's' : ''} · Last refreshed just now`;
    }

    get showRecsBtnLabel() {
        return this._showRecsPanel ? 'Hide Recommendations' : 'Show Recommendations';
    }

    /** Decorated recommendation groups with per-item computed fields */
    get decoratedGroups() {
        return (this.recommendations || []).map(group => {
            const items = (group.items || []).map(item => ({
                ...item,
                isDismissed:         !!this._dismissedIds[item.id],
                isAdded:             !!this._addedIds[item.id],
                addBtnClass:         this._addedIds[item.id] ? 'c-rm-rec-add-btn c-rm-rec-add-btn_added' : 'c-rm-rec-add-btn',
                addBtnLabel:         this._addedIds[item.id] ? '✓' : '+',
                sourceBadgeClass:    this._sourceBadgeClass(item.sourceType),
                confidenceBadgeClass: this._confidenceBadgeClass(item.confidenceType),
            })).filter(item => !item.isDismissed);
            return { ...group, items, hasItems: items.length > 0 };
        }).filter(g => g.hasItems);
    }

    /** Flat list of all recommendation items, enriched with their group category */
    get _allRecsFlat() {
        const out = [];
        (this.recommendations || []).forEach(group => {
            (group.items || []).forEach(item => out.push({ ...item, groupCategory: group.category }));
        });
        return out;
    }

    get addedMembers() {
        return this._allRecsFlat.filter(r => this._addedIds[r.id] && r.groupCategory === 'Members');
    }

    get addedContacts() {
        return this._allRecsFlat.filter(r => this._addedIds[r.id] && r.groupCategory === 'Related Contacts');
    }

    get addedAccounts() {
        return this._allRecsFlat.filter(r => this._addedIds[r.id] && r.groupCategory === 'Related Accounts');
    }

    get contactsCount() { return this.addedContacts.length; }
    get accountsCount()  { return this.addedAccounts.length; }
    get hasAddedContacts() { return this.contactsCount > 0; }
    get hasAddedAccounts() { return this.accountsCount > 0; }

    _sourceBadgeClass(type) {
        if (type === 'new')      return 'c-rm-rec-badge c-rm-rec-badge_source c-rm-rec-badge_new';
        if (type === 'multiple') return 'c-rm-rec-badge c-rm-rec-badge_source c-rm-rec-badge_multiple';
        return 'c-rm-rec-badge c-rm-rec-badge_source c-rm-rec-badge_existing';
    }

    _confidenceBadgeClass(type) {
        if (type === 'high')   return 'c-rm-rec-badge c-rm-rec-badge_conf c-rm-rec-badge_high';
        if (type === 'medium') return 'c-rm-rec-badge c-rm-rec-badge_conf c-rm-rec-badge_medium';
        return 'c-rm-rec-badge c-rm-rec-badge_conf c-rm-rec-badge_low';
    }

    handleShowRecs() {
        this._showRecsPanel = true;
    }

    handleHideRecs() {
        this._showRecsPanel = false;
    }

    get isRefreshing() { return this._isRefreshing; }

    handleRefreshRecs() {
        this._isRefreshing = true;
        // Simulate a 4-second AI research window then restore results
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => { this._isRefreshing = false; }, 4000);
    }

    // ── Add-member modal ─────────────────────────────────────────

    get showAddModal()      { return this._addModalRec !== null; }
    get _isNewFlow()        { return this._addModalRec?.sourceType === 'new'; }
    get _hasDuplicates()    { return (this._addModalRec?.duplicates?.length || 0) > 0; }

    // Step visibility
    get modalStep1Select()  { return this._modalStep === 1 && this._hasDuplicates; }
    get modalStep1NoRec()   { return this._modalStep === 1 && this._isNewFlow; }
    get modalStep2Details() { return this._modalStep === 2 && !this._isNewFlow; }
    get modalStep2Create()  { return this._modalStep === 2 && this._isNewFlow; }

    get addModalHeading() {
        if (this.modalStep2Create) return 'Create New Person Account';
        const cat = this._addModalRec?.groupCategory || 'Members';
        if (cat === 'Members')          return 'Add Member';
        if (cat === 'Related Contacts') return 'Add Contact';
        if (cat === 'Related Accounts') return 'Add Account';
        return 'Add Record';
    }

    get addModalInitials() {
        const name = this._addModalRec?.name || '';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }

    // Step 1 — existing duplicates description
    get addModalDuplicateDesc() {
        const name = this._addModalRec?.name || '';
        return `The following contacts were found by the name of '${name}', select one or create new`;
    }

    // Step 1 — no record description
    get addModalNoRecDesc() {
        const name = this._addModalRec?.name || '';
        return `Since there are no records existing by the name of "${name}", create a new person account`;
    }

    get addModalDuplicates() {
        return (this._addModalRec?.duplicates || []).map((d, i) => ({
            ...d,
            isSelected: this._selectedRecordIdx === i,
            rowClass: this._selectedRecordIdx === i
                ? 'c-rm-modal__dup-row c-rm-modal__dup-row_selected'
                : 'c-rm-modal__dup-row',
            idx: i,
        }));
    }

    get saveAndNextDisabled() {
        return this._selectedRecordIdx === null;
    }

    // Step 2 — "add details" (existing record) fields
    get addModalName()       { return this._addModalRec?.name    || ''; }
    get addModalRole()       { return this._modalRole; }
    get addModalStatus()     { return this._modalStatus; }
    get addModalAccount()    { return this.accountName           || ''; }
    get addModalSourceNote() {
        return 'AIRR suggested — edit if needed (e.g. "Son" → "Stepson")';
    }

    // Step 2 — "create new" form fields
    get addModalSalutation() { return this._modalSalutation; }
    get addModalFirstName()  { return this._modalFirstName; }
    get addModalLastName()   { return this._modalLastName; }

    get salutationOptions() {
        return [
            { label: 'Mr',   value: 'Mr'   },
            { label: 'Mrs',  value: 'Mrs'  },
            { label: 'Ms',   value: 'Ms'   },
            { label: 'Dr',   value: 'Dr'   },
            { label: 'Prof', value: 'Prof' },
        ];
    }

    get roleOptions() {
        return [
            { label: 'Head of Household', value: 'Head of Household' },
            { label: 'Spouse',            value: 'Spouse' },
            { label: 'Wife',              value: 'Wife' },
            { label: 'Husband',           value: 'Husband' },
            { label: 'Son',               value: 'Son' },
            { label: 'Daughter',          value: 'Daughter' },
            { label: 'Dependent',         value: 'Dependent' },
            { label: 'Parent',            value: 'Parent' },
            { label: 'Sibling',           value: 'Sibling' },
            { label: 'Other',             value: 'Other' },
        ];
    }

    get statusOptions() {
        return [
            { label: 'Active',   value: 'Active'   },
            { label: 'Inactive', value: 'Inactive' },
            { label: 'Pending',  value: 'Pending'  },
        ];
    }

    handleAddRec(event) {
        event.stopPropagation();
        const id  = event.currentTarget.dataset.id;
        const rec = this._allRecsFlat.find(r => r.id === id);
        if (rec) {
            const parts = rec.name.split(' ');
            this._addModalRec       = rec;
            this._modalRole         = rec.relationship || '';
            this._modalStatus       = 'Active';
            this._selectedRecordIdx = null;
            this._modalSalutation   = 'Mr';
            this._modalFirstName    = parts[0] || '';
            this._modalLastName     = parts.slice(1).join(' ') || '';
            // Always open at step 1
            this._modalStep = 1;
        }
    }

    handleSelectDuplicate(event) {
        this._selectedRecordIdx = parseInt(event.currentTarget.dataset.idx, 10);
    }

    handleCreateNew() {
        this._modalStep = 2;
    }

    handleSaveAndNext() {
        if (this._selectedRecordIdx !== null) {
            this._modalStep = 2;
        }
    }

    handleModalBack() {
        this._modalStep = 1;
    }

    handleModalRoleChange(event)        { this._modalRole       = event.detail.value; }
    handleModalStatusChange(event)      { this._modalStatus     = event.detail.value; }
    handleModalSalutationChange(event)  { this._modalSalutation = event.detail.value; }
    handleModalFirstNameChange(event)   { this._modalFirstName  = event.detail.value; }
    handleModalLastNameChange(event)    { this._modalLastName   = event.detail.value; }

    handleConfirmAdd() {
        const id = this._addModalRec?.id;
        if (id) {
            this._addedIds = { ...this._addedIds, [id]: true };
        }
        this._addModalRec = null;
    }

    handleCancelAdd() {
        this._addModalRec = null;
    }

    handleDismissRec(event) {
        const id  = event.currentTarget.dataset.id;
        const rec = this._allRecsFlat.find(r => r.id === id);
        this._dismissedIds = { ...this._dismissedIds, [id]: true };

        // Show dismiss toast
        this._dismissToast = { name: rec?.name || 'Suggestion' };
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            this._dismissToast = null;
        }, 4500);
    }

    get showDismissToast()  { return this._dismissToast !== null; }
    get dismissToastName()  { return this._dismissToast?.name || ''; }

    handleToastClose() {
        clearTimeout(this._toastTimer);
        this._dismissToast = null;
    }

    handleArchivesNav(event) {
        event.preventDefault();
        // Navigate to archives — fires a custom event the parent can route with
        this.dispatchEvent(new CustomEvent('navigatetoarchives'));
    }
}
