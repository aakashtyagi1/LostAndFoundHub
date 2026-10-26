// In-Memory Fallback Store for Lost & Found Hub
// Used when MongoDB is offline, unconfigured (e.g. cold Vercel deployments), or unreachable.
// Guarantees 0ms latency, zero buffering timeouts, and 200 OK responses.

import { defaultItems } from "./seed.js";

let items = defaultItems.map((item, idx) => ({
  id: `item-${idx + 1}`,
  _id: `65d00000000000000000000${idx + 1}`,
  ...item,
  createdAt: new Date(Date.now() - idx * 3600000).toISOString(),
  updatedAt: new Date(Date.now() - idx * 3600000).toISOString(),
}));

let users = [
  {
    id: "user-admin",
    _id: "65d000000000000000000099",
    name: "Campus Administrator",
    email: "admin@lostfound.com",
    password: "admin123",
    phone: "+91 99999 88888",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
];

let claims = [
  {
    id: "claim-1",
    _id: "65d000000000000000000088",
    itemId: "item-1",
    itemName: "Black Leather Wallet",
    claimantName: "Campus Admin",
    claimantEmail: "admin@lostfound.com",
    claimantPhone: "+91 99999 88888",
    ownerEmail: "rahul.sharma@campus.edu",
    reason: "Matched official college student ID card inside wallet.",
    proofImageUrl: "",
    status: "Pending",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

let notifications = [
  {
    id: "notif-1",
    _id: "65d000000000000000000077",
    recipientEmail: "admin@lostfound.com",
    title: "Welcome to Lost & Found Hub!",
    message: "Your campus recovery portal is active. You can browse, report, and manage items.",
    type: "success",
    read: false,
    createdAt: new Date().toISOString(),
  },
];

let nextItemId = 100;
let nextClaimId = 100;
let nextNotifId = 100;
let nextUserId = 100;

export const memoryStore = {
  // Items
  getItems(filters = {}) {
    let result = [...items];

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (i) =>
          (i.name && i.name.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.location && i.location.toLowerCase().includes(q)) ||
          (i.category && i.category.toLowerCase().includes(q))
      );
    }

    if (filters.category && filters.category !== "All Categories") {
      result = result.filter((i) => i.category === filters.category);
    }

    if (filters.location && filters.location !== "Any Location") {
      result = result.filter((i) => i.location === filters.location);
    }

    if (filters.type && filters.type !== "All") {
      result = result.filter((i) => i.type === filters.type);
    }

    if (filters.status && filters.status !== "All") {
      result = result.filter((i) => i.status === filters.status);
    }

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getItemById(id) {
    if (!id) return null;
    const sId = String(id);
    return items.find((i) => String(i.id) === sId || String(i._id) === sId) || null;
  },

  getMatches(id) {
    const item = this.getItemById(id);
    if (!item) {
      // If item not found by specific id, return general matches based on whatever is available
      return { item: null, matches: [] };
    }

    const oppositeType = item.type === "Lost" ? "Found" : "Lost";
    const keywords = (item.name || "")
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const matches = items.filter((other) => {
      const otherId = String(other.id || other._id);
      const curId = String(item.id || item._id);
      if (otherId === curId) return false;
      if (other.type !== oppositeType) return false;
      if (other.status !== "Active") return false;

      const sameCategory = other.category === item.category;
      const otherName = (other.name || "").toLowerCase();
      const nameMatch = keywords.some((kw) => otherName.includes(kw));

      return sameCategory || nameMatch;
    }).slice(0, 6);

    return { item, matches };
  },

  createItem(itemData) {
    const idNum = ++nextItemId;
    const newItem = {
      id: `item-${idNum}`,
      _id: `65d000000000000000000${idNum}`,
      status: "Active",
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...itemData,
    };
    items.unshift(newItem);
    return newItem;
  },

  updateItem(id, updateData) {
    const idx = items.findIndex(
      (i) => String(i.id) === String(id) || String(i._id) === String(id)
    );
    if (idx === -1) return null;
    items[idx] = {
      ...items[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    return items[idx];
  },

  deleteItem(id) {
    const initialLen = items.length;
    items = items.filter(
      (i) => String(i.id) !== String(id) && String(i._id) !== String(id)
    );
    return items.length < initialLen;
  },

  // Claims
  getClaims(email, role) {
    if (role === "admin") {
      return [...claims].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (!email) return [];
    const norm = email.trim().toLowerCase();
    return claims
      .filter(
        (c) =>
          (c.claimantEmail && c.claimantEmail.toLowerCase() === norm) ||
          (c.ownerEmail && c.ownerEmail.toLowerCase() === norm)
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createClaim(claimData) {
    const idNum = ++nextClaimId;
    const newClaim = {
      id: `claim-${idNum}`,
      _id: `65d000000000000000000${idNum}`,
      status: "Pending",
      createdAt: new Date().toISOString(),
      ...claimData,
    };
    claims.unshift(newClaim);
    return newClaim;
  },

  updateClaimStatus(id, status) {
    const claim = claims.find(
      (c) => String(c.id) === String(id) || String(c._id) === String(id)
    );
    if (!claim) return null;
    claim.status = status;
    return claim;
  },

  // Notifications
  getNotifications(email) {
    if (!email) return [];
    const norm = email.trim().toLowerCase();
    return notifications
      .filter((n) => n.recipientEmail && n.recipientEmail.toLowerCase() === norm)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createNotification(notifData) {
    const idNum = ++nextNotifId;
    const newNotif = {
      id: `notif-${idNum}`,
      _id: `65d000000000000000000${idNum}`,
      read: false,
      createdAt: new Date().toISOString(),
      ...notifData,
    };
    notifications.unshift(newNotif);
    return newNotif;
  },

  markNotificationRead(id) {
    const notif = notifications.find(
      (n) => String(n.id) === String(id) || String(n._id) === String(id)
    );
    if (!notif) return null;
    notif.read = true;
    return notif;
  },

  markAllNotificationsRead(email) {
    if (!email) return 0;
    const norm = email.trim().toLowerCase();
    let count = 0;
    notifications.forEach((n) => {
      if (n.recipientEmail && n.recipientEmail.toLowerCase() === norm) {
        n.read = true;
        count++;
      }
    });
    return count;
  },

  deleteNotification(id) {
    const initialLen = notifications.length;
    notifications = notifications.filter(
      (n) => String(n.id) !== String(id) && String(n._id) !== String(id)
    );
    return notifications.length < initialLen;
  },

  // Admin Stats
  getAdminStats() {
    const totalItems = items.length;
    const lostCount = items.filter((i) => i.type === "Lost").length;
    const foundCount = items.filter((i) => i.type === "Found").length;
    const activeCount = items.filter((i) => i.status === "Active").length;
    const claimedCount = items.filter((i) =>
      ["Claimed", "Returned", "Resolved"].includes(i.status)
    ).length;

    const totalClaims = claims.length;
    const pendingClaims = claims.filter((c) => c.status === "Pending").length;
    const approvedClaims = claims.filter((c) => c.status === "Approved").length;

    const totalUsers = users.length;

    return {
      totalItems,
      lostCount,
      foundCount,
      activeCount,
      claimedCount,
      totalClaims,
      pendingClaims,
      approvedClaims,
      totalUsers,
    };
  },

  // Users
  getUsers() {
    return users.map(({ password, ...u }) => u);
  },

  findUserByEmail(email) {
    if (!email) return null;
    const norm = email.trim().toLowerCase();
    return users.find((u) => u.email && u.email.toLowerCase() === norm) || null;
  },

  createUser(userData) {
    const idNum = ++nextUserId;
    const newUser = {
      id: `user-${idNum}`,
      _id: `65d000000000000000000${idNum}`,
      createdAt: new Date().toISOString(),
      ...userData,
    };
    users.push(newUser);
    return newUser;
  },

  deleteUser(id) {
    const initialLen = users.length;
    users = users.filter(
      (u) => String(u.id) !== String(id) && String(u._id) !== String(id)
    );
    return users.length < initialLen;
  },
};
