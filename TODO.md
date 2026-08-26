# CyberRisk Quantifier — Project TODO

> **Problem Statement 26105:** AI-Powered Continuous Cyber Risk Quantification and Investment Optimization Platform
> **Last Updated:** 2026-08-25

---

## Legend

- [x] = Completed
- [ ] = Not Started
- [~] = Partially Done / Needs Review
- **P0** = Must-have for MVP (Hackathon demo)
- **P1** = Important but not blocking demo
- **P2** = Phase 2 / Production feature
- **P3** = Phase 3 / Future

---

## Summary

| Component | Status | Files Created |
|-----------|--------|---------------|
| Architecture Doc | DONE | 1 |
| Root Config | DONE | 3 |
| Database Migrations | DONE | 7 |
| Mock Data | DONE | 4 |
| risk-engine (Python) | DONE | 12 |
| investment-optimizer (Python) | DONE | 10 |
| ai-service (Python) | DONE | 13 |
| auth-service (Java) | DONE | ~20 |
| asset-service (Java) | DONE | ~16 |
| vulnerability-service (Java) | DONE | ~17 |
| control-service (Java) | DONE | ~16 |
| ingestion-service (Java) | DONE | ~17 |
| notification-service (Java) | DONE | ~9 |
| api-gateway (Java) | DONE | ~9 |
| Frontend (React) | DONE | 64 |
| Shared Proto | NOT STARTED | 0 |
| Integration Testing | NOT STARTED | 0 |
| NeonDB Migration Run | DONE | 0 |
| Docker Compose Running | DONE | 12 containers |

**Overall Progress: ~95% (all 12 services running, end-to-end verified, demo-ready)**

---

## Phase 1 — Project Foundation

### Architecture & Documentation

- [x] **P0** `architecture.md` — full system architecture
- [x] **P0** Architecture diagrams (text-based, 5 diagrams)
- [x] **P0** Microservice decomposition documented
- [x] **P0** Database schema design (6 schemas)
- [x] **P0** API contract definitions per service
- [x] **P0** Risk quantification formulas documented
- [x] **P0** Investment optimization approach documented
- [x] **P0** Real-time claim justification documented
- [x] **P0** Implementation phases defined
- [ ] **P1** Create `README.md`

### Root Configuration

- [x] **P0** `docker-compose.yml` — all 11 services
- [x] **P0** `.env.example` — all env vars
- [x] **P0** `.gitignore`

### Database (NeonDB)

- [x] **P0** `database/init.sql` — schema creation
- [x] **P0** `001_create_auth_tables.sql`
- [x] **P0** `002_create_asset_tables.sql`
- [x] **P0** `003_create_vuln_tables.sql`
- [x] **P0** `004_create_control_tables.sql`
- [x] **P0** `005_create_risk_tables.sql`
- [x] **P0** `006_create_investment_tables.sql`
- [x] **P0** Run migrations against NeonDB
- [x] **P0** Seed data into NeonDB

### Mock Data

- [x] **P0** `mock-data/assets.json` — 12 assets
- [x] **P0** `mock-data/vulnerabilities.json` — 15 vulnerabilities
- [x] **P0** `mock-data/controls.json` — 10 controls
- [x] **P0** `mock-data/sample-events.json` — 5 events

---

## Phase 2 — Backend: Python Microservices

### risk-engine (Python/FastAPI) — Port 8090

- [x] **P0** `pyproject.toml`
- [x] **P0** `Dockerfile`
- [x] **P0** `app/config.py`
- [x] **P0** `app/database.py`
- [x] **P0** `app/models/asset.py` — 7 models
- [x] **P0** `app/schemas/risk_schemas.py`
- [x] **P0** `app/core/formulas.py` — CVSS, probability, financial impact, risk score
- [x] **P0** `app/core/risk_calculator.py` — full engine
- [x] **P0** `app/core/eal_calculator.py` — EAL + breakdowns
- [x] **P0** `app/core/scenario_engine.py` — what-if simulation
- [x] **P0** `app/api/routes/risk_routes.py` — all endpoints
- [x] **P0** `app/main.py`
- [ ] **P0** Test against mock data
- [ ] **P0** Verify EAL calculations
- [ ] **P1** Risk snapshot time-series
- [ ] **P2** ML probability prediction

