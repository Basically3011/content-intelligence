# Content Intelligence Database – MVP PRD

## 1. Overview

### 1.1 Purpose

The **Content Intelligence Database** is a PostgreSQL schema that centralizes all Monotype.com marketing content for:

- Technical ingestion (Ann/API, Crawl4AI, DataForSEO, LLM outputs)
- Persona and buying-stage mapping
- Content quality and conversion scoring
- SEO performance insights
- Content mix classification and portfolio analysis

The database is designed to be simple enough for ad-hoc queries (Metabase/Superset) and n8n automations, but structured enough to support experimentation with different LLM prompts and SEO tools.

### 1.2 Scope (MVP)

- Content assets (URLs) across multiple languages:
  - `en`, `de`, `fr`, `es`, `pt`, `ja`, `cn`, `kr`, etc.
- Only **marketing content from monotype.com** (resources, articles, landing pages, etc.).
- Input sources:
  - Monotype Ann/API (content inventory per language)
  - Crawl4AI (clean body markdown)
  - Persona LLM (e.g., Claude Sonnet persona-mapping prompt)
  - Scoring LLM (e.g., Claude Sonnet content scoring prompt)
  - DataForSEO (onpage and ranked keywords)
  - Manual content mix classification

No web analytics, product usage, or CRM data is in scope for this MVP.

---

## 2. Data Model

The schema consists of three main tables:

1. `content_inventory` – one row per URL + language  
2. `content_persona_mapping` – multiple persona/buying-stage runs per content  
3. `content_scoring` – multiple scoring/audit runs per content  

A key design choice is to introduce a **stable per-locale identifier**:

- `language_node_id = "<node_id>_<language>"`  
  Example: `5186_fr`

This makes it easy to reference a specific language variant from n8n, RAG pipelines, or external tools.

---

### 2.1 Table: `content_inventory`

**Granularity:** One row per **URL + language**.  
This is the "master" table that everything else hangs off.

#### 2.1.1 Identification & Basic Fields

- `inventory_id` (PK)  
  Internal surrogate key.

- `language_node_id`  
  - Stable per-locale key: `"<node_id>_<language>"`  
  - Example: `5186_fr`  
  - Used as a unique identifier for one language variant of one node.  
  - There is a unique index on this field.

- `node_id`  
  Content node from Ann/API (e.g. `"5186"`).

- `language`  
  ISO code such as `de`, `en`, `fr`, `ja`, `pt`, `zh_CN`, `ko`.

- `url`  
  Full URL for this language variant.

- `group_key` (optional)  
  Logical grouping key across languages (e.g. same `node_id`, or a future grouping strategy).

- `title`  
  Localized page title.

- `content_type_machine`  
  Technical content type (e.g. `resource`, `article`, `landing_page`).

- `topic`  
  High-level topic/category (e.g. `Videos`, `Case Studies`, `Ebooks`).

#### 2.1.2 Ann/Program Metadata (Per Locale)

All of these are **language-specific**, because PDG/nurture configuration can differ across locales.

- `is_pdg_program_content` – bool  
  Whether this locale is part of the PDG program.

- `is_content_gated` – bool  
  Whether the content is gated (form, login, etc.).

- `is_nurture_content` – bool  
  Whether this URL is explicitly used as nurture content.

- `ann_stage` – text  
  Annuitas stage (e.g. `N-2`, `N-3`).

- `serial_number` – text  
  Ann/serial identifier (e.g. `N-2-6534`).

- `ann_conversation_tracks` – `TEXT[]`  
  Conversation tracks (e.g. `["Creative","IT"]`).

- `ann_products` – `TEXT[]`  
  Product tags (e.g. `["Monotype Fonts","Font Management"]`).

- `ann_solutions` – `TEXT[]`  
  Solution tags (business problems/use cases).

- `ann_raw` – `JSONB`  
  Full Ann/API metadata block for this locale. This is the single source of truth for anything not elevated into scalar/array fields.

#### 2.1.3 Content Body (Crawl / JS)

- `raw_markdown` – text  
  Full content body as Markdown (from Crawl4AI or a similar pipeline).

- `markdown_hash` – text  
  Hash of the markdown used to detect content changes and avoid unnecessary LLM/SEO calls.

