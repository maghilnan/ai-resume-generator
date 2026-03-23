# Professional Experience & Project Highlights — Nimbus

### Role and Duration

* **Company:** Nimbus (Consumer fintech startup, Series B)
* **Position:** Product Manager — owned the core budgeting, subscription, and growth product from 0 to $50M ARR
* **Duration:** January 2021 to Present (4 years)
* **Team:** 4 squads (Growth, Core Product, Platform, Data); reported to VP Product

---

### Key Work Areas and Achievements

#### 1. Activation & Onboarding

Led redesign of the new-user onboarding flow to reduce time-to-value and improve Day-7 retention.

* **Onboarding Funnel Overhaul:** Redesigned 6-step onboarding to 3-step by cutting low-signal questions; ran A/B test across 40K users over 3 weeks.
  * Increased Day-7 activation rate by **35%**.
  * Reduced onboarding drop-off from 62% to 41%.
  * Uplift held across all acquisition channels (paid, organic, referral).
* **Bank Connection Reliability:** Partnered with engineering to replace legacy single-provider Plaid integration with a dual-provider fallback (Plaid + Finicity).
  * Improved bank-link success rate from 71% to **89%**, directly unblocking the activation loop for a segment that had 0% Day-1 retention.
* **Progressive Onboarding:** Introduced a "quick start" path that deferred non-critical setup steps (bill sync, budget categories) to post-activation nudges.
  * Improved completion of full profile setup from 44% to **67%** within 7 days.
* **Welcome Email Sequence:** Redesigned 5-email onboarding drip based on user behavior triggers (first transaction, first budget set, first insight viewed).
  * Increased Day-14 email-driven re-engagement by **41%**.

#### 2. Monetization & Subscription Growth

Owned the full subscription funnel from trial start to paid conversion and renewal.

* **Paywall Redesign:** Redesigned the premium upgrade paywall with social proof, feature comparison, and usage-based nudges; tested 4 variants across 80K users.
  * Lifted trial-to-paid conversion by **22%**, contributing **$2.1M incremental ARR**.
* **Annual Plan Push:** Introduced annual plan as default selection with monthly downgrade option; added a savings callout ("Save $24/year").
  * Increased annual plan mix from 34% to **58%**, improving LTV by 1.7x and reducing payment failure churn.
* **Churn Intervention Flow:** Built a cancellation-intent save flow with 3 targeted offer variants (pause, discount, feature highlight) based on usage segment.
  * Reduced voluntary churn by **18%** in the 90 days post-launch.
  * Pause option alone recovered **9% of cancellers** who would have fully churned.
* **Pricing Experiment:** Led a controlled price increase test ($7.99 → $9.99/month) with a holdout cohort.
  * Net revenue impact was **+14%** after accounting for a 6% drop in new conversions; rolled out globally.
* **Winback Campaign:** Designed a 3-touch re-engagement sequence for lapsed paid users (churned 30–90 days prior) with a limited-time offer.
  * Reactivated **11% of the targeted lapsed cohort**, generating $180K in recovered ARR in Q3.
* **Free Tier Limits:** Introduced feature limits on the free tier (3 linked accounts, 60-day transaction history) to create upgrade pressure.
  * Increased upgrade prompt click-through by **33%**; paid conversion from free tier up 19%.

#### 3. Engagement & Retention

Built behavioral systems to drive habitual weekly usage and reduce passive churn.

* **Smart Notification Engine:** Designed a rules-based push notification system using spend triggers, budget threshold signals, and recurring bill reminders.
  * Increased 30-day notification opt-in rate to **74%** (up from 51%).
  * Weekly active users grew **29%** in the 60 days after rollout.
* **Personalized Budget Insights:** Shipped a weekly spend summary card with category-level anomaly detection and peer benchmarks ("You spent 2x more on dining than similar users").
  * Feature became top-rated in the app store within 3 months (4.7 stars, **2,400+ reviews** mentioning "insights").
  * D30 retention for users who viewed at least one insight card: **61%** vs. 38% for those who didn't.
