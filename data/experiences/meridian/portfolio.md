# Professional Experience & Project Highlights — Meridian

### Role and Duration

* **Company:** Meridian (E-commerce marketplace, mid-market)
* **Position:** Senior Product Analyst — analytics lead for Post-Purchase Customer Experience across four regional marketplaces (US, CA, MX, UK)
* **Duration:** July 2019 to December 2020 (1.5 years)
* **Team:** Embedded in a 12-person Post-Purchase product team; partnered with operations, data engineering, and seller success

---

### Key Work Areas and Achievements

#### 1. Operational Intelligence and Cost Savings

Built automated monitoring and planning systems to improve operational efficiency and reduce financial exposure during peak events.

* **Real-Time Defect Monitoring Pipeline:** Designed and shipped a real-time defect detection system for peak sales events (Holiday, Prime-equivalent Flash Sale, Back-to-School).
  * System used statistical process control (SPC) limits to flag anomalies — late shipments, failed deliveries, damaged-item rates — before they escalated to customer contacts.
  * Generated **$12M in operational savings** by preventing fulfillment failures during peak windows.
  * Reduced mean time to detect (MTTD) a fulfillment defect spike from 4 hours to **under 20 minutes**.
* **Workforce Planning Tool:** Built an automated capacity planning model using 18 months of historical contact volume, seasonality adjustments, and fulfillment lead times.
  * Adopted by **100% of operations managers** within 6 weeks of launch.
  * Reduced manual planning effort by an estimated 8 hours per manager per week.
  * Improved forecast accuracy (MAPE) from 21% to **9%** for 2-week-ahead staffing projections.
* **Returns Anomaly Detection:** Built a secondary monitoring layer specifically for returns and refund rate spikes by seller and product category.
  * Flagged 3 seller-level fraud patterns in Q4 2019 before they crossed the escalation threshold, preventing an estimated **$800K in fraudulent refund payouts**.

#### 2. Customer Experience Analytics

Identified and quantified post-purchase pain points to prioritize product improvements.

* **Contact Driver Analysis:** Analyzed 2M+ customer service contacts to decompose the top reasons for post-purchase contacts (WISMO, damaged items, return friction, refund delays).
  * Built a contact-driver taxonomy adopted as the standard framework by the CX product team.
  * Identified "refund status anxiety" as the #1 driver of repeat contacts (28% of all contacts), leading to the refund tracker feature initiative.
* **Refund Tracker Feature:** Produced the business case and data brief for a self-serve refund status tracker (similar to order tracking).
  * Estimated contact deflection of **~340K contacts/year**, reducing CX costs by an estimated $1.7M annually.
  * Feature shipped by the product team 6 months after the brief; post-launch data confirmed **18% reduction in refund-related contacts**.
* **NPS Driver Analysis:** Ran regression analysis on post-purchase NPS survey data (n=180K) to identify the strongest predictors of promoter vs. detractor scores.
  * Found that delivery speed perception (not actual speed) was the strongest detractor driver; informed copy changes on confirmation emails that lifted NPS by **+6 points** in a 30-day test.
* **Returns Experience Audit:** Conducted an end-to-end audit of the returns flow across all 4 marketplaces, mapping drop-off and friction points at each step.
  * Identified a 3-click reduction opportunity in the return label generation flow.
  * Partnered with the product team to implement; resulted in a **22% increase in self-serve return completion** (vs. contacting support).

#### 3. Analytics Infrastructure and Visibility

Built dashboards and standardized reporting to improve decision-making across product, ops, and leadership.

* **One-Stop Operations Dashboard:** Designed and built a unified ops command center with drill-down by region, product category, seller tier, and time window using Tableau + Redshift.
  * Achieved **38% adoption rate** across the operations team within 2 months of launch.
  * Cited by senior leadership as a key input for weekly ops reviews; replaced 5 separate spreadsheet reports.
* **Seller-Level Defect Scorecard:** Built an automated weekly scorecard emailed to seller account managers with defect rates, return rates, and late shipment trends per seller.
  * Enabled account managers to proactively intervene with underperforming sellers; correlated with a **14% reduction in seller-caused CSAT defects** over 2 quarters.
* **Stakeholder Alignment & KPI Standardization:** Led cross-functional working sessions with 4 regional marketplace teams to align on KPI definitions, metric ownership, and reporting cadence.
  * Eliminated 3 duplicate reporting streams, saving an estimated 12 analyst-hours per week across teams.
  * Published a shared "Metrics Glossary" adopted as the standard reference across the Post-Purchase org.
* **Executive Reporting Automation:** Automated the monthly executive CX summary report (previously 6-hour manual effort) using Python + SQL scheduled jobs.
  * Reduced report production time from **6 hours to 20 minutes**; enabled weekly cadence instead of monthly.

#### 4. Seller Analytics and Trust

Built analytics tools to improve seller performance and marketplace trust.

* **Seller Performance Benchmark Tool:** Built an interactive Tableau dashboard allowing sellers to compare their own defect and return rates against anonymized category-level benchmarks.
  * Adopted by **62% of enrolled sellers** in the pilot; sellers who used it had 19% fewer policy violations quarter-over-quarter.
* **Fraud Pattern Detection:** Developed heuristics for identifying coordinated return fraud (multiple accounts, same address, same product clusters).
  * Flagged 7 coordinated fraud rings in 18 months; estimated abuse prevented: **$2.4M**.
* **Listing Quality Scoring:** Built a listing quality score (completeness, image count, description length, review recency) and surfaced it in the seller dashboard.
  * Sellers who improved their score by >20 points showed a **31% lift in conversion rate** on their listings, per controlled analysis.

#### 5. Experimentation and A/B Testing Support

Supported the product team's experimentation program as the embedded analyst.

* **Experiment Design Reviews:** Reviewed and signed off on experiment designs for statistical validity (sample size, runtime, metric selection) for 40+ A/B tests over 18 months.
  * Caught 6 underpowered experiments before launch, preventing false-positive calls on key product decisions.
* **Post-Purchase Email Optimization:** Designed and analyzed a multivariate test on delivery confirmation email content (tracking CTA placement, estimated delivery language, cross-sell module).
  * Winning variant increased email-driven repeat purchase rate by **8%** within 30 days of delivery.
* **Return Policy Copy Test:** Ran a test on simplified return policy language ("Free returns within 30 days, no questions asked" vs. the original 4-paragraph legal copy).
  * Simplified copy increased purchase conversion by **2.3%** on product pages where it was shown.
