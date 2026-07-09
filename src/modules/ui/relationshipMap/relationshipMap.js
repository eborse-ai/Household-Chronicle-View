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
    @track _modalPhone        = '';
    @track _modalEmail        = '';
    @track _modalCompany      = '';
    @track _modalTitle        = '';
    @track _isDirectMemberAdd = false;
    @track _directAddMode     = 'existing';
    @track _memberLookupQuery = 'Julia Green';
    @track _directAddCategory = 'Members';
    @track _openEntityMenuKey = null;
    @track _activeEntity      = null;
    @track _showDeleteModal   = false;
    @track _showEditModal     = false;

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
            menuKey:     this._memberMenuKey(m.id),
            isMenuOpen:  this._openEntityMenuKey === this._memberMenuKey(m.id),
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
        return this._decorateAddedEntities('Members');
    }

    get addedContacts() {
        return this._decorateAddedEntities('Related Contacts');
    }

    get addedAccounts() {
        return this._decorateAddedEntities('Related Accounts');
    }

    get addedHouseholds() {
        return this._decorateAddedEntities('Related Households');
    }

    get contactsCount() { return this.addedContacts.length; }
    get accountsCount()  { return this.addedAccounts.length; }
    get householdsCount() { return this.addedHouseholds.length; }
    get hasAddedContacts() { return this.contactsCount > 0; }
    get hasAddedAccounts() { return this.accountsCount > 0; }
    get hasAddedHouseholds() { return this.householdsCount > 0; }
    get showDeleteModal()  { return this._showDeleteModal; }
    get showEditModal()    { return this._showEditModal; }

    get editEntityName() {
        return this._activeEntity?.name || '';
    }

    get deleteEntityName() {
        return this._activeEntity?.name || '';
    }

    get deleteModalMessage() {
        const name = this.deleteEntityName;
        return `Are you sure you want to delete the relationship for ${name}? This action cannot be undone.`;
    }

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

    _memberMenuKey(id) {
        return `member:${id}`;
    }

    _recMenuKey(id) {
        return `rec:${id}`;
    }

    _decorateAddedEntities(category) {
        return this._allRecsFlat
            .filter(r => this._addedIds[r.id] && r.groupCategory === category)
            .map(r => {
                const menuKey = this._recMenuKey(r.id);
                return {
                    ...r,
                    menuKey,
                    isMenuOpen: this._openEntityMenuKey === menuKey,
                };
            });
    }

    _setActiveEntityFromDataset(dataset) {
        const kind = dataset.kind;
        const id = dataset.id;
        const name = dataset.name || '';
        const role = dataset.role || '';
        const category = dataset.category || '';
        const menuKey = kind === 'member' ? this._memberMenuKey(id) : this._recMenuKey(id);
        this._activeEntity = { kind, id, name, role, category, menuKey };
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
    get modalStep1Select()  { return this._modalStep === 1 && this._hasDuplicates && !this._isDirectMemberAdd; }
    get modalStep1NoRec()   { return this._modalStep === 1 && this._isNewFlow && !this._isDirectMemberAdd; }
    get modalStep1Direct()  { return this._modalStep === 1 && this._isDirectMemberAdd; }
    get modalStep2Details() { return this._modalStep === 2 && !this._isNewFlow; }
    get modalStep2Create()  { return this._modalStep === 2 && this._isNewFlow; }
    get showDirectFromExisting() { return this._directAddMode === 'existing'; }
    get showDirectCreateNew() {
        if (!this.allowDirectCreateNew) return false;
        return this._directAddMode === 'create';
    }

    get addModalHeading() {
        if (this.modalStep1Direct && this.showDirectCreateNew) return this.directCreateHeading;
        if (this.modalStep1Direct) return this.directAddHeading;
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

    get directAddModeOptions() {
        return [
            { label: 'From existing', value: 'existing' },
            { label: 'Create New', value: 'create' },
        ];
    }

    get memberLookupQuery() {
        return this._memberLookupQuery;
    }

    get directAddMode() {
        return this._directAddMode;
    }

    get directAddHeading() {
        if (this._directAddCategory === 'Related Contacts') return 'Add Related Contact';
        if (this._directAddCategory === 'Related Households') return 'Add Related Household';
        return 'Add Member';
    }

    get directCreateHeading() {
        if (this._directAddCategory === 'Related Contacts') return 'Add Related Contact';
        if (this._directAddCategory === 'Related Households') return 'Add Related Household';
        return 'Add Primary Member';
    }

    get directCreateDetailsTitle() {
        if (this._directAddCategory === 'Related Contacts') return 'New Related Contact details';
        if (this._directAddCategory === 'Related Households') return 'New Related Household details';
        return 'New Member details';
    }

    get directDetailsSubtitle() {
        if (this._directAddCategory === 'Related Contacts') return 'Add Related Contact Details';
        if (this._directAddCategory === 'Related Households') return 'Add Related Household Details';
        return 'Add Member Details';
    }

    get directAddDuplicates() {
        return (this._addModalRec?.duplicates || []).map((d, i) => ({
            ...d,
            isSelected: this._selectedRecordIdx === i,
            rowClass: this._selectedRecordIdx === i
                ? 'c-rm-modal__dup-row c-rm-modal__dup-row_direct c-rm-modal__dup-row_selected'
                : 'c-rm-modal__dup-row c-rm-modal__dup-row_direct',
            idx: i,
        }));
    }

    get directItemCountLabel() {
        if (this._directAddCategory === 'Related Households') return '5 Items';
        return this._directAddCategory === 'Related Contacts' ? '5 Items' : '64 Items';
    }

    get allowDirectCreateNew() {
        return this._directAddCategory !== 'Related Households';
    }

    get showDirectModeSelector() {
        return this.allowDirectCreateNew;
    }

    get isDirectHouseholdFlow() {
        return this._directAddCategory === 'Related Households';
    }

    get detailNameFieldLabel() {
        if (this.isDirectHouseholdFlow) return 'Related Household Name';
        return 'Name';
    }

    get detailRoleFieldLabel() {
        if (this.isDirectHouseholdFlow) return 'Party Role Relationship';
        return 'Role';
    }

    get detailRoleOptions() {
        if (this.isDirectHouseholdFlow) {
            return [
                { label: 'Owner-Holding Company-AAR', value: 'Owner-Holding Company-AAR' },
                { label: 'Primary Residence', value: 'Primary Residence' },
                { label: 'Family Office', value: 'Family Office' },
                { label: 'Legal Domicile', value: 'Legal Domicile' },
                { label: 'Other', value: 'Other' },
            ];
        }
        return this.roleOptions;
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
    get addModalPhone()      { return this._modalPhone; }
    get addModalEmail()      { return this._modalEmail; }
    get addModalCompany()    { return this._modalCompany; }
    get addModalTitle()      { return this._modalTitle; }

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
            { label: 'Lawyer',            value: 'Lawyer' },
            { label: 'Advisor',           value: 'Advisor' },
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
        if (rec) this._openAddFlow(rec);
    }

    handleSectionAdd(event) {
        event.stopPropagation();
        const category = event.currentTarget.dataset.category;
        if (!category) return;
        if (category === 'Members') {
            this._openDirectEntityAddModal('Members');
            return;
        }
        if (category === 'Related Contacts') {
            this._openDirectEntityAddModal('Related Contacts');
            return;
        }
        if (category === 'Related Households') {
            this._openDirectEntityAddModal('Related Households');
            return;
        }

        const existingRec = this._allRecsFlat.find(
            item => item.groupCategory === category && !this._dismissedIds[item.id]
        );
        if (existingRec) {
            this._openAddFlow(existingRec);
            return;
        }

        const fallback = this._buildSectionFallbackRec(category);
        this.recommendations = this._upsertFallbackRecIntoRecommendations(fallback, category);
        this._openAddFlow({ ...fallback, groupCategory: category });
    }

    _openAddFlow(rec) {
        const parts = (rec.name || '').split(' ');
        this._addModalRec       = rec;
        this._modalRole         = rec.relationship || '';
        this._modalStatus       = 'Active';
        this._selectedRecordIdx = null;
        this._modalSalutation   = rec.salutation || 'Mr';
        this._modalFirstName    = rec.firstName || parts[0] || '';
        this._modalLastName     = rec.lastName || parts.slice(1).join(' ') || '';
        this._modalPhone        = rec.phone || '';
        this._modalEmail        = rec.email || '';
        this._modalCompany      = rec.company || '';
        this._modalTitle        = rec.title || '';
        // Always open at step 1
        this._modalStep = 1;
    }

    _openDirectEntityAddModal(category) {
        this._isDirectMemberAdd = true;
        this._directAddCategory = category;
        this._directAddMode = 'existing';
        this._memberLookupQuery = category === 'Related Households' ? 'Smith' : category === 'Related Contacts' ? 'Adam' : 'Julia Green';
        this._selectedRecordIdx = 0;
        this._modalRole = category === 'Related Households' ? 'Owner-Holding Company-AAR' : category === 'Related Contacts' ? 'Lawyer' : 'Wife';
        this._modalStatus = 'Active';
        const duplicates = category === 'Related Households'
            ? [
                { name: 'Smith Household', phone: '(212) 555-0199', accountSite: 'Primary Residence - NY', accountOwnerAlias: 'Nick', role: 'Owner-Holding Company-AAR' },
                { name: 'John Smith Household', phone: '+44 20 7946 0192', accountSite: 'Winter Residence - FL', accountOwnerAlias: 'Brian Scott', role: 'Primary Residence' },
                { name: 'Dr.Elena Smith Family', phone: '+81 3 5555 0171', accountSite: 'Family Office - CA', accountOwnerAlias: 'Jack Scott', role: 'Family Office' },
                { name: 'Estate of Vance Smith', phone: '(512) 555-0143', accountSite: 'Probate Status - MA', accountOwnerAlias: 'Brett J', role: 'Legal Domicile' },
                { name: 'Victoria Smith Trust', phone: '(310) 555-0115', accountSite: 'Legal Domicile - DE', accountOwnerAlias: 'Jdoe', role: 'Legal Domicile' },
            ]
            : category === 'Related Contacts'
            ? [
                { name: 'Adam Smith', ssn: '***-**-6677', address: '44/31 New Avenue...', createdBy: 'Nick', role: 'Lawyer' },
                { name: 'Joseph Adam', ssn: '***-**-4589', address: '...', createdBy: 'Brian Scott', role: 'Advisor' },
                { name: 'Maria Green Smith', ssn: '***-**-6439', address: '22/12', createdBy: 'Jack Scott', role: 'Lawyer' },
                { name: 'Smith Jones', ssn: '***-**-1239', address: '41/31 Avenue...', createdBy: 'Brett J', role: 'Advisor' },
                { name: 'Julia Smith', ssn: '***-**-6723', address: '--', createdBy: 'Test', role: 'Advisor' },
            ]
            : [
                { name: 'Julia Green', ssn: '***-**-6677', address: '44/31 New Avenue...', createdBy: 'Nick', role: 'Wife' },
                { name: 'Julia Green', ssn: '***-**-4589', address: '...', createdBy: 'Brian Scott', role: 'Wife' },
                { name: 'Julia Green', ssn: '***-**-6439', address: '22/12', createdBy: 'Jack Scott', role: 'Wife' },
            ];
        this._addModalRec = {
            id: `manual-direct-${Date.now()}`,
            name: category === 'Related Households' ? 'Smith Household' : category === 'Related Contacts' ? 'Adam Smith' : 'Julia Green',
            relationship: category === 'Related Households' ? 'Owner-Holding Company-AAR' : category === 'Related Contacts' ? 'Lawyer' : 'Wife',
            groupCategory: category,
            sourceType: 'multiple',
            duplicates,
        };
        this._modalStep = 1;
    }

    _buildSectionFallbackRec(category) {
        const ts = Date.now();
        if (category === 'Members') {
            return {
                id: `manual-members-${ts}`,
                name: 'John Green',
                relationship: 'Daughter',
                icon: 'standard:person_account',
                sourceType: 'multiple',
                confidenceType: 'high',
                confidence: 'High Confidence',
                reason: 'Potential household member identified from profile data.',
                salutation: 'Mr',
                firstName: 'John',
                lastName: 'Green',
                phone: '+1 415-555-0199',
                email: 'john.green@turbotax.com',
                company: 'TurboTax',
                title: 'Tax Consultant',
                duplicates: [
                    { name: 'John Green', company: 'TaxPro Advisors', title: 'Tax Consultant', email: 'john.green@taxpro.com' },
                    { name: 'John L. Green', company: 'Green & Associates', title: 'Managing Partner', email: 'jgreen@greenandassoc.com' },
                ],
            };
        }
        if (category === 'Related Contacts') {
            return {
                id: `manual-contacts-${ts}`,
                name: 'Emma Reed',
                relationship: 'Daughter',
                icon: 'standard:contact',
                sourceType: 'multiple',
                confidenceType: 'high',
                confidence: 'High Confidence',
                reason: 'Contact found with potential relationship to household.',
                salutation: 'Mr',
                firstName: 'John',
                lastName: 'Green',
                phone: '+1 415-555-0199',
                email: 'john.green@turbotax.com',
                company: 'TurboTax',
                title: 'Tax Consultant',
                duplicates: [
                    { name: 'Emma Reed', company: 'Reed & Associates LLC', title: 'Daughter', email: 'emma.reed@reedassoc.com' },
                    { name: 'Emma Reed', company: 'Westbrook Primary School', title: 'Student', email: 'emma.r@westbrook.edu' },
                ],
            };
        }
        if (category === 'Related Households') {
            return {
                id: `manual-households-${ts}`,
                name: 'Green Family Household',
                relationship: 'Related Household',
                icon: 'standard:household',
                sourceType: 'new',
                confidenceType: 'medium',
                confidence: 'Medium Confidence',
                reason: 'Nearby household with overlapping members detected.',
                salutation: 'Mr',
                firstName: 'John',
                lastName: 'Green',
                phone: '+1 415-555-0199',
                email: 'john.green@turbotax.com',
                company: 'TurboTax',
                title: 'Tax Consultant',
                duplicates: [],
            };
        }
        return {
            id: `manual-accounts-${ts}`,
            name: 'Westbrook Primary School',
            relationship: 'Related Account',
            icon: 'standard:account',
            sourceType: 'new',
            confidenceType: 'medium',
            confidence: 'Medium Confidence',
            reason: 'Account appears to be connected through member activities.',
            salutation: 'Mr',
            firstName: 'John',
            lastName: 'Green',
            phone: '+1 415-555-0199',
            email: 'john.green@turbotax.com',
            company: 'TurboTax',
            title: 'Tax Consultant',
            duplicates: [],
        };
    }

    _upsertFallbackRecIntoRecommendations(rec, category) {
        const groups = [...(this.recommendations || [])];
        const idx = groups.findIndex(group => group.category === category);
        if (idx === -1) {
            groups.push({ category, items: [rec] });
            return groups;
        }
        groups[idx] = {
            ...groups[idx],
            items: [...(groups[idx].items || []), rec],
        };
        return groups;
    }

    handleSelectDuplicate(event) {
        this._selectedRecordIdx = parseInt(event.currentTarget.dataset.idx, 10);
    }

    handleDirectModeChange(event) {
        this._directAddMode = event.detail.value;
        this._selectedRecordIdx = this._directAddMode === 'existing' ? 0 : null;
    }

    handleMemberLookupChange(event) {
        this._memberLookupQuery = event.detail.value;
    }

    handleEntityMenuToggle(event) {
        event.stopPropagation();
        this._setActiveEntityFromDataset(event.currentTarget.dataset);
        const nextKey = this._activeEntity?.menuKey;
        this._openEntityMenuKey = this._openEntityMenuKey === nextKey ? null : nextKey;
    }

    handleEntityMenuAction(event) {
        event.stopPropagation();
        const action = event.currentTarget.dataset.action;
        if (action === 'edit') {
            this._modalRole = this._activeEntity?.role || '';
            this._modalStatus = 'Active';
            this._showEditModal = true;
        }
        if (action === 'delete') {
            this._showDeleteModal = true;
        }
        this._openEntityMenuKey = null;
    }

    handleEditCancel() {
        this._showEditModal = false;
    }

    handleEditSave() {
        if (!this._activeEntity?.id) {
            this._showEditModal = false;
            return;
        }
        if (this._activeEntity.kind === 'member') {
            this.members = (this.members || []).map(member => (
                member.id === this._activeEntity.id
                    ? { ...member, role: this._modalRole }
                    : member
            ));
        } else {
            this.recommendations = (this.recommendations || []).map(group => ({
                ...group,
                items: (group.items || []).map(item => (
                    item.id === this._activeEntity.id
                        ? { ...item, relationship: this._modalRole }
                        : item
                )),
            }));
        }
        this._showEditModal = false;
    }

    handleDeleteCancel() {
        this._showDeleteModal = false;
    }

    handleDeleteConfirm() {
        if (!this._activeEntity?.id) {
            this._showDeleteModal = false;
            return;
        }
        if (this._activeEntity.kind === 'member') {
            this.members = (this.members || []).filter(member => member.id !== this._activeEntity.id);
            const expanded = { ...this._expandedMemberIds };
            delete expanded[this._activeEntity.id];
            this._expandedMemberIds = expanded;
        } else {
            const addedIds = { ...this._addedIds };
            delete addedIds[this._activeEntity.id];
            this._addedIds = addedIds;
        }
        this._showDeleteModal = false;
    }

    handleCreateNew() {
        // Manual-entry flow: start with clean inputs for user entry.
        this._modalSalutation = 'Mr';
        this._modalFirstName = '';
        this._modalLastName = '';
        this._modalPhone = '';
        this._modalEmail = '';
        this._modalCompany = '';
        this._modalTitle = '';
        this._modalStep = 2;
    }

    handleSaveAndNext() {
        if (this.modalStep1Direct && this.showDirectFromExisting) {
            if (this._selectedRecordIdx !== null) {
                const selected = this._addModalRec?.duplicates?.[this._selectedRecordIdx];
                this._modalRole = selected?.role || this._modalRole || 'Member';
                this._modalStatus = 'Active';
                this._modalStep = 2;
            }
            return;
        }
        if (this._selectedRecordIdx !== null) {
            this._modalStep = 2;
        }
    }

    handleModalBack() {
        if (this._isDirectMemberAdd) {
            this._modalStep = 1;
            return;
        }
        this._modalStep = 1;
    }

    handleModalRoleChange(event)        { this._modalRole       = event.detail.value; }
    handleModalStatusChange(event)      { this._modalStatus     = event.detail.value; }
    handleModalSalutationChange(event)  { this._modalSalutation = event.detail.value; }
    handleModalFirstNameChange(event)   { this._modalFirstName  = event.detail.value; }
    handleModalLastNameChange(event)    { this._modalLastName   = event.detail.value; }
    handleModalPhoneChange(event)       { this._modalPhone      = event.detail.value; }
    handleModalEmailChange(event)       { this._modalEmail      = event.detail.value; }
    handleModalCompanyChange(event)     { this._modalCompany    = event.detail.value; }
    handleModalTitleChange(event)       { this._modalTitle      = event.detail.value; }

    handleConfirmAdd() {
        if (this._isDirectMemberAdd) {
            if (this._selectedRecordIdx !== null) {
                const selected = this._addModalRec?.duplicates?.[this._selectedRecordIdx];
                const fallbackRole = this._directAddCategory === 'Related Contacts'
                    ? 'Contact'
                    : this._directAddCategory === 'Related Households'
                        ? 'Related Household'
                        : 'Member';
                this._addEntityToGraph(this._directAddCategory, {
                    name: selected?.name || this._addModalRec?.name,
                    role: this._modalRole || selected?.role || fallbackRole,
                });
            }
            this.handleCancelAdd();
            return;
        }
        const id = this._addModalRec?.id;
        if (id) {
            if (this.modalStep2Create) {
                const updatedName = `${this._modalFirstName} ${this._modalLastName}`.trim();
                this.recommendations = (this.recommendations || []).map(group => ({
                    ...group,
                    items: (group.items || []).map(item => (
                        item.id === id
                            ? {
                                ...item,
                                name: updatedName || item.name,
                                relationship: this._modalRole || item.relationship,
                                salutation: this._modalSalutation,
                                firstName: this._modalFirstName,
                                lastName: this._modalLastName,
                                phone: this._modalPhone,
                                email: this._modalEmail,
                                company: this._modalCompany,
                                title: this._modalTitle,
                              }
                            : item
                    )),
                }));
            }
            this._addedIds = { ...this._addedIds, [id]: true };
        }
        this._addModalRec = null;
    }

    handleCancelAdd() {
        this._isDirectMemberAdd = false;
        this._directAddMode = 'existing';
        this._memberLookupQuery = 'Julia Green';
        this._directAddCategory = 'Members';
        this._selectedRecordIdx = null;
        this._addModalRec = null;
    }

    handleDirectCreateAdd() {
        const fullName = `${this._modalFirstName} ${this._modalLastName}`.trim();
        if (!fullName) return;
        const fallbackRole = this._directAddCategory === 'Related Contacts' ? 'Contact' : 'Member';
        this._addEntityToGraph(this._directAddCategory, { name: fullName, role: fallbackRole });
        this.handleCancelAdd();
    }

    _addEntityToGraph(category, { name, role }) {
        if (category !== 'Members') {
            const id = `direct-${category.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
            const icon = category === 'Related Contacts' ? 'standard:contact'
                : category === 'Related Accounts' ? 'standard:account'
                : 'standard:household';
            const rec = {
                id,
                name,
                relationship: role || 'Related',
                icon,
                sourceType: 'existing',
                confidenceType: 'high',
                confidence: 'High Confidence',
                reason: 'Added manually.',
            };
            this.recommendations = this._upsertFallbackRecIntoRecommendations(rec, category);
            this._addedIds = { ...this._addedIds, [id]: true };
            return;
        }
        const palette = ['#1589ee', '#206476', '#9a6a2e', '#7c3aed', '#c23934'];
        const idx = (this.members || []).length % palette.length;
        const initials = (name || '')
            .split(' ')
            .filter(Boolean)
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
        const id = `rm-${Date.now()}`;
        const newMember = {
            id,
            name,
            role: role || 'Member',
            initials: initials || 'NM',
            avatarStyle: `background:${palette[idx]};color:#ffffff;`,
            relationshipStrength: 'N/A',
            lastInteraction: 'Just added',
            upcomingLifeEvents: [],
            isPrimary: false,
        };
        this.members = [...(this.members || []), newMember];
        this.isMembersExpanded = true;
        this._expandedMemberIds = { ...this._expandedMemberIds, [id]: false };
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
