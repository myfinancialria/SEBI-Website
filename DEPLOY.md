# Giving the admin panel its own public URL

The website is static, so GitHub Pages publishes it for free at
https://myfinancialria.github.io/SEBI-Website/.

The admin panel is not static. It needs a running Node process, because it holds the enquiry database
and checks your password. Copying `admin.html` into `docs/` would publish a login box with nothing
behind it: no `/api/…` endpoints, so no sign-in, no enquiries, no saving complaint figures — and a login
page sitting on your adviser domain for anyone to probe.

So the admin panel gets its own host. Once deployed you have two addresses:

| | |
|---|---|
| Website | https://myfinancialria.github.io/SEBI-Website/ |
| Admin | `https://<your-app>.onrender.com/admin` |

---

## Before you deploy

**Change the password.** It is `myfinancial` today, which is the name printed across your own website —
the first thing anyone would try. On the public internet that is not enough. Pick something long and
unrelated, and set it in the host's dashboard, never in a file.

**Know what you are exposing.** The database holds names, phone numbers and email addresses that people
gave you. Behind a public login, that is personal data under the DPDP Act, 2023. Use HTTPS (every host
below gives it), a strong password, and delete enquiries you no longer need.

---

## Render — free, about five minutes

1. Sign in at [render.com](https://render.com) with your GitHub account.
2. **New → Blueprint**, choose `myfinancialria/SEBI-Website`. Render reads `render.yaml` from the repo.
3. When it asks for `ADMIN_PASSWORD`, type your new password. It is stored by Render, not in the repo.
4. **Apply**. The first deploy takes a minute or two.
5. Open `https://<your-app>.onrender.com/admin` and sign in.

Two things about the free plan:

- **The database is wiped on every deploy and restart.** Set `SMTP_*` (uncomment them in `render.yaml`,
  or add them in the dashboard) so every enquiry is emailed to you as well — then a reset costs you the
  archive, not the lead. Complaint figures live in git anyway, in `docs/data/complaints.json`.
- **The service sleeps when idle** and takes a few seconds to wake. Fine for an admin panel.

To keep the database properly, move to a paid instance and uncomment the `disk:` block plus `DB_PATH` in
`render.yaml`. That is the only change needed.

## Alternatives

- **Railway** or **Fly.io** — both give a small persistent volume, so SQLite survives restarts. Start
  command `node server/server.js`, set `ADMIN_PASSWORD`, and point `DB_PATH` at the volume.
- **A small VPS** — clone the repo, run it behind nginx or Caddy with a TLS certificate, and keep the
  database on the machine's disk. Most control, most upkeep.

---

## After it is live

The hosted server serves the website too, at its own root — so `https://<your-app>.onrender.com/` shows
the same page. That is a useful staging copy, but the address you give clients stays the GitHub Pages one.

To make the **published** site read live figures from the database instead of the committed JSON, set
`API_BASE` near the top of the script in `docs/index.html`:

```js
API_BASE: "https://<your-app>.onrender.com",
```

Commit and push, and the Pages site will show whatever is in the admin panel — the complaint strip, the
Annexure C table and the trends — and the enquiry form will write straight to the database instead of
falling back to email. `ALLOW_ORIGIN` in `render.yaml` already permits that origin.

Leave `API_BASE` empty and the published page keeps reading `docs/data/complaints.json`, which is the
safer default: the site cannot break just because the admin host is asleep or down.
