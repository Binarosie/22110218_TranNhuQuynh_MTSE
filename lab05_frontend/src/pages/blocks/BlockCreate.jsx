import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Save } from 'lucide-react';

// BlockCreate
// A small form to create a new Block. The building selection is lazy-loaded
// (search with debounce). Validation is performed with yup + react-hook-form.

const schema = yup.object({
  name: yup.string().min(2, 'Block name must be at least 2 characters').required('Block name is required'),
  code: yup.string().optional(),
  buildingId: yup.number().required('Please select a building'),
});

const BlockCreate = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    // When search or page changes, fetch buildings (debounced for search)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchBuildings(search, 1, true);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchBuildings = async (q = '', p = 1, replace = false) => {
    try {
      setLoading(true);
      const res = await api.get('/buildings', { params: { q, page: p, pageSize: 20 } });
      const data = res.data?.data || { items: [], total: 0 };
      if (replace) {
        setBuildings(data.items || []);
      } else {
        setBuildings(prev => [...prev, ...(data.items || [])]);
      }
      setHasMore((p * 20) < (data.total || 0));
      setPage(p);
    } catch (err) {
      console.error('Error fetching buildings', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchBuildings(search, page + 1, false);
  };

  const onSubmit = async (values) => {
    try {
      const payload = { name: values.name, code: values.code || null, buildingId: parseInt(values.buildingId) };
      const res = await api.post('/blocks', payload);
      if (res.data?.success) {
        navigate('/blocks');
      } else {
        setError('root', { type: 'manual', message: res.data?.message || 'Failed to create block' });
      }
    } catch (error) {
      console.error('Create block error', error);
      setError('root', { type: 'manual', message: error.response?.data?.message || 'Create block failed' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create Block</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Block Name</label>
              <input {...register('name')} className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md`} placeholder="Enter block name" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Code (optional)</label>
              <input {...register('code')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Block code" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Building (search)</label>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Type to search buildings" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />

              <div className="mt-2 border rounded max-h-48 overflow-auto">
                {buildings.length === 0 && <div className="p-3 text-sm text-gray-500">No buildings found</div>}
                {buildings.map(b => (
                  <label key={b.id} className="flex items-center px-3 py-2 hover:bg-gray-50">
                    <input type="radio" {...register('buildingId')} value={b.id} className="mr-3" />
                    <div>
                      <div className="text-sm font-medium">{b.name}</div>
                      <div className="text-xs text-gray-500">{b.address || ''}</div>
                    </div>
                  </label>
                ))}
                {hasMore && (
                  <div className="p-3 text-center">
                    <button type="button" onClick={loadMore} className="text-sm text-blue-600">Load more</button>
                  </div>
                )}
              </div>
              {errors.buildingId && <p className="mt-1 text-sm text-red-600">{errors.buildingId.message}</p>}
            </div>

            {/** Root error */}
            <div>
              {errors.root && <div className="rounded-md bg-red-50 p-3 text-red-700">{errors.root.message}</div>}
            </div>

            <div className="flex justify-end">
              <button type="submit" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md">
                <Save className="h-4 w-4 mr-2" /> Create Block
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlockCreate;
