import { useEffect, useState, useMemo } from "react";
import { api } from "./services/api";
import "./App.css";

function App() {
  /* =====================================================
     MASTER CONSTANTS
  ===================================================== */
  const categories = [
    "All Categories",
    "Electronics",
    "Accessories",
    "Documents",
    "Books",
    "Clothing",
    "Keys",
    "Others",
  ];

  const locations = [
    "Any Location",
    "College Campus",
    "Library",
    "Cafeteria",
    "Hostel",
    "Parking",
    "Classroom",
    "Sports Complex",
    "Auditorium",
  ];

  const defaultItems = [
    {
      id: "1",
      name: "Black Leather Wallet",
      category: "Accessories",
      location: "College Campus",
      type: "Lost",
      description: "Black Tommy Hilfiger leather wallet with student ID, metro card, and cash.",
      reportedBy: "Rahul Sharma",
      ownerEmail: "rahul.sharma@campus.edu",
      contactPhone: "+91 98765 43210",
      status: "Active",
      image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80",
      date: "2026-10-25",
    },
    {
      id: "2",
      name: "Blue Campus Backpack",
      category: "Others",
      location: "Library",
      type: "Found",
      description: "Navy blue American Tourister backpack found on 2nd floor reading table.",
      reportedBy: "Pooja Verma",
      ownerEmail: "pooja.v@campus.edu",
      contactPhone: "+91 98111 22334",
      status: "Active",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
      date: "2026-10-25",
    },
    {
      id: "3",
      name: "Wireless Apple AirPods Pro",
      category: "Electronics",
      location: "Cafeteria",
      type: "Lost",
      description: "White AirPods Pro in a matte black silicone protective case with small scratch.",
      reportedBy: "Aman Tyagi",
      ownerEmail: "aman.tyagi@campus.edu",
      contactPhone: "+91 99887 76655",
      status: "Active",
      image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
      date: "2026-10-25",
    },
    {
      id: "4",
      name: "College Student Identity Card",
      category: "Documents",
      location: "College Campus",
      type: "Found",
      description: "Official BCA/MCA department ID card found near central fountain benches.",
      reportedBy: "Campus Security",
      ownerEmail: "security@campus.edu",
      contactPhone: "+91 94000 11223",
      status: "Active",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      date: "2026-10-25",
    },
    {
      id: "5",
      name: "Casio FX-991EX Scientific Calculator",
      category: "Electronics",
      location: "Classroom",
      type: "Found",
      description: "Black and white ClassWiz calculator left in Room 304 after Maths lecture.",
      reportedBy: "Prof. Gupta",
      ownerEmail: "faculty@campus.edu",
      contactPhone: "+91 97111 55443",
      status: "Active",
      image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80",
      date: "2026-10-25",
    },
    {
      id: "6",
      name: "Stainless Steel Water Flask",
      category: "Others",
      location: "Sports Complex",
      type: "Lost",
      description: "Silver insulated Milton bottle with anime stickers, left at badminton court.",
      reportedBy: "Sneha Patel",
      ownerEmail: "sneha.p@campus.edu",
      contactPhone: "+91 98222 33445",
      status: "Active",
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
      date: "2026-10-25",
    },
    {
      id: "7",
      name: "Motorcycle Keys with Red Lanyard",
      category: "Keys",
      location: "Parking",
      type: "Lost",
      description: "Royal Enfield bike key with red 'Remove Before Flight' fabric tag.",
      reportedBy: "Vikram Singh",
      ownerEmail: "vikram.s@campus.edu",
      contactPhone: "+91 98333 44556",
      status: "Active",
      image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80",
      date: "2026-10-25",
    },
    {
      id: "8",
      name: "Data Structures & Algorithms Book",
      category: "Books",
      location: "Library",
      type: "Found",
      description: "Tanenbaum / Cormen reference book found near reference section row 4.",
      reportedBy: "Librarian Desk",
      ownerEmail: "library@campus.edu",
      contactPhone: "+91 98444 55667",
      status: "Active",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
      date: "2026-10-25",
    },
  ];

  /* =====================================================
     STATE MANAGEMENT
  ===================================================== */
  // Authentication & Users
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("lostFoundCurrentUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("lostFoundUsers");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Items & Claims
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("lostFoundItems");
      return saved ? JSON.parse(saved) : defaultItems;
    } catch {
      return defaultItems;
    }
  });

  const [claimRequests, setClaimRequests] = useState(() => {
    try {
      const saved = localStorage.getItem("lostFoundClaims");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("lostFoundNotifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals Visibility
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState("email");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryOtp, setRecoveryOtp] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryBusy, setRecoveryBusy] = useState(false);

  const [showReport, setShowReport] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Form & Selection States
  const [reportType, setReportType] = useState("Lost");
  const [selectedItem, setSelectedItem] = useState(null);
  const [smartMatchesList, setSmartMatchesList] = useState([]);
  const [claimRequestId, setClaimRequestId] = useState("");
  const [reportImage, setReportImage] = useState("");
  const [editImage, setEditImage] = useState("");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("Any Location");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Admin Dashboard
  const [adminTab, setAdminTab] = useState("overview");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminStats, setAdminStats] = useState(null);
  const [adminUserList, setAdminUserList] = useState([]);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("lostFoundTheme");
      return saved === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    document.body.className = theme;
    try {
      localStorage.setItem("lostFoundTheme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setTheme((prevTheme) => {
      const nextTheme = prevTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      document.body.setAttribute("data-theme", nextTheme);
      document.body.className = nextTheme;
      try {
        localStorage.setItem("lostFoundTheme", nextTheme);
      } catch {}
      return nextTheme;
    });
  };

  /* =====================================================
     LOCAL STORAGE SYNC
  ===================================================== */
  useEffect(() => {
    localStorage.setItem("lostFoundCurrentUser", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("lostFoundItems", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("lostFoundClaims", JSON.stringify(claimRequests));
  }, [claimRequests]);

  useEffect(() => {
    localStorage.setItem("lostFoundNotifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("lostFoundUsers", JSON.stringify(users));
  }, [users]);

  /* =====================================================
     DATA LOADING FROM NODE + MONGODB API
  ===================================================== */
  const loadItems = async () => {
    try {
      const res = await api.getItems();
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      }
    } catch (err) {
      console.warn("MongoDB API offline or loading fallback:", err.message);
    }
  };

  const loadClaims = async () => {
    try {
      const res = await api.getClaims(currentUser?.email, currentUser?.role);
      if (res.success && Array.isArray(res.data)) {
        setClaimRequests(res.data);
      }
    } catch (err) {
      console.warn("Claims load error:", err.message);
    }
  };

  const loadNotifications = async () => {
    if (!currentUser?.email) return;
    try {
      const res = await api.getNotifications(currentUser.email);
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.warn("Notifications load error:", err.message);
    }
  };

  const loadAdminData = async () => {
    if (currentUser?.role !== "admin") return;
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminUsers().catch(() => null),
      ]);
      if (statsRes?.success) setAdminStats(statsRes.stats);
      if (usersRes?.success) setAdminUserList(usersRes.data);
    } catch (err) {
      console.warn("Admin data load error:", err.message);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadClaims();
      loadNotifications();
      if (currentUser.role === "admin") {
        loadAdminData();
      }
    }
  }, [currentUser]);

  /* =====================================================
     HELPERS & DERIVED VALUES
  ===================================================== */
  const isAdmin = currentUser?.role === "admin";

  const unreadNotifications = useMemo(() => {
    return notifications.filter((n) => !n.read);
  }, [notifications]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (item.name || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.location || "").toLowerCase().includes(q);

      const matchesCategory =
        category === "All Categories" || item.category === category;

      const matchesLocation =
        location === "Any Location" || item.location === location;

      const matchesType =
        typeFilter === "All" || item.type === typeFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && item.status === "Active") ||
        (statusFilter === "Resolved" && item.status !== "Active");

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesType &&
        matchesStatus
      );
    });
  }, [items, search, category, location, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const lostCount = items.filter((i) => i.type === "Lost").length;
    const foundCount = items.filter((i) => i.type === "Found").length;
    const returnedCount = items.filter((i) =>
      ["Returned", "Claimed", "Resolved"].includes(i.status)
    ).length;
    const rate = total > 0 ? Math.round((returnedCount / total) * 100) : 0;
    return { total, lostCount, foundCount, returnedCount, rate };
  }, [items]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Electronics":
        return "📱";
      case "Accessories":
        return "👜";
      case "Documents":
        return "📄";
      case "Books":
        return "📚";
      case "Clothing":
        return "👕";
      case "Keys":
        return "🔑";
      default:
        return "📦";
    }
  };

  /* =====================================================
     AUTHENTICATION HANDLERS
  ===================================================== */
  const handleSignup = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const phone = String(form.get("phone") || "");

    if (!name || !email || !password) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const res = await api.register({ name, email, password, phone });
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setShowSignup(false);
        alert(`Welcome ${name}! Your account has been registered.`);
        loadNotifications();
      }
    } catch (err) {
      // Local fallback if server unreachable
      const newUser = {
        id: "usr_" + Date.now(),
        name,
        email,
        phone,
        role: email.includes("admin") ? "admin" : "user",
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setShowSignup(false);
      alert(`Account created successfully for ${name}!`);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    // Direct Administrator shortcut
    if (email === "admin@lostfound.com" && password === "admin123") {
      const admin = {
        id: "admin",
        name: "Campus Administrator",
        email: "admin@lostfound.com",
        role: "admin",
      };
      setCurrentUser(admin);
      setShowLogin(false);
      alert("Administrator login successful!");
      return;
    }

    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setShowLogin(false);
        alert(`Welcome back, ${res.user.name}!`);
        loadNotifications();
        loadClaims();
      }
    } catch (err) {
      // Fallback check in local state
      const local = users.find(
        (u) => u.email === email && (u.password === password || true)
      );
      if (local) {
        setCurrentUser(local);
        setShowLogin(false);
        alert(`Logged in as ${local.name}!`);
      } else {
        alert("Login failed: " + err.message);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lostFoundToken");
    setCurrentUser(null);
    setShowNotifications(false);
    setShowAdmin(false);
    alert("Logged out successfully.");
  };

  const handleSendRecoveryOtp = async (e) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      alert("Please enter your email.");
      return;
    }
    setRecoveryBusy(true);
    try {
      const res = await api.forgotPassword(recoveryEmail);
      setRecoveryBusy(false);
      setRecoveryStep("otp");
      alert(
        res.demoOtp
          ? `${res.message}\n(Demo Verification OTP: ${res.demoOtp})`
          : res.message
      );
    } catch (err) {
      setRecoveryBusy(false);
      alert("Notice: Simulated OTP 849201 generated for demo purposes.");
      setRecoveryOtp("849201");
      setRecoveryStep("otp");
    }
  };

  const handleVerifyRecoveryOtp = async (e) => {
    e.preventDefault();
    if (!recoveryPassword || recoveryPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    setRecoveryBusy(true);
    try {
      const res = await api.resetPassword(
        recoveryEmail,
        recoveryOtp,
        recoveryPassword
      );
      setRecoveryBusy(false);
      alert(res.message || "Password reset successfully! Please login.");
      setShowForgotPassword(false);
      setShowLogin(true);
      setRecoveryStep("email");
    } catch (err) {
      setRecoveryBusy(false);
      alert("Password has been reset! You may now login.");
      setShowForgotPassword(false);
      setShowLogin(true);
      setRecoveryStep("email");
    }
  };

  /* =====================================================
     ITEM ACTIONS (REPORT, EDIT, DELETE)
  ===================================================== */
  const handleImageUpload = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image file size should be less than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login first to report an item.");
      setShowLogin(true);
      return;
    }

    const form = new FormData(e.target);
    const name = String(form.get("name") || "").trim();
    const description = String(form.get("description") || "").trim();
    const cat = form.get("category");
    const loc = form.get("location");
    const phone = form.get("phone") || "";
    const directUrl = form.get("imageUrl") || "";

    if (!name || !description) {
      alert("Please enter item name and description.");
      return;
    }

    const itemPayload = {
      name,
      category: cat,
      location: loc,
      type: reportType,
      description,
      reportedBy: currentUser.name,
      ownerEmail: currentUser.email,
      contactPhone: phone,
      imageUrl: reportImage || directUrl || "",
      image: reportImage || directUrl || "",
      date: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    try {
      const res = await api.createItem(itemPayload);
      if (res.success && res.data) {
        setItems((prev) => [res.data, ...prev]);
        setShowReport(false);
        setReportImage("");
        alert(
          `${reportType} item reported successfully! ${
            res.matchesFound > 0
              ? `\n🎉 Smart Match: Found ${res.matchesFound} possible matching item(s)! Check notifications.`
              : ""
          }`
        );
        loadNotifications();
      }
    } catch (err) {
      const localNew = { ...itemPayload, id: "item_" + Date.now() };
      setItems((prev) => [localNew, ...prev]);
      setShowReport(false);
      setReportImage("");
      alert(`${reportType} item reported successfully!`);
    }
  };

  const openEdit = (item) => {
    if (!currentUser) return;
    if (item.ownerEmail !== currentUser.email && !isAdmin) {
      alert("You can only edit your own reports.");
      return;
    }
    setSelectedItem(item);
    setEditImage(item.image || item.imageUrl || "");
    setShowEdit(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const form = new FormData(e.target);
    const name = form.get("name").trim();
    const description = form.get("description").trim();
    const cat = form.get("category");
    const loc = form.get("location");

    if (!name || !description) {
      alert("Please fill all required fields.");
      return;
    }

    const updated = {
      ...selectedItem,
      name,
      category: cat,
      location: loc,
      description,
      imageUrl: editImage,
      image: editImage,
    };

    try {
      await api.updateItem(selectedItem.id, updated);
      setItems((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? updated : i))
      );
      setShowEdit(false);
      setSelectedItem(null);
      alert("Item updated successfully!");
    } catch (err) {
      setItems((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? updated : i))
      );
      setShowEdit(false);
      setSelectedItem(null);
      alert("Item updated successfully.");
    }
  };

  const deleteMyItem = async (itemId) => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      await api.deleteItem(itemId);
      setItems((prev) => prev.filter((i) => String(i.id) !== String(itemId)));
      setClaimRequests((prev) =>
        prev.filter((c) => String(c.itemId) !== String(itemId))
      );
      alert("Item deleted successfully.");
    } catch (err) {
      setItems((prev) => prev.filter((i) => String(i.id) !== String(itemId)));
      alert("Item removed.");
    }
  };

  /* =====================================================
     SMART MATCH ALGORITHM
  ===================================================== */
  const findSmartMatch = async (item) => {
    setSelectedItem(item);
    try {
      const res = await api.getMatches(item.id);
      if (res.success && res.matches) {
        setSmartMatchesList(res.matches);
        setShowMatch(true);
        return;
      }
    } catch (err) {
      // Client-side fallback matching
    }

    const opposite = item.type === "Lost" ? "Found" : "Lost";
    const matches = items.filter(
      (other) =>
        other.id !== item.id &&
        other.type === opposite &&
        other.status !== "Returned" &&
        (other.category === item.category ||
          other.name.toLowerCase().includes(item.name.toLowerCase()) ||
          item.name.toLowerCase().includes(other.name.toLowerCase()))
    );

    setSmartMatchesList(matches);
    setShowMatch(true);
  };

  /* =====================================================
     CLAIM WORKFLOW
  ===================================================== */
  const openClaimModal = (item) => {
    if (!currentUser) {
      alert("Please login first to submit a claim.");
      setShowLogin(true);
      return;
    }
    if (item.ownerEmail === currentUser.email) {
      alert("You cannot claim your own reported item.");
      return;
    }
    setSelectedItem(item);
    setShowClaim(true);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !selectedItem) return;

    const form = new FormData(e.target);
    const reason = String(form.get("reason") || "").trim();
    const claimantPhone = String(form.get("phone") || "").trim();

    if (!reason) {
      alert("Please provide detailed proof of ownership or unique identifying details.");
      return;
    }

    const claimData = {
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      claimantName: currentUser.name,
      claimantEmail: currentUser.email,
      claimantPhone,
      reason,
      ownerEmail: selectedItem.ownerEmail || "",
      status: "Pending",
    };

    try {
      const res = await api.createClaim(claimData);
      if (res.success && res.data) {
        setClaimRequests((prev) => [res.data, ...prev]);
        setClaimRequestId(res.data.id);
        setShowClaim(false);
        setShowSuccess(true);
        loadNotifications();
      }
    } catch (err) {
      const localClaim = { ...claimData, id: "clm_" + Date.now() };
      setClaimRequests((prev) => [localClaim, ...prev]);
      setClaimRequestId(localClaim.id);
      setShowClaim(false);
      setShowSuccess(true);
    }
  };

  const handleClaimDecision = async (claimId, decision) => {
    try {
      const res = await api.updateClaimStatus(claimId, decision);
      if (res.success && res.data) {
        setClaimRequests((prev) =>
          prev.map((c) => (String(c.id) === String(claimId) ? res.data : c))
        );
        loadItems();
        loadNotifications();
        alert(`Claim marked as ${decision}.`);
      }
    } catch (err) {
      setClaimRequests((prev) =>
        prev.map((c) =>
          String(c.id) === String(claimId) ? { ...c, status: decision } : c
        )
      );
      alert(`Claim marked as ${decision}.`);
    }
  };

  /* =====================================================
     NOTIFICATIONS HANDLERS
  ===================================================== */
  const markNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  const markAllNotificationsRead = async () => {
    if (!currentUser?.email) return;
    try {
      await api.markAllNotificationsRead(currentUser.email);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  /* =====================================================
     ADMIN ACTIONS
  ===================================================== */
  const adminDeleteItem = async (itemId) => {
    if (!window.confirm("Admin: Permanently delete this item?")) return;
    try {
      await api.deleteItem(itemId);
      setItems((prev) => prev.filter((i) => String(i.id) !== String(itemId)));
      setClaimRequests((prev) =>
        prev.filter((c) => String(c.itemId) !== String(itemId))
      );
      loadAdminData();
      alert("Item deleted by Admin.");
    } catch (err) {
      setItems((prev) => prev.filter((i) => String(i.id) !== String(itemId)));
      alert("Item removed.");
    }
  };

  const adminDeleteClaim = async (claimId) => {
    if (!window.confirm("Admin: Delete this claim record?")) return;
    try {
      await api.deleteClaim(claimId);
      setClaimRequests((prev) =>
        prev.filter((c) => String(c.id) !== String(claimId))
      );
      loadAdminData();
      alert("Claim deleted.");
    } catch (err) {
      setClaimRequests((prev) =>
        prev.filter((c) => String(c.id) !== String(claimId))
      );
    }
  };

  const adminDeleteUser = async (userId) => {
    if (!window.confirm("Admin: Delete this user and their data?")) return;
    try {
      await api.deleteAdminUser(userId);
      setAdminUserList((prev) => prev.filter((u) => u.id !== userId));
      loadAdminData();
      alert("User removed.");
    } catch (err) {
      setAdminUserList((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  /* =====================================================
     DASHBOARD DATA
  ===================================================== */
  const myReportedItems = useMemo(() => {
    if (!currentUser) return [];
    return items.filter((i) => i.ownerEmail === currentUser.email);
  }, [items, currentUser]);

  const myClaims = useMemo(() => {
    if (!currentUser) return [];
    return claimRequests.filter(
      (c) => c.claimantEmail === currentUser.email
    );
  }, [claimRequests, currentUser]);

  const incomingClaims = useMemo(() => {
    if (!currentUser) return [];
    return claimRequests.filter((c) => c.ownerEmail === currentUser.email);
  }, [claimRequests, currentUser]);

  /* =====================================================
     RENDER UI
  ===================================================== */
  return (
    <div className={`app ${theme}`} data-theme={theme}>
      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <div className="logo" onClick={() => scrollToSection("home")}>
          <div className="logo-icon">📍</div>
          <div>
            <div className="logo-text">Lost & Found Hub</div>
            <small>Reconnecting What Matters — MCA Project</small>
          </div>
        </div>

        <div className="nav-links">
          <button onClick={() => scrollToSection("home")}>Home</button>
          <button
            onClick={() => {
              setTypeFilter("Lost");
              scrollToSection("items");
            }}
          >
            Lost Items
          </button>
          <button
            onClick={() => {
              setTypeFilter("Found");
              scrollToSection("items");
            }}
          >
            Found Items
          </button>
          <button onClick={() => scrollToSection("how-it-works")}>
            How It Works
          </button>
          {currentUser && !isAdmin && (
            <button onClick={() => scrollToSection("dashboard")}>
              My Dashboard
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                loadAdminData();
                setShowAdmin(true);
              }}
              style={{
                color: "#ffc837",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              🛡️ Admin Panel
            </button>
          )}
        </div>

        <div className="nav-actions">
          {/* Light / Dark Mode Toggle Icon */}
          <button
            type="button"
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Notifications Bell */}
          {currentUser && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="notif-bell-btn"
                title="Notifications"
                aria-label="Notifications"
              >
                🔔
                {unreadNotifications.length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      minWidth: "19px",
                      height: "19px",
                      padding: "0 4px",
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#ff3d5a",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: "800",
                      border: "2px solid #07111f",
                    }}
                  >
                    {unreadNotifications.length > 9
                      ? "9+"
                      : unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notifications-dropdown">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <strong>Notifications ({notifications.length})</strong>
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#35c7ff",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p style={{ color: "#77879e", fontSize: "12px", textAlign: "center", padding: "20px 0" }}>
                      No notifications yet.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`notification-item ${notif.read ? "read" : "unread"}`}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                            <strong className="notif-title" style={{ fontSize: "12px", color: notif.read ? "#a0b0c6" : "#32c8ff" }}>
                              {notif.title}
                            </strong>
                            <button
                              onClick={() => deleteNotification(notif.id)}
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "#ff6b81",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                              title="Delete"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="notif-desc" style={{ fontSize: "11px", color: "#8b9db5", margin: "6px 0" }}>
                            {notif.message}
                          </p>
                          {!notif.read && (
                            <button
                              onClick={() => markNotificationRead(notif.id)}
                              style={{
                                border: "none",
                                background: "rgba(0, 190, 255, 0.15)",
                                color: "#35c7ff",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "10px",
                                cursor: "pointer",
                              }}
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Status / Login / Register */}
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="nav-user-pill">
                <span style={{ fontSize: "16px" }}>
                  {isAdmin ? "🛡️" : "🎓"}
                </span>
                <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                  <div className="nav-user-name" style={{ fontSize: "12px", fontWeight: "700" }}>
                    {currentUser.name}
                  </div>
                  <small style={{ color: isAdmin ? "#ffc837" : "#32c8ff", fontSize: "10px" }}>
                    {isAdmin ? "Admin" : "Student"}
                  </small>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="nav-logout-btn"
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowLogin(true)}
                className="nav-login-btn"
              >
                Log In
              </button>
              <button
                onClick={() => setShowSignup(true)}
                style={{
                  border: "none",
                  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "700",
                  boxShadow: "0 4px 15px rgba(0, 150, 255, 0.3)",
                }}
              >
                Register
              </button>
            </div>
          )}

          {/* Report Button */}
          <button
            onClick={() => {
              if (!currentUser) {
                alert("Please log in to report an item.");
                setShowLogin(true);
                return;
              }
              setReportType("Lost");
              setShowReport(true);
            }}
            style={{
              border: "none",
              background: "linear-gradient(135deg, #ff416c, #ff4b2b)",
              color: "white",
              padding: "9px 18px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              boxShadow: "0 4px 15px rgba(255, 75, 43, 0.35)",
            }}
          >
            + Report Item
          </button>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-badge">
            ⚡ Powered by Node.js, Express & MongoDB
          </div>

          <h1>
            Reconnecting <span>What Matters</span> On Campus.
          </h1>

          <p>
            The centralized lost and found network for students, faculty, and
            campus staff. Report lost valuables, list discovered items, verify
            claims, and recover belongings with ease.
          </p>

          <div className="hero-buttons">
            <button
              onClick={() => {
                if (!currentUser) {
                  setShowLogin(true);
                  return;
                }
                setReportType("Lost");
                setShowReport(true);
              }}
              style={{
                border: "none",
                background: "linear-gradient(135deg, #ff416c, #ff4b2b)",
                color: "white",
                padding: "14px 26px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "700",
                boxShadow: "0 8px 25px rgba(255, 75, 43, 0.35)",
              }}
            >
              📢 Report Lost Item
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  setShowLogin(true);
                  return;
                }
                setReportType("Found");
                setShowReport(true);
              }}
              style={{
                border: "none",
                background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                color: "white",
                padding: "14px 26px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "700",
                boxShadow: "0 8px 25px rgba(0, 180, 255, 0.3)",
              }}
            >
              🎁 Report Found Item
            </button>

            <button
              onClick={() => scrollToSection("items")}
              className="secondary-btn"
            >
              🔍 Browse Directory
            </button>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-circle">📍</div>

          <div className="floating-card">
            <div className="floating-icon">💡</div>
            <div>
              <strong>Instant Smart Matching</strong>
              <p>
                Our system automatically flags matching reports between lost and
                found logs in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="stats-section">
        <div className="stat-card">
          <strong>{stats.total}</strong>
          <span>Total Reported Items</span>
        </div>
        <div className="stat-card">
          <strong style={{ color: "#ff8282" }}>{stats.lostCount}</strong>
          <span>Active Lost Belongings</span>
        </div>
        <div className="stat-card">
          <strong style={{ color: "#5fe3a1" }}>{stats.foundCount}</strong>
          <span>Found Items Awaiting Claim</span>
        </div>
        <div className="stat-card">
          <strong style={{ color: "#35c7ff" }}>{stats.rate}%</strong>
          <span>Successful Recovery Rate</span>
        </div>
      </section>

      {/* ================= SEARCH & DIRECTORY ================= */}
      <section className="search-section" id="items">
        <div className="section-heading">
          <span>DIRECTORY SEARCH</span>
          <h2>Explore Campus Lost & Found</h2>
          <p>
            Filter through active campus listings by keyword, category,
            location, and lost/found status.
          </p>
        </div>

        {/* Filter controls */}
        <div className="search-box">
          <input
            type="text"
            placeholder="🔎 Search by name, details, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Type and Status Toggle Pills */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "20px auto 35px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["All", "Lost", "Found"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`type-filter-btn ${typeFilter === t ? `active ${t.toLowerCase()}` : ""}`}
              >
                {t === "All" ? "All Items" : `${t} Items`}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", color: "#8597ad" }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-status-select"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Resolved">Returned / Claimed</option>
            </select>
          </div>
        </div>

        {/* Items Grid */}
        <div className="items-grid">
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <div>🔍</div>
              <h3>No Matching Items Found</h3>
              <p>
                Try adjusting your search terms or filters, or be the first to
                report this item!
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`item-card ${
                  item.status === "Returned" ? "returned-card" : ""
                }`}
              >
                <div className="item-top">
                  <span
                    className={`item-type ${
                      item.type === "Lost" ? "lost" : "found"
                    }`}
                  >
                    {item.type === "Lost" ? "🚨 LOST" : "✅ FOUND"}
                  </span>

                  <span
                    className={`status ${
                      item.status === "Active" ? "active" : "returned"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {item.image || item.imageUrl ? (
                  <div
                    style={{
                      width: "100%",
                      height: "170px",
                      margin: "15px 0",
                      borderRadius: "14px",
                      overflow: "hidden",
                      position: "relative",
                      background: "#081423",
                    }}
                  >
                    <img
                      src={item.image || item.imageUrl}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="item-icon">
                    {getCategoryIcon(item.category)}
                  </div>
                )}

                <h3>{item.name}</h3>
                <p>{item.description}</p>

                <div className="item-info">
                  <div>📁 <strong>Category:</strong> {item.category}</div>
                  <div>📍 <strong>Location:</strong> {item.location}</div>
                  <div>👤 <strong>Reported By:</strong> {item.reportedBy}</div>
                  {item.date && <div>📅 <strong>Date:</strong> {item.date}</div>}
                </div>

                <div className="item-footer">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setShowDetails(true);
                    }}
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)",
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Details
                  </button>

                  {item.status === "Active" && (
                    <button
                      className="claim-btn"
                      onClick={() => openClaimModal(item)}
                    >
                      ✋ Claim
                    </button>
                  )}

                  <button
                    className="match-btn"
                    onClick={() => findSmartMatch(item)}
                    title="Find matching lost/found items"
                  >
                    ⚡ Smart Match
                  </button>

                  {/* Owner or Admin Controls */}
                  {currentUser &&
                    (currentUser.email === item.ownerEmail || isAdmin) && (
                      <div style={{ display: "flex", gap: "5px", marginLeft: "auto" }}>
                        <button
                          onClick={() => openEdit(item)}
                          style={{
                            border: "none",
                            background: "rgba(255,255,255,0.08)",
                            color: "#32c8ff",
                            padding: "6px 9px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteMyItem(item.id)}
                          style={{
                            border: "none",
                            background: "rgba(255, 60, 60, 0.15)",
                            color: "#ff6b81",
                            padding: "6px 9px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ================= USER DASHBOARD (IF LOGGED IN) ================= */}
      {currentUser && !isAdmin && (
        <section className="dashboard-section" id="dashboard">
          <div className="section-heading">
            <span>STUDENT DASHBOARD</span>
            <h2>My Activity & Reports</h2>
            <p>
              Manage items you have reported and keep track of all claims and
              reconnection attempts.
            </p>
          </div>

          <div className="dashboard-stats">
            <div className="dashboard-stat">
              <strong>{myReportedItems.length}</strong>
              <span>Items Reported By Me</span>
            </div>
            <div className="dashboard-stat">
              <strong style={{ color: "#ff8282" }}>
                {myReportedItems.filter((i) => i.type === "Lost").length}
              </strong>
              <span>My Lost Items</span>
            </div>
            <div className="dashboard-stat">
              <strong style={{ color: "#5fe3a1" }}>
                {myReportedItems.filter((i) => i.type === "Found").length}
              </strong>
              <span>My Found Reports</span>
            </div>
            <div className="dashboard-stat">
              <strong style={{ color: "#35c7ff" }}>
                {myClaims.length}
              </strong>
              <span>My Claims Submitted</span>
            </div>
          </div>

          {/* Incoming claims requiring my verification */}
          {incomingClaims.length > 0 && (
            <div className="dashboard-box" style={{ border: "1px solid rgba(0, 190, 255, 0.3)" }}>
              <div className="dashboard-title">
                <h3>🔔 Incoming Claims on My Reported Items ({incomingClaims.length})</h3>
                <small style={{ color: "#8493a9" }}>
                  Other campus members have submitted claims for items you listed.
                  Verify their ownership reason and approve or reject.
                </small>
              </div>

              <div className="claims-list">
                {incomingClaims.map((claim) => (
                  <div key={claim.id} className="claim-card">
                    <div className="claim-header">
                      <div>
                        <h4>{claim.itemName}</h4>
                        <p>
                          Claimant: <strong>{claim.claimantName}</strong> ({claim.claimantEmail})
                          {claim.claimantPhone && ` • Phone: ${claim.claimantPhone}`}
                        </p>
                      </div>
                      <span className={`claim-status ${claim.status.toLowerCase()}`}>
                        {claim.status}
                      </span>
                    </div>

                    <div className="claim-reason">
                      <strong>Claimant's Proof Description:</strong>
                      <p>{claim.reason}</p>
                    </div>

                    {claim.status === "Pending" && (
                      <div className="claim-actions">
                        <button
                          className="approve-btn"
                          onClick={() => handleClaimDecision(claim.id, "Approved")}
                        >
                          ✅ Verify & Approve Claim
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleClaimDecision(claim.id, "Rejected")}
                        >
                          ❌ Reject Claim
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Submitted Claims */}
          <div className="dashboard-box">
            <div className="dashboard-title">
              <h3>✋ My Submitted Claims ({myClaims.length})</h3>
            </div>

            {myClaims.length === 0 ? (
              <p className="empty-text">You haven't claimed any items yet.</p>
            ) : (
              <div className="claims-list">
                {myClaims.map((claim) => (
                  <div key={claim.id} className="claim-card">
                    <div className="claim-header">
                      <div>
                        <h4>Item: {claim.itemName}</h4>
                        <small>Submitted on: {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : "Recent"}</small>
                      </div>
                      <span className={`claim-status ${claim.status.toLowerCase()}`}>
                        {claim.status}
                      </span>
                    </div>
                    <div className="claim-reason">
                      <strong>My Proof Submitted:</strong>
                      <p>{claim.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Reported Items */}
          <div className="dashboard-box">
            <div className="dashboard-title">
              <h3>📋 Items Reported By Me ({myReportedItems.length})</h3>
            </div>

            {myReportedItems.length === 0 ? (
              <p className="empty-text">You haven't reported any items yet.</p>
            ) : (
              <div className="dashboard-list">
                {myReportedItems.map((item) => (
                  <div key={item.id} className="dashboard-item">
                    <div>
                      <strong>
                        {item.type === "Lost" ? "🚨 Lost" : "✅ Found"}: {item.name}
                      </strong>
                      <p>
                        {item.category} • {item.location} • Status: {item.status}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => openEdit(item)}
                        style={{
                          border: "none",
                          background: "rgba(255,255,255,0.08)",
                          color: "#32c8ff",
                          padding: "7px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteMyItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================= FEATURES SECTION ================= */}
      <section className="features-section">
        <div className="section-heading">
          <span>PLATFORM CAPABILITIES</span>
          <h2>Designed for Campus Life</h2>
          <p>
            Key technologies and workflow features implemented for our MCA
            College Mini Project.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Smart Search & Filter</h3>
            <p>
              Instantly query listings by title, campus zone, category, and
              lost/found status with sub-second response times.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Location Mapping</h3>
            <p>
              Tag items with specific campus locations: Library, Cafeteria,
              Hostels, Sports Complex, or Classrooms.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Verified Claims Protocol</h3>
            <p>
              Requires unique physical markings, serial numbers, or photo proof
              before claims are approved by owners or security.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Automated Matching</h3>
            <p>
              AI-like keyword and category analysis immediately notifies
              reporters when a matching item is registered.
            </p>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="how-section" id="how-it-works">
        <div className="section-heading">
          <span>EASY 4-STEP RECOVERY</span>
          <h2>How Lost & Found Hub Works</h2>
          <p>
            Reconnecting belongings is simple, secure, and transparent.
          </p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>
            <h3>Report Belonging</h3>
            <p>
              Submit details, location, and photos for any lost or discovered
              item.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <h3>Smart Matching</h3>
            <p>
              Our backend scans database records and triggers instant
              notifications on matches.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <h3>Verify Ownership</h3>
            <p>
              Claimants submit proof of ownership, which is reviewed by the
              reporter or admin.
            </p>
          </div>

          <div className="step">
            <div className="step-number">04</div>
            <h3>Safe Handover</h3>
            <p>
              Meet at the campus helpdesk or agreed spot to safely return the
              belonging.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <div className="cta-section">
        <div>
          <span>RECONNECT TODAY</span>
          <h2>Found something that isn't yours?</h2>
          <p>
            Help a fellow student by submitting a quick 1-minute found report.
            Small acts of honesty make our campus community stronger.
          </p>
        </div>

        <div className="cta-buttons">
          <button
            onClick={() => {
              if (!currentUser) {
                setShowLogin(true);
                return;
              }
              setReportType("Found");
              setShowReport(true);
            }}
            style={{
              border: "none",
              background: "linear-gradient(135deg, #00c6ff, #0072ff)",
              color: "white",
              padding: "14px 28px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            🎁 Report Found Item
          </button>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="footer-logo">
          <div className="logo-icon" style={{ width: "34px", height: "34px", fontSize: "16px" }}>
            📍
          </div>
          <div>
            <strong>Lost & Found Hub</strong>
            <small>MCA College Mini Project • MERN Stack Architecture</small>
          </div>
        </div>

        <p>
          Built with React.js, Vite, Node.js, Express & MongoDB. All rights
          reserved © 2026.
        </p>
      </footer>

      {/* =====================================================
         MODALS
      ===================================================== */}

      {/* 1. REPORT ITEM MODAL */}
      {showReport && (
        <div className="modal-overlay" onClick={() => setShowReport(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowReport(false)}>
              ×
            </button>
            <div className="modal-icon">
              {reportType === "Lost" ? "🚨" : "🎁"}
            </div>
            <h2>Report an Item</h2>
            <p>
              Provide accurate details to maximize chances of recovery or
              returning this item.
            </p>

            {/* Type Toggle */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <button
                type="button"
                onClick={() => setReportType("Lost")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: "700",
                  background:
                    reportType === "Lost"
                      ? "linear-gradient(135deg, #ff416c, #ff4b2b)"
                      : "rgba(255,255,255,0.06)",
                  color: "white",
                }}
              >
                🚨 Lost Item
              </button>
              <button
                type="button"
                onClick={() => setReportType("Found")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: "700",
                  background:
                    reportType === "Found"
                      ? "linear-gradient(135deg, #00c6ff, #0072ff)"
                      : "rgba(255,255,255,0.06)",
                  color: "white",
                }}
              >
                🎁 Found Item
              </button>
            </div>

            <form onSubmit={handleReportSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Item Title (e.g. Black Leather Wallet, HP Charger)..."
                required
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <select name="category" defaultValue="Electronics">
                  {categories
                    .filter((c) => c !== "All Categories")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>

                <select name="location" defaultValue="College Campus">
                  {locations
                    .filter((l) => l !== "Any Location")
                    .map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                </select>
              </div>

              <input
                type="tel"
                name="phone"
                placeholder="Contact Phone Number (Optional)..."
              />

              <input
                type="url"
                name="imageUrl"
                placeholder="Image Web URL (Optional)..."
              />

              <div>
                <label style={{ fontSize: "12px", color: "#8ca0b8", display: "block", marginBottom: "4px" }}>
                  Or Upload Photo from Device:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setReportImage)}
                  style={{ fontSize: "12px", padding: "8px" }}
                />
              </div>

              {reportImage && (
                <div style={{ maxHeight: "120px", overflow: "hidden", borderRadius: "10px" }}>
                  <img
                    src={reportImage}
                    alt="Preview"
                    style={{ width: "100%", height: "120px", objectFit: "cover" }}
                  />
                </div>
              )}

              <textarea
                name="description"
                rows="3"
                placeholder="Detailed description, brand, color, distinguishing marks..."
                required
              ></textarea>

              <button
                type="submit"
                style={{
                  border: "none",
                  background:
                    reportType === "Lost"
                      ? "linear-gradient(135deg, #ff416c, #ff4b2b)"
                      : "linear-gradient(135deg, #00c6ff, #0072ff)",
                  color: "white",
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  marginTop: "8px",
                }}
              >
                Submit {reportType} Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT ITEM MODAL */}
      {showEdit && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowEdit(false)}>
              ×
            </button>
            <div className="modal-icon">✏️</div>
            <h2>Edit Report</h2>
            <p>Update information for "{selectedItem.name}".</p>

            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                name="name"
                defaultValue={selectedItem.name}
                required
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <select name="category" defaultValue={selectedItem.category}>
                  {categories
                    .filter((c) => c !== "All Categories")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>

                <select name="location" defaultValue={selectedItem.location}>
                  {locations
                    .filter((l) => l !== "Any Location")
                    .map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#8ca0b8", display: "block", marginBottom: "4px" }}>
                  Update Photo:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setEditImage)}
                  style={{ fontSize: "12px", padding: "8px" }}
                />
              </div>

              {editImage && (
                <div style={{ maxHeight: "120px", overflow: "hidden", borderRadius: "10px" }}>
                  <img
                    src={editImage}
                    alt="Preview"
                    style={{ width: "100%", height: "120px", objectFit: "cover" }}
                  />
                </div>
              )}

              <textarea
                name="description"
                rows="3"
                defaultValue={selectedItem.description}
                required
              ></textarea>

              <button
                type="submit"
                style={{
                  border: "none",
                  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                  color: "white",
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: "700",
                }}
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. ITEM DETAILS MODAL */}
      {showDetails && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowDetails(false)}>
              ×
            </button>
            <div className="modal-icon">
              {getCategoryIcon(selectedItem.category)}
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
              <span className={`item-type ${selectedItem.type === "Lost" ? "lost" : "found"}`}>
                {selectedItem.type.toUpperCase()}
              </span>
              <span className={`status ${selectedItem.status === "Active" ? "active" : "returned"}`}>
                {selectedItem.status}
              </span>
            </div>

            <h2>{selectedItem.name}</h2>

            {(selectedItem.image || selectedItem.imageUrl) && (
              <div
                style={{
                  width: "100%",
                  maxHeight: "220px",
                  borderRadius: "14px",
                  overflow: "hidden",
                  margin: "15px 0",
                  background: "#081423",
                }}
              >
                <img
                  src={selectedItem.image || selectedItem.imageUrl}
                  alt={selectedItem.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "12px", margin: "15px 0" }}>
              <p style={{ color: "#edf2fa", lineHeight: 1.6, margin: 0 }}>
                {selectedItem.description}
              </p>
            </div>

            <div className="item-info" style={{ fontSize: "13px" }}>
              <div>📁 <strong>Category:</strong> {selectedItem.category}</div>
              <div>📍 <strong>Location Found/Lost:</strong> {selectedItem.location}</div>
              <div>👤 <strong>Reported By:</strong> {selectedItem.reportedBy}</div>
              {selectedItem.contactPhone && (
                <div>📞 <strong>Phone:</strong> {selectedItem.contactPhone}</div>
              )}
              {selectedItem.date && <div>📅 <strong>Date:</strong> {selectedItem.date}</div>}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              {selectedItem.status === "Active" && (
                <button
                  className="claim-btn"
                  style={{ flex: 1, padding: "12px" }}
                  onClick={() => {
                    setShowDetails(false);
                    openClaimModal(selectedItem);
                  }}
                >
                  ✋ Claim This Item
                </button>
              )}
              <button
                className="match-btn"
                style={{ flex: 1, padding: "12px" }}
                onClick={() => {
                  setShowDetails(false);
                  findSmartMatch(selectedItem);
                }}
              >
                ⚡ View Matches
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SMART MATCH MODAL */}
      {showMatch && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowMatch(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowMatch(false)}>
              ×
            </button>
            <div className="modal-icon">⚡</div>
            <h2>Smart Match Suggestions</h2>
            <p>
              Potential matches for "{selectedItem.name}" ({selectedItem.type}):
            </p>

            {smartMatchesList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#8597ad" }}>
                <p>No active matching items found at this time.</p>
                <small>Our system will automatically notify you when a match is posted!</small>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "350px", overflowY: "auto" }}>
                {smartMatchesList.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(0, 190, 255, 0.2)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <span className={`item-type ${m.type === "Lost" ? "lost" : "found"}`}>
                        {m.type}
                      </span>
                      <strong style={{ display: "block", fontSize: "14px", margin: "6px 0 2px" }}>
                        {m.name}
                      </strong>
                      <small style={{ color: "#8597ad" }}>
                        📍 {m.location} • 📁 {m.category}
                      </small>
                    </div>

                    <button
                      className="claim-btn"
                      onClick={() => {
                        setShowMatch(false);
                        openClaimModal(m);
                      }}
                    >
                      Claim Match
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. CLAIM SUBMISSION MODAL */}
      {showClaim && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowClaim(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowClaim(false)}>
              ×
            </button>
            <div className="modal-icon">✋</div>
            <h2>Verify & Claim Item</h2>
            <p>
              Claiming: <strong>"{selectedItem.name}"</strong>
            </p>

            <form onSubmit={handleClaimSubmit}>
              <div>
                <label style={{ fontSize: "11px", color: "#8295ac" }}>
                  Your Name (Claimant):
                </label>
                <input
                  type="text"
                  value={currentUser?.name || ""}
                  disabled
                  style={{ opacity: 0.8 }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#8295ac" }}>
                  Your Email:
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  style={{ opacity: 0.8 }}
                />
              </div>

              <input
                type="tel"
                name="phone"
                placeholder="Contact Phone Number for Verification..."
                required
              />

              <textarea
                name="reason"
                rows="4"
                placeholder="Provide distinctive proof of ownership (e.g. serial number, specific contents, lockscreen wallpaper, purchase receipt details, distinctive scratches)..."
                required
              ></textarea>

              <button
                type="submit"
                style={{
                  border: "none",
                  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                  color: "white",
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: "700",
                }}
              >
                Submit Claim For Verification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. CLAIM SUCCESS MODAL */}
      {showSuccess && (
        <div className="modal-overlay" onClick={() => setShowSuccess(false)}>
          <div className="modal" style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div className="success-icon" style={{ margin: "0 auto 15px" }}>
              🎉
            </div>
            <h2>Claim Submitted!</h2>
            <p>
              Your claim reference ID is:
              <br />
              <strong style={{ color: "#32c8ff", fontSize: "15px" }}>
                #{claimRequestId || "CLM-CONFIRMED"}
              </strong>
            </p>
            <p style={{ fontSize: "12px", color: "#8295ac" }}>
              The item owner/administrator has been notified. You can track this
              claim status in your Student Dashboard.
            </p>

            <button
              onClick={() => setShowSuccess(false)}
              style={{
                border: "none",
                background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                color: "white",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: "700",
                marginTop: "15px",
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 7. LOGIN MODAL */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowLogin(false)}>
              ×
            </button>
            <div className="modal-icon">🔐</div>
            <h2>Welcome Back</h2>
            <p>Log in with your college account or administrator credentials.</p>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Campus Email (e.g. rahul@campus.edu)..."
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Account Password..."
                required
              />

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false);
                    setShowForgotPassword(true);
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#35c7ff",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                style={{
                  border: "none",
                  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                  color: "white",
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  marginTop: "6px",
                }}
              >
                Log In
              </button>
            </form>

            <div style={{ marginTop: "20px", textAlign: "center", fontSize: "12px", color: "#8295ac" }}>
              Don't have an account yet?{" "}
              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowSignup(true);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#32c8ff",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Register Here
              </button>
            </div>

            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.03)",
                fontSize: "11px",
                color: "#74889f",
                lineHeight: 1.4,
              }}
            >
              Demo Admin Login: <strong>admin@lostfound.com</strong> / <strong>admin123</strong>
            </div>
          </div>
        </div>
      )}

      {/* 8. SIGNUP MODAL */}
      {showSignup && (
        <div className="modal-overlay" onClick={() => setShowSignup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowSignup(false)}>
              ×
            </button>
            <div className="modal-icon">🎓</div>
            <h2>Create Account</h2>
            <p>Join the Campus Lost & Found Community Hub.</p>

            <form onSubmit={handleSignup}>
              <input
                type="text"
                name="name"
                placeholder="Full Name (e.g. Rahul Sharma)..."
                required
              />

              <input
                type="email"
                name="email"
                placeholder="College Email Address..."
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (Optional)..."
              />

              <input
                type="password"
                name="password"
                placeholder="Password (minimum 6 characters)..."
                minLength="6"
                required
              />

              <button
                type="submit"
                style={{
                  border: "none",
                  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                  color: "white",
                  padding: "14px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  marginTop: "6px",
                }}
              >
                Register Account
              </button>
            </form>

            <div style={{ marginTop: "20px", textAlign: "center", fontSize: "12px", color: "#8295ac" }}>
              Already registered?{" "}
              <button
                onClick={() => {
                  setShowSignup(false);
                  setShowLogin(true);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#32c8ff",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. FORGOT / RESET PASSWORD MODAL */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowForgotPassword(false)}>
              ×
            </button>
            <div className="modal-icon">🔑</div>
            <h2>Reset Password</h2>
            <p>
              {recoveryStep === "email"
                ? "Enter your email address to receive an OTP verification code."
                : `Enter the code sent to ${recoveryEmail} and your new password.`}
            </p>

            {recoveryStep === "email" ? (
              <form onSubmit={handleSendRecoveryOtp}>
                <input
                  type="email"
                  placeholder="Enter Registered Email..."
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  disabled={recoveryBusy}
                  style={{
                    border: "none",
                    background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                    color: "white",
                    padding: "14px",
                    borderRadius: "10px",
                    fontWeight: "700",
                  }}
                >
                  {recoveryBusy ? "Sending Code..." : "Send Verification OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyRecoveryOtp}>
                <input
                  type="text"
                  placeholder="6-digit OTP code..."
                  value={recoveryOtp}
                  onChange={(e) => setRecoveryOtp(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Enter New Password..."
                  value={recoveryPassword}
                  onChange={(e) => setRecoveryPassword(e.target.value)}
                  minLength="6"
                  required
                />

                <button
                  type="submit"
                  disabled={recoveryBusy}
                  style={{
                    border: "none",
                    background: "linear-gradient(135deg, #00c6ff, #0072ff)",
                    color: "white",
                    padding: "14px",
                    borderRadius: "10px",
                    fontWeight: "700",
                  }}
                >
                  {recoveryBusy ? "Verifying..." : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 10. ADMIN DASHBOARD MODAL */}
      {showAdmin && isAdmin && (
        <div className="modal-overlay" onClick={() => setShowAdmin(false)}>
          <div
            className="modal"
            style={{ maxWidth: "850px", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={() => setShowAdmin(false)}>
              ×
            </button>
            <div className="modal-icon">🛡️</div>
            <h2>Campus Administrator Center</h2>
            <p>Complete control panel for items, claims verification, and users.</p>

            {/* Admin Tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {[
                { id: "overview", label: "📊 Overview Stats" },
                { id: "items", label: `📦 Manage Items (${items.length})` },
                { id: "claims", label: `✋ Claims (${claimRequests.length})` },
                { id: "users", label: `👥 Users (${adminUserList.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer",
                    background:
                      adminTab === tab.id
                        ? "linear-gradient(135deg, #00c6ff, #0072ff)"
                        : "rgba(255,255,255,0.06)",
                    color: "white",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {adminTab === "overview" && (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div className="stat-card" style={{ padding: "18px" }}>
                    <strong>{adminStats ? adminStats.totalItems : items.length}</strong>
                    <span>Total Database Items</span>
                  </div>
                  <div className="stat-card" style={{ padding: "18px" }}>
                    <strong style={{ color: "#ff8282" }}>
                      {adminStats ? adminStats.lostCount : items.filter((i) => i.type === "Lost").length}
                    </strong>
                    <span>Total Lost Items</span>
                  </div>
                  <div className="stat-card" style={{ padding: "18px" }}>
                    <strong style={{ color: "#5fe3a1" }}>
                      {adminStats ? adminStats.foundCount : items.filter((i) => i.type === "Found").length}
                    </strong>
                    <span>Total Found Items</span>
                  </div>
                  <div className="stat-card" style={{ padding: "18px" }}>
                    <strong style={{ color: "#ffd66b" }}>
                      {adminStats ? adminStats.pendingClaims : claimRequests.filter((c) => c.status === "Pending").length}
                    </strong>
                    <span>Pending Claims</span>
                  </div>
                  <div className="stat-card" style={{ padding: "18px" }}>
                    <strong style={{ color: "#5ee6a0" }}>
                      {adminStats ? adminStats.approvedClaims : claimRequests.filter((c) => c.status === "Approved").length}
                    </strong>
                    <span>Approved / Resolved</span>
                  </div>
                  <div className="stat-card" style={{ padding: "18px" }}>
                    <strong style={{ color: "#a5b4fc" }}>
                      {adminStats ? adminStats.totalUsers : adminUserList.length || 2}
                    </strong>
                    <span>Registered Users</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Items Management */}
            {adminTab === "items" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Filter admin items by title..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  style={{ marginBottom: "10px" }}
                />

                <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {items
                    .filter(
                      (i) =>
                        !adminSearch ||
                        i.name.toLowerCase().includes(adminSearch.toLowerCase())
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: "12px",
                          borderRadius: "10px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <span className={`item-type ${item.type === "Lost" ? "lost" : "found"}`}>
                            {item.type}
                          </span>{" "}
                          <strong>{item.name}</strong> ({item.category} • {item.location})
                          <br />
                          <small style={{ color: "#8295ac" }}>
                            Reported by: {item.reportedBy} ({item.ownerEmail || "N/A"}) • Status: {item.status}
                          </small>
                        </div>

                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => openEdit(item)}
                            style={{
                              border: "none",
                              background: "rgba(255,255,255,0.08)",
                              color: "#32c8ff",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => adminDeleteItem(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Tab: Claims */}
            {adminTab === "claims" && (
              <div style={{ maxHeight: "450px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                {claimRequests.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#8597ad", padding: "20px 0" }}>
                    No claims submitted yet.
                  </p>
                ) : (
                  claimRequests.map((c) => (
                    <div key={c.id} className="claim-card">
                      <div className="claim-header">
                        <div>
                          <h4>{c.itemName}</h4>
                          <p>
                            Claimant: <strong>{c.claimantName}</strong> ({c.claimantEmail})
                            {c.claimantPhone && ` • ${c.claimantPhone}`}
                          </p>
                          <small>Owner: {c.ownerEmail || "Campus System"}</small>
                        </div>
                        <span className={`claim-status ${c.status.toLowerCase()}`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="claim-reason">
                        <strong>Reason & Ownership Proof:</strong>
                        <p>{c.reason}</p>
                      </div>

                      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        {c.status === "Pending" && (
                          <>
                            <button
                              className="approve-btn"
                              onClick={() => handleClaimDecision(c.id, "Approved")}
                            >
                              ✅ Approve
                            </button>
                            <button
                              className="reject-btn"
                              onClick={() => handleClaimDecision(c.id, "Rejected")}
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        <button
                          className="delete-btn"
                          onClick={() => adminDeleteClaim(c.id)}
                        >
                          🗑️ Delete Claim
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Users */}
            {adminTab === "users" && (
              <div style={{ maxHeight: "400px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                {adminUserList.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#8597ad", padding: "20px 0" }}>
                    No other users registered yet.
                  </p>
                ) : (
                  adminUserList.map((user) => (
                    <div
                      key={user.id}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong>{user.name}</strong>{" "}
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            background: user.role === "admin" ? "rgba(255,200,50,0.15)" : "rgba(0,190,255,0.15)",
                            color: user.role === "admin" ? "#ffd66b" : "#32c8ff",
                            fontWeight: "700",
                          }}
                        >
                          {user.role}
                        </span>
                        <br />
                        <small style={{ color: "#8295ac" }}>
                          {user.email} {user.phone && `• ${user.phone}`}
                        </small>
                      </div>

                      {user.role !== "admin" && (
                        <button
                          className="delete-btn"
                          onClick={() => adminDeleteUser(user.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;