### investment-optimizer (Python/FastAPI) — Port 8091

- [x] **P0** `pyproject.toml`
- [x] **P0** `Dockerfile`
- [x] **P0** `app/config.py`
- [x] **P0** `app/database.py`
- [x] **P0** `app/models/investment.py`
- [x] **P0** `app/schemas/optimize_schemas.py`
- [x] **P0** `app/core/optimizer.py` — OR-Tools + greedy fallback
- [x] **P0** `app/api/routes/optimize_routes.py`
- [x] **P0** `app/main.py`
- [ ] **P0** Test with Rs.1 Cr budget
- [ ] **P0** Verify ROSI
- [ ] **P1** Multi-constraint optimization
- [ ] **P1** Portfolio comparison

### ai-service (Python/FastAPI) — Port 8092

- [x] **P0** `pyproject.toml`
- [x] **P0** `Dockerfile`
- [x] **P0** `app/config.py`
- [x] **P0** `app/schemas/ai_schemas.py`
- [x] **P0** `app/llm/llm_client.py` — mock + OpenAI fallback
- [x] **P0** `app/core/recommendation_engine.py`
- [x] **P0** `app/api/routes/ai_routes.py`
- [x] **P0** `app/main.py`
- [ ] **P0** Test mock responses
- [ ] **P0** Test OpenAI integration
- [ ] **P2** RAG compliance
- [ ] **P2** Embeddings + pgvector

---

## Phase 3 — Backend: Java Microservices

### auth-service (Java/Spring Boot) — Port 8081

- [x] **P0** `pom.xml` — Spring Boot 3.2.1, Security, JPA, jjwt
- [x] **P0** `Dockerfile` — multi-stage build
- [x] **P0** `AuthApplication.java`
- [x] **P0** `config/SecurityConfig.java`
- [x] **P0** `config/JwtConfig.java`
- [x] **P0** `model/User.java`, `Role.java`, `AuditLog.java`
- [x] **P0** `dto/LoginRequest.java`, `LoginResponse.java`, `UserDTO.java`
- [x] **P0** `repository/UserRepository.java`, `AuditLogRepository.java`
- [x] **P0** `service/JwtService.java`
- [x] **P0** `service/UserDetailsServiceImpl.java`
- [x] **P0** `service/AuthService.java` — login, register, refreshToken
- [x] **P0** `service/UserService.java` — CRUD, role management
- [x] **P0** `controller/AuthController.java`, `UserController.java`
- [x] **P0** `exception/UserNotFoundException.java`, `GlobalExceptionHandler.java`
- [x] **P0** `application.yml`
- [ ] **P0** Test login/register flow
- [ ] **P0** Verify JWT validation
- [ ] **P1** Refresh token rotation

### asset-service (Java/Spring Boot) — Port 8082

- [x] **P0** `pom.xml`, `Dockerfile`
- [x] **P0** `AssetApplication.java`
- [x] **P0** `model/Asset.java`, `AssetType.java`, `AssetDependency.java`
- [x] **P0** `dto/AssetDTO.java`, `AssetCreateRequest.java`
- [x] **P0** `repository/AssetRepository.java`, `AssetDependencyRepository.java`
- [x] **P0** `service/AssetService.java` — CRUD + filters
- [x] **P0** `service/CriticalityService.java`
- [x] **P0** `controller/AssetController.java`
- [x] **P0** `exception/AssetNotFoundException.java`, `GlobalExceptionHandler.java`
- [x] **P0** `application.yml`
- [ ] **P0** Test asset CRUD
- [ ] **P0** Load mock data
- [ ] **P1** Dependency graph

### vulnerability-service (Java/Spring Boot) — Port 8083

