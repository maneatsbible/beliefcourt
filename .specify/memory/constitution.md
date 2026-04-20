<!--
SYNC IMPACT REPORT
==================
Version change: (new) → 1.0.0
Added sections:
  - Core Principles (I–IV)
  - Quality Gates
  - Development Workflow
  - Governance
Modified principles: N/A (initial ratification)
Removed sections: N/A

Templates reviewed:
  - .specify/templates/constitution-template.md ✅ (source)
  - .specify/templates/plan-template.md ✅ (no constitution-specific overrides required)
  - .specify/templates/spec-template.md ✅ (no changes required)
  - .specify/templates/tasks-template.md ✅ (no changes required)

Follow-up TODOs:
  - None. All placeholders resolved.
-->

# disputable.io Constitution

## Founding Declaration

*Where worldviews collide, people open cases to confront the differences, seeking harmony.*

*Social media usually means social mayhem. judgmental.io introduces social mediation.*

judgmental.io exists because of a conviction drawn directly from biblical faith in Jesus Christ.

The platform is built on the belief that truth is real, that it can be known, and that people made in the image of God are capable of holding and defending genuine convictions — not merely constructing plausible-sounding arguments.

The product therefore serves two related purposes that flow from the same source:

1. **To give every person — beginning with those who share this faith — a place to stand on what they actually believe**, defended with integrity, subject to challenge, and resolved with respect.
2. **To build something that lasts**: a platform principled enough to serve the faith community well, and robust enough to serve anyone willing to engage sincerely.

The dating features, the viral mechanics, the Christian Mode, the Church Discipline process, the open API, the historical re-trials — all of it exists downstream of this. The ambition for the platform to grow, to reach people, and to sustain itself commercially is not in tension with this foundation. It is in service of it.

**This declaration is not a marketing statement. It is the reason the project exists.** Every principle that follows flows from it. When a decision is hard to make, this is where the answer starts.

---

## Core Principles

### I. No Argumentation — Defended Belief Only (NON-NEGOTIABLE — PRIORITY ONE)

This is the foundational product principle. It governs every design decision, every line of UI copy, every AI behavior, every feature, and every code review. It supersedes all other principles when in conflict.

**The core commitment:**

judgmental.io is a platform for *defended belief*, not for *constructed argument*. The question the platform asks of every person in every Duel, in every context, is: *"What do you actually believe, and can you defend it?"* — never *"Can you build a better argument?"*

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
- All inputs, templates, and AI prompts involving scripture MUST ask: *"What does this passage mean to you and how does it ground your position?"* — never *"What conclusions follow from this verse?"*
- Any AI output that constructs a syllogism from scripture references MUST be suppressed or reformulated before display, regardless of context.

**Rationale**: Argumentation rewards rhetorical skill over substantive truth. It is a game that can be won without being right. Proof-texting makes any position appear scriptually grounded through selective citation. This platform is built on the conviction that truth is knowable and defensible by real people holding real convictions — not by those most skilled at logical construction. The burden of proof is on lived, grounded belief.

### II. Code Quality (NON-NEGOTIABLE)

All production code MUST meet the following standards before merging:

- Every module, function, and class MUST have a single, clearly defined responsibility (Single Responsibility Principle).
- Code MUST be reviewed by at least one peer before merge; self-merges are prohibited on protected branches.
- All public APIs MUST be documented with purpose, parameters, return values, and error conditions.
- Dead code, commented-out blocks, and unused imports MUST be removed prior to merge.
- Linting and static analysis MUST pass with zero errors; warnings MUST be reviewed and either resolved or explicitly suppressed with justification.
- Duplication MUST be eliminated through abstraction before a feature is considered complete; copy-paste of non-trivial logic is a blocking defect.

**Rationale**: Consistent, clean code reduces onboarding friction, lowers defect rates, and makes the system maintainable as the team and codebase grow.

### III. Testing Standards (NON-NEGOTIABLE)

Automated testing is a first-class deliverable, not an afterthought:

