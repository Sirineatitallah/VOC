import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

const EditRolePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      let permissionsResponse;
      let rolesResponse;
      try {
        // Fetch all permissions
        console.log('Fetching permissions from: /api/access-control/acls');
        permissionsResponse = await fetch('/api/access-control/acls');
        if (!permissionsResponse.ok) {
          throw new Error(`HTTP error! status: ${permissionsResponse.status}`);
        }
        const permissionsData = await permissionsResponse.json();
        console.log('Fetched permissions data:', permissionsData);
        setAllPermissions(permissionsData.items);

        // Fetch all roles and find the specific role by ID
        console.log('Fetching all roles from: /api/access-control/roles');
        rolesResponse = await fetch('/api/access-control/roles');
        if (!rolesResponse.ok) {
          throw new Error(`HTTP error! status: ${rolesResponse.status}`);
        }
        const allRolesData = await rolesResponse.json();
        console.log('Fetched roles data (all):', allRolesData);
        const foundRole = allRolesData.items.find((r: Role) => r.id === id);

        if (foundRole) {
          setRole(foundRole);
          setSelectedPermissions(foundRole.permissions.map((p: Permission) => p.id));
        } else {
          setError('Role not found.');
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load role data.');
        if (permissionsResponse && !permissionsResponse.ok) {
            permissionsResponse.text().then(text => console.error('Raw permissions response text:', text)).catch(e => console.error('Error reading permissions response text:', e));
        }
        if (rolesResponse && !rolesResponse.ok) {
            rolesResponse.text().then(text => console.error('Raw roles response text:', text)).catch(e => console.error('Error reading roles response text:', e));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  console.log('Current allPermissions state:', allPermissions);
  console.log('Current selectedPermissions state:', selectedPermissions);

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    try {
      const response = await fetch(`/api/access-control/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: role.name,
          description: role.description,
          permissions: selectedPermissions.map(permId => (
            allPermissions.find(p => p.id === permId)
          )),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      navigate('/access-control/roles');
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role.');
    }
  };

  if (loading) return <div className="text-center p-4">Loading role...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  if (!role) return <div className="text-center p-4">Role not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Role</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Title
          </label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={role.name}
            onChange={(e) => setRole({ ...role, name: e.target.value })}
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
            value={role.description}
            onChange={(e) => setRole({ ...role, description: e.target.value })}
            required
          />
        </div>

        <h2 className="text-xl font-bold mb-4">Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {allPermissions.map((permission) => (
            <div key={permission.id} className="flex items-center">
              <input
                type="checkbox"
                id={permission.id}
                checked={selectedPermissions.includes(permission.id)}
                onChange={() => handlePermissionChange(permission.id)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label htmlFor={permission.id} className="ml-2 text-gray-700">
                <span className="font-medium">{permission.name}</span>
                <p className="text-sm text-gray-500">{permission.description}</p>
              </label>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update Role
          </button>
          <button
            type="button"
            onClick={() => navigate('/access-control/roles')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRolePage;