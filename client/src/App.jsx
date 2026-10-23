import { supabase } from "./lib/supabase";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const mapDbItem = (item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    location: item.location,
    type: item.type,
    description: item.description,
    reportedBy: item.reported_by || "System",
    ownerEmail: item.owner_email || "",
    status: item.status || "Active",
    image: item.image_url || "",
  });

  const toDbItem = (item) => ({
    name: item.name,
    category: item.category,
    location: item.location,
    type: item.type,
    description: item.description,
    reported_by: null,
    owner_email: item.ownerEmail || "",
    image_url: item.image || "",
    status: item.status || "Active",
  });

  useEffect(() => {
    const loadItems = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Error:", error);
        return;
      }

      if (!data || data.length === 0) {
        const seedRows = defaultItems.map(toDbItem);
        const { data: inserted, error: insertError } = await supabase
          .from("items")
          .insert(seedRows)
          .select("*");

        if (insertError) {
          console.error("Supabase Seed Error:", insertError);
          return;
        }

        setItems(inserted.map(mapDbItem));
        console.log("Supabase Connected + default items seeded:", inserted);
      } else {
        setItems(data.map(mapDbItem));
        console.log("Supabase Connected. Items loaded:", data);
      }
    };

    loadItems();
  }, []);
  /* =====================================================
     DEFAULT DATA
  ===================================================== */

  const defaultItems = [
    {
      id: 1,
      name: "Black Wallet",
      category: "Accessories",
      location: "College Campus",
      type: "Lost",
      description: "Black leather wallet with cards.",
      reportedBy: "System",
      ownerEmail: "",
      status: "Active",
      image: "",
    },
    {
      id: 2,
      name: "Blue Backpack",
      category: "Others",
      location: "Library",
      type: "Found",
      description: "Blue backpack found near the library.",
      reportedBy: "System",
      ownerEmail: "",
      status: "Active",
      image: "",
    },
    {
      id: 3,
      name: "Wireless Earbuds",
      category: "Electronics",
      location: "Cafeteria",
      type: "Lost",
      description: "White wireless earbuds in a small case.",
      reportedBy: "System",
      ownerEmail: "",
      status: "Active",
      image: "",
    },
    {
      id: 4,
      name: "Student ID Card",
      category: "Documents",
      location: "College Campus",
      type: "Found",
      description: "Student identity card found on campus.",
      reportedBy: "System",
      ownerEmail: "",
      status: "Active",
      image: "",
    },
  ];

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
  ];

  /* =====================================================
     SEARCH
  ===================================================== */

  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState("All Categories");
  const [location, setLocation] =
    useState("Any Location");

  /* =====================================================
     MODALS
  ===================================================== */

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] =
    useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState("email");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryOtp, setRecoveryOtp] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [showReport, setShowReport] =
    useState(false);
  const [showClaim, setShowClaim] =
    useState(false);
  const [showMatch, setShowMatch] =
    useState(false);
  const [showSuccess, setShowSuccess] =
    useState(false);
  const [showEdit, setShowEdit] =
    useState(false);
  const [showNotifications, setShowNotifications] =
    useState(false);

  /* =====================================================
     ADMIN
  ===================================================== */

  const [showAdmin, setShowAdmin] =
    useState(false);

  const [adminSearch, setAdminSearch] =
    useState("");

  const [adminTab, setAdminTab] =
    useState("overview");

  /* =====================================================
     ITEM / CLAIM STATES
  ===================================================== */

  const [reportType, setReportType] =
    useState("Lost");

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [matchItem, setMatchItem] =
    useState(null);

  const [claimRequestId, setClaimRequestId] =
    useState("");

  const [reportImage, setReportImage] =
    useState("");

  const [editImage, setEditImage] =
    useState("");

  /* =====================================================
     USERS
  ===================================================== */

  const [users, setUsers] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          "lostFoundUsers"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    } catch {
      return [];
    }
  });

  /* =====================================================
     CURRENT USER
  ===================================================== */

  const [currentUser, setCurrentUser] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "lostFoundCurrentUser"
          );

        return saved
          ? JSON.parse(saved)
          : null;
      } catch {
        return null;
      }
    });

  /* =====================================================
     ITEMS
  ===================================================== */

  const [items, setItems] = useState(() => {
    try {
      const saved =
        localStorage.getItem(
          "lostFoundItems"
        );

      return saved
        ? JSON.parse(saved)
        : defaultItems;
    } catch {
      return defaultItems;
    }
  });

  /* =====================================================
     CLAIMS
  ===================================================== */

  const [claimRequests, setClaimRequests] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "lostFoundClaims"
          );

        return saved
          ? JSON.parse(saved)
          : [];
      } catch {
        return [];
      }
    });

  // Load saved claim requests from Supabase so they survive a page refresh.
  useEffect(() => {
    const loadClaims = async () => {
      const { data, error } = await supabase
        .from("claims")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Claims Load Error:", error);
        return;
      }

      const savedClaims = (data || []).map((claim) => ({
        id: claim.id,
        itemId: claim.item_id,
        itemName: claim.item_name,
        claimantName: claim.claimant_name,
        claimantEmail: claim.claimant_email,
        ownerEmail: claim.owner_email,
        reason: claim.reason,
        status: claim.status || "Pending",
        createdAt: claim.created_at,
      }));

      setClaimRequests(savedClaims);
    };

    loadClaims();
  }, []);

  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const [notifications, setNotifications] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "lostFoundNotifications"
          );

        return saved
          ? JSON.parse(saved)
          : [];
      } catch {
        return [];
      }
    });

  /* =====================================================
     SAVE TO LOCAL STORAGE
  ===================================================== */

  useEffect(() => {
    localStorage.setItem(
      "lostFoundUsers",
      JSON.stringify(users)
    );
  }, [users]);

  useEffect(() => {
    localStorage.setItem(
      "lostFoundCurrentUser",
      JSON.stringify(currentUser)
    );
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(
      "lostFoundItems",
      JSON.stringify(items)
    );
  }, [items]);

  useEffect(() => {
    localStorage.setItem(
      "lostFoundClaims",
      JSON.stringify(claimRequests)
    );
  }, [claimRequests]);

  useEffect(() => {
    localStorage.setItem(
      "lostFoundNotifications",
      JSON.stringify(
        notifications
      )
    );
  }, [notifications]);

  /* =====================================================
     ADMIN CHECK
  ===================================================== */

  const isAdmin =
    currentUser?.role === "admin";

  /* =====================================================
     NOTIFICATION HELPER
  ===================================================== */

  const addNotification = ({
    recipientEmail,
    title,
    message,
    type = "info",
  }) => {
    if (!recipientEmail) return;

    const notification = {
      id: Date.now() + Math.random(),
      recipientEmail,
      title,
      message,
      type,
      read: false,
      createdAt:
        new Date().toLocaleString(),
    };

    setNotifications((prev) => [
      notification,
      ...prev,
    ]);
  };

  const userNotifications =
    currentUser
      ? notifications.filter(
        (notification) =>
          notification.recipientEmail ===
          currentUser.email
      )
      : [];

  const unreadNotifications =
    userNotifications.filter(
      (notification) =>
        !notification.read
    );

  const markNotificationRead = (
    id
  ) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
            ...notification,
            read: true,
          }
          : notification
      )
    );
  };

  const markAllNotificationsRead =
    () => {
      if (!currentUser) return;

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.recipientEmail ===
            currentUser.email
            ? {
              ...notification,
              read: true,
            }
            : notification
        )
      );
    };

  const clearNotifications = () => {
    if (!currentUser) return;

    setNotifications((prev) =>
      prev.filter(
        (notification) =>
          notification.recipientEmail !==
          currentUser.email
      )
    );
  };

  /* =====================================================
     SEARCH / FILTER
  ===================================================== */

  const filteredItems = items.filter(
    (item) => {
      const text =
        search.toLowerCase();

      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(text) ||
        item.description
          .toLowerCase()
          .includes(text) ||
        item.location
          .toLowerCase()
          .includes(text);

      const matchesCategory =
        category ===
        "All Categories" ||
        item.category === category;

      const matchesLocation =
        location === "Any Location" ||
        item.location === location;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation
      );
    }
  );

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const scrollToSection = (id) => {
    const section =
      document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  /* =====================================================
     SIGNUP
  ===================================================== */

  const handleSignup = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }
    if (users.some((user) => user.email === email)) {
      alert("This account already exists in this browser. Please login.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      alert("Signup failed: " + error.message);
      return;
    }

    const newUser = {
      id: data.user?.id || Date.now(),
      name,
      email,
      role: "user",
    };
    setUsers((prev) => [...prev.filter((user) => user.email !== email), newUser]);

    if (data.session) {
      setCurrentUser(newUser);
      setShowSignup(false);
      alert(`Welcome ${name}! Your account has been created.`);
    } else {
      setShowSignup(false);
      setShowLogin(true);
      alert("Account created. Check your email to confirm your account, then login.");
    }
  };

  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    if (email === "admin@lostfound.com" && password === "admin123") {
      const adminUser = {
        id: "admin",
        name: "Administrator",
        email: "admin@lostfound.com",
        role: "admin",
      };
      setCurrentUser(adminUser);
      setShowLogin(false);
      alert("Admin login successful!");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      const profile = {
        id: data.user.id,
        name: data.user.user_metadata?.name || email.split("@")[0],
        email,
        role: "user",
      };
      setUsers((prev) => [...prev.filter((user) => user.email !== email), profile]);
      setCurrentUser(profile);
      setShowLogin(false);
      alert(`Welcome back, ${profile.name}!`);
      return;
    }

    // Compatibility for accounts created by the old local-only demo login.
    const legacyUser = users.find((user) => user.email === email && user.password === password);
    if (legacyUser) {
      setCurrentUser(legacyUser);
      setShowLogin(false);
      alert("Logged in with a legacy local account. Create a new Supabase-auth account to use email password recovery.");
      return;
    }

    alert("Login failed. Check your email/password, or confirm your email first. " + (error?.message || ""));
  };

  const handleSendRecoveryOtp = async (e) => {
    e.preventDefault();
    const email = recoveryEmail.trim().toLowerCase();
    if (!email) {
      alert("Please enter your email address.");
      return;
    }
    setRecoveryBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setRecoveryBusy(false);
    if (error) {
      alert("Could not send recovery email: " + error.message);
      return;
    }
    setRecoveryEmail(email);
    setRecoveryStep("otp");
    alert("If this email belongs to an account, recovery instructions have been sent. Check your inbox and spam folder.");
  };

  const handleVerifyRecoveryOtp = async (e) => {
    e.preventDefault();
    if (!recoveryEmail || !recoveryOtp.trim() || !recoveryPassword) {
      alert("Enter your email OTP and a new password.");
      return;
    }
    if (recoveryPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }
    setRecoveryBusy(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: recoveryEmail,
      token: recoveryOtp.trim(),
      type: "recovery",
    });
    if (verifyError) {
      setRecoveryBusy(false);
      alert("OTP verification failed: " + verifyError.message);
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: recoveryPassword });
    setRecoveryBusy(false);
    if (updateError) {
      alert("Could not update password: " + updateError.message);
      return;
    }
    setShowForgotPassword(false);
    setShowLogin(true);
    setRecoveryStep("email");
    setRecoveryOtp("");
    setRecoveryPassword("");
    alert("Password reset successful. Please login with your new password.");
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    setCurrentUser(null);
    setShowNotifications(false);
    setShowAdmin(false);

    alert(
      "Logged out successfully."
    );
  };

  /* =====================================================
     REPORT ITEM
  ===================================================== */

  const openReport = (type) => {
    if (!currentUser) {
      alert(
        "Please login first."
      );
      setShowLogin(true);
      return;
    }

    if (isAdmin) {
      alert(
        "Admin account cannot report items."
      );
      return;
    }

    setReportType(type);
    setReportImage("");
    setShowReport(true);
  };

  const handleReportImage = (
    e
  ) => {
    const file =
      e.target.files[0];

    if (!file) return;

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      alert(
        "Image should be less than 2MB."
      );

      e.target.value = "";
      return;
    }

    const reader =
      new FileReader();

    reader.onloadend = () => {
      setReportImage(
        reader.result
      );
    };

    reader.readAsDataURL(file);
  };

  const handleReportSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!currentUser) {
      alert(
        "Please login first."
      );
      return;
    }

    const form =
      new FormData(e.target);

    const name =
      form.get("name").trim();

    const description =
      form
        .get("description")
        .trim();

    if (
      !name ||
      !description
    ) {
      alert(
        "Please fill required fields."
      );
      return;
    }

    const newItem = {
      id: Date.now(),
      name,
      category:
        form.get("category"),
      location:
        form.get("location"),
      type: reportType,
      description,
      reportedBy:
        currentUser.name,
      ownerEmail:
        currentUser.email,
      status: "Active",
      image: reportImage,
    };

    const { data: insertedItem, error } = await supabase
      .from("items")
      .insert(toDbItem(newItem))
      .select("*")
      .single();

    if (error) {
      console.error("Supabase Report Error:", error);
      alert(`Could not save item to database: ${error.message}`);
      return;
    }

    setItems((prev) => [
      mapDbItem(insertedItem),
      ...prev,
    ]);

    setShowReport(false);
    setReportImage("");

    alert(
      `${reportType} item reported successfully!`
    );
  };

  /* =====================================================
     EDIT ITEM
  ===================================================== */

  const openEdit = (item) => {
    if (!currentUser) return;

    if (
      item.ownerEmail !==
      currentUser.email
    ) {
      alert(
        "You can only edit your own items."
      );
      return;
    }

    setSelectedItem(item);
    setEditImage(
      item.image || ""
    );
    setShowEdit(true);
  };

  const handleEditImage = (
    e
  ) => {
    const file =
      e.target.files[0];

    if (!file) return;

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      alert(
        "Image should be less than 2MB."
      );

      e.target.value = "";
      return;
    }

    const reader =
      new FileReader();

    reader.onloadend = () => {
      setEditImage(
        reader.result
      );
    };

    reader.readAsDataURL(file);
  };

  const handleEditSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (
      !selectedItem ||
      !currentUser
    ) {
      return;
    }

    const form =
      new FormData(e.target);

    const updatedName =
      form
        .get("name")
        .trim();

    const updatedDescription =
      form
        .get("description")
        .trim();

    if (
      !updatedName ||
      !updatedDescription
    ) {
      alert(
        "Please fill required fields."
      );
      return;
    }

    const updatedItem = {
      ...selectedItem,
      name: updatedName,
      category: form.get("category"),
      location: form.get("location"),
      description: updatedDescription,
      image: editImage,
    };

    const { data: savedItem, error } = await supabase
      .from("items")
      .update(toDbItem(updatedItem))
      .eq("id", selectedItem.id)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase Edit Error:", error);
      alert(`Could not update item: ${error.message}`);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? mapDbItem(savedItem)
          : item
      )
    );

    setShowEdit(false);
    setSelectedItem(null);
    setEditImage("");

    alert(
      "Item updated successfully!"
    );
  };

  /* =====================================================
     DELETE USER ITEM
  ===================================================== */

  const deleteMyItem = async (
    itemId
  ) => {
    const item = items.find(
      (i) => i.id === itemId
    );

    if (!item) return;

    if (
      !currentUser ||
      item.ownerEmail !==
      currentUser.email
    ) {
      alert(
        "You can only delete your own items."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this item?"
      );

    if (!confirmed) return;

    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Supabase Delete Error:", error);
      alert(`Could not delete item: ${error.message}`);
      return;
    }

    setItems((prev) =>
      prev.filter(
        (item) =>
          item.id !== itemId
      )
    );

    setClaimRequests((prev) =>
      prev.filter(
        (claim) =>
          claim.itemId !==
          itemId
      )
    );
  };

  /* =====================================================
     SMART MATCH
  ===================================================== */

  const findSmartMatch = (
    item
  ) => {
    const opposite =
      item.type === "Lost"
        ? "Found"
        : "Lost";

    const matches =
      items.filter(
        (other) =>
          other.id !==
          item.id &&
          other.type ===
          opposite &&
          other.status !==
          "Returned" &&
          (
            other.name
              .toLowerCase()
              .includes(
                item.name.toLowerCase()
              ) ||
            item.name
              .toLowerCase()
              .includes(
                other.name.toLowerCase()
              ) ||
            other.category ===
            item.category ||
            other.location ===
            item.location
          )
      );

    setSelectedItem(item);

    if (
      matches.length > 0
    ) {
      setMatchItem(
        matches[0]
      );

      if (
        currentUser &&
        !isAdmin
      ) {
        addNotification({
          recipientEmail:
            currentUser.email,
          title:
            "🤖 Smart Match Found",
          message:
            `A possible match was found for "${item.name}".`,
          type: "match",
        });
      }
    } else {
      setMatchItem(null);
    }

    setShowMatch(true);
  };

  /* =====================================================
     CLAIM
  ===================================================== */

  const openClaim = (
    item
  ) => {
    if (!currentUser) {
      alert(
        "Please login first."
      );
      setShowLogin(true);
      return;
    }

    if (isAdmin) {
      alert(
        "Admin cannot claim items."
      );
      return;
    }

    if (
      item.ownerEmail ===
      currentUser.email
    ) {
      alert(
        "You cannot claim your own item."
      );
      return;
    }

    const existingClaim =
      claimRequests.find(
        (claim) =>
          claim.itemId ===
          item.id &&
          claim.claimantEmail ===
          currentUser.email &&
          claim.status ===
          "Pending"
      );

    if (existingClaim) {
      alert(
        "You already submitted a claim."
      );
      return;
    }

    setSelectedItem(item);
    setShowClaim(true);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser || !selectedItem) {
      return;
    }

    const form = new FormData(e.target);
    const reason = String(form.get("reason") || "").trim();

    if (!reason) {
      alert("Please enter a reason.");
      return;
    }

    const newClaim = {
      item_id: Number(selectedItem.id),
      item_name: selectedItem.name,
      claimant_name: currentUser.name,
      claimant_email: currentUser.email,
      owner_email: selectedItem.ownerEmail || null,
      reason,
      status: "Pending",
    };

    const { data, error } = await supabase
      .from("claims")
      .insert(newClaim)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase Claim Error:", error);
      alert("Claim save nahi hua: " + error.message);
      return;
    }

    const savedClaim = {
      id: data.id,
      itemId: data.item_id,
      itemName: data.item_name,
      claimantName: data.claimant_name,
      claimantEmail: data.claimant_email,
      ownerEmail: data.owner_email,
      reason: data.reason,
      status: data.status,
      createdAt: data.created_at,
    };

    setClaimRequests((prev) => [...prev, savedClaim]);

    addNotification({
      recipientEmail: selectedItem.ownerEmail,
      title: "📩 New Claim Request",
      message: `${currentUser.name} submitted a claim for "${selectedItem.name}".`,
      type: "claim",
    });

    setClaimRequestId(data.id);
    setShowClaim(false);
    setShowSuccess(true);
  };


