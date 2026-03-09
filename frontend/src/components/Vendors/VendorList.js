import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../services/api';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';

const VendorList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const api = useApi();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', status: 'unverified' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await api.listVendors();
      setVendors(response.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async () => {
    if (!newVendor.name.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createVendor(newVendor);
      setNewVendor({ name: '', status: 'unverified' });
      setShowAddModal(false);
      fetchVendors();
    } catch (error) {
      console.error('Error creating vendor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;

    try {
      await api.deleteVendor(vendorId);
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: { variant: 'success', label: 'Verified' },
      unverified: { variant: 'secondary', label: 'Unverified' },
      pending: { variant: 'warning', label: 'Pending' },
    };
    const config = statusConfig[status] || statusConfig.unverified;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <Sidebar />
      <main 
        className='flex-1 overflow-auto ml-64 p-6' 
        style={{ marginTop: 'var(--header-height)' }}
      >
        <div className='max-w-7xl mx-auto'>
          <div className='flex justify-between items-center mb-6'>
            <div>
              <h1 className='text-2xl font-bold'>Vendors</h1>
              <p className='text-muted-foreground'>
                Manage your vendor relationships
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>Add Vendor</Button>
          </div>

          {loading ? (
            <div className='flex items-center justify-center h-64'>
              <p className='text-muted-foreground'>Loading vendors...</p>
            </div>
          ) : vendors.length === 0 ? (
            <Card>
              <CardContent className='flex flex-col items-center justify-center h-64'>
                <p className='text-muted-foreground mb-4'>
                  No vendors found. Add your first vendor to get started.
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  Add Your First Vendor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='bg-card rounded-lg border'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left p-4 font-medium'>Name</th>
                    <th className='text-left p-4 font-medium'>Status</th>
                    <th className='text-left p-4 font-medium'>
                      Last Verification
                    </th>
                    <th className='text-left p-4 font-medium'>
                      Next Verification
                    </th>
                    <th className='text-left p-4 font-medium'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className='border-b hover:bg-muted/50 cursor-pointer'
                      onClick={() => navigate(`/vendors/${vendor.id}`)}
                    >
                      <td className='p-4 font-medium'>{vendor.name}</td>
                      <td className='p-4'>{getStatusBadge(vendor.status)}</td>
                      <td className='p-4'>
                        {formatDate(vendor.last_verification_date)}
                      </td>
                      <td className='p-4'>
                        {formatDate(vendor.next_verification_date)}
                      </td>
                      <td className='p-4'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVendor(vendor.id);
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle>Add New Vendor</CardTitle>
              <CardDescription>
                Enter the vendor details below
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label htmlFor='new-vendor-name' className='text-sm font-medium'>Vendor Name</label>
                <Input
                  id='new-vendor-name'
                  value={newVendor.name}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, name: e.target.value })
                  }
                  placeholder='Enter vendor name'
                />
              </div>
              <div>
                <label htmlFor='new-vendor-status' className='text-sm font-medium'>Status</label>
                <Select
                  id='new-vendor-status'
                  value={newVendor.status}
                  onChange={(e) =>
                    setNewVendor({ ...newVendor, status: e.target.value })
                  }
                >
                  <option value='unverified'>Unverified</option>
                  <option value='verified'>Verified</option>
                  <option value='pending'>Pending</option>
                </Select>
              </div>
              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddVendor} disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Vendor'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VendorList;
