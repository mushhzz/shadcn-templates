import type { ActivityEvent, Company, Contact, Deal, Task } from "./types"

const DAY = 60 * 24

export const owners = ["Jane Doe", "Marcus Lee", "Priya Raman"]

export const companies: Company[] = [
  { id: "co_01", name: "Northwind", domain: "northwind.io", industry: "Logistics", size: "201-500", location: "Chicago, US" },
  { id: "co_02", name: "Lumen", domain: "lumen.co", industry: "Energy", size: "51-200", location: "Austin, US" },
  { id: "co_03", name: "Helio", domain: "helio.dev", industry: "Software", size: "11-50", location: "Berlin, DE" },
  { id: "co_04", name: "Brightline", domain: "brightline.com", industry: "Transport", size: "501-1000", location: "Miami, US" },
  { id: "co_05", name: "Vetra", domain: "vetra.app", industry: "Health", size: "11-50", location: "Toronto, CA" },
  { id: "co_06", name: "Quill", domain: "quill.so", industry: "Media", size: "51-200", location: "London, UK" },
  { id: "co_07", name: "Atlas Works", domain: "atlasworks.com", industry: "Manufacturing", size: "1000+", location: "Detroit, US" },
  { id: "co_08", name: "Fern", domain: "fernhq.com", industry: "Software", size: "1-10", location: "Sydney, AU" },
  { id: "co_09", name: "Stratus", domain: "stratus.fm", industry: "Media", size: "11-50", location: "Melbourne, AU" },
  { id: "co_10", name: "Meridian Labs", domain: "meridianlabs.com", industry: "Biotech", size: "201-500", location: "Boston, US" },
]

export const contacts: Contact[] = [
  { id: "ct_01", name: "Olivia Bennett", email: "olivia@northwind.io", phone: "+1 312 555 0141", title: "VP Operations", companyId: "co_01", owner: "Jane Doe", status: "customer", createdMinutesAgo: DAY * 400 },
  { id: "ct_02", name: "Rahul Mehta", email: "rahul@northwind.io", phone: "+1 312 555 0187", title: "Procurement Lead", companyId: "co_01", owner: "Jane Doe", status: "customer", createdMinutesAgo: DAY * 260 },
  { id: "ct_03", name: "Liam Carter", email: "liam@lumen.co", phone: "+1 512 555 0102", title: "CTO", companyId: "co_02", owner: "Marcus Lee", status: "customer", createdMinutesAgo: DAY * 320 },
  { id: "ct_04", name: "Ava Nguyen", email: "ava@helio.dev", phone: "+49 30 555 0199", title: "Founder", companyId: "co_03", owner: "Priya Raman", status: "lead", createdMinutesAgo: DAY * 6 },
  { id: "ct_05", name: "Noah Patel", email: "noah@brightline.com", phone: "+1 305 555 0133", title: "Director of IT", companyId: "co_04", owner: "Marcus Lee", status: "customer", createdMinutesAgo: DAY * 210 },
  { id: "ct_06", name: "Sophia Rossi", email: "sophia@vetra.app", phone: "+1 416 555 0177", title: "COO", companyId: "co_05", owner: "Jane Doe", status: "churned", createdMinutesAgo: DAY * 540 },
  { id: "ct_07", name: "Ethan Kim", email: "ethan@quill.so", phone: "+44 20 555 0155", title: "Head of Product", companyId: "co_06", owner: "Priya Raman", status: "customer", createdMinutesAgo: DAY * 700 },
  { id: "ct_08", name: "Grace Whitfield", email: "grace@quill.so", phone: "+44 20 555 0160", title: "Finance Manager", companyId: "co_06", owner: "Priya Raman", status: "lead", createdMinutesAgo: DAY * 12 },
  { id: "ct_09", name: "Isabella Moreau", email: "isabella@atlasworks.com", phone: "+1 313 555 0122", title: "Plant Manager", companyId: "co_07", owner: "Marcus Lee", status: "customer", createdMinutesAgo: DAY * 150 },
  { id: "ct_10", name: "Diego Alvarez", email: "diego@atlasworks.com", phone: "+1 313 555 0168", title: "IT Director", companyId: "co_07", owner: "Marcus Lee", status: "lead", createdMinutesAgo: DAY * 3 },
  { id: "ct_11", name: "Mason Okafor", email: "mason@fernhq.com", phone: "+61 2 5550 1188", title: "CEO", companyId: "co_08", owner: "Jane Doe", status: "lead", createdMinutesAgo: DAY * 2 },
  { id: "ct_12", name: "Mia Fischer", email: "mia@stratus.fm", phone: "+61 3 5550 1144", title: "Marketing Director", companyId: "co_09", owner: "Priya Raman", status: "customer", createdMinutesAgo: DAY * 260 },
  { id: "ct_13", name: "Charlotte Dubois", email: "charlotte@meridianlabs.com", phone: "+1 617 555 0190", title: "VP Research", companyId: "co_10", owner: "Jane Doe", status: "customer", createdMinutesAgo: DAY * 820 },
  { id: "ct_14", name: "Tomás Ferreira", email: "tomas@meridianlabs.com", phone: "+1 617 555 0112", title: "Lab Operations", companyId: "co_10", owner: "Jane Doe", status: "lead", createdMinutesAgo: DAY * 20 },
  { id: "ct_15", name: "Hannah Weiss", email: "hannah@lumen.co", phone: "+1 512 555 0176", title: "Engineering Manager", companyId: "co_02", owner: "Marcus Lee", status: "lead", createdMinutesAgo: DAY * 9 },
  { id: "ct_16", name: "Kenji Watanabe", email: "kenji@brightline.com", phone: "+1 305 555 0149", title: "Security Lead", companyId: "co_04", owner: "Marcus Lee", status: "customer", createdMinutesAgo: DAY * 95 },
  { id: "ct_17", name: "Amara Osei", email: "amara@helio.dev", phone: "+49 30 555 0134", title: "Head of Growth", companyId: "co_03", owner: "Priya Raman", status: "lead", createdMinutesAgo: DAY * 1 },
  { id: "ct_18", name: "Lucas Silva", email: "lucas@vetra.app", phone: "+1 416 555 0128", title: "Product Manager", companyId: "co_05", owner: "Jane Doe", status: "churned", createdMinutesAgo: DAY * 480 },
]

