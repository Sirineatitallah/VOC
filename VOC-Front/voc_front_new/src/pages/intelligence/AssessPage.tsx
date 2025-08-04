import React, { useEffect, useState } from 'react';
import { fetchAssessVulnerabilities } from '../../utils/api';

interface NewsItem {
  id: number | string;
  title: string;
  description: string;
  created?: string;
  link?: string;
  likes?: number;
  dislikes?: number;
  me_like?: boolean;
  me_dislike?: boolean;
  important?: boolean;
  read?: boolean;
  news_items?: any[];
}

const AssessPage: React.FC = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await fetchAssessVulnerabilities();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-blue-700">NEWS ITEMS</h1>
      </div>
      <div className="mb-2 text-sm">News items count: {items.length}</div>
      <div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          items.map((item, idx) => (
            <div key={item.id || idx} className="border rounded bg-white shadow-sm mb-4 p-4" style={{ borderLeft: item.important ? '4px solid #f59e42' : '4px solid #3b82f6' }}>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Collected: {item.created || '-'}</span>
                <span>Published: {item.news_items && item.news_items[0]?.news_item_data?.published || '-'}</span>
              </div>
              <div className="text-lg font-semibold mb-1">{item.title}</div>
              <div className="mb-2 text-gray-700 text-sm">{item.description}</div>
              {item.news_items && item.news_items[0]?.news_item_data?.link && (
                <a
                  href={item.news_items[0].news_item_data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-xs hover:underline block mb-2"
                >
                  {item.news_items[0].news_item_data.link}
                </a>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>👍 {item.likes || 0}</span>
                <span>👎 {item.dislikes || 0}</span>
                <span>{item.read ? 'Read' : 'Unread'}</span>
                {item.important && <span className="text-orange-500 font-bold">Important</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssessPage; 