- Every new feature or bug fix MUST be accompanied by tests written before or alongside the implementation (TDD encouraged; coverage gate enforced).
- Unit test coverage MUST not drop below **80%** for any module; the project-wide coverage gate is **85%**.
- Coverage gates MUST be enforced automatically in CI (e.g. `c8 --branches 80 --lines 85` or equivalent); a PR where CI does not run coverage checks is not eligible for merge until CI is configured.
- Integration tests MUST cover all cross-module contracts, external API interactions, and database operations.
- Tests MUST be deterministic — flaky tests MUST be fixed or quarantined within one sprint of discovery.
- Test data MUST be isolated; tests MUST NOT share mutable global state or depend on execution order.
- End-to-end tests MUST cover all critical user journeys defined in the specification.

**Rationale**: Comprehensive, reliable tests are the primary mechanism for safe iteration and confident deployment.

### IV. User Experience Consistency (NON-NEGOTIABLE)

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

### V. Performance Requirements

Performance is a feature and MUST be validated continuously:

- API endpoints MUST respond within **200 ms** at the 95th percentile under expected load; any endpoint exceeding **500 ms** p95 is a blocking defect.
- Front-end pages MUST achieve a Largest Contentful Paint (LCP) ≤ **2.5 s** and a Cumulative Layout Shift (CLS) ≤ **0.1** on a simulated mid-range device.
- Database queries MUST use appropriate indexes; queries without index coverage on tables > 10 k rows MUST be reviewed before merge.
- Background jobs MUST define explicit timeout and retry policies; unbounded tasks are prohibited.
- Performance benchmarks MUST be run in CI on every PR touching data-access or rendering-critical paths; regressions of > 10% MUST be resolved or justified before merge.

**Rationale**: A dispute-resolution platform handles time-sensitive interactions. Slow or unpredictable performance degrades user trust and can affect legal or contractual outcomes.

### VI. Free-First Tool Selection

When evaluating third-party tools, services, libraries, or APIs, the zero-cost option MUST be chosen if it meets requirements:

- If a free tier, open-source alternative, or no-cost service satisfies the functional and non-functional requirements, it MUST be selected over a paid equivalent.
- Paid tools MAY only be introduced when the free option has a documented, specific shortcoming that materially impacts the product.
- Each paid dependency MUST be recorded in the spec with a justification explaining why no free alternative was viable.
- When a paid tool is in use and a free equivalent later becomes viable, migration MUST be evaluated at the next planning cycle.
- "Free" means zero recurring monetary cost to the project; tools that are free only during a trial period do not qualify.

**Rationale**: Minimizing operating costs preserves runway, reduces vendor lock-in, and forces deliberate decisions about every paid dependency. The burden of proof lies with paid tooling.

### VII. American English Only

All copy, documentation, code comments, UI text, help text, template text, AI-generated output, and any human-readable string produced by or for this project MUST be written in American English. British English spellings, idioms, and conventions are prohibited.

**Specific enforcement:**

- Spellings MUST follow American convention without exception: *color* not *colour*, *center* not *centre*, *recognize* not *recognise*, *organized* not *organised*, *analyze* not *analyse*, *defense* not *defence*, *fulfill* not *fulfil*, *license* (noun and verb) not *licence*, *program* not *programme*, *counselor* not *counsellor*, *counseling* not *counselling*, *organization* not *organisation*, *monetize* not *monetise*, *minimizing* not *minimising*, *canceled* not *cancelled*, *labeled* not *labelled*, *characterization* not *characterisation*, *modeled* not *modelled*, *trialing* not *trialling*, *patronize* not *patronise*, and so on.
- AI-generated copy, suggestions, and output MUST produce American English. Any AI feature that defaults to British spellings MUST have its prompt or system instruction corrected before merge.
- Code review MUST include a check for British spellings in any PR that touches user-facing copy, documentation, or AI prompts. A PR containing British English in user-facing content MUST NOT be merged until corrected.
- This rule applies to all contributors and all tools — including Copilot, GPT, Claude, and any other AI assistant used during development.

