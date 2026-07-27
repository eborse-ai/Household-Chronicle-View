import { LightningElement, track } from 'lwc';
import { getCurrentRoute, navigate } from '../../../router';
import { getAccountById } from 'data/accounts';

/** Popover detail data keyed by event id */
const EVENT_DETAILS = {
    // ── Mark Reed — yearly ───────────────────────────────────────────
    e1:  { description: 'Onboarded Mark as a new client and stood up his first managed portfolio; captured initial goals, risk tolerance, and funding sources.', isShared: true,  sharedWith: 'Sara Reed', isCritical: false, date: 'Mar 2019',    membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed',                     cashFlowImpact: null, beneficiaries: null, actionTaken: 'Welcome call completed. Planning doc shared.', subject: 'Client Onboarding', startDateTime: 'Mar 15, 2019 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Mar 15, 2019 · 11:30 AM', whoName: 'Mark Reed · Sara Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Initial onboarding covering goals, risk tolerance, time horizon, and initial funding sources. IPS drafted.' },
    e2:  { description: 'Opened a joint taxable brokerage as the household\'s core managed portfolio, consolidating shared investable assets under advisory.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Apr 2020', membersAffected: 2, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: '$500/mo contribution', beneficiaries: 'Sara Reed (50%), Mark Reed (50%)', actionTaken: 'Account opened and funded.', openingDate: 'Apr 2020', totalOutstandingAmount: '$280,000', accountType: 'Taxable Brokerage', accountNumber: 'BRK-2020-4471', maturityDate: 'N/A', heldAway: 'No' },
    e3:  { description: 'Rebalanced the joint brokerage to target allocation after drift and reaffirmed long-term growth objectives.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Nov 2020', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Reviewed and updated investment allocations.', subject: 'Annual Review', startDateTime: 'Nov 10, 2020 · 10:00 AM', location: 'Video Call', endDateTime: 'Nov 10, 2020 · 11:00 AM', whoName: 'Mark Reed · Sara Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Portfolio rebalancing to target allocation. Joint brokerage drift corrected. Goals reaffirmed.' },
    e4:  { description: 'Established a .5K cash-reserve emergency fund (~3-6 months of expenses), completing the household\'s liquidity foundation.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Jan 2021', membersAffected: 2, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: '$18,000 milestone', beneficiaries: null, actionTaken: 'Goal milestone recorded.', openingDate: 'Jun 2021', totalOutstandingAmount: '$18,500', accountType: 'HYSA / Cash Reserve', accountNumber: 'SAV-2021-8832', maturityDate: 'N/A', heldAway: 'No' },
    e5:  { description: "Mark was promoted with a salary increase and a 4-year-vesting RSU grant, raising household income and introducing concentrated equity to plan around.", isShared: false, sharedWith: '', isCritical: false, date: 'Jul 2025', membersAffected: 1, status: 'Noted', aiInsight: "Salary increase creates an opportunity to boost retirement contributions and increase the car savings goal rate. Consider a Mega Backdoor Roth if the employer plan allows.", aiActionLabel: 'Review Contribution Strategy', members: 'Mark Reed', cashFlowImpact: '+$15K/yr income', beneficiaries: null, actionTaken: 'Income updated in plan.', sentimentInsights: [{ name: 'Mark Reed', role: 'Primary Client', keyword: 'Ambitious', insight: 'Motivated by milestones — will embrace complex strategies like Mega Backdoor Roth if given a clear step-by-step plan.' }], primaryPerson: 'Mark Reed', relatedPerson: '—', eventLocation: 'San Francisco, CA', eventDescription: 'Mark received a promotion to Senior Engineer with a $15K salary increase and a 4-year vesting RSU grant (~$160K total). Introduces concentrated tech-equity exposure to the household plan.', owner: 'James Parker, CFP' },
    e6:  { description: 'Focused on home-purchase readiness; modeled down-payment funding and timing. Mark flagged the RSU grant as a future liquidity source.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Oct 2022', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'All accounts reviewed. No changes required.', subject: 'Annual Review', startDateTime: 'Oct 12, 2022 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 12, 2022 · 11:00 AM', whoName: 'Mark Reed · Sara Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Home-purchase readiness discussion. Down-payment modeled. RSU grant noted as future liquidity source.' },
    e7:  { description: 'Purchased their first home (3-bed/2-bath single-family), shifting cash flow to a mortgage and reshaping savings capacity.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Aug 2023', membersAffected: 2, status: 'Completed', aiInsight: "New mortgage has not triggered a review of life insurance coverage or beneficiary updates. Recommend scheduling a protection review.", aiActionLabel: 'Schedule Protection Review', members: 'Mark · Sara Reed', cashFlowImpact: '$2,100/mo mortgage', beneficiaries: 'Not updated post-purchase', actionTaken: 'Home purchase recorded.', sentimentInsights: [{ name: 'Mark Reed', role: 'Primary Client', keyword: 'Pragmatic', insight: 'Equity-focused mindset; open to re-balancing towards mortgage paydown over aggressive investing.' }, { name: 'Sara Reed', role: 'Co-client', keyword: 'Security-driven', insight: 'Home ownership has heightened need for financial stability; insurance and emergency reserves are top of mind.' }], primaryPerson: 'Mark Reed', relatedPerson: 'Sara Reed', eventLocation: 'Austin, TX', eventDescription: 'First home purchase — 3-bed/2-bath single-family in Austin. Down payment funded from joint brokerage. Monthly mortgage of $2,100/mo began in August 2023. Beneficiaries not updated post-purchase.', owner: 'James Parker, CFP' },
    e8m: { description: 'Reviewed portfolio performance and confirmed no changes to goals or risk tolerance between annual reviews.', isShared: false, sharedWith: '', isCritical: false, date: 'Mar 2024', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Portfolio performance reviewed. No changes made.', subject: 'Mid-Year Check-in', startDateTime: 'Mar 14, 2024 · 2:00 PM', location: 'Phone', endDateTime: 'Mar 14, 2024 · 3:00 PM', whoName: 'Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Mid-cycle check-in. Portfolio performance reviewed. No changes to goals or risk tolerance.' },
    e8:  { description: "Opened an HSA under a high-deductible plan, used as a stealth retirement vehicle for triple-tax-advantaged growth.", isShared: false, sharedWith: '', isCritical: false, date: 'Feb 2024', membersAffected: 1, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: '$3,850/yr contribution (2024 limit)', beneficiaries: 'Sara Reed', actionTaken: 'Account opened. Payroll deduction set.', openingDate: 'Feb 2024', totalOutstandingAmount: '$9,200', accountType: 'Health Savings Account', accountNumber: 'HSA-2024-3319', maturityDate: 'N/A', heldAway: 'No' },
    e9:  { description: 'Couple raised upcoming family planning, prompting a forward look at life insurance, cash reserves, and future education funding.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Oct 2024', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Investment rebalancing recommended and executed.', subject: 'Annual Review', startDateTime: 'Oct 8, 2024 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 8, 2024 · 11:30 AM', whoName: 'Mark Reed · Sara Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Family planning discussion raised. Life insurance, reserves, and education funding reviewed for upcoming dependent.' },
    e10: { description: "Established a $45K new-car fund targeting 2027, funded from the joint brokerage; later at risk as a market dip pressured the funding source.", isShared: false, sharedWith: '', isCritical: true, date: 'Dec 2025', membersAffected: 1, status: 'At Risk', aiInsight: "The $45K car goal (target 2027) relies on brokerage growth. A recent market dip has put the timeline at risk — rebalance or adjust.", aiActionLabel: 'Review Goal', members: 'Mark Reed', cashFlowImpact: '$500/mo target savings', beneficiaries: null, actionTaken: 'Goal recorded. No adjustment made.', targetAmount: '$45,000', targetDate: 'Feb 2027', priority: 'High', goalType: 'Savings', actualAmount: '$18,500', estSuccess: '42%', startDate: 'Jan 2025', pace: 'Behind', todayPct: 50, linkedAccount: { name: 'Joint Brokerage', number: 'BRK-2020-4471', contributionAmount: '$18,500', availableBalance: '$261,500' }, competingGoals: [{ name: 'Home Purchase', amount: 'Not started', status: 'Pending', statusClass: 'c-ep-goal-competing-status' }] },
    e11: { description: "Emma Reed was born, the couple's first child, triggering a life-insurance review, a new education-funding goal, and updated beneficiaries.", isShared: true, sharedWith: 'Sara Reed · Emma Reed', isCritical: true, date: 'Apr 14, 2026', membersAffected: 3, status: 'No plan update', aiInsight: "Emma was born in April 2026 — no 529 plan has been opened. Starting now maximises compounding over 17+ years before college.", aiActionLabel: 'Start 529 Plan', members: 'Mark · Sara · Emma Reed', cashFlowImpact: '$2,800/mo starting Aug 2026', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record', primaryPerson: 'Mark Reed', relatedPerson: 'Sara Reed · Emma Reed', eventLocation: 'Austin, TX', eventDescription: "Emma Reed was born on April 14, 2026 — the couple's first child. Event triggered a life-insurance review, a new education-funding goal, and the need to update beneficiaries across all accounts. No 529 plan has been opened.", owner: 'James Parker, CFP' },
    e12: { description: 'Purchased a term-life policy to protect the family\'s income after Emma\'s birth, closing the protection gap from the new dependent.', isShared: false, sharedWith: '', isCritical: false, date: 'Jun 2026', membersAffected: 1, status: 'Active', aiInsight: "Sara does not have equivalent term coverage. Recommend evaluating a matching policy for Sara given the shared income and dependent care obligations.", aiActionLabel: "Review Sara's Coverage", members: 'Mark Reed', cashFlowImpact: '$85/mo premium', beneficiaries: 'Sara Reed (primary), Emma Reed (contingent)', actionTaken: 'Policy purchased and documented.', openingDate: 'Jun 2026', totalOutstandingAmount: '$1,000,000', accountType: '20-Year Term Life', accountNumber: 'TL-2026-7754', maturityDate: 'Jun 2046', heldAway: 'No' },
    e13: { description: 'Couple raised upcoming family planning, prompting a forward look at life insurance, cash reserves, and future education funding.', isShared: false, sharedWith: '', isCritical: false, date: 'Oct 2025', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Review completed.', subject: 'Annual Review', startDateTime: 'Oct 25, 2025 · 10:00 AM', location: 'Video Call', endDateTime: 'Oct 25, 2025 · 11:00 AM', whoName: 'Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Couple raised upcoming family planning. Life insurance, cash reserves, and future education funding reviewed.' },
    e14: { description: 'Reviewed performance and congratulated Mark on baby Emma; Sara absent again. Confirmed follow-ups on insurance and education funding.', isShared: false, sharedWith: '', isCritical: false, date: 'Jun 2026', membersAffected: 1, status: 'Scheduled', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Meeting invite sent.', subject: 'Mid-Year Check-in', startDateTime: 'Jun 15, 2026 · 2:00 PM', location: 'Video Call', endDateTime: 'Jun 15, 2026 · 3:00 PM', whoName: 'Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Mid-year performance review. Congratulated Mark on Emma. Follow-ups confirmed on insurance and education funding. Sara absent.' },
    e15: { description: 'Predicted vesting of Tranche 1 (~$40K net) from the 4-year grant noted in the Oct-2022 review; plan for withholding and redeployment.', isShared: false, sharedWith: '', isCritical: true, date: 'Jan 2027', membersAffected: 1, status: 'Predicted', aiInsight: "Mark's 4-year RSU grant (flagged in Oct 2022 review) is expected to vest in Feb 2027 (~$40K net). Plan now for tax-efficient reinvestment.", aiActionLabel: 'Model RSU Reinvestment', members: 'Mark Reed', cashFlowImpact: 'Est. $18,000 gross (variable)', beneficiaries: null, actionTaken: 'None — future event' },
    // ── Sara Reed — yearly ───────────────────────────────────────────
    e16: { description: 'Rebalanced the joint brokerage to target allocation after drift and reaffirmed long-term growth objectives.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Nov 2020', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Financial snapshot documented.', subject: 'Annual Review', startDateTime: 'Nov 10, 2020 · 10:00 AM', location: 'Video Call', endDateTime: 'Nov 10, 2020 · 11:00 AM', whoName: 'Sara Reed · Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Portfolio rebalancing to target allocation. Joint brokerage drift corrected. Goals reaffirmed.' },
    e17: { description: "Opened a Roth IRA for Sara to add tax-free retirement growth and diversify the household's tax exposure.", isShared: false, sharedWith: '', isCritical: false, date: 'Apr 2025', membersAffected: 1, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Sara Reed', cashFlowImpact: '$500/mo contribution', beneficiaries: 'Mark Reed', actionTaken: 'Account opened and max funded.', openingDate: 'Apr 2025', totalOutstandingAmount: '$31,400', accountType: 'Roth IRA', accountNumber: 'IRA-2022-5581', maturityDate: 'N/A', heldAway: 'No' },
    e18: { description: 'Focused on home-purchase readiness; modeled down-payment funding and timing. Mark flagged the RSU grant as a future liquidity source.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Oct 2022', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Goals updated. No allocation changes needed.', subject: 'Annual Review', startDateTime: 'Oct 12, 2022 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 12, 2022 · 11:00 AM', whoName: 'Sara Reed · Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Home-purchase readiness discussion. Down-payment modeled. RSU grant noted as future liquidity source.' },
    e19: { description: 'Purchased their first home (3-bed/2-bath single-family), shifting cash flow to a mortgage and reshaping savings capacity.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Aug 2023', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: '$2,100/mo mortgage', beneficiaries: null, actionTaken: 'Home purchase recorded in plan.', primaryPerson: 'Sara Reed', relatedPerson: 'Mark Reed', eventLocation: 'Austin, TX', eventDescription: 'First home purchase — 3-bed/2-bath single-family in Austin. Down payment funded from joint brokerage. Monthly mortgage of $2,100/mo began in August 2023.', owner: 'James Parker, CFP' },
    e20: { description: 'Couple raised upcoming family planning, prompting a forward look at life insurance, cash reserves, and future education funding.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Oct 2024', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'All goals on track at time of review.', subject: 'Annual Review', startDateTime: 'Oct 8, 2024 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 8, 2024 · 11:30 AM', whoName: 'Sara Reed · Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Family planning discussion raised. Life insurance, reserves, and education funding reviewed for upcoming dependent.' },
    e21: { description: 'Established a $45K new-car fund targeting 2027, funded from the joint brokerage; later at risk as a market dip pressured the funding source.', isShared: false, sharedWith: '', isCritical: true, date: 'Dec 2025', membersAffected: 1, status: 'At Risk', aiInsight: "The $45K car goal (target 2027) relies on brokerage growth. A recent market dip has put the timeline at risk — rebalance or adjust.", aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: '$500/mo target savings', beneficiaries: null, actionTaken: 'Goal recorded.', targetAmount: '$45,000', targetDate: 'Feb 2027', priority: 'High', goalType: 'Savings', actualAmount: '$18,500', estSuccess: '42%', startDate: 'Jan 2025', pace: 'Behind', todayPct: 50, linkedAccount: { name: 'Joint Brokerage', number: 'BRK-2020-4471', contributionAmount: '$18,500', availableBalance: '$261,500' }, competingGoals: [{ name: 'Home Purchase', amount: 'Not started', status: 'Pending', statusClass: 'c-ep-goal-competing-status' }] },
    e22: { description: "Emma Reed was born, the couple's first child, triggering a life-insurance review, a new education-funding goal, and updated beneficiaries.", isShared: true, sharedWith: 'Mark Reed · Emma Reed', isCritical: true, date: 'Apr 14, 2026', membersAffected: 3, status: 'No plan update', aiInsight: "Emma was born in April 2026 — no 529 plan has been opened. Starting now maximises compounding over 17+ years before college.", aiActionLabel: 'Start 529 Plan', members: 'Sara · Mark · Emma Reed', cashFlowImpact: '–$4,200/mo (parental leave)', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record', primaryPerson: 'Sara Reed', relatedPerson: 'Mark Reed · Emma Reed', eventLocation: 'Austin, TX', eventDescription: "Emma Reed was born on April 14, 2026 — the couple's first child. Sara entered parental leave. Event triggered life-insurance review and the need to update beneficiaries. No 529 plan has been opened.", owner: 'James Parker, CFP' },
    // ── Emma Reed — yearly ───────────────────────────────────────────
    e23: { description: 'Emma Reed was born, the couple\'s first child, triggering a life-insurance review, a new education-funding goal, and updated beneficiaries.', isShared: true, sharedWith: 'Mark Reed · Sara Reed', isCritical: true, date: 'Apr 14, 2026', membersAffected: 3, status: 'Noted', aiInsight: "Emma was born in April 2026 — no 529 plan has been opened. Starting now maximises compounding over 17+ years before college.", aiActionLabel: 'Start 529 Plan', members: 'Emma · Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Emma added as household dependent.', primaryPerson: 'Emma Reed', relatedPerson: 'Mark Reed · Sara Reed', eventLocation: 'Austin, TX', eventDescription: 'Emma Reed was born on April 14, 2026 and added as a household dependent. Triggers life-insurance review, education-funding goal, and beneficiary updates across all household accounts.', owner: 'James Parker, CFP' },
    e24: { description: "Projected college-funding target as Emma turns 18 (~$300K); anchors a long-horizon education-savings goal to fund from today forward.", isShared: false, sharedWith: '', isCritical: true, date: '2027 (predicted)', membersAffected: 1, status: 'Predicted', aiInsight: "Emma was born in April 2026 — no 529 plan has been opened. Starting now maximises compounding over 17+ years before college.", aiActionLabel: 'Start 529 Plan', members: 'Emma Reed', cashFlowImpact: 'Est. $200/mo contribution', beneficiaries: null, actionTaken: 'Not yet initiated', targetAmount: '$300,000', targetDate: 'Sep 2043', priority: 'High', goalType: 'Education', actualAmount: '$0', estSuccess: 'Not started', startDate: '2027 (planned)', pace: 'Not started', todayPct: 0, linkedAccount: { name: 'Joint Brokerage', number: 'BRK-2020-4471', contributionAmount: '$0', availableBalance: '$261,500' }, competingGoals: [{ name: 'New Car Fund', amount: '$18,500 / $45,000', status: 'At Risk', statusClass: 'c-ep-goal-competing-status c-ep-goal-competing-status_risk' }] },
    // ── Monthly events — Mark Reed (me1a … me1l are historical events before me1) ──
    me1a: { description: 'Onboarded Mark as a new client and stood up his first managed portfolio; captured initial goals, risk tolerance, and funding sources.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Mar 2019', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Welcome call completed. Planning doc shared.', subject: 'Client Onboarding', startDateTime: 'Mar 15, 2019 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Mar 15, 2019 · 11:30 AM', whoName: 'Mark Reed · Sara Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Initial onboarding covering goals, risk tolerance, time horizon, and initial funding sources. IPS drafted.' },
    me1b: { description: 'Opened a joint taxable brokerage as the household\'s core managed portfolio, consolidating shared investable assets under advisory.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Apr 2020', membersAffected: 2, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: '$500/mo contribution', beneficiaries: 'Sara Reed (50%), Mark Reed (50%)', actionTaken: 'Account opened and funded.', openingDate: 'Apr 2020', totalOutstandingAmount: '$280,000', accountType: 'Taxable Brokerage', accountNumber: 'BRK-2020-4471', maturityDate: 'N/A', heldAway: 'No' },
    me1c: { description: 'Rebalanced the joint brokerage to target allocation after drift and reaffirmed long-term growth objectives.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Nov 2020', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Reviewed and updated investment allocations.', subject: 'Annual Review', startDateTime: 'Nov 10, 2020 · 10:00 AM', location: 'Video Call', endDateTime: 'Nov 10, 2020 · 11:00 AM', whoName: 'Mark Reed · Sara Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Portfolio rebalancing to target allocation. Joint brokerage drift corrected. Goals reaffirmed.' },
    me1d: { description: 'Established a .5K cash-reserve emergency fund (~3-6 months of expenses), completing the household\'s liquidity foundation.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Jun 2021', membersAffected: 2, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: '$18,000 milestone', beneficiaries: null, actionTaken: 'Goal milestone recorded.', openingDate: 'Jun 2021', totalOutstandingAmount: '$18,500', accountType: 'HYSA / Cash Reserve', accountNumber: 'SAV-2021-8832', maturityDate: 'N/A', heldAway: 'No' },
    me1e: { description: "Mark was promoted with a salary increase and a 4-year-vesting RSU grant, raising household income and introducing concentrated equity to plan around.", isShared: false, sharedWith: '', isCritical: false, date: 'Jul 2025', membersAffected: 1, status: 'Noted', aiInsight: "Salary increase creates an opportunity to boost retirement contributions and increase the car savings goal rate. Consider a Mega Backdoor Roth if the employer plan allows.", aiActionLabel: 'Review Contribution Strategy', members: 'Mark Reed', cashFlowImpact: '+$15K/yr income', beneficiaries: null, actionTaken: 'Income updated in plan.', sentimentInsights: [{ name: 'Mark Reed', role: 'Primary Client', keyword: 'Ambitious', insight: 'Motivated by milestones — will embrace complex strategies like Mega Backdoor Roth if given a clear step-by-step plan.' }], primaryPerson: 'Mark Reed', relatedPerson: '—', eventLocation: 'San Francisco, CA', eventDescription: 'Mark received a promotion to Senior Engineer with a $15K salary increase and a 4-year vesting RSU grant (~$160K total). Introduces concentrated tech-equity exposure to the household plan.', owner: 'James Parker, CFP' },
    me1f: { description: 'Focused on home-purchase readiness; modeled down-payment funding and timing. Mark flagged the RSU grant as a future liquidity source.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Oct 2022', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'All accounts reviewed. No changes required.', subject: 'Annual Review', startDateTime: 'Oct 12, 2022 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 12, 2022 · 11:00 AM', whoName: 'Mark Reed · Sara Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Home-purchase readiness discussion. Down-payment modeled. RSU grant noted as future liquidity source.' },
    me1g: { description: 'Purchased their first home (3-bed/2-bath single-family), shifting cash flow to a mortgage and reshaping savings capacity.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Aug 2023', membersAffected: 2, status: 'Completed', aiInsight: "New mortgage has not triggered a review of life insurance coverage or beneficiary updates. Recommend scheduling a protection review.", aiActionLabel: 'Schedule Protection Review', members: 'Mark · Sara Reed', cashFlowImpact: '$2,100/mo mortgage', beneficiaries: 'Not updated post-purchase', actionTaken: 'Home purchase recorded.', sentimentInsights: [{ name: 'Mark Reed', role: 'Primary Client', keyword: 'Pragmatic', insight: 'Equity-focused mindset; open to re-balancing towards mortgage paydown over aggressive investing.' }, { name: 'Sara Reed', role: 'Co-client', keyword: 'Security-driven', insight: 'Home ownership has heightened need for financial stability; insurance and emergency reserves are top of mind.' }], primaryPerson: 'Mark Reed', relatedPerson: 'Sara Reed', eventLocation: 'Austin, TX', eventDescription: 'First home purchase — 3-bed/2-bath single-family in Austin. Down payment funded from joint brokerage. Monthly mortgage of $2,100/mo began in August 2023. Beneficiaries not updated post-purchase.', owner: 'James Parker, CFP' },
    me1h: { description: "Opened an HSA under a high-deductible plan, used as a stealth retirement vehicle for triple-tax-advantaged growth.", isShared: false, sharedWith: '', isCritical: false, date: 'Feb 2024', membersAffected: 1, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: '$3,850/yr contribution (2024 limit)', beneficiaries: 'Sara Reed', actionTaken: 'Account opened. Payroll deduction set.', openingDate: 'Feb 2024', totalOutstandingAmount: '$9,200', accountType: 'Health Savings Account', accountNumber: 'HSA-2024-3319', maturityDate: 'N/A', heldAway: 'No' },
    me1i: { description: 'Couple raised upcoming family planning, prompting a forward look at life insurance, cash reserves, and future education funding.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Oct 2024', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Investment rebalancing recommended and executed.', subject: 'Annual Review', startDateTime: 'Oct 8, 2024 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 8, 2024 · 11:30 AM', whoName: 'Mark Reed · Sara Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Family planning discussion raised. Life insurance, reserves, and education funding reviewed for upcoming dependent.' },
    me1j: { description: "Established a $45K new-car fund targeting 2027, funded from the joint brokerage; later at risk as a market dip pressured the funding source.", isShared: false, sharedWith: '', isCritical: true, date: 'Dec 2025', membersAffected: 1, status: 'At Risk', aiInsight: "The $45K car goal (target 2027) relies on brokerage growth. A recent market dip has put the timeline at risk — rebalance or adjust.", aiActionLabel: 'Review Goal', members: 'Mark Reed', cashFlowImpact: '$500/mo target savings', beneficiaries: null, actionTaken: 'Goal recorded. No adjustment made.', targetAmount: '$45,000', targetDate: 'Feb 2027', priority: 'High', goalType: 'Savings', actualAmount: '$18,500', estSuccess: '42%', startDate: 'Jan 2025', pace: 'Behind', todayPct: 50, linkedAccount: { name: 'Joint Brokerage', number: 'BRK-2020-4471', contributionAmount: '$18,500', availableBalance: '$261,500' }, competingGoals: [{ name: 'Home Purchase', amount: 'Not started', status: 'Pending', statusClass: 'c-ep-goal-competing-status' }] },
    me1k: { description: "Emma Reed was born, the couple's first child, triggering a life-insurance review, a new education-funding goal, and updated beneficiaries.", isShared: true, sharedWith: 'Sara Reed · Emma Reed', isCritical: true, date: 'Apr 14, 2026', membersAffected: 3, status: 'No plan update', aiInsight: "Emma was born in April 2026 — no 529 plan has been opened. Starting now maximises compounding over 17+ years before college.", aiActionLabel: 'Start 529 Plan', members: 'Mark · Sara · Emma Reed', cashFlowImpact: '$2,800/mo starting Aug 2026', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record', primaryPerson: 'Mark Reed', relatedPerson: 'Sara Reed · Emma Reed', eventLocation: 'Austin, TX', eventDescription: "Emma Reed was born on April 14, 2026 — the couple's first child. Event triggered a life-insurance review, a new education-funding goal, and the need to update beneficiaries across all accounts. No 529 plan has been opened.", owner: 'James Parker, CFP' },
    me1l: { description: 'Purchased a term-life policy to protect the family\'s income after Emma\'s birth, closing the protection gap from the new dependent.', isShared: false, sharedWith: '', isCritical: false, date: 'Jun 2026', membersAffected: 1, status: 'Active', aiInsight: "Sara does not have equivalent term coverage. Recommend evaluating a matching policy for Sara given the shared income and dependent care obligations.", aiActionLabel: "Review Sara's Coverage", members: 'Mark Reed', cashFlowImpact: '$85/mo premium', beneficiaries: 'Sara Reed (primary), Emma Reed (contingent)', actionTaken: 'Policy purchased and documented.', openingDate: 'Jun 2026', totalOutstandingAmount: '$1,000,000', accountType: '20-Year Term Life', accountNumber: 'TL-2026-7754', maturityDate: 'Jun 2046', heldAway: 'No' },
    me1: { description: "Mark took 4 weeks of paternity leave following Emma's birth. Employer provides 4 weeks of paid leave.", isShared: false, sharedWith: '', isCritical: false, date: 'Aug 2025', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: 'No income impact (paid leave)', beneficiaries: null, actionTaken: 'Leave recorded.' },
    me2: { description: 'Couple raised upcoming family planning, prompting a forward look at life insurance, cash reserves, and future education funding.', isShared: false, sharedWith: '', isCritical: false, date: 'Oct 2025', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Review completed.', subject: 'Annual Review', startDateTime: 'Oct 25, 2025 · 10:00 AM', location: 'Video Call', endDateTime: 'Oct 25, 2025 · 11:00 AM', whoName: 'Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Couple raised upcoming family planning. Life insurance, cash reserves, and future education funding reviewed.' },
    me3: { description: 'Year-end tax and financial planning session to review contribution limits, RSU vest schedule, and portfolio rebalancing.', isShared: false, sharedWith: '', isCritical: false, date: 'Nov 2025', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Year-end contributions maximised.', subject: 'Year-End Tax Planning', startDateTime: 'Nov 15, 2025 · 2:00 PM', location: 'Video Call', endDateTime: 'Nov 15, 2025 · 3:00 PM', whoName: 'Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Reviewed 401(k) and IRA contribution limits, RSU vest schedule, and year-end portfolio rebalancing. All contributions maximised.' },
    me4: { description: 'Mark received a second promotion, increasing his annual compensation by ~$20K and accelerating RSU vest schedule.', isShared: false, sharedWith: '', isCritical: false, date: 'Mar 2026', membersAffected: 1, status: 'Noted', aiInsight: "New compensation level may push Mark into a higher marginal tax bracket. Review withholding elections and consider increasing 401(k) contributions to offset.", aiActionLabel: 'Review Tax Strategy', members: 'Mark Reed', cashFlowImpact: '+$20K/yr income', beneficiaries: null, actionTaken: 'Compensation update noted.' },
    me5: { description: 'Emma started full-time daycare. Monthly cost of $2,800 begins creating a sustained impact on household cash flow.', isShared: false, sharedWith: '', isCritical: true, date: 'May 2026', membersAffected: 1, status: 'Active', aiInsight: "Daycare cost of $2,800/mo is significant. A DCFSA election could provide up to $5,000 in pre-tax relief annually. Open enrollment may be available at next benefit cycle.", aiActionLabel: 'Explore DCFSA Options', members: 'Mark Reed', cashFlowImpact: '$2,800/mo daycare', beneficiaries: null, actionTaken: 'None on record' },
    me6: { description: 'Reviewed performance and congratulated Mark on baby Emma; Sara absent again. Confirmed follow-ups on insurance and education funding.', isShared: false, sharedWith: '', isCritical: false, date: 'Aug 2026', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Meeting invite sent.', subject: 'Mid-Year Check-in', startDateTime: 'Aug 15, 2026 · 2:00 PM', location: 'Video Call', endDateTime: 'Aug 15, 2026 · 3:00 PM', whoName: 'Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Mid-year performance review. Follow-ups on insurance coverage and 529 education funding to be confirmed.' },
    e_mc26: { description: 'Reviewed portfolio performance and confirmed no changes to goals or risk tolerance between annual reviews.', isShared: false, sharedWith: '', isCritical: false, date: 'Mar 2026', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'No changes required.', subject: 'Mid-Year Check-in', startDateTime: 'Mar 15, 2026 · 2:00 PM', location: 'Video Call', endDateTime: 'Mar 15, 2026 · 3:00 PM', whoName: 'Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Reviewed portfolio performance and confirmed no changes to goals or risk tolerance between annual reviews.' },
    e_ar26: { description: 'Scheduled annual review to bring Sara into the planning conversation and formally address 529 college funding and updated protection following Emma\'s birth.', isShared: false, sharedWith: '', isCritical: false, date: 'Oct 2026', membersAffected: 1, status: 'Scheduled', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Meeting invite sent.', subject: 'Annual Review', startDateTime: 'Oct 14, 2026 · 10:00 AM', location: '123 Maple Street, Apt 4B, Springfield, IL 62701', endDateTime: 'Oct 14, 2026 · 11:30 AM', whoName: 'Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Scheduled annual review. Agenda: bring Sara into the planning conversation, address 529 college funding for Emma, and update protection coverage post-birth.' },
    me7a: { description: 'Rebalanced the joint brokerage to target allocation after drift and reaffirmed long-term growth objectives.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Nov 2020', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Financial snapshot documented.', subject: 'Annual Review', startDateTime: 'Nov 10, 2020 · 10:00 AM', location: 'Video Call', endDateTime: 'Nov 10, 2020 · 11:00 AM', whoName: 'Sara Reed · Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Portfolio rebalancing to target allocation. Joint brokerage drift corrected. Goals reaffirmed.' },
    me7b: { description: "Opened a Roth IRA for Sara to add tax-free retirement growth and diversify the household's tax exposure.", isShared: false, sharedWith: '', isCritical: false, date: 'Apr 2025', membersAffected: 1, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Sara Reed', cashFlowImpact: '$500/mo contribution', beneficiaries: 'Mark Reed', actionTaken: 'Account opened and max funded.', openingDate: 'Apr 2025', totalOutstandingAmount: '$31,400', accountType: 'Roth IRA', accountNumber: 'IRA-2022-5581', maturityDate: 'N/A', heldAway: 'No' },
    me7c: { description: 'Focused on home-purchase readiness; modeled down-payment funding and timing. Mark flagged the RSU grant as a future liquidity source.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Oct 2022', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Goals updated. No allocation changes needed.', subject: 'Annual Review', startDateTime: 'Oct 12, 2022 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 12, 2022 · 11:00 AM', whoName: 'Sara Reed · Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Home-purchase readiness discussion. Down-payment modeled. RSU grant noted as future liquidity source.' },
    me7d: { description: 'Purchased their first home (3-bed/2-bath single-family), shifting cash flow to a mortgage and reshaping savings capacity.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Aug 2023', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: '$2,100/mo mortgage', beneficiaries: null, actionTaken: 'Home purchase recorded in plan.', primaryPerson: 'Sara Reed', relatedPerson: 'Mark Reed', eventLocation: 'Austin, TX', eventDescription: 'First home purchase — 3-bed/2-bath single-family in Austin. Down payment funded from joint brokerage. Monthly mortgage of $2,100/mo began in August 2023.', owner: 'James Parker, CFP' },
    me7e: { description: 'Couple raised upcoming family planning, prompting a forward look at life insurance, cash reserves, and future education funding.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Oct 2024', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'All goals on track at time of review.', subject: 'Annual Review', startDateTime: 'Oct 8, 2024 · 10:00 AM', location: 'Office — 123 Market St, SF', endDateTime: 'Oct 8, 2024 · 11:30 AM', whoName: 'Sara Reed · Mark Reed', relatedTo: 'Reed Household', showTimeAs: 'Busy', engagementNotes: 'Family planning discussion raised. Life insurance, reserves, and education funding reviewed for upcoming dependent.' },
    me7f: { description: "Established a $45K new-car fund targeting 2027, funded from the joint brokerage; later at risk as a market dip pressured the funding source.", isShared: false, sharedWith: '', isCritical: true, date: 'Dec 2025', membersAffected: 1, status: 'At Risk', aiInsight: "The $45K car goal (target 2027) relies on brokerage growth. A recent market dip has put the timeline at risk — rebalance or adjust.", aiActionLabel: 'Review Goal', members: 'Mark Reed', cashFlowImpact: '$500/mo target savings', beneficiaries: null, actionTaken: 'Goal recorded.', targetAmount: '$45,000', targetDate: 'Feb 2027', priority: 'High', goalType: 'Savings', actualAmount: '$18,500', estSuccess: '42%', startDate: 'Jan 2025', pace: 'Behind', todayPct: 50, linkedAccount: { name: 'Joint Brokerage', number: 'BRK-2020-4471', contributionAmount: '$18,500', availableBalance: '$261,500' }, competingGoals: [{ name: 'Home Purchase', amount: 'Not started', status: 'Pending', statusClass: 'c-ep-goal-competing-status' }] },
    me7g: { description: "Emma Reed was born, the couple's first child, triggering a life-insurance review, a new education-funding goal, and updated beneficiaries.", isShared: true, sharedWith: 'Mark Reed · Emma Reed', isCritical: true, date: 'Apr 14, 2026', membersAffected: 3, status: 'No plan update', aiInsight: "Emma was born in April 2026 — no 529 plan has been opened. Starting now maximises compounding over 17+ years before college.", aiActionLabel: 'Start 529 Plan', members: 'Sara · Mark · Emma Reed', cashFlowImpact: '–$4,200/mo (parental leave)', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record', primaryPerson: 'Sara Reed', relatedPerson: 'Mark Reed · Emma Reed', eventLocation: 'Austin, TX', eventDescription: "Emma Reed was born on April 14, 2026 — the couple's first child. Sara entered parental leave. Event triggered life-insurance review and the need to update beneficiaries. No 529 plan has been opened.", owner: 'James Parker, CFP' },
    me7h: { description: "Sara's parental leave began April 14, 2026, following Emma's birth. Employer provides 16 weeks of paid parental leave.", isShared: false, sharedWith: '', isCritical: false, date: 'Apr 2025', membersAffected: 1, status: 'Active', aiInsight: "Maternity leave reduces household cash flow by ~$4,200/mo. No emergency reserve drawdown plan has been initiated. Daycare costs of $2,800/mo will begin in approximately 6 months.", aiActionLabel: 'Review Cash-Flow Plan', members: 'Sara Reed', cashFlowImpact: '–$4,200/mo (partial income reduction)', beneficiaries: null, actionTaken: 'Leave period recorded. No cash-flow plan initiated.' },
    me7: { description: "Emma Reed born. Sara enters maternity leave immediately post-delivery. Household income reduced during leave period.", isShared: true, sharedWith: 'Mark Reed · Emma Reed', isCritical: true, date: 'Aug 2025', membersAffected: 3, status: 'No plan update', aiInsight: "Sara's maternity leave reduces household income. No cash-flow plan or short-term reallocation has been initiated. Daycare costs will begin in ~6 months.", aiActionLabel: 'Review Cash-Flow Impact', members: 'Sara · Mark · Emma Reed', cashFlowImpact: '–$4,200/mo (maternity leave)', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record' },
    me8: { description: "Sara returned to work full-time after 10 months of maternity leave, restoring household income to pre-birth levels.", isShared: false, sharedWith: '', isCritical: false, date: 'Jun 2026', membersAffected: 1, status: 'Completed', aiInsight: "Sara's return to work restores household income. This is a good trigger to revisit the car goal timeline, 529 contributions, and Roth IRA funding for the year.", aiActionLabel: 'Revisit Household Plan', members: 'Sara Reed', cashFlowImpact: '+$4,200/mo income restored', beneficiaries: null, actionTaken: 'None on record' },
    me9a: { description: 'Emma Reed was born, the couple\'s first child, triggering a life-insurance review, a new education-funding goal, and updated beneficiaries.', isShared: true, sharedWith: 'Mark Reed · Sara Reed', isCritical: true, date: 'Apr 14, 2026', membersAffected: 3, status: 'Noted', aiInsight: "Emma was born in April 2026 — no 529 plan has been opened. Starting now maximises compounding over 17+ years before college.", aiActionLabel: 'Start 529 Plan', members: 'Emma · Mark · Sara Reed', cashFlowImpact: null, beneficiaries: 'Not yet designated', actionTaken: 'Emma added as household dependent.', primaryPerson: 'Emma Reed', relatedPerson: 'Mark Reed · Sara Reed', eventLocation: 'Austin, TX', eventDescription: 'Emma Reed was born on April 14, 2026 and added as a household dependent. Triggers life-insurance review, education-funding goal, and beneficiary updates across all household accounts.', owner: 'James Parker, CFP' },
    me9: { description: "Emma's 1st birthday milestone. No formal planning event, but serves as a reminder to initiate 529 funding and update beneficiaries.", isShared: true, sharedWith: 'Mark Reed · Sara Reed', isCritical: false, date: 'Apr 2026', membersAffected: 3, status: 'Noted', aiInsight: "Emma was born in April 2026 — no 529 plan has been opened. Starting now maximises compounding over 17+ years before college.", aiActionLabel: 'Start 529 Plan', members: 'Emma · Mark · Sara Reed', cashFlowImpact: null, beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record' },
};

/** Per-account enrichment data keyed by account id */
const ENRICHMENT = {
    a9: {
        accountId: 'RH-2026-009',
        segment: 'Emerging',
        totalAUM: 280000,
        liabilities: 195000,
        risk: 'Medium',
        clientSince: 'Mar 2019',
        openAccounts: 3,
        taxExposure: '$6K Capital Gains',
        primaryMember: 'Mark Reed',
        primaryMemberEmail: 'mark.reed@gmail.com',
        clientSummary: {
            lastUpdate: 'Last update at 11:30 PM by Agentforce.',
            summary: 'Emerging household focused on family protection and wealth accumulation, with a new-parent life event driving planning priorities.',
            whatChanged: "Emma born Apr 2026; term-life purchased shortly after; 529 plan not yet opened; brokerage account down ~4% MoM; Sara absent from last two annual reviews.",
            whyItMatters: 'Mid-year review is a high-value opportunity to close the 529 funding gap, re-engage Sara as a co-client, and reassess the $45K new-car goal given the recent market dip.',
            keyDataPoints: [
                'AUM: $280K (–4% MoM)',
                'Wallet Share and Trend (MoM): Est. 38%',
                'Protection Gap: Term-life added, 529 missing',
                'New-Car Goal: $45K target 2027 – At Risk',
                'Relationship Health: Mark-only engagement',
            ],
            sources: 'Insights synthesized from CRM activity logs, account statements, and internal planning notes.',
        },
        agenticSummary: "Last 12 months: The household's focus shifted dramatically with Emma's birth in April 2026. Mark purchased term-life insurance shortly after, but gaps remain: no 529 plan has been opened for Emma, and protection planning hasn't been fully updated. Engagement has been Mark-only — Sara has been absent from the last two annual reviews — and the new-car goal is now at risk from a recent market dip.",
        agenticImpact: "The upcoming mid-year review is a high-value opportunity to address college funding for Emma, bring Sara into the planning conversation, and reassess the new-car goal timeline given the recent brokerage dip.",
        agenticSummaryAllTime: "All time (Mar 2019 – Jul 2026): The Reed household has grown from a $15K portfolio at onboarding to $280K AUM — a 17× increase driven by Mark's career progression and disciplined savings. Key milestones include joint brokerage setup (2020), emergency fund completion (2021), home purchase (2023), and Emma's birth (2026). The relationship has narrowed to Mark-only engagement since 2024; Sara has been absent from the last two annual reviews. The new-car goal ($45K, target 2027) is now at risk following a ~4% brokerage dip.",
        agenticImpactAllTime: "The 7-year relationship provides a strong foundation for a comprehensive household financial plan review. Addressing the post-birth planning gaps — 529, beneficiary updates, Sara re-engagement — before the next major life phase will be critical to sustaining long-term growth and household alignment.",
        nextBestActions: [],
        meetings: [
            {
                id: 'mtg1',
                title: 'Annual Review — Mark Reed',
                datetime: 'Oct 25, 2025 · 10:00 AM',
                description: 'Completed with Mark only. Sara absent for the second consecutive year. Key gaps — 529 funding, beneficiary updates — remain unaddressed.',
                status: 'Completed',
                statusClass: 'c-mtg-badge c-mtg-badge_complete',
                cardClass: 'c-mtg-item',
            },
            {
                id: 'mtg2',
                title: 'Year-End Tax Planning',
                datetime: 'Nov 15, 2025 · 2:00 PM',
                description: 'Reviewed contribution limits, RSU vest schedule, and portfolio rebalancing. Year-end contributions maximised.',
                status: 'Completed',
                statusClass: 'c-mtg-badge c-mtg-badge_complete',
                cardClass: 'c-mtg-item',
            },
            {
                id: 'mtg3',
                title: 'Mid-Year Check-in',
                datetime: 'Jun 15, 2026 · 11:00 AM',
                description: 'Review portfolio performance, 529 plan progress, daycare DCFSA options, and car goal timeline given recent market dip.',
                status: 'Prep: 25%',
                statusClass: 'c-mtg-badge c-mtg-badge_prep',
                cardClass: 'c-mtg-item',
            },
            {
                id: 'mtg4',
                title: '1:1 with Sara Reed',
                datetime: 'TBD',
                description: 'Dedicated session focused on Sara\'s priorities: income continuity, insurance coverage gaps, and re-engagement as a co-client.',
                status: 'Not Booked',
                statusClass: 'c-mtg-badge c-mtg-badge_notbooked',
                cardClass: 'c-mtg-item',
            },
        ],
        highlights: [
            {
                id: 'h1',
                badgeLabel: 'Gap',
                badgeClass: 'c-badge c-badge_gap',
                category: 'Life Event Gaps',
                title: "Open 529 Savings Plan for Emma",
                description: "Emma was born in April 2026 — no 529 plan has been opened. Starting now maximises compounding over 17+ years before college.",
                actionLabel: 'Start 529 Plan',
                timelineEventId: 'e23',   // Born life-event pill (Emma Reed row, Apr 2026)
                hideFromAlerts: true,
            },
            {
                id: 'h2',
                badgeLabel: 'Opportunity',
                badgeClass: 'c-badge c-badge_opportunity',
                category: 'Relationship Health',
                title: "Engage Sara in the Planning Conversation",
                description: "Sara has been absent from the last two annual reviews (2025, 2026). A dedicated 1:1 can re-anchor her as an active co-client.",
                actionLabel: 'Create Meeting',
                timelineEventId: 'e14',   // Mid-Year Review Jun 2026 (Mark Reed row)
                hideFromAlerts: true,
            },
            {
                id: 'h3',
                badgeLabel: 'Predicted',
                badgeClass: 'c-badge c-badge_predicted',
                category: 'Generational Wealth Readiness',
                title: "RSU Vesting — Tax & Investment Strategy",
                description: "Mark's 4-year RSU grant (flagged in Oct 2022 review) is expected to vest in Feb 2027 (~$40K net). Plan now for tax-efficient reinvestment.",
                actionLabel: 'Model RSU Reinvestment',
                timelineEventId: 'e15',   // RSU Vesting pill (Mark Reed row, Jan 2027)
                hideFromTimeline: true,
            },
            {
                id: 'h5',
                badgeLabel: 'Alert',
                badgeClass: 'c-badge c-badge_alert',
                category: 'Generational Wealth Readiness',
                title: "New-Car Goal at Risk from Market Dip",
                description: "The $45K car goal (target 2027) relies on brokerage growth. A recent market dip has put the timeline at risk — rebalance or adjust.",
                actionLabel: 'Review Goal',
                timelineEventId: 'e10',   // Car Goal Set pill (Mark Reed row, Dec 2025)
                hideFromAlerts: true,
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
            { id: 'act1', type: 'call',  iconName: 'standard:log_a_call', subject: 'Mid-year review (Mark)',         time: 'Today',    description: "Annual mid-year review with Mark Reed. Sara unavailable due to childcare." },
            { id: 'act2', type: 'task',  iconName: 'standard:task',       subject: 'Open 529 for Emma',              time: 'Due soon', description: "No 529 plan on record. Action required before next review." },
            { id: 'act3', type: 'task',  iconName: 'standard:task',       subject: "New-car goal risk flag",         time: 'Pending',  description: "Brokerage dip flagged. Reassess $45K car fund target date of 2027." },
            { id: 'act4', type: 'event', iconName: 'standard:event',      subject: "Schedule joint review with Sara", time: 'Jul 2026', description: "Plan a review that includes Sara to address engagement gap." },
        ],
        relMapMembers: [
            {
                id: 'rm1',
                name: 'Mark Reed',
                role: 'Primary Member',
                isPrimary: true,
                initials: 'MR',
                avatarStyle: 'background:#1589ee;color:#ffffff;',
                profession: 'Senior Software Engineer',
                age: '34',
                relationshipStrength: 'High',
                lastInteraction: 'Jul 7, 2026',
            },
            {
                id: 'rm2',
                name: 'Sara Reed',
                role: 'Spouse / Co-client',
                isPrimary: false,
                initials: 'SR',
                avatarStyle: 'background:#206476;color:#ffffff;',
                profession: 'Marketing Manager',
                age: '32',
                relationshipStrength: 'Low',
                lastInteraction: 'Apr 2026',
            },
            {
                id: 'rm3',
                name: 'Emma Reed',
                role: 'Daughter (dependent)',
                isPrimary: false,
                initials: 'ER',
                avatarStyle: 'background:#9a6a2e;color:#ffffff;',
                profession: 'Minor / Dependent',
                age: '3 months',
                relationshipStrength: 'N/A',
                lastInteraction: 'Apr 2026 (born)',
            },
        ],
        relMapRecommendations: [
            {
                category: 'Members',
                items: [
                    {
                        id: 'rr1',
                        name: 'Emma Reed',
                        relationship: 'Daughter',
                        icon: 'standard:contact',
                        sourceLabel: 'Existing Record Found',
                        sourceType: 'existing',
                        confidence: 'High Confidence',
                        confidenceType: 'high',
                        reason: "Listed as beneficiary in Mark Reed's Term Life Insurance policy (Jun 2026). Birth record confirmed.",
                        duplicates: [
                            { name: 'Emma Reed', company: 'Reed & Associates LLC', title: 'Daughter', email: 'emma.reed@reedassoc.com' },
                            { name: 'Emma Reed', company: 'Westbrook Primary School', title: 'Student', email: 'emma.r@westbrook.edu' },
                        ],
                    },
                    {
                        id: 'rr2',
                        name: 'Margaret Reed',
                        relationship: 'Mother (Mark)',
                        icon: 'standard:contact',
                        sourceLabel: 'New Record',
                        sourceType: 'new',
                        confidence: 'Medium Confidence',
                        confidenceType: 'medium',
                        reason: "Referenced as secondary emergency contact in Mark's onboarding intake form.",
                    },
                ],
            },
            {
                category: 'Related Accounts',
                items: [
                    {
                        id: 'rr3',
                        name: 'Reed Family Trust',
                        relationship: 'Trust',
                        icon: 'standard:account',
                        sourceLabel: '2 Records Found',
                        sourceType: 'multiple',
                        confidence: 'Low Confidence',
                        confidenceType: 'low',
                        reason: 'Identified from estate planning notes and beneficiary designations across two insurance policies.',
                        duplicates: [
                            { name: 'Reed Family Trust', company: 'Hartwell Private Banking', title: 'Revocable Living Trust', email: 'trust@hartwellpb.com' },
                            { name: 'Reed Family Trust', company: 'Regional Financial Group', title: 'Irrevocable Trust', email: 'rft@rfgroup.com' },
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
                        reason: "Mentioned in estate planning notes as Reed household's legal advisor for trust documentation.",
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
                memberName: 'Mark Reed',
                memberRole: 'Head · Primary Client',
                initials: 'MR',
                avatarClass: 'c-member-avatar c-member-avatar_blue',
                ageLabel: 'Age 33',
                relationshipStrength: 'Strong',
                strengthClass: 'c-strength-dot c-strength-dot_strong',
                events: [
                    { id: 'e1',  year: 2019, month: 'Mar 2019', label: 'Onboarding',      type: 'engagement'   },
                    { id: 'e2',  year: 2020, month: 'Apr 2020', label: 'Joint Brokerage', type: 'financial'    },
                    { id: 'e3',  year: 2020, month: 'Nov 2020', label: 'Annual Review',   type: 'engagement'   },
                    { id: 'e4',  year: 2021, month: 'Jan 2021', label: 'Emergency Fund',  type: 'financial'    },
                    { id: 'e5',  year: 2025, month: 'Jul 2025', label: 'Job Promotion',   type: 'life'         },
                    { id: 'e6',  year: 2022, month: 'Oct 2022', label: 'Annual Review',   type: 'engagement'   },
                    { id: 'e7',  year: 2023, month: 'Aug 2023', label: 'Home Purchase',   type: 'life'         },
                    { id: 'e8',  year: 2024, month: 'Feb 2024', label: 'HSA Opened',        type: 'financial' },
                    { id: 'e8m', year: 2024, month: 'Mar 2024', label: 'Mid-Year Check-in', type: 'engagement' },
                    { id: 'e9',  year: 2024, month: 'Oct 2024', label: 'Annual Review',     type: 'engagement' },
                    { id: 'e10', year: 2025, month: 'Dec 2025', label: 'Car Goal Set',    type: 'goal', targetYear: 2027 },
                    { id: 'e12', year: 2026, month: 'Jun 2026', label: 'Term Life',       type: 'financial'    },
                    { id: 'e13', year: 2025, month: 'Oct 2025', label: 'Annual Review',   type: 'engagement'   },
                    { id: 'e_mc26', year: 2026, month: 'Mar 2026', label: 'Mid-Year Check-in', type: 'engagement' },
                    { id: 'e14', year: 2026, month: 'Jun 2026', label: 'Mid-Year Review', type: 'engagement'   },
                    { id: 'e_ar26', year: 2026, month: 'Oct 2026', label: 'Annual Review',    type: 'engagement' },
                    { id: 'e15', year: 2027, month: 'Jan 2027', label: 'RSU Vesting',     type: 'transaction'  },
                ],
            },
            {
                memberId: 'm2',
                memberName: 'Sara Reed',
                memberRole: 'Spouse · Joint Client',
                initials: 'SR',
                avatarClass: 'c-member-avatar c-member-avatar_teal',
                ageLabel: 'Age 33',
                relationshipStrength: 'Strong',
                strengthClass: 'c-strength-dot c-strength-dot_strong',
                events: [
                    { id: 'e16', year: 2020, month: 'Nov 2020', label: 'Annual Review',  type: 'engagement' },
                    { id: 'e17', year: 2025, month: 'Apr 2025', label: 'Roth IRA',       type: 'financial' },
                    { id: 'e18', year: 2022, month: 'Oct 2022', label: 'Annual Review',  type: 'engagement' },
                    { id: 'e19', year: 2023, month: 'Aug 2023', label: 'Home Purchase',  type: 'life'      },
                    { id: 'e20', year: 2024, month: 'Oct 2024', label: 'Annual Review',  type: 'engagement' },
                ],
            },
            {
                memberId: 'm3',
                memberName: 'Emma Reed',
                memberRole: 'Dependent · Minor',
                initials: 'ER',
                avatarClass: 'c-member-avatar c-member-avatar_orange',
                ageLabel: 'Age 3 months',
                relationshipStrength: 'N/A',
                strengthClass: 'c-strength-dot c-strength-dot_na',
                events: [
                    { id: 'e23', year: 2026, month: 'Apr 2026', label: 'Emma Born',   type: 'life' },
                    { id: 'e24', year: 2027, month: 'Jan 2027', label: '529 Plan',    type: 'goal', targetYear: 2043 },
                ],
            },
        ],
        monthlyTimelineMembers: [
            {
                memberId: 'm1',
                memberName: 'Mark Reed',
                memberRole: 'Head · Primary Client',
                initials: 'MR',
                avatarClass: 'c-member-avatar c-member-avatar_blue',
                ageLabel: 'Age 33',
                relationshipStrength: 'Strong',
                strengthClass: 'c-strength-dot c-strength-dot_strong',
                events: [
                    { id: 'me1a', month: 'Mar 2019', label: 'Onboarding',        type: 'engagement' },
                    { id: 'me1b', month: 'Apr 2020', label: 'Joint Brokerage',   type: 'financial' },
                    { id: 'me1c', month: 'Nov 2020', label: 'Annual Review',     type: 'engagement' },
                    { id: 'me1d', month: 'Jun 2021', label: 'Emergency Fund',    type: 'financial' },
                    { id: 'me1e', month: 'Jul 2025', label: 'Job Promotion',     type: 'life'      },
                    { id: 'me1f', month: 'Oct 2022', label: 'Annual Review',     type: 'engagement' },
                    { id: 'me1g', month: 'Aug 2023', label: 'Home Purchase',     type: 'life'      },
                    { id: 'me1h', month: 'Feb 2024', label: 'HSA Opened',          type: 'financial' },
                    { id: 'e8m',  month: 'Mar 2024', label: 'Mid-Year Check-in',  type: 'engagement' },
                    { id: 'me1i', month: 'Oct 2024', label: 'Annual Review',       type: 'engagement' },
                    { id: 'e10',    month: 'Dec 2025', label: 'Car Goal Set',       type: 'goal',       targetYear: 2027 },
                    { id: 'me1l',   month: 'Jun 2026', label: 'Term Life',          type: 'financial' },
                    { id: 'me2',    month: 'Oct 2025', label: 'Annual Review',      type: 'engagement' },
                    { id: 'e_mc26', month: 'Mar 2026', label: 'Mid-Year Check-in',  type: 'engagement' },
                    { id: 'e14',    month: 'Jun 2026', label: 'Mid-Year Check-in',  type: 'engagement' },
                    { id: 'e_ar26', month: 'Oct 2026', label: 'Annual Review',      type: 'engagement' },
                    { id: 'e15',    month: 'Jan 2027', label: 'RSU Vesting',        type: 'goal' },
                ],
            },
            {
                memberId: 'm2',
                memberName: 'Sara Reed',
                memberRole: 'Spouse · Joint Client',
                initials: 'SR',
                avatarClass: 'c-member-avatar c-member-avatar_teal',
                ageLabel: 'Age 33',
                relationshipStrength: 'Strong',
                strengthClass: 'c-strength-dot c-strength-dot_strong',
                events: [
                    { id: 'me1b', month: 'Apr 2020', label: 'Joint Brokerage', type: 'financial' },
                    { id: 'me7a', month: 'Nov 2020', label: 'Annual Review',  type: 'engagement' },
                    { id: 'me7b', month: 'Apr 2025', label: 'Roth IRA',       type: 'financial' },
                    { id: 'me7c', month: 'Oct 2022', label: 'Annual Review',  type: 'engagement' },
                    { id: 'me7d', month: 'Aug 2023', label: 'Home Purchase',  type: 'life'      },
                    { id: 'me7e', month: 'Oct 2024', label: 'Annual Review',  type: 'engagement' },
                ],
            },
            {
                memberId: 'm3',
                memberName: 'Emma Reed',
                memberRole: 'Dependent · Minor',
                initials: 'ER',
                avatarClass: 'c-member-avatar c-member-avatar_orange',
                ageLabel: 'Age 3 months',
                relationshipStrength: 'N/A',
                strengthClass: 'c-strength-dot c-strength-dot_na',
                events: [
                    { id: 'e23',  month: 'Apr 2026', label: 'Born',      type: 'life' },
                    { id: 'e24',  month: 'Jan 2027', label: '529 Plan',  type: 'goal', targetYear: 2043 },
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

const TIMELINE_YEARS  = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028];

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
const TIMELINE_MONTHS   = _buildMonthRange(2019, 1, 2027, 2); // Jan 2019 → Feb 2027
const CURRENT_MONTH     = 'Jul 2026'; // today's month for isToday marker
const CURRENT_MONTH_IDX = TIMELINE_MONTHS.indexOf(CURRENT_MONTH);

/*
 * Market / Car-Fund metric — represents the investment account the Reed
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
            { id: 's1',  text: "Across the past 12 months the Reed household\u2019s journey has been defined by ", bold: false },
            { id: 's2',  text: "one pivotal life event \u2013 Emma\u2019s birth (Apr 2026)",                      bold: true  },
            { id: 's3',  text: " \u2013 and the arc it set in motion. The sequence tells the story: a new dependent arrived, engagement stayed ", bold: false },
            { id: 's4',  text: "Mark-only",                                                                        bold: true  },
            { id: 's5',  text: " through every touchpoint, and the plan hasn\u2019t caught up \u2013 ",            bold: false },
            { id: 's6',  text: "no 529 started, protection not revisited.",                                        bold: true  },
            { id: 's7',  text: " The trajectory is a family growing faster than its plan, with ",                  bold: false },
            { id: 's8',  text: "college funding and bringing Sara into the relationship",                           bold: true  },
            { id: 's9',  text: " both on the horizon.",                                                            bold: false },
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
        };
        // Maps member name fragments → avatar background color
        const MEMBER_AVATAR_COLOR = {
            'Mark':  '#1589ee',
            'Sara':  '#0e9372',
            'Emma':  '#8B6914',
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
        };
        const TYPE_ICON = {
            life:        'utility:event',
            engagement:  'utility:people',
            meeting:     'utility:event',
            goal:        'standard:goal',
            financial:   'utility:company',
            transaction: 'utility:money',
        };

        const TYPE_ICON_BADGE = {
            life:      'c-pill-icon-badge c-pill-icon-badge_life',
            engagement:'c-pill-icon-badge c-pill-icon-badge_engagement',
            meeting:   'c-pill-icon-badge c-pill-icon-badge_meeting',
            goal:      'c-pill-icon-badge c-pill-icon-badge_goal',
            financial: 'c-pill-icon-badge c-pill-icon-badge_financial',
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
        const rows = members.map((m, idx) => ({
            ...m,
            isPrimary: idx === 0,
            yearCells: cols.map((col) => {
                const evts = m.events
                    .filter((e) => this.isYearlyMode ? e.year === col.key : e.month === col.key)
                    .map((e) => {
                        const det = EVENT_DETAILS[e.id] || null;
                        const highlighted = e.id === this._highlightedPillId;
                        return {
                            ...e,
                            pillClass:       (PILL[e.type] || PILL.financial) + (highlighted ? ' c-pill_highlighted' : ''),
                            isGoal:          e.type === 'goal',
                            isFinancial:     e.type === 'financial',
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
                const TYPE_FILTER_MAP = { life: 'life', engagement: 'engagement', goal: 'goal', financial: 'financial' };
                const filterType = TYPE_FILTER_MAP[this._activeFilter] || null;

                // Milestone track: life, goal, financial, transaction (no meetings)
                const milestoneEvts = [...evts, ...mergedSugEvts]
                    .filter(e => !['meeting', 'engagement'].includes(e.type))
                    .filter(e => !filterType || e.type === filterType);

                // Engagement track: meetings + engagements
                // Yearly → colored touchpoint dots; Monthly/Drill → full pills
                const engagementEvts = evts
                    .filter(e => ['meeting', 'engagement'].includes(e.type))
                    .map(e => ({
                        ...e,
                        engDotClass:  'c-eng-dot c-eng-dot_' + e.type,
                        showAsPill:   this.isMonthlyMode || this.isDrillMode,
                    }));

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
                    showCount:   this.isYearlyMode && milestoneEvts.length > 0,
                    showEvents:  !this.isYearlyMode,
                    showAdd:     milestoneEvts.length === 0 && col.isPredicted && sparkles.length === 0 && !this.isYearlyMode,
                    sparkles,
                    hasSparkles: sparkles.length > 0,
                    // ── Engagement track (bottom sub-lane) ──
                    engagementCellClass: 'c-timeline-year-col c-timeline-row__cell c-engagement-cell' + _borderMods,
                    engagementEvents: engagementEvts,
                    hasEngagement:    engagementEvts.length > 0,
                    // ── Shared connectors ──
                    hasConnectorBelow: false,
                    hasConnectorAbove: false,
                };
            }),
        }));

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

    // ── Chronicle View version toggle ────────────────────────────────────────
    @track _chronicleVersion = 'v1'; // 'v1' | 'v2'
    get isChronicleV1()  { return this._chronicleVersion === 'v1'; }
    get toggleV1Class()  { return 'c-cv-toggle__btn' + (this._chronicleVersion === 'v1' ? ' c-cv-toggle__btn_active' : ''); }
    get toggleV2Class()  { return 'c-cv-toggle__btn' + (this._chronicleVersion === 'v2' ? ' c-cv-toggle__btn_active' : ''); }
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
    @track _modalSelectedType     = '';   // tracks live combobox selection
    @track _goalWizardStep        = 1;    // 1 | 2 | 3
    @track _timelineCtxMenu       = null; // { x, y, memberId, memberName } or null
    @track _meetingPrefill        = null; // { subject, description, name, relatedTo } or null
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
                relatedTo:   'Reed Household',
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
            'Life Event Gaps',
            'Relationship Health',
            'Generational Wealth Readiness',
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
        const pillEl = this.template.querySelector(`[data-event-id="${eventId}"]`);
        if (!pillEl) return;
        // 'center' vertically and 'center' horizontally so the pill sits in the middle of the viewport
        pillEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
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
        const action = event.currentTarget.dataset.action;
        // Dismiss highlight then dispatch
        this._highlightedPillId      = null;
        this._highlightedActionLabel = null;
        this._dispatchHighlightAction(action);
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
        // Sara absent from 2025 and 2026 reviews (2 of last 2 missed).
        // Emma (born Apr 2026, heir) not included in any planning session.
        // Mark attended every review. 1 of 3 household members fully engaged.
        const r1Score   = 30;
        const r1Status  = 'critical';
        const r1Label   = 'Critical';
        const r1Finding = 'Sara Reed has not attended the 2025 or 2026 annual reviews. Emma Reed (3 months) is not yet included in any estate planning conversation.';

        // ── Rule 2: Beneficiary Coverage ─────────────────────────
        // BRK-2020-4471 ✓ · HSA-2024-3319 ✓ · TL-2026-7754 ✓ · IRA-2022-5581 ✓
        // SAV-2021-8832 ✗ · 3 accounts not updated post-Emma birth.
        const r2Score   = 60;
        const r2Status  = 'at-risk';
        const r2Label   = 'At Risk';
        const r2Finding = '4 of 5 accounts have named beneficiaries. Emma Reed is not yet designated on 3 accounts following her birth in April 2026.';

        // ── Rule 3: Trust Established ─────────────────────────────
        // No revocable living trust, will, or POA on file.
        const r3Score   = 0;
        const r3Status  = 'critical';
        const r3Label   = 'Critical';
        const r3Finding = 'No revocable living trust, will, or power of attorney has been documented for the Reed Household.';

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
                        agentNote: 'Agentforce identified a protection gap following Emma\'s birth in April 2026',
                        title: '529 Plan initiation checklist ready — Emma Reed',
                        statusLabel: 'Action Needed',
                        ctaLabel: 'Review & Open 529',
                    },
                    {
                        id: 'aa2',
                        agentNote: 'Agentforce flagged Sara\'s missing term life coverage after Mark\'s policy was purchased',
                        title: 'Comparative term life analysis prepared — Sara Reed',
                        statusLabel: 'Ready to Review',
                        ctaLabel: 'Review Analysis',
                    },
                    {
                        id: 'aa3',
                        agentNote: 'Agentforce scanned all accounts and found 4 with outdated beneficiaries post-Emma\'s birth',
                        title: 'Beneficiary update checklist compiled — Reed Household',
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
                        agentNote: 'Agentforce has prepped a meeting summary for Sara\'s 1:1 re-engagement session',
                        title: 'Meeting summary draft ready — Sara Reed 1:1',
                        statusLabel: 'Ready to Send',
                        ctaLabel: 'Add to Meeting Concierge',
                    },
                    {
                        id: 'aa5',
                        agentNote: 'Agentforce drafted a personalised re-engagement email based on Sara\'s 2-year absence',
                        title: 'Re-engagement email drafted — Sara Reed',
                        statusLabel: 'Ready to Send',
                        ctaLabel: 'Review Draft',
                    },
                    {
                        id: 'aa6',
                        agentNote: 'Agentforce compiled talking points and open action items for the upcoming mid-year review',
                        title: 'Annual review agenda prepared — Reed Household',
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
                        agentNote: 'Agentforce modelled 3 529 growth scenarios over 17+ years for Emma\'s college education',
                        title: 'College savings projection ready — Emma Reed',
                        statusLabel: 'Ready to Review',
                        ctaLabel: 'Review Projection',
                    },
                    {
                        id: 'aa8',
                        agentNote: 'Agentforce mapped tax-efficient reinvestment paths for Mark\'s Feb 2027 RSU vesting (~$40K net)',
                        title: 'RSU reinvestment strategy outlined — Mark Reed',
                        statusLabel: 'Ready to Review',
                        ctaLabel: 'Review Strategy',
                    },
                    {
                        id: 'aa9',
                        agentNote: 'Agentforce identified 4 missing estate planning documents including will, trust, and POA',
                        title: 'Estate planning gap report created — Reed Household',
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
        // "Add to Meeting Concierge" — open meeting modal with Sara pre-fill
        if (id === 'aa4' || id === 'aa5') {
            this._meetingPrefill = {
                subject:     '1:1 Planning Review with Sara Reed',
                description: 'Sara has been absent from the last two annual reviews (2025, 2026). This 1:1 aims to re-anchor her as an active co-client and review her current financial priorities.',
                name:        'Sara Reed',
                relatedTo:   'Reed Household',
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
    get modalPrefillEventName()    { return ''; }
    get modalPrefillEventType()    { return ''; }
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
        this._milestoneModalOpen    = false;
        this._milestoneModalPrefill = null;
        this._modalSelectedType     = '';
        this._goalWizardStep        = 1;
        this._meetingPrefill        = null;
        this._financialPrefill      = null;
        this._goalPrefill           = null;
    }

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
            { id: '1', name: 'Mark Reed',  email: 'mark.reed@email.com', phone: '(512) 555-0101' },
            { id: '2', name: 'Sara Reed',  email: 'sara.reed@email.com', phone: '(512) 555-0102' },
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
            'Open 529 Plan for Emma':       'goal',
            'Set Up Dependent Care FSA':    'financial',
            'Update Beneficiaries + Will':  'goal',
            'Engage Sara in Planning':      'meeting',
            'Reassess New-Car Goal Timeline': 'goal',
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
        const action = event.detail?.action;
        // Close the popover + clear highlight first
        this.popoverVisible          = false;
        this.popoverEventData        = null;
        this._highlightedPillId      = null;
        this._highlightedActionLabel = null;
        // Dispatch the action
        this._dispatchHighlightAction(action);
    }

    /** Shared action dispatcher used by pill quick-action chip, popover CTA, and highlights panel */
    _dispatchHighlightAction(action) {
        if (!action) return;
        if (action === 'Create Meeting') {
            this._meetingPrefill = {
                subject:     '1:1 Planning Review with Sara Reed',
                description: 'Sara has been absent from the last two annual reviews (2025, 2026). This 1:1 aims to re-anchor her as an active co-client and review her current financial priorities.',
                name:        'Sara Reed',
                relatedTo:   'Reed Household',
            };
            this._milestoneModalPrefill = { eventType: 'engagement', primaryMember: '' };
            this._modalSelectedType     = '';
            this._milestoneModalOpen    = true;
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
        const action = event.currentTarget.dataset.action;
        this._dispatchHighlightAction(action);
    }

    /** CTA button on V1 Timeline Insights panel cards — stops card-click propagation then dispatches */
    handleTliCardCta(event) {
        event.stopPropagation();
        const action = event.currentTarget.dataset.action;
        this._dispatchHighlightAction(action);
    }

    /* Called when V2 bubbles a 'highlightaction' custom event (CTA button or popover CTA) */
    handleV2HighlightAction(event) {
        const action = event.detail?.action;
        this._dispatchHighlightAction(action);
    }

    // Map of CTA labels → modal pre-fill data (case-insensitive key lookup)
    _ctaModalPrefillMap = {
        'start 529 plan': {
            eventType:       'financial',
            financialName:   "Emma's 529 Plan",
            financialType:   '529',
            primaryMember:   'Emma Reed',
            primaryMemberId: 'm3',
        },
        'model rsu reinvestment': {
            eventName: 'Model RSU Reinvestment',
            eventType: 'goal',
            primaryMember: 'Mark Reed',
        },
        'review goal': {
            eventType:        'goal',
            goalName:         'New Car Fund',
            goalType:         'savings',
            goalTargetAmount: 45000,
            goalPriority:     'high',
            primaryMember:    'Mark Reed',
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