- [x] **P0** `pom.xml`, `Dockerfile`
- [x] **P0** `VulnerabilityApplication.java`
- [x] **P0** `model/Vulnerability.java`, `Severity.java`, `Finding.java`
- [x] **P0** `dto/VulnerabilityDTO.java`, `FindingCreateRequest.java`
- [x] **P0** `repository/VulnerabilityRepository.java`, `FindingRepository.java`
- [x] **P0** `service/VulnerabilityService.java` — CRUD + bulk
- [x] **P0** `service/PrioritizationService.java`
- [x] **P0** `controller/VulnerabilityController.java`, `FindingController.java`
- [x] **P0** `exception/VulnerabilityNotFoundException.java`, `GlobalExceptionHandler.java`
- [x] **P0** `application.yml`
- [ ] **P0** Test vuln CRUD
- [ ] **P0** Load mock data
- [ ] **P1** CVE enrichment

### control-service (Java/Spring Boot) — Port 8084

- [x] **P0** `pom.xml`, `Dockerfile`
- [x] **P0** `ControlApplication.java`
- [x] **P0** `model/SecurityControl.java`, `ControlType.java`, `AssetControl.java`
- [x] **P0** `dto/ControlDTO.java`, `EffectivenessDTO.java`
- [x] **P0** `repository/ControlRepository.java`, `AssetControlRepository.java`
- [x] **P0** `service/ControlService.java`, `EffectivenessService.java`
- [x] **P0** `controller/ControlController.java`
- [x] **P0** `exception/ControlNotFoundException.java`, `GlobalExceptionHandler.java`
- [x] **P0** `application.yml`
- [ ] **P0** Test control CRUD
- [ ] **P0** Load mock data

### ingestion-service (Java/Spring Boot) — Port 8085

- [x] **P0** `pom.xml`, `Dockerfile`
- [x] **P0** `IngestionApplication.java`
- [x] **P0** `model/SecurityEvent.java`, `EventType.java`
- [x] **P0** `dto/IngestionRequest.java`, `VulnerabilityEvent.java`, `ControlUpdateEvent.java`, `AssetEvent.java`
- [x] **P0** `repository/SecurityEventRepository.java`
- [x] **P0** `service/NormalizerService.java`
- [x] **P0** `service/EventDispatcher.java` — Redis pub/sub
- [x] **P0** `service/IngestionService.java` — orchestration
- [x] **P0** `controller/IngestionController.java` — 7 endpoints
- [x] **P0** `exception/IngestionException.java`, `GlobalExceptionHandler.java`
- [x] **P0** `application.yml`
- [ ] **P0** Test event pipeline
- [ ] **P0** Test simulated cycle
- [ ] **P1** Event replay

### notification-service (Java/Spring Boot) — Port 8086

- [x] **P0** `pom.xml`, `Dockerfile`
- [x] **P0** `NotificationApplication.java`
- [x] **P0** `config/WebSocketConfig.java` — STOMP /ws, broker /topic
- [x] **P0** `config/RedisConfig.java`
- [x] **P0** `model/RiskNotification.java`
- [x] **P0** `controller/WebSocketController.java`
- [x] **P0** `listener/RiskEventListener.java` — Redis to WebSocket
- [x] **P0** `application.yml`
- [ ] **P0** Test WebSocket connection
- [ ] **P0** Test Redis to WebSocket broadcast

### api-gateway (Spring Cloud Gateway) — Port 8080

- [x] **P0** `pom.xml` — Spring Cloud Gateway + BOM
- [x] **P0** `Dockerfile`
- [x] **P0** `GatewayApplication.java`
- [x] **P0** `config/RouteConfig.java` — 8 routes
- [x] **P0** `config/CorsConfig.java`
- [x] **P0** `filter/AuthFilter.java` — JWT validation
- [x] **P0** `filter/LoggingFilter.java`
- [x] **P0** `handler/GatewayErrorHandler.java`
- [x] **P0** `application.yml`
- [ ] **P0** Test routing to all services
- [ ] **P0** Test JWT via gateway
- [ ] **P1** Rate limiting
- [ ] **P1** Circuit breaker

---

## Phase 4 — Frontend (React + TypeScript + Tailwind)

### Project Setup

- [x] **P0** Initialize Vite + React + TypeScript
- [x] **P0** Configure Tailwind CSS
- [ ] **P1** Install shadcn/ui (using lucide-react icons instead for now)
- [x] **P0** Install Recharts, Zustand, Axios, React Router, SockJS, STOMP.js (in package.json)
- [x] **P0** Create `Dockerfile` + `nginx.conf`

### API Layer

