# ⚙️ Project Setup & Architecture

Welcome to the technical documentation for the Shopix eCommerce Platform. This guide provides a complete overview of the technology stack, project structure, environment configuration, database seeding, Docker integration, and contribution guidelines.

## 💻 Tech Stack & Packages

### Frontend
- **Framework:** Next.js 16.2.3 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS V4, Custom UI Components (Masonry / Bento Grid Layouts)
- **Icons & Visuals:** `lucide-react`, `react-icons`
- **Forms & Validation:** `react-hook-form`
- **Notifications:** `react-hot-toast`
- **Charts:** `recharts`

### Backend & Infrastructure
- **API Architecture:** Next.js Serverless API Routes
- **Database:** MongoDB via `mongoose` (v9.1.6)
- **Authentication:** Next-Auth (v4), `jsonwebtoken`, `bcryptjs`
- **Real-time Chat & WebSockets:** Pusher (`pusher`, `pusher-js`)
- **API Documentation:** Swagger UI (`swagger-jsdoc`, `swagger-ui-react`)
- **Storage & Cloud:** Cloudinary
- **Rate Limiting:** Upstash Redis (`@upstash/ratelimit`, `@upstash/redis`)
- **Mail Services:** `nodemailer` with custom styled HTML templates via Google SMTP
- **Payment Processing:** Stripe (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Testing & Monitoring:** Jest, Playwright, Sentry (`@sentry/nextjs`)
- **Code Quality:** ESLint, Prettier, Husky, `lint-staged`

---

## 📂 Project Structure

```text
/c/Users/Programmer/Desktop/E-commerce/
├── package.json               # Project dependencies and operational scripts
├── .env                       # Environment configuration values
├── README.md                  # Landing repository information
├── tailwind.config.ts         # Tailwind ecosystem & theme definitions
├── Dockerfile                 # Next.js Container build steps
├── docker-compose.yml         # Multi-container local orchestration
├── scripts/
│   └── seed.ts                # Deep faker database seeder
└── src/
    ├── app/                   # Next.js App Router Directory
    │   ├── admin/             # Administrator specific routes & views
    │   ├── api/               # Backend API Serverless Functions
    │   ├── auth/              # Signup, Login, Password Reset Pages
    │   ├── cart/              # User checkout UI
    │   ├── docs/              # Swagger API Specifications
    │   ├── products/          # Marketplace views & individual product pages
    │   ├── store/             # Seller dashboard & inventory management
    │   ├── layout.tsx         # Root Layout
    │   ├── not-found.js       # Custom 404 Interceptor
    │   ├── error.tsx          # Global Sentry-integrated Error Boundary
    │   └── globals.css        # Core global CSS variables
    ├── components/            # Reusable UI React Components
    ├── models/                # Complete Entity Models (Order, Wishlist, Message, etc.)
    ├── services/              # Backend Utilities
    └── utils/                 # Shared logic utilities
        └── __tests__/         # Unit tests (Jest)
├── tests/
│   └── e2e/                   # End-to-End tests (Playwright)
├── jest.config.ts             # Jest configuration
├── playwright.config.ts       # Playwright configuration
├── sentry.*.config.ts         # Sentry monitoring configurations
└── eslint.config.mjs          # Linting rules
```

---

## 🛠️ Setup Instructions

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v20.x or higher)
- NPM or Yarn
- Docker & Docker Compose (Optional, for containerized deployments)
- MongoDB (Local instance or MongoDB Atlas Cloud)
- Stripe Developer Account
- Cloudinary Account
- Pusher Account (for Real-time WebSockets)
- Upstash Account (for Redis API Rate Limiting)
- Gmail Account with App Passwords enabled for NodeMailer

### 2. Installation
Clone the repository and install dependency packages:
```bash
git clone https://github.com/Khwajazeeshan/Shopix
cd Shopix
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure the following required variables:

```env
# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopix

# Authentication Secrets
NEXTAUTH_SECRET=your_super_secret_jwt_key
NEXTAUTH_URL=http://localhost:3000

# Mailing Services (Nodemailer via Gmail)
GMAIL=your_app_email@gmail.com
PASSWORD=your_gmail_app_password

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Real-time Chat (Pusher)
PUSHER_APP_ID=
NEXT_PUBLIC_PUSHER_KEY=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_CLUSTER=

# Redis Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Remote Image Storage (Cloudinary)
CLOUDINARY_URL=

# Sentry Monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

### 4. Database Seeding (Crucial Step)
To quickly populate your local environment with sellers, catalogs, random customers, simulated conversational messages, and orders, run the built-in database seeder script:
```bash
npm run seed
```
This comprehensively formats and links data using `@faker-js/faker`, maintaining absolute data integrity to let you test frontend features rapidly.

### 5. Running the Development Server
Initiate the dev server to begin working:
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`. You can also explore backend REST capabilities via the Swagger docs exposed at \`/docs\`.

### 6. Production Build & Docker Deployment
To manually compile the optimized production build locally:
```bash
npm run build
npm run start
```
**Alternatively, deploy using Docker:**
```bash
docker-compose up --build
```
This initiates a dedicated Next.js container applying caching bindings and injecting relevant `.env` args for an immediately deployable production image.

### 7. Testing & Code Quality
Maintain platform reliability using the following commands:
- **Unit Tests (Jest):** `npm run test:unit`
- **E2E Tests (Playwright):** `npm run test:e2e`
- **Linting:** `npm run lint`
- **Auto-formatting:** `npm run format`

---

## 🤝 Contribution Guidelines

We welcome contributions to strengthen the Shopix marketplace! Please enforce the conventions below:

1. **Branch Management:** 
   - Never commit or push directly to the `main` branch. 
   - Branch off into `feature/<feature-name>` or `bugfix/<issue-name>`.
2. **UI Constraints:**
   - Enforce the global platform aesthetic: stick to standard Tailwind CSS utilities, avoid adding random arbitrary values, and leverage established shadow geometries and our unified Masonry product layouts.
3. **Commit Formatting:**
   - Use declarative phrasing (e.g., "Add Admin dashboard graph" instead of "added graph").
4. **Pull Requests:** 
   - When filing a PR, ensure that all tests pass (`npm run test:unit`) and there are no linting errors.
   - Describe precisely what issue is handled. Mark standard code reviews before executing the merge.
5. **Code Quality Hooks:**
   - Pre-commit hooks via **Husky** will automatically run `lint-staged` to format and validate your changes. Do not bypass these hooks unless strictly necessary.

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by [Khawaja Zeeshan]