export const deals: Deal[] = [
  { id: "dl_01", title: "Northwind fleet renewal", companyId: "co_01", contactId: "ct_01", value: 84000, stage: "negotiation", owner: "Jane Doe", closeInMinutes: DAY * 12, createdMinutesAgo: DAY * 45 },
  { id: "dl_02", title: "Northwind warehouse add-on", companyId: "co_01", contactId: "ct_02", value: 18500, stage: "proposal", owner: "Jane Doe", closeInMinutes: DAY * 25, createdMinutesAgo: DAY * 14 },
  { id: "dl_03", title: "Lumen grid analytics", companyId: "co_02", contactId: "ct_03", value: 62000, stage: "won", owner: "Marcus Lee", closeInMinutes: -DAY * 8, createdMinutesAgo: DAY * 90 },
  { id: "dl_04", title: "Lumen engineering seats", companyId: "co_02", contactId: "ct_15", value: 9600, stage: "qualified", owner: "Marcus Lee", closeInMinutes: DAY * 30, createdMinutesAgo: DAY * 7 },
  { id: "dl_05", title: "Helio starter", companyId: "co_03", contactId: "ct_04", value: 4800, stage: "lead", owner: "Priya Raman", closeInMinutes: DAY * 40, createdMinutesAgo: DAY * 5 },
  { id: "dl_06", title: "Helio growth pilot", companyId: "co_03", contactId: "ct_17", value: 12000, stage: "lead", owner: "Priya Raman", closeInMinutes: DAY * 35, createdMinutesAgo: DAY * 1 },
  { id: "dl_07", title: "Brightline platform migration", companyId: "co_04", contactId: "ct_05", value: 145000, stage: "proposal", owner: "Marcus Lee", closeInMinutes: DAY * 20, createdMinutesAgo: DAY * 60 },
  { id: "dl_08", title: "Brightline security review", companyId: "co_04", contactId: "ct_16", value: 22000, stage: "won", owner: "Marcus Lee", closeInMinutes: -DAY * 20, createdMinutesAgo: DAY * 70 },
  { id: "dl_09", title: "Vetra re-engagement", companyId: "co_05", contactId: "ct_06", value: 15000, stage: "lost", owner: "Jane Doe", closeInMinutes: -DAY * 30, createdMinutesAgo: DAY * 100 },
  { id: "dl_10", title: "Quill newsroom rollout", companyId: "co_06", contactId: "ct_07", value: 38000, stage: "negotiation", owner: "Priya Raman", closeInMinutes: DAY * 9, createdMinutesAgo: DAY * 33 },
  { id: "dl_11", title: "Quill finance module", companyId: "co_06", contactId: "ct_08", value: 11000, stage: "qualified", owner: "Priya Raman", closeInMinutes: DAY * 28, createdMinutesAgo: DAY * 10 },
  { id: "dl_12", title: "Atlas Works plant sensors", companyId: "co_07", contactId: "ct_09", value: 210000, stage: "proposal", owner: "Marcus Lee", closeInMinutes: DAY * 45, createdMinutesAgo: DAY * 50 },
  { id: "dl_13", title: "Atlas Works IT consolidation", companyId: "co_07", contactId: "ct_10", value: 56000, stage: "lead", owner: "Marcus Lee", closeInMinutes: DAY * 60, createdMinutesAgo: DAY * 2 },
  { id: "dl_14", title: "Fern seed package", companyId: "co_08", contactId: "ct_11", value: 3600, stage: "qualified", owner: "Jane Doe", closeInMinutes: DAY * 14, createdMinutesAgo: DAY * 2 },
  { id: "dl_15", title: "Stratus campaign suite", companyId: "co_09", contactId: "ct_12", value: 27500, stage: "won", owner: "Priya Raman", closeInMinutes: -DAY * 3, createdMinutesAgo: DAY * 40 },
  { id: "dl_16", title: "Meridian research cloud", companyId: "co_10", contactId: "ct_13", value: 98000, stage: "negotiation", owner: "Jane Doe", closeInMinutes: DAY * 18, createdMinutesAgo: DAY * 80 },
  { id: "dl_17", title: "Meridian lab ops", companyId: "co_10", contactId: "ct_14", value: 14500, stage: "qualified", owner: "Jane Doe", closeInMinutes: DAY * 22, createdMinutesAgo: DAY * 15 },
  { id: "dl_18", title: "Vetra product analytics", companyId: "co_05", contactId: "ct_18", value: 8000, stage: "lost", owner: "Jane Doe", closeInMinutes: -DAY * 60, createdMinutesAgo: DAY * 120 },
]