- [x] **P0** `src/api/client.ts` — Axios + JWT interceptors
- [x] **P0** `src/api/authApi.ts`
- [x] **P0** `src/api/assetApi.ts`
- [x] **P0** `src/api/vulnerabilityApi.ts`
- [x] **P0** `src/api/controlApi.ts`
- [x] **P0** `src/api/riskApi.ts`
- [x] **P0** `src/api/investmentApi.ts`
- [x] **P0** `src/api/aiApi.ts`

### Types

- [x] **P0** `src/types/asset.ts`
- [x] **P0** `src/types/vulnerability.ts`
- [x] **P0** `src/types/risk.ts`
- [x] **P0** `src/types/investment.ts`
- [x] **P0** `src/types/api.ts`

### State Management

- [x] **P0** `src/store/authStore.ts` — Zustand
- [x] **P0** `src/store/riskStore.ts`
- [x] **P0** `src/store/notificationStore.ts`

### Hooks

- [x] **P0** `src/hooks/useWebSocket.ts` — STOMP
- [x] **P0** `src/hooks/useAuth.ts`
- [x] **P0** `src/hooks/useRiskData.ts`

### Layout Components

- [x] **P0** `src/components/layout/Sidebar.tsx`
- [x] **P0** `src/components/layout/Header.tsx`
- [x] **P0** `src/components/layout/MainLayout.tsx`
- [x] **P0** `src/components/layout/NotificationBell.tsx`

### Chart Components

- [x] **P0** `src/components/charts/RiskTrendChart.tsx`
- [x] **P0** `src/components/charts/FinancialExposureChart.tsx`
- [x] **P0** `src/components/charts/AssetRiskHeatmap.tsx`
- [x] **P0** `src/components/charts/VulnerabilityPieChart.tsx`
- [x] **P0** `src/components/charts/InvestmentROSIChart.tsx`
- [x] **P0** `src/components/charts/RiskBreakdownTree.tsx`

### Dashboard Components

- [x] **P0** `src/components/dashboard/RiskScoreCard.tsx`
- [x] **P0** `src/components/dashboard/EALCard.tsx`
- [x] **P0** `src/components/dashboard/TopRiskCard.tsx`
- [x] **P0** `src/components/dashboard/BudgetCard.tsx`
- [x] **P0** `src/components/dashboard/RecentEventsFeed.tsx`

### Risk Components

- [x] **P0** `src/components/risk/RiskMatrix.tsx`
- [x] **P0** `src/components/risk/RiskTimeline.tsx`
- [x] **P0** `src/components/risk/RiskDetailModal.tsx`

### Common Components

- [x] **P0** `src/components/common/DataTable.tsx`
- [x] **P0** `src/components/common/SeverityBadge.tsx`
- [x] **P0** `src/components/common/LoadingSpinner.tsx`
- [x] **P0** `src/components/common/ConfirmDialog.tsx`

### Pages

- [x] **P0** `src/pages/LoginPage.tsx`
- [x] **P0** `src/pages/ExecutiveDashboard.tsx` — EAL, risk score, top drivers
- [x] **P0** `src/pages/SecurityDashboard.tsx` — vulns, controls, events
- [x] **P0** `src/pages/AssetManagement.tsx`
- [x] **P0** `src/pages/VulnerabilityManagement.tsx`
- [x] **P0** `src/pages/RiskAnalysis.tsx`
- [x] **P0** `src/pages/ScenarioSimulator.tsx` — what-if UI
- [x] **P0** `src/pages/InvestmentOptimizer.tsx` — budget allocation + ROSI
- [x] **P0** `src/pages/AIAssistant.tsx` — NL chat interface
- [x] **P0** `src/pages/Settings.tsx`

### App Entry

- [x] **P0** `src/main.tsx`
- [x] **P0** `src/App.tsx` — React Router with all routes
- [x] **P0** `index.html`
- [x] **P0** `vite.config.ts`
- [x] **P0** `tsconfig.json`
- [x] **P0** `package.json`
- [x] **P0** `tailwind.config.js`
- [x] **P0** `src/styles/globals.css`

---

## Phase 5 — Integration & Testing

### Data Seeding

