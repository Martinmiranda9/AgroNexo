# Upwork and LinkedIn Services Marketplace (ex-ProFinder): profiles, search, matching, first contact, trust

Research date: 2026-10-04. Caveat: Upwork's help center and resources pages (support.upwork.com, upwork.com/resources, upwork.com/blog) returned HTTP 403 to direct fetches, so Upwork facts below come from search-result extracts of those official pages plus secondary guides. Where a claim comes only from a third-party guide, that is flagged.

## 1. Card vs. full profile fields (Upwork; LinkedIn service page)

### Takeaway
Upwork leads with numbers you can compare: Job Success Score (JSS), a badge tier, earnings, hourly rate, plus filters for each of them. LinkedIn's service page leads with identity and network: the person's LinkedIn profile, the services they list, response-time and response-rate badges, and, for Premium Business only, ratings plus the most recent favorable review. Neither platform publishes an official field-by-field spec of its search-result card. I couldn't fetch one.

### Cited Findings
**Upwork: what clients can filter on (so these fields show on or behind the card)**
- Talent search filters include talent quality, hourly rate and location — [Upwork Help: Search for talent (search extract)](https://support.upwork.com/hc/en-us/articles/17935950691347--Search-for-talent)
- Filterable fields:
  - Job Success Score.
  - Earned amount (lifetime earnings are shown per freelancer).
  - Hourly rate, with buckets 0–10, 10–30, 30–60 and 60+ USD.
  - English level: Basic, Conversational, Fluent, Native.
  - Talent type: all, independent freelancers or agencies.
  - Sources: [Guideflow: filter by JSS](https://www.guideflow.com/tutorial/how-to-filter-talents-based-on-job-success-rate-on-upwork-); [Guideflow: English level](https://www.guideflow.com/tutorial/how-to-filter-talents-based-on-english-level-on-upwork-); [Guideflow: talent type](https://www.guideflow.com/tutorial/how-to-filter-talents-based-on-talent-type-on-upwork-) (third-party walkthroughs of the live UI)
- The JSS is recalculated daily from the freelancer's 6-, 12- and 24-month history. A score is computed for each window and the profile shows the best one — [Upwork Help: How is my JSS calculated (search extract)](https://support.upwork.com/hc/en-us/articles/38437458199059-How-is-my-Job-Success-Score-calculated)
- JSS inputs:
  - Client feedback, both public and private.
  - Reasons past contracts ended.
  - Higher-value projects.
  - Long-term client relationships.
  - Upwork does not publish the weights.
  - Source: [Upwork Help: All about your JSS (search extract)](https://support.upwork.com/hc/en-us/articles/211068358-All-about-your-Job-Success-Score)
- A JSS of 90% or higher counts as "excellent" and leads toward Top Rated. Below roughly 79%, freelancers "may find it difficult" to win clients — [Upwork Help: All about your JSS (search extract)](https://support.upwork.com/hc/en-us/articles/211068358-All-about-your-Job-Success-Score)
- Badge tiers shown on the profile and card:
  - **Rising Talent:** for new freelancers, before they have a JSS. A third-party guide cites 4.8+ stars as a criterion.
  - **Top Rated:** JSS of 90% or more, first project more than 90 days ago, 100% complete profile, and at least $1,000 earned in the last 12 months. The freelancer must also hold Rising Talent or keep JSS at 90%+ for 13 of the last 16 weeks, keep availability current, have an account in good standing, and have been active in the past 90 days.
  - Sources: [Upwork Help: How to become Top Rated (search extract)](https://support.upwork.com/hc/en-us/articles/211068468-How-to-become-Top-Rated-on-Upwork); [Medium guide](https://medium.com/@consultkelly/how-to-become-top-rated-on-upwork-badges-requirements-and-benefits-b3dc4e2140bc)
- **Top Rated Plus:**
  - Requires Top Rated status plus more than $10,000 earned in the last 12 months.
  - Requires at least one "large contract" with no negative outcomes on large contracts. The size threshold varies by category, for example about $5k for writers and $10k or more for consultants.
  - Upwork describes it as the top 3% of performers.
  - Sources: [Upwork Help: Learn about talent badges (search extract)](https://support.upwork.com/hc/en-us/articles/360049702614-Learn-about-Upwork-s-talent-badges); [Freelance Growth Center](https://freelancegrowthcenter.com/getting-top-rated-plus-on-upwork/)
- **Expert-Vetted:**
  - Described as the top 1%.
  - Manually vetted, including a roughly 30-minute skills interview with an Upwork Talent Manager.
  - Invitation-only since the public application window closed on 30 June 2024.
  - The badge is visible only to Enterprise and Business Plus clients.
  - Sources: [Upwork Help: talent badges (search extract)](https://support.upwork.com/hc/en-us/articles/360049702614-Learn-about-Upwork-s-talent-badges); [Upwex 2026 badge guide](https://upwex.io/blog/mastering-upwork-a-guide-to-earning-badges-and-building-reputation/). I could not confirm the visibility restriction on a primary page.
- An identity-verified badge exists and tells clients the freelancer "is who they say they are" — [Upwork Help: Recognize red flags (search extract)](https://support.upwork.com/hc/en-us/articles/35088484250003-Recognize-red-flags-and-avoid-scams)

**LinkedIn Services: service page and showcase**
- Service Pages are free landing pages that showcase services and run on a "request and proposal" model — [LinkedIn Help: Service Pages topic](https://www.linkedin.com/help/linkedin/topic/a190032); [LinkedIn Help: Get started as a service provider](https://www.linkedin.com/help/linkedin/answer/a550345)
- Response badges:
  - Response time: the provider's 180-day average response time is shown if they respond to inquiries within 24 hours.
  - Response rate: shown if they respond to at least 80% of inquiries.
  - Sources: [LinkedIn Help: Service Pages (search extract)](https://www.linkedin.com/help/linkedin/topic/a190032); [LinkedIn Help: provider getting started](https://www.linkedin.com/help/linkedin/answer/a550345)
- Premium Business, Sales Navigator or Recruiter Lite subscribers get a "Services Showcase" instead of the basic Services list. It includes:
  - A media carousel.
  - A **Request proposal** button.
  - A service description preview.
  - Ratings and the most recent 4- or 5-star review.
  - Eligibility for additional project requests.
  - Sources: [LinkedIn Help: Service Pages FAQs](https://www.linkedin.com/help/linkedin/answer/a569534); [LinkedIn Help: Get reviews for your services](https://www.linkedin.com/help/linkedin/answer/a570564/)
- Service Pages are available globally except in China. Freelancers and small business owners can create them — [LinkedIn Help: Service Pages FAQs](https://www.linkedin.com/help/linkedin/answer/a569534)

### Inferences
- Upwork's card is a set of comparable numbers: a percentage score, a dollar amount, a rate and a tier badge. Clients can sort and filter by each. LinkedIn's card works by recognition: a real LinkedIn identity, the services listed, and how responsive the provider is. Its "social proof" is cut down unless the provider pays for Premium.
- For an agro matchmaking product, two choices look reusable:
  - Upwork's single composite reliability score, shown as the best of several time windows so one bad period does not sink a professional.
  - LinkedIn's rule of showing responsiveness only when it is good (≤24h or ≥80%).

### Gaps
- I found no official, field-by-field spec of the Upwork search-result card. Commonly reported fields that I could not verify on a primary page:
  - Photo, title and rate.
  - JSS and badge.
  - Total earned.
  - Location and local time.
  - Skills chips.
  - "Available now".
- Upwork help pages returned 403, so the Rising Talent criteria and the exact Top Rated Plus thresholds come from search extracts and third-party guides.
- The maximum number of services per LinkedIn service page was not stated in the pages I fetched.

## 2. How LinkedIn ProFinder / Services Marketplace works (history and current flow)

### Takeaway
ProFinder was US-only. It ran in beta from October 2015 and launched in 2016. Clients posted a request, LinkedIn matched it to freelancers, and at most 5 freelancers could send proposals. Services Marketplace replaced it: a global, free directory of Service Pages. The client sends "Request services/proposal" to a provider and can opt to share the request with similar providers, but only Premium Business providers can answer those shared requests. Contracting and payment happen off LinkedIn.

### Cited Findings
- **ProFinder (2015–2016):**
  - In beta from October 2015, launched in 2016.
  - Companies submitted a request for proposal and were matched to freelancers based on the experience on their profiles.
  - Only five freelancers could respond with a proposal per request.
  - After the pilot, the first 5 proposals were free. Business Plus gave unlimited proposals.
  - Sources: [Interoadvisory: LinkedIn ProFinder review (2019)](https://www.interoadvisory.com/blog/2019/05/linkedin-profinder-a-review); [Forbes 2016](https://www.forbes.com/sites/greatspeculations/2016/09/01/heres-how-linkedin-can-benefit-from-expanding-pro-finder/); [Social Media Today](https://www.socialmediatoday.com/social-business/linkedin-expands-freelance-marketplace-provides-new-data-freelance-growth)
- Services Marketplace replaced the original US-only ProFinder — [Betterteam (Jan 2025)](https://www.betterteam.com/linkedin-services-marketplace). The exact cut-over date was not stated there. Press around Service Pages launching to freelancers: [Search Engine Land](https://searchengineland.com/freelancers-can-now-market-their-services-on-linkedin-375970).
- **Client flow today:**
  - Clients find providers in three ways: the Services Marketplace (linkedin.com/services), general LinkedIn search, or posting to their network with "Find an expert".
  - The client clicks "Request services" (shown as "Request proposal" on Showcase) and enters project details.
  - An optional checkbox, "share my request with additional providers", sends the request further.
  - "Only providers with a Premium Business subscription can respond" to those shared requests.
  - Source: [LinkedIn Help: Get started shopping for services](https://www.linkedin.com/help/linkedin/answer/a567616)
- On the "Request proposal" button, a pop-up asks a series of questions about the project — [LinkedIn Pulse: Services Marketplace Is Open](https://www.linkedin.com/pulse/linkedin-services-marketplace-open-greg-cooper)
- Automatically matched requests can't be filtered by location, industry or other criteria — [LinkedIn Help: shopping for services](https://www.linkedin.com/help/linkedin/answer/a567616)
- **Provider side:**
  - A Service Page admin view centralizes incoming requests.
  - Providers submit a proposal or decline.
  - Premium Business users can opt to automatically receive requests that clients shared with "similar providers".
  - Sources: [LinkedIn Help: Respond to service requests](https://www.linkedin.com/help/linkedin/answer/a570605); [readyforsocial (Dec 2024)](https://readyforsocial.com/2024/12/09/are-linkedin-service-pages-the-right-move-for-you/)
- **After a proposal:**
  - Client and provider message on LinkedIn, then "finalize the terms of any agreement outside of LinkedIn".
  - Payment uses the provider's own process, off-platform.
  - Potential clients can contact providers for free regardless of connection degree.
  - Sources: [LinkedIn Help: shopping](https://www.linkedin.com/help/linkedin/answer/a567616); [LinkedIn Help: provider getting started](https://www.linkedin.com/help/linkedin/answer/a550345)
- **Search:** clients search providers by keyword with filters for category, language, location and **connections** (network degree). The marketplace covers 16 service categories and is free for both sides — [Betterteam](https://www.betterteam.com/linkedin-services-marketplace)
- **Reviews:**
  - Providers request reviews in two ways: by sending invitations (up to 20 past clients) or by marking projects as complete.
  - Reviews can be turned on or off at any time and are public when on.
  - With Premium Business, ratings and the latest 4–5★ review show in the Showcase.
  - Source: [LinkedIn Help: Get reviews for your services](https://www.linkedin.com/help/linkedin/answer/a570564/)

### Inferences
- LinkedIn has moved from a capped, curated RFP model (ProFinder: 1 request → at most 5 proposals) to a directory plus direct request, with optional broadcast to similar providers. Being able to answer broadcast requests is now a paid perk.
- Because LinkedIn takes no part in contracting or payment, its trust rests on identity, network and reviews, not on transaction guarantees.
- For agro matchmaking, ProFinder's "≤5 proposals" cap is a well-known way to protect providers from bidding wars and to keep the client's choice manageable.

### Gaps
- I found no current official number for how many providers receive a shared request, or for how many proposals a client can receive.
- I found no official date for the ProFinder → Services Marketplace switch. Secondary sources only say Services Marketplace "replaced" it.
- I found no published conversion data for LinkedIn Services.

## 3. Verification and trust mechanisms

### Takeaway
Upwork has a full set of transaction-level trust tools: escrow for fixed-price work, hourly payment protection tied to the time tracker and Work Diary, verified billing on the client side, an ID-verified badge, JSS fed partly by private feedback, and badge tiers. LinkedIn relies on identity: the real profile, network, reviews and response badges. It offers no payment protection because payment happens off-platform.

### Cited Findings
- **Upwork, fixed-price:**
  - Clients fund each milestone into escrow before work starts.
  - Funds release when the client approves the work, or automatically after a 14-day review window.
  - Fixed-price protection applies only with clients whose payment method is verified.
  - Sources: [Upwork Help: Hourly Payment Protection (search extract)](https://support.upwork.com/hc/en-us/articles/211068288-How-Hourly-Payment-Protection-works-for-freelancers); [Upwork Scout 2026](https://upwork-scout.com/blog/how-to-get-paid-on-upwork)
- **Upwork, hourly protection:** coverage requires all of the following:
  - Hours logged with the Upwork desktop time tracker, which takes screenshots.
  - Memos in the Work Diary.
  - Fair activity levels.
  - Staying within the weekly limit.
  - Identity verification.
  - A client with a verified billing method.
  - Clients can watch progress through the Work Diary.
  - Source: [Upwork Help: How Hourly Payment Protection works](https://support.upwork.com/hc/en-us/articles/211068288-How-Hourly-Payment-Protection-works-for-freelancers)
- **Upwork, other trust signals:**
  - ID-verified badge — [Upwork Help: red flags/scams](https://support.upwork.com/hc/en-us/articles/35088484250003-Recognize-red-flags-and-avoid-scams)
  - JSS uses private as well as public feedback, plus contract outcomes — [Upwork JSS help](https://support.upwork.com/hc/en-us/articles/211068358-All-about-your-Job-Success-Score)
  - Badge tiers, including human-vetted Expert-Vetted (Section 1).
- **Why private feedback exists:**
  - oDesk (Upwork's predecessor) documented substantial "reputation inflation" in public ratings.
  - In response it added an experimental private feedback system in which buyers and sellers privately reported on their experiences alongside public feedback.
  - This is the lineage of JSS's private-feedback input.
  - Source: [Horton & Golden/Filippas, "Reputation Inflation in an Online Marketplace"](http://john-joseph-horton.com/papers/private_feedback.pdf)
- **LinkedIn:**
  - Real-identity profile.
  - Response time/rate badges (≤24h, ≥80%, 180-day average).
  - Reviews from invited past clients.
  - A connections filter that brings shared network to the surface.
  - No escrow; terms and payment are off-platform.
  - Sources: [LinkedIn Help topic](https://www.linkedin.com/help/linkedin/topic/a190032); [LinkedIn Help reviews](https://www.linkedin.com/help/linkedin/answer/a570564/); [Betterteam](https://www.betterteam.com/linkedin-services-marketplace)

### Inferences
- Upwork's model keeps transactions on-platform, which makes outcome-based reputation (JSS) possible because Upwork sees every contract end. LinkedIn cannot compute anything like JSS because it never sees the contract.
- Private feedback is the documented answer to rating inflation. A marketplace that relies only on public 1–5★ ratings will likely see them bunch near 5★.

### Gaps
- I couldn't get Upwork's exact ID-verification method (government ID plus video call) or a completion-rate metric from a primary page.
- I couldn't extract the specific inflation numbers from the Horton paper because the PDF could not be parsed.

## 4. Making first contact simple

### Takeaway
On Upwork, the client can post a job and get proposals, invite specific freelancers to a job, or buy a pre-scoped offering (Project Catalog) or a consultation. Since 2025, an AI agent (Uma Recruiter) builds a ranked shortlist and sends invites automatically, and since May 2026 it is available to all clients. LinkedIn keeps it to one button ("Request proposal/services"), a short pop-up questionnaire, an opt-in broadcast to similar providers, and free messaging regardless of connection degree.

### Cited Findings
- **Upwork engagement options:**
  - Post a job to the Talent Marketplace.
  - Buy pre-scoped Project Catalog offerings.
  - Book expert consultations.
  - Use Enterprise / Any Hire for complex programs.
  - Source: [Saleshive Upwork review 2026](https://saleshive.com/vendors/upwork) (secondary)
- **Uma Recruiter:**
  - Reviews freelancers for each job, builds a ranked shortlist, and invites the people it picks.
  - Launched in October 2025 for Business Plus, producing shortlists within 6 hours.
  - Moved to the Basic plan on 5 May 2026, so roughly 784k active clients now get an AI shortlist.
  - Uma "powers a majority of new client job posts" and raised successful matches on high-value projects by 8%.
  - It can run scored candidate interviews and generate contracts from video-meeting details.
  - Sources: [Upwork investor release](https://investors.upwork.com/news-releases/news-release-details/upwork-evolves-uma-ai-ai-work-agent-advances-human-ai); [Upwork blog: Uma Recruiter](https://www.upwork.com/blog/uma-recruiter-how-we-built-an-agentic-solution-to-talent-matching-and-hiring); [Reworked](https://www.reworked.co/talent-management/upworks-ai-agent-uma-now-conducts-job-interviews/); [memvers 2026 summary](https://memvers.com/blog/upwork-fiverr-ai-agents-marketplace-shift-2026). The primary pages timed out or returned 403. The figures come from search extracts and secondary sources, so verify them before quoting.
- **LinkedIn:**
  - "Request services"/"Request proposal" opens a pop-up questionnaire about the project.
  - The client can opt to share the request with additional providers.
  - "Find an expert" posts a request to the client's network.
  - Messaging is free regardless of connection degree.
  - Response-time/rate badges set expectations.
  - Sources: [LinkedIn Help: shopping](https://www.linkedin.com/help/linkedin/answer/a567616); [LinkedIn Pulse](https://www.linkedin.com/pulse/linkedin-services-marketplace-open-greg-cooper); [LinkedIn Help: provider](https://www.linkedin.com/help/linkedin/answer/a550345)

### Inferences
- The trend from 2025 to 2026 is that platforms take over the client's outreach: AI shortlists and auto-invites replace browsing and manual invites. Horton's experiment (Section 5) is the causal evidence that recommending candidates to invite raises hiring.
- For an agro marketplace, the pieces combine into one first-contact pattern:
  - A one-button request with 3–5 structured questions (LinkedIn).
  - An optional broadcast to similar providers.
  - A responsiveness badge.
  - A recommended shortlist to invite.

### Gaps
- I couldn't verify Upwork's current "Connects" pricing or how many proposals a job receives.
- I couldn't verify the consultation booking UI details.
- I couldn't confirm Upwork's "invite to job" limits.

## 5. Published research and platform data on what drives selection

### Takeaway
The strongest published evidence comes from economics field experiments on oDesk/Upwork:
- Prior on-platform experience and feedback strongly drive later hiring. In one experiment, giving newcomers one hire plus feedback roughly tripled their later earnings.
- Algorithmic "invite these candidates" recommendations raised fill rates by 20% in technical categories.
- Public ratings inflate over time, which is why private feedback and composite scores exist.

I found no NN/g or Baymard study specific to these two platforms within this budget.

### Cited Findings
- **Pallais (oDesk field experiment):**
  - 952 randomly selected contractors were hired and given performance feedback; 2,815 non-hired applicants served as controls.
  - Inexperienced workers who got a hire plus positive feedback almost tripled their relative income compared with controls.
  - Past on-platform experience is "an excellent predictor" of being hired.
  - Sources: [NBER w19525, Agrawal, Horton, Lacetera & Lyons, "Digitization and the Contract Labor Market"](https://www.nber.org/system/files/working_papers/w19525/w19525.pdf) (summarizing Pallais); [Agent-based model paper, Springer](https://link.springer.com/article/10.1007/s42001-020-00072-x)
- **Horton (Journal of Labor Economics; oDesk field experiment):**
  - Employers with technical vacancies who received algorithmic recruiting recommendations had a 20% higher fill rate than controls.
  - There was no evidence of crowd-out of non-recommended candidates.
  - Recommended recruits were positively selected and statistically indistinguishable from those employers recruit themselves.
  - Sources: [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2346486); [JOLE](https://www.journals.uchicago.edu/doi/abs/10.1086/689213)
- **Reputation inflation on oDesk:** public feedback grew more positive over time, which led to an experimental private-feedback channel — [Horton et al., "Reputation Inflation in an Online Marketplace"](http://john-joseph-horton.com/papers/private_feedback.pdf)
- **Time cues:** "Oblivion of Online Reputation: How Time Cues Improve Online Recruitment" studies how showing the recency of reputation affects recruitment. I saw only the title and did not read the findings — [arXiv 2005.06302](https://arxiv.org/pdf/2005.06302)
- **Upwork's own data:** Uma raised successful matches on high-value projects by 8% — [Upwork investor release](https://investors.upwork.com/news-releases/news-release-details/upwork-evolves-uma-ai-ai-work-agent-advances-human-ai) (via search extract)

### Inferences
- **Cold start is the main barrier.** Reputation drives hiring so strongly that newcomers are locked out. This is why Upwork has a "Rising Talent" badge for professionals without a JSS. An agro marketplace needs a similar newcomer signal: verified credentials, a vetting badge, or a first-job guarantee.
- **Recommendations help.** Recommending whom to invite measurably increases matches without hurting other candidates. This supports a "suggested professionals" list at request time.
- **Composite and private signals beat raw star averages,** because public stars inflate.

### Gaps
- I found no NN/g or Baymard article within budget that ranks which card signals (photo vs. rate vs. score vs. badge) most affect clicks on Upwork or LinkedIn.
- Upwork does not publish JSS weights or ranking-algorithm factors.
- I found no published LinkedIn data on Services conversion or on the effect of mutual connections on selection.
- Click-through or conversion numbers for specific badges (e.g., "Top Rated increases hire rate by X%") appear only in unverified freelancer blogs, so I omitted them.
