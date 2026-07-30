import { LightningElement, track } from 'lwc';
import { getCurrentRoute, navigate } from '../../../router';
import { getAccountById } from 'data/accounts';

/** Popover detail data keyed by event id */
const EVENT_DETAILS = {
    // ── Bennett Household — Life Events (life-events lane) ───────────────
    le1: { description: 'David and Grace Bennett onboarded as joint clients — both present at the opening meeting. Goals, risk tolerance, and IPS documented.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Apr 2016', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Welcome call completed. IPS drafted.', subject: 'Client Onboarding', startDateTime: 'Apr 12, 2016 · 10:00 AM', location: 'Office', endDateTime: 'Apr 12, 2016 · 11:30 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Initial onboarding — David & Grace both present. Goals, risk tolerance, time horizon, and funding sources documented. IPS drafted.' },
    le2: { description: 'David and Grace purchased their current home with a 30-year mortgage, marking a major shift in household cash flow and long-term balance sheet.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Jul 2018', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David · Grace Bennett', cashFlowImpact: '30-yr mortgage begins', beneficiaries: null, actionTaken: 'Home purchase recorded.', primaryPerson: 'David Bennett', relatedPerson: 'Grace Bennett', eventLocation: 'Chicago, IL', eventDescription: 'David and Grace purchased their current home in July 2018. A 30-year mortgage was originated — monthly mortgage payments began reshaping household cash flow and net worth trajectory.', owner: 'Alex Grant' },
    le3: { description: 'COVID-19 market drawdown — household portfolio dropped significantly. David and Grace stayed the course; behavioral note recorded confirming they did not sell.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Mar 2020', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Behavioral coaching provided. No liquidation.', subject: 'Market Drawdown Check-in', startDateTime: 'Mar 18, 2020 · 10:00 AM', location: 'Video Call', endDateTime: 'Mar 18, 2020 · 11:00 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'COVID-19 market drawdown. David and Grace stayed the course — reassured, did not sell. Behavioral note documented.' },
    le4: { description: 'Maya Bennett started high school — a contextual milestone anchoring her college start (fall 2027) and the need to begin education cost modeling.', isShared: false, sharedWith: '', isCritical: false, date: 'Sep 2022', membersAffected: 1, status: 'Noted', aiInsight: "Maya starts college fall 2027 — first tuition bill due Aug 2027. Now is the time to model 4-year education costs and open a savings vehicle.", aiActionLabel: 'Model College Plan', members: 'Maya Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Milestone noted. College funding planning not yet initiated.', primaryPerson: 'Maya Bennett', relatedPerson: '—', eventLocation: 'Chicago, IL', eventDescription: 'Maya Bennett started high school in September 2022. Contextual milestone — college (fall 2027) is now 5 years away. College funding planning was not initiated at this point.', owner: 'Alex Grant' },
    le5: { description: 'David was promoted to VP with a material salary raise. Income is now materially higher — but protection coverage has never been re-rated against the new compensation level.', isShared: false, sharedWith: '', isCritical: true, date: 'May 2025', membersAffected: 1, status: 'Noted', aiInsight: "David's VP promotion raised household income materially. Life insurance and disability coverage have not been re-rated to match — creating a significant protection gap.", aiActionLabel: 'Review Protection Coverage', members: 'David Bennett', cashFlowImpact: 'Income up materially', beneficiaries: null, actionTaken: 'Income updated in plan. Protection not re-rated.', sentimentInsights: [{ name: 'David Bennett', role: 'Primary Client', keyword: 'Ambitious', insight: 'Career milestone motivates him — open to increased savings and investment strategies aligned with his new income level.' }], primaryPerson: 'David Bennett', relatedPerson: '—', eventLocation: 'Chicago, IL', eventDescription: "David Bennett was promoted to VP in May 2025 with a material salary increase. Household income is now substantially higher. Protection coverage (life insurance, disability) has never been re-rated against the new compensation level.", owner: 'Alex Grant' },
    le6: { description: "Eleanor Bennett (David's mother, age 74) moved into the household in spring 2026. New dependent — caregiving costs and time-sensitive POA/will documentation are now inside the household plan.", isShared: false, sharedWith: '', isCritical: false, date: 'Apr 2026', membersAffected: 2, status: 'No plan update', aiInsight: null, aiActionLabel: null, members: 'Eleanor · David Bennett', cashFlowImpact: 'Caregiving costs TBD', beneficiaries: null, actionTaken: 'None on record.', primaryPerson: 'Eleanor Bennett', relatedPerson: 'David Bennett', eventLocation: 'Chicago, IL', eventDescription: "Eleanor Bennett (David's mother, age 74) moved into the Bennett household in April 2026. New dependent — caregiving costs and time-sensitive POA/will documentation are now household priorities. Neither has been addressed in the financial plan.", owner: 'Alex Grant' },
    // ── Bennett Household — Financial Accounts ─────────────────────────
    fa1:  { description: 'Joint taxable brokerage opened at household onboarding — the core managed portfolio for David and Grace.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Apr 2016', membersAffected: 2, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'David · Grace Bennett', cashFlowImpact: null, beneficiaries: 'Grace Bennett (50%) · David Bennett (50%)', actionTaken: 'Account opened and funded.', openingDate: 'Apr 20, 2016', totalOutstandingAmount: '$610,000', accountType: 'Joint Taxable Brokerage', accountNumber: 'BRK-2016-4471', maturityDate: 'N/A', heldAway: 'No', notes: 'Core managed portfolio' },
    fa2:  { description: "529 college savings plan opened for Maya at household onboarding. Owned by David. Currently 60%-funded against projected 4-year tuition — first bill due Aug 2027.", isShared: false, sharedWith: '', isCritical: true, date: 'May 2016', membersAffected: 1, status: 'Active – At Risk', aiInsight: "Maya's 529 is ~40% short of projected tuition. With the Aug 2027 first bill only 12 months away, an immediate contribution increase is the single highest-leverage action.", aiActionLabel: 'Model College Plan', members: 'Maya Bennett', cashFlowImpact: 'Contribution increase needed', beneficiaries: null, actionTaken: 'Goal tracked. No recent contribution review.', openingDate: 'May 1, 2016', accountType: '529 Education Savings', accountNumber: '529-2016-1101', notes: 'The 60%-funded college account' },
    fa3:  { description: "David's employer-sponsored 401(k) — primary tax-deferred retirement vehicle. Contributions co-ordinated with Grace's 403(b) as part of the joint retirement goal.", isShared: false, sharedWith: '', isCritical: false, date: 'Jun 2016', membersAffected: 1, status: 'Active', aiInsight: "David's VP promotion in 2025 created headroom to maximise 401(k) contributions. Verify current election reflects the higher compensation level.", aiActionLabel: 'Review Contribution Strategy', members: 'David Bennett', cashFlowImpact: 'Max elective deferral', beneficiaries: null, actionTaken: 'Contributions in place.', openingDate: 'Jun 1, 2016', accountType: '401(k)', accountNumber: '401K-2016-7701', notes: 'Employer plan' },
    fa4:  { description: "Grace's employer-sponsored 403(b) — tax-deferred retirement vehicle for her non-profit employer. Paired with David's 401(k) as part of the joint retirement goal.", isShared: false, sharedWith: '', isCritical: false, date: 'Jun 2016', membersAffected: 1, status: 'Active', aiInsight: "Grace's re-engagement with the planning process is an opportunity to review her 403(b) contribution rate and confirm her beneficiary designations.", aiActionLabel: 'Review Retirement Strategy', members: 'Grace Bennett', cashFlowImpact: 'Employee contribution', beneficiaries: null, actionTaken: 'Contributions in place.', openingDate: 'Jun 1, 2016', accountType: '403(b)', accountNumber: '403B-2016-4402', notes: 'Employer plan (non-profit)' },
    fa5:  { description: "Term-life policy for David — originally sized at onboarding in 2017. Coverage has not been re-rated since the 2025 VP promotion materially increased income and household obligations.", isShared: false, sharedWith: '', isCritical: true, date: 'Mar 2017', membersAffected: 1, status: 'Active – Review Needed', aiInsight: "David's income increased materially with the 2025 VP promotion, but term-life coverage has not been re-rated. Current coverage trails obligations — a re-rate is needed.", aiActionLabel: 'Review Protection Coverage', members: 'David Bennett', cashFlowImpact: 'Premium adjustment TBD', beneficiaries: 'Grace Bennett (primary) · Maya Bennett (contingent)', actionTaken: 'Policy purchased and documented.', openingDate: 'Mar 15, 2017', totalOutstandingAmount: '$1,000,000', accountType: '20-Year Term Life', accountNumber: 'TL-2017-6754', maturityDate: 'Jun 2046', heldAway: 'No', notes: '⚠ Not re-rated since the 2025 raise — coverage trails obligations' },
    fa6:  { description: "529 college savings plan opened for Joshua — second college account. Owned by David. Currently on track with a four-year runway advantage over Maya's plan.", isShared: false, sharedWith: '', isCritical: false, date: 'Aug 2018', membersAffected: 1, status: 'Active – On Track', aiInsight: "Joshua's 529 is on track with a four-year runway advantage. Model optimal contribution levels now to avoid the funding crunch Maya's plan is facing.", aiActionLabel: 'Model College Plan', members: 'Joshua Bennett', cashFlowImpact: 'Est. $300/mo contribution', beneficiaries: null, actionTaken: 'Goal on track. Regular contributions in place.', openingDate: 'Aug 15, 2018', accountType: '529 Education Savings', accountNumber: '529-2018-2202', notes: 'Second college account' },
    fa7:  { description: 'Joint checking and savings account for David and Grace — primary operating account and home of the household emergency fund (6-month reserve).', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Feb 2019', membersAffected: 2, status: 'Active', aiInsight: "With Eleanor's move-in increasing monthly household expenses, verify the 6-month reserve held here still reflects the updated expense level.", aiActionLabel: 'Review Reserve Level', members: 'David · Grace Bennett', cashFlowImpact: '6-month reserve maintained', beneficiaries: null, actionTaken: 'Emergency fund fully funded.', openingDate: 'Feb 1, 2019', accountType: 'Joint Checking / Savings (HYSA)', accountNumber: 'SAV-2019-8832', notes: 'Holds the emergency fund' },
    // ── Bennett Household — Opportunity Goals (opportunity pills) ────────
    op1:  { description: "Raise Maya's 529 contribution now — the plan is ~60% funded against projected tuition with the first bill arriving Aug 2027. Runway is now measured in months, not years.", isShared: false, sharedWith: '', isCritical: true, date: 'Aug 2026', membersAffected: 1, status: 'Action Needed', aiInsight: "Maya's 529 is ~40% short of projected tuition with the Aug 2027 first bill only 12 months away. An immediate contribution increase is the single highest-leverage action to close the gap.", aiActionLabel: 'Update Goal', members: 'Maya Bennett', cashFlowImpact: 'Contribution increase needed', beneficiaries: null, actionTaken: 'None on record.', category: 'Life-event gap', lens: 'Life-event gap', notes: 'Close the 40% gap before Aug-2027 bill', primaryPerson: 'Maya Bennett', relatedPerson: 'David Bennett', eventLocation: 'Chicago, IL', eventDescription: "Maya's 529 college savings plan is approximately 60% funded against projected 4-year tuition. First tuition bill is due August 2027 — runway is now in months. An immediate increase in contributions is required.", owner: 'Alex Grant' },
    op2:  { description: "Eldercare & Eleanor's legal documents — POA, healthcare directive, and will — must be established before any health decline closes the window to act.", isShared: false, sharedWith: '', isCritical: true, date: 'Aug 2026', membersAffected: 2, status: 'Action Needed', aiInsight: "Eleanor is 74 and recently moved in. POA, healthcare directive, and will are time-sensitive — any health decline could close the legal window. This cannot wait.", aiActionLabel: 'Create Meeting', members: 'Eleanor · David Bennett', cashFlowImpact: 'Caregiving costs + legal fees TBD', beneficiaries: null, actionTaken: 'None on record.', category: 'Generational readiness', lens: 'Generational readiness', notes: 'Time-sensitive — before any health decline closes the window', primaryPerson: 'Eleanor Bennett', relatedPerson: 'David Bennett', eventLocation: 'Chicago, IL', eventDescription: "Eleanor Bennett (74) moved into the household in spring 2026. POA, healthcare directive, and will have not been established. These documents are time-sensitive — any health decline could close the legal window to act.", owner: 'Alex Grant' },
    op3:  { description: "Life-insurance re-rate — David's VP promotion materially increased household income and obligations, but coverage has never been updated. Match coverage to the bigger post-promotion obligations.", isShared: false, sharedWith: '', isCritical: true, date: 'Sep 2026', membersAffected: 1, status: 'Action Needed', aiInsight: "David's income increased materially with the VP promotion, but life and disability coverage has not been re-rated. The gap between current coverage and actual financial obligations is growing.", aiActionLabel: 'Create Task', members: 'David Bennett', cashFlowImpact: 'Premium adjustment TBD', beneficiaries: null, actionTaken: 'None on record.', category: 'Life-event gap', lens: 'Life-event gap', notes: 'Match coverage to the bigger post-promotion obligations', primaryPerson: 'David Bennett', relatedPerson: 'Grace Bennett', eventLocation: 'Chicago, IL', eventDescription: "David was promoted to VP in May 2025 with a material salary increase, but life insurance and disability coverage have never been re-rated to match the new compensation level and household obligations.", owner: 'Alex Grant' },
    // ── Bennett Household — Financial Goals (goals lane) ────────────────
    gm1:  { description: "Maya's 529 college savings plan — opened at household onboarding in 2016. Currently 60% funded against projected 4-year tuition; first bill due Aug 2027 with runway now measured in months.", isShared: false, sharedWith: '', isCritical: true, date: 'May 2016', membersAffected: 1, status: 'At Risk', aiInsight: "Maya's 529 is ~60% funded against projected tuition. With the first bill due Aug 2027, the runway is now in months — not years. An immediate contribution increase is needed to close the ~40% gap.", aiActionLabel: 'Model College Plan', members: 'Maya Bennett', cashFlowImpact: 'Est. contribution increase needed', beneficiaries: null, actionTaken: 'Goal tracked. No recent contribution review.', targetAmount: 'Projected 4-yr tuition', targetDate: 'Aug 2027', priority: 'High', goalType: '529 Education', actualAmount: '60% funded', estSuccess: '60%', startDate: 'May 2016', pace: 'Behind', todayPct: 60, linkedAccount: { name: '529 Plan — Maya', number: '529-2016-1101', contributionAmount: 'TBD', availableBalance: 'TBD' }, competingGoals: [{ name: 'Joshua College 529', amount: 'On track', status: 'On Track', statusClass: 'c-ep-goal-competing-status' }] },
    gj1:  { description: "Joshua's 529 college savings plan — opened in 2018. Currently on track with a four-year runway advantage over Maya's plan; college projected around 2030.", isShared: false, sharedWith: '', isCritical: false, date: 'Aug 2018', membersAffected: 1, status: 'On Track', aiInsight: "Joshua's 529 is on track with a four-year runway advantage. Use this window to model optimal contribution levels and avoid the funding crunch Maya's plan is facing.", aiActionLabel: 'Model College Plan', members: 'Joshua Bennett', cashFlowImpact: 'Est. $300/mo contribution', beneficiaries: null, actionTaken: 'Goal on track. Regular contributions in place.', targetAmount: 'Projected 4-yr tuition', targetDate: 'Sep 2030', priority: 'Medium', goalType: '529 Education', actualAmount: 'On track', estSuccess: 'On Track', startDate: 'Aug 2018', pace: 'On Track', todayPct: 45, linkedAccount: { name: '529 Plan — Joshua', number: '529-2018-2202', contributionAmount: '$300/mo', availableBalance: 'TBD' }, competingGoals: [{ name: "Maya College 529", amount: '60% funded', status: 'At Risk', statusClass: 'c-ep-goal-competing-status c-ep-goal-competing-status_risk' }] },
    gr1:  { description: "Joint retirement savings goal for David and Grace — targeting a 2044 retirement horizon. Currently on track with coordinated 401(k) and IRA contributions across both members.", isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'May 2016', membersAffected: 2, status: 'On Track', aiInsight: "The retirement goal is on track for 2044. David's VP promotion provides an opportunity to accelerate contributions and close any long-term gaps while income is at its peak.", aiActionLabel: 'Review Retirement Strategy', members: 'David · Grace Bennett', cashFlowImpact: 'Joint 401(k) + IRA contributions', beneficiaries: null, actionTaken: 'Joint retirement goal documented at onboarding.', targetAmount: 'Retirement Target', targetDate: '2044', priority: 'High', goalType: 'Retirement', actualAmount: 'On track', estSuccess: 'On Track', startDate: 'May 2016', pace: 'On Track', todayPct: 48, linkedAccount: { name: 'Joint Brokerage + Retirement Accounts', number: 'BRK-2020-4471', contributionAmount: 'Joint', availableBalance: '$610,000' }, competingGoals: [{ name: 'Maya College 529', amount: '60% funded', status: 'At Risk', statusClass: 'c-ep-goal-competing-status c-ep-goal-competing-status_risk' }] },
    gef1: { description: "Household emergency fund — established at onboarding in 2017. Fully funded at 6-month reserve. Covers all 5 household members including Eleanor whose move-in has increased monthly expenses.", isShared: true, sharedWith: 'David · Grace · Maya · Joshua · Eleanor Bennett', isCritical: false, date: 'Jan 2017', membersAffected: 5, status: 'Funded', aiInsight: "The emergency fund is fully funded at 6 months. With Eleanor's move-in adding caregiving costs, it is worth confirming the reserve covers the updated monthly expense level.", aiActionLabel: 'Review Reserve Level', members: 'David · Grace · Maya · Joshua · Eleanor Bennett', cashFlowImpact: '6-month reserve maintained', beneficiaries: null, actionTaken: 'Emergency fund fully funded. No recent review.', targetAmount: '6-month expenses', targetDate: 'Ongoing', priority: 'Medium', goalType: 'Emergency Fund', actualAmount: 'Fully Funded', estSuccess: 'Funded', startDate: 'Jan 2017', pace: 'Funded', todayPct: 100, linkedAccount: { name: 'HYSA / Cash Reserve', number: 'SAV-2021-8832', contributionAmount: 'Maintained', availableBalance: '$18,500' }, competingGoals: [] },
    // ── Bennett Household — Calls & Touchpoints ─────────────────────────
    c1:  { description: 'Follow-up call with David on the May 2025 VP promotion — discussed comp structure, RSU vesting schedule, and implications for withholding. Protection re-rate noted but not yet actioned.', isShared: false, sharedWith: '', isCritical: false, date: 'Aug 2025', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Promotion and comp change discussed. Protection re-rate flagged.', subject: 'Promotion Follow-up Call', startDateTime: 'Aug 4, 2025 · 11:00 AM', location: 'Phone Call', endDateTime: 'Aug 4, 2025 · 11:30 AM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Follow-up on the promotion / comp change.' },
    c2:  { description: 'New-year check-in call with David — portfolio performance recap, no major decisions. Quick relationship-maintenance touchpoint.', isShared: false, sharedWith: '', isCritical: false, date: 'Jan 2026', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'New-year check-in completed.', subject: 'New-Year Check-in', startDateTime: 'Jan 15, 2026 · 10:00 AM', location: 'Phone Call', endDateTime: 'Jan 15, 2026 · 10:20 AM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'New-year check-in.' },
    c3:  { description: 'KYC refresh handled by the tax team — cross-team touchpoint surfaced to Alex so he is not blind to work he was not part of. No advisory action required.', isShared: false, sharedWith: '', isCritical: false, date: 'Mar 2026', membersAffected: 1, status: 'Completed', aiInsight: "Alex was not in this call. Worth a quick review of any KYC changes to confirm they are consistent with the current financial plan.", aiActionLabel: null, members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'KYC refresh completed by tax team. Alex notified.', subject: 'KYC Refresh (Tax Team)', startDateTime: 'Mar 5, 2026 · 2:00 PM', location: 'Phone Call (Tax Team)', endDateTime: 'Mar 5, 2026 · 2:30 PM', whoName: 'Tax Team (not Alex)', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Cross-team touchpoint — surfaces so Alex is not blind to work he was not in.' },
    c4:  { description: "Call with David — mentioned his mother Eleanor would be moving into the household. First signal of the eldercare situation before the formal move-in in Apr 2026.", isShared: false, sharedWith: '', isCritical: true, date: 'Jun 2026', membersAffected: 1, status: 'Completed', aiInsight: "David flagged Eleanor's move-in on this call. This was the first signal of the eldercare situation — before any formal plan update was made. Documents (POA, will, healthcare directive) are still outstanding.", aiActionLabel: 'Add Eldercare to Plan', members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Eleanor move-in noted. No formal plan update made.', subject: 'Check-in Call', startDateTime: 'Jun 2, 2026 · 11:00 AM', location: 'Phone Call', endDateTime: 'Jun 2, 2026 · 11:20 AM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: "Mentioned his mother would be moving in." },
    // ── Bennett Household — Meetings (interactions lane) ───────────────
    m_on:   { description: 'Onboarding review — both David and Grace present. Captured initial goals, risk tolerance, funding sources, and IPS. Rare dual-presence meeting.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Apr 2016', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Welcome call completed. IPS drafted and shared.', subject: 'Onboarding Review', startDateTime: 'Apr 12, 2016 · 10:00 AM', location: 'Office — Chicago, IL', endDateTime: 'Apr 12, 2016 · 11:30 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Both spouses at the table. Initial goals, risk tolerance, time horizon, and funding sources captured. IPS drafted.' },
    m_ar19: { description: 'Annual review — David and Grace both present. Portfolio performance reviewed, goals reaffirmed, and protection coverage discussed.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Oct 2019', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Annual review completed. Goals reaffirmed.', subject: 'Annual Review', startDateTime: 'Oct 8, 2019 · 10:00 AM', location: 'Video Call', endDateTime: 'Oct 8, 2019 · 11:00 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Annual review. Both David and Grace present. Portfolio performance reviewed. Goals reaffirmed.' },
    m_ar21: { description: 'Annual review — David and Grace both present. Portfolio and retirement goal progress reviewed; home equity noted.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Oct 2021', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Annual review completed.', subject: 'Annual Review', startDateTime: 'Oct 14, 2021 · 10:00 AM', location: 'Video Call', endDateTime: 'Oct 14, 2021 · 11:00 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Annual review. Both David and Grace present. Portfolio and retirement goal progress reviewed. Home equity noted.' },
    m_ar23: { description: 'Annual review — David and Grace both present. Last recorded meeting with Grace. Protection coverage and college funding flagged for follow-up.', isShared: true, sharedWith: 'Grace Bennett', isCritical: true, date: 'Oct 2023', membersAffected: 2, status: 'Completed', aiInsight: "This is the last meeting Grace attended. The ~18-month engagement gap that followed is a material relationship-health risk — Grace should be re-engaged at the next annual review.", aiActionLabel: 'Create Meeting', members: 'David · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Annual review completed. Grace last attended.', subject: 'Annual Review', startDateTime: 'Oct 19, 2023 · 10:00 AM', location: 'Video Call', endDateTime: 'Oct 19, 2023 · 11:00 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: '← Last time Grace attended. Annual review. Protection coverage and college funding flagged for follow-up.' },
    m_ar24: { description: 'Annual review — David only. Grace absent; begins a pattern of non-attendance. Flagged as start of engagement drift.', isShared: false, sharedWith: '', isCritical: true, date: 'Nov 2024', membersAffected: 1, status: 'Completed', aiInsight: "Grace did not attend this review — first absence since onboarding. This is the start of the ~18-month engagement gap. Re-engagement should be a priority.", aiActionLabel: 'Create Meeting', members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Annual review completed. Grace absent.', subject: 'Annual Review', startDateTime: 'Nov 6, 2024 · 10:00 AM', location: 'Video Call', endDateTime: 'Nov 6, 2024 · 11:00 AM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'David only. Grace begins drifting. Annual review completed.' },
    m_ppr25: { description: 'Post-promotion review — David only. Discussed VP salary raise and RSU grant. Protection re-rate was flagged but not actioned at this meeting.', isShared: false, sharedWith: '', isCritical: true, date: 'May 2025', membersAffected: 1, status: 'Completed', aiInsight: "Protection re-rate was discussed but not actioned at this meeting. The gap between current coverage and post-promotion obligations has grown every month since.", aiActionLabel: 'Review Protection Coverage', members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Discussed raise. Protection re-rate not actioned.', subject: 'Post-Promotion Review', startDateTime: 'May 22, 2025 · 2:00 PM', location: 'Video Call', endDateTime: 'May 22, 2025 · 3:00 PM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Discussed raise; protection re-rate not actioned. David only.' },
    m_ar25: { description: 'Annual review — David only. Year-end planning covered; Grace absent again. Protection re-rate still outstanding.', isShared: false, sharedWith: '', isCritical: false, date: 'Nov 2025', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Annual review completed. Grace absent.', subject: 'Annual Review', startDateTime: 'Nov 10, 2025 · 10:00 AM', location: 'Video Call', endDateTime: 'Nov 10, 2025 · 11:00 AM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Annual review. David only. Year-end planning covered.' },
    m_ar26: { description: 'Upcoming annual review — Thursday 30 Jul 2026. David only invited. Alex is prepping: 529 contribution gap for Maya and protection re-rate are the two primary agenda items.', isShared: false, sharedWith: '', isCritical: false, date: 'Jul 2026', membersAffected: 1, status: 'Scheduled', aiInsight: "This is Alex's next prep opportunity. 529 gap (Maya) and insurance re-rate (David) are the two highest-value items. Consider inviting Grace to break the ~18-month streak.", aiActionLabel: 'Open Meeting Prep', members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Meeting invite sent.', subject: 'Annual Review (Upcoming)', startDateTime: 'Jul 30, 2026 · 10:00 AM', location: 'Video Call', endDateTime: 'Jul 30, 2026 · 11:00 AM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'The meeting Alex is prepping; 529 + protection focus. David only invited.' },
    // ── David Bennett — yearly ───────────────────────────────────────────
    e1:  { description: 'Onboarded Mark as a new client and stood up his first managed portfolio; captured initial goals, risk tolerance, and funding sources.', isShared: true,  sharedWith: 'Grace Bennett', isCritical: false, date: 'Mar 2019',    membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Grace Bennett',                     cashFlowImpact: null, beneficiaries: null, actionTaken: 'Welcome call completed. Planning doc shared.', subject: 'Client Onboarding', startDateTime: 'Mar 15, 2019 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Mar 15, 2019 · 11:30 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Initial onboarding covering goals, risk tolerance, time horizon, and initial funding sources. IPS drafted.' },
    e2:  { description: 'Opened a joint taxable brokerage as the household\'s core managed portfolio, consolidating shared investable assets under advisory.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Apr 2020', membersAffected: 2, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark · Grace Bennett', cashFlowImpact: '$500/mo contribution', beneficiaries: 'Grace Bennett (50%), David Bennett (50%)', actionTaken: 'Account opened and funded.', openingDate: 'Apr 2020', totalOutstandingAmount: '$280,000', accountType: 'Taxable Brokerage', accountNumber: 'BRK-2020-4471', maturityDate: 'N/A', heldAway: 'No' },
    e3:  { description: 'Rebalanced the joint brokerage to target allocation after drift and reaffirmed long-term growth objectives.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Nov 2020', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Reviewed and updated investment allocations.', subject: 'Annual Review', startDateTime: 'Nov 10, 2020 · 10:00 AM', location: 'Video Call', endDateTime: 'Nov 10, 2020 · 11:00 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Portfolio rebalancing to target allocation. Joint brokerage drift corrected. Goals reaffirmed.' },
    e4:  { description: 'Established a .5K cash-reserve emergency fund (~3-6 months of expenses), completing the household\'s liquidity foundation.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Jan 2021', membersAffected: 2, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark · Grace Bennett', cashFlowImpact: '$18,000 milestone', beneficiaries: null, actionTaken: 'Goal milestone recorded.', openingDate: 'Jun 2021', totalOutstandingAmount: '$18,500', accountType: 'HYSA / Cash Reserve', accountNumber: 'SAV-2021-8832', maturityDate: 'N/A', heldAway: 'No' },
    e5:  { description: "Mark was promoted with a salary increase and a 4-year-vesting RSU grant, raising household income and introducing concentrated equity to plan around.", isShared: false, sharedWith: '', isCritical: false, date: 'Jul 2025', membersAffected: 1, status: 'Noted', aiInsight: "Salary increase creates an opportunity to boost retirement contributions and increase the car savings goal rate. Consider a Mega Backdoor Roth if the employer plan allows.", aiActionLabel: 'Review Contribution Strategy', members: 'David Bennett', cashFlowImpact: '+$15K/yr income', beneficiaries: null, actionTaken: 'Income updated in plan.', sentimentInsights: [{ name: 'David Bennett', role: 'Primary Client', keyword: 'Ambitious', insight: 'Motivated by milestones — will embrace complex strategies like Mega Backdoor Roth if given a clear step-by-step plan.' }], primaryPerson: 'David Bennett', relatedPerson: '—', eventLocation: 'San Francisco, CA', eventDescription: 'Mark received a promotion to Senior Engineer with a $15K salary increase and a 4-year vesting RSU grant (~$160K total). Introduces concentrated tech-equity exposure to the household plan.', owner: 'Alex Grant' },
    e6:  { description: 'Focused on home-purchase readiness; modeled down-payment funding and timing. Mark flagged the RSU grant as a future liquidity source.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Oct 2022', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'All accounts reviewed. No changes required.', subject: 'Annual Review', startDateTime: 'Oct 12, 2022 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 12, 2022 · 11:00 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Home-purchase readiness discussion. Down-payment modeled. RSU grant noted as future liquidity source.' },
    e7:  { description: 'Purchased their first home (3-bed/2-bath single-family), shifting cash flow to a mortgage and reshaping savings capacity.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Aug 2023', membersAffected: 2, status: 'Completed', aiInsight: "New mortgage has not triggered a review of life insurance coverage or beneficiary updates. Recommend scheduling a protection review.", aiActionLabel: 'Schedule Protection Review', members: 'Mark · Grace Bennett', cashFlowImpact: '$2,100/mo mortgage', beneficiaries: 'Not updated post-purchase', actionTaken: 'Home purchase recorded.', sentimentInsights: [{ name: 'David Bennett', role: 'Primary Client', keyword: 'Pragmatic', insight: 'Equity-focused mindset; open to re-balancing towards mortgage paydown over aggressive investing.' }, { name: 'Grace Bennett', role: 'Co-client', keyword: 'Security-driven', insight: 'Home ownership has heightened need for financial stability; insurance and emergency reserves are top of mind.' }], primaryPerson: 'David Bennett', relatedPerson: 'Grace Bennett', eventLocation: 'Austin, TX', eventDescription: 'First home purchase — 3-bed/2-bath single-family in Austin. Down payment funded from joint brokerage. Monthly mortgage of $2,100/mo began in August 2023. Beneficiaries not updated post-purchase.', owner: 'Alex Grant' },
    e8m: { description: 'Reviewed portfolio performance and confirmed no changes to goals or risk tolerance between annual reviews.', isShared: false, sharedWith: '', isCritical: false, date: 'Mar 2024', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Portfolio performance reviewed. No changes made.', subject: 'Mid-Year Check-in', startDateTime: 'Mar 14, 2024 · 2:00 PM', location: 'Phone', endDateTime: 'Mar 14, 2024 · 3:00 PM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Mid-cycle check-in. Portfolio performance reviewed. No changes to goals or risk tolerance.' },
    e8:  { description: "Opened an HSA under a high-deductible plan, used as a stealth retirement vehicle for triple-tax-advantaged growth.", isShared: false, sharedWith: '', isCritical: false, date: 'Feb 2024', membersAffected: 1, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: '$3,850/yr contribution (2024 limit)', beneficiaries: 'Grace Bennett', actionTaken: 'Account opened. Payroll deduction set.', openingDate: 'Feb 2024', totalOutstandingAmount: '$9,200', accountType: 'Health Savings Account', accountNumber: 'HSA-2024-3319', maturityDate: 'N/A', heldAway: 'No' },
    e9:  { description: 'Couple raised upcoming family planning, prompting a forward look at life insurance, cash reserves, and future education funding.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Oct 2024', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Investment rebalancing recommended and executed.', subject: 'Annual Review', startDateTime: 'Oct 8, 2024 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 8, 2024 · 11:30 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Family planning discussion raised. Life insurance, reserves, and education funding reviewed for upcoming dependent.' },
    e10: { description: "Established a $45K new-car fund targeting 2027, funded from the joint brokerage; later at risk as a market dip pressured the funding source.", isShared: false, sharedWith: '', isCritical: true, date: 'Dec 2025', membersAffected: 1, status: 'At Risk', aiInsight: "The $45K car goal (target 2027) relies on brokerage growth. A recent market dip has put the timeline at risk — rebalance or adjust.", aiActionLabel: 'Review Goal', members: 'David Bennett', cashFlowImpact: '$500/mo target savings', beneficiaries: null, actionTaken: 'Goal recorded. No adjustment made.', targetAmount: '$45,000', targetDate: 'Feb 2027', priority: 'High', goalType: 'Savings', actualAmount: '$18,500', estSuccess: '42%', startDate: 'Jan 2025', pace: 'Behind', todayPct: 50, linkedAccount: { name: 'Joint Brokerage', number: 'BRK-2020-4471', contributionAmount: '$18,500', availableBalance: '$261,500' }, competingGoals: [{ name: 'Home Purchase', amount: 'Not started', status: 'Pending', statusClass: 'c-ep-goal-competing-status' }] },
    e11: { description: "Maya Bennett was born, the couple's first child, triggering a life-insurance review, a new education-funding goal, and updated beneficiaries.", isShared: true, sharedWith: 'Grace Bennett · Maya Bennett', isCritical: true, date: 'Apr 14, 2026', membersAffected: 3, status: 'No plan update', aiInsight: "Emma was born in April 2026 — no college funding plan has been modeled for Maya. First tuition bill is due Aug 2027.", aiActionLabel: 'Model College Plan', members: 'David · Grace · Maya Bennett', cashFlowImpact: '$2,800/mo starting Aug 2026', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record', primaryPerson: 'David Bennett', relatedPerson: 'Grace Bennett · Maya Bennett', eventLocation: 'Austin, TX', eventDescription: "Maya Bennett was born on April 14, 2026 — the couple's first child. Event triggered a life-insurance review, a new education-funding goal, and the need to update beneficiaries across all accounts. No 529 plan has been opened.", owner: 'Alex Grant' },
    e12: { description: 'Purchased a term-life policy to protect the family\'s income after Emma\'s birth, closing the protection gap from the new dependent.', isShared: false, sharedWith: '', isCritical: false, date: 'Jun 2026', membersAffected: 1, status: 'Active', aiInsight: "Sara does not have equivalent term coverage. Recommend evaluating a matching policy for Sara given the shared income and dependent care obligations.", aiActionLabel: "Review Sara's Coverage", members: 'David Bennett', cashFlowImpact: '$85/mo premium', beneficiaries: 'Grace Bennett (primary), Maya Bennett (contingent)', actionTaken: 'Policy purchased and documented.', openingDate: 'Jun 2026', totalOutstandingAmount: '$1,000,000', accountType: '20-Year Term Life', accountNumber: 'TL-2026-7754', maturityDate: 'Jun 2046', heldAway: 'No' },
    e13: { description: 'Couple raised upcoming family planning, prompting a forward look at life insurance, cash reserves, and future education funding.', isShared: false, sharedWith: '', isCritical: false, date: 'Oct 2025', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Review completed.', subject: 'Annual Review', startDateTime: 'Oct 25, 2025 · 10:00 AM', location: 'Video Call', endDateTime: 'Oct 25, 2025 · 11:00 AM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Couple raised upcoming family planning. Life insurance, cash reserves, and future education funding reviewed.' },
    e14: { description: 'Mid-year performance review with David. Reviewed insurance follow-ups and education funding. Grace absent.', isShared: false, sharedWith: '', isCritical: false, date: 'Jun 2026', membersAffected: 1, status: 'Scheduled', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Meeting invite sent.', subject: 'Mid-Year Check-in', startDateTime: 'Jun 15, 2026 · 2:00 PM', location: 'Video Call', endDateTime: 'Jun 15, 2026 · 3:00 PM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Mid-year performance review. Follow-ups confirmed on insurance and education funding. Grace absent.' },
    e15: { description: 'Predicted vesting of Tranche 1 (~$40K net) from the 4-year grant noted in the Oct-2022 review; plan for withholding and redeployment.', isShared: false, sharedWith: '', isCritical: true, date: 'Jan 2027', membersAffected: 1, status: 'Predicted', aiInsight: "Mark's 4-year RSU grant (flagged in Oct 2022 review) is expected to vest in Feb 2027 (~$40K net). Plan now for tax-efficient reinvestment.", aiActionLabel: 'Model RSU Reinvestment', members: 'David Bennett', cashFlowImpact: 'Est. $18,000 gross (variable)', beneficiaries: null, actionTaken: 'None — future event' },
    // ── Grace Bennett — yearly ───────────────────────────────────────────
    e16: { description: 'Rebalanced the joint brokerage to target allocation after drift and reaffirmed long-term growth objectives.', isShared: true, sharedWith: 'David Bennett', isCritical: false, date: 'Nov 2020', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Financial snapshot documented.', subject: 'Annual Review', startDateTime: 'Nov 10, 2020 · 10:00 AM', location: 'Video Call', endDateTime: 'Nov 10, 2020 · 11:00 AM', whoName: 'Grace Bennett · David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Portfolio rebalancing to target allocation. Joint brokerage drift corrected. Goals reaffirmed.' },
    e17: { description: "Opened a Roth IRA for Sara to add tax-free retirement growth and diversify the household's tax exposure.", isShared: false, sharedWith: '', isCritical: false, date: 'Apr 2025', membersAffected: 1, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Grace Bennett', cashFlowImpact: '$500/mo contribution', beneficiaries: 'David Bennett', actionTaken: 'Account opened and max funded.', openingDate: 'Apr 2025', totalOutstandingAmount: '$31,400', accountType: 'Roth IRA', accountNumber: 'IRA-2022-5581', maturityDate: 'N/A', heldAway: 'No' },
    e18: { description: 'Focused on home-purchase readiness; modeled down-payment funding and timing. Mark flagged the RSU grant as a future liquidity source.', isShared: true, sharedWith: 'David Bennett', isCritical: false, date: 'Oct 2022', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Goals updated. No allocation changes needed.', subject: 'Annual Review', startDateTime: 'Oct 12, 2022 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 12, 2022 · 11:00 AM', whoName: 'Grace Bennett · David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Home-purchase readiness discussion. Down-payment modeled. RSU grant noted as future liquidity source.' },
    e19: { description: 'Purchased their first home (3-bed/2-bath single-family), shifting cash flow to a mortgage and reshaping savings capacity.', isShared: true, sharedWith: 'David Bennett', isCritical: false, date: 'Aug 2023', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · David Bennett', cashFlowImpact: '$2,100/mo mortgage', beneficiaries: null, actionTaken: 'Home purchase recorded in plan.', primaryPerson: 'Grace Bennett', relatedPerson: 'David Bennett', eventLocation: 'Austin, TX', eventDescription: 'First home purchase — 3-bed/2-bath single-family in Austin. Down payment funded from joint brokerage. Monthly mortgage of $2,100/mo began in August 2023.', owner: 'Alex Grant' },
    e20: { description: 'Couple raised upcoming family planning, prompting a forward look at life insurance, cash reserves, and future education funding.', isShared: true, sharedWith: 'David Bennett', isCritical: false, date: 'Oct 2024', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'All goals on track at time of review.', subject: 'Annual Review', startDateTime: 'Oct 8, 2024 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 8, 2024 · 11:30 AM', whoName: 'Grace Bennett · David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Family planning discussion raised. Life insurance, reserves, and education funding reviewed for upcoming dependent.' },
    e21: { description: 'Established a $45K new-car fund targeting 2027, funded from the joint brokerage; later at risk as a market dip pressured the funding source.', isShared: false, sharedWith: '', isCritical: true, date: 'Dec 2025', membersAffected: 1, status: 'At Risk', aiInsight: "The $45K car goal (target 2027) relies on brokerage growth. A recent market dip has put the timeline at risk — rebalance or adjust.", aiActionLabel: null, members: 'David Bennett', cashFlowImpact: '$500/mo target savings', beneficiaries: null, actionTaken: 'Goal recorded.', targetAmount: '$45,000', targetDate: 'Feb 2027', priority: 'High', goalType: 'Savings', actualAmount: '$18,500', estSuccess: '42%', startDate: 'Jan 2025', pace: 'Behind', todayPct: 50, linkedAccount: { name: 'Joint Brokerage', number: 'BRK-2020-4471', contributionAmount: '$18,500', availableBalance: '$261,500' }, competingGoals: [{ name: 'Home Purchase', amount: 'Not started', status: 'Pending', statusClass: 'c-ep-goal-competing-status' }] },
    e22: { description: "Maya Bennett was born, the couple's first child, triggering a life-insurance review, a new education-funding goal, and updated beneficiaries.", isShared: true, sharedWith: 'David Bennett · Maya Bennett', isCritical: true, date: 'Apr 14, 2026', membersAffected: 3, status: 'No plan update', aiInsight: "Emma was born in April 2026 — no college funding plan has been modeled for Maya. First tuition bill is due Aug 2027.", aiActionLabel: 'Model College Plan', members: 'Grace · David · Maya Bennett', cashFlowImpact: '–$4,200/mo (parental leave)', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record', primaryPerson: 'Grace Bennett', relatedPerson: 'David Bennett · Maya Bennett', eventLocation: 'Austin, TX', eventDescription: "Maya Bennett was born on April 14, 2026 — the couple's first child. Sara entered parental leave. Event triggered life-insurance review and the need to update beneficiaries. No 529 plan has been opened.", owner: 'Alex Grant' },
    // ── Maya Bennett — yearly ───────────────────────────────────────────
    e23: { description: 'Maya Bennett was born, the couple\'s first child, triggering a life-insurance review, a new education-funding goal, and updated beneficiaries.', isShared: true, sharedWith: 'David Bennett · Grace Bennett', isCritical: true, date: 'Apr 14, 2026', membersAffected: 3, status: 'Noted', aiInsight: "Emma was born in April 2026 — no college funding plan has been modeled for Maya. First tuition bill is due Aug 2027.", aiActionLabel: 'Model College Plan', members: 'Emma · Mark · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Emma added as household dependent.', primaryPerson: 'Maya Bennett', relatedPerson: 'David Bennett · Grace Bennett', eventLocation: 'Austin, TX', eventDescription: 'Maya Bennett was born on April 14, 2026 and added as a household dependent. Triggers life-insurance review, education-funding goal, and beneficiary updates across all household accounts.', owner: 'Alex Grant' },
    e24: { description: "Projected college-funding target as Emma turns 18 (~$300K); anchors a long-horizon education-savings goal to fund from today forward.", isShared: false, sharedWith: '', isCritical: true, date: '2027 (predicted)', membersAffected: 1, status: 'Predicted', aiInsight: "Emma was born in April 2026 — no college funding plan has been modeled for Maya. First tuition bill is due Aug 2027.", aiActionLabel: 'Model College Plan', members: 'Maya Bennett', cashFlowImpact: 'Est. $200/mo contribution', beneficiaries: null, actionTaken: 'Not yet initiated', targetAmount: '$300,000', targetDate: 'Sep 2043', priority: 'High', goalType: 'Education', actualAmount: '$0', estSuccess: 'Not started', startDate: '2027 (planned)', pace: 'Not started', todayPct: 0, linkedAccount: { name: 'Joint Brokerage', number: 'BRK-2020-4471', contributionAmount: '$0', availableBalance: '$261,500' }, competingGoals: [{ name: 'New Car Fund', amount: '$18,500 / $45,000', status: 'At Risk', statusClass: 'c-ep-goal-competing-status c-ep-goal-competing-status_risk' }] },
    // ── Monthly events — David Bennett (me1a … me1l are historical events before me1) ──
    me1a: { description: 'Onboarded Mark as a new client and stood up his first managed portfolio; captured initial goals, risk tolerance, and funding sources.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Mar 2019', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Welcome call completed. Planning doc shared.', subject: 'Client Onboarding', startDateTime: 'Mar 15, 2019 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Mar 15, 2019 · 11:30 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Initial onboarding covering goals, risk tolerance, time horizon, and initial funding sources. IPS drafted.' },
    me1b: { description: 'Opened a joint taxable brokerage as the household\'s core managed portfolio, consolidating shared investable assets under advisory.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Apr 2020', membersAffected: 2, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark · Grace Bennett', cashFlowImpact: '$500/mo contribution', beneficiaries: 'Grace Bennett (50%), David Bennett (50%)', actionTaken: 'Account opened and funded.', openingDate: 'Apr 2020', totalOutstandingAmount: '$280,000', accountType: 'Taxable Brokerage', accountNumber: 'BRK-2020-4471', maturityDate: 'N/A', heldAway: 'No' },
    me1c: { description: 'Rebalanced the joint brokerage to target allocation after drift and reaffirmed long-term growth objectives.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Nov 2020', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Reviewed and updated investment allocations.', subject: 'Annual Review', startDateTime: 'Nov 10, 2020 · 10:00 AM', location: 'Video Call', endDateTime: 'Nov 10, 2020 · 11:00 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Portfolio rebalancing to target allocation. Joint brokerage drift corrected. Goals reaffirmed.' },
    me1d: { description: 'Established a .5K cash-reserve emergency fund (~3-6 months of expenses), completing the household\'s liquidity foundation.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Jun 2021', membersAffected: 2, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark · Grace Bennett', cashFlowImpact: '$18,000 milestone', beneficiaries: null, actionTaken: 'Goal milestone recorded.', openingDate: 'Jun 2021', totalOutstandingAmount: '$18,500', accountType: 'HYSA / Cash Reserve', accountNumber: 'SAV-2021-8832', maturityDate: 'N/A', heldAway: 'No' },
    me1e: { description: "Mark was promoted with a salary increase and a 4-year-vesting RSU grant, raising household income and introducing concentrated equity to plan around.", isShared: false, sharedWith: '', isCritical: false, date: 'Jul 2025', membersAffected: 1, status: 'Noted', aiInsight: "Salary increase creates an opportunity to boost retirement contributions and increase the car savings goal rate. Consider a Mega Backdoor Roth if the employer plan allows.", aiActionLabel: 'Review Contribution Strategy', members: 'David Bennett', cashFlowImpact: '+$15K/yr income', beneficiaries: null, actionTaken: 'Income updated in plan.', sentimentInsights: [{ name: 'David Bennett', role: 'Primary Client', keyword: 'Ambitious', insight: 'Motivated by milestones — will embrace complex strategies like Mega Backdoor Roth if given a clear step-by-step plan.' }], primaryPerson: 'David Bennett', relatedPerson: '—', eventLocation: 'San Francisco, CA', eventDescription: 'Mark received a promotion to Senior Engineer with a $15K salary increase and a 4-year vesting RSU grant (~$160K total). Introduces concentrated tech-equity exposure to the household plan.', owner: 'Alex Grant' },
    me1f: { description: 'Focused on home-purchase readiness; modeled down-payment funding and timing. Mark flagged the RSU grant as a future liquidity source.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Oct 2022', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'All accounts reviewed. No changes required.', subject: 'Annual Review', startDateTime: 'Oct 12, 2022 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 12, 2022 · 11:00 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Home-purchase readiness discussion. Down-payment modeled. RSU grant noted as future liquidity source.' },
    me1g: { description: 'Purchased their first home (3-bed/2-bath single-family), shifting cash flow to a mortgage and reshaping savings capacity.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Aug 2023', membersAffected: 2, status: 'Completed', aiInsight: "New mortgage has not triggered a review of life insurance coverage or beneficiary updates. Recommend scheduling a protection review.", aiActionLabel: 'Schedule Protection Review', members: 'Mark · Grace Bennett', cashFlowImpact: '$2,100/mo mortgage', beneficiaries: 'Not updated post-purchase', actionTaken: 'Home purchase recorded.', sentimentInsights: [{ name: 'David Bennett', role: 'Primary Client', keyword: 'Pragmatic', insight: 'Equity-focused mindset; open to re-balancing towards mortgage paydown over aggressive investing.' }, { name: 'Grace Bennett', role: 'Co-client', keyword: 'Security-driven', insight: 'Home ownership has heightened need for financial stability; insurance and emergency reserves are top of mind.' }], primaryPerson: 'David Bennett', relatedPerson: 'Grace Bennett', eventLocation: 'Austin, TX', eventDescription: 'First home purchase — 3-bed/2-bath single-family in Austin. Down payment funded from joint brokerage. Monthly mortgage of $2,100/mo began in August 2023. Beneficiaries not updated post-purchase.', owner: 'Alex Grant' },
    me1h: { description: "Opened an HSA under a high-deductible plan, used as a stealth retirement vehicle for triple-tax-advantaged growth.", isShared: false, sharedWith: '', isCritical: false, date: 'Feb 2024', membersAffected: 1, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: '$3,850/yr contribution (2024 limit)', beneficiaries: 'Grace Bennett', actionTaken: 'Account opened. Payroll deduction set.', openingDate: 'Feb 2024', totalOutstandingAmount: '$9,200', accountType: 'Health Savings Account', accountNumber: 'HSA-2024-3319', maturityDate: 'N/A', heldAway: 'No' },
    me1i: { description: 'Couple raised upcoming family planning, prompting a forward look at life insurance, cash reserves, and future education funding.', isShared: true, sharedWith: 'Grace Bennett', isCritical: false, date: 'Oct 2024', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Grace Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Investment rebalancing recommended and executed.', subject: 'Annual Review', startDateTime: 'Oct 8, 2024 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 8, 2024 · 11:30 AM', whoName: 'David Bennett · Grace Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Family planning discussion raised. Life insurance, reserves, and education funding reviewed for upcoming dependent.' },
    me1j: { description: "Established a $45K new-car fund targeting 2027, funded from the joint brokerage; later at risk as a market dip pressured the funding source.", isShared: false, sharedWith: '', isCritical: true, date: 'Dec 2025', membersAffected: 1, status: 'At Risk', aiInsight: "The $45K car goal (target 2027) relies on brokerage growth. A recent market dip has put the timeline at risk — rebalance or adjust.", aiActionLabel: 'Review Goal', members: 'David Bennett', cashFlowImpact: '$500/mo target savings', beneficiaries: null, actionTaken: 'Goal recorded. No adjustment made.', targetAmount: '$45,000', targetDate: 'Feb 2027', priority: 'High', goalType: 'Savings', actualAmount: '$18,500', estSuccess: '42%', startDate: 'Jan 2025', pace: 'Behind', todayPct: 50, linkedAccount: { name: 'Joint Brokerage', number: 'BRK-2020-4471', contributionAmount: '$18,500', availableBalance: '$261,500' }, competingGoals: [{ name: 'Home Purchase', amount: 'Not started', status: 'Pending', statusClass: 'c-ep-goal-competing-status' }] },
    me1k: { description: "Maya Bennett was born, the couple's first child, triggering a life-insurance review, a new education-funding goal, and updated beneficiaries.", isShared: true, sharedWith: 'Grace Bennett · Maya Bennett', isCritical: true, date: 'Apr 14, 2026', membersAffected: 3, status: 'No plan update', aiInsight: "Emma was born in April 2026 — no college funding plan has been modeled for Maya. First tuition bill is due Aug 2027.", aiActionLabel: 'Model College Plan', members: 'David · Grace · Maya Bennett', cashFlowImpact: '$2,800/mo starting Aug 2026', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record', primaryPerson: 'David Bennett', relatedPerson: 'Grace Bennett · Maya Bennett', eventLocation: 'Austin, TX', eventDescription: "Maya Bennett was born on April 14, 2026 — the couple's first child. Event triggered a life-insurance review, a new education-funding goal, and the need to update beneficiaries across all accounts. No 529 plan has been opened.", owner: 'Alex Grant' },
    me1l: { description: 'Purchased a term-life policy to protect the family\'s income after Emma\'s birth, closing the protection gap from the new dependent.', isShared: false, sharedWith: '', isCritical: false, date: 'Jun 2026', membersAffected: 1, status: 'Active', aiInsight: "Sara does not have equivalent term coverage. Recommend evaluating a matching policy for Sara given the shared income and dependent care obligations.", aiActionLabel: "Review Sara's Coverage", members: 'David Bennett', cashFlowImpact: '$85/mo premium', beneficiaries: 'Grace Bennett (primary), Maya Bennett (contingent)', actionTaken: 'Policy purchased and documented.', openingDate: 'Jun 2026', totalOutstandingAmount: '$1,000,000', accountType: '20-Year Term Life', accountNumber: 'TL-2026-7754', maturityDate: 'Jun 2046', heldAway: 'No' },
    me1: { description: "Mark took 4 weeks of paternity leave following Emma's birth. Employer provides 4 weeks of paid leave.", isShared: false, sharedWith: '', isCritical: false, date: 'Aug 2025', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: 'No income impact (paid leave)', beneficiaries: null, actionTaken: 'Leave recorded.' },
    me2: { description: 'Couple raised upcoming family planning, prompting a forward look at life insurance, cash reserves, and future education funding.', isShared: false, sharedWith: '', isCritical: false, date: 'Oct 2025', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Review completed.', subject: 'Annual Review', startDateTime: 'Oct 25, 2025 · 10:00 AM', location: 'Video Call', endDateTime: 'Oct 25, 2025 · 11:00 AM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Couple raised upcoming family planning. Life insurance, cash reserves, and future education funding reviewed.' },
    me3: { description: 'Year-end tax and financial planning session to review contribution limits, RSU vest schedule, and portfolio rebalancing.', isShared: false, sharedWith: '', isCritical: false, date: 'Nov 2025', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Year-end contributions maximised.', subject: 'Year-End Tax Planning', startDateTime: 'Nov 15, 2025 · 2:00 PM', location: 'Video Call', endDateTime: 'Nov 15, 2025 · 3:00 PM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Reviewed 401(k) and IRA contribution limits, RSU vest schedule, and year-end portfolio rebalancing. All contributions maximised.' },
    me4: { description: 'Mark received a second promotion, increasing his annual compensation by ~$20K and accelerating RSU vest schedule.', isShared: false, sharedWith: '', isCritical: false, date: 'Mar 2026', membersAffected: 1, status: 'Noted', aiInsight: "New compensation level may push Mark into a higher marginal tax bracket. Review withholding elections and consider increasing 401(k) contributions to offset.", aiActionLabel: 'Review Tax Strategy', members: 'David Bennett', cashFlowImpact: '+$20K/yr income', beneficiaries: null, actionTaken: 'Compensation update noted.' },
    me5: { description: 'Emma started full-time daycare. Monthly cost of $2,800 begins creating a sustained impact on household cash flow.', isShared: false, sharedWith: '', isCritical: true, date: 'May 2026', membersAffected: 1, status: 'Active', aiInsight: "Daycare cost of $2,800/mo is significant. A DCFSA election could provide up to $5,000 in pre-tax relief annually. Open enrollment may be available at next benefit cycle.", aiActionLabel: 'Explore DCFSA Options', members: 'David Bennett', cashFlowImpact: '$2,800/mo daycare', beneficiaries: null, actionTaken: 'None on record' },
    me6: { description: 'Reviewed performance and congratulated Mark on baby Emma; Sara absent again. Confirmed follow-ups on insurance and education funding.', isShared: false, sharedWith: '', isCritical: false, date: 'Aug 2026', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Meeting invite sent.', subject: 'Mid-Year Check-in', startDateTime: 'Aug 15, 2026 · 2:00 PM', location: 'Video Call', endDateTime: 'Aug 15, 2026 · 3:00 PM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Mid-year performance review. Follow-ups on insurance coverage and college funding plan for Maya and eldercare cost planning for Eleanor to be confirmed.' },
    e_mc26: { description: 'Reviewed portfolio performance and confirmed no changes to goals or risk tolerance between annual reviews.', isShared: false, sharedWith: '', isCritical: false, date: 'Mar 2026', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'No changes required.', subject: 'Mid-Year Check-in', startDateTime: 'Mar 15, 2026 · 2:00 PM', location: 'Video Call', endDateTime: 'Mar 15, 2026 · 3:00 PM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Reviewed portfolio performance and confirmed no changes to goals or risk tolerance between annual reviews.' },
    e_ar26: { description: 'Scheduled annual review to bring Sara into the planning conversation and formally address 529 college funding and updated protection following Emma\'s birth.', isShared: false, sharedWith: '', isCritical: false, date: 'Oct 2026', membersAffected: 1, status: 'Scheduled', aiInsight: null, aiActionLabel: null, members: 'David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Meeting invite sent.', subject: 'Annual Review', startDateTime: 'Oct 14, 2026 · 10:00 AM', location: '123 Maple Street, Apt 4B, Springfield, IL 62701', endDateTime: 'Oct 14, 2026 · 11:30 AM', whoName: 'David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Scheduled annual review. Agenda: bring Sara into the planning conversation, address 529 college funding for Emma, and update protection coverage post-birth.' },
    me7a: { description: 'Rebalanced the joint brokerage to target allocation after drift and reaffirmed long-term growth objectives.', isShared: true, sharedWith: 'David Bennett', isCritical: false, date: 'Nov 2020', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Financial snapshot documented.', subject: 'Annual Review', startDateTime: 'Nov 10, 2020 · 10:00 AM', location: 'Video Call', endDateTime: 'Nov 10, 2020 · 11:00 AM', whoName: 'Grace Bennett · David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Portfolio rebalancing to target allocation. Joint brokerage drift corrected. Goals reaffirmed.' },
    me7b: { description: "Opened a Roth IRA for Sara to add tax-free retirement growth and diversify the household's tax exposure.", isShared: false, sharedWith: '', isCritical: false, date: 'Apr 2025', membersAffected: 1, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Grace Bennett', cashFlowImpact: '$500/mo contribution', beneficiaries: 'David Bennett', actionTaken: 'Account opened and max funded.', openingDate: 'Apr 2025', totalOutstandingAmount: '$31,400', accountType: 'Roth IRA', accountNumber: 'IRA-2022-5581', maturityDate: 'N/A', heldAway: 'No' },
    me7c: { description: 'Focused on home-purchase readiness; modeled down-payment funding and timing. Mark flagged the RSU grant as a future liquidity source.', isShared: true, sharedWith: 'David Bennett', isCritical: false, date: 'Oct 2022', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Goals updated. No allocation changes needed.', subject: 'Annual Review', startDateTime: 'Oct 12, 2022 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 12, 2022 · 11:00 AM', whoName: 'Grace Bennett · David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Home-purchase readiness discussion. Down-payment modeled. RSU grant noted as future liquidity source.' },
    me7d: { description: 'Purchased their first home (3-bed/2-bath single-family), shifting cash flow to a mortgage and reshaping savings capacity.', isShared: true, sharedWith: 'David Bennett', isCritical: false, date: 'Aug 2023', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · David Bennett', cashFlowImpact: '$2,100/mo mortgage', beneficiaries: null, actionTaken: 'Home purchase recorded in plan.', primaryPerson: 'Grace Bennett', relatedPerson: 'David Bennett', eventLocation: 'Austin, TX', eventDescription: 'First home purchase — 3-bed/2-bath single-family in Austin. Down payment funded from joint brokerage. Monthly mortgage of $2,100/mo began in August 2023.', owner: 'Alex Grant' },
    me7e: { description: 'Couple raised upcoming family planning, prompting a forward look at life insurance, cash reserves, and future education funding.', isShared: true, sharedWith: 'David Bennett', isCritical: false, date: 'Oct 2024', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · David Bennett', cashFlowImpact: null, beneficiaries: null, actionTaken: 'All goals on track at time of review.', subject: 'Annual Review', startDateTime: 'Oct 8, 2024 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 8, 2024 · 11:30 AM', whoName: 'Grace Bennett · David Bennett', relatedTo: 'Bennett Household', showTimeAs: 'Busy', engagementNotes: 'Family planning discussion raised. Life insurance, reserves, and education funding reviewed for upcoming dependent.' },
    me7f: { description: "Established a $45K new-car fund targeting 2027, funded from the joint brokerage; later at risk as a market dip pressured the funding source.", isShared: false, sharedWith: '', isCritical: true, date: 'Dec 2025', membersAffected: 1, status: 'At Risk', aiInsight: "The $45K car goal (target 2027) relies on brokerage growth. A recent market dip has put the timeline at risk — rebalance or adjust.", aiActionLabel: 'Review Goal', members: 'David Bennett', cashFlowImpact: '$500/mo target savings', beneficiaries: null, actionTaken: 'Goal recorded.', targetAmount: '$45,000', targetDate: 'Feb 2027', priority: 'High', goalType: 'Savings', actualAmount: '$18,500', estSuccess: '42%', startDate: 'Jan 2025', pace: 'Behind', todayPct: 50, linkedAccount: { name: 'Joint Brokerage', number: 'BRK-2020-4471', contributionAmount: '$18,500', availableBalance: '$261,500' }, competingGoals: [{ name: 'Home Purchase', amount: 'Not started', status: 'Pending', statusClass: 'c-ep-goal-competing-status' }] },
    me7g: { description: "Maya Bennett was born, the couple's first child, triggering a life-insurance review, a new education-funding goal, and updated beneficiaries.", isShared: true, sharedWith: 'David Bennett · Maya Bennett', isCritical: true, date: 'Apr 14, 2026', membersAffected: 3, status: 'No plan update', aiInsight: "Emma was born in April 2026 — no college funding plan has been modeled for Maya. First tuition bill is due Aug 2027.", aiActionLabel: 'Model College Plan', members: 'Grace · David · Maya Bennett', cashFlowImpact: '–$4,200/mo (parental leave)', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record', primaryPerson: 'Grace Bennett', relatedPerson: 'David Bennett · Maya Bennett', eventLocation: 'Austin, TX', eventDescription: "Maya Bennett was born on April 14, 2026 — the couple's first child. Sara entered parental leave. Event triggered life-insurance review and the need to update beneficiaries. No 529 plan has been opened.", owner: 'Alex Grant' },
    me7h: { description: "Sara's parental leave began April 14, 2026, following Emma's birth. Employer provides 16 weeks of paid parental leave.", isShared: false, sharedWith: '', isCritical: false, date: 'Apr 2025', membersAffected: 1, status: 'Active', aiInsight: "Maternity leave reduces household cash flow by ~$4,200/mo. No emergency reserve drawdown plan has been initiated. Daycare costs of $2,800/mo will begin in approximately 6 months.", aiActionLabel: 'Review Cash-Flow Plan', members: 'Grace Bennett', cashFlowImpact: '–$4,200/mo (partial income reduction)', beneficiaries: null, actionTaken: 'Leave period recorded. No cash-flow plan initiated.' },
    me7: { description: "Maya Bennett born. Sara enters maternity leave immediately post-delivery. Household income reduced during leave period.", isShared: true, sharedWith: 'David Bennett · Maya Bennett', isCritical: true, date: 'Aug 2025', membersAffected: 3, status: 'No plan update', aiInsight: "Sara's maternity leave reduces household income. No cash-flow plan or short-term reallocation has been initiated. Daycare costs will begin in ~6 months.", aiActionLabel: 'Review Cash-Flow Impact', members: 'Grace · David · Maya Bennett', cashFlowImpact: '–$4,200/mo (maternity leave)', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record' },
    me8: { description: "Sara returned to work full-time after 10 months of maternity leave, restoring household income to pre-birth levels.", isShared: false, sharedWith: '', isCritical: false, date: 'Jun 2026', membersAffected: 1, status: 'Completed', aiInsight: "Sara's return to work restores household income. This is a good trigger to revisit the car goal timeline, 529 contributions, and Roth IRA funding for the year.", aiActionLabel: 'Revisit Household Plan', members: 'Grace Bennett', cashFlowImpact: '+$4,200/mo income restored', beneficiaries: null, actionTaken: 'None on record' },
    me9a: { description: 'Maya Bennett was born, the couple\'s first child, triggering a life-insurance review, a new education-funding goal, and updated beneficiaries.', isShared: true, sharedWith: 'David Bennett · Grace Bennett', isCritical: true, date: 'Apr 14, 2026', membersAffected: 3, status: 'Noted', aiInsight: "Emma was born in April 2026 — no college funding plan has been modeled for Maya. First tuition bill is due Aug 2027.", aiActionLabel: 'Model College Plan', members: 'Emma · Mark · Grace Bennett', cashFlowImpact: null, beneficiaries: 'Not yet designated', actionTaken: 'Emma added as household dependent.', primaryPerson: 'Maya Bennett', relatedPerson: 'David Bennett · Grace Bennett', eventLocation: 'Austin, TX', eventDescription: 'Maya Bennett was born on April 14, 2026 and added as a household dependent. Triggers life-insurance review, education-funding goal, and beneficiary updates across all household accounts.', owner: 'Alex Grant' },
    me9: { description: "Emma's 1st birthday milestone. No formal planning event, but serves as a reminder to initiate 529 funding and update beneficiaries.", isShared: true, sharedWith: 'David Bennett · Grace Bennett', isCritical: false, date: 'Apr 2026', membersAffected: 3, status: 'Noted', aiInsight: "Emma was born in April 2026 — no college funding plan has been modeled for Maya. First tuition bill is due Aug 2027.", aiActionLabel: 'Model College Plan', members: 'Emma · Mark · Grace Bennett', cashFlowImpact: null, beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record' },
};

/** Per-account enrichment data keyed by account id */
const ENRICHMENT = {
    a9: {
        accountId: 'RH-2026-009',
        segment: 'Established',
        totalAUM: 610000,
        liabilities: 195000,
        risk: 'Medium',
        clientSince: 'Apr 2016',
        openAccounts: 3,
        taxExposure: '$6K Capital Gains',
        primaryMember: 'David Bennett',
        primaryMemberEmail: 'david.bennett@gmail.com',
        clientSummary: {
            lastUpdate: 'Last update at 11:30 PM by Agentforce.',
            summary: 'Established mass-affluent household navigating college-funding timelines, eldercare costs, and a Grace re-engagement gap, with David as the sole active meeting participant.',
            whatChanged: "Eleanor moved in spring 2026, adding eldercare costs to the household plan; Maya starts college fall 2027 (first tuition bill Aug 2027); Grace last engaged ~18 months ago; David promoted to VP with raise in 2025.",
            whyItMatters: 'The upcoming annual review is a high-value opportunity to model college funding for Maya, re-engage Grace as a co-client, and plan around eldercare costs now inside the household.',
            keyDataPoints: [
                'AUM: $610K',
                'Wallet Share and Trend (MoM): Est. 52%',
                'College Funding: Maya starts fall 2027 — plan not modeled',
                'Eldercare: Eleanor moved in spring 2026 — costs unplanned',
                'Relationship Health: David-only engagement',
            ],
            sources: 'Insights synthesized from CRM activity logs, account statements, and internal planning notes.',
        },
        agenticSummary: "Last 12 months: The Bennett household's planning priorities shifted significantly with Eleanor moving in (spring 2026) and Maya's college start approaching (fall 2027). David received a VP promotion with a raise in 2025. Engagement has been David-only — Grace has not been meaningfully engaged in ~18 months — and no college funding plan has been modeled for Maya despite the Aug 2027 first-tuition deadline.",
        agenticImpact: "The upcoming annual review is a high-value opportunity to address college funding for Maya and Joshua, bring Grace back into the planning conversation, and build a cash-flow model for Eleanor's eldercare costs.",
        agenticSummaryAllTime: "All time (Apr 2016 – Jul 2026): The Bennett household has grown to $610K AUM over a 10-year relationship, driven by David's career progression to VP and disciplined joint savings. Key milestones include joint brokerage setup (2020), emergency fund completion (2021), home purchase (2023), and Eleanor moving in (2026). The relationship has narrowed to David-only engagement; Grace has drifted out of the conversation over the past 18 months. Maya's college start (fall 2027) and Joshua's (~2030) represent the household's next major financial milestones.",
        agenticImpactAllTime: "The 10-year relationship provides a strong foundation for a comprehensive household financial plan review. Addressing the college-funding gaps, Grace re-engagement, and eldercare cost planning before the next major life phase will be critical to sustaining long-term growth and household alignment.",
        nextBestActions: [],
        meetings: [
            {
                id: 'mtg1',
                title: 'Annual Review — David Bennett',
                datetime: 'Oct 25, 2025 · 10:00 AM',
                description: 'Completed with David only. Grace absent for the second consecutive year. Key gaps — college funding for Maya, eldercare cost plan — remain unaddressed.',
                status: 'Completed',
                statusClass: 'c-mtg-badge c-mtg-badge_complete',
                cardClass: 'c-mtg-item',
            },
            {
                id: 'mtg2',
                title: 'Year-End Tax Planning',
                datetime: 'Nov 15, 2025 · 2:00 PM',
                description: 'Reviewed contribution limits, VP compensation increase, and portfolio rebalancing. Year-end contributions maximised.',
                status: 'Completed',
                statusClass: 'c-mtg-badge c-mtg-badge_complete',
                cardClass: 'c-mtg-item',
            },
            {
                id: 'mtg3',
                title: 'Mid-Year Check-in',
                datetime: 'Jun 15, 2026 · 11:00 AM',
                description: 'Review portfolio performance, Maya college-funding plan, eldercare cash-flow impact, and Joshua\'s future education timeline.',
                status: 'Prep: 25%',
                statusClass: 'c-mtg-badge c-mtg-badge_prep',
                cardClass: 'c-mtg-item',
            },
            {
                id: 'mtg4',
                title: '1:1 with Grace Bennett',
                datetime: 'TBD',
                description: 'Dedicated session focused on Grace\'s priorities: re-engagement as a co-client, household insurance coverage gaps, and eldercare planning.',
                status: 'Not Booked',
                statusClass: 'c-mtg-badge c-mtg-badge_notbooked',
                cardClass: 'c-mtg-item',
            },
        ],
        highlights: [
            // ── Timeline Insights (shown in insights panel only, not the banner) ──
            {
                id: 'h1',
                badgeLabel: 'Alert',
                badgeClass: 'c-badge c-badge_alert',
                category: 'Financial Goal Insights',
                title: "Maya's 529 Funding Gap",
                description: "Maya's 529 is 60% funded against projected tuition — first bill due Aug 2027, short ~40%. Window to close the gap is now months, not years.",
                actionLabel: 'Update Goal',
                timelineEventId: 'op1',
                storyPurpose: 'Action 1: Update a goal · Meeting Concierge prep brief',
                hideFromAlerts: true,
            },
            {
                id: 'h2',
                badgeLabel: 'Gap',
                badgeClass: 'c-badge c-badge_gap',
                category: 'Life Event Insights',
                title: "Eldercare & Eleanor's Documents",
                description: "Eleanor (74) moved in Apr 2026. POA (financial + healthcare), will, and healthcare directive must be in place before any health decline closes the legal window. Scoped David + Grace.",
                actionLabel: 'Create Meeting',
                timelineEventId: 'op2',
                storyPurpose: 'Action 2: Add a future event — also pulls Grace back in',
                hideFromAlerts: true,
            },
            {
                id: 'h3',
                badgeLabel: 'Gap',
                badgeClass: 'c-badge c-badge_gap',
                category: 'Financial Account Insights',
                title: 'Protection Lagged the Household',
                description: "David's VP raise in 2025 was never matched by a life-insurance re-rate. Coverage now trails obligations — 2 kids + a dependent parent.",
                actionLabel: 'Create Opportunity',
                timelineEventId: 'op3',
                storyPurpose: 'Action 3: Create a task — draft proposal for additional insurance',
                hideFromAlerts: true,
            },
            {
                id: 'h4',
                badgeLabel: 'Relationship',
                badgeClass: 'c-badge c-badge_relationship',
                category: 'Relationship Insights',
                title: 'Re-engage Grace',
                description: "Grace has been absent since the Oct-2023 annual review (~18 months). As joint client, she must be part of eldercare decisions. Adding her to the eldercare session resolves both signals.",
                actionLabel: 'Create Meeting',
                timelineEventId: 'm_ar23',
                storyPurpose: 'Resolved via Action 2 — one concept, one action',
                hideFromAlerts: true,
            },
            // ── Alerts & Insights banner (RMD-triggered operational alerts) ─────
            {
                id: 'rmd1',
                badgeLabel: 'Attention Needed',
                badgeClass: 'c-badge c-badge_attention',
                category: 'Service Request',
                title: 'Open Service Request Aging',
                description: 'Address-change request unresolved 9 days — SLA breach approaching.',
                actionLabel: 'Resolve / Reassign',
                memberMeta: 'Trigger: SLA breach approaching',
            },
            {
                id: 'rmd2',
                badgeLabel: 'Urgent',
                badgeClass: 'c-badge c-badge_alert',
                category: 'Case',
                title: 'Case Escalation',
                description: 'Disputed fee on the joint brokerage account — high-priority case open >5 days.',
                actionLabel: 'Review Case',
                memberMeta: 'Trigger: High-priority, open >5 days',
            },
            {
                id: 'rmd3',
                badgeLabel: 'Attention Needed',
                badgeClass: 'c-badge c-badge_attention_amber',
                category: 'Portfolio / Financial Account',
                title: 'Portfolio Drift',
                description: 'Household allocation 8% off target — equity overweight after the recent run-up.',
                actionLabel: 'Review Allocation',
                memberMeta: 'Trigger: Allocation drift threshold',
            },
            {
                id: 'rmd4',
                badgeLabel: '',
                badgeClass: '',
                category: 'KYC / Compliance',
                title: 'KYC Review Due',
                description: "David's Know-Your-Customer profile expires in 30 days.",
                actionLabel: 'Start KYC Refresh',
                memberMeta: 'Trigger: Expiry window',
            },
            {
                id: 'rmd5',
                badgeLabel: '',
                badgeClass: '',
                category: 'Financial Account',
                title: 'Idle Cash',
                description: '$85K sitting in joint checking above the reserve target.',
                actionLabel: 'Review Cash Strategy',
                memberMeta: 'Trigger: Idle-cash threshold',
            },
        ],
        aiSuggestions: [],
        wealthJourneyYearly: [
            { period: 2019, aum:  18000, liquidity:  5000, market: 12000 },
            { period: 2020, aum:  48000, liquidity: 14000, market:  9400 }, // COVID dip
            { period: 2021, aum:  82000, liquidity: 19000, market: 22000 }, // recovery
            { period: 2022, aum: 130000, liquidity: 23000, market: 16800 }, // bear market
            { period: 2023, aum: 174000, liquidity: 15000, market: 31000 }, // bull run
            { period: 2024, aum: 230000, liquidity: 21000, market: 41500 }, // approaching goal
            { period: 2025, aum: 266000, liquidity: 19000, market: 43000 }, // near goal
            { period: 2026, aum: 280000, liquidity: 16000, isToday: true,  market: 35500 }, // dip — below $45K goal
            { period: 2027, aum: 308000, liquidity: 22000, isProjected: true, market: 40000 }, // slow recovery
            { period: 2028, aum: 342000, liquidity: 28000, isProjected: true, market: 48000 }, // above goal
        ],
        wealthJourneyMonthly: [
            // ── 2019 ── (onboarded Mar 2019, initial assets)
            { period: 'Jan 2019', aum:  42000, liquidity:  7200 },
            { period: 'Feb 2019', aum:  44000, liquidity:  7500 },
            { period: 'Mar 2019', aum:  48000, liquidity:  8000 },
            { period: 'Apr 2019', aum:  51000, liquidity:  8400 },
            { period: 'May 2019', aum:  53000, liquidity:  8700 },
            { period: 'Jun 2019', aum:  55000, liquidity:  9000 },
            { period: 'Jul 2019', aum:  57000, liquidity:  9200 },
            { period: 'Aug 2019', aum:  59000, liquidity:  9500 },
            { period: 'Sep 2019', aum:  61000, liquidity:  9800 },
            { period: 'Oct 2019', aum:  63000, liquidity: 10000 },
            { period: 'Nov 2019', aum:  65000, liquidity: 10300 },
            { period: 'Dec 2019', aum:  67000, liquidity: 10600 },
            // ── 2020 ── (joint brokerage Apr 2020; market dip Mar)
            { period: 'Jan 2020', aum:  69000, liquidity: 10900 },
            { period: 'Feb 2020', aum:  70000, liquidity: 11100 },
            { period: 'Mar 2020', aum:  62000, liquidity: 11500 },
            { period: 'Apr 2020', aum:  72000, liquidity: 11800 },
            { period: 'May 2020', aum:  76000, liquidity: 12000 },
            { period: 'Jun 2020', aum:  79000, liquidity: 12300 },
            { period: 'Jul 2020', aum:  82000, liquidity: 12600 },
            { period: 'Aug 2020', aum:  84000, liquidity: 12800 },
            { period: 'Sep 2020', aum:  86000, liquidity: 13100 },
            { period: 'Oct 2020', aum:  88000, liquidity: 13400 },
            { period: 'Nov 2020', aum:  91000, liquidity: 13700 },
            { period: 'Dec 2020', aum:  94000, liquidity: 14000 },
            // ── 2021 ── (emergency fund milestone Jan 2021)
            { period: 'Jan 2021', aum:  97000, liquidity: 18000 },
            { period: 'Feb 2021', aum:  99000, liquidity: 18200 },
            { period: 'Mar 2021', aum: 102000, liquidity: 18400 },
            { period: 'Apr 2021', aum: 104000, liquidity: 18600 },
            { period: 'May 2021', aum: 107000, liquidity: 18800 },
            { period: 'Jun 2021', aum: 110000, liquidity: 19000 },
            { period: 'Jul 2021', aum: 113000, liquidity: 19200 },
            { period: 'Aug 2021', aum: 116000, liquidity: 19400 },
            { period: 'Sep 2021', aum: 118000, liquidity: 19600 },
            { period: 'Oct 2021', aum: 121000, liquidity: 19800 },
            { period: 'Nov 2021', aum: 124000, liquidity: 20100 },
            { period: 'Dec 2021', aum: 127000, liquidity: 20400 },
            // ── 2022 ── (job promotion Mar; Roth IRA Apr)
            { period: 'Jan 2022', aum: 129000, liquidity: 20600 },
            { period: 'Feb 2022', aum: 131000, liquidity: 20800 },
            { period: 'Mar 2022', aum: 138000, liquidity: 21200 },
            { period: 'Apr 2022', aum: 141000, liquidity: 21500 },
            { period: 'May 2022', aum: 143000, liquidity: 21700 },
            { period: 'Jun 2022', aum: 145000, liquidity: 22000 },
            { period: 'Jul 2022', aum: 147000, liquidity: 22200 },
            { period: 'Aug 2022', aum: 149000, liquidity: 22400 },
            { period: 'Sep 2022', aum: 144000, liquidity: 22100 },
            { period: 'Oct 2022', aum: 148000, liquidity: 21800 },
            { period: 'Nov 2022', aum: 152000, liquidity: 21500 },
            { period: 'Dec 2022', aum: 156000, liquidity: 21200 },
            // ── 2023 ── (home purchase Jun; down payment from liquid savings)
            { period: 'Jan 2023', aum: 160000, liquidity: 21000 },
            { period: 'Feb 2023', aum: 164000, liquidity: 20800 },
            { period: 'Mar 2023', aum: 167000, liquidity: 20500 },
            { period: 'Apr 2023', aum: 170000, liquidity: 20200 },
            { period: 'May 2023', aum: 173000, liquidity: 19800 },
            { period: 'Jun 2023', aum: 176000, liquidity: 12000 },
            { period: 'Jul 2023', aum: 180000, liquidity: 12500 },
            { period: 'Aug 2023', aum: 184000, liquidity: 13000 },
            { period: 'Sep 2023', aum: 188000, liquidity: 13500 },
            { period: 'Oct 2023', aum: 192000, liquidity: 14000 },
            { period: 'Nov 2023', aum: 196000, liquidity: 14500 },
            { period: 'Dec 2023', aum: 200000, liquidity: 15000 },
            // ── 2024 ── (HSA Jan; two annual reviews)
            { period: 'Jan 2024', aum: 204000, liquidity: 15200 },
            { period: 'Feb 2024', aum: 208000, liquidity: 15400 },
            { period: 'Mar 2024', aum: 212000, liquidity: 15600 },
            { period: 'Apr 2024', aum: 216000, liquidity: 15800 },
            { period: 'May 2024', aum: 220000, liquidity: 16000 },
            { period: 'Jun 2024', aum: 224000, liquidity: 16200 },
            { period: 'Jul 2024', aum: 228000, liquidity: 16400 },
            { period: 'Aug 2024', aum: 232000, liquidity: 16600 },
            { period: 'Sep 2024', aum: 235000, liquidity: 16800 },
            { period: 'Oct 2024', aum: 238000, liquidity: 17000 },
            { period: 'Nov 2024', aum: 241000, liquidity: 17200 },
            { period: 'Dec 2024', aum: 244000, liquidity: 17500 },
            // ── 2025 (Jan–Jul) ── (Emma born Apr; mat. leave reduces liquidity)
            { period: 'Jan 2025', aum: 246000, liquidity: 17700 },
            { period: 'Feb 2025', aum: 248000, liquidity: 17900 },
            { period: 'Mar 2025', aum: 250000, liquidity: 18200 },
            { period: 'Apr 2025', aum: 251000, liquidity: 19000 },
            { period: 'May 2025', aum: 252000, liquidity: 20000 },
            { period: 'Jun 2025', aum: 253000, liquidity: 20500 },
            { period: 'Jul 2025', aum: 254000, liquidity: 20000 },
            // ── existing Aug 2025 → Dec 2026 ─────────────────────────
            { period: 'Aug 2025', aum: 256000, liquidity: 19500 },
            { period: 'Sep 2025', aum: 259000, liquidity: 19000 },
            { period: 'Oct 2025', aum: 255000, liquidity: 18200 },
            { period: 'Nov 2025', aum: 261000, liquidity: 17800 },
            { period: 'Dec 2025', aum: 268000, liquidity: 17200 },
            { period: 'Jan 2026', aum: 269000, liquidity: 16800 },
            { period: 'Feb 2026', aum: 271000, liquidity: 16400 },
            { period: 'Mar 2026', aum: 273000, liquidity: 16300 },
            { period: 'Apr 2026', aum: 275000, liquidity: 16100 },
            { period: 'May 2026', aum: 277000, liquidity: 15700 },
            { period: 'Jun 2026', aum: 279000, liquidity: 16000 },
            { period: 'Jul 2026', aum: 280000, liquidity: 16000, isToday: true  },
            { period: 'Aug 2026', aum: 283000, liquidity: 17200, isPredicted: true },
            { period: 'Sep 2026', aum: 285000, liquidity: 17800, isPredicted: true },
            { period: 'Oct 2026', aum: 287000, liquidity: 18500, isPredicted: true },
            { period: 'Nov 2026', aum: 290000, liquidity: 19200, isPredicted: true },
            { period: 'Dec 2026', aum: 294000, liquidity: 20000, isPredicted: true },
            { period: 'Jan 2027', aum: 297000, liquidity: 20800, isPredicted: true },
            { period: 'Feb 2027', aum: 300000, liquidity: 21500, isPredicted: true },
        ],
        activities: [
            { id: 'act1', type: 'call',  iconName: 'standard:log_a_call', subject: 'Mid-year review (David)',          time: 'Today',    description: "Annual mid-year review with David Bennett. Grace unavailable — has not attended in ~18 months." },
            { id: 'act2', type: 'task',  iconName: 'standard:task',       subject: 'Model college plan for Maya',        time: 'Due soon', description: "Maya starts college fall 2027. First tuition bill Aug 2027. No college savings plan on record." },
            { id: 'act3', type: 'task',  iconName: 'standard:task',       subject: "Eldercare cost planning",            time: 'Pending',  description: "Eleanor moved in spring 2026. Eldercare costs not yet factored into household plan." },
            { id: 'act4', type: 'event', iconName: 'standard:event',      subject: "Schedule joint review with Grace",   time: 'Jul 2026', description: "Plan a review that includes Grace to address the 18-month engagement gap." },
        ],
        relMapMembers: [
            {
                id: 'rm1',
                name: 'David Bennett',
                role: 'Primary Member',
                isPrimary: true,
                initials: 'DB',
                avatarStyle: 'background:#1589ee;color:#ffffff;',
                profession: 'VP, Strategic Accounts',
                age: '46',
                relationshipStrength: 'High',
                lastInteraction: 'Jul 7, 2026',
            },
            {
                id: 'rm2',
                name: 'Grace Bennett',
                role: 'Spouse / Co-client',
                isPrimary: false,
                initials: 'GB',
                avatarStyle: 'background:#206476;color:#ffffff;',
                profession: 'Interior Designer',
                age: '45',
                relationshipStrength: 'Low',
                lastInteraction: 'Jan 2025',
            },
            {
                id: 'rm3',
                name: 'Maya Bennett',
                role: 'Daughter (dependent)',
                isPrimary: false,
                initials: 'MB',
                avatarStyle: 'background:#9a6a2e;color:#ffffff;',
                profession: 'High School Student',
                age: '17',
                relationshipStrength: 'N/A',
                lastInteraction: 'N/A',
            },
            {
                id: 'rm4',
                name: 'Joshua Bennett',
                role: 'Son (dependent)',
                isPrimary: false,
                initials: 'JB',
                avatarStyle: 'background:#2e6a4e;color:#ffffff;',
                profession: 'Middle School Student',
                age: '14',
                relationshipStrength: 'N/A',
                lastInteraction: 'N/A',
            },
            {
                id: 'rm5',
                name: 'Eleanor Bennett',
                role: "David's Mother",
                isPrimary: false,
                initials: 'EB',
                avatarStyle: 'background:#6a2e6a;color:#ffffff;',
                profession: 'Retired',
                age: '74',
                relationshipStrength: 'N/A',
                lastInteraction: 'Spring 2026 (moved in)',
            },
        ],
        relMapRecommendations: [
            {
                category: 'Members',
                items: [
                    {
                        id: 'rr1',
                        name: 'Eleanor Bennett',
                        relationship: "David's Mother",
                        icon: 'standard:contact',
                        sourceLabel: 'Existing Record Found',
                        sourceType: 'existing',
                        confidence: 'High Confidence',
                        confidenceType: 'high',
                        reason: "Listed as household dependent following move-in spring 2026. Eldercare costs flagged in planning notes.",
                        duplicates: [
                            { name: 'Eleanor Bennett', company: 'Chicago Senior Living', title: "David's Mother", email: 'eleanor.bennett@email.com' },
                        ],
                    },
                    {
                        id: 'rr2',
                        name: 'Joshua Bennett',
                        relationship: 'Son',
                        icon: 'standard:contact',
                        sourceLabel: 'New Record',
                        sourceType: 'new',
                        confidence: 'Medium Confidence',
                        confidenceType: 'medium',
                        reason: "Referenced as household dependent — college projected ~2030. Education planning not yet initiated.",
                    },
                ],
            },
            {
                category: 'Related Accounts',
                items: [
                    {
                        id: 'rr3',
                        name: 'Bennett Family Trust',
                        relationship: 'Trust',
                        icon: 'standard:account',
                        sourceLabel: '2 Records Found',
                        sourceType: 'multiple',
                        confidence: 'Low Confidence',
                        confidenceType: 'low',
                        reason: 'Identified from estate planning notes and beneficiary designations across insurance policies.',
                        duplicates: [
                            { name: 'Bennett Family Trust', company: 'Hartwell Private Banking', title: 'Revocable Living Trust', email: 'trust@hartwellpb.com' },
                            { name: 'Bennett Family Trust', company: 'Regional Financial Group', title: 'Irrevocable Trust', email: 'bft@rfgroup.com' },
                        ],
                    },
                ],
            },
            {
                category: 'Related Contacts',
                items: [
                    {
                        id: 'rr4',
                        name: 'Dr. Alan Pryce',
                        relationship: 'Financial Attorney',
                        icon: 'standard:contact',
                        sourceLabel: 'Existing Record Found',
                        sourceType: 'existing',
                        confidence: 'Medium Confidence',
                        confidenceType: 'medium',
                        reason: "Mentioned in estate planning notes as Bennett household's legal advisor for trust documentation.",
                        duplicates: [
                            { name: 'Dr. Alan Pryce', company: 'Pryce Legal Partners', title: 'Senior Partner', email: 'a.pryce@prycelegal.com' },
                            { name: 'Dr. Alan Pryce', company: 'Hartwell Private Banking', title: 'Advisor', email: 'alan.pryce@hartwellpb.com' },
                        ],
                    },
                ],
            },
        ],
        timelineMembers: [
            {
                memberId: 'm1',
                memberName: 'David Bennett',
                memberRole: 'Head · Primary Client',
                initials: 'DB',
                avatarClass: 'c-member-avatar c-member-avatar_blue',
                ageLabel: 'Age 46',
                relationshipStrength: 'Strong',
                strengthClass: 'c-strength-dot c-strength-dot_strong',
                events: [
                    { id: 'le1',     year: 2016, month: 'Apr 2016', label: 'Onboarding',        type: 'life'       },
                    { id: 'fa1',     year: 2016, month: 'Apr 2016', label: 'Joint Brokerage',   type: 'financial'  },
                    { id: 'm_on',    year: 2016, month: 'Apr 2016', label: 'Onboarding Review', type: 'engagement' },
                    { id: 'fa2',     year: 2016, month: 'May 2016', label: '529 – Maya',         type: 'financial'  },
                    { id: 'fa3',     year: 2016, month: 'Jun 2016', label: '401(k)',             type: 'financial'  },
                    { id: 'gr1',     year: 2016, month: 'May 2016', label: 'Retirement Goal',    type: 'goal',      targetYear: 2044 },
                    { id: 'gef1',    year: 2017, month: 'Jan 2017', label: 'Emergency Fund',     type: 'goal'       },
                    { id: 'op3',     year: 2017, month: 'Mar 2017', label: 'Insurance Re-rate', type: 'opportunity' },
                    { id: 'le2',     year: 2018, month: 'Jul 2018', label: 'Home Purchase',      type: 'life'       },
                    { id: 'fa6',     year: 2018, month: 'Aug 2018', label: '529 – Joshua',       type: 'financial'  },
                    { id: 'fa7',     year: 2019, month: 'Feb 2019', label: 'Checking/Savings',   type: 'financial'  },
                    { id: 'm_ar19',  year: 2019, month: 'Oct 2019', label: 'Annual Review',      type: 'engagement' },
                    { id: 'm_ar21',  year: 2021, month: 'Oct 2021', label: 'Annual Review',      type: 'engagement' },
                    { id: 'm_ar23',  year: 2023, month: 'Oct 2023', label: 'Annual Review',      type: 'engagement' },
                    { id: 'm_ar24',  year: 2024, month: 'Nov 2024', label: 'Annual Review',      type: 'engagement' },
                    { id: 'le5',     year: 2025, month: 'May 2025', label: 'VP Promotion',       type: 'life'       },
                    { id: 'm_ppr25', year: 2025, month: 'May 2025', label: 'Post-Promo Review',  type: 'engagement' },
                    { id: 'c1',      year: 2025, month: 'Aug 2025', label: 'Call: Promo F/U',     type: 'call'       },
                    { id: 'm_ar25',  year: 2025, month: 'Nov 2025', label: 'Annual Review',      type: 'engagement' },
                    { id: 'c2',      year: 2026, month: 'Jan 2026', label: 'Call: New-Year',      type: 'call'       },
                    { id: 'c3',      year: 2026, month: 'Mar 2026', label: 'KYC Refresh',         type: 'call'       },
                    { id: 'op2',     year: 2026, month: 'Aug 2026', label: 'Eleanor Caregiving Plan',     type: 'opportunity'},
                    { id: 'c4',      year: 2026, month: 'Jun 2026', label: 'Call: Eleanor',       type: 'call'       },
                ],
            },
            {
                memberId: 'm2',
                memberName: 'Grace Bennett',
                memberRole: 'Spouse · Joint Client',
                initials: 'GB',
                avatarClass: 'c-member-avatar c-member-avatar_teal',
                ageLabel: 'Age 45',
                relationshipStrength: 'Low',
                strengthClass: 'c-strength-dot c-strength-dot_low',
                engagementGapStart: 2024,
                engagementGapStartMonth: 'Nov 2023',
                engagementGapLabel: '~18-month engagement gap — Grace last attended Oct 2023',
                events: [
                    { id: 'le1',    year: 2016, month: 'Apr 2016', label: 'Onboarding',       type: 'life'       },
                    { id: 'fa1',    year: 2016, month: 'Apr 2016', label: 'Joint Brokerage',  type: 'financial'  },
                    { id: 'fa4',    year: 2016, month: 'Jun 2016', label: '403(b)',            type: 'financial'  },
                    { id: 'm_on',   year: 2016, month: 'Apr 2016', label: 'Onboarding Review',type: 'engagement' },
                    { id: 'gr1',    year: 2016, month: 'May 2016', label: 'Retirement Goal',   type: 'goal',     targetYear: 2044 },
                    { id: 'gef1',   year: 2017, month: 'Jan 2017', label: 'Emergency Fund',    type: 'goal'      },
                    { id: 'le2',    year: 2018, month: 'Jul 2018', label: 'Home Purchase',     type: 'life'      },
                    { id: 'fa7',    year: 2019, month: 'Feb 2019', label: 'Checking/Savings',  type: 'financial' },
                    { id: 'm_ar19', year: 2019, month: 'Oct 2019', label: 'Annual Review',     type: 'engagement'},
                    { id: 'm_ar21', year: 2021, month: 'Oct 2021', label: 'Annual Review',     type: 'engagement'},
                    { id: 'm_ar23', year: 2023, month: 'Oct 2023', label: 'Annual Review ←',   type: 'engagement'},
                ],
            },
            {
                memberId: 'm3',
                memberName: 'Maya Bennett',
                memberRole: 'Daughter · Dependent',
                initials: 'MB',
                avatarClass: 'c-member-avatar c-member-avatar_orange',
                ageLabel: 'Age 17',
                relationshipStrength: 'N/A',
                strengthClass: 'c-strength-dot c-strength-dot_na',
                events: [
                    { id: 'le1',  year: 2016, month: 'Apr 2016', label: 'Onboarding',         type: 'life' },
                    { id: 'm_on', year: 2016, month: 'Apr 2016', label: 'Onboarding',         type: 'meeting' },
                    { id: 'op1',  year: 2016, month: 'May 2016', label: 'College 529',         type: 'opportunity', targetYear: 2027 },
                    { id: 'fa2',  year: 2016, month: 'May 2016', label: '529 – Maya',           type: 'financial' },
                    { id: 'gef1', year: 2017, month: 'Jan 2017', label: 'Emergency Fund',      type: 'goal' },
                    { id: 'le4',  year: 2022, month: 'Sep 2022', label: 'Started High School', type: 'life' },
                ],
            },
            {
                memberId: 'm4',
                memberName: 'Joshua Bennett',
                memberRole: 'Son · Dependent',
                initials: 'JB',
                avatarClass: 'c-member-avatar c-member-avatar_green',
                ageLabel: 'Age 14',
                relationshipStrength: 'N/A',
                strengthClass: 'c-strength-dot c-strength-dot_na',
                events: [
                    { id: 'le1',  year: 2016, month: 'Apr 2016', label: 'Onboarding',      type: 'life' },
                    { id: 'm_on', year: 2016, month: 'Apr 2016', label: 'Onboarding',      type: 'meeting' },
                    { id: 'gef1', year: 2017, month: 'Jan 2017', label: 'Emergency Fund',   type: 'goal' },
                    { id: 'gj1',  year: 2018, month: 'Aug 2018', label: 'College 529',      type: 'goal', targetYear: 2030 },
                    { id: 'fa6',  year: 2018, month: 'Aug 2018', label: '529 – Joshua',     type: 'financial' },
                ],
            },
            {
                memberId: 'm5',
                memberName: 'Eleanor Bennett',
                memberRole: "David's Mother",
                initials: 'EB',
                avatarClass: 'c-member-avatar c-member-avatar_purple',
                ageLabel: 'Age 74',
                relationshipStrength: 'N/A',
                strengthClass: 'c-strength-dot c-strength-dot_na',
                events: [
                    { id: 'le1',  year: 2016, month: 'Apr 2016', label: 'Onboarding',      type: 'life' },
                    { id: 'gef1', year: 2017, month: 'Jan 2017', label: 'Emergency Fund',   type: 'goal' },
                    { id: 'le6',  year: 2026, month: 'Apr 2026', label: 'Moved In',         type: 'life' },
                    { id: 'op2',  year: 2026, month: 'Aug 2026', label: 'Eleanor Caregiving Plan',   type: 'opportunity' },
                ],
            },
        ],
        monthlyTimelineMembers: [
            {
                memberId: 'm1',
                memberName: 'David Bennett',
                memberRole: 'Head · Primary Client',
                initials: 'DB',
                avatarClass: 'c-member-avatar c-member-avatar_blue',
                ageLabel: 'Age 46',
                relationshipStrength: 'Strong',
                strengthClass: 'c-strength-dot c-strength-dot_strong',
                events: [
                    { id: 'le1',     month: 'Apr 2016', label: 'Onboarding',        type: 'life'       },
                    { id: 'fa1',     month: 'Apr 2016', label: 'Joint Brokerage',   type: 'financial'  },
                    { id: 'm_on',    month: 'Apr 2016', label: 'Onboarding Review', type: 'engagement' },
                    { id: 'fa2',     month: 'May 2016', label: '529 – Maya',         type: 'financial'  },
                    { id: 'fa3',     month: 'Jun 2016', label: '401(k)',             type: 'financial'  },
                    { id: 'gr1',     month: 'May 2016', label: 'Retirement Goal',    type: 'goal',     targetYear: 2044 },
                    { id: 'gef1',    month: 'Jan 2017', label: 'Emergency Fund',     type: 'goal'       },
                    { id: 'op3',     month: 'Mar 2017', label: 'Insurance Re-rate', type: 'opportunity' },
                    { id: 'le2',     month: 'Jul 2018', label: 'Home Purchase',      type: 'life'       },
                    { id: 'fa6',     month: 'Aug 2018', label: '529 – Joshua',       type: 'financial'  },
                    { id: 'fa7',     month: 'Feb 2019', label: 'Checking/Savings',   type: 'financial'  },
                    { id: 'm_ar19',  month: 'Oct 2019', label: 'Annual Review',      type: 'engagement' },
                    { id: 'm_ar21',  month: 'Oct 2021', label: 'Annual Review',      type: 'engagement' },
                    { id: 'm_ar23',  month: 'Oct 2023', label: 'Annual Review',      type: 'engagement' },
                    { id: 'm_ar24',  month: 'Nov 2024', label: 'Annual Review',      type: 'engagement' },
                    { id: 'le5',     month: 'May 2025', label: 'VP Promotion',       type: 'life'       },
                    { id: 'm_ppr25', month: 'May 2025', label: 'Post-Promo Review',  type: 'engagement' },
                    { id: 'c1',      month: 'Aug 2025', label: 'Call: Promo F/U',     type: 'call'       },
                    { id: 'm_ar25',  month: 'Nov 2025', label: 'Annual Review',      type: 'engagement' },
                    { id: 'c2',      month: 'Jan 2026', label: 'Call: New-Year',      type: 'call'       },
                    { id: 'c3',      month: 'Mar 2026', label: 'KYC Refresh',         type: 'call'       },
                    { id: 'c4',      month: 'Jun 2026', label: 'Call: Eleanor',       type: 'call'       },
                    { id: 'op2',     month: 'Aug 2026', label: 'Eleanor Caregiving Plan',     type: 'opportunity'},
                ],
            },
            {
                memberId: 'm2',
                memberName: 'Grace Bennett',
                memberRole: 'Spouse · Joint Client',
                initials: 'GB',
                avatarClass: 'c-member-avatar c-member-avatar_teal',
                ageLabel: 'Age 45',
                relationshipStrength: 'Low',
                strengthClass: 'c-strength-dot c-strength-dot_low',
                engagementGapStart: 2024,
                engagementGapStartMonth: 'Nov 2023',
                engagementGapLabel: '~18-month engagement gap — Grace last attended Oct 2023',
                events: [
                    { id: 'le1',    month: 'Apr 2016', label: 'Onboarding',       type: 'life'       },
                    { id: 'fa1',    month: 'Apr 2016', label: 'Joint Brokerage',  type: 'financial'  },
                    { id: 'fa4',    month: 'Jun 2016', label: '403(b)',            type: 'financial'  },
                    { id: 'm_on',   month: 'Apr 2016', label: 'Onboarding Review',type: 'engagement' },
                    { id: 'gr1',    month: 'May 2016', label: 'Retirement Goal',   type: 'goal',     targetYear: 2044 },
                    { id: 'gef1',   month: 'Jan 2017', label: 'Emergency Fund',    type: 'goal'       },
                    { id: 'le2',    month: 'Jul 2018', label: 'Home Purchase',     type: 'life'       },
                    { id: 'fa7',    month: 'Feb 2019', label: 'Checking/Savings',  type: 'financial'  },
                    { id: 'm_ar19', month: 'Oct 2019', label: 'Annual Review',     type: 'engagement' },
                    { id: 'm_ar21', month: 'Oct 2021', label: 'Annual Review',     type: 'engagement' },
                    { id: 'm_ar23', month: 'Oct 2023', label: 'Annual Review ←',   type: 'engagement' },
                ],
            },
            {
                memberId: 'm3',
                memberName: 'Maya Bennett',
                memberRole: 'Daughter · Dependent',
                initials: 'MB',
                avatarClass: 'c-member-avatar c-member-avatar_orange',
                ageLabel: 'Age 17',
                relationshipStrength: 'N/A',
                strengthClass: 'c-strength-dot c-strength-dot_na',
                events: [
                    { id: 'le1',  month: 'Apr 2016', label: 'Onboarding',         type: 'life' },
                    { id: 'm_on', month: 'Apr 2016', label: 'Onboarding',         type: 'meeting' },
                    { id: 'op1',  month: 'May 2016', label: 'College 529',         type: 'opportunity', targetYear: 2027 },
                    { id: 'fa2',  month: 'May 2016', label: '529 – Maya',           type: 'financial' },
                    { id: 'gef1', month: 'Jan 2017', label: 'Emergency Fund',      type: 'goal' },
                    { id: 'le4',  month: 'Sep 2022', label: 'Started High School', type: 'life' },
                ],
            },
            {
                memberId: 'm4',
                memberName: 'Joshua Bennett',
                memberRole: 'Son · Dependent',
                initials: 'JB',
                avatarClass: 'c-member-avatar c-member-avatar_green',
                ageLabel: 'Age 14',
                relationshipStrength: 'N/A',
                strengthClass: 'c-strength-dot c-strength-dot_na',
                events: [
                    { id: 'le1',  month: 'Apr 2016', label: 'Onboarding',      type: 'life' },
                    { id: 'm_on', month: 'Apr 2016', label: 'Onboarding',      type: 'meeting' },
                    { id: 'gef1', month: 'Jan 2017', label: 'Emergency Fund',   type: 'goal' },
                    { id: 'gj1',  month: 'Aug 2018', label: 'College 529',      type: 'goal', targetYear: 2030 },
                    { id: 'fa6',  month: 'Aug 2018', label: '529 – Joshua',     type: 'financial' },
                ],
            },
            {
                memberId: 'm5',
                memberName: 'Eleanor Bennett',
                memberRole: "David's Mother",
                initials: 'EB',
                avatarClass: 'c-member-avatar c-member-avatar_purple',
                ageLabel: 'Age 74',
                relationshipStrength: 'N/A',
                strengthClass: 'c-strength-dot c-strength-dot_na',
                events: [
                    { id: 'le1',  month: 'Apr 2016', label: 'Onboarding',         type: 'life' },
                    { id: 'gef1', month: 'Jan 2017', label: 'Emergency Fund',    type: 'goal' },
                    { id: 'le6',  month: 'Apr 2026', label: 'Moved In',          type: 'life' },
                    { id: 'op2',  month: 'Aug 2026', label: 'Eleanor Caregiving Plan',    type: 'opportunity' },
                ],
            },
        ],
    },
};

/** Default enrichment for accounts without specific data */
function defaultEnrichment(account) {
    const members = (account.members || '').split(',').map((m) => m.trim());
    return {
        accountId: `HH-${account.id.toUpperCase()}`,
        segment: account.rating === 'Hot' ? 'High Net Worth' : account.rating === 'Warm' ? 'Standard' : 'Basic',
        totalAUM: account.annualRevenue || 0,
        liabilities: Math.round((account.annualRevenue || 0) * 0.08),
        risk: account.rating === 'Hot' ? 'High' : account.rating === 'Warm' ? 'Medium' : 'Low',
        clientSince: 'Jan 2022',
        openAccounts: account.memberCount || 1,
        taxExposure: '$10K Capital Gains',
        primaryMember: members[0] || account.owner,
        agenticSummary: `${members[0] || 'Primary member'} is the head of a ${account.memberCount}-member household based in ${account.billingCity}, ${account.billingState}. This household has been actively engaged with the firm and has a total giving history of ${account.totalGiving ? '$' + account.totalGiving.toLocaleString() : 'N/A'}.`,
        agenticImpact: "A review of coverage and investment allocations is recommended to ensure the household's financial plan remains aligned with current goals and life stage.",
        nextBestActions: [
            'Schedule annual household review',
            'Review beneficiary designations',
            'Assess insurance coverage levels',
        ],
        highlights: [
            {
                id: 'h1',
                badgeLabel: 'Alert',
                badgeClass: 'c-badge c-badge_alert',
                title: 'Annual review is due',
                description: 'This household is due for its annual financial plan review. Schedule a meeting with the primary member.',
                actionLabel: 'Update Goal',
            },
            {
                id: 'h2',
                badgeLabel: 'Gap',
                badgeClass: 'c-badge c-badge_gap',
                title: 'No estate plan on file',
                description: 'No will, trust, or POA documentation has been recorded for this household.',
                actionLabel: null,
            },
        ],
        activities: [
            { id: 'act1', type: 'call',  iconName: 'standard:log_a_call', subject: 'Follow-up call',     time: '2 days ago',  description: 'Discussed upcoming giving campaign and plans.' },
            { id: 'act2', type: 'email', iconName: 'standard:email',      subject: 'Welcome email sent', time: '1 week ago',  description: 'Sent household welcome package and overview.' },
            { id: 'act3', type: 'event', iconName: 'standard:event',      subject: 'Annual review',      time: '3 weeks ago', description: 'Reviewed household giving history and goals.' },
        ],
        timelineMembers: members.map((name, i) => ({
            memberId: `m${i}`,
            memberName: name,
            memberRole: i === 0 ? 'Head of Household' : 'Member',
            events: [],
        })),
    };
}

const TIMELINE_YEARS  = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028];

// Generate Jan 2019 → Dec 2026 (96 months) — full engagement history
const _MO_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function _buildMonthRange(startY, startM, endY, endM) {
    const out = [];
    let y = startY, m = startM;
    while (y < endY || (y === endY && m <= endM)) {
        out.push(`${_MO_NAMES[m - 1]} ${y}`);
        if (++m > 12) { m = 1; y++; }
    }
    return out;
}
const TIMELINE_MONTHS   = _buildMonthRange(2016, 4, 2027, 2); // Apr 2016 → Feb 2027
const CURRENT_MONTH     = 'Jul 2026'; // today's month for isToday marker
const CURRENT_MONTH_IDX = TIMELINE_MONTHS.indexOf(CURRENT_MONTH);

/*
 * Market / Car-Fund metric — represents the investment account the Bennett
 * household earmarked for their $45 000 car purchase in 2027.
 * Sparse key milestones are interpolated across all 96 months.
 */
const _CAR_GOAL = 45000;
const _MARKET_MILESTONES = [
    { period: 'Jan 2019', value: 12000 },
    { period: 'Feb 2020', value: 16800 }, // pre-COVID peak
    { period: 'Apr 2020', value:  9400 }, // COVID low
    { period: 'Dec 2020', value: 14200 }, // recovery
    { period: 'Dec 2021', value: 25500 }, // bull-market high
    { period: 'Oct 2022', value: 16800 }, // bear-market low
    { period: 'Dec 2023', value: 33000 }, // bull recovery
    { period: 'Mar 2025', value: 44200 }, // closest to goal
    { period: 'Nov 2025', value: 37500 }, // dip accelerates
    { period: 'Mar 2026', value: 33000 }, // dip trough
    { period: 'Jul 2026', value: 35500 }, // current (slight rebound)
    { period: 'Dec 2026', value: 37000 }, // projected — still below goal
    { period: 'Feb 2027', value: 38500 }, // projected — continuing recovery
];

function _buildMarketMonthly() {
    const ms = _MARKET_MILESTONES;
    const msIdx = ms.map(m => TIMELINE_MONTHS.indexOf(m.period));
    return TIMELINE_MONTHS.map((period, idx) => {
        // Find surrounding milestones for linear interpolation
        let lo = 0, hi = ms.length - 1;
        for (let i = 0; i < ms.length - 1; i++) {
            if (msIdx[i] <= idx && msIdx[i + 1] >= idx) { lo = i; hi = i + 1; break; }
        }
        const span = msIdx[hi] - msIdx[lo] || 1;
        const t    = (idx - msIdx[lo]) / span;
        const value = Math.round(ms[lo].value + (ms[hi].value - ms[lo].value) * t);
        return { period, value, isToday: period === CURRENT_MONTH, isProjected: idx > CURRENT_MONTH_IDX };
    });
}
const _MARKET_MONTHLY = _buildMarketMonthly();

export default class AccountDetail extends LightningElement {
    account      = null;
    isFollowing  = false;
    _enrichment  = null;
    timelineMode = 'monthly'; // 'yearly' | 'monthly' — default to monthly, current year in focus

    connectedCallback() {
        const route = getCurrentRoute();
        const id = route?.params?.id;
        if (id) {
            this.account = getAccountById(id);
            this._enrichment = ENRICHMENT[id] || defaultEnrichment(this.account || {});
        }
        // Listen for version change broadcast from the global header
        this._onVersionChange = (e) => { this._chronicleVersion = e.detail?.version || 'v1'; };
        window.addEventListener('chronicleversionchange', this._onVersionChange);
    }

    disconnectedCallback() {
        window.removeEventListener('chronicleversionchange', this._onVersionChange);
    }

    get hasAccount() { return this.account !== null; }
    get accountName() { return this.account?.name || 'Unknown Account'; }

    get headerFields() {
        if (!this.account || !this._enrichment) return [];
        return [
            { label: 'Owner',        value: this.account.owner },
            { label: 'Segment',      value: this._enrichment.segment },
            { label: 'Total AUM',    value: this._fmt(this._enrichment.totalAUM) },
            { label: 'Primary Member', value: this._enrichment.primaryMember },
        ];
    }

    get headerSubtitle() {
        if (!this.account || !this._enrichment) return '';
        const { memberCount } = this.account;
        const { segment, clientSince } = this._enrichment;
        return [
            memberCount ? `${memberCount} Member${memberCount !== 1 ? 's' : ''}` : null,
            segment    ? `${segment} Client`                                       : null,
            clientSince                                                            || null,
        ].filter(Boolean).join(' · ');
    }

    get summaryItems() {
        if (!this.account || !this._enrichment) return [];
        const e = this._enrichment;
        const a = this.account;
        return [
            { key: 'id',       iconName: 'utility:record',      label: 'Account ID',      value: e.accountId,              valueClass: '' },
            { key: 'seg',      iconName: 'utility:graph',        label: 'Segment',         value: e.segment,                valueClass: '' },
            { key: 'primary',  iconName: 'utility:people',       label: 'Primary Member',  value: e.primaryMember,          valueClass: 'slds-text-link' },
            { key: 'members',  iconName: 'utility:groups',       label: 'Total Members',   value: String(a.memberCount),     valueClass: '' },
            { key: 'address',  iconName: 'utility:location',     label: 'Address',         value: `${a.billingStreet}, ${a.billingCity}`, valueClass: '' },
            { key: 'aum',      iconName: 'utility:money',        label: 'Total AUM',       value: this._fmt(e.totalAUM),     valueClass: '' },
            { key: 'liab',     iconName: 'utility:arrowdown',    label: 'Liabilities',     value: this._fmt(e.liabilities),  valueClass: '' },
            { key: 'risk',     iconName: 'utility:warning',      label: 'Risk',            value: e.risk,                   valueClass: this._riskClass(e.risk) },
        ];
    }

    get clientSnapshot() {
        if (!this.account || !this._enrichment) return null;
        const e = this._enrichment;
        const a = this.account;
        return {
            primaryMember:       e.primaryMember || '—',
            email:               e.primaryMemberEmail || '—',
            phone:               a.phone || '—',
            aum:                 this._fmt(e.totalAUM),
            lastInteractionDate: this._formatDate(a.lastActivityDate),
        };
    }

    get hasClientSnapshot() { return this.clientSnapshot !== null; }

    get clientSummary() { return this._enrichment?.clientSummary || null; }
    get hasClientSummary() { return this.clientSummary !== null; }

    isKeyDataExpanded = true;
    isSourcesExpanded = true;

    get keyDataChevron()  { return this.isKeyDataExpanded  ? 'utility:chevrondown' : 'utility:chevronright'; }
    get sourcesChevron()  { return this.isSourcesExpanded  ? 'utility:chevrondown' : 'utility:chevronright'; }

    handleKeyDataToggle() { this.isKeyDataExpanded = !this.isKeyDataExpanded; }
    handleSourcesToggle() { this.isSourcesExpanded = !this.isSourcesExpanded; }

    get activityItems()         { return this._enrichment?.activities          || []; }
    get relMapMembers()         { return this._enrichment?.relMapMembers        || []; }
    get relMapRecommendations() { return this._enrichment?.relMapRecommendations || []; }
    get highlights()            { return this._enrichment?.highlights            || []; }
    // Subset shown in the Alerts & Insights sidebar — excludes items flagged hideFromAlerts
    get alertsInsights()        { return this.highlights.filter(h => !h.hideFromAlerts); }
    get meetings()              { return this._enrichment?.meetings               || []; }

    get agenticMetrics() {
        if (!this._enrichment) return [];
        const e = this._enrichment;
        return [
            { key: 'aum',     label: 'AUM',           value: this._fmtShort(e.totalAUM) },
            { key: 'since',   label: 'Client Since',  value: e.clientSince },
            { key: 'accts',   label: 'Open Accounts', value: String(e.openAccounts) },
            { key: 'tax',     label: 'Tax Exposure',  value: e.taxExposure },
        ];
    }

    // ── Agentic Summary filter ────────────────────────────────────
    @track _agenticFilter = 'last12';  // 'last12' | 'allTime'

    get agenticFilterLast12Class() {
        return this._agenticFilter === 'last12'
            ? 'c-as-filter__btn c-as-filter__btn_active'
            : 'c-as-filter__btn';
    }
    get agenticFilterAllTimeClass() {
        return this._agenticFilter === 'allTime'
            ? 'c-as-filter__btn c-as-filter__btn_active'
            : 'c-as-filter__btn';
    }

    handleAgenticFilter(event) {
        this._agenticFilter = event.currentTarget.dataset.filter;
    }

    get agenticSummaryText() {
        const e = this._enrichment;
        if (!e) return '';
        return this._agenticFilter === 'allTime'
            ? (e.agenticSummaryAllTime || e.agenticSummary || '')
            : (e.agenticSummary || '');
    }

    get agenticSummarySegments() {
        return [
            { id: 's1',  text: "Across the past 12 months the Bennett household\u2019s journey has been defined by ", bold: false },
            { id: 's2',  text: "two key shifts \u2013 Eleanor\u2019s move-in (spring 2026) and Maya\u2019s approaching college start (fall 2027)", bold: true  },
            { id: 's3',  text: " \u2013 and the planning gaps they expose. Engagement has stayed ", bold: false },
            { id: 's4',  text: "David-only",                                                                        bold: true  },
            { id: 's5',  text: " through every touchpoint, and the plan hasn\u2019t caught up \u2013 ",            bold: false },
            { id: 's6',  text: "no college funding modeled, eldercare costs unplanned.",                           bold: true  },
            { id: 's7',  text: " The trajectory is a household facing multi-generational demands, with ",           bold: false },
            { id: 's8',  text: "college funding for Maya and re-engaging Grace in the relationship",               bold: true  },
            { id: 's9',  text: " both urgent priorities.",                                                         bold: false },
        ].map(s => ({ ...s, spanClass: s.bold ? 'c-tl-insight-bold' : '' }));
    }
    get agenticImpactText() {
        const e = this._enrichment;
        if (!e) return '';
        return this._agenticFilter === 'allTime'
            ? (e.agenticImpactAllTime || e.agenticImpact || '')
            : (e.agenticImpact || '');
    }
    get nextBestActions()    { return this._enrichment?.nextBestActions || []; }

    // isYearlyMode is false when drilled into a specific year
    get isYearlyMode()  { return this.timelineMode === 'yearly' && !this.isDrillMode; }
    get isMonthlyMode() { return this.timelineMode === 'monthly'; }

    // Toggle buttons: yearly is "active" when timelineMode is yearly (incl. drill)
    get yearlyBtnClass()   { return this.timelineMode === 'yearly'  ? 'c-tl-toggle__btn c-tl-toggle__btn_active' : 'c-tl-toggle__btn'; }
    get monthlyBtnClass()  { return this.isMonthlyMode ? 'c-tl-toggle__btn c-tl-toggle__btn_active' : 'c-tl-toggle__btn'; }
    get timelineTableClass() {
        let cls = 'c-timeline-table';
        // Drill mode reuses the monthly grid (full 96-month width) so the user can
        // scroll across year boundaries. The _drill class is no longer applied.
        if (this.isDrillMode || this.isMonthlyMode) cls += ' c-timeline-table_monthly';
        else                                        cls += ' c-timeline-table_yearly';
        if (this._drillAnimPhase === 'leaving')  cls += ' c-tl-anim-leaving';
        if (this._drillAnimPhase === 'entering') cls += ' c-tl-anim-entering';
        return cls;
    }

    // Drives the CSS grid column template dynamically so no hardcoded repeat count is needed.
    get timelineGridStyle() {
        const cols = this.timelineColumns;
        const count = cols ? cols.length : 0;
        const memberWidth = this.isYearlyMode ? '11rem' : '10rem';
        return `--tl-col-count:${count};grid-template-columns:${memberWidth} repeat(${count},8.5rem);`;
    }

    get timelineColumns() {
        const CURRENT_YEAR    = 2026;
        const CURR_MO_IDX     = 6;  // Jul = index 6 (0-based)
        const DRILL_MONTHS    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        /* ── Drill year: full monthly range so the user can scroll across year
         * boundaries. Same columns as the monthly view; the header shows the
         * selected year label + back button (handled in the template). ── */
        if (this.isDrillMode) {
            // Fall through to the TIMELINE_MONTHS branch below
        }

        if (this.isYearlyMode && !this.isDrillMode) {
            return TIMELINE_YEARS.map((yr) => {
                const isToday     = yr === CURRENT_YEAR;
                const isPredicted = yr > CURRENT_YEAR;
                // Mark the year being drilled into so CSS can "stretch" it during leaving
                const isExpanding = this._expandingYear === yr && this._drillAnimPhase === 'leaving';
                return {
                    key: yr,
                    label: isToday ? `• ${yr}` : String(yr),
                    yearLabelClass: isToday
                        ? 'c-timeline-year-label c-timeline-year-label_today'
                        : 'c-timeline-year-label',
                    isToday,
                    isPredicted,
                    showTodayPill: isToday, // show "Today" pill on the current year column
                    headerCellClass: 'c-timeline-year-col c-timeline-header__cell'
                        + (isToday     ? ' c-timeline-header__cell_today_yr'  : '')
                        + (isPredicted ? ' c-timeline-header__cell_predicted' : '')
                        + (isExpanding ? ' c-tl-expanding-year'               : ''),
                };
            });
        }
        const Q_MAP = { Jan: 'Q1', Apr: 'Q2', Jul: 'Q3', Oct: 'Q4' };
        return TIMELINE_MONTHS.map((m, idx) => {
            const isToday        = m === CURRENT_MONTH;
            const isPredicted    = idx > CURRENT_MONTH_IDX;
            const month          = m.split(' ')[0];
            const year           = m.split(' ')[1]; // e.g. '2020'
            const isYearStart    = month === 'Jan';
            const quarterLabel   = Q_MAP[month] || null;
            const isQuarterStart = !!quarterLabel; // true for Jan, Apr, Jul, Oct
            return {
                key: m,
                label: m.slice(0, 3),
                year,
                isYearStart,
                isQuarterStart,
                quarterLabel,
                yearLabelClass: 'c-timeline-year-label',
                isToday,
                isPredicted,
                showTodayPill: isToday,
                headerCellClass: 'c-timeline-year-col c-timeline-header__cell'
                    + (isYearStart                       ? ' c-timeline-header__cell_year-start' : '')
                    + (isQuarterStart && !isYearStart    ? ' c-timeline-header__cell_q-start'    : '')
                    + (isToday                           ? ' c-timeline-header__cell_today'      : '')
                    + (isPredicted                       ? ' c-timeline-header__cell_predicted'  : ''),
            };
        });
    }

    get timelineYears() { return this.timelineColumns; }

    get timelineRows() {
        const cols = this.timelineColumns;
        const PILL = {
            life:        'c-event-pill c-event-pill_life',
            engagement:  'c-event-pill c-event-pill_engagement',
            meeting:     'c-event-pill c-event-pill_meeting',
            transaction: 'c-event-pill c-event-pill_transaction',
            goal:        'c-event-pill c-event-pill_goal',
            financial:   'c-event-pill c-event-pill_financial',
            call:        'c-event-pill c-event-pill_call',
            opportunity: 'c-event-pill c-event-pill_opportunity',
        };
        // Maps member name fragments → avatar background color
        const MEMBER_AVATAR_COLOR = {
            'David':  '#1589ee',
            'Grace':  '#0e9372',
            'Maya':  '#8B6914',
        };
        const _sharedInitials = (sharedWith) => {
            if (!sharedWith) return [];
            return sharedWith.split(' · ').map((name, i) => {
                const parts = name.trim().split(' ');
                const initials = parts.length >= 2
                    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                    : parts[0].slice(0, 2).toUpperCase();
                const colorKey = Object.keys(MEMBER_AVATAR_COLOR).find(k => name.includes(k));
                const bg = colorKey ? MEMBER_AVATAR_COLOR[colorKey] : '#706e6b';
                return { key: name + i, initials, avatarStyle: `background:${bg};` };
            });
        };
        const TYPE_DOT = {
            life:        'c-type-dot c-type-dot_life',
            engagement:  'c-type-dot c-type-dot_engagement',
            meeting:     'c-type-dot c-type-dot_meeting',
            transaction: 'c-type-dot c-type-dot_transaction',
            goal:        'c-type-dot c-type-dot_goal',
            financial:   'c-type-dot c-type-dot_financial',
            call:        'c-type-dot c-type-dot_call',
            opportunity: 'c-type-dot c-type-dot_opportunity',
        };
        const TYPE_ICON = {
            life:        'utility:event',
            engagement:  'utility:people',
            meeting:     'utility:people',
            goal:        'utility:flag',
            financial:   'utility:company',
            transaction: 'utility:money',
            call:        'utility:call',
            opportunity: 'utility:sparkle',
        };

        const TYPE_ICON_BADGE = {
            life:      'c-pill-icon-badge c-pill-icon-badge_life',
            engagement:'c-pill-icon-badge c-pill-icon-badge_engagement',
            meeting:   'c-pill-icon-badge c-pill-icon-badge_meeting',
            goal:      'c-pill-icon-badge c-pill-icon-badge_goal',
            financial: 'c-pill-icon-badge c-pill-icon-badge_financial',
            call:      'c-pill-icon-badge c-pill-icon-badge_call',
            opportunity:'c-pill-icon-badge c-pill-icon-badge_opportunity',
        };
        /* Pending (non-dismissed, non-added) AI suggestions for sparkle indicators */
        const pendingSugs = (this._enrichment?.aiSuggestions || [])
            .filter((s) => !this._addedSuggestionIds[s.id] && !this._dismissedSuggestions[s.id]);

        /* Events created from accepted suggestions */
        const addedSugEvents = Object.values(this._addedToTimelineEvents || {});

        // Yearly uses aggregated annual events; monthly + drill use per-month events
        const members = this.isYearlyMode
            ? (this._enrichment?.timelineMembers        || [])
            : (this._enrichment?.monthlyTimelineMembers || []);
        const rows = members.map((m, idx) => {
            const cells = cols.map((col) => {
                const replaced = this._replacedPillMap || {};
                const evts = m.events
                    .filter((e) => !replaced[e.id])  // skip pills replaced by saved meetings
                    .filter((e) => this.isYearlyMode ? e.year === col.key : e.month === col.key)
                    .map((e) => {
                        const det = EVENT_DETAILS[e.id] || null;
                        const highlighted = e.id === this._highlightedPillId;
                        return {
                            ...e,
                            pillClass:       (PILL[e.type] || PILL.financial) + (highlighted ? ' c-pill_highlighted' : ''),
                            isGoal:          e.type === 'goal',
                            isFinancial:     e.type === 'financial',
                            isOpportunity:   e.type === 'opportunity',
                            quickActionLabel: highlighted ? this._highlightedActionLabel : null,
                            detail:       det,
                            isCritical:   !!(det?.isCritical),
                            isShared:       !!(det?.isShared),
                            sharedWith:     det?.sharedWith || '',
                            sharedInitials: _sharedInitials(det?.sharedWith),
                            typeDotClass: TYPE_DOT[e.type] || 'c-type-dot',
                            iconName:         TYPE_ICON[e.type] || 'utility:record',
                            iconBadgeClass:   TYPE_ICON_BADGE[e.type] || 'c-pill-icon-badge',
                        };
                    });

                /* Merge in events from accepted AI suggestions */
                const mergedSugEvts = addedSugEvents
                    .filter((ae) => ae.memberId === m.memberId &&
                        (this.isYearlyMode ? ae.yearKey === col.key : ae.monthKey === col.key))
                    .map((ae) => {
                        const s = ae._sugData || {};
                        const sugDetail = {
                            description:     s.description  || '',
                            date:            s.targetDate   || '',
                            members:         s.member       || '',
                            membersAffected: 1,
                            status:          'Predicted',
                            isShared:        false,
                            isCritical:      false,
                            cashFlowImpact:  null,
                            beneficiaries:   null,
                            actionTaken:     'Added from AI suggestion.',
                            aiInsight:       null,
                            aiActionLabel:   null,
                            // Goal-specific fields (flat + bespoke card)
                            targetAmount:    s.targetAmount || '—',
                            targetDate:      s.targetDate   || '—',
                            priority:        s.priority     || 'Medium',
                            goalType:        s.goalType     || 'Investment',
                            actualAmount:    s.actualAmount || '$0',
                            estSuccess:      s.estSuccess   || 'Predicted',
                            startDate:       s.startDate    || s.targetDate || '—',
                            pace:            s.pace         || 'Projected',
                            todayPct:        s.todayPct     || 0,
                            linkedAccount:   s.linkedAccount || null,
                            competingGoals:  s.competingGoals || [],
                        };
                        return {
                            ...ae,
                            pillClass:      (PILL[ae.type] || PILL.goal) + ' c-event-pill_suggestion',
                            isGoal:         ae.type === 'goal',
                            isFinancial:    ae.type === 'financial',
                            detail:         sugDetail,
                            isCritical:     false,
                            typeDotClass:   TYPE_DOT[ae.type]       || 'c-type-dot',
                            iconName:       TYPE_ICON[ae.type]      || 'utility:record',
                            iconBadgeClass: TYPE_ICON_BADGE[ae.type]|| 'c-pill-icon-badge',
                        };
                    });

                /* Apply timeline type filter — only to milestone track */
                const TYPE_FILTER_MAP = { life: 'life', engagement: 'engagement', goal: 'goal', financial: 'financial', opportunity: 'opportunity' };
                const filterType = TYPE_FILTER_MAP[this._activeFilter] || null;

                // Dynamic meeting replacements (from saved "Create Meeting" CTAs) — computed
                // here so it can feed both milestone (V4) and engagement (V1) tracks below.
                const dynMeetings = Object.values(replaced)
                    .filter(dyn =>
                        dyn.memberId === m.memberId &&
                        (this.isYearlyMode ? dyn.year === col.key : dyn.month === col.key)
                    )
                    .map(dyn => ({
                        ...dyn,
                        engDotClass:    'c-eng-dot c-eng-dot_meeting',
                        showAsPill:     this.isMonthlyMode || this.isDrillMode,
                        pillClass:      PILL.meeting   || 'c-event-pill',
                        typeDotClass:   TYPE_DOT.meeting  || 'c-type-dot',
                        iconName:       TYPE_ICON.meeting  || 'utility:people',
                        iconBadgeClass: TYPE_ICON_BADGE.meeting || 'c-pill-icon-badge',
                        detail: {
                            description:     dyn.description,
                            date:            dyn.month || '',
                            members:         dyn.label,
                            membersAffected: 1,
                            status:          'Scheduled',
                            isShared:        false,
                            isCritical:      false,
                            cashFlowImpact:  null,
                            aiInsight:       null,
                            aiActionLabel:   null,
                        },
                        isCritical: false,
                        isShared:   false,
                    }));

                // Milestone track: life, goal, financial, transaction (no meetings/calls)
                // V4: all event types go into the milestone track (no separate engagement lane)
                const _v4 = this.isChronicleV4;
                const milestoneEvts = [...evts, ...(_v4 ? dynMeetings : []), ...mergedSugEvts]
                    .filter(e => _v4 ? true : !['meeting', 'engagement', 'call'].includes(e.type))
                    .filter(e => !filterType || e.type === filterType);

                // Opportunity pills always render as individual pills (even in yearly mode)
                const oppEvts    = milestoneEvts.filter(e => e.type === 'opportunity')
                    .map(e => ({
                        ...e,
                        pillClass:     PILL.opportunity     || 'c-event-pill c-event-pill_type-opportunity',
                        iconName:      TYPE_ICON.opportunity,
                        iconBadgeClass: TYPE_ICON_BADGE.opportunity,
                    }));
                const nonOppEvts = milestoneEvts.filter(e => e.type !== 'opportunity');

                // Engagement track: meetings, engagements + calls
                // V4: empty — all events handled in the milestone track above
                // Yearly → colored touchpoint dots; Monthly/Drill → full pills
                const engagementEvts = _v4 ? [] : [
                    ...evts
                        .filter(e => ['meeting', 'engagement', 'call'].includes(e.type))
                        .map(e => ({
                            ...e,
                            engDotClass:  'c-eng-dot c-eng-dot_' + e.type,
                            showAsPill:   this.isMonthlyMode || this.isDrillMode,
                        })),
                    ...dynMeetings,
                ];

                // allEvts drives connectors post-process (milestones only)
                const allEvts = milestoneEvts;

                /* Sparkle indicators for pending AI suggestions in this cell */
                const sparkles = pendingSugs.filter((s) => {
                    const memberMatch  = s.member === m.memberName;
                    const periodMatch  = this.isYearlyMode
                        ? this._getYearFromDate(s.targetDate) === col.key
                        : s.targetDate === col.key;
                    return memberMatch && periodMatch;
                });

                const uniqueTypes = [...new Set(milestoneEvts.map((e) => e.type))];
                // Shared border-modifier suffix (same logic for both tracks)
                const _borderMods =
                      (col.isYearStart && !col.isToday                ? ' c-timeline-row__cell_year-start' : '')
                    + (col.isQuarterStart && !col.isYearStart && !col.isToday ? ' c-timeline-row__cell_q-start' : '')
                    + (col.isToday && this.isYearlyMode               ? ' c-timeline-row__cell_today_yr'   : '')
                    + (col.isToday && !this.isYearlyMode              ? ' c-timeline-row__cell_today'      : '')
                    + (col.isPredicted                                ? ' c-timeline-row__cell_predicted'  : '');
                return {
                    key:        `${m.memberId}-${col.key}`,
                    msKey:      `${m.memberId}-${col.key}-ms`,
                    engKey:     `${m.memberId}-${col.key}-eng`,
                    year:       col.key,
                    memberId:   m.memberId,
                    memberName: m.memberName,
                    // ── Milestone track (top sub-lane) ──
                    cellClass: 'c-timeline-year-col c-timeline-row__cell c-milestone-cell' + _borderMods,
                    events:      milestoneEvts,
                    eventCount:  milestoneEvts.length,
                    typeDots:    uniqueTypes.map((t) => ({ type: t, dotClass: TYPE_DOT[t] || 'c-type-dot' })),
                    showCount:   this.isYearlyMode && milestoneEvts.length > 0 && !this.isChronicleV4,
                    showEvents:  !this.isYearlyMode,
                    showAdd:     milestoneEvts.length === 0 && col.isPredicted && sparkles.length === 0 && !this.isYearlyMode,
                    opportunityEvts:      oppEvts,
                    showOpportunityPills: false,
                    sparkles,
                    hasSparkles: sparkles.length > 0,
                    // ── V4 yearly: per-type count pills ──
                    typeCountPills: (() => {
                        if (!this.isChronicleV4 || !this.isYearlyMode) return [];
                        const counts = {};
                        milestoneEvts.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
                        return Object.entries(counts).map(([type, count]) => ({
                            type, count,
                            pillClass: `c-v4-count-pill c-v4-count-pill_${type}`,
                        }));
                    })(),
                    showTypeCountPills: this.isChronicleV4 && this.isYearlyMode && milestoneEvts.length > 0,
                    // ── Engagement track (bottom sub-lane) ──
                    engagementCellClass: 'c-timeline-year-col c-timeline-row__cell c-engagement-cell' + _borderMods,
                    engagementEvents: engagementEvts,
                    hasEngagement:    engagementEvts.length > 0,
                    // ── V4 yearly: per-type engagement count pills ──
                    engTypeCountPills: (() => {
                        if (!this.isChronicleV4 || !this.isYearlyMode) return [];
                        // Meetings and calls share one grey pill — normalize both to 'meeting'
                        const total = engagementEvts.length;
                        return total > 0
                            ? [{ type: 'meeting', count: total, pillClass: 'c-v4-count-pill c-v4-count-pill_meeting' }]
                            : [];
                    })(),
                    showEngTypeCountPills: this.isChronicleV4 && this.isYearlyMode && engagementEvts.length > 0,
                    // ── Shared connectors ──
                    hasConnectorBelow: false,
                    hasConnectorAbove: false,
                };
            });
            return {
                ...m,
                isPrimary:        idx === 0,
                yearCells:        cells,
                hasAnyEngagement: cells.some(c => c.hasEngagement),
                rowClass:         cells.some(c => c.hasEngagement)
                    ? 'c-timeline-row'
                    : 'c-timeline-row c-timeline-row_single-lane',
            };
        });

        /* Post-process: draw shared-event connectors between adjacent member rows.
         * Only in monthly / drill view — yearly view uses count badges, not pills,
         * so connectors don't apply there.
         */
        if (!this.isYearlyMode) {
            const colCount = rows[0]?.yearCells.length || 0;
            for (let cIdx = 0; cIdx < colCount; cIdx++) {
                for (let mIdx = 0; mIdx < rows.length - 1; mIdx++) {
                    const curCell  = rows[mIdx].yearCells[cIdx];
                    const nextCell = rows[mIdx + 1].yearCells[cIdx];
                    if (!curCell || !nextCell) continue;
                    const curShared  = curCell.events.find(e => e.detail?.isShared);
                    const nextShared = nextCell.events.find(e => e.detail?.isShared);
                    if (curShared && nextShared && curShared.label === nextShared.label) {
                        curCell.hasConnectorBelow  = true;
                        nextCell.hasConnectorAbove = true;
                    }
                }
            }
        }

        return rows;
    }

    get timelineMemberHeaderLabel() {
        const src = this.isYearlyMode
            ? (this._enrichment?.timelineMembers        || [])
            : (this._enrichment?.monthlyTimelineMembers || []);
        return `Members (${src.length})`;
    }

    get timelineMetaText() {
        const source = this.isYearlyMode
            ? (this._enrichment?.timelineMembers        || [])
            : (this._enrichment?.monthlyTimelineMembers || []);
        const total = source.reduce((sum, m) => sum + m.events.length, 0);
        return `${total} item${total !== 1 ? 's' : ''} • No filters applied`;
    }

    @track drillYear        = null;  // year number when user drills into a year
    @track _drillAnimPhase  = 'idle'; // 'idle' | 'leaving' | 'entering'
    @track _expandingYear   = null;  // year cell that "stretches" during leaving
    @track _scrollVisibleYear = '';  // period label shown in sticky breadcrumb

    _pendingScrollColIdx = CURRENT_MONTH_IDX; // scroll to current month on first render

    get isDrillMode()   { return this.drillYear !== null; }

    // drillYearLabel exposed to template
    get drillYearLabel() { return this.drillYear ? String(this.drillYear) : ''; }

    // Wealth journey uses monthly-width layout in drill or monthly mode
    get wealthJourneyIsMonthly() { return this.isMonthlyMode || this.isDrillMode; }

    // ── Household Journey version toggle ────────────────────────────────────────
    @track _chronicleVersion = 'v1'; // 'v1' | 'v2' | 'v3' | 'v4'
    get isChronicleV1()  { return this._chronicleVersion === 'v1' || this._chronicleVersion === 'v4'; }
    get isChronicleV2()  { return this._chronicleVersion === 'v2'; }
    get isChronicleV3()  { return this._chronicleVersion === 'v3'; }
    get isChronicleV4()  { return this._chronicleVersion === 'v4'; }
    get toggleV1Class()  { return 'c-cv-toggle__btn' + (this._chronicleVersion === 'v1' ? ' c-cv-toggle__btn_active' : ''); }
    get toggleV2Class()  { return 'c-cv-toggle__btn' + (this._chronicleVersion === 'v2' ? ' c-cv-toggle__btn_active' : ''); }
    get toggleV3Class()  { return 'c-cv-toggle__btn' + (this._chronicleVersion === 'v3' ? ' c-cv-toggle__btn_active' : ''); }
    get toggleV4Class()  { return 'c-cv-toggle__btn' + (this._chronicleVersion === 'v4' ? ' c-cv-toggle__btn_active' : ''); }
    handleChronicleVersionToggle(event) { this._chronicleVersion = event.currentTarget.dataset.version; }
    get enrichmentData() {
        // Attach module-level EVENT_DETAILS so V2 can populate pill detail objects
        return this._enrichment ? { ...this._enrichment, eventDetails: EVENT_DETAILS } : null;
    }

    @track _tlInsightsOpen      = false;  // Timeline Insights panel open/closed
    @track _highlightedPillId      = null;   // pill to spotlight when insight card clicked
    @track _highlightedActionLabel = null;   // action label for the highlighted pill
    @track _agentforceOpen      = false;
    @track _agentType           = 'financial_advisor'; // 'financial_advisor' | 'agentforce'
    @track _agentSwitcherOpen   = false;
    @track _milestoneModalOpen    = false;
    @track _milestoneModalPrefill = null; // { eventName, eventType, primaryMember }
    @track _lifePrefill           = null; // { name, type, description, primaryMemberId } pre-fill for life event modal
    @track _modalSelectedType     = '';   // tracks live combobox selection
    @track _goalWizardStep        = 1;    // 1 | 2 | 3
    @track _timelineCtxMenu       = null; // { x, y, memberId, memberName } or null
    @track _meetingPrefill        = null; // { subject, description, name, relatedTo } or null
    @track _pendingMeetingSourceId = null; // sourceId of the pill that triggered the "Create Meeting" modal
    @track _replacedPillMap       = {};   // { [sourceId]: dynMeetingEvent } — pills replaced by saved meetings
    @track _financialPrefill      = null; // { name, type } pre-fill for financial account modal
    @track _goalPrefill           = null; // { name, type, targetAmount, priority } pre-fill for goal wizard
    @track _aapExpanded           = true;  // Agent Actions Panel open/collapsed
    @track _ghsExpanded           = true;  // Generational Health Score card expanded
    @track _newMenuOpen        = false;   // kept for legacy guard in filter handler
    @track _newEventType       = null;    // unused – kept to avoid removing filter ref
    @track _filterMenuOpen     = false;
    @track _activeFilter    = 'all';  // 'all' | 'life' | 'meeting' | 'goal' | 'financial'
    @track popoverVisible   = false;
    @track popoverEventData = null;
    popoverPanelStyle       = '';
    popoverArrowRight       = false;

    /** V1: show the AI Insights card ONLY for pills with a red dot (isCritical === true) */
    get popoverAiCardGate() {
        // Show the Agentic Insights card only for pills that appear in the Timeline Insights panel
        const id = this.popoverEventData?.id;
        return !!id && this.tlInsightsHighlights.some(h => h.timelineEventId === id);
    }

    // ── Timeline cell context menu ("Add to Timeline") ───────────
    get timelineContextMenuOpen()  { return !!this._timelineCtxMenu; }
    get timelineContextMenuStyle() {
        if (!this._timelineCtxMenu) return '';
        const { x, y } = this._timelineCtxMenu;
        return `left:${x}px;top:${y}px;`;
    }
    get timelineContextMenuItems() {
        return [
            { type: 'life_event',        label: 'Life Event',        iconName: 'utility:event'   },
            { type: 'meeting',           label: 'Meeting',           iconName: 'utility:people'  },
            { type: 'financial_account', label: 'Financial Account', iconName: 'utility:company' },
            { type: 'financial_goal',    label: 'Financial Goal',    iconName: 'standard:goals', isGoal: true },
        ];
    }

    handleTimelineCellClick(event) {
        // Don't open menu if a child handler already consumed the event
        if (event.defaultPrevented) return;
        // Position relative to viewport so menu sits near the click
        const x = Math.min(event.clientX + 4, window.innerWidth  - 260);
        const y = Math.min(event.clientY + 4, window.innerHeight - 280);
        // Capture which member's lane was clicked for modal pre-fill
        const memberId   = event.currentTarget.dataset.memberId   || '';
        const memberName = event.currentTarget.dataset.memberName || '';
        this._timelineCtxMenu = { x, y, memberId, memberName };
    }

    handleCloseTimelineCtxMenu() {
        this._timelineCtxMenu = null;
    }

    handleTimelineContextSelect(event) {
        event.stopPropagation();
        const type       = event.currentTarget.dataset.type;
        const memberName = this._timelineCtxMenu?.memberName || '';
        const memberId   = this._timelineCtxMenu?.memberId   || '';
        this._timelineCtxMenu = null;
        const typeMap = { life_event: 'life', meeting: 'engagement', financial_account: 'financial', financial_goal: 'goal' };
        const eventType = typeMap[type] || '';
        this._milestoneModalPrefill = { eventType, primaryMember: memberName, primaryMemberId: memberId };
        this._modalSelectedType     = '';
        // Financial goal → open wizard directly
        if (eventType === 'goal') {
            this._goalWizardStep     = 1;
            this._milestoneModalOpen = true;
            return;
        }
        // Meeting → open with pre-filled name
        if (eventType === 'engagement' && memberName) {
            this._meetingPrefill = {
                subject:     '',
                description: '',
                name:        memberName,
                relatedTo:   'Bennett Household',
            };
        }
        this._milestoneModalOpen = true;
    }

    handlePillClick(event) {
        event.stopPropagation();

        const POPOVER_WIDTH = 410; // panel width + gap
        const rect = event.currentTarget.getBoundingClientRect();
        const pillCenterY = rect.top + rect.height / 2;

        // Default: open to the right of the pill
        let left = rect.right + 14;
        let arrowRight = false;

        // Flip left when there's not enough space on the right
        if (left + POPOVER_WIDTH > window.innerWidth - 16) {
            left = rect.left - POPOVER_WIDTH - 4;
            arrowRight = true;
        }

        // Clamp left edge to viewport
        left = Math.max(8, left);

        this.popoverPanelStyle = `top: ${pillCenterY}px; left: ${left}px;`;
        this.popoverArrowRight = arrowRight;

        const eventId = event.currentTarget.dataset.eventId;
        let found = null;
        for (const row of this.timelineRows) {
            for (const cell of row.yearCells) {
                const e = cell.events.find((ev) => ev.id === eventId)
                        || (cell.engagementEvents || []).find((ev) => ev.id === eventId);
                if (e) { found = e; break; }
            }
            if (found) break;
        }
        if (!found) return;
        this.popoverEventData = found;
        this.popoverVisible   = true;
    }

    // ── Timeline Insights panel ──────────────────────────────────
    get tlInsightsOpen() { return this._tlInsightsOpen; }

    get tlInsightsBtnClass() {
        return this._tlInsightsOpen
            ? 'c-tl-ctrl-btn c-tl-ctrl-btn_active'
            : 'c-tl-ctrl-btn';
    }

    get groupTimelineClass() {
        return this._tlInsightsOpen
            ? 'c-group-timeline c-group-timeline_insights-open'
            : 'c-group-timeline';
    }

    get tlInsightsHighlights() {
        return (this.highlights || [])
            .filter(h => !h.hideFromTimeline)
            .map((h) => ({
                ...h,
                isActive:  h.timelineEventId === this._highlightedPillId,
                cardClass: 'c-tli-card' + (h.timelineEventId === this._highlightedPillId ? ' c-tli-card_active' : ''),
            }));
    }

    /** Groups V1 timeline insights into the 3 named sections for the side panel. */
    get groupedTlInsights() {
        const SECTION_ORDER = [
            'Life Event Insights',
            'Financial Goal Insights',
            'Financial Account Insights',
            'Relationship Insights',
        ];
        const buckets = {};
        for (const h of this.tlInsightsHighlights) {
            const cat = h.category || 'Other';
            if (!buckets[cat]) buckets[cat] = [];
            buckets[cat].push(h);
        }
        const ordered = SECTION_ORDER.filter(c => buckets[c]);
        return ordered.map((c, i) => ({
            id:         `v1grp-${i}`,
            label:      c,
            cards:      buckets[c],
            groupClass: 'c-tl-insights-section' + (i < ordered.length - 1 ? ' c-tl-insights-section_sep' : ''),
        }));
    }

    handleToggleTlInsights() {
        this._tlInsightsOpen = !this._tlInsightsOpen;
        // Clear highlight + action when panel closes
        if (!this._tlInsightsOpen) {
            this._highlightedPillId      = null;
            this._highlightedActionLabel = null;
        }
    }

    handleInsightCardClick(event) {
        const eventId = event.currentTarget.dataset.eventId;
        if (!eventId) return;

        // Toggle: clicking the active card clears the highlight
        const isSame = this._highlightedPillId === eventId;
        this._highlightedPillId      = isSame ? null : eventId;
        this._highlightedActionLabel = isSame ? null : (() => {
            const h = (this.highlights || []).find(i => i.timelineEventId === eventId);
            return h ? h.actionLabel : null;
        })();
        // Always close any open popover when navigating via insight card
        this.popoverVisible   = false;
        this.popoverEventData = null;

        if (!this._highlightedPillId) return;

        // If currently in yearly overview, pills are not in the DOM (showEvents = false).
        // Auto-drill into the year that contains this event so pills become visible.
        if (this.isYearlyMode) {
            const targetYear = this._getEventYear(eventId);
            if (targetYear) {
                this._expandingYear  = targetYear;
                this._drillAnimPhase = 'leaving';
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                setTimeout(() => {
                    this.drillYear       = targetYear;
                    this._drillAnimPhase = 'entering';
                    this._pendingScrollColIdx = Math.max(0, (targetYear - 2019) * 12);
                    // eslint-disable-next-line @lwc/lwc/no-async-operation
                    setTimeout(() => {
                        this._drillAnimPhase = 'idle';
                        this._scrollToPill(eventId);
                    }, 420);
                }, 270);
                return;
            }
        }

        // Monthly / drill mode: pills already in DOM — scroll after repaint
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        requestAnimationFrame(() => { this._scrollToPill(eventId); });
    }

    /** Find the year number for a given event id from the raw members data */
    _getEventYear(eventId) {
        const members = this._enrichment?.timelineMembers || [];
        for (const m of members) {
            const e = (m.events || []).find((ev) => ev.id === eventId);
            if (e) return e.year || null;
        }
        return null;
    }

    /** Scroll the highlighted pill comfortably into the centre of the visible timeline area */
    _scrollToPill(eventId) {
        // Use .c-event-pill scope guard so insight-card elements (which also carry
        // data-event-id) are not accidentally matched.
        const pillEl = this.template.querySelector(`.c-event-pill[data-event-id="${eventId}"]`)
                    || this.template.querySelector(`[data-event-id="${eventId}"]`);
        if (!pillEl) return;
        this._scrollPillToCenter(pillEl);
    }

    /** Center a pill element horizontally within the scrollable timeline body */
    _scrollPillToCenter(pillEl) {
        const container = this.template.querySelector('.c-group-timeline__body');
        if (!container) {
            pillEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            return;
        }
        const cRect = container.getBoundingClientRect();
        const pRect = pillEl.getBoundingClientRect();
        // Pill's center position in scroll-space
        const pillCenterX = container.scrollLeft + pRect.left - cRect.left + pRect.width / 2;
        // Scroll so that pill center aligns with container center
        container.scrollTo({ left: Math.max(0, pillCenterX - cRect.width / 2), behavior: 'smooth' });
    }

    /** Programmatically position and open the event popover for an insight-linked pill */
    _openPopoverForInsight(eventId) {
        const pillEl = this.template.querySelector(`[data-event-id="${eventId}"]`);
        if (!pillEl) return;

        const POPOVER_WIDTH = 410;
        const rect          = pillEl.getBoundingClientRect();
        const pillCenterY   = rect.top + rect.height / 2;
        let   left          = rect.right + 14;
        let   arrowRight    = false;

        // Avoid overlapping the Timeline Insights panel (320px wide on the right)
        const rightBound = this._tlInsightsOpen
            ? window.innerWidth - 340
            : window.innerWidth - 16;

        if (left + POPOVER_WIDTH > rightBound) {
            left       = rect.left - POPOVER_WIDTH - 4;
            arrowRight = true;
        }
        left = Math.max(8, left);

        this.popoverPanelStyle = `top: ${pillCenterY}px; left: ${left}px;`;
        this.popoverArrowRight = arrowRight;

        // Find the event object across all timeline rows (works in monthly + drill mode)
        let found = null;
        for (const row of this.timelineRows) {
            for (const cell of row.yearCells) {
                const e = cell.events.find((ev) => ev.id === eventId);
                if (e) { found = e; break; }
            }
            if (found) break;
        }
        if (!found) return;

        // Inject the linked insight's text + CTA into the detail so the AI card renders
        const insight = (this.highlights || []).find((h) => h.timelineEventId === eventId);
        this.popoverEventData = insight ? {
            ...found,
            detail: {
                ...found.detail,
                aiInsight:     insight.description,
                aiActionLabel: insight.actionLabel,
            },
        } : found;

        this.popoverVisible = true;
    }

    handlePillQuickAction(event) {
        event.stopPropagation();
        const action   = event.currentTarget.dataset.action;
        const sourceId = event.currentTarget.dataset.sourceId || null;
        // Dismiss highlight then dispatch
        this._highlightedPillId      = null;
        this._highlightedActionLabel = null;
        this._dispatchHighlightAction(action, sourceId);
    }

    get agentforceOpen()    { return this._agentforceOpen; }
    get agentSwitcherOpen() { return this._agentSwitcherOpen; }
    get agentTitle() {
        return this._agentType === 'agentforce' ? 'Agentforce' : 'Financial Advisor Assistant';
    }

    handleAskAgentforce() {
        // Bubble the same event the global header fires so the app shell opens the panel.
        // defaultAgent: 'financial_advisor' since this is triggered from the timeline/page.
        this.dispatchEvent(new CustomEvent('panelselect', {
            detail: { name: 'agentforce_panel', defaultAgent: 'financial_advisor' },
            bubbles: true,
            composed: true
        }));
    }
    // ── Generational Wealth Health Score ─────────────────────────
    get ghsExpanded()  { return this._ghsExpanded; }
    get ghsChevron()   { return this._ghsExpanded ? 'utility:chevronup' : 'utility:chevrondown'; }
    handleToggleGhs()  { this._ghsExpanded = !this._ghsExpanded; }

    get generationalHealthScore() {
        // ── Rule 1: Spouse & Heir Engagement ─────────────────────
        // Grace absent from 2025 and 2026 reviews (2 of last 2 missed).
        // Joshua and Eleanor not yet included in any planning session.
        // David attended every review. 1 of 5 household members fully engaged.
        const r1Score   = 30;
        const r1Status  = 'critical';
        const r1Label   = 'Critical';
        const r1Finding = 'Grace Bennett has not been meaningfully engaged in ~18 months. Maya, Joshua, and Eleanor are not yet included in any estate planning conversation.';

        // ── Rule 2: Beneficiary Coverage ─────────────────────────
        // BRK-2020-4471 ✓ · HSA-2024-3319 ✓ · TL-2026-7754 ✓ · IRA-2022-5581 ✓
        // SAV-2021-8832 ✗ · Beneficiaries not reviewed since Eleanor moved in.
        const r2Score   = 60;
        const r2Status  = 'at-risk';
        const r2Label   = 'At Risk';
        const r2Finding = '4 of 5 accounts have named beneficiaries. Beneficiary designations have not been reviewed since Eleanor moved in (spring 2026).';

        // ── Rule 3: Trust Established ─────────────────────────────
        // No revocable living trust, will, or POA on file.
        const r3Score   = 0;
        const r3Status  = 'critical';
        const r3Label   = 'Critical';
        const r3Finding = 'No revocable living trust, will, or power of attorney has been documented for the Bennett Household.';

        const overall = Math.round((r1Score + r2Score + r3Score) / 3);
        const overallStatus = overall < 40 ? 'critical' : overall < 70 ? 'at-risk' : 'on-track';

        const _ruleClass = (s) =>
            s === 'critical' ? 'c-ghs-rule__status c-ghs-rule__status_critical'
          : s === 'at-risk'  ? 'c-ghs-rule__status c-ghs-rule__status_at-risk'
          :                    'c-ghs-rule__status c-ghs-rule__status_on-track';

        const _barClass = (s) =>
            s === 'critical' ? 'c-ghs-bar__fill c-ghs-bar__fill_critical'
          : s === 'at-risk'  ? 'c-ghs-bar__fill c-ghs-bar__fill_at-risk'
          :                    'c-ghs-bar__fill c-ghs-bar__fill_on-track';

        return {
            overall,
            overallLabel:  overall < 40 ? 'Critical' : overall < 70 ? 'At Risk' : 'On Track',
            overallClass: 'c-ghs-score c-ghs-score_' + overallStatus,
            overallRingClass: 'c-ghs-ring c-ghs-ring_' + overallStatus,
            rules: [
                {
                    id: 'r1', iconName: 'utility:people',
                    title: 'Spouse & Heir Engagement',
                    score: r1Score, statusLabel: r1Label,
                    statusClass: _ruleClass(r1Status),
                    barFillClass: _barClass(r1Status),
                    barStyle: `width:${r1Score}%`,
                    finding: r1Finding,
                },
                {
                    id: 'r2', iconName: 'utility:shield',
                    title: 'Beneficiary Coverage',
                    score: r2Score, statusLabel: r2Label,
                    statusClass: _ruleClass(r2Status),
                    barFillClass: _barClass(r2Status),
                    barStyle: `width:${r2Score}%`,
                    finding: r2Finding,
                },
                {
                    id: 'r3', iconName: 'utility:file',
                    title: 'Trust Established',
                    score: r3Score, statusLabel: r3Label,
                    statusClass: _ruleClass(r3Status),
                    barFillClass: _barClass(r3Status),
                    barStyle: `width:${r3Score}%`,
                    finding: r3Finding,
                },
            ],
        };
    }

    // ── Agent Actions Panel ────────────────────────────────────────
    get aapExpanded()  { return this._aapExpanded; }
    get aapChevron()   { return this._aapExpanded ? 'utility:chevronup' : 'utility:chevrondown'; }
    handleToggleAap()  { this._aapExpanded = !this._aapExpanded; }

    get agentActions() {
        const mkStatus = (label) => {
            const map = {
                'Ready to Send':   'c-aap-status c-aap-status_send',
                'Action Needed':   'c-aap-status c-aap-status_action',
                'Ready to Review': 'c-aap-status c-aap-status_review',
            };
            return map[label] || 'c-aap-status c-aap-status_review';
        };
        const cats = [
            {
                id: 'cat1',
                category: 'Life Event Gaps',
                iconName: 'utility:event',
                catIconClass: 'c-aap-cat-icon c-aap-cat-icon_life',
                items: [
                    {
                        id: 'aa1',
                        agentNote: 'Agentforce identified a college funding gap — Maya starts fall 2027 with no savings plan modeled yet',
                        title: 'College plan checklist ready — Maya Bennett',
                        statusLabel: 'Action Needed',
                        ctaLabel: 'Model College Plan',
                    },
                    {
                        id: 'aa2',
                        agentNote: 'Agentforce flagged Grace\'s missing re-engagement after 18-month absence from planning sessions',
                        title: 'Comparative term life analysis prepared — Grace Bennett',
                        statusLabel: 'Ready to Review',
                        ctaLabel: 'Review Analysis',
                    },
                    {
                        id: 'aa3',
                        agentNote: 'Agentforce scanned all accounts and found beneficiaries not reviewed since Eleanor moved in (spring 2026)',
                        title: 'Beneficiary update checklist compiled — Bennett Household',
                        statusLabel: 'Action Needed',
                        ctaLabel: 'Review Accounts',
                    },
                ],
            },
            {
                id: 'cat2',
                category: 'Interaction & Relationship Health',
                iconName: 'utility:people',
                catIconClass: 'c-aap-cat-icon c-aap-cat-icon_interaction',
                items: [
                    {
                        id: 'aa4',
                        agentNote: 'Agentforce has prepped a meeting summary for Grace\'s 1:1 re-engagement session',
                        title: 'Meeting summary draft ready — Grace Bennett 1:1',
                        statusLabel: 'Ready to Send',
                        ctaLabel: 'Add to Meeting Concierge',
                    },
                    {
                        id: 'aa5',
                        agentNote: 'Agentforce drafted a personalised re-engagement email based on Grace\'s 18-month absence',
                        title: 'Re-engagement email drafted — Grace Bennett',
                        statusLabel: 'Ready to Send',
                        ctaLabel: 'Review Draft',
                    },
                    {
                        id: 'aa6',
                        agentNote: 'Agentforce compiled talking points and open action items for the upcoming mid-year review',
                        title: 'Annual review agenda prepared — Bennett Household',
                        statusLabel: 'Ready to Review',
                        ctaLabel: 'View Agenda',
                    },
                ],
            },
            {
                id: 'cat3',
                category: 'Generational Wealth Readiness',
                iconName: 'utility:moneybag',
                catIconClass: 'c-aap-cat-icon c-aap-cat-icon_wealth',
                items: [
                    {
                        id: 'aa7',
                        agentNote: 'Agentforce modelled college cost scenarios over 4 years for Maya Bennett (starting fall 2027)',
                        title: 'College savings projection ready — Maya Bennett',
                        statusLabel: 'Ready to Review',
                        ctaLabel: 'Review Projection',
                    },
                    {
                        id: 'aa8',
                        agentNote: 'Agentforce modeled eldercare cost-planning options following Eleanor\'s move-in in spring 2026',
                        title: 'Eldercare cost plan outlined — Eleanor Bennett',
                        statusLabel: 'Ready to Review',
                        ctaLabel: 'Review Strategy',
                    },
                    {
                        id: 'aa9',
                        agentNote: 'Agentforce identified 4 missing estate planning documents including will, trust, and POA',
                        title: 'Estate planning gap report created — Bennett Household',
                        statusLabel: 'Action Needed',
                        ctaLabel: 'View Checklist',
                    },
                ],
            },
        ];
        return cats.map(cat => ({
            ...cat,
            items: cat.items.map(item => ({ ...item, statusClass: mkStatus(item.statusLabel) })),
        }));
    }

    handleAgentActionCta(event) {
        event.stopPropagation();
        const id = event.currentTarget.dataset.id;
        // "Add to Meeting Concierge" — open meeting modal with Grace pre-fill
        if (id === 'aa4' || id === 'aa5') {
            this._meetingPrefill = {
                subject:     '1:1 Planning Review with Grace Bennett',
                description: 'Grace has not been meaningfully engaged in ~18 months. This 1:1 aims to re-anchor her as an active co-client and review her current financial priorities.',
                name:        'Grace Bennett',
                relatedTo:   'Bennett Household',
            };
            this._milestoneModalPrefill = { eventType: 'engagement', primaryMember: '' };
            this._modalSelectedType     = '';
            this._milestoneModalOpen    = true;
        }
        // "Review & Open 529" — open goal wizard
        if (id === 'aa1' || id === 'aa7') {
            this._milestoneModalPrefill = { eventType: 'goal', primaryMember: '' };
            this._modalSelectedType     = '';
            this._milestoneModalOpen    = true;
        }
    }

    handleToggleAgentSwitcher(event) {
        event.stopPropagation();
        this._agentSwitcherOpen = !this._agentSwitcherOpen;
    }
    handleSelectAgent(event) {
        event.stopPropagation();
        this._agentType         = event.currentTarget.dataset.agent;
        this._agentSwitcherOpen = false;
    }

    // ── New Milestone modal ───────────────────────────────────────
    // Each type has its own template
    get meetingModalOpen()          { return this._milestoneModalOpen && this._milestoneModalPrefill?.eventType === 'engagement'; }

    // AI pre-fill getters for the meeting modal
    get meetingHasAiPrefill()       { return !!this._meetingPrefill; }
    get meetingPrefillSubject()     { return this._meetingPrefill?.subject     || ''; }
    get meetingPrefillDescription() { return this._meetingPrefill?.description || ''; }
    get meetingPrefillName()        { return this._meetingPrefill?.name        || ''; }
    get meetingPrefillRelatedTo()   { return this._meetingPrefill?.relatedTo   || ''; }

    get financialHasAiPrefill()  { return !!(this._financialPrefill?.name || this._financialPrefill?.type); }
    get financialPrefillName()   { return this._financialPrefill?.name || ''; }
    get financialPrefillType()   { return this._financialPrefill?.type || ''; }

    // ── Financial Goal wizard pre-fill getters ────────────────────
    get goalHasAiPrefill()          { return !!this._goalPrefill; }
    get goalPrefillName()           { return this._goalPrefill?.name           || ''; }
    get goalPrefillType()           { return this._goalPrefill?.type           || ''; }
    get goalPrefillTargetAmount()   { return this._goalPrefill?.targetAmount != null ? String(this._goalPrefill.targetAmount) : ''; }
    get goalPrefillPriority()       { return this._goalPrefill?.priority       || ''; }

    get financialAccountModalOpen() { return this._milestoneModalOpen && this._milestoneModalPrefill?.eventType === 'financial'; }
    get financialGoalModalOpen()    { return this._milestoneModalOpen && this._milestoneModalPrefill?.eventType === 'goal'; }
    get milestoneModalOpen() {
        const t = this._milestoneModalPrefill?.eventType;
        return this._milestoneModalOpen && t !== 'engagement' && t !== 'financial' && t !== 'goal';
    }

    // Dynamic title based on which new-event type was chosen
    get modalTitle() {
        const map = {
            life:       'New Person Life Event',
            engagement: 'New Meeting',
            financial:  'New Financial Account',
            goal:       'New Financial Goal',
        };
        return map[this._milestoneModalPrefill?.eventType] || 'New Event';
    }

    // Pre-fill getters — event name/type start blank; only primary person defaults
    get modalPrefillEventName()    { return this._lifePrefill?.name  || ''; }
    get modalPrefillEventType()    { return this._lifePrefill?.type  || ''; }
    get lifeHasAiPrefill()         { return !!this._lifePrefill; }
    get lifePrefillDescription()   { return this._lifePrefill?.description || ''; }
    get modalPrefillPrimaryMember(){
        // Prefer the memberId (matches combobox option values); fall back to name or default
        return this._milestoneModalPrefill?.primaryMemberId
            || this._milestoneModalPrefill?.primaryMember
            || this.defaultMemberValue;
    }

    // The effective selected type: live combobox change only (type is no longer pre-filled)
    get _effectiveModalType() {
        return this._modalSelectedType || '';
    }

    // Only Goals have an expiration date / description
    get modalShowExpiration() { return this._effectiveModalType === 'goal'; }

    handleModalEventTypeChange(event) {
        this._modalSelectedType = event.detail?.value || '';
    }

    // Context-aware Event Type options — sub-types per category
    get milestoneTypeOptions() {
        const category = this._milestoneModalPrefill?.eventType;
        if (category === 'life') {
            return [
                { label: 'Birth / Adoption',  value: 'birth'      },
                { label: 'Marriage',          value: 'marriage'   },
                { label: 'Home Purchase',     value: 'home'       },
                { label: 'Career Change',     value: 'career'     },
                { label: 'Retirement',        value: 'retirement' },
                { label: 'Education',         value: 'education'  },
                { label: 'Other',             value: 'other'      },
            ];
        }
        if (category === 'engagement') {
            return [
                { label: 'One-on-One Meeting', value: 'one_on_one' },
                { label: 'Group Meeting',      value: 'group'      },
                { label: 'Call',               value: 'call'       },
                { label: 'Email',              value: 'email'      },
                { label: 'Other',              value: 'other'      },
            ];
        }
        if (category === 'financial') {
            return [
                { label: 'Brokerage Account', value: 'brokerage' },
                { label: 'Retirement (IRA)',  value: 'ira'       },
                { label: '401(k)',            value: '401k'      },
                { label: '529 Plan',          value: '529'       },
                { label: 'Insurance Policy',  value: 'insurance' },
                { label: 'Trust',             value: 'trust'     },
                { label: 'Other',             value: 'other'     },
            ];
        }
        if (category === 'goal') {
            return [
                { label: 'College Funding',  value: 'college'    },
                { label: 'Retirement',       value: 'retirement' },
                { label: 'Home Purchase',    value: 'home'       },
                { label: 'Emergency Fund',   value: 'emergency'  },
                { label: 'Other',            value: 'other'      },
            ];
        }
        // Generic fallback (e.g. opened without a category)
        return [
            { label: 'Life Event',        value: 'life'      },
            { label: 'Meeting',        value: 'engagement'},
            { label: 'Financial Goal',    value: 'goal'      },
            { label: 'Financial Account', value: 'financial' },
        ];
    }

    get financialAccountStatusOptions() {
        return [
            { label: 'Active',   value: 'active'   },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Pending',  value: 'pending'  },
            { label: 'Closed',   value: 'closed'   },
        ];
    }

    get defaultMemberValue() {
        const members = this._enrichment?.timelineMembers || [];
        return members.length ? members[0].memberId : '';
    }

    handleOpenMilestoneModal(event) {
        event.stopPropagation();
        this._milestoneModalPrefill = null;
        this._modalSelectedType     = '';
        this._milestoneModalOpen    = true;
    }

    handleCloseMilestoneModal() {
        this._milestoneModalOpen     = false;
        this._milestoneModalPrefill  = null;
        this._modalSelectedType      = '';
        this._goalWizardStep         = 1;
        this._meetingPrefill         = null;
        this._financialPrefill       = null;
        this._goalPrefill            = null;
        this._lifePrefill            = null;
        this._pendingMeetingSourceId = null;
    }

    /** Called when the user clicks Save in the New Meeting modal.
     *  Replaces the source opportunity pill with a meeting pill on the engagement track. */
    handleSaveMeeting() {
        const sourceId = this._pendingMeetingSourceId;
        if (sourceId) {
            const prefill  = this._meetingPrefill || {};
            const memberId = this._milestoneModalPrefill?.primaryMemberId || null;

            // Locate the source event to inherit its year / month (cell position)
            const allMembers = [
                ...(this._enrichment?.timelineMembers        || []),
                ...(this._enrichment?.monthlyTimelineMembers || []),
            ];
            let srcYear = null, srcMonth = null, srcMemberId = memberId;
            outer: for (const mem of allMembers) {
                for (const e of (mem.events || [])) {
                    if (e.id === sourceId) {
                        srcYear     = e.year  != null ? e.year  : null;
                        srcMonth    = e.month != null ? e.month : null;
                        srcMemberId = srcMemberId || mem.memberId;
                        break outer;
                    }
                }
            }

            this._replacedPillMap = {
                ...this._replacedPillMap,
                [sourceId]: {
                    id:          'dyn_mtg_' + Date.now(),
                    type:        'meeting',
                    label:       prefill.subject     || 'New Meeting',
                    description: prefill.description || '',
                    year:        srcYear,
                    month:       srcMonth,
                    memberId:    srcMemberId,
                    replaces:    sourceId,
                },
            };
        }
        this._pendingMeetingSourceId = null;
        this._milestoneModalOpen     = false;
        this._milestoneModalPrefill  = null;
        this._meetingPrefill         = null;
    }

    get replacedPillMap() { return this._replacedPillMap; }

    // ── Financial Goal wizard ─────────────────────────────────────
    get goalStep1Active() { return this._goalWizardStep === 1; }
    get goalStep2Active() { return this._goalWizardStep === 2; }
    get goalStep3Active() { return this._goalWizardStep === 3; }
    get goalShowPrevious(){ return this._goalWizardStep > 1; }
    get goalShowNext()    { return this._goalWizardStep < 3; }
    get goalShowSave()    { return this._goalWizardStep === 3; }

    _goalCircleClass(n) {
        if (this._goalWizardStep > n)  return 'c-goal-step-circle c-goal-step-circle_done';
        if (this._goalWizardStep === n) return 'c-goal-step-circle c-goal-step-circle_active';
        return 'c-goal-step-circle c-goal-step-circle_future';
    }
    _goalLabelClass(n) {
        return this._goalWizardStep === n
            ? 'c-goal-step-label c-goal-step-label_active'
            : 'c-goal-step-label';
    }
    get goalStepData() {
        const s = this._goalWizardStep;
        return [
            { id: 1, label: 'Goal Details',           circleClass: this._goalCircleClass(1), labelClass: this._goalLabelClass(1), isDone: s > 1 },
            { id: 2, label: 'Goal Members',           circleClass: this._goalCircleClass(2), labelClass: this._goalLabelClass(2), isDone: s > 2 },
            { id: 3, label: 'Link Financial Account', circleClass: this._goalCircleClass(3), labelClass: this._goalLabelClass(3), isDone: false  },
        ];
    }
    handleGoalNext()     { if (this._goalWizardStep < 3) this._goalWizardStep += 1; }
    handleGoalPrevious() { if (this._goalWizardStep > 1) this._goalWizardStep -= 1; }

    get goalTypeOptions() {
        return [
            { label: 'College Funding', value: 'college'    },
            { label: 'Retirement',      value: 'retirement' },
            { label: 'Home Purchase',   value: 'home'       },
            { label: 'Emergency Fund',  value: 'emergency'  },
            { label: 'Education',       value: 'education'  },
            { label: 'Other',           value: 'other'      },
        ];
    }
    get goalPriorityOptions() {
        return [
            { label: 'High',   value: 'high'   },
            { label: 'Medium', value: 'medium' },
            { label: 'Low',    value: 'low'    },
        ];
    }
    get goalStatusOptions() {
        return [
            { label: 'In Progress', value: 'in_progress' },
            { label: 'On Track',    value: 'on_track'    },
            { label: 'At Risk',     value: 'at_risk'     },
            { label: 'Completed',   value: 'completed'   },
        ];
    }
    get goalMembersData() {
        return [
            { id: '1', name: 'David Bennett',  email: 'david.bennett@email.com', phone: '(512) 555-0101' },
            { id: '2', name: 'Grace Bennett',  email: 'grace.bennett@email.com', phone: '(512) 555-0102' },
        ];
    }
    get goalFinancialAccountOptions() {
        return [
            { label: 'BRK-2020-4471 – Taxable Brokerage', value: 'brk1' },
            { label: 'IRA-2019-8823 – Retirement IRA',     value: 'ira1' },
        ];
    }

    // ── New-event dropdown ────────────────────────────────────────
    get newMenuOpen() { return this._newMenuOpen; }

    handleToggleNewMenu(event) {
        event.stopPropagation();
        this._newMenuOpen    = !this._newMenuOpen;
        if (this._newMenuOpen) this._filterMenuOpen = false;
    }

    handleNewMenuSelect(event) {
        event.stopPropagation();
        const type = event.currentTarget.dataset.type;
        this._newMenuOpen = false;
        const typeMap = {
            life_event:        'life',
            meeting:           'engagement',
            financial_account: 'financial',
            financial_goal:    'goal',
        };
        // Store only the category — drives title, type options, and expiration visibility
        this._milestoneModalPrefill = {
            eventType:     typeMap[type] || '',
            primaryMember: '',
        };
        this._modalSelectedType  = '';  // combobox starts at --None--
        this._milestoneModalOpen = true;
    }

    get newEventModalOpen() { return false; }

    get memberOptions() {
        return (this._enrichment?.timelineMembers || []).map(m => ({
            label: m.memberName,
            value: m.memberId,
        }));
    }

    get lifeEventTypeOptions() {
        return [
            { label: 'Birth / Adoption',  value: 'birth'      },
            { label: 'Marriage',          value: 'marriage'   },
            { label: 'Home Purchase',     value: 'home'       },
            { label: 'Career Change',     value: 'career'     },
            { label: 'Retirement',        value: 'retirement' },
            { label: 'Education',         value: 'education'  },
            { label: 'Other',             value: 'other'      },
        ];
    }

    get financialProductTypeOptions() {
        return [
            { label: 'Brokerage Account', value: 'brokerage' },
            { label: 'Retirement (IRA)',  value: 'ira'       },
            { label: '401(k)',            value: '401k'      },
            { label: '529 Plan',          value: '529'       },
            { label: 'Insurance Policy',  value: 'insurance' },
            { label: 'Trust',             value: 'trust'     },
            { label: 'Other',             value: 'other'     },
        ];
    }

    // ── Timeline filter dropdown ───────────────────────────────────
    get filterMenuOpen()  { return this._filterMenuOpen; }
    get activeFilterLabel() {
        const map = { all: 'Show All', life: 'Life Event', engagement: 'Meeting', goal: 'Financial Goal', financial: 'Financial Account' };
        return map[this._activeFilter] || 'Show All';
    }
    get filterOptions() {
        return [
            { value: 'all',       label: 'Show All'          },
            { value: 'life',      label: 'Life Event'        },
            { value: 'engagement',label: 'Meeting'        },
            { value: 'goal',      label: 'Financial Goal'    },
            { value: 'financial', label: 'Financial Account' },
        ].map(o => ({ ...o, isActive: o.value === this._activeFilter }));
    }

    handleToggleFilterMenu(event) {
        event.stopPropagation();
        this._filterMenuOpen = !this._filterMenuOpen;
        if (this._filterMenuOpen) this._newMenuOpen = false;
    }

    handleSetFilter(event) {
        event.stopPropagation();
        this._activeFilter   = event.currentTarget.dataset.value;
        this._filterMenuOpen = false;
    }

    handleClosePopover() {
        this.popoverVisible   = false;
        this.popoverEventData = null;
    }

    // ── AI Suggestions sparkle popover ───────────────────────────────
    @track _addedSuggestionIds    = {};
    @track _dismissedSuggestions  = {};
    @track _addedToTimelineEvents = {};  // { [sugId]: event object }
    @track _sparklePopoverSugId   = null;
    @track _sparklePopoverStyle   = '';

    /* Map suggestion title to a timeline event type */
    _getSugType(title) {
        const MAP = {
            'Model College Plan for Maya':       'goal',
            'Set Up Dependent Care FSA':    'financial',
            'Update Beneficiaries + Will':  'goal',
            'Engage Grace in Planning':      'meeting',
            'Model Eldercare Cost Plan': 'goal',
        };
        return MAP[title] || 'goal';
    }

    /* 'Aug 2026' → 2026 */
    _getYearFromDate(dateStr) {
        const parts = (dateStr || '').split(' ');
        return parts.length === 2 ? Number(parts[1]) : null;
    }

    /* Return memberId matching a display name across timelineMembers */
    _getMemberIdByName(name) {
        const all = [
            ...(this._enrichment?.timelineMembers        || []),
            ...(this._enrichment?.monthlyTimelineMembers || []),
        ];
        const m = all.find((x) => x.memberName === name);
        return m ? m.memberId : null;
    }

    get aiSuggestions() {
        const raw = this._enrichment?.aiSuggestions || [];
        return raw
            .filter((s) => !this._dismissedSuggestions[s.id])
            .map((s) => ({
                ...s,
                isAdded: !!this._addedSuggestionIds[s.id],
            }));
    }

    /* The suggestion object currently shown in the sparkle popover */
    get sparklePopoverSug() {
        if (!this._sparklePopoverSugId) return null;
        return this.aiSuggestions.find((s) => s.id === this._sparklePopoverSugId) || null;
    }

    get sparklePopoverStyle() {
        return this._sparklePopoverStyle;
    }

    // ── Wealth Journey chart data ─────────────────────────────────
    get _wealthRaw() {
        return (this.isMonthlyMode || this.isDrillMode)
            ? (this._enrichment?.wealthJourneyMonthly || [])
            : (this._enrichment?.wealthJourneyYearly  || []);
    }

    get wealthJourneyAumPoints() {
        return this._wealthRaw.map(p => ({
            period:      p.period,
            value:       p.aum,
            isToday:     !!p.isToday,
            isProjected: !!p.isProjected,
        }));
    }

    get wealthJourneyLiquidityPoints() {
        return this._wealthRaw.map(p => ({
            period:      p.period,
            value:       p.liquidity,
            isToday:     !!p.isToday,
            isProjected: !!p.isProjected,
        }));
    }

    get wealthJourneyMarketPoints() {
        // Monthly mode: use full interpolated monthly series (aligned with timeline)
        if (this.isMonthlyMode || this.isDrillMode) {
            return _MARKET_MONTHLY;
        }
        // Yearly mode: use market values embedded in the yearly dataset
        return this._wealthRaw.map(p => ({
            period:      p.period,
            value:       p.market || 0,
            isToday:     !!p.isToday,
            isProjected: !!p.isProjected,
        }));
    }

    get carGoalAmount() { return _CAR_GOAL; }

    /* Sparkle click: compute position from the button and open popover */
    handleSparkleClick(event) {
        event.stopPropagation();
        const sugId = event.currentTarget.dataset.sugId;
        if (this._sparklePopoverSugId === sugId) {
            // Toggle off if clicking same sparkle again
            this._sparklePopoverSugId = null;
            this._sparklePopoverStyle = '';
            return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        const popoverWidth = 320;
        const gap = 12; // gap between sparkle and popover edge
        // Prefer opening to the right; flip left if not enough space
        let left = rect.right + gap;
        let arrowSide = 'left'; // arrow points left (popover is to the right)
        if (left + popoverWidth > window.innerWidth - 8) {
            left = rect.left - popoverWidth - gap;
            arrowSide = 'right'; // arrow points right (popover is to the left)
        }
        // Vertically center on the sparkle button
        const popoverEstHeight = 220;
        let top = rect.top + rect.height / 2 - popoverEstHeight / 2;
        top = Math.max(8, Math.min(top, window.innerHeight - popoverEstHeight - 8));
        this._sparklePopoverStyle = `position:fixed;top:${top}px;left:${left}px;width:${popoverWidth}px;z-index:9000;--sparkle-arrow-side:${arrowSide};`;
        this._sparklePopoverSugId = sugId;
    }

    handleCloseSparklePopover() {
        this._sparklePopoverSugId = null;
        this._sparklePopoverStyle = '';
    }

    handleSparkleAdd() {
        const id = this._sparklePopoverSugId;
        if (!id) return;
        this._addedSuggestionIds = { ...this._addedSuggestionIds, [id]: true };

        const sug      = (this._enrichment?.aiSuggestions || []).find((s) => s.id === id);
        const memberId = sug ? this._getMemberIdByName(sug.member) : null;
        if (sug && memberId) {
            this._addedToTimelineEvents = {
                ...this._addedToTimelineEvents,
                [id]: {
                    id:         `sug-evt-${id}`,
                    memberId,
                    monthKey:   sug.targetDate,
                    yearKey:    this._getYearFromDate(sug.targetDate),
                    label:      sug.title,
                    type:       this._getSugType(sug.title),
                    isSuggestionAdded: true,
                    _sugData:   sug,   // keep raw suggestion for popover detail
                },
            };
        }
        // Close popover after a brief moment so user sees "Added ✓"
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => { this.handleCloseSparklePopover(); }, 1200);
    }

    handleSparkleDismiss() {
        const id = this._sparklePopoverSugId;
        if (!id) return;
        this._dismissedSuggestions = { ...this._dismissedSuggestions, [id]: true };
        this.handleCloseSparklePopover();
    }

    // ── Navigate to a specific AI sparkle on the timeline ───────────────
    @track _pendingOpenSparkleId = null;

    /* Called from the Agentic Insights CTA inside the event popover */
    handlePopoverCta(event) {
        const action   = event.detail?.action;
        const sourceId = event.detail?.sourceId || null;
        // Close the popover + clear highlight first
        this.popoverVisible          = false;
        this.popoverEventData        = null;
        this._highlightedPillId      = null;
        this._highlightedActionLabel = null;
        // Dispatch the action with its source so the right prefill is selected
        this._dispatchHighlightAction(action, sourceId);
    }

    /** Shared action dispatcher used by pill quick-action chip, popover CTA, and highlights panel */
    _dispatchHighlightAction(action, sourceId = null) {
        if (!action) return;
        // ── "Create Meeting" routes to one of two prefills based on the source event ──
        if (action.toLowerCase() === 'create meeting') {
            const isEldercare = sourceId && ['op2', 'h2'].includes(sourceId);
            this._meetingPrefill = isEldercare
                ? {
                    subject:     'Eldercare Planning Review \u2014 Eleanor Bennett',
                    description: 'Eleanor (74) moved in April 2026. POA, healthcare directive, and will must be established urgently before any health decline closes the legal window. Coordinate with David and Grace to schedule this session.',
                    name:        'Eleanor Bennett',
                    relatedTo:   'Bennett Household',
                  }
                : {
                    subject:     '1:1 Planning Review with Grace Bennett',
                    description: 'Grace has not been meaningfully engaged in ~18 months. This 1:1 aims to re-anchor her as an active co-client and review her current financial priorities.',
                    name:        'Grace Bennett',
                    relatedTo:   'Bennett Household',
                  };
            this._milestoneModalPrefill = {
                eventType: 'engagement',
                primaryMember:   isEldercare ? 'Eleanor Bennett' : 'Grace Bennett',
                primaryMemberId: isEldercare ? 'm5'              : 'm2',
            };
            this._pendingMeetingSourceId = sourceId; // remember which pill triggered this
            this._modalSelectedType  = '';
            this._milestoneModalOpen = true;
            return;
        }
        const key = action.toLowerCase();
        const pre = this._ctaModalPrefillMap[key];
        if (pre) {
            if (pre.eventType === 'financial') {
                // Open Financial Account modal with AI-prefilled name + type
                this._financialPrefill      = { name: pre.financialName || '', type: pre.financialType || '' };
                this._milestoneModalPrefill = { eventType: 'financial', primaryMember: pre.primaryMember || '', primaryMemberId: pre.primaryMemberId || '' };
                this._modalSelectedType     = '';
                this._milestoneModalOpen    = true;
                return;
            }
            if (pre.eventType === 'goal') {
                // Set AI pre-fill when goal-specific details are provided
                if (pre.goalName) {
                    this._goalPrefill = {
                        name:         pre.goalName,
                        type:         pre.goalType         || '',
                        targetAmount: pre.goalTargetAmount || '',
                        priority:     pre.goalPriority     || '',
                    };
                }
                this._milestoneModalPrefill = { eventType: 'goal', primaryMember: pre.primaryMember || '', primaryMemberId: pre.primaryMemberId || '' };
                this._modalSelectedType     = 'goal';
                this._goalWizardStep        = 1;
                this._milestoneModalOpen    = true;
                return;
            }
            if (pre.eventType === 'life') {
                // AI pre-fill for life event modal
                this._lifePrefill = {
                    name:        pre.lifeName        || '',
                    type:        pre.lifeType        || '',
                    description: pre.lifeDescription || '',
                };
                this._milestoneModalPrefill = { eventType: 'life', primaryMember: pre.primaryMember || '', primaryMemberId: pre.primaryMemberId || '' };
                this._modalSelectedType     = pre.lifeType || '';
                this._milestoneModalOpen    = true;
                return;
            }
            if (pre.eventType === 'engagement') {
                // AI pre-fill for meeting/engagement modal
                this._meetingPrefill = {
                    subject:     pre.meetingSubject     || '',
                    description: pre.meetingDescription || '',
                    name:        pre.meetingName        || '',
                    relatedTo:   pre.meetingRelatedTo   || '',
                };
                this._milestoneModalPrefill = { eventType: 'engagement', primaryMember: pre.primaryMember || '', primaryMemberId: pre.primaryMemberId || '' };
                this._modalSelectedType     = '';
                this._milestoneModalOpen    = true;
                return;
            }
            // Fallback: generic modal open
            this._milestoneModalPrefill = pre;
            this._modalSelectedType     = pre.eventType || '';
            this._milestoneModalOpen    = true;
            return;
        }
        this._navigateToActionLabel(action);
    }

    /* Called from the Highlights panel action buttons */
    handleHighlightAction(event) {
        const action   = event.currentTarget.dataset.action;
        const sourceId = event.currentTarget.dataset.id || null;
        this._dispatchHighlightAction(action, sourceId);
    }

    /** CTA button on V1 Timeline Insights panel cards — stops card-click propagation then dispatches */
    handleTliCardCta(event) {
        event.stopPropagation();
        const action   = event.currentTarget.dataset.action;
        const sourceId = event.currentTarget.dataset.id || null;
        this._dispatchHighlightAction(action, sourceId);
    }

    /* Called when V2 bubbles a 'highlightaction' custom event (CTA button or popover CTA) */
    handleV2HighlightAction(event) {
        const action   = event.detail?.action;
        const sourceId = event.detail?.sourceId || null;
        this._dispatchHighlightAction(action, sourceId);
    }

    // Map of CTA labels → modal pre-fill data (case-insensitive key lookup)
    _ctaModalPrefillMap = {
        'update goal': {
            eventType:          'goal',
            goalName:           "Maya's 529 College Fund",
            goalType:           '529',
            goalTargetAmount:   120000,
            goalPriority:       'high',
            primaryMember:      'Maya Bennett',
            primaryMemberId:    'm3',
        },
        'create event': {
            eventType:          'life',
            lifeName:           "Eldercare Planning \u2014 Eleanor\u2019s Documents",
            lifeType:           'other',
            lifeDescription:    "Establish POA, healthcare directive, and will for Eleanor Bennett (age 74) before any health decline closes the legal window. Coordinate with David and Grace.",
            primaryMember:      'Eleanor Bennett',
            primaryMemberId:    'm5',
        },
        'create event': {
            // Legacy alias — kept so old links still work; routed to meeting modal
            eventType:          'engagement',
            meetingSubject:     'Eldercare Planning Review \u2014 Eleanor Bennett',
            meetingDescription: 'Eleanor (74) moved in April 2026. POA, healthcare directive, and will must be established urgently. Coordinate with David and Grace.',
            meetingName:        'Eleanor Bennett',
            meetingRelatedTo:   'Bennett Household',
            primaryMember:      'Eleanor Bennett',
            primaryMemberId:    'm5',
        },
        'update event': {
            // Legacy alias — kept so old links still work; routed to meeting modal
            eventType:          'engagement',
            meetingSubject:     'Annual Review \u2014 Grace Bennett',
            meetingDescription: 'Re-engage Grace as an active co-client. Review her current financial priorities, insurance coverage, and estate documents. Last full joint session was Oct 2023 \u2014 approximately 18 months ago.',
            meetingName:        'Grace Bennett',
            meetingRelatedTo:   'Bennett Household',
            primaryMember:      'Grace Bennett',
            primaryMemberId:    'm2',
        },
        'create task': {
            eventType:          'engagement',
            meetingSubject:     'Schedule Insurance Re-rate \u2014 David Bennett',
            meetingDescription: "David\u2019s income increased materially with the VP promotion in May 2025 but life and disability coverage has never been updated. Schedule a protection review to re-rate coverage against the new compensation level and household obligations.",
            meetingName:        'David Bennett',
            meetingRelatedTo:   'Bennett Household',
            primaryMember:      'David Bennett',
            primaryMemberId:    'm1',
        },
        'model college plan': {
            eventType:       'financial',
            financialName:   "Maya's College Plan",
            financialType:   '529',
            primaryMember:   'Maya Bennett',
            primaryMemberId: 'm3',
        },
        'model rsu reinvestment': {
            eventName: 'Model RSU Reinvestment',
            eventType: 'goal',
            primaryMember: 'David Bennett',
        },
        'review goal': {
            eventType:        'goal',
            goalName:         'New Car Fund',
            goalType:         'savings',
            goalTargetAmount: 45000,
            goalPriority:     'high',
            primaryMember:    'David Bennett',
            primaryMemberId:  'm1',
        },
    };

    _navigateToActionLabel(action) {
        if (!action) return;
        const key = action.toLowerCase();

        // 1. Try to find a matching sparkle AI suggestion
        const sug = (this._enrichment?.aiSuggestions || []).find(
            (s) => s.title.toLowerCase() === key
        );

        if (sug) {
            // Close any open popovers and navigate to the sparkle
            this.popoverVisible       = false;
            this.popoverEventData     = null;
            this._sparklePopoverSugId = null;
            this._sparklePopoverStyle = '';
            this.drillYear     = null;
            this.timelineMode  = 'monthly';
            const idx = TIMELINE_MONTHS.indexOf(sug.targetDate);
            if (idx >= 0) this._pendingScrollColIdx = idx;
            this._pendingOpenSparkleId = sug.id;
            return;
        }

        // 2. No sparkle match — CTA is informational only for now; no modal opened.
    }

    handleYearExpand(event) {
        event.stopPropagation();
        if (this._drillAnimPhase !== 'idle') return;
        const year = Number(event.currentTarget.dataset.year);
        // 1. Mark the target year + start leaving animation on existing cells
        this._expandingYear    = year;
        this._drillAnimPhase   = 'leaving';
        this._scrollVisibleYear = '';
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            // 2. Switch to drill view + start entering animation on new cells
            this.drillYear        = year;
            this._drillAnimPhase  = 'entering';
            // Spatial anchor: scroll to January of the selected year
            // Jan of year Y is at index (Y - 2019) * 12 in the 96-month array
            this._pendingScrollColIdx = Math.max(0, (year - 2019) * 12);
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => { this._drillAnimPhase = 'idle'; }, 380);
        }, 270);
    }

    handleDrillBack() {
        if (this._drillAnimPhase !== 'idle') return;
        this._drillAnimPhase    = 'leaving';
        this._scrollVisibleYear = '';
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            this.drillYear        = null;
            this._expandingYear   = null;
            this._drillAnimPhase  = 'entering';
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => { this._drillAnimPhase = 'idle'; }, 380);
        }, 270);
    }

    agenticInsightsEnabled = true;

    get agenticInsightsSwitchClass() {
        return this.agenticInsightsEnabled ? 'c-ai-switch c-ai-switch_on' : 'c-ai-switch';
    }

    handleAgenticInsights() { this.agenticInsightsEnabled = !this.agenticInsightsEnabled; }

    handleTimelineMode(event) {
        if (this._drillAnimPhase !== 'idle') return;
        const mode = event.currentTarget.dataset.mode;
        if (mode === this.timelineMode && !this.isDrillMode) return; // already in this mode
        this._drillAnimPhase    = 'leaving';
        this._scrollVisibleYear = '';
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            this.timelineMode   = mode;
            this.drillYear      = null;
            this._expandingYear = null;
            this._drillAnimPhase = 'entering';
            if (mode === 'monthly') this._pendingScrollColIdx = CURRENT_MONTH_IDX;
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => { this._drillAnimPhase = 'idle'; }, 380);
        }, 270);
    }

    /* ── Spatial Anchoring: scroll to target column after monthly/drill renders ── */
    _scrollChainActive = false; // guard: only one retry chain at a time

    renderedCallback() {
        if (this._pendingScrollColIdx !== null && !this._scrollChainActive) {
            const colIdx = this._pendingScrollColIdx;
            this._scrollChainActive = true;
            // Use rAF for the first attempt so layout is fully painted before we measure
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            requestAnimationFrame(() => this._scrollToColumn(colIdx, 0));
        }
    }

    /* Retry scroll until the container is ready (up to 15 attempts, ~1500ms total) */
    _scrollToColumn(colIdx, attempt) {
        if (attempt > 15) {
            this._pendingScrollColIdx = null;
            this._scrollChainActive   = false;
            return;
        }
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
            const body = this.template.querySelector('.c-group-timeline__body');
            // Body must exist and be scrollable before we commit
            if (!body || body.offsetWidth === 0 || body.scrollWidth <= body.offsetWidth) {
                this._scrollToColumn(colIdx, attempt + 1);
                return;
            }
            const COL_W_PX    = 8.5 * 16; // 136px — must match CSS grid column width
            const MEMBER_W_PX = 12  * 16; // 192px — must match CSS member column width
            const visibleW  = body.offsetWidth - MEMBER_W_PX;
            const colCenter = MEMBER_W_PX + colIdx * COL_W_PX + COL_W_PX / 2;
            const target    = Math.max(0, Math.round(colCenter - MEMBER_W_PX - visibleW / 2));
            body.scrollLeft = target;
            // Confirm scroll took effect; retry if it didn't (e.g. content still loading)
            if (body.scrollLeft === 0 && target > 0) {
                this._scrollToColumn(colIdx, attempt + 1);
                return;
            }
            // Success — sync the breadcrumb to match the actual scroll position
            const landedIdx = Math.max(0, Math.floor((body.scrollLeft) / COL_W_PX));
            const landedMonth = TIMELINE_MONTHS[Math.min(landedIdx, TIMELINE_MONTHS.length - 1)] || '';
            this._scrollVisibleYear   = landedMonth.split(' ')[1] || '';
            this._pendingScrollColIdx = null;
            this._scrollChainActive   = false;

            // If navigating to a sparkle, click it now that the timeline is in position
            if (this._pendingOpenSparkleId) {
                const pendingId = this._pendingOpenSparkleId;
                this._pendingOpenSparkleId = null;
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                setTimeout(() => {
                    const btn = this.template.querySelector(`[data-sug-id="${pendingId}"]`);
                    if (btn) btn.click();
                }, 120);
            }
        }, 100 + attempt * 100);
    }

    /* ── Sticky Contextual Breadcrumb ────────────────────────────── */
    get showBreadcrumb() { return this.isMonthlyMode || this.isDrillMode; }

    get scrollVisibleYear() {
        if (this._scrollVisibleYear) return this._scrollVisibleYear;
        // Default before any scroll: show the drilled year or current year
        return this.isDrillMode
            ? String(this.drillYear)
            : CURRENT_MONTH.split(' ')[1]; // e.g. '2026'
    }

    handleTimelineScroll(event) {
        if (!this.isMonthlyMode && !this.isDrillMode) return;
        const scrollLeft  = event.currentTarget.scrollLeft;
        const COL_W_PX    = 8.5 * 16;
        const MEMBER_W_PX = 12  * 16;
        // +0.5 col-width offset so we label the column whose centre is nearest the viewport left
        const colIdx = Math.max(0, Math.floor((scrollLeft - MEMBER_W_PX + COL_W_PX * 0.5) / COL_W_PX));
        // Both monthly and drill mode use the same 96-month column set
        const ms = TIMELINE_MONTHS[Math.min(colIdx, TIMELINE_MONTHS.length - 1)] || '';
        const label = ms.split(' ')[1] || ''; // show just the year e.g. '2022'
        if (label !== this._scrollVisibleYear) this._scrollVisibleYear = label;
    }

    get followVariant()  { return this.isFollowing ? 'success' : 'neutral'; }
    get followLabel()    { return this.isFollowing ? 'Following' : 'Follow'; }
    get followIconName() { return this.isFollowing ? 'utility:check' : 'utility:add'; }

    handleFollow()      { this.isFollowing = !this.isFollowing; }
    handleBackToList()  { navigate('/accounts'); }

    _fmt(value) {
        if (value == null) return '';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    }

    _formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    _fmtShort(value) {
        if (value == null) return '';
        if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
        if (value >= 1_000)     return `$${Math.round(value / 1_000)}K`;
        return `$${value}`;
    }

    _riskClass(risk) {
        if (risk === 'High')   return 'slds-text-color_error';
        if (risk === 'Medium') return 'c-text-warning';
        return '';
    }
}
