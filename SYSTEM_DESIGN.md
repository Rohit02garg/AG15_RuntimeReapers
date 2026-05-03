# SmartTrace — System Design Document

> **Anti-Counterfeit Supply Chain Traceability Platform**
> Built with Next.js 16, MongoDB, and Cryptographic Verification

---

## 1. Problem Statement

Counterfeit pharmaceuticals cause **~1 million deaths annually** (WHO). Existing solutions like barcodes are trivially cloneable. SmartTrace provides a **multi-layered, cryptographically-backed** traceability system that enables:

- **Manufacturers** to generate tamper-evident QR codes for every product unit.
- **Distributors** to scan and verify shipments at each checkpoint.
- **Consumers** to instantly verify product authenticity via public QR scan.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    NEXT.JS APP (SSR + API)               │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Landing  │  │  Verify  │  │  Login   │  Public Pages  │
│  │  Page    │  │  (QR)    │  │  Page    │               │
│  └──────────┘  └──────────┘  └──────────┘               │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │            MIDDLEWARE (NextAuth + RBAC)            │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────┐  ┌─────────────────────────────┐   │
│  │   Manufacturer   │  │      Distributor            │   │
│  │   Dashboard      │  │      Dashboard              │   │
│  │   - Generate     │  │      - Scan & Receive       │   │
│  │   - Inventory    │  │      - Report               │   │
│  │   - Recall       │  │      - Anomaly View         │   │
│  │   - Anomalies    │  │                             │   │
│  └──────────────────┘  └─────────────────────────────┘   │
│                                                          │
│  ┌───────────────────────────────────────────────────┐   │
│  │              REST API LAYER (/api/*)               │   │
│  │  /generate  /scan  /verify  /hierarchy /recall     │   │
│  └───────────────────┬───────────────────────────────┘   │
│                      │                                    │
└──────────────────────┼────────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   MongoDB Atlas  │
              │   ┌───────────┐  │
              │   │  Pallets  │  │
              │   │  Cartons  │  │
              │   │  Units    │  │
              │   │  Users    │  │
              │   │  ScanLogs │  │
              │   │  Anomalies│  │
              │   └───────────┘  │
              └──────────────────┘
```

---

## 3. Data Model — Hierarchical Packaging

SmartTrace models the real pharmaceutical packaging hierarchy:

```
PALLET (Shipping Container)
  └── CARTON (Box)           ← parentId → Pallet._id
       └── UNIT (Individual)  ← parentId → Carton._id
```

**Design Decision**: Separate MongoDB collections per level (not a single polymorphic collection) for:
- **Indexing efficiency** — Each collection has optimized indexes for its access patterns.
- **Schema clarity** — Pallets have no `parentId`; Units don't need pallet-specific fields.
- **Bulk write performance** — `insertMany` operates on a single collection, avoiding locking contention.

---

## 4. Security Architecture — 3-Layer Verification

### Layer 1: Cryptographic Hash (Anti-Cloning)
```
Hash = SHA-256(Serial + Timestamp + ProductType + SECRET_SALT)
QR Code contains: { serial, shortHash: hash[0:8] }
```
- The `SECRET_SALT` is server-side only — a counterfeiter cannot regenerate valid hashes.
- Even if they copy the QR code, the hash mismatch is detected on verification.

### Layer 2: Luhn Check Digit (Anti-Tampering)
```
Serial = CompanyPrefix + Timestamp + Counter + LuhnCheckDigit
```
- Invalid serial numbers are rejected before hitting the database.
- Follows **GS1 SSCC-18** standard for pallets.

### Layer 3: Anomaly Detection (Anti-Diversion)
| Check | Trigger | Status |
|-------|---------|--------|
| **Impossible Travel** | Same serial scanned at 2 locations < 10 min apart | `SUSPECT` |
| **Supply Chain Inversion** | Item moves backward (e.g., RETAILER → MANUFACTURER) | `SUSPECT` |
| **Post-Sale Re-entry** | Sold item re-enters the chain | `SUSPECT` |
| **Hash Mismatch** | QR code hash doesn't match database | `INVALID` |

---

## 5. Authentication & Authorization

| Component | Technology |
|-----------|------------|
| Auth Provider | NextAuth.js v4 (Credentials) |
| Password Storage | bcrypt (cost factor 10) |
| Session Strategy | JWT (stateless, no DB session table) |
| RBAC Enforcement | Next.js Middleware (`withAuth`) |

**Role Hierarchy:**
- `MANUFACTURER` — Full access (generate, recall, manage distributors)
- `DISTRIBUTOR` — Scan, report, view assigned inventory
- `PUBLIC` — Verify products only (no auth required)

**API Security:** All mutation endpoints (`/api/generate`, `/api/scan`) require valid session with appropriate role.

---

## 6. Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js API Routes** (no separate backend) | Unified deployment, shared types, simpler DevOps |
| **MongoDB** (not SQL) | Flexible schema for item hierarchies, excellent bulk write performance |
| **Server-side hash verification** | Salt never leaves the server; client only sees shortened hash |
| **QR codes embed URLs** | `smarttrace.com/verify?s=SERIAL&c=HASH` — works on any QR scanner app |
| **Materialized path for hierarchy** | O(1) ancestor queries vs recursive `$graphLookup` |
| **Zod validation** | Runtime type safety on API boundaries, shared between client/server |

---

## 7. API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/generate` | MANUFACTURER | Batch-generate serialized items |
| `POST` | `/api/scan` | MANUFACTURER/DISTRIBUTOR | Log supply-chain checkpoint |
| `POST` | `/api/verify` | PUBLIC | Consumer product verification |
| `GET` | `/api/hierarchy/[serial]` | ANY | Fetch item tree visualization |
| `GET` | `/api/validate/[serial]` | PUBLIC | Luhn + DB existence check |
| `GET` | `/api/public/verify/[serial]` | PUBLIC | Full product trace with history |
| `POST` | `/api/verify-hierarchy` | ANY | Verify parent-child relationship |
| `POST` | `/api/manufacturer/recall` | MANUFACTURER | Emergency batch decommissioning |
| `GET` | `/api/manufacturer/items` | MANUFACTURER | Inventory listing with pagination |

---

## 8. Performance Characteristics

- **Batch Generation**: ~500 items/second using `insertMany` with unordered writes.
- **Verification Latency**: < 200ms (single indexed lookup + hash comparison).
- **Hierarchy Queries**: 3 queries max (Unit → Carton → Pallet) using `parentId` references.

---

## 9. Future Enhancements

- [ ] **Blockchain anchoring** — Periodic Merkle root commits to Ethereum/Polygon for immutable audit trail.
- [ ] **Geofencing** — Alert when items are scanned outside expected delivery radius.
- [ ] **ML Anomaly scoring** — Gradient from VALID → SUSPECT based on multi-factor risk assessment.
- [ ] **Batch recall cascade** — Recall a Pallet and automatically flag all child Cartons/Units.

---

## 10. Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TailwindCSS 4 |
| Backend | Next.js API Routes (Edge-compatible) |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | NextAuth.js v4 (JWT strategy) |
| Validation | Zod v4 |
| Crypto | Node.js `crypto` (SHA-256) |
| QR Codes | `qrcode.react` (generation), `@yudiel/react-qr-scanner` (scanning) |
| Email | Nodemailer (SMTP) |
| UI Components | Radix UI primitives + custom glassmorphism design system |