- `word_count` – integer  
  **Single canonical word count**, calculated in JS/node/n8n.  
  (We explicitly avoid duplicating SEO/LLM-specific word counts.)

- `crawled_at` – timestamp with time zone  
- `crawl_status` – text (`pending | ok | error`)

#### 2.1.4 Content Mix Classification

Content mix classification enables strategic portfolio analysis by categorizing assets according to their role in the buyer journey. This supports target distribution analysis (e.g., 40% Thought Leadership in Awareness stage) and gap identification.

- `content_mix_category` – text  
  Manual classification into strategic content categories:
  - **Awareness:** `Thought Leadership`, `Industry Insights`, `Problem Education`, `Brand Awareness`
  - **Explore:** `Solution Education`, `Capability Overviews`, `Customer Stories`, `Comparison Content`
  - **Evaluate:** `Proof Points`, `Technical Deep Dives`, `Business Cases`, `Competitive Intelligence`
  - **Decision:** `Implementation Support`, `Business Justification`, `Procurement Support`, `Success Planning`

- `content_mix_source` – text  
  Default: `'manual'`  
  Classification source: `manual`, `llm`, `import`, `derived`  
  Tracks how the classification was assigned for quality and audit purposes.

- `content_mix_assigned_by` – text  
  Username or identifier of person who assigned the classification.

- `content_mix_assigned_at` – timestamp with time zone  
  Timestamp when the classification was assigned.

- `content_mix_notes` – text  
  Optional notes for edge cases, rationale, or clarifications about the classification.

**Use cases:**
- Manual classification UI for content strategists
- Portfolio distribution analysis (target vs. actual percentages)
- Content gap identification by buying stage and category
- Historical tracking of classification changes
- Bulk import/export of classifications

**Future enhancements:**
- LLM-based classification suggestions stored in `content_mix_source = 'llm'`
- Confidence scores for automated classifications
- Multi-category tagging (primary/secondary categories)

#### 2.1.5 SEO Summary (DataForSEO, MVP)

These fields summarise SEO quality and ranking. Full detail remains in JSONB fields.

- `seo_onpage_score` – numeric  
- `seo_readability_flesch` – numeric  
- `seo_internal_links` – integer  
- `seo_external_links` – integer  
- `seo_images_count` – integer  

**Flag fields:**

- `seo_flag_low_content` – bool  
- `seo_flag_low_readability` – bool  
- `seo_flag_title_issue` – bool (covers "too long/short/duplicate")  
- `seo_flag_canonical_issue` – bool  
- `seo_flag_url_issue` – bool  

**Ranking / Traffic summary:**

- `seo_total_keywords` – integer  
- `seo_top10_keywords` – integer  
- `seo_top30_keywords` – integer  
- `seo_organic_etv` – double precision  
- `seo_organic_estimated_ads_cost` – double precision  

**Meta and raw responses:**

- `seo_last_checked_at` – timestamp (last DataForSEO run)  
- `seo_onpage_raw` – JSONB (full onpage analysis response)  
- `seo_keywords_raw` – JSONB (full ranked keywords response)

#### 2.1.6 Active LLM Run References

Instead of duplicating persona/stage/score fields into `content_inventory`, we keep separate run histories and only store **pointers** to the currently "active" runs.

- `active_persona_mapping_id`  
  - Foreign key to `content_persona_mapping.mapping_id`  
  - Points to the current persona/buying-stage mapping considered "valid" or "approved".

- `active_scoring_id`  
  - Foreign key to `content_scoring.scoring_id`  
  - Points to the current scoring/audit run considered "valid" or "approved".

These may be null, especially early in the pipeline.

#### 2.1.7 Pipeline Status Fields

- `status_crawl` – text (`pending | ok | error`)  
- `status_persona_mapping` – text  
- `status_scoring` – text  
- `created_at`, `updated_at` – timestamps for ETL tracking

#### 2.1.8 Indexes & Constraints

- Unique index on `language_node_id`  
  - Ensures one row per `(node_id, language)` combination.  
  - Makes it trivial for n8n or other systems to address "the DE version of node 5186" as `5186_de`.

- Additional indices:
  - `(node_id, language)`  
  - `url`  
  - `(language, ann_stage)`  
  - `seo_onpage_score`
  - `content_mix_category` (for portfolio analysis queries)

---

### 2.2 Table: `content_persona_mapping`

