import { Timestamp } from "firebase/firestore";

// ─── User ─────────────────────────────────────────────────────────────────────
export type UserRole = "HOD" | "Network Admin" | "Hardware Admin" | "Admin" | "Lab Assistant";

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  role: UserRole;
  profileImageUrl: string;
  createdAt: Timestamp;
}

// ─── Lab ──────────────────────────────────────────────────────────────────────
export interface Lab {
  id?: string;
  labId: string;
  labName: string;
  labCode: string;
  building: string;
  floor: string;
  capacity: number;
  imageUrl: string;
  description: string;
  createdAt: Timestamp;
}

// ─── System ───────────────────────────────────────────────────────────────────
export type SystemStatus = "Working" | "Faulty" | "Under Maintenance";

export interface System {
  id?: string;
  systemId: string;
  systemNumber: string;
  labId: string;
  cpu: string;
  ram: string;
  storage: string;
  monitorAssetId: string;
  keyboardAssetId: string;
  mouseAssetId: string;
  status: SystemStatus;
  remarks: string;
  imageUrl: string;
  createdAt: Timestamp;
}

// ─── Asset ────────────────────────────────────────────────────────────────────
export type AssetCategory =
  | "Mouse" | "Keyboard" | "Monitor" | "Motherboard" | "Processor"
  | "RAM" | "SSD" | "HDD" | "NVMe" | "SMPS" | "Projector" | "Printer"
  | "Scanner" | "UPS" | "Biometric Device" | "Switch" | "Router";

export type AssetStatus =
  | "Available" | "Assigned" | "Working" | "Faulty" | "Under Repair" | "Disposed";

export interface Asset {
  id?: string;
  assetId: string;
  assetName: string;
  category: AssetCategory;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  assignedTo: string;
  assignedLocation: string;
  status: AssetStatus;
  imageUrl: string;
  remarks: string;
  createdAt: Timestamp;
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export interface InventoryItem {
  id?: string;
  itemName: string;
  category: string;
  quantity: number;
  minimumStock: number;
  imageUrl: string;
  remarks: string;
  updatedAt: Timestamp;
}

// ─── Asset Assignment ─────────────────────────────────────────────────────────
export type AssignedToType = "System" | "Lab" | "Staff";

export interface AssetAssignment {
  id?: string;
  assetId: string;
  assignedToType: AssignedToType;
  assignedToId: string;
  assignedDate: string;
  returnedDate: string;
  remarks: string;
  createdAt?: Timestamp;
}

// ─── Complaint ────────────────────────────────────────────────────────────────
export type ComplaintStatus =
  | "Open" | "Assigned" | "In Progress" | "Pending Parts" | "Resolved" | "Closed";

export interface Complaint {
  id?: string;
  complaintNo: string;
  date: string;
  labId: string;
  systemId: string;
  assetId: string;
  reportedBy: string;
  hodName: string;
  issueType: string;
  problemDescription: string;
  technicianRemarks: string;
  status: ComplaintStatus;
  closedDate: string;
  createdAt: Timestamp;
}

// ─── Daily Report ─────────────────────────────────────────────────────────────
export interface DailyReport {
  id?: string;
  reportDate: string;
  technician: string;
  location: string;
  workDone: string;
  complaintReference: string;
  status: string;
  remarks: string;
  createdAt: Timestamp;
}

// ─── Vendor ───────────────────────────────────────────────────────────────────
export interface Vendor {
  id?: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  remarks: string;
  createdAt: Timestamp;
}

// ─── Purchase ─────────────────────────────────────────────────────────────────
export interface PurchaseItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Purchase {
  id?: string;
  purchaseNumber: string;
  vendorId: string;
  purchaseDate: string;
  totalAmount: number;
  billImageUrl: string;
  items: PurchaseItem[];
  remarks: string;
  createdAt: Timestamp;
}
