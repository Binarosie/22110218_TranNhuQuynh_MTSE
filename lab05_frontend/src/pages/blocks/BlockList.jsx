import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft } from 'lucide-react';

// BlockList
// Simple listing of blocks with "load more" (lazy pagination). Shows block name
// and parent building. The component avoids adding new dependencies and uses
// a Load more button for lazy loading.

const BlockList = () => {
  const [blocks, setBlocks] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBlocks(1);
  }, []);

  const fetchBlocks = async (p = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/blocks', { params: { page: p, pageSize: 20 } });
      const data = res.data?.data || { items: [], total: 0 };
      if (p === 1) setBlocks(data.items || []);
      else setBlocks(prev => [...prev, ...(data.items || [])]);
      setHasMore((p * 20) < (data.total || 0));
      setPage(p);
    } catch (err) {
      console.error('Error fetching blocks', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => fetchBlocks(page + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Blocks</h2>
            <Link to="/blocks/create" className="text-sm text-blue-600">Create Block</Link>
          </div>

          <div className="divide-y border-t">
            {blocks.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No blocks yet</div>
            )}

            {blocks.map(b => (
              <div key={b.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-gray-500">{b.building?.name || '—'}</div>
                </div>
                <div className="text-sm text-gray-600">{b.code || ''}</div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="p-4 text-center">
              <button onClick={loadMore} className="text-sm text-blue-600">Load more</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockList;