* **Spending Streaks:** Introduced a gamified "on-budget streak" mechanic (7-day, 30-day badges) with in-app celebration moments.
  * Users with an active streak had **2.4x higher 60-day retention** than users without.
* **Bill Negotiation Feature:** Partnered with a third-party API to offer one-tap bill negotiation (cable, internet, insurance) inside the app.
  * Adopted by **18% of eligible users** in first 60 days; average saving of $340/year per negotiated bill.
  * Feature drove a **12% lift in referral invites** from users who successfully negotiated a bill.
* **In-App Messaging Personalization:** Replaced static promotional banners with ML-ranked in-app messages based on user behavior and segment.
  * Message CTR improved from 3.1% to **8.7%**.

#### 4. Growth & Acquisition

Led referral, SEO content, and partnership acquisition initiatives.

* **Referral Program Redesign:** Rebuilt referral program from a flat cash reward to a tiered model (invite 1 = $5, invite 3 = $20, invite 5 = $50 + premium month).
  * Referral-driven installs grew **3.2x** quarter-over-quarter.
  * Referred users had **40% higher 90-day retention** than paid acquisition cohorts.
* **Personal Finance SEO Hub:** Scoped and launched a content SEO hub ("Budget Calculator", "50/30/20 Rule", "Savings Rate Calculator") targeting high-intent personal finance queries.
  * Organic traffic to app store install page increased **67%** over 6 months.
* **Bank Partnership Integration:** Negotiated and shipped a co-marketing integration with a regional credit union, embedding Nimbus as a recommended budgeting tool in their onboarding.
  * Added **4,200 new sign-ups** in first 90 days with a CAC of $0 (partner-funded).
* **App Store Optimization (ASO):** Ran iterative A/B tests on app store screenshots, description copy, and preview video.
  * Improved install conversion rate from store listing page by **28%**.

#### 5. Core Product — Budgeting & Transactions

Owned the core budgeting and transaction management experience.

* **Category Auto-Detection:** Improved ML transaction categorization model accuracy from 71% to **88%** by retraining on 3M new labeled transactions; reduced user manual recategorizations by 54%.
* **Shared Budgets (Couples Feature):** Designed and shipped a shared budget workspace for couples/households with separate views and combined totals.
  * Became the #1 requested feature; **23% of new sign-ups** in the quarter cited it as the primary reason for choosing Nimbus.
* **Custom Budget Templates:** Added pre-built budget templates ("Student", "Family of 4", "Freelancer") to reduce setup friction for new users.
  * New users who chose a template had **44% higher activation** than those who built from scratch.
* **Recurring Transaction Detection:** Built a rule-based detector that auto-flagged recurring charges (subscriptions, rent) and surfaced them in a dedicated "Bills" view.
  * Users engaging with the Bills view had **35% lower 90-day churn** than the app average.
* **CSV Export:** Shipped transaction CSV export (frequently requested by power users and tax-prep season users).
  * Generated a spike in 5-star reviews during tax season — **+310 reviews** in 3 weeks.

#### 6. Platform & Data Infrastructure

Collaborated with data and engineering to build the foundation for experimentation and analytics.

* **Event Taxonomy:** Defined and standardized 120+ product events across iOS, Android, and web using Amplitude; authored the canonical event tracking spec.
  * Enabled the first cross-platform funnel reports, reducing analysis turnaround from 5 days to **same day**.
* **Experimentation Framework:** Worked with engineering to build an internal feature-flag and A/B testing framework integrated with Amplitude.
  * Enabled the team to run **3x more experiments per quarter** without additional engineering overhead.
  * Reduced experiment instrumentation time from ~2 weeks to **3 days**.
* **Data Warehouse Migration:** Drove requirements and UAT for migration from legacy MySQL reporting to Snowflake + dbt.
  * Reduced dashboard query time from 40s to **under 3s** for the 10 most-used reports.
* **Privacy & Compliance:** Led product response to CCPA data deletion requirements — defined deletion flows, worked with legal and engineering to build the user-facing data export/delete portal.
  * Shipped ahead of regulatory deadline with zero compliance findings.
