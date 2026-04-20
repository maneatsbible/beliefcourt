# Anti-Argumentation Review Checklist

**Constitutional Principle I — No Argumentation — Defended Belief Only**

This checklist is a required merge gate for all pull requests. Every item must be confirmed before merging. See the project constitution for the full principle.

---

## UI Copy & Templates

- [ ] No syllogistic framing in any UI copy, placeholder text, or help text
- [ ] No "Therefore…", "It follows that…", "Premise one…", "This proves…", or equivalent logical connectives in any user-facing string
- [ ] No template, tooltip, or onboarding copy suggests that a stronger argument leads to a better outcome
- [ ] Turn prompts ask *"What do you believe and why?"* — not *"What is your argument?"*
- [ ] scripture-adjacent prompts ask *"What does this text mean to you?"* — not *"What conclusions follow from this verse?"*

## Feature Design

- [ ] No feature surfaces "argument strength", "logical validity", or "argument quality" as a score or metric
- [ ] Fallacy Tag and Claim Map, if rendered, are presented as post-hoc diagnostic observations — never as scoring inputs
- [ ] No feature guides the user to construct a logical proof or syllogism
- [ ] Accountability and Doctrinal contexts do not reward "winning the argument" — only sincere engagement

## AI Assistance

- [ ] AI-assisted turn drafting does not generate syllogistic structures
- [ ] AI prompts do not instruct the model to help the user "make a strong argument" or "find supporting premises"
- [ ] AI outputs are reviewed for logical connectives before surfacing to users
- [ ] Scripture citation AI assistance asks for meaning and grounding only — never for logical derivations

## Christian Mode Contexts

- [ ] Scripture Evidence is framed as testimony not as a logical premise
- [ ] Proof-texting patterns (stringing verses together as premises) are actively discouraged in all copy within these contexts
- [ ] Church Discipline stage labels use "Reconciliation", "Witnessed Reconciliation", "Community Review" — never expose the Matthew 18 structure to users

## General

- [ ] This checklist was reviewed by a human before merge — not just auto-passed
- [ ] Any new UI string introduced in this PR has been read aloud and checked for argumentative framing