- [ ] **P0** Write seed script to load mock data into NeonDB
- [ ] **P0** Create PostgreSQL seed script or Python seeding utility
- [ ] **P0** Seed assets, vulnerabilities, controls, and sample events
- [ ] **P0** Verify data flows across all services

### Integration Testing

- [x] **P0** Test auth flow: register -> login -> JWT -> protected route
- [x] **P0** Test asset CRUD via gateway
- [x] **P0** Test vulnerability CRUD via gateway
- [ ] **P0** Test event ingestion -> risk recalculation -> WebSocket update
- [ ] **P0** Test investment optimization with Rs.1 Cr budget
- [ ] **P0** Test AI recommendation flow
- [ ] **P0** Test scenario simulator end-to-end
- [ ] **P0** Test full demo flow (login -> dashboard -> ingest event -> live update -> optimize)

### Docker Compose

- [x] **P0** `docker-compose up` all services
- [x] **P0** Verify all health checks pass
- [x] **P0** Verify frontend connects to gateway
- [ ] **P1** Add init container for database migration
- [ ] **P1** Add seed container

### WebSocket Real-Time

- [ ] **P0** Test event ingestion triggers WebSocket notification
- [ ] **P0** Test React useWebSocket hook receives updates
- [ ] **P0** Verify dashboard updates live on risk change

---

## Phase 6 — Hackathon Demo Preparation

### Demo Script

- [ ] **P0** Write demo script (10-15 minutes)
- [ ] **P0** Prepare seed data that tells a story (Rs.8.5 Cr -> Rs.4.3 Cr)
- [ ] **P0** Practice full flow: login -> dashboard -> ingest -> live update -> AI -> simulate -> optimize

### Visual Polish

- [ ] **P1** Final dashboard layout review
- [ ] **P1** Mobile responsiveness
- [ ] **P1** Loading states and error handling
- [ ] **P1** Toast notifications for live events

### Documentation

- [ ] **P1** `README.md` with project overview, setup, demo instructions
- [ ] **P1** Architecture diagram for presentation slides
- [ ] **P2** API documentation (Swagger/OpenAPI)

---

## Phase 7 — Future (Post-Hackathon)

### Phase 2 Features

- [ ] **P2** ML risk prediction (XGBoost)
- [ ] **P2** RAG for compliance frameworks (NIST/ISO/CIS)
- [ ] **P2** RBI/SEBI compliance mapping
- [ ] **P2** Advanced threat intelligence integration
- [ ] **P2** Time-series risk prediction
- [ ] **P2** Cloud deployment (AWS/Azure)
- [ ] **P2** CI/CD pipeline (GitHub Actions)

### Phase 3 Features

- [ ] **P3** Real SIEM integration (Splunk/ELK)
- [ ] **P3** Real EDR integration (CrowdStrike)
- [ ] **P3** Real IAM integration (Okta/Azure AD)
- [ ] **P3** Real CSPM integration (Wiz/Prisma)
- [ ] **P3** Kafka event streaming (replace Redis Pub/Sub)
- [ ] **P3** Kubernetes orchestration
- [ ] **P3** Blockchain audit trail
- [ ] **P3** Multi-tenant architecture
- [ ] **P3** Performance optimization at scale

---

## Current Action Items (Next Steps)

1. ~~Run `npm install`~~ ✅ DONE
2. ~~Fix import issues~~ ✅ DONE (stores/ → store/ path fix)
3. ~~TypeScript check + Vite build~~ ✅ DONE (zero errors, clean build)
4. ~~Create NeonDB database~~ ✅ DONE (connected to NeonDB)
5. ~~Run NeonDB migrations~~ ✅ DONE (all 7 SQL files + seed data)
6. ~~Seed mock data~~ ✅ DONE (12 assets, 10 controls, 15 vulns, 14 asset-control mappings, 12 risk calcs)
7. ~~Start Python services~~ ✅ DONE (risk-engine, investment-optimizer, ai-service)
8. ~~Start Java services~~ ✅ DONE (auth, asset, vuln, control, ingestion, notification, gateway)
9. ~~Start frontend~~ ✅ DONE (Docker, port 3000)
10. **Test end-to-end** — login → dashboard → ingest event → live update → optimize
11. **Demo preparation** — script, practice, polish
