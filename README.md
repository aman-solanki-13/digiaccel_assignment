# Video Learning + Interactive Quiz Builder

A mini learning platform where admins upload video-based lessons with timestamp-triggered
quiz questions, and learners watch, answer, and resume where they left off.

**Stack:** React (Vite) + Tailwind CSS v4 · Node.js/Express · MongoDB (Mongoose) · JWT auth · Zod validation

---

## 1. Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB running locally, or via Docker: `docker run -d -p 27017:27017 --name mongo mongo:7`

### Backend

\`\`\`bash
cd backend
npm install
cp .env.example .env      # edit values if needed
npm run seed               # creates sample users, a video, questions, and one assignment
npm run dev                 # starts API on http://localhost:4000
\`\`\`

Verify: `http://localhost:4000/health` and API docs at `http://localhost:4000/api-docs`.

### Frontend

\`\`\`bash
cd frontend
npm install
cp .env.example .env      # points VITE_API_URL at the backend
npm run dev                 # starts app on http://localhost:5173
\`\`\`

---

## 2. Environment Variables

### backend/.env
| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | `development` / `production` / `test` | `development` |
| `PORT` | API port | `4000` |
| `MONGODB_URI` | Mongo connection string | `mongodb://localhost:27017/video-learning-platform` |
| `JWT_SECRET` | Secret used to sign JWTs — **change in production** | — |
| `JWT_EXPIRES_IN` | Token lifetime | `1d` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window per IP | `300` |

### frontend/.env
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000/api` |

---

## 3. Database Setup & Seed Data

Schema is created automatically by Mongoose on first write — no migrations needed.

Run `npm run seed` (from `backend/`) to populate:
- 1 admin, 2 learners
- 1 published video with 3 timestamp questions (single choice, multiple choice, short answer)
- Both learners assigned to it; one learner has partial progress already recorded (to demo resume-after-refresh)

### Sample login credentials
| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `password123` |
| Learner | `learner1@example.com` | `password123` |
| Learner | `learner2@example.com` | `password123` |

Re-running `npm run seed` wipes and recreates all collections — don't run it against data you want to keep.

---

## 4. API Documentation

Swagger UI is served at `http://localhost:4000/api-docs` once the backend is running.
The full route list is also visible directly in `backend/src/routes/*.js` — each router is organized by resource (auth, videos, questions, assignments, progress, responses, reports).

---

## 5. Architecture Overview

