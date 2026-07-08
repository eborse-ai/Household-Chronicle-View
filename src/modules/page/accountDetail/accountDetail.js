import { LightningElement, track } from 'lwc';
import { getCurrentRoute, navigate } from '../../../router';
import { getAccountById } from 'data/accounts';

/** Popover detail data keyed by event id */
const EVENT_DETAILS = {
    // ── Mark Reed — yearly ───────────────────────────────────────────
    e1:  { description: 'Mark and Sara Reed joined as new clients. Initial onboarding covered investment profile, risk tolerance, and goal-setting.', isShared: true,  sharedWith: 'Sara Reed', isCritical: false, date: 'Mar 2019',    membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed',                     cashFlowImpact: null, beneficiaries: null, actionTaken: 'Welcome call completed. Planning doc shared.' },
    e2:  { description: 'Joint brokerage account opened to support long-term wealth accumulation goals for the household.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Apr 2020', membersAffected: 2, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: '$500/mo contribution', beneficiaries: 'Sara Reed (50%), Mark Reed (50%)', actionTaken: 'Account opened and funded.' },
    e3:  { description: 'First annual review covering investment performance, goal progress, and insurance adequacy.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Nov 2020', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Reviewed and updated investment allocations.' },
    e4:  { description: 'Emergency fund target of 6 months of expenses reached. Funds held in high-yield savings.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Jan 2021', membersAffected: 2, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: '$18,000 milestone', beneficiaries: null, actionTaken: 'Goal milestone recorded.' },
    e5:  { description: "Mark received a significant promotion at his employer, resulting in a salary increase of approximately $15K and new RSU grants.", isShared: false, sharedWith: '', isCritical: false, date: 'Mar 2022', membersAffected: 1, status: 'Noted', aiInsight: "Salary increase creates an opportunity to boost retirement contributions and increase the car savings goal rate. Consider a Mega Backdoor Roth if the employer plan allows.", aiActionLabel: 'Review Contribution Strategy', members: 'Mark Reed', cashFlowImpact: '+$15K/yr income', beneficiaries: null, actionTaken: 'Income updated in plan.', sentimentInsights: [{ name: 'Mark Reed', role: 'Primary Client', keyword: 'Ambitious', insight: 'Motivated by milestones — will embrace complex strategies like Mega Backdoor Roth if given a clear step-by-step plan.' }] },
    e6:  { description: 'Annual review covering brokerage performance, Roth IRA contribution limits, and household insurance.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Oct 2022', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'All accounts reviewed. No changes required.' },
    e7:  { description: 'Mark and Sara purchased their first home for $380K with a 20% down payment. Mortgage of $304K at 6.5%.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Jun 2023', membersAffected: 2, status: 'Completed', aiInsight: "New mortgage has not triggered a review of life insurance coverage or beneficiary updates. Recommend scheduling a protection review.", aiActionLabel: 'Schedule Protection Review', members: 'Mark · Sara Reed', cashFlowImpact: '$2,100/mo mortgage', beneficiaries: 'Not updated post-purchase', actionTaken: 'Home purchase recorded.', sentimentInsights: [{ name: 'Mark Reed', role: 'Primary Client', keyword: 'Pragmatic', insight: 'Equity-focused mindset; open to re-balancing towards mortgage paydown over aggressive investing.' }, { name: 'Sara Reed', role: 'Co-client', keyword: 'Security-driven', insight: 'Home ownership has heightened need for financial stability; insurance and emergency reserves are top of mind.' }] },
    e8:  { description: "Mark enrolled in employer's high-deductible health plan and opened an HSA to cover out-of-pocket costs and build long-term tax-free savings.", isShared: false, sharedWith: '', isCritical: false, date: 'Jan 2024', membersAffected: 1, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: '$3,850/yr contribution (2024 limit)', beneficiaries: 'Sara Reed', actionTaken: 'Account opened. Payroll deduction set.' },
    e9:  { description: 'Annual review completed. Discussed brokerage performance, mortgage paydown progress, and HSA growth.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Oct 2024', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Investment rebalancing recommended and executed.' },
    e10: { description: "Mark and Sara set a joint savings goal to purchase a new car by 2027. Target: $45,000. Current balance: ~$12,000. Recent brokerage dip has put the goal at risk.", isShared: true, sharedWith: 'Sara Reed', isCritical: true, date: 'Feb 2025', membersAffected: 2, status: 'At Risk', aiInsight: "Goal is at risk due to recent brokerage account dip (~4% MoM). Consider a dedicated sinking fund rather than relying on the brokerage for this short-term goal.", aiActionLabel: 'Reassess Goal Timeline', members: 'Mark · Sara Reed', cashFlowImpact: '$500/mo target savings', beneficiaries: null, actionTaken: 'Goal recorded. No adjustment made.', sentimentInsights: [{ name: 'Mark Reed', role: 'Primary Client', keyword: 'Goal-oriented', insight: 'Wants a firm timeline and concrete monthly targets — a dedicated sinking fund with milestones will resonate.' }, { name: 'Sara Reed', role: 'Co-client', keyword: 'Risk-averse', insight: 'The brokerage dip is a concern; prefers a stable, FDIC-insured vehicle rather than market-linked savings for near-term goals.' }] },
    e11: { description: "Emma Reed born April 14, 2025. The pivotal life event that changed the household's cash flow, tax profile, and protection needs — none of which were updated.", isShared: true, sharedWith: 'Sara Reed · Emma Reed', isCritical: true, date: 'Apr 14, 2025', membersAffected: 3, status: 'No plan update', aiInsight: "Emma's birth triggers maternity leave for Sara, paternity leave for Mark, and new recurring daycare costs. No 529, DCFSA, or beneficiary update has been initiated. The plan has not caught up to the family.", aiActionLabel: 'Start Child Planning', members: 'Mark · Sara · Emma Reed', cashFlowImpact: '$2,800/mo starting Aug 2025', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record', sentimentInsights: [{ name: 'Mark Reed', role: 'Primary Client', keyword: 'Action-ready', insight: 'Eager to act on child planning — needs a clear, prioritised checklist: 529 first, then DCFSA, then beneficiary updates.' }, { name: 'Sara Reed', role: 'Co-client', keyword: 'Protective', insight: 'First-time parent in maternity leave; anxious about coverage gaps and income continuity. Insurance review is highest priority.' }, { name: 'Emma Reed', role: 'Dependent', keyword: 'Future beneficiary', insight: 'No 529 plan started. Each month of delay costs ~$200 in compounded growth by college age (2043).' }] },
    e12: { description: 'Mark purchased a 20-year, $750K term life policy to provide income replacement for Sara and Emma following the birth.', isShared: false, sharedWith: '', isCritical: false, date: 'May 2025', membersAffected: 1, status: 'Active', aiInsight: "Sara does not have equivalent term coverage. Recommend evaluating a matching policy for Sara given the shared income and dependent care obligations.", aiActionLabel: "Review Sara's Coverage", members: 'Mark Reed', cashFlowImpact: '$85/mo premium', beneficiaries: 'Sara Reed (primary), Emma Reed (contingent)', actionTaken: 'Policy purchased and documented.' },
    e13: { description: 'Annual review completed with Mark only. Sara did not attend — this is the second consecutive year of absence from the annual review.', isShared: false, sharedWith: '', isCritical: true, date: 'Oct 2025', membersAffected: 1, status: 'Completed', aiInsight: "Sara has been absent from two consecutive annual reviews (2024, 2025). Single-client engagement creates blind spots in holistic planning. Recommend a dedicated 1:1 with Sara before the mid-year check-in.", aiActionLabel: 'Schedule 1:1 with Sara', members: 'Mark Reed (Sara absent)', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Review completed. Sara follow-up not initiated.', sentimentInsights: [{ name: 'Mark Reed', role: 'Primary Client', keyword: 'Engaged', insight: 'Receptive and detail-oriented in reviews; needs Sara present to prevent single-client blind spots in household planning.' }, { name: 'Sara Reed', role: 'Co-client', keyword: 'Disengaged', insight: 'Two consecutive absences suggest low perceived value or scheduling friction. A dedicated 1:1 tailored to her priorities — protection, income continuity — is recommended.' }] },
    e14: { description: 'Mid-year review scheduled with Mark to cover brokerage performance, 529 plan funding, and new-car goal timeline.', isShared: false, sharedWith: '', isCritical: false, date: 'Jun 2026', membersAffected: 1, status: 'Scheduled', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Meeting invite sent.' },
    e15: { description: 'RSU vesting event expected based on current grant schedule. Subject to continued employment and stock performance.', isShared: false, sharedWith: '', isCritical: false, date: 'Jan 2027', membersAffected: 1, status: 'Predicted', aiInsight: "RSU vesting will create a taxable event. Begin planning now to set aside funds for estimated tax payments and decide on hold-vs-sell strategy.", aiActionLabel: 'Start RSU Tax Planning', members: 'Mark Reed', cashFlowImpact: 'Est. $18,000 gross (variable)', beneficiaries: null, actionTaken: 'None — future event' },
    // ── Sara Reed — yearly ───────────────────────────────────────────
    e16: { description: 'First annual review for Sara as a joint client. Covered investment goals, insurance, and household savings strategy.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Nov 2020', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Financial snapshot documented.' },
    e17: { description: "Sara opened a Roth IRA funded with $6,000 (2022 limit) to complement Mark's workplace retirement plan.", isShared: false, sharedWith: '', isCritical: false, date: 'Apr 2022', membersAffected: 1, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Sara Reed', cashFlowImpact: '$500/mo contribution', beneficiaries: 'Mark Reed', actionTaken: 'Account opened and max funded.' },
    e18: { description: 'Annual review covering Roth IRA performance, joint brokerage, and household savings.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Oct 2022', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Goals updated. No allocation changes needed.' },
    e19: { description: 'Sara and Mark purchased their first home. Sara listed as co-borrower. Mortgage payment has replaced prior rent expense.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Jun 2023', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: '$2,100/mo mortgage', beneficiaries: null, actionTaken: 'Home purchase recorded in plan.' },
    e20: { description: 'Annual review with Sara and Mark. Reviewed Roth IRA growth, brokerage performance, and car goal progress.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Oct 2024', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'All goals on track at time of review.' },
    e21: { description: 'Sara and Mark jointly set a $45K car savings goal targeting 2027. Funded from the brokerage account.', isShared: true, sharedWith: 'Mark Reed', isCritical: true, date: 'Feb 2025', membersAffected: 2, status: 'At Risk', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: '$500/mo target savings', beneficiaries: null, actionTaken: 'Goal recorded.' },
    e22: { description: "Emma Reed born April 14, 2025. Sara entered maternity leave immediately following delivery.", isShared: true, sharedWith: 'Mark Reed · Emma Reed', isCritical: true, date: 'Apr 14, 2025', membersAffected: 3, status: 'No plan update', aiInsight: "Sara's maternity leave reduces household income by ~$4,200/mo for 4 months. No plan adjustment has been made for this income gap.", aiActionLabel: 'Review Cash-Flow Impact', members: 'Sara · Mark · Emma Reed', cashFlowImpact: '–$4,200/mo (maternity leave)', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record' },
    // ── Emma Reed — yearly ───────────────────────────────────────────
    e23: { description: 'Emma Reed born April 14, 2025. First recorded life event for Emma as a household dependent.', isShared: true, sharedWith: 'Mark Reed · Sara Reed', isCritical: false, date: 'Apr 14, 2025', membersAffected: 3, status: 'Noted', aiInsight: null, aiActionLabel: null, members: 'Emma · Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Emma added as household dependent.' },
    e24: { description: "529 college savings plan to be opened for Emma. Predicted based on advisor recommendation following Emma's birth.", isShared: false, sharedWith: '', isCritical: false, date: '2027 (predicted)', membersAffected: 1, status: 'Predicted', aiInsight: "Starting a 529 now (2026) gives 17+ years of compounding before Emma reaches college age. Even $100/mo started today could grow to $55K+ at an assumed 7% return.", aiActionLabel: 'Open 529 Plan', members: 'Emma Reed', cashFlowImpact: 'Est. $200/mo contribution', beneficiaries: null, actionTaken: 'Not yet initiated' },
    // ── Monthly events — Mark Reed (me1a … me1l are historical events before me1) ──
    me1a: { description: 'Mark and Sara Reed joined as new clients. Initial onboarding covered investment profile, risk tolerance, and goal-setting.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Mar 2019', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Welcome call completed. Planning doc shared.' },
    me1b: { description: 'Joint brokerage account opened to support long-term wealth accumulation goals for the household.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Apr 2020', membersAffected: 2, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: '$500/mo contribution', beneficiaries: 'Sara Reed (50%), Mark Reed (50%)', actionTaken: 'Account opened and funded.' },
    me1c: { description: 'First annual review covering investment performance, goal progress, and insurance adequacy.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Nov 2020', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Reviewed and updated investment allocations.' },
    me1d: { description: 'Emergency fund target of 6 months of expenses reached. Funds held in high-yield savings.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Jan 2021', membersAffected: 2, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: '$18,000 milestone', beneficiaries: null, actionTaken: 'Goal milestone recorded.' },
    me1e: { description: "Mark received a significant promotion, resulting in a salary increase of approximately $15K and new RSU grants.", isShared: false, sharedWith: '', isCritical: false, date: 'Mar 2022', membersAffected: 1, status: 'Noted', aiInsight: "Salary increase creates an opportunity to boost retirement contributions and increase the car savings goal rate. Consider a Mega Backdoor Roth if the employer plan allows.", aiActionLabel: 'Review Contribution Strategy', members: 'Mark Reed', cashFlowImpact: '+$15K/yr income', beneficiaries: null, actionTaken: 'Income updated in plan.', sentimentInsights: [{ name: 'Mark Reed', role: 'Primary Client', keyword: 'Ambitious', insight: 'Motivated by milestones — will embrace complex strategies like Mega Backdoor Roth if given a clear step-by-step plan.' }] },
    me1f: { description: 'Annual review covering brokerage performance, Roth IRA contribution limits, and household insurance.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Oct 2022', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'All accounts reviewed. No changes required.' },
    me1g: { description: 'Mark and Sara purchased their first home for $380K with a 20% down payment. Mortgage of $304K at 6.5%.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Jun 2023', membersAffected: 2, status: 'Completed', aiInsight: "New mortgage has not triggered a review of life insurance coverage or beneficiary updates. Recommend scheduling a protection review.", aiActionLabel: 'Schedule Protection Review', members: 'Mark · Sara Reed', cashFlowImpact: '$2,100/mo mortgage', beneficiaries: 'Not updated post-purchase', actionTaken: 'Home purchase recorded.', sentimentInsights: [{ name: 'Mark Reed', role: 'Primary Client', keyword: 'Pragmatic', insight: 'Equity-focused mindset; open to re-balancing towards mortgage paydown over aggressive investing.' }, { name: 'Sara Reed', role: 'Co-client', keyword: 'Security-driven', insight: 'Home ownership has heightened need for financial stability; insurance and emergency reserves are top of mind.' }] },
    me1h: { description: "Mark enrolled in employer's high-deductible health plan and opened an HSA to cover out-of-pocket costs and build long-term tax-free savings.", isShared: false, sharedWith: '', isCritical: false, date: 'Jan 2024', membersAffected: 1, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: '$3,850/yr contribution (2024 limit)', beneficiaries: 'Sara Reed', actionTaken: 'Account opened. Payroll deduction set.' },
    me1i: { description: 'Annual review completed. Discussed brokerage performance, mortgage paydown progress, and HSA growth.', isShared: true, sharedWith: 'Sara Reed', isCritical: false, date: 'Oct 2024', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark · Sara Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Investment rebalancing recommended and executed.' },
    me1j: { description: "Mark and Sara set a joint savings goal to purchase a new car by 2027. Target: $45,000. Current balance: ~$12,000. Recent brokerage dip has put the goal at risk.", isShared: true, sharedWith: 'Sara Reed', isCritical: true, date: 'Feb 2025', membersAffected: 2, status: 'At Risk', aiInsight: "Goal is at risk due to recent brokerage account dip (~4% MoM). Consider a dedicated sinking fund rather than relying on the brokerage for this short-term goal.", aiActionLabel: 'Reassess Goal Timeline', members: 'Mark · Sara Reed', cashFlowImpact: '$500/mo target savings', beneficiaries: null, actionTaken: 'Goal recorded. No adjustment made.', sentimentInsights: [{ name: 'Mark Reed', role: 'Primary Client', keyword: 'Goal-oriented', insight: 'Wants a firm timeline and concrete monthly targets — a dedicated sinking fund with milestones will resonate.' }, { name: 'Sara Reed', role: 'Co-client', keyword: 'Risk-averse', insight: 'The brokerage dip is a concern; prefers a stable, FDIC-insured vehicle for near-term goals.' }] },
    me1k: { description: "Emma Reed born April 14, 2025. The pivotal life event that changed the household's cash flow, tax profile, and protection needs — none of which were updated.", isShared: true, sharedWith: 'Sara Reed · Emma Reed', isCritical: true, date: 'Apr 14, 2025', membersAffected: 3, status: 'No plan update', aiInsight: "Emma's birth triggers maternity leave for Sara, paternity leave for Mark, and new recurring daycare costs. No 529, DCFSA, or beneficiary update has been initiated.", aiActionLabel: 'Start Child Planning', members: 'Mark · Sara · Emma Reed', cashFlowImpact: '$2,800/mo starting Aug 2025', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record', sentimentInsights: [{ name: 'Mark Reed', role: 'Primary Client', keyword: 'Action-ready', insight: 'Eager to act on child planning — needs a clear, prioritised checklist: 529 first, then DCFSA, then beneficiary updates.' }, { name: 'Sara Reed', role: 'Co-client', keyword: 'Protective', insight: 'First-time parent in maternity leave; anxious about coverage gaps and income continuity. Insurance review is highest priority.' }] },
    me1l: { description: 'Mark purchased a 20-year, $750K term life policy to provide income replacement for Sara and Emma following the birth.', isShared: false, sharedWith: '', isCritical: false, date: 'May 2025', membersAffected: 1, status: 'Active', aiInsight: "Sara does not have equivalent term coverage. Recommend evaluating a matching policy for Sara given the shared income and dependent care obligations.", aiActionLabel: "Review Sara's Coverage", members: 'Mark Reed', cashFlowImpact: '$85/mo premium', beneficiaries: 'Sara Reed (primary), Emma Reed (contingent)', actionTaken: 'Policy purchased and documented.' },
    me1: { description: "Mark took 4 weeks of paternity leave following Emma's birth. Employer provides 4 weeks of paid leave.", isShared: false, sharedWith: '', isCritical: false, date: 'Aug 2025', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: 'No income impact (paid leave)', beneficiaries: null, actionTaken: 'Leave recorded.' },
    me2: { description: 'Annual review with Mark only. Covered portfolio performance, Emma planning gaps, and RSU outlook.', isShared: false, sharedWith: '', isCritical: true, date: 'Oct 2025', membersAffected: 1, status: 'Completed', aiInsight: "Sara was absent for the second year in a row. Key planning decisions — 529 funding, beneficiary updates — remain incomplete without her input.", aiActionLabel: 'Schedule 1:1 with Sara', members: 'Mark Reed (Sara absent)', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Notes filed. No joint follow-up scheduled.' },
    me3: { description: 'Year-end tax and financial planning session to review contribution limits, RSU vest schedule, and portfolio rebalancing.', isShared: false, sharedWith: '', isCritical: false, date: 'Nov 2025', membersAffected: 1, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Year-end contributions maximised.' },
    me4: { description: 'Mark received a second promotion, increasing his annual compensation by ~$20K and accelerating RSU vest schedule.', isShared: false, sharedWith: '', isCritical: false, date: 'Mar 2026', membersAffected: 1, status: 'Noted', aiInsight: "New compensation level may push Mark into a higher marginal tax bracket. Review withholding elections and consider increasing 401(k) contributions to offset.", aiActionLabel: 'Review Tax Strategy', members: 'Mark Reed', cashFlowImpact: '+$20K/yr income', beneficiaries: null, actionTaken: 'Compensation update noted.' },
    me5: { description: 'Emma started full-time daycare. Monthly cost of $2,800 begins creating a sustained impact on household cash flow.', isShared: false, sharedWith: '', isCritical: true, date: 'May 2026', membersAffected: 1, status: 'Active', aiInsight: "Daycare cost of $2,800/mo is significant. A DCFSA election could provide up to $5,000 in pre-tax relief annually. Open enrollment may be available at next benefit cycle.", aiActionLabel: 'Explore DCFSA Options', members: 'Mark Reed', cashFlowImpact: '$2,800/mo daycare', beneficiaries: null, actionTaken: 'None on record' },
    me6: { description: 'Mid-year check-in to review portfolio, 529 progress, and household cash flow following Sara\'s return to work.', isShared: false, sharedWith: '', isCritical: false, date: 'Jun 2026', membersAffected: 1, status: 'Scheduled', aiInsight: null, aiActionLabel: null, members: 'Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Meeting invite sent.' },
    me7a: { description: 'First annual review for Sara as a joint client. Covered investment goals, insurance, and household savings strategy.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Nov 2020', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Financial snapshot documented.' },
    me7b: { description: "Sara opened a Roth IRA funded with $6,000 (2022 limit) to complement Mark's workplace retirement plan.", isShared: false, sharedWith: '', isCritical: false, date: 'Apr 2022', membersAffected: 1, status: 'Active', aiInsight: null, aiActionLabel: null, members: 'Sara Reed', cashFlowImpact: '$500/mo contribution', beneficiaries: 'Mark Reed', actionTaken: 'Account opened and max funded.' },
    me7c: { description: 'Annual review covering Roth IRA performance, joint brokerage, and household savings.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Oct 2022', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'Goals updated. No allocation changes needed.' },
    me7d: { description: 'Sara and Mark purchased their first home for $380K. Sara listed as co-borrower. Mortgage payment has replaced prior rent expense.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Jun 2023', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: '$2,100/mo mortgage', beneficiaries: null, actionTaken: 'Home purchase recorded in plan.' },
    me7e: { description: 'Annual review with Sara and Mark. Reviewed Roth IRA growth, brokerage performance, and car goal progress.', isShared: true, sharedWith: 'Mark Reed', isCritical: false, date: 'Oct 2024', membersAffected: 2, status: 'Completed', aiInsight: null, aiActionLabel: null, members: 'Sara · Mark Reed', cashFlowImpact: null, beneficiaries: null, actionTaken: 'All goals on track at time of review.' },
    me7f: { description: "Sara and Mark jointly set a $45K car savings goal targeting 2027. Funded from the brokerage account.", isShared: true, sharedWith: 'Mark Reed', isCritical: true, date: 'Feb 2025', membersAffected: 2, status: 'At Risk', aiInsight: "Goal is at risk due to recent brokerage account dip (~4% MoM). Consider a dedicated sinking fund rather than relying on the brokerage for this short-term goal.", aiActionLabel: 'Reassess Goal Timeline', members: 'Sara · Mark Reed', cashFlowImpact: '$500/mo target savings', beneficiaries: null, actionTaken: 'Goal recorded.', sentimentInsights: [{ name: 'Sara Reed', role: 'Co-client', keyword: 'Risk-averse', insight: 'The brokerage dip is a concern; prefers a stable, FDIC-insured vehicle rather than market-linked savings for near-term goals.' }] },
    me7g: { description: "Emma Reed born April 14, 2025. Sara entered maternity leave immediately following delivery.", isShared: true, sharedWith: 'Mark Reed · Emma Reed', isCritical: true, date: 'Apr 14, 2025', membersAffected: 3, status: 'No plan update', aiInsight: "Sara's maternity leave reduces household income by ~$4,200/mo for 4 months. No plan adjustment has been made for this income gap.", aiActionLabel: 'Review Cash-Flow Impact', members: 'Sara · Mark · Emma Reed', cashFlowImpact: '–$4,200/mo (maternity leave)', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record' },
    me7h: { description: "Sara's maternity leave began April 14, 2025, following Emma's birth. Employer provides 16 weeks of paid parental leave.", isShared: false, sharedWith: '', isCritical: false, date: 'Apr 2025', membersAffected: 1, status: 'Active', aiInsight: "Maternity leave reduces household cash flow by ~$4,200/mo. No emergency reserve drawdown plan has been initiated. Daycare costs of $2,800/mo will begin in approximately 6 months.", aiActionLabel: 'Review Cash-Flow Plan', members: 'Sara Reed', cashFlowImpact: '–$4,200/mo (partial income reduction)', beneficiaries: null, actionTaken: 'Leave period recorded. No cash-flow plan initiated.' },
    me7: { description: "Emma Reed born. Sara enters maternity leave immediately post-delivery. Household income reduced during leave period.", isShared: true, sharedWith: 'Mark Reed · Emma Reed', isCritical: true, date: 'Aug 2025', membersAffected: 3, status: 'No plan update', aiInsight: "Sara's maternity leave reduces household income. No cash-flow plan or short-term reallocation has been initiated. Daycare costs will begin in ~6 months.", aiActionLabel: 'Review Cash-Flow Impact', members: 'Sara · Mark · Emma Reed', cashFlowImpact: '–$4,200/mo (maternity leave)', beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record' },
    me8: { description: "Sara returned to work full-time after 10 months of maternity leave, restoring household income to pre-birth levels.", isShared: false, sharedWith: '', isCritical: false, date: 'Jun 2026', membersAffected: 1, status: 'Completed', aiInsight: "Sara's return to work restores household income. This is a good trigger to revisit the car goal timeline, 529 contributions, and Roth IRA funding for the year.", aiActionLabel: 'Revisit Household Plan', members: 'Sara Reed', cashFlowImpact: '+$4,200/mo income restored', beneficiaries: null, actionTaken: 'None on record' },
    me9a: { description: 'Emma Reed born April 14, 2025. First recorded life event for Emma as a household dependent.', isShared: true, sharedWith: 'Mark Reed · Sara Reed', isCritical: false, date: 'Apr 14, 2025', membersAffected: 3, status: 'Noted', aiInsight: "No 529 plan has been opened for Emma. Starting college savings now gives 18+ years of compounding before she reaches college age in 2043.", aiActionLabel: 'Open 529 Plan', members: 'Emma · Mark · Sara Reed', cashFlowImpact: null, beneficiaries: 'Not yet designated', actionTaken: 'Emma added as household dependent.' },
    me9: { description: "Emma's 1st birthday milestone. No formal planning event, but serves as a reminder to initiate 529 funding and update beneficiaries.", isShared: true, sharedWith: 'Mark Reed · Sara Reed', isCritical: false, date: 'Apr 2026', membersAffected: 3, status: 'Noted', aiInsight: "Emma turns 1 with no 529 plan or updated beneficiary designations on file. Opening a 529 now captures an additional year of compounding before the next annual review.", aiActionLabel: 'Open 529 Plan', members: 'Emma · Mark · Sara Reed', cashFlowImpact: null, beneficiaries: 'Not updated — Emma not named', actionTaken: 'None on record' },
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
            whatChanged: "Emma born Apr 2025; term-life purchased shortly after; 529 plan not yet opened; brokerage account down ~4% MoM; Sara absent from last two annual reviews.",
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
        agenticSummary: "Last 12 months: The household's focus shifted dramatically with Emma's birth in April 2025. Mark purchased term-life insurance shortly after, but gaps remain: no 529 plan has been opened for Emma, and protection planning hasn't been fully updated. Engagement has been Mark-only — Sara has been absent from the last two annual reviews — and the new-car goal is now at risk from a recent market dip.",
        agenticImpact: "The upcoming mid-year review is a high-value opportunity to address college funding for Emma, bring Sara into the planning conversation, and reassess the new-car goal timeline given the recent brokerage dip.",
        agenticSummaryAllTime: "All time (Mar 2019 – Jul 2026): The Reed household has grown from a $15K portfolio at onboarding to $280K AUM — a 17× increase driven by Mark's career progression and disciplined savings. Key milestones include joint brokerage setup (2020), emergency fund completion (2021), home purchase (2023), and Emma's birth (2025). The relationship has narrowed to Mark-only engagement since 2024; Sara has been absent from the last two annual reviews. The new-car goal ($45K, target 2027) is now at risk following a ~4% brokerage dip.",
        agenticImpactAllTime: "The 7-year relationship provides a strong foundation for a comprehensive household financial plan review. Addressing the post-birth planning gaps — 529, beneficiary updates, Sara re-engagement — before the next major life phase will be critical to sustaining long-term growth and household alignment.",
        nextBestActions: [],
        meetings: [
            {
                id: 'mtg1',
                title: 'Annual Review — Mark Reed',
                datetime: 'Oct 25, 2025 · 10:00 AM',
                description: 'Completed with Mark only. Sara absent for the second consecutive year. Key gaps — 529 funding, beneficiary updates — remain unaddressed.',
                status: 'Follow-Up Due',
                statusClass: 'c-mtg-badge c-mtg-badge_overdue',
                cardClass: 'c-mtg-item c-mtg-item_overdue',
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
                title: "Open 529 Savings Plan for Emma",
                description: "Emma was born in April 2025 — no 529 plan has been opened. Starting now maximises compounding over 17+ years before college.",
                actionLabel: 'Start 529 Plan',
            },
            {
                id: 'h2',
                badgeLabel: 'Opportunity',
                badgeClass: 'c-badge c-badge_opportunity',
                title: "Engage Sara in the Planning Conversation",
                description: "Sara has been absent from the last two annual reviews (2025, 2026). A dedicated 1:1 can re-anchor her as an active co-client.",
                actionLabel: 'Schedule 1:1 with Sara',
            },
            {
                id: 'h3',
                badgeLabel: 'Predicted',
                badgeClass: 'c-badge c-badge_predicted',
                title: "RSU Vesting — Tax & Investment Strategy",
                description: "Mark's 4-year RSU grant (flagged in Oct 2022 review) is expected to vest in Feb 2027 (~$40K net). Plan now for tax-efficient reinvestment.",
                actionLabel: 'Model RSU Reinvestment',
            },
            {
                id: 'h4',
                badgeLabel: 'Predicted',
                badgeClass: 'c-badge c-badge_predicted',
                title: "College Funding Gap — Start Contributions Now",
                description: "Emma enters college in 2043. With $0 in a 529 today, monthly contributions should start immediately to close the ~$300K gap.",
                actionLabel: 'Model 529 Scenarios',
            },
            {
                id: 'h5',
                badgeLabel: 'Alert',
                badgeClass: 'c-badge c-badge_alert',
                title: "New-Car Goal at Risk from Market Dip",
                description: "The $45K car goal (target 2027) relies on brokerage growth. A recent market dip has put the timeline at risk — rebalance or adjust.",
                actionLabel: 'Review Goal Funding',
            },
            {
                id: 'h6',
                badgeLabel: 'Alert',
                badgeClass: 'c-badge c-badge_alert',
                title: "Protection Plan Incomplete Post-Birth",
                description: "Mark added term life after Emma's birth, but Sara's coverage and beneficiary designations across all accounts haven't been reviewed.",
                actionLabel: 'Create Opportunity',
            },
        ],
        aiSuggestions: [
            {
                id: 'sug1',
                title: 'Open 529 Plan for Emma',
                member: 'Mark Reed',
                targetDate: 'Aug 2026',
                description: "Emma is now 6 months old with no 529 plan on file. Starting contributions of $200/mo today at a 7% assumed return could grow to $55K+ before Emma reaches college age — capturing 17+ years of compounding. Emma's birth was the ideal trigger; this gap has been open since April 2025.",
            },
            {
                id: 'sug2',
                title: 'Set Up Dependent Care FSA',
                member: 'Mark Reed',
                targetDate: 'Sep 2026',
                description: "~$5,000/yr of the daycare expense is eligible for DCFSA pre-tax treatment through Mark's employer. Immediate setup before open enrollment saves ~$1,200–$1,800/yr in federal taxes — a quick win to flag at the next touchpoint.",
            },
            {
                id: 'sug3',
                title: 'Update Beneficiaries + Will',
                member: 'Mark Reed',
                targetDate: 'Nov 2026',
                description: "Beneficiaries last updated August 2022 — before Emma was born. Emma is not named as beneficiary or contingent. No guardianship designation on record. Urgent hygiene given a 5-month-old dependent.",
            },
            {
                id: 'sug4',
                title: 'Engage Sara in Planning',
                member: 'Sara Reed',
                targetDate: 'Aug 2026',
                description: "Sara has missed two consecutive annual reviews (2024, 2025). A dedicated 1:1 before the next annual review restores co-client engagement and uncovers Sara-specific goals that haven't been discussed.",
            },
            {
                id: 'sug5',
                title: 'Reassess New-Car Goal Timeline',
                member: 'Mark Reed',
                targetDate: 'Jul 2026',
                description: "The $45K car savings goal (target: 2027) is at risk after a ~4% MoM brokerage dip. Recommend moving car savings to a dedicated sinking fund and reassessing the timeline to 2028.",
            },
        ],
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
                relationshipStrength: 'High',
                lastInteraction: 'Jul 7, 2026',
                upcomingLifeEvents: ['New Car Purchase 2027', 'Mid-Year Review Jul 2026'],
            },
            {
                id: 'rm2',
                name: 'Sara Reed',
                role: 'Spouse / Co-client',
                isPrimary: false,
                initials: 'SR',
                avatarStyle: 'background:#206476;color:#ffffff;',
                relationshipStrength: 'Low',
                lastInteraction: 'Apr 2025',
                upcomingLifeEvents: ['Re-engage in annual reviews'],
            },
            {
                id: 'rm3',
                name: 'Emma Reed',
                role: 'Daughter (dependent)',
                isPrimary: false,
                initials: 'ER',
                avatarStyle: 'background:#9a6a2e;color:#ffffff;',
                relationshipStrength: 'N/A',
                lastInteraction: 'Apr 2025 (born)',
                upcomingLifeEvents: ['College 2043 (529 not started)'],
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
                        reason: "Listed as beneficiary in Mark Reed's Term Life Insurance policy (May 2025). Birth record confirmed.",
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
                    { id: 'e1',  year: 2019, month: 'Mar 2019', label: 'Onboarding',      type: 'financial'    },
                    { id: 'e2',  year: 2020, month: 'Apr 2020', label: 'Joint Brokerage', type: 'financial'    },
                    { id: 'e3',  year: 2020, month: 'Nov 2020', label: 'Annual Review',   type: 'meeting'      },
                    { id: 'e4',  year: 2021, month: 'Jan 2021', label: 'Emergency Fund',  type: 'financial'    },
                    { id: 'e5',  year: 2022, month: 'Mar 2022', label: 'Job Promotion',   type: 'life'         },
                    { id: 'e6',  year: 2022, month: 'Oct 2022', label: 'Annual Review',   type: 'meeting'      },
                    { id: 'e7',  year: 2023, month: 'Jun 2023', label: 'Home Purchase',   type: 'life'         },
                    { id: 'e8',  year: 2024, month: 'Jan 2024', label: 'HSA Opened',      type: 'financial'    },
                    { id: 'e9',  year: 2024, month: 'Oct 2024', label: 'Annual Review',   type: 'meeting'      },
                    { id: 'e10', year: 2025, month: 'Feb 2025', label: 'Car Goal Set',    type: 'goal'         },
                    { id: 'e11', year: 2025, month: 'Apr 2025', label: 'Emma Born',       type: 'life'         },
                    { id: 'e12', year: 2025, month: 'May 2025', label: 'Term Life',       type: 'financial'    },
                    { id: 'e13', year: 2025, month: 'Oct 2025', label: 'Annual Review',   type: 'meeting'      },
                    { id: 'e14', year: 2026, month: 'Jun 2026', label: 'Mid-Year Review', type: 'meeting'      },
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
                    { id: 'e16', year: 2020, month: 'Nov 2020', label: 'Annual Review',  type: 'meeting'   },
                    { id: 'e17', year: 2022, month: 'Apr 2022', label: 'Roth IRA',       type: 'financial' },
                    { id: 'e18', year: 2022, month: 'Oct 2022', label: 'Annual Review',  type: 'meeting'   },
                    { id: 'e19', year: 2023, month: 'Jun 2023', label: 'Home Purchase',  type: 'life'      },
                    { id: 'e20', year: 2024, month: 'Oct 2024', label: 'Annual Review',  type: 'meeting'   },
                    { id: 'e21', year: 2025, month: 'Feb 2025', label: 'Car Goal Set',   type: 'goal'      },
                    { id: 'e22', year: 2025, month: 'Apr 2025', label: 'Emma Born',      type: 'life'      },
                ],
            },
            {
                memberId: 'm3',
                memberName: 'Emma Reed',
                memberRole: 'Dependent · Minor',
                initials: 'ER',
                avatarClass: 'c-member-avatar c-member-avatar_orange',
                ageLabel: 'Age 6 months',
                relationshipStrength: 'N/A',
                strengthClass: 'c-strength-dot c-strength-dot_na',
                events: [
                    { id: 'e23', year: 2025, month: 'Apr 2025', label: 'Emma Born',   type: 'life' },
                    { id: 'e24', year: 2027, month: 'Jan 2027', label: '529 Plan',    type: 'goal' },
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
                    { id: 'me1a', month: 'Mar 2019', label: 'Onboarding',        type: 'financial' },
                    { id: 'me1b', month: 'Apr 2020', label: 'Joint Brokerage',   type: 'financial' },
                    { id: 'me1c', month: 'Nov 2020', label: 'Annual Review',     type: 'meeting'   },
                    { id: 'me1d', month: 'Jan 2021', label: 'Emergency Fund',    type: 'financial' },
                    { id: 'me1e', month: 'Mar 2022', label: 'Job Promotion',     type: 'life'      },
                    { id: 'me1f', month: 'Oct 2022', label: 'Annual Review',     type: 'meeting'   },
                    { id: 'me1g', month: 'Jun 2023', label: 'Home Purchase',     type: 'life'      },
                    { id: 'me1h', month: 'Jan 2024', label: 'HSA Opened',        type: 'financial' },
                    { id: 'me1i', month: 'Oct 2024', label: 'Annual Review',     type: 'meeting'   },
                    { id: 'me1j', month: 'Feb 2025', label: 'Car Goal Set',      type: 'goal'      },
                    { id: 'me1k', month: 'Apr 2025', label: 'Emma Born',         type: 'life'      },
                    { id: 'me1l', month: 'May 2025', label: 'Term Life',         type: 'financial' },
                    { id: 'me1',  month: 'Aug 2025', label: 'Paternity Leave',   type: 'life'      },
                    { id: 'me2',  month: 'Oct 2025', label: 'Annual Review',     type: 'meeting'   },
                    { id: 'me3',  month: 'Nov 2025', label: 'Year-End Planning', type: 'meeting'   },
                    { id: 'me4',  month: 'Mar 2026', label: 'New Role',          type: 'life'      },

                    { id: 'me6',  month: 'Jun 2026', label: 'Mid-Year Check-in', type: 'meeting'   },
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
                    { id: 'me7a', month: 'Nov 2020', label: 'Annual Review',  type: 'meeting'   },
                    { id: 'me7b', month: 'Apr 2022', label: 'Roth IRA',       type: 'financial' },
                    { id: 'me7c', month: 'Oct 2022', label: 'Annual Review',  type: 'meeting'   },
                    { id: 'me7d', month: 'Jun 2023', label: 'Home Purchase',  type: 'life'      },
                    { id: 'me7e', month: 'Oct 2024', label: 'Annual Review',  type: 'meeting'   },
                    { id: 'me7f', month: 'Feb 2025', label: 'Car Goal Set',   type: 'goal'      },
                    { id: 'me7g', month: 'Apr 2025', label: 'Emma Born',      type: 'life'      },
                    { id: 'me7h', month: 'Apr 2025', label: 'Mat. Leave',     type: 'life'      },
                    { id: 'me7',  month: 'Aug 2025', label: 'Post-Mat. Leave', type: 'life'     },
                    { id: 'me8',  month: 'Jun 2026', label: 'Return to Work', type: 'life'      },
                ],
            },
            {
                memberId: 'm3',
                memberName: 'Emma Reed',
                memberRole: 'Dependent · Minor',
                initials: 'ER',
                avatarClass: 'c-member-avatar c-member-avatar_orange',
                ageLabel: 'Age 6 months',
                relationshipStrength: 'N/A',
                strengthClass: 'c-strength-dot c-strength-dot_na',
                events: [
                    { id: 'me9a', month: 'Apr 2025', label: 'Born',         type: 'life' },
                    { id: 'me9',  month: 'Apr 2026', label: '1st Birthday', type: 'life' },
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
const TIMELINE_MONTHS   = _buildMonthRange(2019, 1, 2026, 12); // 96 months
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
            { id: 's1',  text: "The household's focus shifted dramatically with ",                  bold: false },
            { id: 's2',  text: "Emma's birth in April 2025",                                        bold: true  },
            { id: 's3',  text: ". Mark purchased ",                                                 bold: false },
            { id: 's4',  text: "term-life insurance",                                               bold: true  },
            { id: 's5',  text: " shortly after, but gaps remain: ",                                 bold: false },
            { id: 's6',  text: "no 529 plan",                                                       bold: true  },
            { id: 's7',  text: " has been opened for Emma, and protection planning hasn't been fully updated. Engagement has been ", bold: false },
            { id: 's8',  text: "Mark-only",                                                         bold: true  },
            { id: 's9',  text: " (Sara absent from the ",                                           bold: false },
            { id: 's10', text: "last two annual reviews",                                           bold: true  },
            { id: 's11', text: "), and the ",                                                       bold: false },
            { id: 's12', text: "new-car goal",                                                      bold: true  },
            { id: 's13', text: " is now ",                                                          bold: false },
            { id: 's14', text: "at risk",                                                           bold: true  },
            { id: 's15', text: " from a recent market dip. The upcoming ",                         bold: false },
            { id: 's16', text: "mid-year review",                                                   bold: true  },
            { id: 's17', text: " presents an opportunity to address college funding, bring Sara into the planning conversation, and reassess the new-car goal timeline.", bold: false },
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
        return TIMELINE_MONTHS.map((m, idx) => {
            const isToday     = m === CURRENT_MONTH;
            const isPredicted = idx > CURRENT_MONTH_IDX;
            const isYearStart = m.startsWith('Jan ');
            const year        = m.split(' ')[1]; // e.g. '2020'
            return {
                key: m,
                label: m.slice(0, 3),
                year,
                isYearStart,
                yearLabelClass: 'c-timeline-year-label',
                isToday,
                isPredicted,
                showTodayPill: isToday,
                headerCellClass: 'c-timeline-year-col c-timeline-header__cell'
                    + (isYearStart  ? ' c-timeline-header__cell_year-start' : '')
                    + (isToday      ? ' c-timeline-header__cell_today'      : '')
                    + (isPredicted  ? ' c-timeline-header__cell_predicted'  : ''),
            };
        });
    }

    get timelineYears() { return this.timelineColumns; }

    get timelineRows() {
        const cols = this.timelineColumns;
        const PILL = {
            life:        'c-event-pill c-event-pill_life',
            meeting:     'c-event-pill c-event-pill_meeting',
            transaction: 'c-event-pill c-event-pill_transaction',
            goal:        'c-event-pill c-event-pill_goal',
            financial:   'c-event-pill c-event-pill_financial',
        };
        const TYPE_DOT = {
            life:        'c-type-dot c-type-dot_life',
            meeting:     'c-type-dot c-type-dot_meeting',
            transaction: 'c-type-dot c-type-dot_transaction',
            goal:        'c-type-dot c-type-dot_goal',
            financial:   'c-type-dot c-type-dot_financial',
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
                        return {
                            ...e,
                            pillClass:    PILL[e.type] || PILL.financial,
                            detail:       det,
                            isCritical:   !!(det?.isCritical),
                            typeDotClass: TYPE_DOT[e.type] || 'c-type-dot',
                        };
                    });

                /* Merge in events from accepted AI suggestions */
                const mergedSugEvts = addedSugEvents
                    .filter((ae) => ae.memberId === m.memberId &&
                        (this.isYearlyMode ? ae.yearKey === col.key : ae.monthKey === col.key))
                    .map((ae) => ({
                        ...ae,
                        pillClass:    (PILL[ae.type] || PILL.goal) + ' c-event-pill_suggestion',
                        detail:       null,
                        isCritical:   false,
                        typeDotClass: TYPE_DOT[ae.type] || 'c-type-dot',
                    }));

                /* Apply timeline type filter */
                const TYPE_FILTER_MAP = { life: 'life', meeting: 'meeting', goal: 'goal', financial: 'financial' };
                const filterType = TYPE_FILTER_MAP[this._activeFilter] || null;
                const allEvts = [...evts, ...mergedSugEvts]
                    .filter(e => !filterType || e.type === filterType);

                /* Sparkle indicators for pending AI suggestions in this cell */
                const sparkles = pendingSugs.filter((s) => {
                    const memberMatch  = s.member === m.memberName;
                    const periodMatch  = this.isYearlyMode
                        ? this._getYearFromDate(s.targetDate) === col.key
                        : s.targetDate === col.key;
                    return memberMatch && periodMatch;
                });

                const uniqueTypes = [...new Set(allEvts.map((e) => e.type))];
                return {
                    key:  `${m.memberId}-${col.key}`,
                    year: col.key,
                    cellClass: 'c-timeline-year-col c-timeline-row__cell'
                        + (col.isYearStart && !col.isToday   ? ' c-timeline-row__cell_year-start' : '')
                        + (col.isToday && this.isYearlyMode  ? ' c-timeline-row__cell_today_yr'   : '')
                        + (col.isToday && !this.isYearlyMode ? ' c-timeline-row__cell_today'       : '')
                        + (col.isPredicted ? ' c-timeline-row__cell_predicted' : ''),
                    events:      allEvts,
                    eventCount:  allEvts.length,
                    // typeDots only shown in yearly collapsed view (auto-hidden by CSS in monthly/drill)
                    typeDots:    uniqueTypes.map((t) => ({ type: t, dotClass: TYPE_DOT[t] || 'c-type-dot' })),
                    showCount:   this.isYearlyMode && allEvts.length > 0,
                    showEvents:  !this.isYearlyMode,   // drill + monthly both show events directly
                    showAdd:     allEvts.length === 0 && col.isPredicted && sparkles.length === 0 && !this.isYearlyMode,
                    sparkles,
                    hasSparkles: sparkles.length > 0,
                    hasConnectorBelow: false, // filled in post-process
                    hasConnectorAbove: false, // filled in post-process
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

    @track _agentforceOpen  = false;
    @track _newMenuOpen     = false;
    @track _newEventType    = null;   // 'life-event' | 'goal' | 'financial-product'
    @track _filterMenuOpen  = false;
    @track _activeFilter    = 'all';  // 'all' | 'life' | 'meeting' | 'goal' | 'financial'
    @track popoverVisible   = false;
    @track popoverEventData = null;
    popoverPanelStyle       = '';
    popoverArrowRight       = false;

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
                const e = cell.events.find((ev) => ev.id === eventId);
                if (e) { found = e; break; }
            }
            if (found) break;
        }
        if (!found) return;
        this.popoverEventData = found;
        this.popoverVisible   = true;
    }

    get agentforceOpen() { return this._agentforceOpen; }
    handleAskAgentforce()   { this._agentforceOpen = true; }
    handleCloseAgentforce() { this._agentforceOpen = false; }

    // ── New Event dropdown & modal ─────────────────────────────────
    get newMenuOpen()          { return this._newMenuOpen; }
    get newEventModalOpen()    { return this._newEventType !== null; }
    get newEventIsLifeEvent()  { return this._newEventType === 'life-event'; }
    get newEventIsGoal()       { return this._newEventType === 'goal'; }
    get newEventIsFinancialProduct() { return this._newEventType === 'financial-product'; }

    get newEventTypeLabel() {
        if (this._newEventType === 'life-event')        return 'Life Event';
        if (this._newEventType === 'goal')              return 'Goal';
        if (this._newEventType === 'financial-product') return 'Financial Product';
        return 'Event';
    }

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
        const map = { all: 'Show All', life: 'Life Event', meeting: 'Meeting', goal: 'Financial Goal', financial: 'Financial Account' };
        return map[this._activeFilter] || 'Show All';
    }
    get filterOptions() {
        return [
            { value: 'all',       label: 'Show All'          },
            { value: 'life',      label: 'Life Event'        },
            { value: 'meeting',   label: 'Meeting'           },
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

    handleToggleNewMenu(event) {
        event.stopPropagation();
        this._newMenuOpen = !this._newMenuOpen;
    }

    handleNewEventType(event) {
        event.stopPropagation();
        this._newEventType = event.currentTarget.dataset.type;
        this._newMenuOpen  = false;
    }

    handleCloseNewEventModal() {
        this._newEventType = null;
    }

    handleClosePopover() {
        this.popoverVisible   = false;
        this.popoverEventData = null;
    }

    // ── AI Suggestions panel ─────────────────────────────────────────
    @track aiSuggestionsOpen      = false;
    @track _addedSuggestionIds    = {};
    @track _dismissedSuggestions  = {};
    @track focusedSuggestionId    = null;
    @track _addedToTimelineEvents = {};  // { [sugId]: event object }

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
                isAdded:   !!this._addedSuggestionIds[s.id],
                isFocused: s.id === this.focusedSuggestionId,
                cardClass: 'c-aip-card'
                    + (s.id === this.focusedSuggestionId ? ' c-aip-card_focused' : ''),
            }));
    }

    get aiSuggestionsCount() {
        return this.aiSuggestions.filter((s) => !s.isAdded).length;
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

    get aiSuggestionsBtnClass() {
        return this.aiSuggestionsOpen
            ? 'c-ai-suggestions-btn c-ai-suggestions-btn_active'
            : 'c-ai-suggestions-btn';
    }

    handleToggleAiSuggestions() {
        this.aiSuggestionsOpen = !this.aiSuggestionsOpen;
        if (!this.aiSuggestionsOpen) this.focusedSuggestionId = null;
    }

    handleCloseAiSuggestions() {
        this.aiSuggestionsOpen   = false;
        this.focusedSuggestionId = null;
    }

    /* Sparkle click: open panel focused on that specific suggestion */
    handleSparkleClick(event) {
        event.stopPropagation();
        const sugId = event.currentTarget.dataset.sugId;
        this.focusedSuggestionId = sugId;
        this.aiSuggestionsOpen   = true;
    }

    handleSuggestionAdd(event) {
        const id  = event.detail.id;
        this._addedSuggestionIds = { ...this._addedSuggestionIds, [id]: true };

        /* Convert suggestion into a timeline event that appears in the matching cell */
        const sug      = (this._enrichment?.aiSuggestions || []).find((s) => s.id === id);
        const memberId = sug ? this._getMemberIdByName(sug.member) : null;
        if (sug && memberId) {
            this._addedToTimelineEvents = {
                ...this._addedToTimelineEvents,
                [id]: {
                    id:         `sug-evt-${id}`,
                    memberId,
                    monthKey:   sug.targetDate,                       // e.g. 'Aug 2026'
                    yearKey:    this._getYearFromDate(sug.targetDate), // e.g. 2026
                    label:      sug.title,
                    type:       this._getSugType(sug.title),
                    isSuggestionAdded: true,
                },
            };
        }
        /* Keep panel open so user sees the "Added ✓" confirmation */
    }

    handleSuggestionDismiss(event) {
        const id = event.detail.id;
        this._dismissedSuggestions = { ...this._dismissedSuggestions, [id]: true };
        if (this.focusedSuggestionId === id) this.focusedSuggestionId = null;
    }

    handleYearExpand(event) {
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
    renderedCallback() {
        if (this._pendingScrollColIdx !== null) {
            const colIdx = this._pendingScrollColIdx;
            this._pendingScrollColIdx = null;
            // Defer so the grid has fully painted and scrollWidth is correct
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => {
                const body = this.template.querySelector('.c-group-timeline__body');
                if (!body) return;
                const COL_W_PX    = 8.5 * 16; // 136px — must match CSS grid column width
                const MEMBER_W_PX = 12  * 16; // 192px — must match CSS member column width
                // Center the target column in the visible scroll area
                const visibleW = body.offsetWidth - MEMBER_W_PX;
                const colCenter = MEMBER_W_PX + colIdx * COL_W_PX + COL_W_PX / 2;
                const target    = colCenter - MEMBER_W_PX - visibleW / 2;
                body.scrollLeft = Math.max(0, Math.round(target));
            }, 80);
        }
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
