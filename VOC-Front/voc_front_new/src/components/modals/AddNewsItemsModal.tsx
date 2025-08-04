import React, { useState, useEffect, useCallback } from 'react';
import { intelligenceApi } from '../../utils/api';
import { X } from 'lucide-react';

// Assuming this is the structure from the API
interface NewsItemAggregate {
  id: number;
  title: string;
  description: string;
  created: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: NewsItemAggregate[]) => void;
  existingItemIds: number[];
}

const AddNewsItemsModal: React.FC<Props> = ({ isOpen, onClose, onAddItems, existingItemIds }) => {
  const [items, setItems] = useState<NewsItemAggregate[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const fetchItems = useCallback(async (currentOffset: number) => {
    if (currentOffset === 0) {
        setLoading(true);
    } else {
        setLoadingMore(true);
    }
    setError(null);
    try {
      const groupId = '8f63a699-23e1-4568-ad4b-4f495ba24d85';
      const response = await intelligenceApi.get(`/assess/news-item-aggregates-by-group/${groupId}`, {
        params: {
          read: false,
          range: 'ALL',
          limit: limit,
          offset: currentOffset,
        },
      });
      const newItems = response.data.items || [];
      setItems(prev => currentOffset === 0 ? newItems : [...prev, ...newItems]);
      setHasMore(newItems.length === limit);
      setOffset(currentOffset + newItems.length);
    } catch (err) {
      setError('Failed to fetch news items.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);


  useEffect(() => {
    if (isOpen) {
      setItems([]);
      setOffset(0);
      setSelectedIds(new Set());
      fetchItems(0);
    }
  }, [isOpen, fetchItems]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
        fetchItems(offset);
    }
  }

  const handleCheckboxChange = (itemId: number) => {
    setSelectedIds(prev => {
      const newSelectedIds = new Set(prev);
      if (newSelectedIds.has(itemId)) {
        newSelectedIds.delete(itemId);
      } else {
        newSelectedIds.add(itemId);
      }
      return newSelectedIds;
    });
  };

  const handleAddClick = () => {
    const itemsToAdd = items.filter(item => selectedIds.has(item.id));
    onAddItems(itemsToAdd);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-dark-300 rounded-lg shadow-xl w-full max-w-3xl h-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-dark-400">
          <h2 className="text-xl font-bold">Add News Items</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-400">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-grow">
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <div className="space-y-2">
              {items.map(item => {
                const isExisting = existingItemIds.includes(item.id);
                return (
                  <div key={item.id} className={`p-3 rounded-md flex items-center ${isExisting ? 'bg-gray-100 dark:bg-dark-200 opacity-60' : 'bg-white dark:bg-dark-200'}`}>
                    <input
                      type="checkbox"
                      id={`item-${item.id}`}
                      checked={selectedIds.has(item.id)}
                      onChange={() => handleCheckboxChange(item.id)}
                      disabled={isExisting}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label htmlFor={`item-${item.id}`} className="ml-3 flex-grow cursor-pointer">
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </label>
                  </div>
                );
              })}
              {loadingMore && <p className="text-center py-2">Loading more...</p>}
              {!loading && hasMore && (
                <div className="text-center py-4">
                    <button onClick={handleLoadMore} disabled={loadingMore} className="px-4 py-2 bg-gray-200 dark:bg-dark-400 rounded-md hover:bg-gray-300">
                        Load More
                    </button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end p-4 border-t dark:border-dark-400">
          <button onClick={onClose} className="px-4 py-2 rounded-md mr-2">Cancel</button>
          <button onClick={handleAddClick} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add Selected ({selectedIds.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewsItemsModal; 