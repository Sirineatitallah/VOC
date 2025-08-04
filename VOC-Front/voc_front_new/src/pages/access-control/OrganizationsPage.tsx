import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Organization {
  id: number;
  name: string;
  description: string;
  // Add other fields as per your API response if needed for display
  title: string; // As per your API response, it has 'title'
  subtitle: string; // As per your API response, it has 'subtitle'
  address: {
    city: string;
    country: string;
    street: string;
    zip: string;
  };
  tag: string;
}

const OrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/access-control/organizations');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setOrganizations(data.items);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOrganizationClick = () => {
    navigate('/access-control/organizations/new');
  };

  const handleOrganizationRowClick = (id: number) => {
    navigate(`/access-control/organizations/${id}/edit`);
  };

  if (loading) {
    return <div className="p-4">Loading organizations...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">ORGANIZATIONS</h1>
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
            onClick={handleAddOrganizationClick}
          >
            <span className="mr-1">+</span> ADD NEW
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">Organizations count: {filteredOrganizations.length}</p>
      <div className="bg-white shadow rounded-lg">
        <div className="grid grid-cols-[auto_1fr_2fr] gap-4 p-4 font-semibold border-b">
          <div></div> {/* For the icon */}
          <div>Title</div>
          <div>Description</div>
        </div>
        {filteredOrganizations.map((org) => (
          <div
            key={org.id}
            className="grid grid-cols-[auto_1fr_2fr] gap-4 p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 items-center"
            onClick={() => handleOrganizationRowClick(org.id)}
          >
            <div className="flex items-center">
              <span className="mr-2 text-gray-500">🗄️</span> {/* Placeholder for mdi-office-building */}
            </div>
            <div>{org.title}</div>
            <div>{org.description}</div>
          </div>
        ))}
        {filteredOrganizations.length === 0 && (
          <div className="p-4 text-gray-500">No organizations found.</div>
        )}
      </div>
    </div>
  );
};

export default OrganizationsPage; 