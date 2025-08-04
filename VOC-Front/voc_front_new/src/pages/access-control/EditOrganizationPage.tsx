import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Organization {
  id: number;
  name: string;
  description: string;
  title: string;
  subtitle: string;
  address: {
    city: string;
    country: string;
    street: string;
    zip: string;
  };
  tag: string;
}

const EditOrganizationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const organizationId = id ? parseInt(id) : null;
  const navigate = useNavigate();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/access-control/organizations');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (organizationId) {
          const foundOrganization = data.items.find((org: Organization) => org.id === organizationId);
          if (foundOrganization) {
            setOrganization(foundOrganization);
          } else {
            setError('Organization not found.');
          }
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [organizationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: organization.name,
        description: organization.description,
        title: organization.title,
        subtitle: organization.subtitle,
        address: organization.address,
        tag: organization.tag,
      };

      const response = await fetch(`http://localhost:5001/api/access-control/organizations/${organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Organization updated successfully!');
      navigate('/access-control/organizations');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading organization details...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!organization) {
    return <div className="p-4">Organization not found.</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Edit Organization: {organization.name}</h1>
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
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={organization.name}
            onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
          <textarea
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={organization.description}
            onChange={(e) => setOrganization({ ...organization, description: e.target.value })}
            rows={4}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={organization.title}
            onChange={(e) => setOrganization({ ...organization, title: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="subtitle" className="block text-gray-700 text-sm font-bold mb-2">Subtitle:</label>
          <input
            type="text"
            id="subtitle"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={organization.subtitle}
            onChange={(e) => setOrganization({ ...organization, subtitle: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">City:</label>
          <input
            type="text"
            id="city"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={organization.address.city}
            onChange={(e) => setOrganization({ ...organization, address: { ...organization.address, city: e.target.value } })}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">Country:</label>
          <input
            type="text"
            id="country"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={organization.address.country}
            onChange={(e) => setOrganization({ ...organization, address: { ...organization.address, country: e.target.value } })}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="street" className="block text-gray-700 text-sm font-bold mb-2">Street:</label>
          <input
            type="text"
            id="street"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={organization.address.street}
            onChange={(e) => setOrganization({ ...organization, address: { ...organization.address, street: e.target.value } })}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="zip" className="block text-gray-700 text-sm font-bold mb-2">ZIP:</label>
          <input
            type="text"
            id="zip"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={organization.address.zip}
            onChange={(e) => setOrganization({ ...organization, address: { ...organization.address, zip: e.target.value } })}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="tag" className="block text-gray-700 text-sm font-bold mb-2">Tag:</label>
          <input
            type="text"
            id="tag"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={organization.tag}
            onChange={(e) => setOrganization({ ...organization, tag: e.target.value })}
          />
        </div>
        <button
          type="button"
          onClick={() => navigate('/access-control/organizations')}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          disabled={loading}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditOrganizationPage; 