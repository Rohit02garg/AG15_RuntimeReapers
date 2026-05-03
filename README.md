# 🛡️ SmartTrace — Pharmaceutical Supply Chain Anti-Counterfeit Platform

> **Cryptographically-backed product traceability** from manufacturing floor to consumer hands.

SmartTrace is a full-stack supply chain integrity platform that generates, tracks, and verifies pharmaceutical products using SHA-256 hashing, GS1-compliant serial numbers, and real-time anomaly detection.

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **Batch Generation** | Generate 500+ serialized items/second with SSCC-18 & custom serial formats |
| **3-Layer Verification** | Cryptographic hash + Luhn check digit + anomaly detection |
| **QR Code Scanning** | Consumer mobile verification via camera QR scan |
| **Hierarchical Tracking** | Pallet → Carton → Unit drill-down with full history aggregation |
| **Anomaly Detection** | Impossible travel, supply chain inversion, and post-sale re-entry alerts |
| **Recall Protocol** | Emergency batch decommissioning with cascade notifications |
| **Role-Based Access** | Manufacturer, Distributor, and Public access levels |

## 🏗️ Architecture

```
Next.js 16 (SSR + API Routes) → MongoDB Atlas → NextAuth.js (JWT)
```

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for the full architecture document.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# 3. Run development server
npm run dev

# 4. Seed admin user (first time only)
# Visit: http://localhost:3000/api/seed?key=YOUR_NEXTAUTH_SECRET

# 5. Login at http://localhost:3000/login
# Default credentials: admin / admin123
```

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `SECRET_SALT` | Server-side salt for SHA-256 hash generation |
| `NEXTAUTH_SECRET` | JWT signing secret |
| `NEXTAUTH_URL` | Application base URL |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASS` | SMTP config for password reset emails |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/               # REST API routes
│   │   ├── generate/      # Batch item generation
│   │   ├── scan/          # Supply chain checkpoint logging
│   │   ├── verify/        # Consumer product verification
│   │   └── manufacturer/  # Manufacturer-specific APIs
│   ├── manufacturer/      # Manufacturer dashboard pages
│   ├── distributor/       # Distributor dashboard pages
│   ├── verify/            # Public verification page
│   └── login/             # Authentication page
├── components/            # Reusable UI components
├── helpers/               # Crypto, Luhn, serial generation
├── lib/                   # DB connection, auth config, utilities
├── model/                 # Mongoose schemas (Pallet, Carton, Unit, User, ScanLog)
├── schemas/               # Zod validation schemas
└── types/                 # TypeScript type definitions
```

## 🧪 Tech Stack

- **Frontend**: Next.js 16 + React 19 + TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: NextAuth.js v4 (JWT)
- **Validation**: Zod v4
- **Crypto**: SHA-256 (Node.js `crypto`)
- **QR**: qrcode.react + react-qr-scanner

## 📄 License

MIT
