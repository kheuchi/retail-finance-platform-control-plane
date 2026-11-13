/** One narrative shared by the architecture, landscape, search and documentation images. */
export type Version = 'built' | 'target';
export type StepId = 'request' | 'check' | 'plan' | 'evidence' | 'draft' | 'validate' | 'approve' | 'deliver';
export interface Stage {
  id: StepId; title: string; actor: string; summary: string; input: string; output: string;
  calls: string[]; detail: string; stop: string; addition: string; targetCalls: string[];
}
export const STAGES: Stage[] = [
  {id:'request', title:'Make a request', actor:'Controller',
   summary:'Choose the close month and ask for an explanation of revenue, margin, exceptions and the forecast.',
   input:'“Draft the August 2026 month-end commentary.”', output:'A request for one close month.',
   calls:['Controller','Start agent run'], detail:'In the demonstration, the controller starts a run. There is no production chat portal. The agent runs on Vertex AI Agent Engine in europe-west1 with Gemini on an EU endpoint.',
   stop:'A request is not permission to send a report or change the accounts.',
   addition:'An authenticated finance portal captures the month, audience and request ID. Proposed; not implemented.',
   targetCalls:['Controller','Finance portal + company sign-in','Request ID']},
  {id:'check', title:'Check access and readiness', actor:'Application checks',
   summary:'Confirm the agent may use its tools and that the finance data passed the quality checks.',
   input:'The close month and the agent’s identity.', output:'Certified data is available, or the run stops.',
   calls:['Agent identity','Managed MCP','gold_certification_status'],
   detail:'Databricks OAuth identifies the agent. It has EXECUTE permission on seven Unity Catalog functions: certification plus six finance functions. It has no direct table access. Certification is checked by code before analysis.',
   stop:'Uncertified data stops the run. A tool outside the identity’s grants is denied.',
   addition:'Carry the user’s identity and allowed scope through the gateway. Check period freshness as well as certification. Proposed; not implemented.',
   targetCalls:['User + agent identity','Policy gateway','Certification + freshness check']},
  {id:'plan', title:'Plan the investigation', actor:'Agent + language model',
   summary:'Decide which evidence is needed and divide the work between reading, triage and writing.',
   input:'An authorised request and certified data.', output:'A plan of read-only tool calls.',
   calls:['Supervisor agent','Gemini EU','Writer · triage · distributor'],
   detail:'Deep Agents uses a supervisor and three sub-agents. The model chooses tools and organises the explanation. It does not calculate the authoritative finance figures. This is the overview order; the actual agent may repeat evidence reads while drafting.',
   stop:'A plan cannot grant new permissions or bypass approval.',
   addition:'Route model calls through a model gateway with request budgets, timeouts and bounded retries. Keep the same investigation role. Proposed; not implemented.',
   targetCalls:['Supervisor agent','Model gateway','Approved EU model + bounded plan']},
  {id:'evidence', title:'Retrieve trusted evidence', actor:'Read-only tools + data platform',
   summary:'Read the checked totals, budget variances, alerts, reconciliation exceptions and forecast.',
   input:'The tool calls chosen for this month.', output:'Finance facts and references returned to the agent.',
   calls:['Agent tool call','Databricks managed MCP','Unity Catalog function','SQL warehouse','Certified Gold + ML results'],
   detail:'The functions execute with their defined owner rights on the SQL warehouse. The agent receives aggregates, store-level results and cashier case counts, never employee-level scores. Data and ML results were prepared before this request; the agent does not rerun Bronze → Silver → Gold.',
   stop:'A failed or unavailable tool is a failed read, not evidence for an invented answer.',
   addition:'Keep these finance tools. Add a scoped search over accounting policies only when the request needs it; return document citations and apply the same access policy. Proposed; not implemented.',
   targetCalls:['Agent tool call','Policy gateway','Finance tools · optional policy search','Certified Gold + ML · approved documents']},
  {id:'draft', title:'Write a cited draft', actor:'Agent + language model',
   summary:'Turn the returned facts into commentary for the requested audience, with references to the evidence.',
   input:'Tool results and the investigation plan.', output:'Draft commentary, still unapproved.',
   calls:['Evidence returned','Writer + Gemini EU','Draft per audience'],
   detail:'The demonstrated August close produced three drafts. The language model writes the explanation; the finance tools supply the figures. A draft is a proposal and can require more evidence or editing.',
   stop:'An unapproved draft stays inside the review process.',
   addition:'Store a versioned evidence bundle with each draft so reviewers can inspect the exact data and policy versions. Proposed; not implemented.',
   targetCalls:['Versioned evidence bundle','Writer + approved EU model','Versioned draft']},
  {id:'validate', title:'Check the draft', actor:'Deterministic validator',
   summary:'Check the figures against the tool results before accepting the draft for review.',
   input:'The draft and its supporting tool results.', output:'A checked draft, or a rejection to investigate.',
   calls:['submit_draft','AgentCore Gateway','Lambda figure check','Draft storage'],
   detail:'The AWS channel Lambda checks figures and records the draft. This control sits outside the model. Matching figures is not a proof that the explanation or interpretation is correct; human review is still required.',
   stop:'A figure not supported by the tool results is rejected. Nothing is delivered here.',
   addition:'Validate citation coverage, evidence freshness and the approved output schema; attach an evaluation result to the draft. Proposed; not implemented.',
   targetCalls:['Draft + evidence bundle','Figure · citation · freshness checks','Review queue']},
  {id:'approve', title:'Get human approval', actor:'Financial controller',
   summary:'A person reads the draft and decides whether it is suitable to send.',
   input:'The checked draft and its evidence.', output:'An explicit approval, or a draft left waiting.',
   calls:['Controller reads draft','Approval row','finance.agent.approvals'],
   detail:'The demonstration represents review with an approval row written by a controller in the SQL editor. The notifier and the agent cannot approve. One of the three August drafts was approved; the other two remained waiting.',
   stop:'No approval means no send. The model cannot approve its own work.',
   addition:'Use a review UI with edit/reject actions, immutable draft versions and approvals bound to the exact version and audience. Proposed; not implemented.',
   targetCalls:['Controller review UI','Approve · edit · reject','Approval bound to draft version']},
  {id:'deliver', title:'Deliver the approved result', actor:'Controlled send tool',
   summary:'Check approval again, then distribute only the approved commentary.',
   input:'A draft with explicit controller approval.', output:'An approved message and published commentary.',
   calls:['Next agent run: send_approved','Gateway + Lambda approval check','SES email + gold.close_commentary'],
   detail:'The demonstrated send used SES email and published to gold.close_commentary. Power BI, Teams, ServiceNow and the CFO pack are intended consumers or simulated edges; they are not connected production integrations. The agent never posts journal entries, moves money or approves payments.',
   stop:'The send tool refuses unapproved drafts. It cannot post to the ledger or execute payments.',
   addition:'Add approved channel connectors, duplicate-send protection, delivery receipts and retry handling. Approval remains mandatory. Proposed; not implemented.',
   targetCalls:['Approved draft version','Delivery policy + duplicate check','Approved channel + delivery receipt']},
];
export const PREPARATION = [
  ['Source files','Synthetic ERP, tills, budgets and reference data'],
  ['Bronze → Silver','Preserve raw files; type, deduplicate and quarantine'],
  ['Certified Gold','Reconcile the books and run quality gates'],
  ['ML results','Fraud scores, margin alerts and the forecast'],
];
export const SUPPORT = [
  {id:'identity',title:'Identity and credentials',built:'Dedicated agent and notifier identities; short-lived cloud federation. Databricks OAuth clients remain in GCP Secret Manager and AWS Secrets Manager with manual rotation.',target:'Proposed: propagate the user’s scope and replace manually rotated Databricks secrets with supported federation. Credential stores support calls; they are not investigation steps.'},
  {id:'network',title:'Hosting and network',built:'Agent: Google europe-west1. Finance platform: AWS eu-central-1 + Databricks. Cross-cloud tool calls use HTTPS. Classic clusters use PrivateLink; the paid interface endpoints were deleted on 2026-10-17.',target:'Proposed: approved EU hosting and private connectivity where supported, with policy on each allowed route. This design does not assert that the runtime has moved back to AWS.'},
  {id:'observe',title:'Monitoring and evaluation',built:'Cloud Logging, agent run output, quality results, ML drift and cloud audit logs exist. End-to-end agent tracing and failure/cost alerts remain gaps (story 6.4).',target:'Proposed: one request trace through model and tool calls, evaluations of figures and citations, alerts with an owner, and cost per request. No monitoring stack has been deployed by this redesign.'},
  {id:'cost',title:'Cost and operations',built:'AWS budget: USD 50/month with alerts, not a hard spending cap. Small compute and auto-stop limit waste. The platform is paused; restoring paid endpoints requires the owner’s go.',target:'Proposed: per-request model/tool budgets, rate limits, operational ownership and release gates. Budgets and estimates are not guarantees of a cloud billing cap.'},
];
export const VIEWS = [
  ['big','Request journey'],['flow','Step by step'],['simple','At a glance'],['hld','Components in order'],
  ['lld','Inside each stage'],['net','Connections'],['obs','Monitoring'],['eval','Checks'],['sec','Access'],['more','Cost & scope'],
] as const;
export function validateJourney() {
  if(STAGES.length!==8 || new Set(STAGES.map(s=>s.id)).size!==8) throw new Error('Journey must have eight unique stages');
  for(const s of STAGES) if(!s.calls.length || !s.targetCalls.length || !s.addition.includes('not implemented')) throw new Error(`Incomplete stage: ${s.id}`);
}
validateJourney();
