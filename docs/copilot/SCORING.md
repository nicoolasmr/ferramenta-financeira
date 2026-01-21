# Logic: Health Score Calculation

The **Health Score** (0-100) is a deterministic metric indicating the financial and operational health of a project.

## Formula

**Base Score**: 100

### Penalties
| Factor | Penalty Logic | Max Penalty |
| :--- | :--- | :--- |
| **Overdue Rate** | `Rate * 6` (e.g. 5% -> -30) | 60 |
| **Data Freshness** | -25 if `Stale` (>24h), -10 if `Degraded` | 25 |
| **Reconciliation** | `Gap Count * 2` | 25 |

### Bonuses
- **Perfect Record**: +5 if Overdue Rate is 0%.

### Levels
- **Healthy**: 80 - 100
- **Attention**: 50 - 79
- **Critical**: 0 - 49

## Code Reference
See `src/lib/copilot/scoring.ts`.
