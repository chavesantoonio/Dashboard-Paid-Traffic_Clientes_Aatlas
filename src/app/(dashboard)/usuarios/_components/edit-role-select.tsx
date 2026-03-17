"use client";

import * as React from "react";
import { toast } from "sonner";
import { updateUserRoleAction } from "../actions";

const ROLES = [
  { value: "superadmin", label: "Superadmin" },
  { value: "clientadmin", label: "Admin" },
  { value: "clientviewer", label: "Viewer" },
] as const;

interface EditRoleSelectProps {
  userId: string;
  currentRole: string;
  disabled?: boolean;
}

export function EditRoleSelect({
  userId,
  currentRole,
  disabled,
}: EditRoleSelectProps) {
  const [role, setRole] = React.useState(currentRole);
  const [loading, setLoading] = React.useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    const prevRole = role;
    setRole(newRole); // optimistic

    setLoading(true);
    const result = await updateUserRoleAction(userId, newRole);
    setLoading(false);

    if (result.error) {
      setRole(prevRole); // rollback
      toast.error(result.error);
    } else {
      toast.success("Perfil atualizado.");
    }
  };

  if (disabled) {
    const label = ROLES.find((r) => r.value === role)?.label ?? role;
    return (
      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-primary/10 text-primary">
        {label}
      </span>
    );
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={loading}
      className="h-7 rounded border border-input bg-background px-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r.value} value={r.value}>
          {r.label}
        </option>
      ))}
    </select>
  );
}
