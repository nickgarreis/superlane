# Incident Response Runbook

## Scope

Operational incident handling using current minimal stack:
- Convex dashboard/logs
- Browser console/network traces
- GitHub Actions artifacts and logs

## Severity Levels

- Sev1: login failure, data corruption risk, full app outage
- Sev2: major feature degraded (file upload, project mutation, settings changes)
- Sev3: minor UX degradation, non-critical background failures

## Detection Sources

1. User report or internal QA report
2. Failed GitHub Actions checks (`ci-required`, `performance`, `security`)
3. Convex function error spikes in dashboard

## Immediate Triage Steps

1. Capture incident context:
   - time window
   - affected workspace/user
   - failing route/action
2. Check latest deploy SHA and workflow results.
3. Inspect Convex logs for matching errors.
4. Reproduce in staging/local if possible.

## Command Checklist

- `git log --oneline -n 20`
- `npm run build`
- `npm run perf:check`
- `npm run security:check`

Expected results:
- Commands should pass for healthy baseline.

If commands fail:
- Link failure to incident symptom.
- Escalate severity if user-impacting path is blocked.

## Containment Actions

- Disable risky flows via rollback (see `docs/operations/rollback.md`).
- Revert problematic frontend release if issue is client-side.
- Revert problematic backend deploy if issue is server-side mutation/query behavior.

## Resolution Verification

1. Confirm user path succeeds end-to-end.
2. Confirm CI gates pass on fix branch.
3. Confirm no new Convex errors for 30 minutes after release.

## Postmortem Template

- Summary
- Impact window
- Root cause
- Corrective action
- Preventive action
- Owners and due dates
