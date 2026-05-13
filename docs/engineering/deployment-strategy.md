# Deployment strategy

**Principle:** environments are **replaceable**; the **monorepo contracts** stay stable. See also `docs/architecture/monorepo-architecture.md` and `docs/product/recommended-tech-stack.md`.

---

## MVP (velocity)

| Surface | Typical target |
| ------- | -------------- |
| **Web** | Vercel (Next.js) |
| **API** | Railway, Render, or Fly.io |
| **Database** | Supabase PostgreSQL or managed Postgres |
| **Auth / storage (optional)** | Supabase |

Confirm **BAA / HIPAA** posture **before** any PHI. MVP without PHI still benefits from encryption, RBAC, and audit logs.

---

## Production / healthcare posture

- **AWS** (ECS/Fargate or EKS, RDS Postgres, S3, CloudFront, Secrets Manager, Cognito, WAF, CloudWatch) as long-term default **when** PHI and enterprise requirements apply.  
- **Network segmentation**, least-privilege IAM, encrypted volumes, backup/restore drills.  

---

## AI services

- OpenAI (or successor) keys **only** in API environment — never in edge bundles or mobile apps.  
- Log **redacted** prompts/responses per policy; full content only where legally/operationally approved.  

---

## Migrations

- **Database:** Prisma migrations in CI with gated apply to production.  
- **Instruction versions:** admin publishing pipeline — config changes should not require app redeploy for content (see Step 1 product doc).  

---

## Related

`docs/product/recommended-tech-stack.md`, `docs/engineering/setup-guide.md`
