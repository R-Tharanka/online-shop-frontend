import { useCallback, useEffect, useMemo, useState } from "react";
import { getTokens } from "../Auth/authStorage";
import { useAuth } from "../Auth/AuthProvider";
import * as authApi from "../Auth/authApi";

const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_API_BASE || "http://localhost:5000/api/auth";

const roleOptions = ["customer", "shop_owner"];

export default function UserManagement({ addToast }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lookupId, setLookupId] = useState("");

  const accessToken = getTokens().accessToken;

  const canModifySelf = useMemo(() => {
    return selectedUser && currentUser && selectedUser.id === currentUser.id;
  }, [selectedUser, currentUser]);

  const updateUserState = useCallback((updated) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setSelectedUser(updated);
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!accessToken) {
      addToast("Missing access token. Please sign in again.", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.listUsers({
        accessToken,
        search,
        role: roleFilter,
        page,
        limit,
      });
      setUsers(Array.isArray(data.users) ? data.users : []);
      setTotal(Number(data.total || 0));
      setTotalPages(Number(data.totalPages || 1));
    } catch (error) {
      addToast(error?.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [accessToken, addToast, search, roleFilter, page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleLookup = async (event) => {
    event.preventDefault();
    if (!lookupId.trim()) {
      addToast("Enter a user ID", "error");
      return;
    }

    try {
      const data = await authApi.getUserById({
        accessToken,
        userId: lookupId.trim(),
      });
      if (data?.user) {
        setSelectedUser(data.user);
        addToast("User loaded", "success");
      }
    } catch (error) {
      addToast(error?.message || "User not found", "error");
    }
  };

  const handleRoleChange = async (role, action) => {
    if (!selectedUser) return;
    if (!accessToken) return;

    if (canModifySelf && role === "shop_owner" && action === "remove") {
      addToast("You cannot remove your own admin role", "error");
      return;
    }

    try {
      const payload = { accessToken, userId: selectedUser.id, role };
      const data =
        action === "add"
          ? await authApi.addRole(payload)
          : await authApi.removeRole(payload);
      if (data?.user) {
        updateUserState(data.user);
        addToast(
          action === "add" ? "Role added" : "Role removed",
          "success"
        );
      }
    } catch (error) {
      addToast(error?.message || "Role update failed", "error");
    }
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
  };

  const canPageBack = page > 1;
  const canPageForward = page < totalPages;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32,
              color: "#141322",
              margin: 0,
              letterSpacing: -0.6,
            }}
          >
            User Management
          </h1>
          <p
            style={{
              color: "#8b8795",
              fontSize: 12,
              margin: "6px 0 0",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Manage profiles and roles
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>
            Auth API
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{AUTH_BASE_URL}</div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
        }}
      >
        <div>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or email"
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: 10,
                border: "1.5px solid #e5e7eb",
                fontSize: 13,
                background: "#fff",
                outline: "none",
                fontFamily: "'DM Mono', monospace",
              }}
            />
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(1);
              }}
              style={{
                padding: "11px 12px",
                borderRadius: 10,
                border: "1.5px solid #e5e7eb",
                fontSize: 12,
                background: "#fff",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              <option value="">All roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
              style={{
                padding: "11px 12px",
                borderRadius: 10,
                border: "1.5px solid #e5e7eb",
                fontSize: 12,
                background: "#fff",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
            <button
              type="submit"
              style={{
                padding: "11px 18px",
                borderRadius: 10,
                border: "1.5px solid #1f2937",
                background: "#111827",
                color: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              Search
            </button>
          </form>

          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1.4fr 0.9fr 0.8fr",
                gap: 12,
                padding: "12px 16px",
                background: "#f9fafb",
                fontSize: 11,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              <span>Name</span>
              <span>Email</span>
              <span>Roles</span>
              <span>Joined</span>
            </div>

            {loading ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>
                No users found
              </div>
            ) : (
              users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUser(u)}
                  style={{
                    width: "100%",
                    border: "none",
                    textAlign: "left",
                    background: selectedUser?.id === u.id ? "#111827" : "#fff",
                    color: selectedUser?.id === u.id ? "#fff" : "#111827",
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1.4fr 0.9fr 0.8fr",
                    gap: 12,
                    padding: "12px 16px",
                    borderTop: "1px solid #f3f4f6",
                    cursor: "pointer",
                    transition: "background .15s ease",
                  }}
                >
                  <span style={{ fontSize: 13 }}>{u.name}</span>
                  <span style={{ fontSize: 12 }}>{u.email}</span>
                  <span style={{ fontSize: 11, color: "inherit" }}>{
                    Array.isArray(u.roles) ? u.roles.join(", ") : "-"
                  }</span>
                  <span style={{ fontSize: 11, color: "inherit" }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                  </span>
                </button>
              ))
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 16,
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            <span>
              {total} users total
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => canPageBack && setPage(page - 1)}
                disabled={!canPageBack}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: canPageBack ? "#fff" : "#f3f4f6",
                  cursor: canPageBack ? "pointer" : "not-allowed",
                  fontSize: 12,
                }}
              >
                Prev
              </button>
              <span style={{ padding: "8px 4px" }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => canPageForward && setPage(page + 1)}
                disabled={!canPageForward}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: canPageForward ? "#fff" : "#f3f4f6",
                  cursor: canPageForward ? "pointer" : "not-allowed",
                  fontSize: 12,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div>
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              padding: "18px",
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
              Find user by ID
            </div>
            <form onSubmit={handleLookup} style={{ display: "flex", gap: 8 }}>
              <input
                value={lookupId}
                onChange={(event) => setLookupId(event.target.value)}
                placeholder="User ID"
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1.5px solid #e5e7eb",
                  fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #111827",
                  background: "#111827",
                  color: "#fff",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Load
              </button>
            </form>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              padding: "18px",
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
              Selected user
            </div>
            {!selectedUser ? (
              <div style={{ fontSize: 12, color: "#9ca3af" }}>
                Select a user from the list to manage roles.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>
                    Name
                  </div>
                  <div style={{ fontSize: 14 }}>{selectedUser.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>
                    Email
                  </div>
                  <div style={{ fontSize: 13 }}>{selectedUser.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>
                    User ID
                  </div>
                  <div style={{ fontSize: 12, wordBreak: "break-all" }}>{selectedUser.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>
                    Roles
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(selectedUser.roles || []).map((role) => (
                      <span
                        key={role}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 999,
                          border: "1px solid #e5e7eb",
                          fontSize: 11,
                          background: "#f9fafb",
                        }}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>
                    Role actions
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                    {roleOptions.map((role) => {
                      const hasRole = selectedUser.roles?.includes(role);
                      const disableRemove =
                        !hasRole || (canModifySelf && role === "shop_owner");
                      const disableAdd = hasRole;

                      return (
                        <div
                          key={role}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            border: "1px solid #f3f4f6",
                            borderRadius: 10,
                            padding: "8px 10px",
                          }}
                        >
                          <span style={{ fontSize: 12 }}>{role}</span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              disabled={disableAdd}
                              onClick={() => handleRoleChange(role, "add")}
                              style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1px solid #111827",
                                background: disableAdd ? "#f3f4f6" : "#111827",
                                color: disableAdd ? "#9ca3af" : "#fff",
                                cursor: disableAdd ? "not-allowed" : "pointer",
                                fontSize: 11,
                              }}
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              disabled={disableRemove}
                              onClick={() => handleRoleChange(role, "remove")}
                              style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                border: "1px solid #e11d48",
                                background: disableRemove ? "#f3f4f6" : "#fff",
                                color: disableRemove ? "#9ca3af" : "#e11d48",
                                cursor: disableRemove ? "not-allowed" : "pointer",
                                fontSize: 11,
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {canModifySelf && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "#9ca3af" }}>
                      You cannot remove your own shop_owner role.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
