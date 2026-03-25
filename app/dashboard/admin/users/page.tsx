"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = session?.user as { role?: string } | undefined;

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers(await res.json());
      setLoading(false);
    }
    if (user?.role === "clerk") fetchUsers();
  }, [user?.role]);

  if (user?.role !== "clerk") {
    return <p className="text-gray-600">Access denied.</p>;
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-gray-900">
        Manage Users
      </h1>

      {loading ? (
        <p className="mt-8 text-gray-500">Loading...</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-900">Name</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-900">Email</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-900">Role</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u: any) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm capitalize text-gray-600">{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
