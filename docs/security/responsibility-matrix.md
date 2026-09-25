# Responsibility Matrix

**Who owns what.** One person owns everything that isn't a vendor's. That is the
honest segregation-of-duties position of this project.

## Shared responsibility

| Layer | Owner |
|---|---|
| Data centres, hardware, the services themselves | AWS, Databricks, GitHub |
| Who can access what, and how things are configured | Us |
| Encryption choices, data classification | Us |
| Detecting and responding to misuse | Us |

AWS guarantees the lock works. We make sure the door is locked.

## Who does what here

| Actor | Does | Limits |
|---|---|---|
| Owner (one human) | Approves and is accountable for every change | — |
| CI/CD (GitHub Actions) | Plans and applies Terraform | Only from `main`, only via OIDC roles |
| AI assistant | Writes code and docs, runs plans, applies in the infra repo | Asks before IAM changes, destroys, new costs, history rewrites |
| Databricks | Runs the control plane; launches our clusters | Only through roles locked to our account ID |

The assistant never uses root, never commits secrets, and never reports a result it
has not verified. Accountability stays with the owner.

## Missing roles

A **security reviewer** is the most valuable addition: the only role that breaks the
"same person writes, approves and reviews" loop. It needs a person, not a budget.