\`\`\`
backend/   Express, layered as routes -> middlewares -> controllers -> services -> models
           Zod validates every request at the route boundary before it reaches a controller.
           Services hold all business logic; controllers stay thin (parse req, call service, shape res).

frontend/  React + Vite + Tailwind v4
           React Query owns all server state (videos, questions, progress, responses, reports).
           AuthContext owns the logged-in user + JWT.
           VideoPlayer splits rendering into an imperative tier (scrub bar, question-trigger checks
           via refs) and a throttled state tier (~1x/sec) so frequent `timeupdate` events don't
           cause a full re-render of the player tree.
\`\`\`

Data model: `User -> Video -> Question`, with `Assignment` (video x learner), `Progress`
(resume position + completion %), and `Response` (graded answer per question per learner)
as the join/state tables. See `backend/src/models/*.js` for full schemas.

---

## 6. Assumptions & Known Limitations

- **Open admin registration.** `/auth/register` accepts a `role` field so you can create an
  admin account without touching the database directly, for evaluation convenience. A real
  product would provision admin accounts out-of-band (invite-only, or a separate internal tool)
  rather than let anyone self-register as admin.
- **Video hosting is a file upload on local**, this would become a real S3 upload flow.
- **JWT is stored in `localStorage`** and sent as a Bearer token, not in an httpOnly cookie.
  This was the fastest path to a working demo; see §7 for what changes in production.
- **Short-answer grading is exact-match** (case-insensitive, trimmed). No fuzzy matching or
  partial credit.
- **No pagination** on `GET /videos`, `GET /assignments`, or report endpoints — fine at
  seed-data scale, would need it before this holds real course catalogs.
- **Deployment is not implemented** per the assignment spec — this is a local-only project.

---

## 7. Security Hardening for Production (not implemented here)

The current auth is a plain JWT-in-localStorage setup, which is fine for a local assessment
build but has known weaknesses. If this were shipping, these are the specific changes I'd make,
roughly in priority order:

1. **Move the JWT out of localStorage into an httpOnly, `Secure`, `SameSite=Strict` cookie.**
   localStorage is readable by any script on the page, so a single XSS hole anywhere in the
   frontend (a dependency, an unsanitized render) means full account takeover. An httpOnly
   cookie is invisible to JS entirely.
2. **Serve everything over HTTPS and set `Secure` on all cookies**, so the token can never be
   sniffed over plain HTTP — trivial today since `Secure` cookies are silently dropped on non-TLS
   connections, which also catches misconfiguration early.
3. **Add CSRF protection once cookies are in play.** Bearer-token-in-header setups are naturally
   immune to CSRF; cookie-based auth isn't. Standard fix is a double-submit CSRF token or
   `SameSite=Strict` combined with checking the request's `Origin`/`Referer` on state-changing routes.
4. **Split into short-lived access tokens + long-lived refresh tokens.** Right now a stolen JWT
   is valid for its full 1-day lifetime with no way to revoke it early. Short (~15 min) access
   tokens plus a refresh token (rotated on use, stored server-side so it can be revoked) bounds
   the blast radius of a leaked token.
5. **Hash refresh tokens at rest** (the same way passwords are hashed) — a DB dump shouldn't
   hand out usable session tokens.
6. **Account lockout / backoff on repeated failed logins**, on top of the existing IP-based rate
   limiter, to blunt credential-stuffing against a single account specifically.
7. **`helmet`'s CSP is currently using defaults** — for production, define an explicit
   `Content-Security-Policy` (script-src, connect-src pinned to known origins) rather than
   relying on helmet's generic baseline.
8. **Audit logging** on admin actions (publish/unpublish, assignment changes, question edits) —
   there's currently no record of who changed what, which matters once multiple admins share
   the platform.

---

## 8. Scaling Video Storage: S3 Pre-Signed Uploads (not implemented here)

Videos are currently referenced by a plain URL an admin pastes in. That's adequate for a demo
but doesn't scale to "admin uploads a file from their computer." The production path:

1. **Admin requests an upload slot**: `POST /videos/upload-url` on the backend, which calls
   `s3.getSignedUrlPromise('putObject', {...})` and returns a short-lived pre-signed PUT URL —
   the backend never touches the video bytes itself.
2. **Browser uploads directly to S3** using that pre-signed URL (a plain `fetch`/`PUT` from the
   frontend). This keeps large files off the API server entirely — no multipart-parsing load,
   no memory pressure on Express for a 500MB upload.
3. **Backend stores only the resulting S3 object key** on the `Video` document, not the pre-signed
   URL itself (those expire). Playback URLs are generated on read, either as a fresh pre-signed
   GET URL or, better:
4. **Front the bucket with a CDN (CloudFront)** for actual playback, so repeated views don't
   hit S3 directly and learners in different regions get low-latency delivery.
5. **Validate the upload server-side before marking a video "ready"** — an S3 event notification
   (or the admin's client calling a `POST /videos/:id/confirm-upload` after the PUT succeeds)
   triggers a check that the object exists and is a valid video content-type/size before the
   video becomes visible to learners, so a failed or malicious upload never surfaces.
6. **Consider transcoding** (e.g. MediaConvert or a Lambda-triggered ffmpeg job) if the platform
   needs to support arbitrary uploaded formats/resolutions rather than assuming the admin already
   has a web-ready MP4 — out of scope for this assessment, but the natural next step.
7. **Thumbnail handling follows the same pre-signed pattern** rather than the current plain URL
   field, generated either client-side (canvas frame capture) or server-side from the video
   after upload.

This keeps the Express backend stateless with respect to video bytes at any scale — it only ever
issues and validates short-lived signed URLs, never streams or stores media itself.

---

## 9. Other Scalability Notes

- **Indexes**: `Video` has a text index on title/description and an index on `published`;
  `Assignment`, `Progress`, and `Response` all have compound unique indexes on their natural key
  (e.g. `learner + video`) — these are the queries the app actually makes, so they're covered,
  but should be re-verified with `explain()` once real data volume exists.
- **Progress writes are frequent** (throttled to ~1/sec per active learner during playback).
  At scale this is a good candidate for a write-behind queue (batch progress updates through
  something like Redis + a periodic flush to Mongo) rather than hitting Mongo on every tick directly.
- **Reports currently compute aggregates on read** (`report.service.js` does in-request
  `Promise.all` + array joins). Fine at demo scale; would move to precomputed/cached aggregates
  (or a proper aggregation pipeline) once the learner/video counts get large.
- **No caching layer** (Redis, etc.) is in place — `GET /videos` and report endpoints are the
  first candidates if read load becomes a bottleneck.
