import type { ChatMessage, ChatUser, Conversation } from "./types"

export const CURRENT_USER_ID = "u_me"

export const users: ChatUser[] = [
  { id: "u_me", name: "Jane Doe", handle: "jane", title: "Head of Operations", presence: "online", timezone: "America/Chicago" },
  { id: "u_sam", name: "Sam Rivera", handle: "sam", title: "Product Designer", presence: "online", timezone: "America/Los_Angeles" },
  { id: "u_priya", name: "Priya Raman", handle: "priya", title: "Engineering Manager", presence: "away", timezone: "Asia/Kolkata" },
  { id: "u_marcus", name: "Marcus Lee", handle: "marcus", title: "Account Executive", presence: "online", timezone: "America/New_York" },
  { id: "u_ava", name: "Ava Nguyen", handle: "ava", title: "Founder, Helio", presence: "offline", timezone: "Europe/Berlin" },
  { id: "u_tom", name: "Tom Becker", handle: "tom", title: "Support Lead", presence: "online", timezone: "Europe/London" },
  { id: "u_lena", name: "Lena Fischer", handle: "lena", title: "Data Analyst", presence: "offline", timezone: "Europe/Berlin" },
  { id: "u_kenji", name: "Kenji Watanabe", handle: "kenji", title: "Security Engineer", presence: "away", timezone: "Asia/Tokyo" },
  { id: "u_grace", name: "Grace Whitfield", handle: "grace", title: "Finance Manager", presence: "online", timezone: "Europe/London" },
  { id: "u_diego", name: "Diego Alvarez", handle: "diego", title: "IT Director, Atlas Works", presence: "offline", timezone: "America/Detroit" },
]

export const conversations: Conversation[] = [
  { id: "c_design", kind: "group", name: "Design review", participantIds: ["u_me", "u_sam", "u_priya", "u_lena"], unread: 2, pinned: true, muted: false },
  { id: "c_sam", kind: "dm", participantIds: ["u_me", "u_sam"], unread: 1, pinned: true, muted: false },
  { id: "c_launch", kind: "group", name: "Q4 launch", participantIds: ["u_me", "u_marcus", "u_priya", "u_tom", "u_grace"], unread: 0, pinned: false, muted: false },
  { id: "c_marcus", kind: "dm", participantIds: ["u_me", "u_marcus"], unread: 0, pinned: false, muted: false },
  { id: "c_ava", kind: "dm", participantIds: ["u_me", "u_ava"], unread: 0, pinned: false, muted: false },
  { id: "c_support", kind: "group", name: "Support escalations", participantIds: ["u_me", "u_tom", "u_kenji"], unread: 5, pinned: false, muted: true },
  { id: "c_tom", kind: "dm", participantIds: ["u_me", "u_tom"], unread: 0, pinned: false, muted: false },
  { id: "c_kenji", kind: "dm", participantIds: ["u_me", "u_kenji"], unread: 0, pinned: false, muted: false },
  { id: "c_diego", kind: "dm", participantIds: ["u_me", "u_diego"], unread: 0, pinned: false, muted: false },
]

const H = 60
const D = 60 * 24

