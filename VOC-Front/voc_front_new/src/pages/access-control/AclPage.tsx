import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

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
  users: any[]; // Define a more specific type later if needed
  roles: any[]; // Define a more specific type later if needed
}

const AclPage: React.FC = () => {
  const [acls, setAcls] = useState<Acl[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAcls = async () => {
      try {
        const response = await fetch('/api/access-control/acls');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAcls(data.items);
      } catch (error) {
        console.error('Error fetching ACLs:', error);
      }
    };

    fetchAcls();
  }, []);

  const filteredAcls = acls.filter(acl =>
    acl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acl.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (aclId: string) => {
    navigate(`/access-control/acls/${aclId}/edit`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Access Control Lists</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search ACLs..."
            className="border rounded px-3 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
            onClick={() => navigate('/access-control/acls/new')}
          >
            <Plus className="mr-2" size={20} />
            ADD NEW
          </button>
        </div>
      </div>

      <div className="mb-4">
        <span className="text-gray-600">ACLs count: {filteredAcls.length}</span>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Item Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Item ID
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAcls.map((acl) => (
              <tr
                key={acl.id}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => handleRowClick(acl.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {acl.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {acl.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {acl.item_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {acl.item_id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AclPage; 