# Switching the site to RIA + RA

Every Research Analyst block is **already written into `index.html`** and sits in the page source today.
It is hidden by one CSS rule, not by JavaScript, so nothing breaks if scripts are blocked and the content
is there for anyone auditing the source.

## Step 1 — flip one attribute

Line 2 of `index.html`:

```html
<html lang="en-IN" data-ra-status="pending">
```

becomes

```html
<html lang="en-IN" data-ra-status="active">
```

That is the whole switch. It reveals 18 RA elements and hides the 2 IA-only disclaimer lines that the
RA wording replaces.

You can also flip it from the admin panel (**Site details → RA registration → active**), which switches
the live page over immediately. Do both: the attribute in the HTML is what makes the RA disclosures
independent of JavaScript, and the admin setting is what fills in the registration numbers.

## Step 2 — fill the RA placeholders

Search for `class="fill"` in the blocks that just appeared:

| Where | What |
|---|---|
| Hero eyebrow | RA registration number (`INH…`) |
| Registration particulars | RA registration number and validity dates |
| Registration particulars | RAASB (BSE) enlistment / membership number |
| Research section intro | RA registration number |
| Footer | RA registration number, validity, RAASB membership number |

The RA registration number and RAASB membership number can be typed once into **Site details** in the
admin panel instead of edited in four places.

## Step 3 — the two content jobs that are yours, not the template's

1. **Complaint data.** SEBI requires RA complaint data in the Annexure E format, disclosed by the 7th of
   the succeeding month. Annexure E is identical in shape to the IA's Annexure C, so if you report a
   single combined practice the existing tables carry both; if RAASB or your auditor asks for them
   separately, duplicate the table block and label the two "Investment Advisory" and "Research Services".
2. **Research reports.** Every report you publish must carry the Regulation 19 disclosures — your and
   your relatives' holdings in the subject security, any conflict, compensation received, and whether you
   managed or co-managed a public offering of that company. The site states that this is done; the reports
   themselves have to actually do it.

## What appears when you flip it

- The **Research services** section (reports, rule-based notes, model portfolio) with the Regulation 19 disclosure note
- RA rows in the registration particulars and in the footer
- The RA fee row in Fees (₹1,51,000 p.a. per family cap; advance limited to one quarter)
- **MITC — Research Services** (12 clauses, verbatim from Annexure B ¶12 of the RA master circular)
- **Investor Charter for Research Analysts** (Annexure D, in full, in its own accordion — same behaviour as the IA charter: open the charter, then open any part)
- RA lines in the escalation matrix, including the 7-business-day timeline for research-service deficiencies
- The RA wording of the SEBI disclaimer ("…performance of the intermediary…" in place of "…performance of the IA…")

## Before you flip it

Do not switch it on until the registration certificate is actually in hand. Displaying an RA registration
number you do not yet hold is a misrepresentation, and the RA blocks assert active registration in several
places.

Sources for everything in the RA blocks: SEBI Master Circular for Research Analysts,
HO/38/12/11(1)2026-MIRSD-POD/I/4360/2026 dated 06 February 2026 — ¶1.15, ¶11.2, Annexure A, B, D and E.
