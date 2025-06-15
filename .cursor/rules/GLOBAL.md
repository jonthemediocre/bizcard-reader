# 🔥 OREO ULTRA MODE: GODMODE GLOBAL.md — v2.3
version: 2.3
status: ACTIVE
enforcement_mode: STRICT
sovereign_authority: GLOBAL.md
---

### I. GLOBAL DIRECTIVE: THE UNCHANGING LAW
This document is the supreme governing authority. It is a live contract enforced through automated guardrails. **No visual asset -> No code. No plan -> No action.**

### II. FRAMEWORK PRINCIPLES
- **VALUE IS LAW**: All execution must trace to a task in `THEPLAN.md`.
- **VISUAL FIRST**: All logic must be linked to an approved visual asset in `visual_trace_index.yaml`.
- **AGENTIC ONLY**: All work must be scoped to and executed by agents declared in `/governance/agents.yaml`.

### III. CORE ARCHITECTURE & INTEGRITY
> **Architect's Note (v2.3)**: Added file integrity checks. A CI hook must verify these hashes before any execution phase.

#### **Required Files**
- `THEPLAN.md`
- `PROJECT_TYPE.md`
- `ONBOARDING.md`
- `visual_trace_index.yaml`
- `.cursor/`, `brand/`, `vanta/` directories

#### **Core Governance Files**
- `/governance/mcp_config.yaml` (Master Control Program)
- `/governance/dependency_whitelist.yaml`
- `/governance/agents.yaml`

#### **File Integrity Verification**
The following files are critical infrastructure. Their SHA256 hashes must be stored in `.cursor/reference/integrity.lock` and validated by CI/CD on every run.
- `GLOBAL.md` (this file)
- `THEPLAN.md`
- `visual_trace_index.yaml`

### IV. EXECUTION LIFECYCLE
- **Phase 0: VALIDATE `[STATUS:  LOCKED 🔒]`**: Verify file existence and hash integrity.
- **Phase 1: DEFINE `[STATUS: PLANNING 📝]`**: Populate `THEPLAN.md`.
- **Phase 2: BLUEPRINT `[STATUS: VISUALS PENDING 🎨]`**: Create and link visual assets. Await `[VISUALS: CoE Approved ✅]`.
- **Phase 3: FORM COALITION `[STATUS: AGENTS ASSIGNED 🤖]`**: Assign agent roles.
- **Phase 4: EXECUTE & LEARN `[STATUS: ACTIVE ⚡]`**: Agents generate logic, guided by RL.
- **Phase 5: AUDIT & REFINE `[STATUS: AUDITING 🔍]`**: Run automated scans for compliance.
- **Phase 6: ARCHIVE & PROPAGATE `[STATUS: COMPLETE 🧿]`**: Persist trace to KEB.

### V. SYMBOLIC ENFORCEMENT POLICIES
#### **Symbolic & Irreversible Actions**
These actions require a formal CoE vote logged to the KEB before execution.
- **Definition**: An action that is computationally expensive or reputationally difficult to reverse.
- **Examples**: `deploy to production`, `lock brand color palette`, `rename core project`, `release public API version`.

#### **Mutation Policy**
Changes to `GLOBAL.md` must be logged in `/logs/delta_traces/GLOBAL_CHANGELOG.yaml` and approved by a CoE.

#### **Visual Trace Policy**
`No visual -> No code.` The `validate-visual-trace.sh` script will fail any commit that introduces code components not linked to an approved visual in the index.

### VI. AUTOMATION & SCHEMAS
#### **Rule Engine (`rulΣ`)**
The summation (Σ) of all governance layers. Its primary hook, `.cursor/rules/global_guard.rulΣ.yaml`, orchestrates the validation scripts.

#### **KEB (Kernel Event Bus) Event Schema**
All events must conform to the standard schema (eventId, timestamp, source, eventType, payload).
- `eventType` includes: `RULE_VIOLATION`, `COE_VOTE_CAST`, `SYMBOLIC_ACTION_APPROVED`, `HASH_MISMATCH`.

### VII. EXCEPTION & INTERVENTION PROTOCOLS
#### **Error Handling**
- **L1 (Warning)**: Logged to KEB.
- **L2 (Failure)**: Halts process, reverts action.
- **L3 (System Halt)**: `HASH_MISMATCH` on core file. Pauses all agent activity.

#### **Human-in-the-Loop (HITL) Override**
A `guardian` can issue a signed override token for an L2 failure. This is a symbolic action and must be logged.

### VIII. FINAL DECLARATION
This protocol is the immutable top-layer law. Logic created outside this framework is invalid and subject to automated rejection. `[STATUS: ENFORCED 🛡️]` 