import { Bill } from "./types";

export const MOCK_BILLS: Bill[] = [
  {
    id: "CA-SB-567",
    title: "CA SB-567: Tenant Protection & Rent Stabilization Act",
    source: "STATE",
    date: "2026-04-18",
    relevanceScore: 9,
    summary:
      "Expands rent stabilization to cover apartments built before 2005, caps annual rent increases at 3%, and strengthens just-cause eviction protections statewide.",
    fullText: `CALIFORNIA SENATE BILL 567
AN ACT to amend Section 1946.2 of the Civil Code, relating to tenancy.

LEGISLATIVE COUNSEL'S DIGEST
SB 567, as introduced, would expand rent stabilization protections to residential properties built before January 1, 2005, reduce the annual allowable rent increase cap from 5% + CPI to 3% + CPI (not to exceed 5%), expand just-cause eviction protections to all residential tenants regardless of length of tenancy, require landlords to provide 90 days notice for no-fault evictions, establish a state-funded relocation assistance program for displaced tenants, and create enforcement mechanisms with civil penalties up to $10,000 per violation.

These protections would apply to single-family homes and condominiums in addition to multi-unit residential buildings, and would supersede any local ordinances that provide lesser protections. The bill would appropriate $50 million from the General Fund to the Department of Housing and Community Development for implementation.

Existing law, the Tenant Protection Act of 2019, limits rent increases to 5% plus the local Consumer Price Index, or 10%, whichever is lower, and requires just cause for eviction of tenants who have continuously occupied a residential real property for 12 months. This bill would substantially strengthen those protections and extend them to a broader class of tenants.`,
  },
  {
    id: "CA-AB-2176",
    title: "CA AB-2176: University Student Housing Emergency Fund",
    source: "STATE",
    date: "2026-04-15",
    relevanceScore: 8,
    summary:
      "Allocates $200M to UCs and CSUs for emergency student housing, caps on-campus rent at 25% of average student income, and mandates 3,000 new dorm beds by 2028.",
    fullText: `CALIFORNIA ASSEMBLY BILL 2176
AN ACT relating to student housing at public universities.

This bill allocates $200,000,000 from the California General Fund to the University of California and California State University systems for emergency student housing initiatives. Key provisions include: caps on-campus housing costs at 25% of median student income, requires each UC and CSU campus to add a minimum of 300 new on-campus housing units by 2028, establishes an emergency housing voucher program for students experiencing housing insecurity, prohibits universities from evicting students for nonpayment during academic finals periods, creates a student housing ombudsman office at each campus, and mandates annual reporting on student homelessness rates. The bill responds to findings that 1 in 5 UC students and 1 in 3 CSU students experience housing insecurity, with disproportionate impacts on first-generation and low-income students.`,
  },
  {
    id: "FED-HR-4521",
    title: "Federal HR-4521: SNAP Benefits Modernization Act",
    source: "FEDERAL",
    date: "2026-04-20",
    relevanceScore: 8,
    summary:
      "Increases SNAP maximum allotments by 15%, expands eligibility to gig workers and undocumented immigrants in mixed-status families, and adds mobile app access.",
    fullText: `HOUSE RESOLUTION 4521 - 119th Congress
SNAP BENEFITS MODERNIZATION ACT OF 2026

Be it enacted by the Senate and House of Representatives of the United States of America in Congress assembled:

SECTION 1. This Act may be cited as the SNAP Benefits Modernization Act of 2026.

SECTION 2. BENEFIT INCREASES. The Secretary of Agriculture shall increase maximum allotments under the supplemental nutrition assistance program by 15 percent above the June 2025 baseline.

SECTION 3. ELIGIBILITY EXPANSION. Eligibility shall be extended to: (a) gig economy workers with variable income, using a 6-month rolling average income calculation; (b) individuals in mixed-status households, including undocumented family members when calculating household need; (c) formerly incarcerated individuals within 24 months of release.

SECTION 4. MODERNIZATION. USDA shall develop a mobile application for SNAP enrollment and benefit management, accept online grocery delivery as a qualifying purchase, and eliminate in-person interview requirements for renewals.

SECTION 5. APPROPRIATIONS. There is hereby appropriated $8,000,000,000 over 5 years to carry out this Act.`,
  },
  {
    id: "BERK-CC-2026-12",
    title: "Berkeley City Council: Universal Childcare Subsidy Program",
    source: "LOCAL",
    date: "2026-04-21",
    relevanceScore: 7,
    summary:
      "Provides income-based childcare subsidies up to $1,800/month for Berkeley families, funds 500 new childcare slots, and prioritizes single-parent households.",
    fullText: `CITY OF BERKELEY RESOLUTION NO. 2026-12
ESTABLISHING A UNIVERSAL CHILDCARE SUBSIDY PROGRAM

WHEREAS, the average cost of childcare in Berkeley exceeds $2,400 per month per child, placing it out of reach for working- and middle-class families;

WHEREAS, single-parent households face disproportionate childcare burden, with many forced to reduce work hours or leave the workforce entirely;

NOW THEREFORE BE IT RESOLVED that the City of Berkeley shall: establish a Universal Childcare Subsidy Program providing monthly subsidies of up to $1,800 per child for families earning up to 300% of the Federal Poverty Level; contract with 20 additional licensed childcare providers to create 500 new subsidized slots prioritized for single-parent households, foster families, and families with children with disabilities; establish a multilingual outreach program to ensure access for non-English-speaking families; and appropriate $12,000,000 from the City's General Fund for the first year of operation.`,
  },
  {
    id: "FED-S-1234",
    title: "Federal S-1234: Student Loan Interest Rate Cap Act",
    source: "FEDERAL",
    date: "2026-04-19",
    relevanceScore: 7,
    summary:
      "Caps student loan interest rates at 4% for undergrad and 5% for grad loans, retroactive to existing borrowers, and introduces income-share repayment option.",
    fullText: `SENATE BILL 1234 - 119th Congress
STUDENT LOAN INTEREST RATE CAP ACT OF 2026

SECTION 1. PURPOSE. To reduce the burden of student loan debt by capping interest rates and providing flexible repayment options.

SECTION 2. INTEREST RATE CAPS. Effective July 1, 2026: (a) Federal undergraduate student loan interest rates shall not exceed 4.0% per annum; (b) Federal graduate student loan interest rates shall not exceed 5.0% per annum; (c) These caps apply retroactively to all existing federal student loan balances, and loan servicers must recalculate monthly payments accordingly within 90 days of enactment.

SECTION 3. INCOME-SHARE OPTION. Borrowers may elect an income-share repayment arrangement not to exceed 8% of gross income for a maximum of 20 years, after which remaining balances are forgiven.

SECTION 4. PELL GRANT EXPANSION. Maximum Pell Grant award increased to $8,500 annually.`,
  },
];

export const SYNC_STEPS = [
  { label: "Connecting to OpenStates API…", duration: 600 },
  { label: "Fetching Congress.gov feed…", duration: 700 },
  { label: "Pulling Berkeley Legistar…", duration: 500 },
  { label: "Running AI triage on 150 bills…", duration: 900 },
  { label: "5 high-priority bills flagged", duration: 400 },
];
