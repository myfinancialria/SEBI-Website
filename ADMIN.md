# Admin panel — running it, and the two jobs it does

The admin panel exists for two recurring jobs:

1. **Update the complaint figures every month** — SEBI requires them on the site by the 7th.
2. **Hold the enquiries** that come in from the website form, so they are in a database rather than
   scattered across email.

Everything is stored in one SQLite file on your own machine or server. Nothing goes to a third-party
form service, and no enquiry data ever passes through GitHub.

---

## 1 · Starting it

Run it from inside the project folder — `server/server.js` is a path relative to it:

```bash
gh repo clone myfinancialria/SEBI-Website ~/SEBI-Website   # first time only
cd ~/SEBI-Website
ADMIN_PASSWORD='pick-a-strong-one' node server/server.js
```

From anywhere else, give Node the full path instead: `node ~/SEBI-Website/server/server.js`.

| | |
|---|---|
| Website | http://localhost:8080 |
| Admin panel | http://localhost:8080/admin |
| Password | whatever you set in `ADMIN_PASSWORD` |
| Database | `server/data.db` (created on first run) |

You need Node 22.5 or newer — the database driver is built into Node itself, so there is nothing to
`npm install`. Check with `node --version`.

If you prefer keeping settings in a file, copy `server/.env.example` to `server/.env`, fill it in, and start
with:

```bash
node --env-file=server/.env server/server.js
```

Never commit `server/.env` or `server/data.db`. Both are already in `.gitignore`.

---

## 2 · The monthly complaint update

**Due by the 7th of every month, for the month just ended.** This is the single most commonly cited
website default at a SEBI inspection.

1. Open http://localhost:8080/admin and sign in.
2. **Complaint data** tab. The month box already shows last month — change it if you need to.
3. Fill the grid. Three rows, exactly as SEBI's Annexure C prescribes:

   | Row | What goes in it |
   |---|---|
   | Directly from Investors | complaints that came to you, by email, phone or letter |
   | SEBI (SCORES) | complaints routed through SCORES |
   | Other Sources (if any) | anything else — IAASB, a consumer forum, an exchange |

   and six columns per row: pending at the end of last month, received, resolved, total pending,
   pending more than three months, and average resolution time in days.

4. Fill **complaints due to impersonation by another entity** — the count of complaints against you that
   were really about someone impersonating you. SEBI lets you exclude these from the main table; the site
   prints the figure separately, as required.
5. **Save month.**

If you have had no complaints, enter zeros. A nil return is still a disclosure, and leaving last month
absent is what gets noticed.

**What the site does with it.** One save updates four things at once: the one-line status strip under the
header, the full Annexure C table in the complaints section, the six-month trend, and the financial-year
total. They are all computed from the same record, so they cannot disagree with each other.

**If the site is on GitHub Pages** (no server running), add one step: click **Download complaints.json**
and commit the file to `docs/data/complaints.json`. That file is what the published page reads.

```bash
cp ~/Downloads/complaints.json docs/data/complaints.json
git add docs/data/complaints.json
git commit -m "Complaint data for <month>"
git push
```

---

## 3 · Where the enquiry data lives

Someone fills the form on the website → the browser posts it to `/api/enquiries` → the server validates
it, stores it, and (optionally) tells you.

**Stored in** `server/data.db`, table `enquiries`:

| Column | What it holds |
|---|---|
| `id`, `created_at` | serial number and timestamp (UTC) |
| `name`, `email`, `phone`, `city` | what they typed |
| `residency` | `resident` or `nri` |
| `service` | which engagement they picked |
| `message` | their note to you |
| `consent` | 1 — the form will not submit without it |
| `status` | `new` / `replied` / `closed`, yours to set |
| `notes` | your own notes on the enquiry |
| `ip`, `user_agent` | kept for abuse investigation only |

**To read them:** admin panel → **Enquiries**. Email and phone are click-to-contact, you can set a status
and write a note against each one, and **Download CSV** gives you the lot for a spreadsheet.

**To be told when one arrives**, set either or both, then use "Send test notification" to check:

- `NOTIFY_WEBHOOK_URL` — the enquiry is POSTed there as JSON.
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` / `SMTP_TO` — you get an email. For
  Gmail use `smtp.gmail.com`, port `465`, and a Google **app password**, never your account password.

Notification failures never lose an enquiry — it is written to the database first, and the send is
attempted afterwards.

**If no server is running**, the form falls back to opening the visitor's email app with everything filled
in, so an enquiry still reaches you; it just will not be in the database.

### This is personal data

Names, emails and phone numbers are personal data under the DPDP Act, 2023. The form takes explicit
consent, says what the data is for, and tells people how to have it deleted. Your side of that bargain:

- keep `server/data.db` off public hosting and out of git (already gitignored),
- delete a record when someone asks — `DELETE FROM enquiries WHERE id = ?`,
- do not keep enquiries you have no reason to keep,
- back the file up somewhere you control:

```bash
cp server/data.db ~/backups/myfinancial-$(date +%F).db
```

---

## 4 · Site details tab

The amber placeholders on the public page are filled from here, without editing HTML: IAASB/BASL
membership number, validated `@valid` UPI ID, compliance-audit status and adverse findings, the ongoing
advisory fee line, and the "last updated" date.

It also carries the **Research Analyst** switch. When your RA registration is granted, set it to `active`
here *and* change `data-ra-status="pending"` to `"active"` in `docs/index.html` — the HTML attribute is what
makes the RA disclosures independent of JavaScript. See `RA-ACTIVATION.md`.

---

## 5 · Putting it on a server

The panel runs fine on your laptop — start it when you need it, stop it after. Run it on a host only if
you want the website to read live figures or the form to write straight to the database.

Any Node host works (Render, Railway, Fly, a small VPS). Whatever you choose:

- set a strong `ADMIN_PASSWORD`;
- put it behind HTTPS — the login cookie is only marked `Secure` when the request arrives over HTTPS;
- mount a persistent disk for `server/data.db`, or the database resets on every deploy;
- if the website stays on GitHub Pages and only the API is hosted, set
  `ALLOW_ORIGIN=https://myfinancialria.github.io` on the server and `API_BASE` at the top of the script in
  `docs/index.html` to the API's origin.

Built-in protections: password-only login with a timing-safe check and a ten-attempt limit per ten
minutes, HTTP-only session cookies that expire after eight hours, five enquiries per hour per IP address,
a hidden honeypot field that silently absorbs bots, a 64 KB body cap, and length limits on every field.
