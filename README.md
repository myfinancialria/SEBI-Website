# MyFinancial — one-page site + admin

```
index.html            the entire public website (one file, no build step, no external requests)
data/complaints.json  monthly complaint figures the page reads on a static host
data/site.json        the fill-in details (BASL number, UPI ID, audit status …)
server/server.js      admin + database backend: Node, SQLite, zero npm dependencies
server/admin.html     the admin panel
```

The page is complete on its own: every mandatory disclosure, including the complaint tables, is
written into the HTML and renders with JavaScript switched off. The database only keeps those numbers
current and collects enquiries.

**Page order:** intro → who we are → services → fees → how it works → enquiry → registration particulars →
disclosures → MITC → Investor Charter → grievances → complaint data. A 37px strip under the header carries
the six Annexure C grand-total figures, because SEBI wants complaint data on the homepage without
scrolling; the full table lives in the complaints section at the foot of the page. See `COMPLIANCE-MAP.md`
for why it is split that way.

**Pricing** is shown as ₹19,999 (resident individual) and ₹29,999 (NRI), one-time, with no tax line. If you
are GST-registered and charge it on top, say so on the cards — an unqualified price reads as the amount
payable.

## Running it

Run it from inside the project folder — `server/server.js` is a path relative to it:

```bash
gh repo clone myfinancialria/SEBI-Website ~/SEBI-Website   # first time only
cd ~/SEBI-Website
ADMIN_PASSWORD='pick-a-strong-one' node server/server.js
```

From anywhere else, give Node the full path instead: `node ~/SEBI-Website/server/server.js`.

- site — http://localhost:8080
- admin — http://localhost:8080/admin

The database is created on first run at `server/data.db` (it is gitignored — **keep backups**).

To preview the site alone, without the admin, any static server will do:

```bash
python3 -m http.server 8787
```

## The two ways to host this

**A · Static only (GitHub Pages, what you use today).** Publish `index.html` and `data/`. The page reads
`data/complaints.json`, and the enquiry form falls back to opening the visitor's email app with the
details filled in. Each month you open the admin panel locally, enter the figures, click
**Download complaints.json**, and commit it to `data/`.

**B · With the server (any Node host: Render, Railway, Fly, a VPS).** Run `server/server.js`. It serves
the site *and* the admin panel, the page reads live figures from the database, and enquiries are stored
and emailed. Nothing in `index.html` needs changing — it tries the API first and falls back to the JSON
files, so the same file works either way.

If the site stays on GitHub Pages and only the API is hosted elsewhere, set `API_BASE` at the top of the
script in `index.html` to that origin, and set `ALLOW_ORIGIN=https://myfinancialria.github.io` on the
server.

## Environment variables

| Variable | What it does |
|---|---|
| `ADMIN_PASSWORD` | Password for `/admin`. **Set this** — the default is `change-me` |
| `PORT` | Default 8080 |
| `DB_PATH` | Default `server/data.db` |
| `ALLOW_ORIGIN` | Comma-separated origins allowed to post enquiries cross-origin |
| `NOTIFY_WEBHOOK_URL` | Optional: each enquiry is POSTed there as JSON |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `SMTP_FROM` `SMTP_TO` | Optional: email each enquiry. Implicit TLS — for Gmail use `smtp.gmail.com`, port `465`, and a Google **app password**, not your account password |

"Send test notification" in the admin panel tells you whether the webhook and SMTP settings actually work.

## The admin panel

**Complaint data** — pick a month, type the Annexure C figures for the three sources, save. The status
strip, the full Annexure C table, the six-month trend, the "all months" panel and the annual table are all
computed from these. **Enquiries** — every submission with contact details, status (new / replied /
closed), your notes, and a CSV export. **Site details** — fills the amber placeholders on the public page
without touching the HTML.

**→ `ADMIN.md` has the whole thing:** the monthly routine, what each Annexure C column means, where the
enquiry data is stored and how to back it up, notification setup, and what to do differently on a static
host.

## Still to fill in

Placeholders on the page carry a dotted amber underline. Most can be set from the admin panel's
**Site details** tab; the rest are edits in `index.html`.

| Where | What |
|---|---|
| Site details (admin) | IAASB / BASL membership number — **mandatory on the website** |
| Site details (admin) | Validated `@valid` UPI ID once your bank issues it (an IA's username suffix is `.ia`) |
| Site details (admin) | Compliance audit status and adverse findings |
| Site details (admin) | Ongoing advisory fee line, "last updated" date |
| `index.html` → Disclosures | The AI-use paragraph — rewrite it to describe what you actually do |
| Complaint data (admin) | The figures, every month |

## The maintenance calendar

| When | What |
|---|---|
| By the **7th of every month** | Enter last month's complaint figures in the admin panel. On a static host, also download `complaints.json` and commit it. This is the most commonly cited website default at inspection |
| By **31 October 2026** | Accessibility audit by an IAAP-certified professional and remediation of findings, reported to BSE Ltd (SEBI circular dated 31 July 2026) |
| Within **6 months of each FY end** | Annual compliance audit — then publish the status and any adverse findings via Site details |
| On any change | Registration validity, address, phone, email, Principal Officer — edit `index.html` |

## Accessibility

Built in: semantic landmarks and heading order, a skip link, `lang="en-IN"`, visible focus rings, text
contrast ≥4.5:1 in **both** light and dark themes (verified programmatically — 0 failures), complaint-table
text at 12px minimum, native `<details>` accordions that work without JavaScript, labelled form fields with
inline error messages, keyboard-scrollable tables, reflow with no horizontal scrolling down to 320px, and
`prefers-reduced-motion` respected.

The accessibility *statement* section was removed from the page at your request. The underlying SEBI
obligation has not gone away: an independent audit by an IAAP-certified accessibility professional,
including usability testing by persons with disabilities, plus remediation, by 31 October 2026, reported
to BSE Ltd. If you want a one-line statement back later, it is a small addition.

## Privacy note on enquiries

The form collects a name, email, phone, city, residency and message, with an explicit consent checkbox,
and stores them in your SQLite database. Keep `server/data.db` off public hosting and out of git (it is
gitignored), honour deletion requests, and keep retention to what you actually need — this is personal
data under the DPDP Act, 2023.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole public website |
| `data/*.json` | What the site reads on a static host |
| `server/*` | Admin panel + database backend |
| `ADMIN.md` | Running the admin panel, the monthly complaint update, and where enquiry data is stored |
| `COMPLIANCE-MAP.md` | Each mandatory element → where it sits on the page → the SEBI paragraph it comes from |
| `RA-ACTIVATION.md` | The one-line change that switches on every Research Analyst block |
