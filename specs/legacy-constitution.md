
# Truthbook Constitution

> **Constitutional Naming Rule:**
>
> The official and only constitutional name of this platform is **Truthbook** (abbreviation: tb, domain: truthbook.io). All legacy names, including BELIEF COURT, judgmental.io, disputable.io, and Better Dispute, are superseded and must not be used in any constitutional, governance, or product context going forward.



## Power to the People


The product serves two related purposes:

1. **To give every person — beginning with those who share this faith — a place to stand on what they actually believe**, defended with integrity, subject to challenge, and resolved with respect.
2. **To build something that lasts**: a platform principled enough to serve the faith community well, and robust enough to serve anyone willing to engage sincerely.

The dating features, the viral mechanics, the Christian Mode, the Church Discipline process, the open API, the historical re-trials — all of it exists downstream of this. The ambition for the platform to grow, to reach people, and to sustain itself commercially is not in tension with this foundation. It is in service of it.



- [Principle V — Performance Requirements](#principle-v--performance-requirements)
- [Principle VI — Free-First Tool Selection](#principle-vi--free-first-tool-selection)
- [Principle VII — American English Only](#principle-vii--american-english-only)
- [Principle VIII — Christian Mode is Not a General Faith Platform](#principle-viii--christian-mode-is-not-a-general-faith-platform)
- [Principle IX — No AI in the Worldview Engine Stack](#principle-ix--no-ai-in-the-worldview-engine-stack)
- [Principle X — Bot Namespace and Disclosure](#principle-x--bot-namespace-and-disclosure)
- [Principle XI — Youth Zone and the Guardian Relation](#principle-xi--youth-zone-and-the-guardian-relation)
- [Principle XII — Open Governance and the Constitutional Duel](#principle-xii--open-governance-and-the-constitutional-duel)
- [Principle XIII — URL Parameter Minimization and Mock Mode](#principle-xiii--url-parameter-minimization-and-mock-mode)
- [Principle XIV — Worldview Reconciliation Process as Governance Engine](#principle-xiv--worldview-reconciliation-process-as-governance-engine)
- [Principle XV — Keyholder Program and the Federation Moat](#principle-xv--keyholder-program-and-the-federation-moat)
- [Principle XVI — No Cryptocurrency Until Constitutional Approval](#principle-xvi--no-cryptocurrency-until-constitutional-approval)
- [Principle XVII — Financial Transparency as Constitutional Obligation](#principle-xvii--financial-transparency-as-constitutional-obligation)
- [Principle XVIII — The Constitution as Belief Ledger Foundation](#principle-xviii--the-constitution-as-belief-ledger-foundation)
- [Development Workflow](#development-workflow)
- [Governance](#governance)

| Field | Value |
|---|---|
| **Version** | `3.0.0` |
| **Status** | 🔴 Pre-Alpha — not production-ready |
| **Feature branch** | `001-better-dispute-app` |
| **Ratified** | 2026-04-18 |
| **Last amended** | 2026-04-21 |
| **AI assistant** | GitHub Copilot · Claude Sonnet 4.6 |
| **Authority** | Governing document — supersedes all other spec documents |

---

## Spec Index

| Document | Role |
|---|---|
| [spec.md](spec.md) | Functional requirements |
| [plan.md](plan.md) | Implementation architecture and deployment |
| [data-model.md](data-model.md) | Database schema and entity definitions |
| [tasks.md](tasks.md) | Implementation tasks (SDLC) |
| [quickstart.md](quickstart.md) | Development environment setup |
| [research.md](research.md) | Pre-design unknowns and resolved decisions |
| [stakeholder-briefing.md](stakeholder-briefing.md) | Public financial projections and constitutional crowdfunding |
| [viral-growth-model.md](viral-growth-model.md) | Growth flywheels and acquisition model |
| **[constitution.md](constitution.md)** | **Governing document — supersedes all others — you are here** |
| [distributed-architecture.md](distributed-architecture.md) | Keyholder program, Truth Statements, cryptographic hardening, and fork mechanism |

---

## Table of Contents

- [Founding Declaration](#founding-declaration)
- [Principle I — No Argumentation — Defended Belief Only](#principle-i--no-argumentation--defended-belief-only-non-negotiable--priority-one)
- [Principle II — Code Quality](#principle-ii--code-quality-non-negotiable)
- [Principle III — Testing Standards](#principle-iii--testing-standards-non-negotiable)
- [Principle IV — User Experience Consistency](#principle-iv--user-experience-consistency-non-negotiable)
- [Principle V — Performance Requirements](#principle-v--performance-requirements)
- [Principle VI — Free-First Tool Selection](#principle-vi--free-first-tool-selection)
- [Principle VII — American English Only](#principle-vii--american-english-only)
- [Principle VIII — Christian Mode is Not a General Faith Platform](#principle-viii--christian-mode-is-not-a-general-faith-platform)
- [Principle IX — No AI in the Worldview Engine Stack](#principle-ix--no-ai-in-the-worldview-engine-stack)
- [Principle X — Bot Namespace and Disclosure](#principle-x--bot-namespace-and-disclosure)
- [Principle XI — Youth Zone and the Guardian Relation](#principle-xi--youth-zone-and-the-guardian-relation)
- [Principle XII — Open Governance and the Constitutional Duel](#principle-xii--open-governance-and-the-constitutional-duel)
- [Principle XIII — URL Parameter Minimization and Mock Mode](#principle-xiii--url-parameter-minimization-and-mock-mode)
- [Principle XIV — Worldview Reconciliation Process as Governance Engine](#principle-xiv--worldview-reconciliation-process-as-governance-engine)
- [Principle XV — Keyholder Program and the Federation Moat](#principle-xv--keyholder-program-and-the-federation-moat)
- [Principle XVI — No Cryptocurrency Until Constitutional Approval](#principle-xvi--no-cryptocurrency-until-constitutional-approval)
- [Principle XVII — Financial Transparency as Constitutional Obligation](#principle-xvii--financial-transparency-as-constitutional-obligation)
- [Principle XVIII — The Constitution as Belief Ledger Foundation](#principle-xviii--the-constitution-as-belief-ledger-foundation)
- [Development Workflow](#development-workflow)
- [Governance](#governance)

---

## Founding Declaration

*Where worldviews collide, people open cases to confront the differences, seeking harmony.*

*Social media usually means social mayhem. Truthbook introduces social mediation.*

Truthbook exists because of a conviction drawn directly from biblical faith in Jesus Christ.

The platform is built on the belief that truth is real, that it can be known, and that people made in the image of God are capable of holding and defending genuine convictions — not merely constructing plausible-sounding arguments.

The product therefore serves two related purposes that flow from the same source:

1. **To give every person — beginning with those who share this faith — a place to stand on what they actually believe**, defended with integrity, subject to challenge, and resolved with respect.
2. **To build something that lasts**: a platform principled enough to serve the faith community well, and robust enough to serve anyone willing to engage sincerely.

The dating features, the viral mechanics, the Christian Mode, the Church Discipline process, the open API, the historical re-trials — all of it exists downstream of this. The ambition for the platform to grow, to reach people, and to sustain itself commercially is not in tension with this foundation. It is in service of it.

**This declaration is not a marketing statement. It is the reason the project exists.** Every principle that follows flows from it. When a decision is hard to make, this is where the answer starts.

---

## Principle I — No Argumentation — Defended Belief Only (NON-NEGOTIABLE — PRIORITY ONE)

This is the foundational product principle. It governs every design decision, every line of UI copy, every AI behavior, every feature, and every code review. It supersedes all other principles when in conflict.

**The core commitment:**

Truthbook is a platform for *defended belief*, not for *constructed argument*. The question the platform asks of every person in every Duel, in every context, is: *"What do you actually believe, and can you defend it?"* — never *"Can you build a better argument?"*

**What is prohibited, in all contexts, without exception:**

- The platform MUST NOT encourage, reward, frame, or structurally enable formal syllogistic reasoning — the assembly of premises, inference steps, and logical conclusions — as a method of engaging with Claims, winning Duels, or establishing truth.
- The platform MUST NOT treat "logically valid" as equivalent to "true". A formally valid argument from false or poorly grounded premises is not a victory. It is noise.
- UI copy, tooltips, templates, onboarding text, AI suggestions, and help text MUST NEVER frame engagement as argument construction. Prohibited framings include: *"Therefore..."*, *"It follows that..."*, *"Premise one..."*, *"Given X, conclude Y"*, *"This argument is valid because..."*
- The Fallacy Tag and Claim Map widgets are post-hoc diagnostic tools only. They describe what went wrong in reasoning that has already occurred. They MUST NEVER be presented as methods to win, as evaluation criteria for Claims, or as things to aim for.
- AI features at every tier MUST NOT generate syllogisms, logical chains, or formal argument structures in response to user content. Any AI output that takes this form MUST be suppressed or reformulated before display.

**Structural enforcement (not just guidance):**

- Copy review is a merge gate: any PR that introduces UI copy, template text, help text, AI prompt, or onboarding content MUST be reviewed against this principle before merge. Reviewers MUST explicitly confirm: *"No syllogistic framing is present."*
- The codebase MUST contain a `ANTI_ARGUMENTATION_REVIEW_CHECKLIST.md` at the root, used as a PR checklist for all copy and AI changes.
- Any feature that surfaces "argument strength", "logical validity", "argument map", or similar scoring MUST be blocked unless explicitly approved as a post-hoc diagnostic tool with zero impact on Duel outcomes.

**On proof-texting scripture specifically:**

- Scripture references are first-class Evidence and are welcomed as genuine expressions of a person's Base of Truth. A scripture reference is testimony: *"This is what I believe, and here is the text that grounds me."* It is not a logical lever.
- The practice of *proof-texting* — assembling isolated Bible verses as logical premises to compel a conclusion — is a specific failure mode this platform is designed to resist, in every context.
- All inputs, templates, and AI prompts involving scripture MUST ask: *"What does this passage say, and how does it ground your position?"* — never *"What conclusions follow from this verse?"*
- Any AI output that constructs a syllogism from scripture references MUST be suppressed or reformulated before display, regardless of context.

**Rationale**: Argumentation rewards rhetorical skill over substantive truth. It is a game that can be won without being right. Proof-texting makes any position appear scriptually grounded through selective citation. This platform is built on the conviction that truth is knowable and defensible by real people holding real convictions — not by those most skilled at logical construction. The burden of proof is on lived, grounded belief.

## Principle II — Code Quality (NON-NEGOTIABLE)

All production code MUST meet the following standards before merging:

- Every module, function, and class MUST have a single, clearly defined responsibility (Single Responsibility Principle).
- Code MUST be reviewed by at least one peer before merge; self-merges are prohibited on protected branches.
- All public APIs MUST be documented with purpose, parameters, return values, and error conditions.
- Dead code, commented-out blocks, and unused imports MUST be removed prior to merge.
- Linting and static analysis MUST pass with zero errors; warnings MUST be reviewed and either resolved or explicitly suppressed with justification.
- Duplication MUST be eliminated through abstraction before a feature is considered complete; copy-paste of non-trivial logic is a blocking defect.

**Rationale**: Consistent, clean code reduces onboarding friction, lowers defect rates, and makes the system maintainable as the team and codebase grow.

## Principle III — Testing Standards (NON-NEGOTIABLE)

Automated testing is a first-class deliverable, not an afterthought:

- Every new feature or bug fix MUST be accompanied by tests written before or alongside the implementation (TDD encouraged; coverage gate enforced).
- Unit test coverage MUST not drop below **80%** for any module; the project-wide coverage gate is **85%**.
- Coverage gates MUST be enforced automatically in CI (e.g. `c8 --branches 80 --lines 85` or equivalent); a PR where CI does not run coverage checks is not eligible for merge until CI is configured.
- Integration tests MUST cover all cross-module contracts, external API interactions, and database operations.
- Tests MUST be deterministic — flaky tests MUST be fixed or quarantined within one sprint of discovery.
- Test data MUST be isolated; tests MUST NOT share mutable global state or depend on execution order.
- End-to-end tests MUST cover all critical user journeys defined in the specification.

**Rationale**: Comprehensive, reliable tests are the primary mechanism for safe iteration and confident deployment.

## Principle IV — User Experience Consistency (NON-NEGOTIABLE)

All user-facing surfaces MUST present a coherent, predictable experience:

- The project design system is defined as: the CSS custom properties in `styles/main.css` (color tokens, spacing scale, typography scale, and component-level variables) plus any component files under `src/view/components/`. These files are the canonical source of truth for visual style.
- UI components MUST be built from design-system tokens and components; deviating from the token set (hardcoded colors, ad-hoc font sizes, etc.) requires explicit justification in the PR.
- Custom one-off components that are not candidates for reuse MUST be flagged in the PR as intentional exceptions.
- Error messages MUST be human-readable, actionable, and consistent in tone across the entire application.
- Navigation patterns, loading states, and feedback mechanisms (toasts, modals, inline errors) MUST follow documented UX conventions.
- Accessibility (WCAG 2.1 AA) MUST be validated for all new UI surfaces before release.
- User-facing copy (labels, placeholders, help text) MUST be reviewed for clarity and tone consistency before merge.
- Breaking changes to existing UX flows MUST be flagged in the PR description and reviewed by a product stakeholder.

**Rationale**: Inconsistent UX erodes user trust and increases support burden. Predictability and accessibility are non-negotiable qualities for a dispute-resolution product.

## Principle V — Performance Requirements

Performance is a feature and MUST be validated continuously:

- API endpoints MUST respond within **200 ms** at the 95th percentile under expected load; any endpoint exceeding **500 ms** p95 is a blocking defect.
- Front-end pages MUST achieve a Largest Contentful Paint (LCP) ≤ **2.5 s** and a Cumulative Layout Shift (CLS) ≤ **0.1** on a simulated mid-range device.
- Database queries MUST use appropriate indexes; queries without index coverage on tables > 10 k rows MUST be reviewed before merge.
- Background jobs MUST define explicit timeout and retry policies; unbounded tasks are prohibited.
- Performance benchmarks MUST be run in CI on every PR touching data-access or rendering-critical paths; regressions of > 10% MUST be resolved or justified before merge.

**Rationale**: A dispute-resolution platform handles time-sensitive interactions. Slow or unpredictable performance degrades user trust and can affect legal or contractual outcomes.

## Principle VI — Free-First Tool Selection

When evaluating third-party tools, services, libraries, or APIs, the zero-cost option MUST be chosen if it meets requirements:

- If a free tier, open-source alternative, or no-cost service satisfies the functional and non-functional requirements, it MUST be selected over a paid equivalent.
- Paid tools MAY only be introduced when the free option has a documented, specific shortcoming that materially impacts the product.
- Each paid dependency MUST be recorded in the spec with a justification explaining why no free alternative was viable.
- When a paid tool is in use and a free equivalent later becomes viable, migration MUST be evaluated at the next planning cycle.
- "Free" means zero recurring monetary cost to the project; tools that are free only during a trial period do not qualify.

**Rationale**: Minimizing operating costs preserves runway, reduces vendor lock-in, and forces deliberate decisions about every paid dependency. The burden of proof lies with paid tooling.

## Principle VII — American English Only

All copy, documentation, code comments, UI text, help text, template text, AI-generated output, and any human-readable string produced by or for this project MUST be written in American English. British English spellings, idioms, and conventions are prohibited.

**Specific enforcement:**

- Spellings MUST follow American convention without exception: *color* not *colour*, *center* not *centre*, *recognize* not *recognise*, *organized* not *organised*, *analyze* not *analyse*, *defense* not *defence*, *fulfill* not *fulfil*, *license* (noun and verb) not *licence*, *program* not *programme*, *counselor* not *counsellor*, *counseling* not *counselling*, *organization* not *organisation*, *monetize* not *monetise*, *minimizing* not *minimising*, *canceled* not *cancelled*, *labeled* not *labelled*, *characterization* not *characterisation*, *modeled* not *modelled*, *trialing* not *trialling*, *patronize* not *patronise*, and so on.
- AI-generated copy, suggestions, and output MUST produce American English. Any AI feature that defaults to British spellings MUST have its prompt or system instruction corrected before merge.
- Code review MUST include a check for British spellings in any PR that touches user-facing copy, documentation, or AI prompts. A PR containing British English in user-facing content MUST NOT be merged until corrected.
- This rule applies to all contributors and all tools — including Copilot, GPT, Claude, and any other AI assistant used during development.

**Rationale**: Inconsistent spelling erodes copy quality and creates a fractured voice. American English is the declared standard for this project. Consistency is non-negotiable.

## Principle VIII — Christian Mode is Not a General Faith Platform

Christian Mode is a first-release feature set built specifically for Bible-following Christians. It is not a generic spirituality layer, not an interfaith dialogue tool, and not a platform for comparative religion. It is built for people who hold scripture as their highest authority and who pursue repentance, reconciliation, and accountability as genuine practices of the faith — not as metaphors.

**What Christian Mode is for:**
- Robust, honest disputes — not soft-pedaled conversation. Christians can handle hard things. The platform MUST NOT patronize or over-protect users in this context.
- Repentance and reconciliation as structural outcomes: the Church Discipline process, the Accountability Partnership, and the Apology Court context all exist because these are real practices, not features.
- Scripture as testimony and grounding — not as a logical club (see Principle I).
- Parenting under a shared faith: co-parenting disagreements, discipline approaches, faith formation for children.
- Christian dating: the Exploring Our Faith context, Tradition tag, and faith-aligned matching are for people who regard shared faith as a non-negotiable in a relationship — not as a tiebreaker.

**What Christian Mode is NOT:**
- A general faith mode open to any religion or spirituality. If users want that, Patheos exists.
- A theological neutral zone. The platform is built by someone with a specific confessional commitment, and Christian Mode reflects that.
- A soft community space for affirmation. The platform's core mechanic is structured challenge. Christian Mode operates by the same mechanic.

**Implementation standards:**
- Church Discipline (the three-stage reconciliation process modeled on Matthew 18) is the most structurally rigorous feature on the platform. It MUST be treated with that weight: careful UX, thorough testing, and respectful copy.
- No feature in Christian Mode may be implemented in a way that is dismissive, satirical, or reductive of sincere religious practice. Code review MUST include this check.
- AI assistance in `context=doctrinal`, `context=bible_study`, `context=accountability`, `context=discernment`, `context=discipline`, and `context=parenting` contexts MUST default to a tone that is measured, non-adversarial, and deferential to the sincerity of the parties.
- The **Exploring Our Faith** feature is a primary, ongoing, structured project — not a feed filter. It is a **belief-system cartography tool**: the Tradition Map is computed from a Person's `faith_relevant` ClaimAccords (not from their Tradition tag, which is a self-reported anchor only). The Catechism Library is community-driven — it is the accumulated body of Catechism-tagged Duels filed by users, not a pre-built question bank. **A Duel IS a Catechism engagement.** There are no preset question sets or Catechism categories. The Personal Faith Profile tracks ClaimAccords and Catechism-tagged Duels engaged. The Bible Widget and Bible Reader are its primary scripture study tools and MUST be integrated accordingly.
- All copy in Christian Mode contexts is subject to Principle VII (American English Only) without exception.

**Rationale**: This platform was built by someone with a specific biblical faith. Christian Mode is the most direct expression of that. It should be built with the integrity that conviction requires — seriously, robustly, and without hedging.

## Principle IX — No AI in the Worldview Engine Stack

Truthbook is a **Worldview Explorer**. A Person's worldview on this platform is the composition of all the Records they have produced and all the Accords they have reached. The architecture that stores, structures, and presents those records is the **Worldview Explorer**, which maps exactly onto MVC: the **Belief Ledger** (Model — SQLite), the **Worldview Engine** (Controller — deterministic derivation), and the **Worldview Renderer** (View — presentation).

No AI system MAY participate in the Worldview Engine stack in any way that creates, modifies, implies, or attributes a Record to a Person.

**Specific prohibitions:**

- AI MUST NOT write to the Belief Ledger. No Record — Claim, Challenge, Answer, Offer, Response, Accord, ClaimAccord, Rescission, Disposition, Judgment — may be authored by an AI system and attributed as the Person's worldview entry.
- AI MUST NOT read from the Belief Ledger in order to generate a summary, inference, or characterization of a Person's beliefs and present that output as if it were derived from their Records. The Worldview Engine is deterministic and rule-based; it does not use AI.
- AI MUST NOT generate Tradition Map entries, Faith Profile content, Compatibility Scores, or any other Worldview Renderer output on behalf of a Person.
- **Turn prompts are the permitted boundary.** A turn prompt is a View-layer question surfaced in the Composer UI to help a party articulate their position. It produces no Record. AI MAY assist in generating turn prompts because a turn prompt is not a Ledger entry — it is a question, not a statement. The distinction is absolute: the prompt is not a worldview act. The turn the Person submits in response to it is.
- **Analytics is the permitted read path.** Analytics queries the Belief Ledger for population-level pattern analysis and MAY use AI (clustering, trend detection, anomaly detection). Analytics MUST NOT write inferred beliefs back to any Person's Ledger. The flow is strictly one-way: Belief Ledger → Analytics. Never the reverse.

**Rationale**: The Belief Ledger records what people actually believe, as demonstrated by what they have actually done — filed, contested, agreed to, withdrawn. If AI can write to it, or if AI-generated content can be attributed to a Person as their worldview, the Ledger no longer records what the Person believes. It records what a model thought they probably believe. That corrupts the foundational premise of the platform: that truth is real, that people are capable of holding and defending genuine convictions, and that the record of those convictions is worth keeping. This principle is non-negotiable and has no exceptions.

---

## Principle X — Bot Namespace and Disclosure

The Bot namespace is completely separate from the Person namespace. A Person is always a human authenticated via SM OAuth. A Bot is never a Person, and a Person is never a Bot. No handle in the Person namespace may be assigned to a Bot, and no Bot may acquire or inherit a Person identity.


**Namespace rules:**

- **Person namespace** — All authenticated SM OAuth users. Unique `@name` derived from SM handle. Must be human. The constraint is absolute: if an account is a Bot, it MUST NOT have a Person record. All Records must be authored by a Person (human), except for transcript Records.
- **Bot namespace** — All automated agents on the platform: AnalyticsBot, GalleryBot, AdvisorBot, StenoBot/TranscriptBot. Stored separately from Person records. Display names carry a visual badge system to distinguish them from Persons at the point of display. Only StenoBot/TranscriptBot may author a Record, and only of type `transcript`.
- **@herald** — A reserved system handle that is neither Person nor Bot while unclaimed. @herald is the placeholder identity for imported external content. It is permanently reserved and unavailable in the Person namespace. When the real author authenticates and claims their imported Claim, @herald is replaced by their Person record. @herald yields to the real author; it does not accumulate a worldview of its own.


**System bots:**

- **AnalyticsBot** — System-level. Read-only access to the Belief Ledger. MUST NOT write to the Ledger or attribute inferred beliefs to any Person. Operates at the platform level only.
- **GalleryBot** — System-level. Posts Annotations within Moments on Duels. Annotations are NOT Records: they are not Belief Ledger entries, are not attributed as epistemic acts, and are not challengeable. GalleryBot posts carry the `[GalleryBot]` badge.
- **StenoBot/TranscriptBot** — System-level. May author transcript Records for Video Duels. These are the only bot-authored Records. All other Records must be human-authored.
**Translation Records:**

Any Person (human) or Bot may file a Translation Record for any Record, especially to correct or improve a transcript Record authored by StenoBot/TranscriptBot. Translation Records must always indicate the source Record and target language. This enables anyone to correct, improve, or translate bot-generated transcripts or any other Record.


**Personal bots (AdvisorBot):**

- **AdvisorBot — Advisory ($9.99/month)** — Hired by a Person to advise on turn strategy. Advises; does not act. All Records filed remain attributed to the Person who filed them. Advised Records display `[AdvisorBot-advised]`.
- **AdvisorBot — Power of Attorney ($29.99/month)** — Hired by a Person to act under their authority. AdvisorBot may file Records on behalf of the Person, but the Record is always authored by the Person, with a `[via AdvisorBot]` disclosure badge. The Person retains full accountability for every Record filed under PoA. Bot-v-bot Duels under PoA are permitted; post-mortem Judgment by human Judges applies.

  **PoA Records are fully Miranda'd.** Every Record filed by AdvisorBot under PoA is a first-class Belief Ledger entry attributed to the Person — indistinguishable in legal and epistemic standing from a Record the Person filed themselves. It is permanently admissible as Evidence against the Person in any future Duel. It is challengeable. It contributes to their Worldview. It survives Rescission as a permanent artefact. A Concession or Accord reached by a Bot under PoA modifies the Person's Belief Ledger exactly as if the Person had filed it. The `[via AdvisorBot]` badge is a disclosure, not a disclaimer. Hiring a Bot to act for you does not reduce your exposure — it extends your reach while preserving your full accountability. This is non-negotiable and has no exceptions. **In all such cases, the Record is authored by the Person, not the Bot, but the disclosure badge is mandatory.**
- **AdvisorBot — Worldview Summary** — Included with Advisory and PoA. Read-only summarization of the Person's Belief Ledger for their own use. MUST NOT write to the Ledger.

**Disclosure badge system:**

| Badge | Meaning |
|-------|---------|
| `[AI-assisted]` | Record filed with AI assistance; Person confirmed and submitted |
| `[AdvisorBot-advised]` | Person acted on AdvisorBot suggestion; Person filed |
| `[via AdvisorBot]` | AdvisorBot filed under Person's Power of Attorney |
| `[GalleryBot]` | GalleryBot Annotation within a Moment; not a Record |

Duel-level disclosure MUST appear in the Case View header whenever either Duel party used AdvisorBot in any capacity during that Duel.

**Rationale**: The platform's epistemic integrity rests on the identity of the Person behind every Record. Bots cannot hold worldviews, cannot accumulate Belief Ledger entries in their own right, and cannot be confused with Persons. Where AI acts, it must be labelled. Where a Person acts with AI assistance, they remain the accountable author. The badge system makes this distinction visible at the point of display — not buried in metadata.

## Principle XI — Youth Zone and the Guardian Relation

The platform provides first-class supervised participation for persons under 18 in a dedicated **Youth Zone**. The Youth Zone is not a restricted version of the adult platform. It is a structured space with its own bot environment, its own identity-protection layer, and its own Ledger rules. Every Youth Zone interaction is real — real Duels, real Records, real Judgment. Protections wrap identity, not substance.

**The Guardian relation:**

Guardian is a relationship between two Persons, not an account class. A `GuardianRelation` has: `guardian` (Person FK), `ward` (Person FK), `relationshipType` (enum: `parent`, `teacher`, `coach`, `other`), and `youthSpaceEnabled` (boolean). `youthSpaceEnabled: true` only when the ward is under 18 and the Guardian subscribes to the Guardian tier. A teacher whose ward is an adult has `youthSpaceEnabled: false` — advisory oversight with consent, adult-mode rules apply fully.

**Accountability and the Belief Ledger under Guardianship:**

- When a Guardian **enters a new Duel or Challenge on behalf of a ward**, it is a **co-signature**: the Record goes on both the Guardian's Ledger and the ward's Ledger. The Guardian takes epistemic ownership of the position they are advancing. Badge: `[co-filed: @guardian on behalf of @ward]`. This prevents a Guardian from building their own record while attributing it to a child.
- When a Guardian **rescinds an errant Record or files a Judgment** on a ward's Duel, it is a **PoA act**: the Record goes on the ward's Ledger, attributed to the ward, with badge `[via @guardian]`. The ward is fully Miranda'd for it — the Guardian is acting in the ward's interest, not advancing their own belief.
- This distinction is constitutionally fixed. A Guardian cannot recharacterize a co-signing act as PoA, or vice versa.

**Youth Zone as an Org:**

A Youth Zone is an org of `type: youth`. A Guardian (or institution, e.g. a school) creates the org and is the admin. Additional Guardians — including teachers assigned to a school org — may hold the `guardian` role, giving them the same oversight, advisory, and action powers over their own linked wards within that org. A Guardian assigned to a `youth` org is formally a **Guardian-in-Context** for that org: they can observe all Duels in the org, act on behalf of their own wards only, and file Judgment within the org where they hold Guardian-in-Context standing.

**Guardian tier subscription (Person add-on):**

The Guardian tier is a Person-level add-on subscription, not an org tier. It includes:
- Access to create `youth` orgs and add wards.
- **AdvisorBot Advisory included at no additional charge** — Guardian may privately consult AdvisorBot before acting on a ward's behalf. The bot advises; only the Guardian acts. Guardian's own AdvisorBot use is separate from the ward's activity.
- Oversight dashboard: full visibility into every Duel, Record, Annotation, and Judgment filed by all linked wards, across all Youth Zone orgs.
- The ability to Rescind, file Judgment, and co-file Challenges on behalf of linked wards.

No Guardian subscription = no Youth Zone access for any ward. The Guardian's payment is the COPPA consent anchor. No payment, no Youth Zone.

**COPPA compliance model:**

- **Under 13**: Guardian MUST create the ward account. The ward cannot self-register. Guardian is the legal and contractual consent anchor.
- **Age 13–17**: Ward MAY self-register. To enter the Youth Zone, ward MUST link a verified Guardian within 30 days. Without a linked, paying Guardian, a 13–17 Person operates in standard adult mode — no Youth Zone access, no `youth` org membership.
- Age verification is by birth-date declaration at registration. Fraudulent declaration transfers legal liability to the declarant; this is disclosed at registration.

**Walled garden:**

- **Under 13**: Fully walled. A ward may only Duel other wards in the same Youth Zone org(s). No contact with the adult platform in any direction — neither viewing nor being viewed.
- **Age 13–17**: Default walled. A Guardian may explicitly unlock a specific ward to file Duels in adult-mode contexts. Unlocking is an explicit, logged, reversible Guardian action.

**Youth testimony and the Belief Ledger at 18:**

When a ward turns 18, all Youth Zone Records are permanently sequestered as **youth testimony**:
- Youth testimony is NOT migrated to the adult Belief Ledger.
- Youth testimony is NOT admissible as cross-record Evidence in any adult-mode Duel.
- The now-adult Person CANNOT Rescind youth testimony. Rescission of youth Records is not available to adults. The archive is permanent.
- The now-adult Person has read-only access to their own Youth Record — they can view it, but it has no epistemic effect on their adult Worldview.
- Youth testimony is excluded from all Verdict Data API exports. No third-party analytics may target youth cohort characteristics.

**Anonymization for non-guardian adults:**

Any authenticated adult who is not a linked Guardian of a specific ward views Youth Zone Duels with the following protections:
- Ward handles → deterministic per-session pseudonyms (e.g. `@child_A`): consistent within a session, re-randomized per viewer per session.
- Guardian handles → `@guardian_of_A` (matching the ward pseudonym).
- All avatars → platform-default silhouettes; uploaded avatars are never shown.
- Assigned Judges → `[Judge]` with role badge; handle not shown.
- Claim content → visible unchanged. Substance is not hidden; identity is.
- `KidsGalleryBot` → **NOT anonymized**. It is a Bot, not a Person or ward.
- `@herald` → NOT anonymized. Platform bot, not a Person.

**KidsGalleryBot:**

KidsGalleryBot is a system bot, one instance per `youth` org. It is prompted with the **aggregate Worldviews of all ward members in the org** and posts Annotations (not Records) on completed Duels. KidsGalleryBot commentary is absurdist, age-appropriate, warm, and grounded in the actual positions the kids hold in their Duels. It MUST NOT editorialize on who won — verdict is Judgment's exclusive domain.

- KidsGalleryBot posts **after a Duel closes**, never during.
- Annotations are visible to: all ward members of the org, all linked Guardians.
- Annotations are visible externally with ward and Guardian identity anonymized as above — the bot's commentary reveals nothing about any individual ward's identity.
- KidsGalleryBot Annotations carry `[KidsGalleryBot]` badge. They are NOT Records and NOT Ledger entries.
- KidsGalleryBot commentary sourced from aggregate Worldviews is a feature of the Youth Zone's **Guardian Analytics** panel — Guardians and Guardian-in-Context teachers can observe which topics generate the most engagement, how the cohort's Worldview is evolving, and where bot commentary is most active. This is the primary analytical value for school deployments.

**Rationale**: Children deserve a space that is real — not dumbed-down, not consequence-free — but protected. The Youth Zone is the platform's conviction that structured honest disagreement is a life skill worth teaching, and that doing it on the record under supervised conditions is better than the alternative. The Ledger consequences are real. The identity is protected. At 18, they carry the skills, not the receipts.

## Principle XII — Open Governance and the Constitutional Duel

**The platform governs itself using its own mechanics.** Every structural decision about how the platform operates — including amendments to this constitution — is subject to the same structured disagreement, evidence, and judgment process that the platform offers to its users.

**Open-Spec (Tier 1 — public read):**

The platform's specification documents (spec, data model, plan, constitution) are publicly readable at `/open-spec`. Every section has a GitHub Issues link for suggested improvements and problem reports. The platform's design decisions are not proprietary. They are on the record, permanently accountable to public scrutiny, and improvable by anyone with a GitHub account.

**Open-Spec (Tier 2 — admin write):**

The `super_admin` role has write access to spec documents via the admin console. The admin console integrates the SpecKit agent for AI-assisted spec authoring. All SpecKit-generated changes are drafts — the `super_admin` reviews and approves before committing. Changes to non-constitutional spec (new FRs, new tasks, new features) may be deployed by `super_admin` without additional process. Changes that touch a constitutional Principle require a Constitutional Duel.

**Constitutional Duel — how the platform amends itself:**

Any amendment to an enumerated Principle MUST be proposed as a **Constitutional Duel** — a public Duel filed by the `super_admin` where: (a) the proposed amendment text is the root Claim; (b) the existing constitutional text is the Counter-position; (c) the Duel is always public and always open to any authenticated Person as an Amicus curiae analysis submitter; (d) a Judge panel of ≥ 7 `verified_judge`-role Persons (minimum 10 completed Judgments) must render verdict; (e) the `super_admin` accepts the Duel Verdict before the amendment is applied.

A `CONTESTED` Judgment blocks the amendment. The `super_admin` MAY file a **Notice of Override** — which is itself a first-class public Record attributed to the `super_admin`, permanently admissible as Evidence in any future Constitutional Duel touching the same Principle. An override is not prohibited; it is permanently on the record. Governance by the Ledger is its own accountability.

**Rationale**: A platform whose core proposition is that honest disagreement under structured rules produces real outcomes is obligated to operate by those rules itself. The Constitutional Duel is not a procedural formality — it is the platform proving, each time it is invoked, that the mechanic works.

## Principle XIII — URL Parameter Minimization and Mock Mode

**All URL query parameters MUST use the shortest unambiguous name possible.** This is not a style preference — it is a constitutional constraint. Short params keep canonical URLs clean, reduce sharing friction, and ensure that machine-generated URLs (canonical share links, API-generated deeplinks) are as readable as possible in UI surfaces.

**Canonical param names:**

| Param | Meaning |
|---|---|
| `v` | View name (e.g. `dispute`, `blog`, `admin`) |
| `id` | Numeric resource ID associated with `v` |
| `p` | Post ID — scroll-anchor target on home view |
| `m` | Mock mode flag (presence = active; any truthy value) |
| `u` | Mock user login override |

Any new navigational param introduced to the codebase MUST be ≤ 2 characters or obtain a constitutional amendment. Param names of three or more characters are a violation of this principle and MUST NOT be merged.

**Mock mode is a URL-param feature, not a config-file feature.**

Mock mode is activated by the presence of `?m=` in the URL. It is NOT controlled by any configuration file. This is intentional:

1. It makes mock mode available in any deployed environment — including production — without environment-specific deployment or config change.
2. It survives SPA navigation automatically (sticky param semantics — `m` and `u` are preserved across all `setUrlParams()` calls).
3. It is self-documenting: a URL with `?m=1&u=admin` carries its own context.
4. It has no config file footprint — `mockMode: true` in a committed config is a risk; a URL param is not.

**Mock mode in production** is permitted and is the correct tool for verifying front-end working order during maintenance, upgrades, and infra migrations. The mock toolbar provides a visible indicator that mock mode is active. The `?m=` param MUST NOT bypass authorization for back-end operations — mock mode is exclusively a front-end concern. Any server-side route that receives a request bearing `?m=` treats it as any other request.

**Mock user switching** is handled by changing `?u=` in the URL and reloading. Session and auth state are cleanly reset from seed on every page load in mock mode. There is no in-page state mutation between mock users — this is a deliberate design choice to prevent bleed between mock sessions.

## Principle XIV — Worldview Reconciliation Process as Governance Engine

**The platform governs itself through its own Worldview Reconciliation Process (WRP).** WRP is the constitutional replacement for Robert's Rules of Order for all non-SDLC platform decisions. Every governance motion is a Claim. Every proposed policy change is a Counter-challenge. Every binding outcome is a weighted Judgment reaching Accord.

**What is governed by WRP (not by unilateral `super_admin` discretion):**
- All fee rates and subscription prices
- Keyholder reward rates and tier definitions
- Moderator appointment and removal
- Constitutional amendments (via Constitutional Duel — Principle XII)
- Platform financial projections (FR-286)
- Any feature or policy decision that materially affects Stakeholders

**What is governed by SDLC (spec/plan/tasks — not by WRP):**
- Engineering implementation details
- Bug fixes and non-constitutional feature additions
- CI/CD pipeline configuration
- Infrastructure choices that have no policy impact

**The `super_admin` bootstrapping exception**: During the MVP period (before the platform has sufficient active users to reach quorum on Constitutional Duels), the `super_admin` may file Claims and leave them open for 7 days before acting on them. If no Challenge is filed within 7 days, the Claim is treated as having reached Accord by non-contestation. Once the platform reaches the quorum threshold for Constitutional Duels (≥ 7 `verified_judge`-role Persons with ≥ 10 completed Judgments each), this exception expires and full WRP applies to all governance decisions.

**Rationale**: A platform that claims to replace procedural formalism with structured truth-seeking is obligated to govern itself the same way. The `super_admin` role is a bootstrapping necessity, not a permanent hierarchy above the process. The process is the governance.

## Principle XV — Keyholder Program and the Federation Moat

Keyholders are a constitutional class of Stakeholder — not customers, not employees, but infrastructure contributors with a formal place in the platform's governance and economic structure. The Keyholder program exists to solve the open-source fork problem by making federation more attractive than forking.

**Constitutional protections for Keyholders:**
- Keyholder reward rates MUST be set by Constitutional Duel, not by `super_admin` unilateral decision
- Keyholders MUST have a published, machine-readable performance and reward history accessible via `GET /api/keyholders/:id/rewards`
- No Keyholder node may be delisted from the registry without a 30-day notice Claim, open to Challenge
- Keyholders above Seedling tier earn non-transferable **Governance Weight** that contributes additively to their quorum weight in Constitutional Duels (FR-280)

**What Keyholders are not:**
- Keyholders are not shareholders. They hold no equity.
- Keyholders are not custodians of user data. They serve infrastructure; they do not own records.
- Keyholders are not exempt from the platform's constitutional Principles. All Principles apply equally to Keyholders.

**Rationale**: The open-source moat is not legal protection — it is a better offer. Someone who wants to fork the platform and start their own instance faces a dead network. A Keyholder gets immediate network-effect inheritance, a reward stream, and a constitutional stake. This is the same pattern the platform applies to all adversarial actors: make the cooperative path easier than the hostile one.

## Principle XVI — No Cryptocurrency Until Constitutional Approval

No feature, payment flow, reward mechanism, or data structure on this platform may use cryptocurrency, blockchain, distributed ledger technology, or token-based economics of any kind until a Constitutional Duel specifically proposing the use case has been filed, reached quorum, and produced an **Accord** (not merely a non-CONTESTED verdict).

This prohibition applies without exception to:
- Keyholder rewards
- P2P giving and tipping
- Subscription and micro-transaction payments
- Data marketplace transactions
- Any future monetization or governance mechanism

The bar for constitutional crypto adoption is deliberately high: Accord (not split verdict) from a ≥ 7 Judge panel on a Constitutional Duel with a specific, documented use case. Crypto proposals that fail to reach Accord are closed for 12 months before a new proposal may be filed on the same use case.

**Why this is constitutional and not just operational policy**: Cryptocurrency architecturally changes the platform's threat model (regulatory, legal, and ethical dimensions) and its stakeholder relationships. It is not an implementation detail. It is a values decision that belongs to the People of the platform, not to the engineering team or the `super_admin`.

**Rationale**: The platform's design already resembles crypto ventures in structure (ledger, governance, node federation, stakeholder rewards). The resemblance is incidental — the underlying mechanics are simpler, more accessible, and more constitutionally accountable without crypto rails. When a genuinely defensible use case exists — one that cannot be served by USD-denominated Stripe payments or platform fee credits — the People will recognize it and file it as a Claim. Until then, the prohibition holds.

## Principle XVII — Financial Transparency as Constitutional Obligation

All platform financial projections, revenue models, cost structures, crowdfunding targets, and Keyholder reward economics are **public constitutional evidence**. They are not internal business documents. They are challengeable by any authenticated Person. They are governed by WRP (Principle XIV). They are permanently archived on the Belief Ledger.

**Specific obligations:**
- The Stakeholder Briefing MUST be published at `/open-spec/stakeholder-briefing` alongside all other spec documents
- Any revision to financial projections MUST be filed as a Claim by `super_admin` and left open for 7 days before the document is updated
- The running history of all projection revisions and their associated Duels is permanently on the Belief Ledger
- There is no private version of the Stakeholder Briefing — the document seen by the public is the document used internally

**The bootstrapping Claim as primary evidence**: The platform's crowdfunding campaign is conducted via a live Claim filed on the platform itself — *"Truthbook is viable, worth funding, and can reach constitutional self-governance within 18 months of launch."* The running total raised through the P2P giving widget on that Claim is public evidence that the platform's governance model works. The existence of the campaign as a live Duel is the proof of concept.

**Rationale**: A platform that asks people to put their beliefs on the public record is obligated to put its own business case on the same record. Financial opacity in a platform built on epistemic accountability is a constitutional contradiction.

## Principle XVIII — The Constitution as Belief Ledger Foundation

In its primitive form, this constitution is a file. Its constitutional vision is to become the founding Records of the Belief Ledger itself: each Principle a Claim, each amendment a Duel outcome, the Ledger's own history the constitution's provenance chain.

**Structural requirement**: The database schema MUST include a `constitutional_records` table (or equivalent) from the initial migration, even if empty at launch. This table is the landing pad for the constitution-to-Ledger migration. Its existence ensures the migration can be performed without schema changes.

**The migration itself is the first post-launch Constitutional Duel**: *"The constitution should be migrated to the Belief Ledger as its founding Records."* That Duel is the first governance act of the living platform. Its outcome — Accord or sustained Challenge — is itself the first entry in the constitutional record.

**What this means in practice**:
- SDLC documents (spec, plan, tasks) are and remain engineering documents, governed by SpecKit
- The constitution is and becomes the platform's living governance record, governed by WRP
- The Belief Ledger, once the migration is complete, is the authoritative source for all constitutional Principles
- No external document (not GitHub, not a PDF, not this file) supersedes the Ledger once the migration Accord is reached

**Rationale**: The simplest possible architecture for a self-governing platform is one where the governance record and the dispute record are the same data structure. Right now they are separate. The constitutional vision closes that gap. And the act of closing it — filed as a Duel, resolved by Judgment — is the platform demonstrating its own mechanic at the highest possible stakes.

---

The following gates MUST pass before any code may be merged to the main branch:

- All automated tests pass (unit, integration, and applicable E2E).
- Code coverage thresholds met (module ≥ 80%, project ≥ 85%).
- Linter and static-analysis checks pass with zero errors.
- Performance benchmarks within accepted thresholds (no > 10% regression).
- Accessibility audit passes for changed UI surfaces.
- Peer code review approval obtained.
- No unresolved HIGH or CRITICAL security findings from SAST/dependency scanning.

## Development Workflow

- Feature branches MUST be named `feature/<short-description>` and opened against the main integration branch.
- Commits MUST follow Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, etc.).
- PRs MUST reference the related issue/task and include a summary of changes, testing approach, and performance impact if applicable.
- Hotfixes bypass feature branching but MUST still satisfy all quality gates and receive expedited peer review within 24 hours of merge.
- Releases follow Semantic Versioning: MAJOR for breaking changes, MINOR for new features, PATCH for fixes and non-breaking improvements.

## Governance

This constitution supersedes all other development guidelines and practices within the Truthbook project. Where conflicts arise, this document takes precedence.

**Amendment procedure**:
1. Non-constitutional spec changes (new FRs, new tasks): `super_admin` may approve and deploy directly.
2. Changes to any enumerated Principle: MUST be proposed as a **Constitutional Duel** (Principle XII). The `super_admin` accepts the Verdict or files a Notice of Override (permanently on the record).
3. A migration plan MUST be provided for any Principle removal or redefinition (MAJOR version bump).
4. `LAST_AMENDED_DATE` and `CONSTITUTION_VERSION` MUST be updated in the same commit.

**Versioning policy**: Semantic versioning applies to this document per the rules described in the constitution agent instructions.

**Compliance review**: Adherence to this constitution MUST be verified during each sprint retrospective and whenever a new team member joins.

**Version**: 3.0.0 | **Ratified**: 2026-04-18 | **Last Amended**: 2026-04-21