**Rationale**: Inconsistent spelling erodes copy quality and creates a fractured voice. American English is the declared standard for this project. Consistency is non-negotiable.

### VIII. Christian Mode is Not a General Faith Platform

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

### IX. No AI in the Worldview Engine Stack

judgmental.io is a **Worldview Explorer**. A Person's worldview on this platform is the composition of all the Records they have produced and all the Accords they have reached. The architecture that stores, structures, and presents those records is the **Worldview Explorer**, which maps exactly onto MVC: the **Belief Ledger** (Model — SQLite), the **Worldview Engine** (Controller — deterministic derivation), and the **Worldview Renderer** (View — presentation).

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

- **Person namespace** — All authenticated SM OAuth users. Unique `@name` derived from SM handle. Must be human. The constraint is absolute: if an account is a Bot, it MUST NOT have a Person record.
- **Bot namespace** — All automated agents on the platform: AnalyticsBot, GalleryBot, AdvisorBot. Stored separately from Person records. Display names carry a visual badge system to distinguish them from Persons at the point of display.
- **@herald** — A reserved system handle that is neither Person nor Bot while unclaimed. @herald is the placeholder identity for imported external content. It is permanently reserved and unavailable in the Person namespace. When the real author authenticates and claims their imported Claim, @herald is replaced by their Person record. @herald yields to the real author; it does not accumulate a worldview of its own.

**System bots:**

- **AnalyticsBot** — System-level. Read-only access to the Belief Ledger. MUST NOT write to the Ledger or attribute inferred beliefs to any Person. Operates at the platform level only.
- **GalleryBot** — System-level. Posts Annotations within Moments on Duels. Annotations are NOT Records: they are not Belief Ledger entries, are not attributed as epistemic acts, and are not challengeable. GalleryBot posts carry the `[GalleryBot]` badge.

**Personal bots (AdvisorBot):**

- **AdvisorBot — Advisory ($9.99/month)** — Hired by a Person to advise on turn strategy. Advises; does not act. All Records filed remain attributed to the Person who filed them. Advised Records display `[AdvisorBot-advised]`.
- **AdvisorBot — Power of Attorney ($29.99/month)** — Hired by a Person to act under their authority. May file Records attributed to that Person. All such Records carry `[via AdvisorBot]`. Person retains full accountability for every Record filed under PoA. Bot-v-bot Duels under PoA are permitted; post-mortem Judgment by human Judges applies.

  **PoA Records are fully Miranda'd.** Every Record filed by AdvisorBot under PoA is a first-class Belief Ledger entry attributed to the Person — indistinguishable in legal and epistemic standing from a Record the Person filed themselves. It is permanently admissible as Evidence against the Person in any future Duel. It is challengeable. It contributes to their Worldview. It survives Rescission as a permanent artefact. A Concession or Accord reached by a Bot under PoA modifies the Person's Belief Ledger exactly as if the Person had filed it. The `[via AdvisorBot]` badge is a disclosure, not a disclaimer. Hiring a Bot to act for you does not reduce your exposure — it extends your reach while preserving your full accountability. This is non-negotiable and has no exceptions.
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

## Quality Gates

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

This constitution supersedes all other development guidelines and practices within the disputable.io project. Where conflicts arise, this document takes precedence.

**Amendment procedure**:
1. Propose a change via a PR that modifies this file with a clear rationale.
2. At least two maintainers MUST approve the PR.
3. A migration plan MUST be provided for any principle removal or redefinition (MAJOR version bump).
4. `LAST_AMENDED_DATE` and `CONSTITUTION_VERSION` MUST be updated in the same commit.

**Versioning policy**: Semantic versioning applies to this document per the rules described in the constitution agent instructions.

**Compliance review**: Adherence to this constitution MUST be verified during each sprint retrospective and whenever a new team member joins.

**Version**: 2.4.0 | **Ratified**: 2026-04-18 | **Last Amended**: 2026-04-20