export const tasks: Task[] = [
  { id: "tk_01", title: "Send revised proposal to Northwind", dueInMinutes: -DAY * 1, done: false, priority: "high", owner: "Jane Doe", dealId: "dl_01", contactId: "ct_01" },
  { id: "tk_02", title: "Call Ava about pilot scope", dueInMinutes: 60 * 3, done: false, priority: "medium", owner: "Priya Raman", contactId: "ct_04", dealId: "dl_05" },
  { id: "tk_03", title: "Prepare security questionnaire", dueInMinutes: 60 * 6, done: false, priority: "high", owner: "Marcus Lee", dealId: "dl_07" },
  { id: "tk_04", title: "Follow up on Quill contract redlines", dueInMinutes: DAY * 1, done: false, priority: "high", owner: "Priya Raman", dealId: "dl_10", contactId: "ct_07" },
  { id: "tk_05", title: "Schedule onboarding for Stratus", dueInMinutes: DAY * 2, done: false, priority: "medium", owner: "Priya Raman", dealId: "dl_15", contactId: "ct_12" },
  { id: "tk_06", title: "Intro call with Diego (Atlas Works IT)", dueInMinutes: DAY * 3, done: false, priority: "medium", owner: "Marcus Lee", contactId: "ct_10", dealId: "dl_13" },
  { id: "tk_07", title: "Draft pricing for Meridian lab ops", dueInMinutes: DAY * 4, done: false, priority: "low", owner: "Jane Doe", dealId: "dl_17" },
  { id: "tk_08", title: "Send case study to Hannah", dueInMinutes: DAY * 9, done: false, priority: "low", owner: "Marcus Lee", contactId: "ct_15" },
  { id: "tk_09", title: "Quarterly review with Northwind", dueInMinutes: DAY * 16, done: false, priority: "medium", owner: "Jane Doe", contactId: "ct_01" },
  { id: "tk_10", title: "Log Lumen kickoff notes", dueInMinutes: -DAY * 3, done: true, priority: "low", owner: "Marcus Lee", dealId: "dl_03" },
  { id: "tk_11", title: "Reply to Mason's pricing question", dueInMinutes: -60 * 5, done: false, priority: "high", owner: "Jane Doe", contactId: "ct_11", dealId: "dl_14" },
  { id: "tk_12", title: "Confirm Brightline procurement contact", dueInMinutes: DAY * 6, done: false, priority: "medium", owner: "Marcus Lee", dealId: "dl_07" },
]

