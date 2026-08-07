# CONTRIBUTING.md

This repository is maintained by the HELIOS team. All team members are collaborators and should follow the workflow below to keep development organized and minimize merge conflicts.

---

# Git Workflow

All development follows this flow:

```text
develop
    ↓
feature/<feature-name>
    ↓
Commit & Push
    ↓
Pull Request
    ↓
Team Review
    ↓
Merge into develop
    ↓
Testing
    ↓
Merge develop → main
```

**Important Rules**

- Never commit directly to `main`.
- Never work directly on `develop`.
- Every task should have its own feature branch.
- Keep Pull Requests small and focused.
- Pull the latest changes from `develop` before starting new work.

---

# Branch Naming

Use the following naming convention.

### Features

```text
feature/<feature-name>
```

Examples

```text
feature/dashboard-ui
feature/auth-system
feature/network-simulator
feature/ai_engine
```

### Bug Fixes

```text
fix/<issue-name>
```

Examples

```text
fix/login-error
fix/api-timeout
```

### Documentation

```text
docs/<topic>
```

Examples

```text
docs/readme
docs/setup-guide
```

### Refactoring

```text
refactor/<module>
```

Examples

```text
refactor/backend
refactor/frontend
```

---

# Commit Convention

Use meaningful commit messages.

Format

```text
<type>: <description>
```

Types

```text
feat
fix
docs
refactor
test
chore
```

Examples

```text
feat: add topology visualization

fix: resolve websocket reconnect issue

docs: update project setup guide

refactor: simplify API routing

test: add backend unit tests

chore: update dependencies
```

Avoid commits like

```text
update

changes

fixed

work

misc
```

---

# Pull Request Checklist

Before creating a Pull Request, make sure:

- [ ] Latest changes from `develop` have been merged into your branch.
- [ ] Project builds successfully.
- [ ] Only relevant files are included.
- [ ] No merge conflicts remain.
- [ ] Commit messages are clear.
- [ ] Documentation has been updated if necessary.
- [ ] Your feature has been tested locally.

---

# Review Checklist

Before approving a Pull Request, verify:

- [ ] Code works as intended.
- [ ] No unnecessary files or code were added.
- [ ] Naming and structure follow the project conventions.
- [ ] No secrets or credentials are committed.
- [ ] The project still builds successfully.
- [ ] The feature does not break existing functionality.

---

# Issue Linking

If you're using GitHub Issues, reference the issue in your Pull Request.

Examples

```text
Closes #12

Fixes #18

Related to #25
```

---

# Merge Strategy

All merges should follow this process:

```text
feature branch
        ↓
Pull Request
        ↓
Review
        ↓
Merge into develop
        ↓
Testing
        ↓
Merge develop → main
```

Use **Squash and Merge** for feature branches to keep the commit history clean.

Only merge `develop` into `main` when the application is stable and ready for demo or release.

---

# Conflict Resolution

Before pushing your branch, always sync with `develop`.

```bash
git checkout develop
git pull origin develop

git checkout feature/<your-branch>
git merge develop
```

If conflicts occur:

1. Resolve the conflicts locally.
2. Test the project.
3. Commit the resolved changes.
4. Push the updated branch.
5. Continue with the Pull Request.

If you're unsure how to resolve a conflict, ask the teammate who last modified the affected files before merging.

---

# Team Guidelines

- Work only on your assigned feature branch.
- Pull from `develop` before starting work each day.
- Commit frequently with meaningful messages.
- Push your work regularly.
- Communicate before modifying shared configuration files such as:
  - `docker-compose.yml`
  - `.env.example`
  - `package.json`
  - `requirements.txt`
  - `README.md`
- Delete feature branches after they have been merged.
- Keep `main` production/demo ready at all times.