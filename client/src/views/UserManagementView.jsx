import React, { useEffect, useState } from 'react';
import { useUsers } from '../contexts/UserContext';

const UserManagementView = () => {
  const {
    users,
    loadUsers,
    updateUser,
    deleteUser,
    notifications,
    removeNotification,
  } = useUsers();

  const [editingUser, setEditingUser] = useState(null);
  const [formValues, setFormValues] = useState({ name: '', role: '', department: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setFormValues({ name: user.name, role: user.role, department: user.department });
  };

  const handleSave = async () => {
    await updateUser(editingUser, formValues);
    setEditingUser(null);
    setFormValues({ name: '', role: '', department: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
    }
  };

  return (
    <div className="user-management">
      <h2>User Management</h2>

      {/* Notifications */}
      <div className="notifications">
        {notifications.map((n) => (
          <div key={n.id} className={`notification ${n.type}`}>
            {n.message}
            <button onClick={() => removeNotification(n.id)}>x</button>
          </div>
        ))}
      </div>

      {/* User Table */}
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="5">No users found</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>
                  {editingUser === user.id ? (
                    <input
                      value={formValues.name}
                      onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>{user.email}</td>
                <td>
                  {editingUser === user.id ? (
                    <input
                      value={formValues.role}
                      onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
                    />
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editingUser === user.id ? (
                    <input
                      value={formValues.department}
                      onChange={(e) => setFormValues({ ...formValues, department: e.target.value })}
                    />
                  ) : (
                    user.department
                  )}
                </td>
                <td>
                  {editingUser === user.id ? (
                    <>
                      <button onClick={handleSave}>Save</button>
                      <button onClick={() => setEditingUser(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(user)}>Edit</button>
                      <button onClick={() => handleDelete(user.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementView;
