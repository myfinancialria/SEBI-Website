# Compliance map — what is on the page and why

Every mandatory element below was verified against the **current** SEBI source, not a secondary
summary. Where a checklist site (arihantintellect.com) and SEBI differ, SEBI is followed and the
difference is noted.

**Primary sources used**

| # | Document | Number | Date |
|---|---|---|---|
| S1 | [Master Circular for Investment Advisers](https://www.sebi.gov.in/legal/master-circulars/feb-2026/master-circular-for-investment-advisers_99569.html) | HO/38/12/11(2)2026-MIRSD-POD/I/4300/2026 | 06 Feb 2026 |
| S2 | [Master Circular for Research Analysts](https://www.sebi.gov.in/legal/master-circulars/feb-2026/master-circular-for-research-analysts_99571.html) | HO/38/12/11(1)2026-MIRSD-POD/I/4360/2026 | 06 Feb 2026 |
| S3 | [RPwD Act 2016 — mandatory compliance by all Regulated Entities](https://www.sebi.gov.in/legal/circulars/aug-2025/) | SEBI/HO/ITD-1/ITD_VIAP/P/CIR/2025/111 | 31 Jul 2025 |
| S4 | [Extension of timelines + reporting authority for IAs and RAs](https://www.sebi.gov.in/legal/circulars/aug-2025/extension-of-timelines-and-update-of-reporting-authority-for-ias-and-ras-w-r-t-sebi-circular-for-compliance-to-digital-accessibility-circular-rights-of-persons-with-disabilities-act-2016-and-rules-_96353.html) | SEBI/HO/ITD-1/ITD_VIAP/P/CIR/2025/121 | 29 Aug 2025 |
| S5 | [Compliance Guidelines for Digital Accessibility](https://www.sebi.gov.in/legal/circulars/sep-2025/compliance-guidelines-for-digital-accessibility-circular-rights-of-persons-with-disabilities-act-2016-and-rules-made-thereunder-mandatory-compliance-by-all-regulated-entities-dated-july-31-2025-_96862.html) | SEBI/HO/ITD-1/ITD_VIAP/P/CIR/2025/131 | 25 Sep 2025 |
| S6 | [Clarification on the Digital Accessibility circulars](https://www.sebi.gov.in/legal/circulars/dec-2025/clarification-on-the-digital-accessibility-circulars-of-sebi_98238.html) | HO/13/19/13(2)2025-ITD-1_VIAP/I/187/2025 | 08 Dec 2025 |
| S7 | [Extension of timelines w.r.t. Digital Accessibility Circulars](https://www.sebi.gov.in/legal/circulars/jul-2026/extension-of-timelines-with-repect-to-compliance-of-digital-accessibility-circulars-_103277.html) | HO/(411)2026-ITD-5_DIV2/I/17922/2026 | 31 Jul 2026 |
| S8 | [Standardised, Validated and Exclusive UPI IDs for payment collection](https://www.sebi.gov.in/legal/circulars/jun-2025/adoption-of-standardised-validated-and-exclusive-upi-ids-for-payment-collection-by-sebi-registered-intermediaries-from-investors_94535.html) | SEBI/HO/DEPA-II/DEPA-II_SRG/P/CIR/2025/86 | 11 Jun 2025 |
| S9 | Interim arrangement for certified past performance of IAs before PaRRVA is operational (carried in S1 ¶25) | HO/38/12/11(1)2025-MIRSD-POD/I/73/2025 | 30 Oct 2025 |

## A. Mandatory on the website — Investment Adviser (live now)

| # | Requirement | Source | Where it is on the page |
|---|---|---|---|
| 1 | Maintain a functional website (Reg. 19A) containing the details SEBI specifies | S1 ¶1(xvi) | The site itself |
| 2 | Display prominently: complete name as registered with SEBI, type of registration, registration number, validity, complete address with telephone numbers, Principal Officer contact details, corresponding SEBI regional/local office address | S1 ¶1(xvii) | Its own section, "Registration and regulatory particulars" (`#registration`), linked from the footer and repeated in full there. The header carries only About, Services, Fees, Process and Enquiry; SEBI prescribes the content, not a header link |
| 3 | Complaint data **on the homepage, without scrolling**, in font size 12 or above, monthly within 7 days of the previous month end, in the Annexure C format | S1 ¶2.4 + ¶7.5, Annexure C | Split, at your instruction, into two places: a one-line strip directly under the header carrying **all six Annexure C grand-total figures** plus the month, at 12px, visible without scrolling (bottom edge at 115px); and the full Annexure C table, with the three source rows and the impersonation line, at the head of the complaints section (`#complaint-status`). Both are fed from the same database record. **Read the note below this table** |
| 4 | Annexure C trend tables — monthly disposal and annual disposal | S1 Annexure C | "Trend of complaint disposal" (`#complaints`) — the last six months in the open table, every month since registration inside the "all months" panel, then the annual table. Data starts September 2026 |
| 5 | Impersonation-complaint count disclosed with the monthly table | S1 Annexure C, note | Line directly under the monthly table |
| 6 | Publish the Investor Charter (Annexure F) on the website | S1 ¶7.4, Annexure F | "Investor Charter in respect of Investment Advisers" (`#charter`) — reproduced in full, collapsed into a native `<details>` accordion (parts A–F open individually, on the same page). Collapsed text is still in the HTML, is found by search engines and by Ctrl+F in Chrome, and prints expanded |
| 7 | Grievance redressal display: compliance officer, proprietor, SCORES, SEBI offices, toll-free 1800 22 7575 / 1800 266 7575 | S1 ¶6.2 | "Dear Investor" block inside `#grievance`, plus the escalation matrix |
| 8 | SCORES 2.0 and Smart ODR routes, with the 21-day redressal timeline | S1 ¶6.3, Annexure F(D) | Escalation matrix and Charter section D |
| 9 | Name, logo, registration number and complete address with telephone prominently on the website | S1 ¶10.2(i) | Header, particulars list, footer |
| 10 | Website disclaimer, verbatim: *"Registration granted by SEBI, enlistment with BSE and certification from NISM in no way guarantee performance of the IA or provide any assurance of returns to investors"* | S1 ¶10.2(iii) | Disclosures section and footer |
| 11 | Standard warning, verbatim and at 10pt or larger: *"Investment in securities market are subject to market risks. Read all the related documents carefully before investing"* | S1 ¶10.1(b)(iii) | Disclosures section (13.5px) and footer (13px) |
| 12 | Advertisement content rules — no false/misleading statements, no projections, no testimonials, no assured returns | S1 ¶10.1(c) | Whole page written to this rule; stated in the "Advertisement code" disclosure |
| 13 | Where securities are shown as examples: *"The securities quoted are for illustration only and are not recommendatory"* | S1 ¶10.1(b)(vii) | Under the platform link and in the footer |
| 14 | SEBI logo must not be used | S1 ¶10.2(iv) | No SEBI logo anywhere; the favicon is the MyFinancial mark |
| 15 | Membership number of the SEBI-recognised supervisory body must be on the website | S1 ¶10.1(b)(vi) | Particulars list + footer — **placeholder to fill** |
| 16 | Publish the status of the annual compliance audit report, and any adverse findings with action taken | S1 ¶1(xiv)(d) | "Annual compliance audit" card in Disclosures — **placeholder to update** |
| 17 | MITC disclosed to clients (part of the advisory agreement) | S1 Annexure B | "MITC — Investment Advisory" (`#terms`) — reproduced in full |
| 18 | Fee limits, fee modes, advance and breakage, banking-channel-only, no cash, CeFCoM | S1 ¶2.3, Annexure B ¶6–8 | Fees section |
| 19 | No free trial, no part payment | S1 ¶2.1 | Fees section note and Process step 1 |
| 20 | Risk profiling and consent before advice | S1 ¶2.2 | Process steps 3–4 |
| 21 | Client-level segregation of advice and distribution | S1 ¶1(i), Annexure B ¶11 | "Client-level segregation" disclosure |
| 22 | Disclosure of the extent of AI-tool use | S1 Annexure F(C) | "Artificial intelligence" disclosure — **edit to match reality** |
| 23 | Services outside SEBI's purview flagged, with "no recourse to SEBI" | S1 Annexure B ¶4 | "Scope of regulation" note in Services and in the footer |
| 24 | Obtain and make available a validated `@valid` UPI ID; create awareness about it and about SEBI Check on the website | S8 ¶1.3, ¶6.1.4–6.1.5 | Fees section, "Validated UPI ID" row — **placeholder to fill** |
| 25 | Digital accessibility — WCAG AA level on investor-facing platforms, audit by IAAP-certified professional, remediation, accessibility complaints via SCORES | S3, S5, S6; deadline extended to **31 Oct 2026** by S7 | The page is built to WCAG 2.1 AA (0 contrast failures in both themes, keyboard operable, reflows to 320px). The accessibility *statement* section was removed at your request — **the audit and remediation obligation stands**, reported to BSE Ltd |

| 26 | **No past performance, return or risk figure may be put before the general public through the website** or any medium. Until PaRRVA-verified metrics exist, certified past performance may be given to a client or prospective client only one-to-one, on specific request, certified by an ICAI/ICMAI member, with SEBI's prescribed disclaimer | S1 ¶24 and ¶25 (S9) | The site publishes no performance figure at all. The "Past performance" card in Disclosures states the rule, so an inspector can see it is understood rather than merely unbreached |
| 27 | Website must not promise assured returns, carry testimonials, performance claims or superlatives | S1 ¶10.1(c) | Applies to the new fee cards too: they state the price and what is included, nothing about outcomes |
| 28 | Enquiry data (name, email, phone) is personal data | DPDP Act, 2023 | Explicit consent checkbox, purpose stated next to the form, a deletion route given, stored in your own SQLite database — never in a third-party form service |

### Note on where the complaint data sits

SEBI's wording in ¶2.4 is "on the homepage (without scrolling)". The safest reading is the whole Annexure C
table in the first screen. You asked twice for it to come lower so the page opens with the practice rather
than a compliance table, which is your call to make — this is the arrangement that carries the least
regulatory risk while doing what you asked:

- the **grand-total row of Annexure C** — pending at start, received, resolved, pending, pending over three
  months, average resolution days — plus the month, sits in a 37px strip under the header, at 12px, with no
  scrolling on any screen;
- the **full table**, with the split by source and the impersonation count, is one click away and is on the
  same page, as ¶2.4 requires;
- both are generated from one database record, so they can never disagree.

If an inspection ever pushes back, moving the full table up is a two-minute change — the block is
self-contained (`#complaint-status`). Deleting the strip instead is a five-line change, and I would not.

## B. Cross-check against the arihantintellect.com checklists

| Their claim | SEBI position | Verdict |
|---|---|---|
| Accessibility audit deadline 31 October 2026 | S7 grants extension for "Conduct of Accessibility Audit … and Remediation of findings" to 31 Oct 2026 | **Correct** |
| WCAG 2.2 AA required | S3/S5 require WCAG **2.1** "or the latest version" at AA level, with GIGW and IS 17802 | Directionally right; 2.1 AA is the stated floor. This site targets 2.1 AA and follows 2.2 practice where it costs nothing |
| Complaint data must be a readable table on your own domain, updated by the 7th | S1 ¶2.4 — homepage, without scrolling, font ≥12, within 7 days of month end | **Correct, and stricter than they state** (homepage, no scrolling, minimum font size) |
| Investor Charter to be published | S1 ¶7.4 | **Correct** |
| MITC to be surfaced | S1 Annexure B — MITC forms part of the agreement and is informed to clients; publishing it on the site is good practice, not a separate website mandate | Correct in substance |
| "Registration & BASL details, escalation matrix, SCORES/ODR links" | S1 ¶1(xvii), ¶6.2, ¶10.1(b)(vi) | **Correct** |
| IAAP-certified auditors | S5 Table C2 names IAAP certification explicitly | **Correct** |
| Fee collection with PAN verification, eSign, auto-invoices, recommendation register, public-appearance register | These are back-office/record-keeping obligations (and RA-side registers), not website display items | Not website items — keep them in your records, not on the page |
| Reporting of accessibility status to SEBI | For IAs and RAs the reporting authority is **BSE Ltd**, not SEBI directly (S4, S6 Annexure A) | Their pages imply SEBI; **BSE is correct for you** |

## C. Additional items that become mandatory when the RA registration is granted

See `RA-ACTIVATION.md`. All of this content is already written into `docs/index.html` and is revealed by
one attribute change.

| # | Requirement | Source |
|---|---|---|
| R1 | Functional website with the specified details (Reg. 19A of the RA Regulations) | S2 ¶1.15 |
| R2 | Name, logo, registration number, complete address with telephone prominently on the website | S2 ¶11.2(i) |
| R3 | Disclaimer: *"Registration granted by SEBI, enlistment with BSE and certification from NISM in no way guarantee performance of the intermediary or provide any assurance of returns to investors"* | S2 ¶11.2(iii) |
| R4 | Complaint data in the Annexure E format, disclosed by the 7th of the succeeding month | S2 Annexure E |
| R5 | Investor Charter for Research Analysts | S2 Annexure D |
| R6 | Minimum mandatory terms and conditions + MITC for research services | S2 Annexure B, incl. ¶12 |
| R7 | RA fee cap ₹1,51,000 p.a. per family; advance limited to one quarter | S2 Annexure B ¶4(iv), ¶12(ii)–(iii) |
| R8 | Research-report disclosures under Reg. 19 (holdings, conflicts, compensation) | RA Regulations, Reg. 19 |
| R9 | Publish compliance-audit status and adverse findings on the website | S2 ¶1.14(d) |
| R10 | Model portfolio guidelines, if a model portfolio is published | S2 Annexure A |

## D. Things deliberately **not** on the page

- **No SEBI logo** (prohibited).
- **No performance figures, past returns, projections, testimonials, awards or client counts** — all of
  these are advertisement-code violations for an IA unless verified through PaRRVA, and none are needed.
- **No "free trial", no discounts, no limited-period offers** (prohibited / discouraged).
- **No third-party analytics, fonts or scripts** — the page makes zero external network requests, which
  keeps visitor data on the visitor's machine and removes a class of security findings.
- **No screener or market-data section** — the public data platform is not linked from this page, so
  nothing here has to carry the "securities quoted are for illustration only" caveat in context. The
  caveat stays in the footer because the practice does publish data elsewhere.
- **No accessibility statement section** — removed at your request. Note that this removes the page's
  own account of its conformance, not the SEBI obligation behind it.

## E. What moved into the database

| Thing | Where it lives now | Why it matters |
|---|---|---|
| Monthly complaint figures | `complaints` / `complaint_months` tables, edited in the admin panel | The 7th-of-the-month obligation becomes a two-minute form instead of an HTML edit |
| Enquiries | `enquiries` table, with consent recorded and a CSV export | Evidence of what a prospect asked for, before any advice was given |
| BASL number, UPI ID, audit status, RA details | `settings` table | The amber placeholders on the page fill themselves once these are set |

The HTML keeps a complete copy of the published figures as a fallback, so a database outage cannot take
the mandatory disclosures off the page.
