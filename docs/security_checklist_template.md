# Security Checklist Template (P0.3)

Date: `YYYY-MM-DD`  
Owner: `name`  
Target Release: `version/commit`

## Environment Status

### Dev
- [ ] Env vars validated (`npm run security:env`)
- [ ] URL policy validated (`npm run security:urls`)
- [ ] Secret scan clean (`npm run security:secrets`)
- [ ] Dependency gate passes (`npm run security:deps`)

### Staging
- [ ] Matrix values replaced with real staging URLs
- [ ] URL policy strict validation passes (`npm run security:urls:strict`)
- [ ] Secret scan clean (`npm run security:secrets`)
- [ ] Dependency gate passes (`npm run security:deps`)

### Prod
- [ ] Matrix values replaced with real production URLs
- [ ] URL policy strict validation passes (`npm run security:urls:strict`)
- [ ] Secret scan clean (`npm run security:secrets`)
- [ ] Dependency gate passes (`npm run security:deps`)

## Checklist Outcome
- Final Result: `PASS | FAIL`
- Blocking Items:
  - `item 1`
  - `item 2`

## Command Output Summary
- `npm run security:env`:
- `npm run security:urls`:
- `npm run security:urls:strict`:
- `npm run security:secrets`:
- `npm run security:deps`:
