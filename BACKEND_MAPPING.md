# Backend Mapping

The existing UI uses `src/lib/api.js` as its single mock boundary. The migration keeps that boundary as the frontend adapter and replaces its local-storage implementation with REST calls in a follow-up integration pass.

| Existing frontend data | MongoDB model | API | Current consumer | Scope |
| --- | --- | --- | --- | --- |
| `src/data/users.js` profile/account fixtures | `User`, `Account` | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/app-data`, `GET /api/accounts` | `AuthContext`, `AppDataContext`, dashboard/profile | User-owned |
| Generated `src/data/transactions.js` history | `Transaction` | `GET /api/transactions` | transactions, dashboard, statements | Shared seed history |
| Transfer/bill/deposit/withdrawal mutations | `Transaction`, `Account`, `BillPayment` | `POST /api/transfers`, `/api/bill-payments`, `/api/add-funds`, `/api/withdrawals` | `AppDataContext`, transfer and payment dialogs | User-owned; device validated |
| `src/data/beneficiaries.js` | `Beneficiary` | `GET/POST/DELETE /api/beneficiaries` | beneficiaries and transfer flow | User-owned |
| `src/data/bills.js` provider catalog | `Biller` | Seeded shared billers; payment endpoint | bill payments | Shared, read-only |
| `src/data/cards.js` | `Card` | `GET /api/cards`, `POST /api/cards/reveal` | cards and `CardVisual` | User-owned; reveal device validated |
| `src/data/notifications.js` | `Notification` | `GET /api/notifications` | notification center/header | User-owned |
| `src/data/security.js` sessions | `Device` | `GET /api/devices`, validation endpoint | security page | User-owned security data |
| Verification status on `USER` | `User.verificationStatus` | `GET /api/auth/me` | verification/profile cards | User-owned |
| Banks, card types, plan labels, icons, navigation | No model | Frontend constants | form and presentation components | Static UI/reference |

## Ownership rules

- Private queries always use `req.user._id`; request-body `userId` values are ignored.
- Transaction reads use `visibility: shared` or the authenticated owner only.
- Shared billers and transactions are seeded once with upserts and have no owner.
- Account balances are authoritative fields on `Account`; shared history never changes them.
- User-created movements update only the authenticated user's account and create a private transaction.

## Security rules

- Passwords and transaction PINs are bcrypt hashes and are excluded from normal queries.
- Card PAN is encrypted at rest and omitted from list/app-data responses; card lists expose only the last four digits.
- `requireValidatedDevice` protects transfer, bill payment, add funds, withdrawal, and card reveal routes.
- New devices default to `trusted: false`, so the API returns `403` with `code: device_not_validated` before any authorization/PIN step.
- `BANK_MANAGER_CODE`, `JWT_SECRET`, `MONGODB_URI`, and `WHATSAPP_SUPPORT_NUMBER` are environment configuration, never React secrets.