/* =====================================================
   CLAIM MANAGEMENT
===================================================== */

const incomingClaims =
  currentUser
    ? claimRequests.filter(
      (claim) =>
        claim.ownerEmail ===
        currentUser.email
    )
    : [];

const myClaims =
  currentUser
    ? claimRequests.filter(
      (claim) =>
        claim.claimantEmail ===
        currentUser.email
    )
    : [];

const handleClaimDecision = async (
  claimId,
  decision
) => {
  const claim = claimRequests.find(
    (c) => String(c.id) === String(claimId)
  );

  if (!claim) {
    alert("Claim not found. Refresh the page and try again.");
    return;
  }

  // Persist the claim decision in Supabase first.
  const { data: updatedClaim, error: claimError } = await supabase
    .from("claims")
    .update({ status: decision })
    .eq("id", claimId)
    .select("*")
    .single();

  if (claimError) {
    console.error("Supabase Claim Status Error:", claimError);
    alert(`Could not update claim status: ${claimError.message}`);
    return;
  }

  const mappedClaim = {
    id: updatedClaim.id,
    itemId: updatedClaim.item_id,
    itemName: updatedClaim.item_name,
    claimantName: updatedClaim.claimant_name,
    claimantEmail: updatedClaim.claimant_email,
    ownerEmail: updatedClaim.owner_email,
    reason: updatedClaim.reason,
    status: updatedClaim.status,
    createdAt: updatedClaim.created_at,
  };

  setClaimRequests((prev) =>
    prev.map((c) =>
      String(c.id) === String(claimId) ? mappedClaim : c
    )
  );

  if (decision === "Approved") {
    const { data: returnedItem, error: itemError } = await supabase
      .from("items")
      .update({ status: "Returned" })
      .eq("id", claim.itemId)
      .select("*")
      .single();

    if (itemError) {
      console.error("Supabase Item Status Error:", itemError);
      alert(`Claim was approved, but item status could not be updated: ${itemError.message}`);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        String(item.id) === String(claim.itemId)
          ? mapDbItem(returnedItem)
          : item
      )
    );

    addNotification({
      recipientEmail: claim.claimantEmail,
      title: "✅ Claim Approved",
      message: `Your claim for "${claim.itemName}" has been approved.`,
      type: "success",
    });

    alert("Claim approved. Item marked as Returned.");
    return;
  }

  if (decision === "Rejected") {
    addNotification({
      recipientEmail: claim.claimantEmail,
      title: "❌ Claim Rejected",
      message: `Your claim for "${claim.itemName}" has been rejected.`,
      type: "error",
    });

    alert("Claim rejected.");
  }
};

