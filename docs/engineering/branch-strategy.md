# Branch strategy

---

## Default branches (recommended)

| Branch                   | Purpose |
|--------------------------| ------- |
| `main`                   | Production-aligned, protected, requires PR + CI green. |
| `development`            | Integration branch for completed features before release train. |
| `feature/*` / `<name>/*` | Short-lived work branches; delete after merge. |

Exact names may match GitHub repo defaults; align `main` vs `master` with remote.

---

## Rules

- **No direct pushes** to `main` (when branch protection enabled).  
- **Squash or merge** per team preference; keep commit messages meaningful.  
- **Docs-only PRs** welcome — fast review.  

---

## Releases

Tag releases `vX.Y.Z` after `main` reflects a deployable snapshot; changelog optional but encouraged once shipping.

---

## Related

`docs/engineering/setup-guide.md`, `docs/engineering/coding-standards.md`
