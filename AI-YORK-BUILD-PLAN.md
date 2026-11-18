# AI @ York
## GitHub Copilot implementation plan

Build a working university website prototype with two connected experiences. Visitors use the public site to find guidance, tools, learning and events. Content owners maintain the records behind those pages through AI @ York Studio. The demonstration succeeds when a visitor can suggest a workshop, an editor can publish it, and someone using another browser can find it on the calendar.

**Deliver the first working journey before expanding the catalogue.** Deploy the frontend to GitHub Pages, run the API on Cloudflare Workers and persist records in Cloudflare D1. Publishing a record should update the public experience on its next fetch without rebuilding the site.

### 1. Inputs Copilot should inspect first

| Input | What to carry forward |
|---|---|
| `docs/references/homepage-wordpress-export.txt` | The supplied homepage is the design and behaviour reference. Read the rendered sections and inline scripts. Some CSS describes older iterations. Start from the markup actually in use. |
| [Content Studio mockup](https://oathpros.github.io/AI-YORK_CMS_UI/) and [source](https://github.com/OathPros/AI-YORK_CMS_UI/blob/HEAD/index.html) | Reuse the sidebar groupings, overview, requests inbox, role preview, lists, plain-language forms and publishing flow. Port the useful interactions into components. Replace browser-only persistence with the Worker API. |
| `docs/references/studio-navigation.png` | Offline reference for the Studio section names and grouping. |

Keep the public name **AI @ York**. Use IBM Plex Sans, York red (#E31837), charcoal, warm white, generous margins and a restrained campus panorama. Carry the same ribbon, navigation, breadcrumbs, footer and focus treatment into every child page. Put a discreet **Demonstration site** identifier in the ribbon and a link to the official AI @ York website in the footer. Keep example event and policy detail pages identifiable when shared directly.

### 2. The top-ribbon journey

Place **Suggest a Change** in the top ribbon of every public page, visible on mobile before the navigation menu opens. Carry along the current page and record ID. A visitor arriving from an event should see that event preselected if they choose to correct it.

| Step | Screen or action | Result |
|---|---|---|
| Enter | Select **Suggest a Change** | Open a clearly marked **Passport York · Demo role selection** splash. Offer two large choices and a “Return to AI @ York” link. |
| External User | Select **External User** | Open the community form with the referring page prefilled. Offer “Add an event”, “Suggest wording”, “Report outdated information”, “Suggest a resource” and “I couldn’t find an answer”. |
| Submit | Complete the relevant fields and preview | Persist a D1 request, return a reference number and show **Received for review**. Include a private status link if tracking is enabled. |
| AI @ York Admin | Select **AI @ York Admin** | Enter the local app’s Studio overview directly. Surface **Requests inbox** with a live count. Use the linked Studio as the interaction reference. |
| Review | Open the request | Compare current and proposed wording, check a source, then create a draft, link to existing work, request clarification if a contact channel exists, or decline with a reason. |
| Publish | An authorized reviewer publishes the draft | Return the resulting public link. The new event appears in the matching calendar filters, or the approved wording appears wherever that record is used. |

**Simulated sign-in.** Use a York-style role chooser with an explicit line reading “Demo only. Choose a role to explore the prototype.” No username, password, Duo prompt, real York session or connection to Passport York. Provide **Switch demo role** and **Return to public site** so the presenter can run the complete story without clearing browser storage.

**Demo sharing decision.** Make the ordinary launch create a disposable D1-backed demo workspace for that browser. Both role buttons operate in the same workspace, so one person can submit externally and switch to Studio to review it. Within Studio, **Copy visitor link** gives a second browser public read and suggestion access to that same workspace. A visitor following that link can still choose Admin to explore an independent demo Studio; the visitor link alone cannot confer management of the presenter’s workspace. Label the workspace switch explicitly. Give the presenter a separate, expiring, single-use **Invite demo reviewer** link when two editors need to work together. All participants viewing the presenter’s visitor link see the same published records. Keep submissions fictional. This setup supports an open GitHub Pages URL and a private shared workshop inbox. A permanent university-wide editorial inbox would require a separately configured institutional workspace and verified editor identities.

**Form details.** Event suggestions ask for a title, date, start/end time or all-day dates, timezone, organizer, location or online link, intended audience and source URL. Wording changes ask for the page, passage, replacement and reason. Unmet needs ask what the visitor was trying to do and what was missing. Use a minimal form per type, field-level errors and a clear submission receipt. Use a reference and an unguessable receipt secret for optional status lookups. Avoid collecting contact information in the demo. Use “Needs information” with a comment and a reply option on the private receipt page if that feature is enabled.

### 3. Public page map

Use readable hash routes for GitHub project Pages, e.g. `/<repository>/#/calendar`. Build real views with direct links, refresh support, navigation history and an understandable missing-page state. Keep the public primary navigation short. Group specialist destinations under **Explore** or the A–Z index.

| Page or route | What the visitor can do | Primary source in D1 |
|---|---|---|
| Home `/` | Use **Find guidance** and **Explore AI tools**. Follow the original panorama, five shared responsibilities, interactive guide, tool cards, learning pathways and next steps. Add compact upcoming-event and latest-news previews. | Published interpretations, tools, training, events, news |
| Study, Teach, Research, Work `/activity/:slug` | Each is a distinct landing page with activity-specific questions, conditions, tools, training and events. A graduate student can move between relevant activities. | Activity tags and published records |
| Partner or study at York `/partners` | Find degree, certificate, continuing education and partnership destinations. | Training and resources |
| Guidance `/guide`, `/guidance/:slug` | Select one or more activities and tasks, then the data context. See applicable conditions, what to avoid, tools, sources and the next action. Open a stable detail page for an answer. | Interpreted guidance and source references |
| Policy at a glance `/policies`, `/policies/:slug` | Read a summary, check scope and effective date, open the authoritative source and see related answers. Show applicable faculty extensions separately with their scope. | Policy/source, interpretation and extension revisions |
| Tools `/tools`, `/tools/:slug` | Filter by activity, eligibility and task. See conditions, access links and related training. Distinguish the Microsoft Copilot products shown on the homepage. | Tool records and links |
| Calendar `/calendar`, `/events/:slug` | Switch between month and agenda, navigate months, filter by activity, audience, format and campus, open a date or event. Include accessible list view, registration, source, timezone and cancelled state. | One event entity powers calendar, detail, training dates and previews |
| News & Updates `/news`, `/news/:slug` | Browse dated updates, filter by topic and open the original source. | News records |
| Learning `/learning`, `/learning/:slug` | Choose administrator learning, instructor learning, or degrees and certificates. Follow linked scheduled offerings to the calendar. | Training and event relationships |
| Communities `/communities`, `/communities/:slug` | Find a group, joining instructions, contact route and upcoming events. | Communities and events |
| A–Z index `/index` | Search titles, aliases and plain-language questions. Filter by activity, office and access level. Distinguish hub content from external authoritative destinations. | Published records and curated resources |
| Contributions `/access`, `/suggest`, `/receipt/:ref` | Choose a persona, submit a request and see its review outcome. | Workspace session, requests and decisions |

**Homepage fidelity check.** Capture the supplied reference at desktop and mobile widths before refactoring. Remove WordPress block comments and resolve the reusable block reference as the new shared header. Preserve the “AI @ York” panorama hero, link targets, five responsibilities, multi-select activities/tasks, data help text, result groupings and audience-specific tool and learning links. Keep reduced motion and give the moving panorama a pause control. Provide a usable static background if the remote image is unavailable. Inventory font and image assets and document which ones may be bundled.

**Import the actual guidance model.** The reference’s inline `DB` has 90 cases, six tool records, 11 sources and task lists for four activities. Write a one-time importer that parses the JSON literal without executing the attached scripts. Preserve original keys, matching semantics, order and source links. Keep “none/fictional”, “public”, “internal”, “sensitive” and “unsure” distinct where used. Compare the migrated results with the reference for all 90 cases and representative multi-select combinations. Treat imported wording as demonstration content pending owner review. When there is no matching approved answer, offer a source or the unmet-need form.

### 4. Studio requirements

The Studio is part of the Pages app at `/studio`. Use a responsive sidebar, a clear page title, searchable lists, status filters and one primary action per screen. The contributor should never need HTML, JSON, Markdown syntax or a repository account. Use labels such as **Save draft**, **Send for review**, **Publish** and **View on site**.

| Sidebar group | Screens | Required operations |
|---|---|---|
| Workspace | Overview, Requests inbox, My reviews | Show outstanding work; filter requests by type, source, status and assignee; compare wording; assign and record an outcome. |
| Guidance | Interpretations, Policies & sources, Faculty extensions | Link an answer to a specific source revision and clause; show scope, restrictions, approval and review date. Flag downstream answers when sources change. |
| Information & services | Tool library, Shared calendar, Training, News & updates, Communities | Create, preview, revise, publish, archive or cancel records. Use type-specific forms including a date picker and all-day control for events. |
| Governance | Review history, Roles & sections | Show changes, actor, reason, time, affected public pages and the permissions used. Offer named demo personas within the owner’s sandbox. |

**Role permissions are enforced by the Worker.** Visitors read published content. External contributors create suggestions and retrieve only their own receipt. Section editors draft and submit records in assigned sections. Delegated reviewers approve and publish revisions within their scopes. Demo administrators manage assignments and queues within their workspace. Reviewing a policy-source record confirms what the demo displays; formal university policy approval stays with the responsible authority. Keep the last published revision visible during routine edits. If source changes make existing guidance unreliable, mark the affected guidance under review and display a referral in its place.

### 5. Backend blueprint

**Web:** Vite + React + TypeScript, hash routing, shared visual components. **API:** TypeScript Worker with a D1 binding named `DB`. **Persistence:** D1 stores editorial records, immutable submitted revisions, proposals, decisions and publication pointers. Use controlled external asset URLs for v1. Add an R2 bucket only if file uploads become a real requirement. Static assets ship with the Pages build. Limit browser storage to UI preferences and session handles.

| Tables or views | Important fields and constraints |
|---|---|
| `workspaces`, `sessions`, `grants`, `invites` | Workspace ID, expiry, hashed opaque session/invite value, role, permitted sections and actions. Seed or copy demo data under each workspace. Derive access from the server-side session. Scope every query, relationship and identifier lookup to its workspace. |
| `records`, `revisions` | Stable ID, workspace, kind, unique scoped slug, owning section, published revision ID; revision number, title, summary, typed payload, creator, lifecycle, source and review dates. Validate payloads by record kind. Submitted revisions are immutable; edits create a new draft. |
| `event_revisions` | Revision ID, timed start/end UTC plus IANA timezone, or all-day local start and exclusive end dates; venue, delivery mode, organizer, registration URL and cancellation state. Default display zone America/Toronto. Index time range. Only one representation per event. |
| `guidance_cases`, `revision_links`, `tags`, `revision_tags` | Revision-specific activity/task/data match; reference key; linked policy clause/version, tools, training, faculty scope and public URLs. Disallow cross-workspace relationships. Multiple links can connect the same record to different activities. |
| `requests`, `request_events` | Type, origin, source page/record and revision, proposed fields, status, assignee, receipt hash, resolution and resulting revision. One request can link to an existing draft. Track status changes, including decline and duplicate. |
| `audit_events`, `idempotency_keys` | Workspace, actor, operation, record/revision, timestamp and correlation ID. Track request retries and publish operations with unique keys. |
| `discovery_candidates` | Optional feed name, canonical item URL or feed GUID, observed date, proposed destination and review state. Unique source key stops repeated suggestions. |

Use foreign keys, bound SQL parameters, versioned migrations and repeatable development seeds. Return JSON with a consistent error shape and request ID. Use cursor pagination for lists. A public read joins through the published revision pointer; never serialize drafts, receipt tokens or audit records there. The Workspace/Studio response must be private and uncached. Begin with fresh public reads on navigation and immediately after a publish. Introduce caching only with workspace-aware invalidation.

**Server contracts** (prefix each with `/api/v1`):

| Method and route | Contract |
|---|---|
| POST `/demo/start`, POST `/demo/role`, POST `/demo/redeem` | Create an isolated sandbox, select a permitted persona, or redeem a scoped invite. A client-supplied role name alone never elevates a viewer of another workspace. |
| POST `/studio/invites` | Issue a scoped visitor link or one-use reviewer invite. Store and validate capabilities server-side. |
| GET `/public/:workspace/records[/:kind/:slug]`; GET `/public/:workspace/events`; GET `/public/:workspace/guide` | Published lists/detail, calendar overlap query and task-aware guidance results. Validate permitted filters; support stable sorting and empty states. |
| POST `/requests`; GET `/requests/:ref/status` | Validate form by request type, bind workspace and current page, deduplicate retries. Require a private receipt capability for status. |
| GET `/studio/requests`; POST `/studio/requests/:id/actions` | Filter queues and assign, decline, link or create a draft. Record a reason. Closing as published requires a matching published revision. |
| GET/POST `/studio/records`; GET `/studio/records/:id`; POST `/studio/records/:id/revisions` | Read scopes, create records, load history or save a revision using the expected current version. Conflicting edits return 409 with a reload/compare option. |
| POST `/studio/revisions/:id/actions`; GET `/studio/audit` | Submit, return for changes, approve, publish or withdraw under delegated permissions; provide a paginated history. |
| GET `/health` | Report Worker availability and database readiness without listing private configuration. |

**Publication must be atomic.** In one D1 transaction-capable batch, conditionally advance the approved revision pointer, append audit history and resolve linked requests. Use database constraints or guarded statements so a failed version precondition prevents all dependent writes. Replaying the same publish key returns the initial result. A stale editor cannot overwrite a newer publication. Validate with concurrent-edit and interrupted-publish tests. Use the same API for all Studio and public screens.

**Across Pages and Workers origins.** Configure the frontend with a public API URL. Allow the exact Pages and local development origins plus necessary OPTIONS preflights in the Worker. Use short-lived server-issued bearer sessions in memory or sessionStorage; do not depend on third-party cookies. Keep invites out of analytics, remove redemption fragments after exchanging them, redact tokens from logs, and keep authenticated requests out of public caches. Validate permissions even when an API caller bypasses the frontend. Render submitted text as text and validate external links. Add bounded payloads, rate limits and expiration/cleanup for public demo workspaces.

### 6. Feed discovery after the manual path works

Use a scheduled Worker handler against a configurable allowlist of YFile and York calendar feeds. Confirm the actual feed URLs and format during implementation. Until a feed is verified, use a dated fixture and mark it as demo input. Normalize candidates by canonical URL or GUID. A relevant item creates an **Automated suggestion** in the Studio inbox and increments the manager’s in-app notification count. The manager can convert it to a calendar event or news draft, link it to an existing record, or dismiss it. Show source, retrieval time and why it matched. Repeated runs must not recreate a dismissed item. Handle timeouts and malformed items without interrupting public pages. Send no real emails for this prototype.

### 7. Repository and deployment contract

Use a single GitHub repository. Inspect the destination before creating files. Keep the supplied Studio repository as a reference unless the repository owner chooses it as the project destination.

| Path | Responsibility |
|---|---|
| `apps/web/` | Shared ribbon, public pages, role chooser, external form, Studio screens and API client |
| `apps/api/` | Worker fetch and scheduled handlers, role enforcement, validation, persistence, discovery adapters |
| `apps/api/migrations/`, `apps/api/fixtures/` | D1 schema, seed dataset, reference mappings and synthetic demo requests |
| `packages/contracts/` | Shared request/response types, content-kind schemas and validation |
| `docs/references/`, `docs/demo-runbook.md` | Unmodified design references, setup, presenter walkthrough and workspace sharing instructions |
| `.github/workflows/` | CI, Pages deployment, gated Worker deployment and migrations |

1. **Local:** Provide root commands for install, local D1 migration/seed, parallel web and Worker development, tests and a production build. The local demo runs without a Cloudflare account. Keep remote migrations separate from local seed/reset.
2. **Cloudflare:** Create a dedicated demo D1 database, bind it as `DB` in Wrangler configuration and set an explicit compatibility date. Record the database identifier and deployment environment. Apply reviewed additive remote migrations before the compatible Worker release. Use a one-time, idempotent fixture initialization.
3. **GitHub Pages:** Enable GitHub Actions as the publishing source. On the default branch test, build the web app with the repository-aware Vite base and configured `VITE_API_BASE_URL`, upload its static artifact and deploy through the Pages environment. Verify app icons, fonts, links and browser refresh under the repository prefix. Treat Pages path and Worker hostname as configuration.
4. **Secrets:** Use the repository’s deployment environment for the Cloudflare deployment token and account configuration. Any signing keys belong in Worker secrets. Frontend bundles and Vite build variables are public. Prefer server-issued opaque tokens whose hashes are stored in D1.
5. **Release order:** PR checks run locally against fixture D1. Serialize deployments per demo environment; migrate, deploy Worker, run health/schema smoke checks, then deploy the compatible Pages build. If the Worker is unavailable, show retry and offline messaging. Never acknowledge a submission until D1 has persisted it.
6. **Handover:** Document the published Pages URL, Worker URL, database binding, initial seed procedure, reset scope, demo workspace expiry and how to roll back a frontend/Worker release. Make repository-specific or account-specific values explicit placeholders until configured.

### 8. Copilot delivery sequence

Give Copilot one milestone at a time. Each milestone ends with runnable changes, a test result and a short handoff. Keep the existing build working between milestones.

| Milestone | Build | Demonstration that closes it |
|---|---|---|
| 1 · Connected event workflow | Scaffold repo, local D1, seed, global ribbon, role chooser, scoped session, external event form, inbox, review/publish and agenda/detail view. Add a minimal faithful homepage shell. | In browser A create a demo and copy its visitor link. Browser B suggests a workshop. A reviews and publishes. B sees it only after publication and can open its detail. The item survives Worker restart. |
| 2 · Homepage and guidance | Port the supplied homepage and import source data with original IDs. Build four activity pages, guidance detail, tools and learning. | Compare all 90 cases and multi-select examples. A Studio edit to a published tool appears on homepage and detail after approval. Keyboard-only users can complete the guide. |
| 3 · Remaining public pages | Policies, faculty extensions, partners, newsroom, calendar month view, communities, A–Z, filters and detail routes. | Every navigation item resolves to a populated page with working links, search and empty states. Calendar handles daylight-saving transitions, multi-day events and cancellation. |
| 4 · Complete Studio | All eight content modules, role-scoped forms, reviewer queue, conflict handling, revision history, community wording and unmet-need flows. | An events editor can edit events; an interpretation reviewer can approve answers; neither can publish an unrelated policy. A policy revision flags affected answers. |
| 5 · Discovery and release | Feed candidate review, notifications, deployment workflows, accessibility checks and runbook. | Repeated feed fixture creates one review item. Publishing a selected item updates the site without a new Pages build. Run the two-browser scenario on the deployed demo. |

**Acceptance checklist**

- Direct links work on Pages after refresh, with keyboard navigation, visible focus, mobile layout and reduced motion.
- Top ribbon and simulated persona splash appear consistently. External users reach the form; authorized demo admins reach Studio in one selection.
- Demonstrate an event suggestion, a wording correction to an existing page, and a new need with no existing target. Show received, in review, publication or decline, and audit history.
- Suggesting, reviewing and publishing are distinct operations. Drafts and declined suggestions never leak into public lists, search, calendar or guide results.
- Reloading or opening a shared visitor link in a fresh browser shows persisted published content. Separate sandboxes cannot see each other’s private records.
- A repeated submit or publish is idempotent. Two editors working against different versions get a recoverable conflict. An out-of-scope edit is rejected by the API.
- Calendar handles an all-day event and a timed Toronto event spanning a daylight-saving boundary. Previous/next month, filters and empty periods all work.
- Provide a seeded demo date strategy so “upcoming events” contains believable records when the demo is created. Label seeded stories, policy examples and guidance as illustrative.
- Home, public detail, external submission and Studio all handle loading, empty and failure states. Check desktop and narrow mobile screenshots before closing a milestone.

### 9. Paste this into GitHub Copilot

> Read AI-YORK-BUILD-PLAN.md and inspect both files in docs/references. Use the linked Studio source to understand navigation and editorial interactions. Inspect this repository first and preserve existing working conventions. Implement milestone 1 end to end. I need a GitHub Pages frontend and a Cloudflare Worker connected to a real local D1 database, with migrations, seed data, role-scoped demo sessions and a two-browser acceptance test. Put “Suggest a Change” in the top ribbon. Use the credential-free Passport York demo role chooser. External User opens the suggestion form. AI @ York Admin opens Studio. The event must move from suggestion to reviewed draft to published calendar entry. Run the app and tests locally. Summarize what passed, how to demonstrate it and which values a maintainer needs to configure for deployment. Leave remote deployment for explicit authorization.

For later milestones, use: **“Read the plan and current implementation. Implement milestone N, preserve the earlier acceptance tests, and run the new demonstration before summarizing.”**

### Platform references for implementation

- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Cloudflare D1 setup and Worker bindings](https://developers.cloudflare.com/d1/get-started/)
- [D1 database API and batch semantics](https://developers.cloudflare.com/d1/worker-api/d1-database/)
- [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
