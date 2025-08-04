import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  username: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface Acl {
  id: string;
  name: string;
  description: string;
  item_type: string;
  item_id: string;
  see: boolean;
  access: boolean;
  modify: boolean;
  everyone: boolean;
  users: User[];
  roles: Role[];
}

const EditAclPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [acl, setAcl] = useState<Acl | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [itemType, setItemType] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');
  const [seePermission, setSeePermission] = useState<boolean>(false);
  const [accessPermission, setAccessPermission] = useState<boolean>(false);
  const [modifyPermission, setModifyPermission] = useState<boolean>(false);
  const [everyone, setEveryone] = useState<boolean>(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users
        const usersResponse = await fetch('/api/access-control/users');
        if (!usersResponse.ok) {
          throw new Error(`HTTP error! status: ${usersResponse.status}`);
        }
        const usersData = await usersResponse.json();
        setAllUsers(usersData.items);

        // Fetch all roles
        const rolesResponse = await fetch('/api/access-control/roles');
        if (!rolesResponse.ok) {
          throw new Error(`HTTP error! status: ${rolesResponse.status}`);
        }
        const rolesData = await rolesResponse.json();
        setAllRoles(rolesData.items);

        // Fetch the specific ACL by ID (assuming it exists for editing)
        const aclResponse = await fetch(`/api/access-control/acls/${id}`);
        if (!aclResponse.ok) {
          throw new Error(`HTTP error! status: ${aclResponse.status}`);
        }
        const aclData = await aclResponse.json();
        setAcl(aclData);
        setName(aclData.name);
        setDescription(aclData.description);
        setItemType(aclData.item_type || '');
        setItemId(aclData.item_id || '');
        setSeePermission(aclData.see || false);
        setAccessPermission(aclData.access || false);
        setModifyPermission(aclData.modify || false);
        setEveryone(aclData.everyone || false);
        setSelectedUsers(aclData.users.map((u: User) => u.id));
        setSelectedRoles(aclData.roles.map((r: Role) => r.id));

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load ACL data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUserChange = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(uid => uid !== userId)
        : [...prev, userId]
    );
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(rid => rid !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acl) return;

    try {
      const payload = {
        name,
        description,
        item_type: itemType,
        item_id: itemId,
        see: seePermission,
        access: accessPermission,
        modify: modifyPermission,
        everyone,
        users: selectedUsers.map(userId => allUsers.find(u => u.id === userId)),
        roles: selectedRoles.map(roleId => allRoles.find(r => r.id === roleId)),
      };

      const response = await fetch(`/api/access-control/acls/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      navigate('/access-control/acls');
    } catch (err) {
      console.error('Error updating ACL:', err);
      setError('Failed to update ACL.');
    }
  };

  if (loading) return <div className="text-center p-4">Loading ACL...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  if (!acl) return <div className="text-center p-4">ACL not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit ACL</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="itemType">
            Item Type
          </label>
          <input
            type="text"
            id="itemType"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="itemId">
            Item ID
          </label>
          <input
            type="text"
            id="itemId"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">Permissions</h3>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={seePermission}
                onChange={(e) => setSeePermission(e.target.checked)}
              />
              <span className="ml-2 text-gray-700">See</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={accessPermission}
                onChange={(e) => setAccessPermission(e.target.checked)}
              />
              <span className="ml-2 text-gray-700">Access</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={modifyPermission}
                onChange={(e) => setModifyPermission(e.target.checked)}
              />
              <span className="ml-2 text-gray-700">Modify</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={everyone}
              onChange={(e) => setEveryone(e.target.checked)}
            />
            <span className="ml-2 text-gray-700">Everyone</span>
          </label>
        </div>

        <h2 className="text-xl font-bold mb-4">Users</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(allUsers.map(user => user.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Username
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserChange(user.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold mb-4">Roles</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoles(allRoles.map(role => role.id));
                      } else {
                        setSelectedRoles([]);
                      }
                    }}
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allRoles.map((role) => (
                <tr key={role.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => handleRoleChange(role.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {role.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {role.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update ACL
          </button>
          <button
            type="button"
            onClick={() => navigate('/access-control/acls')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAclPage; 