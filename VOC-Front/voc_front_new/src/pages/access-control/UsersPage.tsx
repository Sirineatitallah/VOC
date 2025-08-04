import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  username: string;
  organizations: string[];
  roles: string[];
  tag: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/access-control/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data.items);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUserClick = () => {
    navigate('/access-control/users/new');
  };

  const handleUserRowClick = (id: number) => {
    navigate(`/access-control/users/${id}/edit`);
  };

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">USERS</h1>
        <div className="flex items-center">
          <input
            type="text"
            placeholder=" Search"
            className="border p-2 rounded-md mr-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
            onClick={handleAddUserClick}
          >
            <span className="mr-1">+</span> ADD NEW
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">Users count: {filteredUsers.length}</p>
      <div className="bg-white shadow rounded-lg">
        <div className="grid grid-cols-2 gap-4 p-4 font-semibold border-b">
          <div>Name</div>
          <div>Username</div>
        </div>
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-2 gap-4 p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50"
            onClick={() => handleUserRowClick(user.id)}
          >
            <div className="flex items-center">
              <span className="mr-2 text-gray-500">👤</span> {user.name}
            </div>
            <div>{user.username}</div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="p-4 text-gray-500">No users found.</div>
        )}
      </div>
    </div>
  );
};

export default UsersPage; 