export const activity: ActivityEvent[] = [
  { id: "ev_01", type: "email", actor: "Jane Doe", body: "Sent revised terms for the fleet renewal; asked for a decision by the 20th.", minutesAgo: 35, contactId: "ct_01", dealId: "dl_01" },
  { id: "ev_02", type: "call", actor: "Priya Raman", body: "Discovery call with Amara. Growth team wants attribution reporting first.", minutesAgo: 60 * 2, contactId: "ct_17", dealId: "dl_06" },
  { id: "ev_03", type: "meeting", actor: "Marcus Lee", body: "Architecture review with Brightline IT. Migration window is Q4.", minutesAgo: 60 * 5, contactId: "ct_05", dealId: "dl_07" },
  { id: "ev_04", type: "note", actor: "Jane Doe", body: "Meridian legal wants a DPA addendum before signature.", minutesAgo: 60 * 8, contactId: "ct_13", dealId: "dl_16" },
  { id: "ev_05", type: "email", actor: "Priya Raman", body: "Shared newsroom rollout plan; Ethan looping in finance.", minutesAgo: 60 * 26, contactId: "ct_07", dealId: "dl_10" },
  { id: "ev_06", type: "call", actor: "Jane Doe", body: "Mason asked about annual billing discount.", minutesAgo: 60 * 30, contactId: "ct_11", dealId: "dl_14" },
  { id: "ev_07", type: "meeting", actor: "Marcus Lee", body: "Plant walkthrough at Atlas Works. 3 lines need sensors in phase one.", minutesAgo: 60 * 50, contactId: "ct_09", dealId: "dl_12" },
  { id: "ev_08", type: "note", actor: "Marcus Lee", body: "Lumen closed-won. Kickoff scheduled.", minutesAgo: DAY * 8, contactId: "ct_03", dealId: "dl_03" },
  { id: "ev_09", type: "email", actor: "Jane Doe", body: "Rahul confirmed budget for the warehouse add-on.", minutesAgo: DAY * 3, contactId: "ct_02", dealId: "dl_02" },
  { id: "ev_10", type: "call", actor: "Priya Raman", body: "Stratus onboarding preferences captured.", minutesAgo: DAY * 2, contactId: "ct_12", dealId: "dl_15" },
  { id: "ev_11", type: "note", actor: "Jane Doe", body: "Vetra churned after re-org. Revisit in six months.", minutesAgo: DAY * 30, contactId: "ct_06", dealId: "dl_09" },
  { id: "ev_12", type: "email", actor: "Marcus Lee", body: "Sent Hannah the engineering seats quote.", minutesAgo: DAY * 4, contactId: "ct_15", dealId: "dl_04" },
]