export const messages: ChatMessage[] = [
  // Design review
  { id: "m_01", conversationId: "c_design", authorId: "u_sam", body: "Pushed the new sidebar states to Figma. Collapsed mode finally has proper icon spacing.", minutesAgo: 95 },
  { id: "m_02", conversationId: "c_design", authorId: "u_priya", body: "Nice. Does it handle the badge count when collapsed?", minutesAgo: 88 },
  { id: "m_03", conversationId: "c_design", authorId: "u_sam", body: "Badge hides in icon mode, shows again on hover tooltip.", minutesAgo: 86 },
  { id: "m_05", conversationId: "c_design", authorId: "u_me", body: "Love it. Can we review dark mode contrast on the muted labels tomorrow?", minutesAgo: 70, status: "read" },
  { id: "m_06", conversationId: "c_design", authorId: "u_lena", body: "I pulled numbers on which dashboards people actually open. Sharing in the doc.", minutesAgo: 12 },
  { id: "m_07", conversationId: "c_design", authorId: "u_sam", body: "Perfect timing, that decides the default landing tab.", minutesAgo: 9 },
  // Sam DM
  { id: "m_10", conversationId: "c_sam", authorId: "u_sam", body: "Morning! Did the deploy go out?", minutesAgo: 3 * H },
  { id: "m_11", conversationId: "c_sam", authorId: "u_sam", body: "Dashboard looks a bit off on mobile.", minutesAgo: 3 * H - 1 },
  { id: "m_12", conversationId: "c_sam", authorId: "u_me", body: "Yes, shipped at 8:40.\nLooking at the mobile issue now.", minutesAgo: 3 * H - 5, status: "read" },
  { id: "m_13", conversationId: "c_sam", authorId: "u_sam", body: "Great, thanks! The chart labels overlapped on my phone.", minutesAgo: 2 * H },
  { id: "m_14", conversationId: "c_sam", authorId: "u_me", body: "Fixed with a min tick gap. Want to check on your device?", minutesAgo: 2 * H - 10, status: "delivered" },
  { id: "m_15", conversationId: "c_sam", authorId: "u_sam", body: "Looks perfect now 🙌", minutesAgo: 4 },
  // Q4 launch
  { id: "m_20", conversationId: "c_launch", authorId: "u_marcus", body: "Pipeline review moved to Thursday. Meridian wants a DPA before they sign.", minutesAgo: D + 2 * H },
  { id: "m_21", conversationId: "c_launch", authorId: "u_grace", body: "Legal has the addendum template ready. I'll send it today.", minutesAgo: D + H },
  { id: "m_22", conversationId: "c_launch", authorId: "u_me", body: "Thanks both. Priya, are we still good on the API rate limit changes for launch?", minutesAgo: D, status: "read" },
  { id: "m_23", conversationId: "c_launch", authorId: "u_priya", body: "Yes. Shipping behind a flag Monday, on by default the following week.", minutesAgo: D - 30 },
  { id: "m_24", conversationId: "c_launch", authorId: "u_tom", body: "I'll draft the support macros for the new limits.", minutesAgo: 20 * H },
  // Marcus DM
  { id: "m_30", conversationId: "c_marcus", authorId: "u_marcus", body: "Atlas Works wants a plant walkthrough next week. Can you join?", minutesAgo: D + 5 * H },
  { id: "m_31", conversationId: "c_marcus", authorId: "u_me", body: "Tuesday afternoon works.", minutesAgo: D + 4 * H, status: "read" },
  { id: "m_32", conversationId: "c_marcus", authorId: "u_marcus", body: "Booked. Diego will meet us at the north gate.", minutesAgo: D + 3 * H },
  // Ava DM
  { id: "m_40", conversationId: "c_ava", authorId: "u_ava", body: "Hi Jane, we're evaluating the growth pilot. Could you share pricing for 25 seats?", minutesAgo: 2 * D },
  { id: "m_41", conversationId: "c_ava", authorId: "u_me", body: "Of course. Sending a quote and a sandbox invite this afternoon.", minutesAgo: 2 * D - 2 * H, status: "read" },
  { id: "m_42", conversationId: "c_ava", authorId: "u_ava", body: "Received, thank you. We'll review with the team.", minutesAgo: 2 * D - 6 * H },
  // Support escalations
  { id: "m_50", conversationId: "c_support", authorId: "u_tom", body: "Harbor's payment failed again. Card declined twice.", minutesAgo: 6 * H },
  { id: "m_51", conversationId: "c_support", authorId: "u_kenji", body: "Not a fraud flag on our side. Their bank is blocking recurring charges.", minutesAgo: 5 * H },
  { id: "m_52", conversationId: "c_support", authorId: "u_tom", body: "I'll email their finance contact with the invoice link.", minutesAgo: 5 * H - 20 },
  { id: "m_53", conversationId: "c_support", authorId: "u_kenji", body: "Also: two users reported SSO loops this morning. Investigating.", minutesAgo: 3 * H },
  { id: "m_54", conversationId: "c_support", authorId: "u_tom", body: "Root cause was the clock skew on the IdP. Resolved.", minutesAgo: 40 },
  // Tom DM
  { id: "m_60", conversationId: "c_tom", authorId: "u_tom", body: "Can you approve the new macro set when you have a minute?", minutesAgo: 3 * D },
  { id: "m_61", conversationId: "c_tom", authorId: "u_me", body: "Approved. Nice work on the tone.", minutesAgo: 3 * D - H, status: "read" },
  // Kenji DM
  { id: "m_70", conversationId: "c_kenji", authorId: "u_kenji", body: "Security review for Brightline is signed off.", minutesAgo: 4 * D },
  { id: "m_71", conversationId: "c_kenji", authorId: "u_me", body: "Excellent, thank you.", minutesAgo: 4 * D - 30, status: "read" },
  // Diego DM
  { id: "m_80", conversationId: "c_diego", authorId: "u_diego", body: "Looking forward to the walkthrough. Bring steel-toe boots.", minutesAgo: 5 * D },
]