**Granularity:** One row per **persona-mapping run** for a given content item.

#### 2.2.1 Identification & Relationship

- `mapping_id` (PK)  
- `inventory_id` – FK → `content_inventory.inventory_id`

`inventory_id` links back to URL + language (and indirectly to `language_node_id`).

#### 2.2.2 Persona & Stage Result

- `persona_primary_id` – e.g. `olivia_creative_ops`  
- `persona_primary_label` – e.g. `OliviaOps – Creative Operations`  
- `persona_secondary_id` – optional  
- `persona_secondary_label` – optional  
- `buying_stage` – `Awareness | Explore | Evaluate | Decision`  
- `is_content_gap_or_misfit` – bool  
- `key_pain_point` – short description  
- `rationale` – justification from the LLM  
- `content_type_inferred` – content type inferred during persona-mapping

#### 2.2.3 Technical Meta

- `input_markdown_hash` – markdown hash used for this run  
- `model_name` – e.g. `claude-3.5-sonnet-2025-10-01`  
- `prompt_version` – e.g. `persona_v1`, `persona_v2`  
- `lang_detected` – optional  
- `source` – `llm | human_override | import`  
- `raw_json` – full persona-mapping response  
- `status` – `ok | error | deprecated`  
- `created_at`, `created_by`, `notes`

#### 2.2.4 Indexes

- `inventory_id` – for joins back to `content_inventory`  
- `(persona_primary_id, buying_stage)` – for persona/stage analyses

---

### 2.3 Table: `content_scoring`

**Granularity:** One row per **scoring/audit run** for a given content item.

#### 2.3.1 Identification & Relationship

- `scoring_id` (PK)  
- `inventory_id` – FK → `content_inventory.inventory_id`

#### 2.3.2 Scores & Flags

- `content_type_llm` – content type detected during scoring

**Scores:**

- `score_structure`  
- `score_clarity`  
- `score_relevance`  
- `score_conversion`  
- `score_overall_weighted`

**Flags:**

- `flag_is_wall_of_text` – bool  
- `flag_has_transactional_cta` – bool  
- `flag_has_mixed_pronouns` – bool  
- `flag_is_company_centric` – bool  
- `flag_has_case_study_metrics` – bool (optional)  
- `flag_has_screenshots` – bool (optional)  
- `flag_has_certs_with_year` – bool (optional)  
- `flag_has_api_docs` – bool (optional)  
- `flag_has_sla_terms` – bool (optional)

**Audit text:**

- `audit_executive_summary` – text  
- `audit_primary_strengths` – JSONB array  
- `audit_critical_weaknesses` – JSONB array  
- `audit_recommendations` – JSONB array

#### 2.3.3 Technical Meta

- `input_markdown_hash` – markdown hash used for this run  
- `model_name` – e.g. `claude-3.5-sonnet-2025-10-01`  
- `prompt_version` – e.g. `scoring_v1`  
- `raw_json` – full scoring JSON  
- `status` – `ok | error | deprecated`  
- `created_at`, `created_by`, `notes`

#### 2.3.4 Indexes

- `inventory_id` – join back to `content_inventory`  
- `score_overall_weighted` – quick segmentation by score

---

## 3. Data Flow / n8n Pipelines

### 3.1 High-Level Flow

1. **Ann/API Import**  
   - For each locale in the API response:
     - Compute `language_node_id = node_id + '_' + language`.  
     - Upsert into `content_inventory` by `language_node_id`.  
     - Store Ann metadata in scalar fields and `ann_raw`.

2. **Crawl4AI**  
   - Use `language_node_id` or `inventory_id` in n8n to fetch `url`.  
   - Crawl page → update `raw_markdown`, `markdown_hash`, `word_count`, `crawled_at`, `crawl_status`.

3. **Persona Mapping**  
   - For all assets with markdown, run persona LLM.  
   - Insert row into `content_persona_mapping` with `inventory_id`.  
   - Optionally set `content_inventory.active_persona_mapping_id`.

4. **Scoring**  
   - Run scoring LLM.  
   - Insert row into `content_scoring`.  
   - Optionally set `content_inventory.active_scoring_id`.

5. **SEO (DataForSEO)**  
   - For selected URLs, call Onpage + Keywords.  
   - Update SEO summary fields + raw JSON in `content_inventory`.

