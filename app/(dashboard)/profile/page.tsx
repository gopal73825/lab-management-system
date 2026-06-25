"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField, Input, Select } from "@/components/ui/FormField";
import type { UserRole } from "@/types";
import toast from "react-hot-toast";
import { serverTimestamp } from "@/lib/firebase/firestore";

const ROLES: UserRole[] = ["HOD","Network Admin","Hardware Admin","Admin","Lab Assistant"];

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: profile?.fullName || "",
    phone: profile?.phone || "",
    designation: profile?.designation || "",
    department: profile?.department || "",
    role: (profile?.role || "Admin") as UserRole,
    profileImageUrl: profile?.profileImageUrl || "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      if (!profile) {
        await userService.create({
          uid: user.uid, email: user.email || "", ...form,
          createdAt: serverTimestamp() as never,
        });
      } else {
        await userService.update(user.uid, form);
      }
      await refreshProfile();
      toast.success("Profile saved!");
    } catch { toast.error("Save failed"); }
    finally { setLoading(false); }
  };

  const initials = (form.fullName || user?.email || "U")
    .split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="max-w-lg">
      <PageHeader
        title="My Profile"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Profile" }]}
      />
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          {form.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.profileImageUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-600 text-white text-xl font-bold flex items-center justify-center">
              {initials}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{form.fullName || "—"}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="text-xs bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full">{form.role}</span>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Full Name" required>
            <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone">
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </FormField>
            <FormField label="Role">
              <Select value={form.role} onChange={(e) => set("role", e.target.value)} options={ROLES.map((r) => ({ value: r, label: r }))} />
            </FormField>
          </div>
          <FormField label="Designation">
            <Input value={form.designation} onChange={(e) => set("designation", e.target.value)} />
          </FormField>
          <FormField label="Department">
            <Input value={form.department} onChange={(e) => set("department", e.target.value)} />
          </FormField>
          <FormField label="Profile Image URL">
            <Input value={form.profileImageUrl} onChange={(e) => set("profileImageUrl", e.target.value)} type="url" />
          </FormField>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
