# PT Odds API

This cloudflare worker should be deployed for one network individually. Multiple deployments are needed to handle multiple networks.

### Routes

- `/odds` - Get latest network user odds.
- `/odds/old` or `/odds?old=true` - Get last update's replaced network user odds (for comparisons).
- `/prizes` - Get latest network user prizes.
- `/prizes/old` or `/prizes?old=true` - Get last update's replaced network user prizes (for comparisons).
