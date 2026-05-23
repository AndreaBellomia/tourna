# Tourna Codex Context

This folder contains the local instruction system for working on Tourna with Codex or similar coding agents.

## Structure

- `AGENTS.md`: repo-wide default rules
- `skills/tourna-engineering/SKILL.md`: reusable project skill
- `skills/tourna-engineering/agents/openai.yaml`: skill UI metadata
- `skills/tourna-engineering/references/*.md`: deeper context loaded only when needed

## What Instruction Files Should Contain

### `AGENTS.md`

Use for stable, repo-wide guidance:

- project mission
- engineering quality bar
- architecture defaults
- collaboration rules
- validation expectations
- when the agent must ask questions instead of guessing

Keep it short. It should be the default contract, not a full handbook.

### `SKILL.md`

Use for recurring project workflows:

- what the skill is for
- when to use it
- what reference files to read
- how to operate inside the project

Keep it procedural. Do not turn it into a generic framework tutorial.

### `agents/openai.yaml`

Use only for lightweight metadata:

- display name
- short description
- optional default prompt

This file is metadata, not architecture guidance.

### `references/*.md`

Use references for detail that is too heavy for the default prompt:

- product context
- architecture boundaries
- workflow rules
- package responsibilities
- decision heuristics

Split by topic so the agent can read only what matters.

## Authoring Rules

- Prefer stable guidance over temporary implementation details.
- Record decision rules, not verbose prose.
- State where code belongs, how to validate it, and when to stop and ask.
- Update these files when the architecture, standards, or common mistakes change.
