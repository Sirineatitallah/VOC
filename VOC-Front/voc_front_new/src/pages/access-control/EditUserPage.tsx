import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  username: string;
  organizations: string[];
  roles: string[];
  tag: string;
  permissions: string[]; // Assuming permissions are strings (e.g., permission names/ids)
}

interface Organization {
  id: number;
  name: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface ACL {
  id: number;
  name: string;
  description: string;
}

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id) : null;
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [acls, setAcls] = useState<ACL[]>([]);

  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState<string>('');
  const [retypePassword, setRetypePassword] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, orgsRes, rolesRes, aclsRes] = await Promise.all([
          fetch('http://localhost:5001/api/access-control/users'),
          fetch('http://localhost:5001/api/access-control/organizations'),
          fetch('http://localhost:5001/api/access-control/roles'),
          fetch('http://localhost:5001/api/access-control/acls'),
        ]);

        if (!usersRes.ok) throw new Error(`HTTP error! users: ${usersRes.status}`);
        if (!orgsRes.ok) throw new Error(`HTTP error! organizations: ${orgsRes.status}`);
        if (!rolesRes.ok) throw new Error(`HTTP error! roles: ${rolesRes.status}`);
        if (!aclsRes.ok) throw new Error(`HTTP error! acls: ${aclsRes.status}`);

        const usersData = await usersRes.json();
        const orgsData = await orgsRes.json();
        const rolesData = await rolesRes.json();
        const aclsData = await aclsRes.json();

        setOrganizations(orgsData.items || []);
        setRoles(rolesData.items || []);
        setAcls(aclsData.items || []);

        if (userId) {
          const foundUser = usersData.items.find((u: User) => u.id === userId);
          if (foundUser) {
            setUser(foundUser);
            setSelectedOrganizations(foundUser.organizations || []);
            setSelectedRoles(foundUser.roles || []);
            setSelectedPermissions(foundUser.permissions || []);
          } else {
            setError('User not found.');
          }
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleOrganizationChange = (orgName: string) => {
    setSelectedOrganizations(prev =>
      prev.includes(orgName) ? prev.filter(name => name !== orgName) : [...prev, orgName]
    );
  };

  const handleRoleChange = (roleName: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleName) ? prev.filter(name => name !== roleName) : [...prev, roleName]
    );
  };

  const handlePermissionChange = (permissionName: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionName) ? prev.filter(name => name !== permissionName) : [...prev, permissionName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== retypePassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        name: user.name,
        username: user.username,
        organizations: selectedOrganizations,
        roles: selectedRoles,
        permissions: selectedPermissions,
      };

      if (newPassword) {
        payload.password = newPassword;
      }

      const response = await fetch(`http://localhost:5001/api/access-control/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('User updated successfully!');
      navigate('/access-control/users');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading user details...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!user) {
    return <div className="p-4">User not found.</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit User</h1>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
          onClick={handleSubmit}
          disabled={loading}
        >
          SAVE
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4">
        {/* User Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username:</label>
              <input
                type="text"
                id="username"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                value={user.username}
                readOnly // Make username read-only as per image
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
              <input
                type="text"
                id="name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
              <input
                type="password"
                id="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div>
              <label htmlFor="retypePassword" className="block text-gray-700 text-sm font-bold mb-2">Retype Password:</label>
              <input
                type="password"
                id="retypePassword"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Organizations */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Organizations</h2>
          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="grid grid-cols-2 gap-4 font-semibold border-b pb-2 mb-2">
              <div>Name</div>
              <div>Description</div>
            </div>
            {organizations.map((org) => (
              <div key={org.id} className="grid grid-cols-2 gap-4 py-2 border-b last:border-b-0 items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 mr-2"
                    checked={selectedOrganizations.includes(org.name)}
                    onChange={() => handleOrganizationChange(org.name)}
                  />
                  {org.name}
                </div>
                <div>{org.description}</div>
              </div>
            ))}
            {organizations.length === 0 && (
              <div className="p-2 text-gray-500">No organizations available.</div>
            )}
          </div>
        </div>

        {/* Roles */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Roles</h2>
          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="grid grid-cols-2 gap-4 font-semibold border-b pb-2 mb-2">
              <div>Name</div>
              <div>Description</div>
            </div>
            {roles.map((role) => (
              <div key={role.id} className="grid grid-cols-2 gap-4 py-2 border-b last:border-b-0 items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 mr-2"
                    checked={selectedRoles.includes(role.name)}
                    onChange={() => handleRoleChange(role.name)}
                  />
                  {role.name}
                </div>
                <div>{role.description}</div>
              </div>
            ))}
            {roles.length === 0 && (
              <div className="p-2 text-gray-500">No roles available.</div>
            )}
          </div>
        </div>

        {/* Permissions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Permissions</h2>
          <div className="bg-gray-50 p-4 rounded-md border">
            <div className="grid grid-cols-2 gap-4 font-semibold border-b pb-2 mb-2">
              <div>Name</div>
              <div>Description</div>
            </div>
            {acls.map((acl) => (
              <div key={acl.id} className="grid grid-cols-2 gap-4 py-2 border-b last:border-b-0 items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 mr-2"
                    checked={selectedPermissions.includes(acl.name)}
                    onChange={() => handlePermissionChange(acl.name)}
                  />
                  {acl.name}
                </div>
                <div>{acl.description}</div>
              </div>
            ))}
            {acls.length === 0 && (
              <div className="p-2 text-gray-500">No permissions available.</div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage; 