/* =====================================================
   ADMIN FUNCTIONS
===================================================== */

const adminDeleteItem = async (
  itemId
) => {
  const confirmed = window.confirm("Admin: Delete this item?");
  if (!confirmed) return;

  const item = items.find((i) => String(i.id) === String(itemId));

  // Remove related claims first, then the item, so the UI and database stay in sync.
  const { error: claimsError } = await supabase
    .from("claims")
    .delete()
    .eq("item_id", itemId);

  if (claimsError) {
    console.error("Supabase Admin Claim Delete Error:", claimsError);
    alert(`Could not delete related claims: ${claimsError.message}`);
    return;
  }

  const { error: itemError } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId);

  if (itemError) {
    console.error("Supabase Admin Item Delete Error:", itemError);
    alert(`Could not delete item: ${itemError.message}`);
    return;
  }

  setItems((prev) => prev.filter((entry) => String(entry.id) !== String(itemId)));
  setClaimRequests((prev) => prev.filter((claim) => String(claim.itemId) !== String(itemId)));

  if (item?.ownerEmail) {
    addNotification({
      recipientEmail: item.ownerEmail,
      title: "⚠️ Item Removed",
      message: `Your item "${item.name}" was removed by the administrator.`,
      type: "error",
    });
  }
};

const adminDeleteUser = (
  email
) => {
  const confirmed =
    window.confirm(
      "Admin: Delete this user?"
    );

  if (!confirmed) return;

  setUsers((prev) =>
    prev.filter(
      (user) =>
        user.email !== email
    )
  );

  setItems((prev) =>
    prev.filter(
      (item) =>
        item.ownerEmail !==
        email
    )
  );

  setClaimRequests(
    (prev) =>
      prev.filter(
        (claim) =>
          claim.claimantEmail !==
          email &&
          claim.ownerEmail !==
          email
      )
  );

  setNotifications(
    (prev) =>
      prev.filter(
        (notification) =>
          notification.recipientEmail !==
          email
      )
  );

  alert(
    "User removed successfully."
  );
};

const adminDeleteClaim = async (
  claimId
) => {
  const confirmed = window.confirm("Admin: Delete this claim?");
  if (!confirmed) return;

  const { error } = await supabase
    .from("claims")
    .delete()
    .eq("id", claimId);

  if (error) {
    console.error("Supabase Admin Claim Delete Error:", error);
    alert(`Could not delete claim: ${error.message}`);
    return;
  }

  setClaimRequests((prev) =>
    prev.filter((claim) => String(claim.id) !== String(claimId))
  );

  alert("Claim deleted.");
};

const adminApproveClaim = (
  claimId
) => {
  handleClaimDecision(
    claimId,
    "Approved"
  );
};

const adminRejectClaim = (
  claimId
) => {
  handleClaimDecision(
    claimId,
    "Rejected"
  );
};

const adminFilteredItems =
  items.filter((item) => {
    const text =
      adminSearch.toLowerCase();

    return (
      item.name
        .toLowerCase()
        .includes(text) ||
      item.location
        .toLowerCase()
        .includes(text) ||
      item.category
        .toLowerCase()
        .includes(text) ||
      item.type
        .toLowerCase()
        .includes(text)
    );
  });

const adminFilteredUsers =
  users.filter((user) => {
    const text =
      adminSearch.toLowerCase();

    return (
      user.name
        .toLowerCase()
        .includes(text) ||
      user.email
        .toLowerCase()
        .includes(text)
    );
  });

const pendingClaims =
  claimRequests.filter(
    (claim) =>
      claim.status ===
      "Pending"
  );

const approvedClaims =
  claimRequests.filter(
    (claim) =>
      claim.status ===
      "Approved"
  );

const rejectedClaims =
  claimRequests.filter(
    (claim) =>
      claim.status ===
      "Rejected"
  );

/* =====================================================
   CLOSE MODALS
===================================================== */

const closeAllModals = () => {
  setShowLogin(false);
  setShowSignup(false);
  setShowForgotPassword(false);
  setRecoveryStep("email");
  setRecoveryOtp("");
  setRecoveryPassword("");
  setShowReport(false);
  setShowClaim(false);
  setShowMatch(false);
  setShowSuccess(false);
  setShowEdit(false);

  setSelectedItem(null);
  setMatchItem(null);
  setReportImage("");
  setEditImage("");
};

/* =====================================================
   STATS
===================================================== */

const totalItems =
  items.length;

const lostItems =
  items.filter(
    (item) =>
      item.type === "Lost" &&
      item.status !==
      "Returned"
  ).length;

const foundItems =
  items.filter(
    (item) =>
      item.type === "Found" &&
      item.status !==
      "Returned"
  ).length;

const returnedItems =
  items.filter(
    (item) =>
      item.status ===
      "Returned"
  ).length;

/* =====================================================
   RETURN UI
===================================================== */

