import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userApi from "../../services/user.api";
import useAuth from "../../hooks/useAuth";
import DataTable from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import formatDate from "../../utils/formatDate";
import { useToast } from "../../components/ui/Toast";
import { apiError } from "../../services/api";

export const Users = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [confirmStatusUser, setConfirmStatusUser] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => userApi.getAll(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => userApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      success("User role updated successfully!");
    },
    onError: (err) => error(apiError(err)),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => userApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      success("User status updated successfully!");
      setConfirmStatusUser(null);
    },
    onError: (err) => error(apiError(err)),
  });

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const term = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
    );
  }, [users, search]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  const handleStatusToggle = () => {
    if (!confirmStatusUser) return;
    const newStatus =
      confirmStatusUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateStatusMutation.mutate({ id: confirmStatusUser.id, status: newStatus });
  };

  const columns = [
    {
      header: "Team Member",
      accessor: "name",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.name}</span>
          <span className="text-xs text-slate-400 font-mono">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Assigned Role",
      render: (row) => {
        const isSelf = row.id === currentUser?.id;
        return (
          <div className="flex items-center gap-2">
            <select
              value={row.role}
              disabled={isSelf || updateRoleMutation.isPending}
              onChange={(e) => handleRoleChange(row.id, e.target.value)}
              className="text-xs font-semibold rounded-lg border border-slate-300 px-2 py-1 bg-white text-slate-800 disabled:opacity-50 disabled:bg-slate-100 cursor-pointer"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="STAFF">STAFF</option>
            </select>
            {isSelf && (
              <span className="text-[10px] text-slate-400 font-semibold">(You)</span>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <Badge value={row.status} size="sm" />,
    },
    {
      header: "Joined Date",
      render: (row) => (
        <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (row) => {
        const isSelf = row.id === currentUser?.id;
        return (
          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
            <Button
              variant={row.status === "ACTIVE" ? "danger" : "outline"}
              size="sm"
              disabled={isSelf || updateStatusMutation.isPending}
              onClick={() => setConfirmStatusUser(row)}
            >
              {row.status === "ACTIVE" ? "Deactivate" : "Activate"}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Team Management</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Administer staff members, assign system permissions, and manage access statuses.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs max-w-md">
        <Input
          placeholder="Search team members by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={paginatedUsers}
        isLoading={isLoading}
        emptyMessage="No team members found"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredUsers.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {confirmStatusUser && (
        <Modal
          isOpen={!!confirmStatusUser}
          onClose={() => setConfirmStatusUser(null)}
          title={`${
            confirmStatusUser.status === "ACTIVE" ? "Deactivate" : "Activate"
          } User Account?`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to{" "}
              {confirmStatusUser.status === "ACTIVE" ? "deactivate" : "activate"} access for{" "}
              <strong className="text-slate-900">{confirmStatusUser.name}</strong> (
              {confirmStatusUser.email})?
            </p>
            {confirmStatusUser.status === "ACTIVE" && (
              <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200 font-medium">
                Deactivated accounts will be immediately blocked from signing in or executing actions.
              </p>
            )}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setConfirmStatusUser(null)}
                disabled={updateStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant={
                  confirmStatusUser.status === "ACTIVE" ? "danger" : "primary"
                }
                onClick={handleStatusToggle}
                isLoading={updateStatusMutation.isPending}
              >
                Confirm{" "}
                {confirmStatusUser.status === "ACTIVE"
                  ? "Deactivation"
                  : "Activation"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Users;
