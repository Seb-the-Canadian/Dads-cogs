<project_context>
    <philosophy>
        This is a "Local-First" project. We prioritize digital sovereignty and clean architecture.
        Primary Language: Python 3.14.0 (High performance, typed).
        Environment: Virtual Environment at `.venv/`.
        Hardware Context: MacBook Pro M5 (High local compute available).
    </philosophy>
    <architecture>
        <!-- Finance Workspace Context -->
        Structure: Modular Monolith with SOT (Source of Truth) CSVs.
        Data: Local Flat Files (CSV/JSON). No cloud DB dependencies.
        Core Libraries: pathlib (Strict Requirement).
    </architecture>
</project_context>

<coding_standards>
    <critical_rules>
        1. MODERN TYPING: Use `from __future__ import annotations` and union types (e.g., `Path | None`).
        2. PATHS: ALWAYS use `pathlib.Path`. NEVER use string concatenation for paths.
        3. SHEBANGS: All executable scripts must start with `#!/usr/bin/env python3`.
        4. DOCSTRINGS: Mandatory module-level triple-quoted docstrings.
        5. MANUAL FORMATTING: No auto-formatters are active. Mimic existing whitespace/style precisely.
    </critical_rules>
    <testing>
        Run `pytest` after significant changes.
        Validate logic manually as no linters are currently enforcing style.
    </testing>
</coding_standards>

<workflow_protocols>
    <git_behavior>
        1. Smart Commit is enabled (git.enableSmartCommit: true).
        2. Auto Fetch is enabled.
        3. Commit messages must follow Conventional Commits (feat:, fix:, chore:).
    </git_behavior>
    <interaction_style>
        - Action over Advice: If I ask for code, output code. Do not lecture.
        - "Don't be sycophantic": Be direct, neutral, and precise.
        - Plan First: For any task involving >2 files, propose a plan first.
    </interaction_style>
</workflow_protocols>
