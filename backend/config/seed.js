import { Item } from "../models/Item.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";

export const defaultItems = [
  {
    name: "Black Leather Wallet",
    category: "Accessories",
    location: "College Campus",
    type: "Lost",
    description: "Black Tommy Hilfiger leather wallet with student ID, metro card, and cash.",
    reportedBy: "Rahul Sharma",
    ownerEmail: "rahul.sharma@campus.edu",
    contactPhone: "+91 98765 43210",
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80",
    date: new Date().toISOString().split("T")[0],
  },
  {
    name: "Blue Campus Backpack",
    category: "Others",
    location: "Library",
    type: "Found",
    description: "Navy blue American Tourister backpack found on 2nd floor reading table.",
    reportedBy: "Pooja Verma",
    ownerEmail: "pooja.v@campus.edu",
    contactPhone: "+91 98111 22334",
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    date: new Date().toISOString().split("T")[0],
  },
  {
    name: "Wireless Apple AirPods Pro",
    category: "Electronics",
    location: "Cafeteria",
    type: "Lost",
    description: "White AirPods Pro in a matte black silicone protective case with small scratch.",
    reportedBy: "Aman Tyagi",
    ownerEmail: "aman.tyagi@campus.edu",
    contactPhone: "+91 99887 76655",
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
    date: new Date().toISOString().split("T")[0],
  },
  {
    name: "College Student Identity Card",
    category: "Documents",
    location: "College Campus",
    type: "Found",
    description: "Official BCA/MCA department ID card found near central fountain benches.",
    reportedBy: "Campus Security",
    ownerEmail: "security@campus.edu",
    contactPhone: "+91 94000 11223",
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    date: new Date().toISOString().split("T")[0],
  },
  {
    name: "Casio FX-991EX Scientific Calculator",
    category: "Electronics",
    location: "Classroom",
    type: "Found",
    description: "Black and white ClassWiz calculator left in Room 304 after Maths lecture.",
    reportedBy: "Prof. Gupta",
    ownerEmail: "faculty@campus.edu",
    contactPhone: "+91 97111 55443",
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80",
    date: new Date().toISOString().split("T")[0],
  },
  {
    name: "Stainless Steel Water Flask",
    category: "Others",
    location: "Sports Complex",
    type: "Lost",
    description: "Silver insulated Milton bottle with anime stickers, left at badminton court.",
    reportedBy: "Sneha Patel",
    ownerEmail: "sneha.p@campus.edu",
    contactPhone: "+91 98222 33445",
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
    date: new Date().toISOString().split("T")[0],
  },
  {
    name: "Motorcycle Keys with Red Lanyard",
    category: "Keys",
    location: "Parking",
    type: "Lost",
    description: "Royal Enfield bike key with red 'Remove Before Flight' fabric tag.",
    reportedBy: "Vikram Singh",
    ownerEmail: "vikram.s@campus.edu",
    contactPhone: "+91 98333 44556",
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80",
    date: new Date().toISOString().split("T")[0],
  },
  {
    name: "Data Structures & Algorithms Book",
    category: "Books",
    location: "Library",
    type: "Found",
    description: "Tanenbaum / Cormen reference book found near reference section row 4.",
    reportedBy: "Librarian Desk",
    ownerEmail: "library@campus.edu",
    contactPhone: "+91 98444 55667",
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    date: new Date().toISOString().split("T")[0],
  },
];

export const seedDatabase = async () => {
  try {
    // 1. Seed Admin user if none exists
    const adminExists = await User.findOne({ email: "admin@lostfound.com" });
    if (!adminExists) {
      await User.create({
        name: "Campus Administrator",
        email: "admin@lostfound.com",
        password: "admin123",
        role: "admin",
        phone: "+91 90000 00000",
      });
      console.log(" seeded default admin: admin@lostfound.com / admin123");
    }

    // 2. Seed Items if empty
    const count = await Item.countDocuments();
    if (count === 0) {
      await Item.insertMany(defaultItems);
      console.log(` seeded ${defaultItems.length} default campus lost & found items.`);
    }

    // 3. Welcome notification for demo admin
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      await Notification.create({
        recipientEmail: "admin@lostfound.com",
        title: "Welcome to Lost & Found Hub!",
        message: "Your system is ready. MongoDB database connected and sample items loaded.",
        type: "success",
      });
    }
  } catch (err) {
    console.error("Database Seeding Error:", err.message);
  }
};
