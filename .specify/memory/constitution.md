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

This is the foundational product principle. It governs every design decision, every line of UI copy, every AI behaviour, every feature, and every code review. It supersedes all other principles when in conflict.

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

- The project design system is defined as: the CSS custom properties in `styles/main.css` (colour tokens, spacing scale, typography scale, and component-level variables) plus any component files under `src/view/components/`. These files are the canonical source of truth for visual style.
- UI components MUST be built from design-system tokens and components; deviating from the token set (hardcoded colours, ad-hoc font sizes, etc.) requires explicit justification in the PR.
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

**Rationale**: Minimising operating costs preserves runway, reduces vendor lock-in, and forces deliberate decisions about every paid dependency. The burden of proof lies with paid tooling.

### VII. Christian Mode is Not a General Faith Platform

Christian Mode is a first-release feature set built specifically for Bible-following Christians. It is not a generic spirituality layer, not an interfaith dialogue tool, and not a platform for comparative religion. It is built for people who hold scripture as their highest authority and who pursue repentance, reconciliation, and accountability as genuine practices of the faith — not as metaphors.

**What Christian Mode is for:**
- Robust, honest disputes — not soft-pedalled conversation. Christians can handle hard things. The platform MUST NOT patronise or over-protect users in this context.
- Repentance and reconciliation as structural outcomes: the Church Discipline process, the Accountability Partnership, and the Apology Court context all exist because these are real practices, not features.
- Scripture as testimony and grounding — not as a logical club (see Principle I).
- Parenting under a shared faith: co-parenting disagreements, discipline approaches, faith formation for children.
- Christian dating: the Exploring Our Faith context, Tradition tag, and faith-aligned matching are for people who regard shared faith as a non-negotiable in a relationship — not as a tiebreaker.

**What Christian Mode is NOT:**
- A general faith mode open to any religion or spirituality. If users want that, Patheos exists.
- A theological neutral zone. The platform is built by someone with a specific confessional commitment, and Christian Mode reflects that.
- A soft community space for affirmation. The platform's core mechanic is structured challenge. Christian Mode operates by the same mechanic.

**Implementation standards:**
- Church Discipline (the three-stage reconciliation process modelled on Matthew 18) is the most structurally rigorous feature on the platform. It MUST be treated with that weight: careful UX, thorough testing, and respectful copy.
- No feature in Christian Mode may be implemented in a way that is dismissive, satirical, or reductive of sincere religious practice. Code review MUST include this check.
- AI assistance in `context=doctrinal`, `context=bible_study`, `context=accountability`, `context=discernment`, `context=discipline`, and `context=parenting` contexts MUST default to a tone that is measured, non-adversarial, and deferential to the sincerity of the parties.
- The **Exploring Our Faith** feature is a primary discovery surface for the faith community and MUST be treated as a core feature, not an extension.

**Rationale**: This platform was built by someone with a specific biblical faith. Christian Mode is the most direct expression of that. It should be built with the integrity that conviction requires — seriously, robustly, and without hedging.

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

**Version**: 2.2.0 | **Ratified**: 2026-04-18 | **Last Amended**: 2026-04-20
