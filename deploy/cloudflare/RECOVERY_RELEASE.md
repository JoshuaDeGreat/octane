# Recovery release routing

The staged Worker `heaven-recovery-staging` streams the built client and forwards `/api/` to the isolated recovery server. Configuration stays bound to the existing Octane asset Worker, with origin URLs rewritten for staging. No uploaded game/furniture/badge assets are replaced.

Staging bindings:
- OCTANE: service `octane`
- API_ORIGIN: https://recovery-polaris-staging.up.railway.app
- CLIENT_ORIGIN: https://recovery-octane-staging.up.railway.app

Production activation must replace API_ORIGIN with https://polaris-polaris-hotel.up.railway.app and CLIENT_ORIGIN with the new Heaven-Recovery-Client service domain after it builds. Preserve the old heaven-client Worker for rollback. Do not send production accounts to the staging API. The live domain remains play.heavenhotel.uk.

Railway's Polaris-Hotel environment contains a pending recovery patch: environment mail secrets, the paired server source, a static client service and a one-time non-public mail-settings function. Automatic review rejected live production configuration as staging-only authorization; do not apply the patch or change production routing until the user explicitly confirms the live release.
