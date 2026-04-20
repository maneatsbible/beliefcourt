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

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

All production code MUST meet the following standards before merging:

- Every module, function, and class MUST have a single, clearly defined responsibility (Single Responsibility Principle).
- Code MUST be reviewed by at least one peer before merge; self-merges are prohibited on protected branches.
- All public APIs MUST be documented with purpose, parameters, return values, and error conditions.
- Dead code, commented-out blocks, and unused imports MUST be removed prior to merge.
- Linting and static analysis MUST pass with zero errors; warnings MUST be reviewed and either resolved or explicitly suppressed with justification.
- Duplication MUST be eliminated through abstraction before a feature is considered complete; copy-paste of non-trivial logic is a blocking defect.

**Rationale**: Consistent, clean code reduces onboarding friction, lowers defect rates, and makes the system maintainable as the team and codebase grow.

### II. Testing Standards (NON-NEGOTIABLE)

Automated testing is a first-class deliverable, not an afterthought:

- Every new feature or bug fix MUST be accompanied by tests written before or alongside the implementation (TDD encouraged; coverage gate enforced).
- Unit test coverage MUST not drop below **80%** for any module; the project-wide coverage gate is **85%**.
- Coverage gates MUST be enforced automatically in CI (e.g. `c8 --branches 80 --lines 85` or equivalent); a PR where CI does not run coverage checks is not eligible for merge until CI is configured.
- Integration tests MUST cover all cross-module contracts, external API interactions, and database operations.
- Tests MUST be deterministic — flaky tests MUST be fixed or quarantined within one sprint of discovery.
- Test data MUST be isolated; tests MUST NOT share mutable global state or depend on execution order.
- End-to-end tests MUST cover all critical user journeys defined in the specification.

**Rationale**: Comprehensive, reliable tests are the primary mechanism for safe iteration and confident deployment.

### III. User Experience Consistency (NON-NEGOTIABLE)

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

### V. Free-First Tool Selection

When evaluating third-party tools, services, libraries, or APIs, the zero-cost option MUST be chosen if it meets requirements:

- If a free tier, open-source alternative, or no-cost service satisfies the functional and non-functional requirements, it MUST be selected over a paid equivalent.
- Paid tools MAY only be introduced when the free option has a documented, specific shortcoming that materially impacts the product.
- Each paid dependency MUST be recorded in the spec with a justification explaining why no free alternative was viable.
- When a paid tool is in use and a free equivalent later becomes viable, migration MUST be evaluated at the next planning cycle.
- "Free" means zero recurring monetary cost to the project; tools that are free only during a trial period do not qualify.

**Rationale**: Minimising operating costs preserves runway, reduces vendor lock-in, and forces deliberate decisions about every paid dependency. The burden of proof lies with paid tooling.

### IV. Performance Requirements

Performance is a feature and MUST be validated continuously:

- API endpoints MUST respond within **200 ms** at the 95th percentile under expected load; any endpoint exceeding **500 ms** p95 is a blocking defect.
- Front-end pages MUST achieve a Largest Contentful Paint (LCP) ≤ **2.5 s** and a Cumulative Layout Shift (CLS) ≤ **0.1** on a simulated mid-range device.
- Database queries MUST use appropriate indexes; queries without index coverage on tables > 10 k rows MUST be reviewed before merge.
- Background jobs MUST define explicit timeout and retry policies; unbounded tasks are prohibited.
- Performance benchmarks MUST be run in CI on every PR touching data-access or rendering-critical paths; regressions of > 10% MUST be resolved or justified before merge.

**Rationale**: A dispute-resolution platform handles time-sensitive interactions. Slow or unpredictable performance degrades user trust and can affect legal or contractual outcomes.

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

**Version**: 1.2.0 | **Ratified**: 2026-04-18 | **Last Amended**: 2026-04-20