6. **Content Mix Classification (Manual)**
   - Content strategists classify assets using mini-app UI.
   - Update `content_mix_category`, `content_mix_source`, `content_mix_assigned_by`, `content_mix_assigned_at`.
   - Optional: Bulk import/export for efficiency.

### 3.2 Using `language_node_id` in Flows

- n8n can treat `language_node_id` as the main key when:
  - Pulling items from Ann/API,  
  - Enriching with Crawl4AI,  
  - Triggering persona/scoring/SEO pipelines.

- It is human-readable, compact, and deterministic:
  - Example: `5186_fr` or `6534_de`.

---

## 4. Typical Use Cases / Queries

### 4.1 Content Gap Analysis

- "Show all DE PDG nurture assets in N-2 stage":  
  Filter `content_inventory` by `language = 'de'`, `is_pdg_program_content = true`, `is_nurture_content = true`, `ann_stage = 'N-2'`.

- "Show all FR assets for node 5186"  
  Filter by `language_node_id = '5186_fr'` or by `node_id = '5186' AND language = 'fr'`.

- "Find Decision-stage content for OliviaOps with poor SEO score":  
  Join `content_inventory` → `content_persona_mapping` and filter by `persona_primary_id = 'olivia_creative_ops'`, `buying_stage = 'Decision'`, `seo_onpage_score < 80`.

### 4.2 Content Mix Portfolio Analysis

- "Find gaps between target and actual content mix":
  Compare target percentages (40% Thought Leadership, 30% Industry Insights, etc.) with actual distribution.

- "Show unclassified assets that need manual review":
  Filter by `content_mix_category IS NULL AND status_crawl = 'ok'`.

### 4.3 Coverage Thresholds

Content coverage assessment by persona and buying stage:

**Threshold Levels:**
- **Critical:** 0 assets (no coverage)
- **Poor:** 1-3 assets (minimal coverage)
- **Fair:** 4-7 assets (baseline coverage)
- **Good:** 8-12 assets (solid coverage)
- **Great:** 13-30 assets (comprehensive coverage)
- **Excessive:** 31+ assets (review needed for content bloat)

---

## 5. Future Extensions

### 5.1 Potential Enhancements

- **LLM Run History Table**: Track all LLM runs (not just active ones) with versioning and A/B testing capabilities.

- **Structured SEO Keyword Table**: Normalize keyword rankings into a separate table for trend analysis.

- **Materialized Views**: Pre-compute common aggregations for dashboard performance.

- **Content Mix Automation**: LLM-suggested classifications with confidence scores.

- **Multi-language Content Mix Analysis**: Compare content distribution across locales.

- **Content Freshness Tracking**: Flag outdated assets based on last update timestamp.

### 5.2 Integration Points

All external systems can reliably use `language_node_id` as their main pointer into the DB for:
- n8n automation workflows
- RAG/embedding pipelines
- External BI tools (Superset, Metabase)
- Custom mini-apps (content classification UI)
- Export/import utilities

---

## 6. Appendix

### 6.1 Content Mix Target Distribution

**Awareness (Top of Funnel):**
- 40% Thought Leadership (Blogs, Research)
- 30% Industry Insights (Reports, Whitepapers)
- 20% Problem Education (Guides, Infographics)
- 10% Brand Awareness (Videos, Webinars)

**Explore (Middle of Funnel):**
- 35% Solution Education (Product Guides, Use Cases)
- 25% Capability Overviews (Feature Sheets, Demos)
- 25% Customer Stories (Case Studies, Testimonials)
- 15% Comparison Content (vs. Alternatives)

**Evaluate (Late Middle Funnel):**
- 40% Proof Points (ROI Studies, Customer References)
- 30% Technical Deep Dives (Architecture, Integration)
- 20% Business Cases (TCO, Value Assessments)
- 10% Competitive Intelligence (Battle Cards)

**Decision (Bottom of Funnel):**
- 40% Implementation Support (Onboarding, Training)
- 30% Business Justification (Executive Summaries, ROI)
- 20% Procurement Support (Contracts, Legal, Security)
- 10% Success Planning (Roadmaps, Timelines)

### 6.2 Database Schema Version

- **Version:** MVP v1.1
- **Last Updated:** 2025-11-25
- **Schema Changes:** Added content mix classification fields to `content_inventory` table
