# Security Policy

## Supported Versions

This project is an MVP. Security fixes target the latest `main` branch.

## Reporting a Vulnerability

Please report vulnerabilities privately through GitHub Security Advisories for this repository when available. If advisories are unavailable, contact the repository owner through GitHub.

Include:

- Affected version or commit
- Reproduction steps
- Potential impact
- Suggested mitigation, if known

## Security Notes

- The default runtime does not require paid external APIs.
- Do not commit API keys, access tokens, source data credentials, or private datasets.
- SQLite files are ignored by default and should not be committed.
- Real notifier implementations should load secrets from environment variables or a secret manager.