return (
  <div className="app">

    {/* =================================================
          NAVBAR
      ================================================= */}

    <nav className="navbar">

      <div
        className="logo"
        onClick={() =>
          scrollToSection(
            "home"
          )
        }
      >

        <div className="logo-icon">
          📍
        </div>

        <div>
          <div className="logo-text">
            Lost & Found
          </div>

          <small>
            Reconnecting What Matters.
          </small>
        </div>

      </div>

      <div className="nav-links">

        <button
          onClick={() =>
            scrollToSection(
              "home"
            )
          }
        >
          Home
        </button>

        <button
          onClick={() =>
            scrollToSection(
              "items"
            )
          }
        >
          Lost Items
        </button>

        <button
          onClick={() =>
            scrollToSection(
              "items"
            )
          }
        >
          Found Items
        </button>

        <button
          onClick={() =>
            scrollToSection(
              "how-it-works"
            )
          }
        >
          How It Works
        </button>

        {currentUser &&
          !isAdmin && (
            <button
              onClick={() =>
                scrollToSection(
                  "dashboard"
                )
              }
            >
              Dashboard
            </button>
          )}

      </div>

      <div className="nav-actions">

        {/* NOTIFICATION */}

        {currentUser && (
          <div
            style={{
              position:
                "relative",
            }}
          >

            <button
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              style={{
                width: "42px",
                height:
                  "42px",
                borderRadius:
                  "12px",
                border:
                  "1px solid rgba(255,255,255,.12)",
                background:
                  "rgba(255,255,255,.06)",
                color:
                  "white",
                fontSize:
                  "19px",
                position:
                  "relative",
                cursor:
                  "pointer",
              }}
            >
              🔔

              {unreadNotifications.length >
                0 && (
                  <span
                    style={{
                      position:
                        "absolute",
                      top: "-5px",
                      right:
                        "-5px",
                      minWidth:
                        "19px",
                      height:
                        "19px",
                      padding:
                        "0 4px",
                      borderRadius:
                        "20px",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      background:
                        "#ff3d5a",
                      color:
                        "white",
                      fontSize:
                        "10px",
                      fontWeight:
                        "800",
                      border:
                        "2px solid #07111f",
                    }}
                  >
                    {unreadNotifications.length >
                      9
                      ? "9+"
                      : unreadNotifications.length}
                  </span>
                )}

            </button>

            {showNotifications && (
              <div
                style={{
                  position:
                    "absolute",
                  top:
                    "52px",
                  right: 0,
                  width:
                    "350px",
                  maxHeight:
                    "450px",
                  overflowY:
                    "auto",
                  padding:
                    "15px",
                  borderRadius:
                    "16px",
                  background:
                    "#0b192a",
                  border:
                    "1px solid rgba(255,255,255,.12)",
                  boxShadow:
                    "0 25px 70px rgba(0,0,0,.45)",
                  zIndex:
                    500,
                }}
              >

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    marginBottom:
                      "12px",
                  }}
                >

                  <strong>
                    Notifications
                  </strong>

                  <button
                    onClick={
                      markAllNotificationsRead
                    }
                    style={{
                      border:
                        "none",
                      background:
                        "transparent",
                      color:
                        "#36c9ff",
                      fontSize:
                        "11px",
                      cursor:
                        "pointer",
                    }}
                  >
                    Mark all read
                  </button>

                </div>

                {userNotifications.length ===
                  0 ? (
                  <div
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "35px 10px",
                      color:
                        "#728197",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "35px",
                      }}
                    >
                      🔕
                    </div>

                    <p>
                      No notifications yet.
                    </p>
                  </div>
                ) : (
                  userNotifications.map(
                    (
                      notification
                    ) => (
                      <div
                        key={
                          notification.id
                        }
                        onClick={() =>
                          markNotificationRead(
                            notification.id
                          )
                        }
                        style={{
                          padding:
                            "12px",
                          marginBottom:
                            "8px",
                          borderRadius:
                            "11px",
                          background:
                            notification.read
                              ? "rgba(255,255,255,.025)"
                              : "rgba(0,190,255,.08)",
                          border:
                            notification.read
                              ? "1px solid rgba(255,255,255,.05)"
                              : "1px solid rgba(0,190,255,.18)",
                          cursor:
                            "pointer",
                        }}
                      >

                        <strong
                          style={{
                            fontSize:
                              "12px",
                          }}
                        >
                          {
                            notification.title
                          }
                        </strong>

                        <p
                          style={{
                            margin:
                              "6px 0",
                            color:
                              "#8998ad",
                            fontSize:
                              "11px",
                          }}
                        >
                          {
                            notification.message
                          }
                        </p>

                        <small
                          style={{
                            color:
                              "#536277",
                            fontSize:
                              "9px",
                          }}
                        >
                          {
                            notification.createdAt
                          }
                        </small>

                      </div>
                    )
                  )
                )}

                {userNotifications.length >
                  0 && (
                    <button
                      onClick={
                        clearNotifications
                      }
                      style={{
                        width:
                          "100%",
                        padding:
                          "9px",
                        border:
                          "none",
                        borderRadius:
                          "8px",
                        background:
                          "rgba(255,60,60,.08)",
                        color:
                          "#ff8585",
                        cursor:
                          "pointer",
                      }}
                    >
                      🗑️ Clear Notifications
                    </button>
                  )}

              </div>
            )}

          </div>
        )}

        {currentUser ? (
          <>

            {isAdmin && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowAdmin(true);
                  setAdminTab(
                    "overview"
                  );
                }}
              >
                🛡️ Admin
              </button>
            )}

            <span className="welcome-user">
              Hi,{" "}
              {currentUser.name}
            </span>

            <button
              className="btn btn-outline"
              onClick={
                handleLogout
              }
            >
              Logout
            </button>

          </>
        ) : (
          <>

            <button
              className="btn btn-outline"
              onClick={() =>
                setShowLogin(true)
              }
            >
              Login
            </button>

            <button
              className="btn btn-primary"
              onClick={() =>
                setShowSignup(
                  true
                )
              }
            >
              Sign Up
            </button>

          </>
        )}

      </div>

    </nav>

    {/* =================================================
          HERO
      ================================================= */}

    <section
      id="home"
      className="hero"
    >

      <div className="hero-content">

        <div className="hero-badge">
          🔎 Smart Lost & Found Platform
        </div>

        <h1>
          Lost Something?
          <br />
          <span>
            Let's Find It.
          </span>
        </h1>

        <p>
          A smart platform that
          connects people with
          their lost belongings
          through intelligent
          matching and simple
          claim management.
        </p>

        <div className="hero-buttons">

          <button
            className="btn btn-primary btn-large"
            onClick={() =>
              openReport(
                "Lost"
              )
            }
          >
            🔍 Report Lost Item
          </button>

          <button
            className="btn btn-secondary btn-large"
            onClick={() =>
              openReport(
                "Found"
              )
            }
          >
            📦 Report Found Item
          </button>

        </div>

      </div>

      <div className="hero-card">

        <div className="floating-card">

          <div className="floating-icon">
            🔔
          </div>

          <div>

            <strong>
              Smart Match Found!
            </strong>

            <p>
              Your lost wallet may
              have been found nearby.
            </p>

          </div>

        </div>

        <div className="hero-circle">
          🔎
        </div>

      </div>

    </section>

    {/* =================================================
          STATS
      ================================================= */}

    <section className="stats-section">

      <div className="stat-card">
        <strong>
          {totalItems}
        </strong>
        <span>
          Total Reports
        </span>
      </div>

      <div className="stat-card">
        <strong>
          {lostItems}
        </strong>
        <span>
          Lost Items
        </span>
      </div>

      <div className="stat-card">
        <strong>
          {foundItems}
        </strong>
        <span>
          Found Items
        </span>
      </div>

      <div className="stat-card">
        <strong>
          {returnedItems}
        </strong>
        <span>
          Returned
        </span>
      </div>

    </section>

    {/* =================================================
          SEARCH
      ================================================= */}

    <section className="search-section">

      <div className="section-heading">

        <span>
          SEARCH
        </span>

        <h2>
          Find Your Item
        </h2>

        <p>
          Search through lost and
          found reports.
        </p>

      </div>

      <div className="search-box">

        <input
          type="text"
          placeholder="Search item, description or location..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }
        >
          {categories.map(
            (cat) => (
              <option key={cat}>
                {cat}
              </option>
            )
          )}
        </select>

        <select
          value={location}
          onChange={(e) =>
            setLocation(
              e.target.value
            )
          }
        >
          {locations.map(
            (loc) => (
              <option key={loc}>
                {loc}
              </option>
            )
          )}
        </select>

      </div>

    </section>

    {/* =================================================
          ITEMS
      ================================================= */}

    <section
      id="items"
      className="items-section"
    >

      <div className="section-heading">

        <span>
          LISTINGS
        </span>

        <h2>
          Lost & Found Items
        </h2>

        <p>
          Browse recently reported
          items.
        </p>

      </div>

      <div className="items-grid">

        {filteredItems.length ===
          0 ? (
          <div className="empty-state">

            <div>
              🔍
            </div>

            <h3>
              No items found
            </h3>

            <p>
              Try changing your
              search or filters.
            </p>

          </div>
        ) : (
          filteredItems.map(
            (item) => (
              <div
                className={`item-card ${item.status ===
                    "Returned"
                    ? "returned-card"
                    : ""
                  }`}
                key={item.id}
              >

                <div className="item-top">

                  <span
                    className={`item-type ${item.type ===
                        "Lost"
                        ? "lost"
                        : "found"
                      }`}
                  >
                    {item.type}
                  </span>

                  {item.status ===
                    "Returned" && (
                      <span className="returned-badge">
                        Returned
                      </span>
                    )}

                </div>

                {item.image ? (
                  <img
                    src={
                      item.image
                    }
                    alt={
                      item.name
                    }
                    style={{
                      width:
                        "100%",
                      height:
                        "170px",
                      objectFit:
                        "cover",
                      borderRadius:
                        "14px",
                      marginTop:
                        "15px",
                    }}
                  />
                ) : (
                  <div className="item-icon">

                    {item.category ===
                      "Electronics"
                      ? "🎧"
                      : item.category ===
                        "Documents"
                        ? "📄"
                        : item.category ===
                          "Accessories"
                          ? "👛"
                          : "📦"}

                  </div>
                )}

                <h3>
                  {item.name}
                </h3>

                <p>
                  {item.description}
                </p>

                <div className="item-info">

                  <span>
                    📍{" "}
                    {item.location}
                  </span>

                  <span>
                    🏷️{" "}
                    {item.category}
                  </span>

                </div>

                <div className="item-footer">

                  <small>
                    Reported by{" "}
                    <strong>
                      {
                        item.reportedBy
                      }
                    </strong>
                  </small>

                  {item.status !==
                    "Returned" &&
                    item.type ===
                    "Found" && (
                      <button
                        className="claim-btn"
                        onClick={() =>
                          openClaim(
                            item
                          )
                        }
                      >
                        Claim
                      </button>
                    )}

                  {item.status !==
                    "Returned" && (
                      <button
                        className="match-btn"
                        onClick={() =>
                          findSmartMatch(
                            item
                          )
                        }
                      >
                        🤖 Match
                      </button>
                    )}

                </div>

              </div>
            )
          )
        )}

      </div>

    </section>

    {/* =================================================
          FEATURES
      ================================================= */}

    <section className="features-section">

      <div className="section-heading">

        <span>
          FEATURES
        </span>

        <h2>
          Everything You Need
        </h2>

        <p>
          Built to make recovering
          lost belongings simple
          and secure.
        </p>

      </div>

      <div className="features-grid">

        <div className="feature-card">
          <div className="feature-icon">
            🔎
          </div>

          <h3>
            Smart Search
          </h3>

          <p>
            Quickly search items by
            name, category and
            location.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            🤖
          </div>

          <h3>
            Smart Matching
          </h3>

          <p>
            Find possible matches
            between lost and found
            reports.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            🔐
          </div>

          <h3>
            Secure Claims
          </h3>

          <p>
            Users can submit and
            manage ownership claims.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            🔔
          </div>

          <h3>
            Notifications
          </h3>

          <p>
            Get updates when claims
            are submitted, approved
            or rejected.
          </p>
        </div>

      </div>

    </section>

    {/* =================================================
          HOW IT WORKS
      ================================================= */}

    <section
      id="how-it-works"
      className="how-section"
    >

      <div className="section-heading">

        <span>
          PROCESS
        </span>

        <h2>
          How It Works
        </h2>

      </div>

      <div className="steps">

        <div className="step">
          <div className="step-number">
            01
          </div>

          <h3>
            Report
          </h3>

          <p>
            Report your lost or
            found item.
          </p>
        </div>

        <div className="step">
          <div className="step-number">
            02
          </div>

          <h3>
            Match
          </h3>

          <p>
            Find possible matches.
          </p>
        </div>

        <div className="step">
          <div className="step-number">
            03
          </div>

          <h3>
            Claim
          </h3>

          <p>
            Submit an ownership
            claim.
          </p>
        </div>

        <div className="step">
          <div className="step-number">
            04
          </div>

          <h3>
            Return
          </h3>

          <p>
            Owner approves and item
            gets returned.
          </p>
        </div>

      </div>

    </section>

    {/* =================================================
          USER DASHBOARD
      ================================================= */}

    {currentUser &&
      !isAdmin && (
        <section
          id="dashboard"
          className="dashboard-section"
        >

          <div className="section-heading">

            <span>
              MY ACCOUNT
            </span>

            <h2>
              Dashboard
            </h2>

            <p>
              Manage your reports
              and claims.
            </p>

          </div>

          <div className="dashboard-stats">

            <div className="dashboard-stat">
              <strong>
                {
                  items.filter(
                    (item) =>
                      item.ownerEmail ===
                      currentUser.email
                  ).length
                }
              </strong>

              <span>
                My Reports
              </span>
            </div>

            <div className="dashboard-stat">
              <strong>
                {
                  myClaims.length
                }
              </strong>

              <span>
                My Claims
              </span>
            </div>

            <div className="dashboard-stat">
              <strong>
                {
                  myClaims.filter(
                    (claim) =>
                      claim.status ===
                      "Approved"
                  ).length
                }
              </strong>

              <span>
                Approved
              </span>
            </div>

            <div className="dashboard-stat">
              <strong>
                {
                  unreadNotifications.length
                }
              </strong>

              <span>
                Unread Alerts
              </span>
            </div>

          </div>

          {/* MY ITEMS */}

          <div className="dashboard-box">

            <div className="dashboard-title">
              <h3>
                📦 My Reported Items
              </h3>
            </div>

            <div className="dashboard-list">

              {items.filter(
                (item) =>
                  item.ownerEmail ===
                  currentUser.email
              ).length === 0 ? (
                <p className="empty-text">
                  You haven't reported
                  any items yet.
                </p>
              ) : (
                items
                  .filter(
                    (item) =>
                      item.ownerEmail ===
                      currentUser.email
                  )
                  .map((item) => (
                    <div
                      className="dashboard-item"
                      key={item.id}
                    >

                      <div
                        style={{
                          display:
                            "flex",
                          gap:
                            "14px",
                          alignItems:
                            "center",
                        }}
                      >

                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name
                            }
                            style={{
                              width:
                                "65px",
                              height:
                                "65px",
                              objectFit:
                                "cover",
                              borderRadius:
                                "10px",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width:
                                "65px",
                              height:
                                "65px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              borderRadius:
                                "10px",
                              background:
                                "rgba(0,190,255,.08)",
                              fontSize:
                                "25px",
                            }}
                          >
                            📦
                          </div>
                        )}

                        <div>

                          <strong>
                            {item.name}
                          </strong>

                          <p>
                            {
                              item.type
                            }{" "}
                            •{" "}
                            {
                              item.location
                            }
                          </p>

                          <span
                            className={
                              item.status ===
                                "Returned"
                                ? "status returned"
                                : "status active"
                            }
                          >
                            {
                              item.status
                            }
                          </span>

                        </div>

                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          gap:
                            "8px",
                        }}
                      >

                        <button
                          className="btn btn-outline"
                          onClick={() =>
                            openEdit(
                              item
                            )
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteMyItem(
                              item.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>
                  ))
              )}

            </div>

          </div>

          {/* INCOMING CLAIMS */}

          <div className="dashboard-box">

            <div className="dashboard-title">
              <h3>
                📩 Incoming Claim
                Requests
              </h3>
            </div>

            {incomingClaims.length ===
              0 ? (
              <p className="empty-text">
                No claim requests for
                your items.
              </p>
            ) : (
              <div className="claims-list">

                {incomingClaims.map(
                  (claim) => (
                    <div
                      className="claim-card"
                      key={claim.id}
                    >

                      <div className="claim-header">

                        <div>

                          <h4>
                            {
                              claim.itemName
                            }
                          </h4>

                          <p>
                            Claimed by{" "}
                            <strong>
                              {
                                claim.claimantName
                              }
                            </strong>
                          </p>

                          <small>
                            {
                              claim.claimantEmail
                            }
                          </small>

                        </div>

                        <span
                          className={`claim-status ${claim.status.toLowerCase()}`}
                        >
                          {
                            claim.status
                          }
                        </span>

                      </div>

                      <div className="claim-reason">

                        <strong>
                          Claim Reason:
                        </strong>

                        <p>
                          {
                            claim.reason
                          }
                        </p>

                      </div>

                      {claim.status ===
                        "Pending" && (
                          <div className="claim-actions">

                            <button
                              className="approve-btn"
                              onClick={() =>
                                handleClaimDecision(
                                  claim.id,
                                  "Approved"
                                )
                              }
                            >
                              ✅ Approve
                            </button>

                            <button
                              className="reject-btn"
                              onClick={() =>
                                handleClaimDecision(
                                  claim.id,
                                  "Rejected"
                                )
                              }
                            >
                              ❌ Reject
                            </button>

                          </div>
                        )}

                    </div>
                  )
                )}

              </div>
            )}

          </div>

          {/* MY CLAIMS */}

          <div className="dashboard-box">

            <div className="dashboard-title">
              <h3>
                📝 My Claim Requests
              </h3>
            </div>

            {myClaims.length ===
              0 ? (
              <p className="empty-text">
                You haven't submitted
                any claims.
              </p>
            ) : (
              <div className="claims-list">

                {myClaims.map(
                  (claim) => (
                    <div
                      className="claim-card"
                      key={claim.id}
                    >

                      <div className="claim-header">

                        <div>

                          <h4>
                            {
                              claim.itemName
                            }
                          </h4>

                          <p>
                            {
                              claim.createdAt
                            }
                          </p>

                        </div>

                        <span
                          className={`claim-status ${claim.status.toLowerCase()}`}
                        >
                          {
                            claim.status
                          }
                        </span>

                      </div>

                      <p>
                        {
                          claim.reason
                        }
                      </p>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </section>
      )}

    {/* =================================================
          CTA
      ================================================= */}

    {!isAdmin && (
      <section className="cta-section">

        <div>

          <span>
            READY TO GET STARTED?
          </span>

          <h2>
            Help Something Find
            <br />
            Its Way Home.
          </h2>

          <p>
            Report a lost or found
            item and help reconnect
            people with what matters.
          </p>

        </div>

        <div className="cta-buttons">

          <button
            className="btn btn-primary btn-large"
            onClick={() =>
              openReport(
                "Lost"
              )
            }
          >
            Report Lost Item
          </button>

          <button
            className="btn btn-secondary btn-large"
            onClick={() =>
              openReport(
                "Found"
              )
            }
          >
            Report Found Item
          </button>

        </div>

      </section>
    )}

    {/* =================================================
          FOOTER
      ================================================= */}

    <footer className="footer">

      <div className="footer-logo">

        <div className="logo-icon">
          📍
        </div>

        <div>

          <strong>
            Lost & Found Hub
          </strong>

          <small>
            Reconnecting What Matters.
          </small>

        </div>

      </div>

      <p>
        © 2026 Lost & Found Hub.
        All rights reserved.
      </p>

    </footer>

    {/* =================================================
          LOGIN MODAL
      ================================================= */}

    {showLogin && (
      <div className="modal-overlay">

        <div className="modal">

          <button
            className="close-btn"
            onClick={
              closeAllModals
            }
          >
            ×
          </button>

          <div className="modal-icon">
            🔐
          </div>

          <h2>
            Welcome Back
          </h2>

          <p>
            Login to your account.
          </p>

          <form
            onSubmit={
              handleLogin
            }
          >

            <input
              name="email"
              type="email"
              placeholder="Email address"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              required
            />

            <button
              className="btn btn-primary full-btn"
              type="submit"
            >
              Login
            </button>

          </form>

          <div
            className="forgot-password-row"
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "flex-end",
              alignItems: "center",
              position: "static",
              clear: "both",
              marginTop: "10px",
              marginBottom: "18px",
              padding: 0,
              lineHeight: 1.4,
              boxSizing: "border-box",
            }}
          >
            <button
              type="button"
              style={{
                position: "static",
                display: "inline-block",
                float: "none",
                transform: "none",
                width: "auto",
                height: "auto",
                margin: 0,
                padding: "4px 0",
                lineHeight: 1.4,
                background: "transparent",
                border: "none",
                boxShadow: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onClick={() => {
                setRecoveryEmail("");
                setRecoveryOtp("");
                setRecoveryPassword("");
                setRecoveryStep("email");
                setShowLogin(false);
                setShowForgotPassword(true);
              }}
            >
              Forgot Password?
            </button>
          </div>

          <div className="switch-text">

            Don't have an account?{" "}

            <button
              onClick={() => {
                setShowLogin(
                  false
                );
                setShowSignup(
                  true
                );
              }}
            >
              Sign Up
            </button>

          </div>

        </div>

      </div>
    )}

    {/* =================================================
          FORGOT PASSWORD / EMAIL OTP MODAL
      ================================================= */}

    {showForgotPassword && (
      <div className="modal-overlay">
        <div className="modal">
          <button className="close-btn" onClick={() => { setShowForgotPassword(false); setShowLogin(true); }}>
            ×
          </button>
          <div className="modal-icon">📩</div>
          <h2>Reset Password</h2>
          {recoveryStep === "email" ? (
            <>
              <p>Enter your registered email to receive a password recovery code.</p>
              <form onSubmit={handleSendRecoveryOtp}>
                <input type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="Email address" required />
                <button className="btn btn-primary full-btn" type="submit" disabled={recoveryBusy}>
                  {recoveryBusy ? "Sending..." : "Send Recovery Code"}
                </button>
              </form>
            </>
          ) : (
            <>
              <p>Enter the recovery OTP from your email and choose a new password.</p>
              <form onSubmit={handleVerifyRecoveryOtp}>
                <input type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="Email address" required />
                <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={recoveryOtp} onChange={(e) => setRecoveryOtp(e.target.value)} placeholder="Recovery OTP" required />
                <input type="password" autoComplete="new-password" value={recoveryPassword} onChange={(e) => setRecoveryPassword(e.target.value)} placeholder="New password (min. 6 characters)" minLength={6} required />
                <button className="btn btn-primary full-btn" type="submit" disabled={recoveryBusy}>
                  {recoveryBusy ? "Verifying..." : "Verify OTP & Reset Password"}
                </button>
              </form>
              <div className="switch-text">
                Didn't receive the code?{" "}
                <button type="button" onClick={() => setRecoveryStep("email")}>Send again</button>
              </div>
            </>
          )}
          <div className="switch-text">
            Remembered your password?{" "}
            <button type="button" onClick={() => { setShowForgotPassword(false); setShowLogin(true); }}>Back to Login</button>
          </div>
        </div>
      </div>
    )}

    {/* =================================================
          SIGNUP MODAL
      ================================================= */}

    {showSignup && (
      <div className="modal-overlay">

        <div className="modal">

          <button
            className="close-btn"
            onClick={
              closeAllModals
            }
          >
            ×
          </button>

          <div className="modal-icon">
            👤
          </div>

          <h2>
            Create Account
          </h2>

          <p>
            Join the Lost & Found
            community.
          </p>

          <form
            onSubmit={
              handleSignup
            }
          >

            <input
              name="name"
              type="text"
              placeholder="Full name"
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email address"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Create password"
              required
            />

            <button
              className="btn btn-primary full-btn"
              type="submit"
            >
              Create Account
            </button>

          </form>

          <div className="switch-text">

            Already have an account?{" "}

            <button
              onClick={() => {
                setShowSignup(
                  false
                );
                setShowLogin(
                  true
                );
              }}
            >
              Login
            </button>

          </div>

        </div>

      </div>
    )}

    {/* =================================================
          REPORT MODAL
      ================================================= */}

    {showReport && (
      <div className="modal-overlay">

        <div className="modal large-modal">

          <button
            className="close-btn"
            onClick={
              closeAllModals
            }
          >
            ×
          </button>

          <div className="modal-icon">
            {reportType ===
              "Lost"
              ? "🔍"
              : "📦"}
          </div>

          <h2>
            Report{" "}
            {reportType} Item
          </h2>

          <p>
            Add item details and
            an optional photo.
          </p>

          <form
            onSubmit={
              handleReportSubmit
            }
          >

            <input
              name="name"
              placeholder="Item name"
              required
            />

            <select
              name="category"
              defaultValue="Electronics"
            >
              {categories
                .filter(
                  (c) =>
                    c !==
                    "All Categories"
                )
                .map((cat) => (
                  <option
                    key={cat}
                  >
                    {cat}
                  </option>
                ))}
            </select>

            <select
              name="location"
              defaultValue="College Campus"
            >
              {locations
                .filter(
                  (l) =>
                    l !==
                    "Any Location"
                )
                .map((loc) => (
                  <option
                    key={loc}
                  >
                    {loc}
                  </option>
                ))}
            </select>

            <textarea
              name="description"
              placeholder="Describe the item..."
              rows="4"
              required
            />

            <div>

              <label
                style={{
                  display:
                    "block",
                  marginBottom:
                    "8px",
                  color:
                    "#9eacc0",
                  fontSize:
                    "12px",
                }}
              >
                📷 Item Photo
                (Optional)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleReportImage
                }
              />

            </div>

            {reportImage && (
              <img
                src={
                  reportImage
                }
                alt="Preview"
                style={{
                  width:
                    "100%",
                  height:
                    "180px",
                  objectFit:
                    "cover",
                  borderRadius:
                    "12px",
                }}
              />
            )}

            <button
              className="btn btn-primary full-btn"
              type="submit"
            >
              Submit Report
            </button>

          </form>

        </div>

      </div>
    )}

    {/* =================================================
          EDIT MODAL
      ================================================= */}

    {showEdit &&
      selectedItem && (
        <div className="modal-overlay">

          <div className="modal large-modal">

            <button
              className="close-btn"
              onClick={
                closeAllModals
              }
            >
              ×
            </button>

            <div className="modal-icon">
              ✏️
            </div>

            <h2>
              Edit Item
            </h2>

            <p>
              Update your reported
              item.
            </p>

            <form
              onSubmit={
                handleEditSubmit
              }
            >

              <input
                name="name"
                defaultValue={
                  selectedItem.name
                }
                placeholder="Item name"
                required
              />

              <select
                name="category"
                defaultValue={
                  selectedItem.category
                }
              >
                {categories
                  .filter(
                    (c) =>
                      c !==
                      "All Categories"
                  )
                  .map((cat) => (
                    <option
                      key={cat}
                    >
                      {cat}
                    </option>
                  ))}
              </select>

              <select
                name="location"
                defaultValue={
                  selectedItem.location
                }
              >
                {locations
                  .filter(
                    (l) =>
                      l !==
                      "Any Location"
                  )
                  .map((loc) => (
                    <option
                      key={loc}
                    >
                      {loc}
                    </option>
                  ))}
              </select>

              <textarea
                name="description"
                defaultValue={
                  selectedItem.description
                }
                rows="4"
                required
              />

              <div>

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "8px",
                    color:
                      "#9eacc0",
                    fontSize:
                      "12px",
                  }}
                >
                  📷 Change Photo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleEditImage
                  }
                />

              </div>

              {editImage && (
                <img
                  src={
                    editImage
                  }
                  alt="Preview"
                  style={{
                    width:
                      "100%",
                    height:
                      "180px",
                    objectFit:
                      "cover",
                    borderRadius:
                      "12px",
                  }}
                />
              )}

              <button
                className="btn btn-primary full-btn"
                type="submit"
              >
                Save Changes
              </button>

            </form>

          </div>

        </div>
      )}

    {/* =================================================
          CLAIM MODAL
      ================================================= */}

    {showClaim &&
      selectedItem && (
        <div className="modal-overlay">

          <div className="modal">

            <button
              className="close-btn"
              onClick={
                closeAllModals
              }
            >
              ×
            </button>

            <div className="modal-icon">
              📝
            </div>

            <h2>
              Claim Item
            </h2>

            <p>
              Claiming:{" "}
              <strong>
                {
                  selectedItem.name
                }
              </strong>
            </p>

            <form
              onSubmit={
                handleClaimSubmit
              }
            >

              <textarea
                name="reason"
                rows="5"
                placeholder="Explain why this item belongs to you..."
                required
              />

              <button
                className="btn btn-primary full-btn"
                type="submit"
              >
                Submit Claim
              </button>

            </form>

          </div>

        </div>
      )}

    {/* =================================================
          SMART MATCH MODAL
      ================================================= */}

    {showMatch &&
      selectedItem && (
        <div className="modal-overlay">

          <div className="modal large-modal">

            <button
              className="close-btn"
              onClick={
                closeAllModals
              }
            >
              ×
            </button>

            <div className="modal-icon">
              🤖
            </div>

            <h2>
              Smart Match
            </h2>

            <p>
              Searching possible
              matches for{" "}
              <strong>
                {
                  selectedItem.name
                }
              </strong>
              .
            </p>

            {matchItem ? (
              <div className="match-result">

                <div className="match-icon">
                  🎯
                </div>

                {matchItem.image && (
                  <img
                    src={
                      matchItem.image
                    }
                    alt={
                      matchItem.name
                    }
                    style={{
                      width:
                        "100%",
                      height:
                        "150px",
                      objectFit:
                        "cover",
                      borderRadius:
                        "12px",
                      marginBottom:
                        "15px",
                    }}
                  />
                )}

                <h3>
                  Possible Match Found!
                </h3>

                <h4>
                  {
                    matchItem.name
                  }
                </h4>

                <p>
                  📍{" "}
                  {
                    matchItem.location
                  }
                </p>

                <p>
                  🏷️{" "}
                  {
                    matchItem.category
                  }
                </p>

                <button
                  className="btn btn-primary full-btn"
                  onClick={() => {
                    setShowMatch(
                      false
                    );

                    openClaim(
                      matchItem
                    );
                  }}
                >
                  View & Claim
                </button>

              </div>
            ) : (
              <div className="no-match">

                <div>
                  🔎
                </div>

                <h3>
                  No Match Found Yet
                </h3>

                <p>
                  New reports may
                  create a match
                  later.
                </p>

              </div>
            )}

          </div>

        </div>
      )}

    {/* =================================================
          SUCCESS MODAL
      ================================================= */}

    {showSuccess && (
      <div className="modal-overlay">

        <div className="modal success-modal">

          <div className="success-icon">
            ✅
          </div>

          <h2>
            Claim Submitted!
          </h2>

          <p>
            Your claim request
            has been sent to
            the item owner.
          </p>

          <p>
            Request ID:{" "}
            <strong>
              #{claimRequestId}
            </strong>
          </p>

          <button
            className="btn btn-primary full-btn"
            onClick={
              closeAllModals
            }
          >
            Done
          </button>

        </div>

      </div>
    )}

    {/* =================================================
          ADMIN PANEL
      ================================================= */}

    {showAdmin &&
      isAdmin && (
        <div
          className="modal-overlay"
          style={{
            alignItems:
              "flex-start",
            paddingTop:
              "40px",
          }}
        >

          <div
            style={{
              width:
                "min(1200px, 96%)",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              padding:
                "30px",
              borderRadius:
                "22px",
              background:
                "#081625",
              border:
                "1px solid rgba(255,255,255,.1)",
              boxShadow:
                "0 30px 100px rgba(0,0,0,.5)",
            }}
          >

            {/* ADMIN HEADER */}

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap: "15px",
                marginBottom:
                  "25px",
              }}
            >

              <div>

                <div
                  style={{
                    color:
                      "#35c7ff",
                    fontSize:
                      "11px",
                    letterSpacing:
                      "3px",
                    fontWeight:
                      "800",
                  }}
                >
                  ADMIN CONTROL CENTER
                </div>

                <h2
                  style={{
                    marginTop:
                      "8px",
                  }}
                >
                  🛡️ Admin Dashboard
                </h2>

                <p
                  style={{
                    color:
                      "#8291a7",
                    marginTop:
                      "5px",
                    fontSize:
                      "13px",
                  }}
                >
                  Manage users,
                  items and claims.
                </p>

              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setShowAdmin(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            {/* ADMIN SEARCH */}

            <input
              value={
                adminSearch
              }
              onChange={(e) =>
                setAdminSearch(
                  e.target.value
                )
              }
              placeholder="🔎 Search users, items, locations..."
              style={{
                width:
                  "100%",
                padding:
                  "14px",
                marginBottom:
                  "20px",
                borderRadius:
                  "10px",
                background:
                  "#0c1a2b",
                color:
                  "white",
                border:
                  "1px solid rgba(255,255,255,.1)",
                outline:
                  "none",
              }}
            />

            {/* ADMIN TABS */}

            <div
              style={{
                display:
                  "flex",
                gap:
                  "8px",
                flexWrap:
                  "wrap",
                marginBottom:
                  "25px",
              }}
            >

              {[
                [
                  "overview",
                  "📊 Overview",
                ],
                [
                  "users",
                  "👥 Users",
                ],
                [
                  "items",
                  "📦 Items",
                ],
                [
                  "claims",
                  "📩 Claims",
                ],
              ].map(
                ([id, label]) => (
                  <button
                    key={id}
                    onClick={() =>
                      setAdminTab(
                        id
                      )
                    }
                    style={{
                      padding:
                        "10px 16px",
                      border:
                        "none",
                      borderRadius:
                        "9px",
                      background:
                        adminTab ===
                          id
                          ? "linear-gradient(135deg,#00bfff,#006eff)"
                          : "rgba(255,255,255,.06)",
                      color:
                        "white",
                      cursor:
                        "pointer",
                      fontWeight:
                        "700",
                      fontSize:
                        "12px",
                    }}
                  >
                    {label}
                  </button>
                )
              )}

            </div>

            {/* =================================================
                  OVERVIEW
              ================================================= */}

            {adminTab ===
              "overview" && (
                <div>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(4,1fr)",
                      gap:
                        "15px",
                    }}
                  >

                    {[
                      [
                        "👥",
                        users.length,
                        "Users",
                      ],
                      [
                        "📦",
                        items.length,
                        "Items",
                      ],
                      [
                        "📩",
                        claimRequests.length,
                        "Claims",
                      ],
                      [
                        "⏳",
                        pendingClaims.length,
                        "Pending",
                      ],
                    ].map(
                      (stat) => (
                        <div
                          key={
                            stat[2]
                          }
                          style={{
                            padding:
                              "22px",
                            borderRadius:
                              "15px",
                            background:
                              "#0b192a",
                            border:
                              "1px solid rgba(255,255,255,.07)",
                            textAlign:
                              "center",
                          }}
                        >

                          <div
                            style={{
                              fontSize:
                                "24px",
                            }}
                          >
                            {
                              stat[0]
                            }
                          </div>

                          <strong
                            style={{
                              display:
                                "block",
                              fontSize:
                                "28px",
                              color:
                                "#35c7ff",
                              margin:
                                "5px 0",
                            }}
                          >
                            {
                              stat[1]
                            }
                          </strong>

                          <span
                            style={{
                              color:
                                "#8190a6",
                              fontSize:
                                "11px",
                            }}
                          >
                            {
                              stat[2]
                            }
                          </span>

                        </div>
                      )
                    )}

                  </div>

                  {/* SECOND ROW */}

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(3,1fr)",
                      gap:
                        "15px",
                      marginTop:
                        "15px",
                    }}
                  >

                    <div
                      style={{
                        padding:
                          "20px",
                        borderRadius:
                          "15px",
                        background:
                          "#0b192a",
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#8493a9",
                          fontSize:
                            "12px",
                        }}
                      >
                        🔍 Active Lost
                      </span>

                      <h3
                        style={{
                          marginTop:
                            "8px",
                        }}
                      >
                        {
                          lostItems
                        }
                      </h3>
                    </div>

                    <div
                      style={{
                        padding:
                          "20px",
                        borderRadius:
                          "15px",
                        background:
                          "#0b192a",
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#8493a9",
                          fontSize:
                            "12px",
                        }}
                      >
                        📦 Active Found
                      </span>

                      <h3
                        style={{
                          marginTop:
                            "8px",
                        }}
                      >
                        {
                          foundItems
                        }
                      </h3>
                    </div>

                    <div
                      style={{
                        padding:
                          "20px",
                        borderRadius:
                          "15px",
                        background:
                          "#0b192a",
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#8493a9",
                          fontSize:
                            "12px",
                        }}
                      >
                        ✅ Returned
                      </span>

                      <h3
                        style={{
                          marginTop:
                            "8px",
                        }}
                      >
                        {
                          returnedItems
                        }
                      </h3>
                    </div>

                  </div>

                  {/* CLAIM SUMMARY */}

                  <div
                    style={{
                      marginTop:
                        "20px",
                      padding:
                        "22px",
                      borderRadius:
                        "15px",
                      background:
                        "#0b192a",
                    }}
                  >

                    <h3>
                      📈 Claim Summary
                    </h3>

                    <div
                      style={{
                        display:
                          "flex",
                        gap:
                          "30px",
                        flexWrap:
                          "wrap",
                        marginTop:
                          "15px",
                        color:
                          "#94a3b8",
                        fontSize:
                          "13px",
                      }}
                    >

                      <span>
                        ⏳ Pending:{" "}
                        <strong>
                          {
                            pendingClaims.length
                          }
                        </strong>
                      </span>

                      <span>
                        ✅ Approved:{" "}
                        <strong>
                          {
                            approvedClaims.length
                          }
                        </strong>
                      </span>

                      <span>
                        ❌ Rejected:{" "}
                        <strong>
                          {
                            rejectedClaims.length
                          }
                        </strong>
                      </span>

                    </div>

                  </div>

                </div>
              )}

            {/* =================================================
                  USERS
              ================================================= */}

            {adminTab ===
              "users" && (
                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap:
                      "10px",
                  }}
                >

                  {adminFilteredUsers.length ===
                    0 ? (
                    <p
                      style={{
                        color:
                          "#718198",
                      }}
                    >
                      No users found.
                    </p>
                  ) : (
                    adminFilteredUsers.map(
                      (user) => (
                        <div
                          key={
                            user.id
                          }
                          style={{
                            padding:
                              "17px",
                            borderRadius:
                              "12px",
                            background:
                              "#0b192a",
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            gap:
                              "15px",
                          }}
                        >

                          <div>

                            <strong>
                              👤{" "}
                              {
                                user.name
                              }
                            </strong>

                            <p
                              style={{
                                color:
                                  "#7f8da3",
                                fontSize:
                                  "11px",
                                marginTop:
                                  "5px",
                              }}
                            >
                              {
                                user.email
                              }
                            </p>

                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "10px",
                            }}
                          >

                            <span
                              style={{
                                padding:
                                  "5px 9px",
                                borderRadius:
                                  "20px",
                                background:
                                  "rgba(0,190,255,.08)",
                                color:
                                  "#45ccff",
                                fontSize:
                                  "10px",
                              }}
                            >
                              User
                            </span>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                adminDeleteUser(
                                  user.email
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </div>
                      )
                    )
                  )}

                </div>
              )}

            {/* =================================================
                  ITEMS
              ================================================= */}

            {adminTab ===
              "items" && (
                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap:
                      "10px",
                  }}
                >

                  {adminFilteredItems.length ===
                    0 ? (
                    <p
                      style={{
                        color:
                          "#718198",
                      }}
                    >
                      No items found.
                    </p>
                  ) : (
                    adminFilteredItems.map(
                      (item) => (
                        <div
                          key={
                            item.id
                          }
                          style={{
                            padding:
                              "17px",
                            borderRadius:
                              "12px",
                            background:
                              "#0b192a",
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            gap:
                              "15px",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "13px",
                              alignItems:
                                "center",
                            }}
                          >

                            {item.image ? (
                              <img
                                src={
                                  item.image
                                }
                                alt={
                                  item.name
                                }
                                style={{
                                  width:
                                    "55px",
                                  height:
                                    "55px",
                                  objectFit:
                                    "cover",
                                  borderRadius:
                                    "9px",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width:
                                    "55px",
                                  height:
                                    "55px",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  borderRadius:
                                    "9px",
                                  background:
                                    "rgba(0,190,255,.08)",
                                }}
                              >
                                📦
                              </div>
                            )}

                            <div>

                              <strong>
                                {
                                  item.name
                                }
                              </strong>

                              <p
                                style={{
                                  color:
                                    "#7f8da3",
                                  fontSize:
                                    "11px",
                                  marginTop:
                                    "5px",
                                }}
                              >
                                {
                                  item.type
                                }{" "}
                                •{" "}
                                {
                                  item.category
                                }{" "}
                                •{" "}
                                {
                                  item.location
                                }
                              </p>

                              <small
                                style={{
                                  color:
                                    "#617087",
                                }}
                              >
                                By:{" "}
                                {
                                  item.reportedBy
                                }
                              </small>

                            </div>

                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "8px",
                              alignItems:
                                "center",
                            }}
                          >

                            <span
                              className={
                                item.status ===
                                  "Returned"
                                  ? "status returned"
                                  : "status active"
                              }
                            >
                              {
                                item.status
                              }
                            </span>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                adminDeleteItem(
                                  item.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </div>
                      )
                    )
                  )}

                </div>
              )}

            {/* =================================================
                  CLAIMS
              ================================================= */}

            {adminTab ===
              "claims" && (
                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap:
                      "12px",
                  }}
                >

                  {claimRequests.length ===
                    0 ? (
                    <p
                      style={{
                        color:
                          "#718198",
                      }}
                    >
                      No claims found.
                    </p>
                  ) : (
                    claimRequests.map(
                      (claim) => (
                        <div
                          key={
                            claim.id
                          }
                          style={{
                            padding:
                              "20px",
                            borderRadius:
                              "14px",
                            background:
                              "#0b192a",
                            border:
                              "1px solid rgba(255,255,255,.06)",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              gap:
                                "15px",
                            }}
                          >

                            <div>

                              <h3>
                                📦{" "}
                                {
                                  claim.itemName
                                }
                              </h3>

                              <p
                                style={{
                                  color:
                                    "#8493a9",
                                  fontSize:
                                    "12px",
                                  marginTop:
                                    "7px",
                                }}
                              >
                                Claimant:{" "}
                                {
                                  claim.claimantName
                                }
                              </p>

                              <p
                                style={{
                                  color:
                                    "#8493a9",
                                  fontSize:
                                    "11px",
                                }}
                              >
                                {
                                  claim.claimantEmail
                                }
                              </p>

                              <p
                                style={{
                                  color:
                                    "#8493a9",
                                  fontSize:
                                    "11px",
                                }}
                              >
                                Reason:{" "}
                                {
                                  claim.reason
                                }
                              </p>

                            </div>

                            <span
                              className={`claim-status ${claim.status.toLowerCase()}`}
                            >
                              {
                                claim.status
                              }
                            </span>

                          </div>

                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "8px",
                              marginTop:
                                "15px",
                              flexWrap:
                                "wrap",
                            }}
                          >

                            {claim.status ===
                              "Pending" && (
                                <>
                                  <button
                                    className="approve-btn"
                                    onClick={() =>
                                      adminApproveClaim(
                                        claim.id
                                      )
                                    }
                                  >
                                    ✅ Approve
                                  </button>

                                  <button
                                    className="reject-btn"
                                    onClick={() =>
                                      adminRejectClaim(
                                        claim.id
                                      )
                                    }
                                  >
                                    ❌ Reject
                                  </button>
                                </>
                              )}

                            <button
                              className="delete-btn"
                              onClick={() =>
                                adminDeleteClaim(
                                  claim.id
                                )
                              }
                            >
                              🗑️ Delete
                            </button>

                          </div>

                        </div>
                      )
                    )
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