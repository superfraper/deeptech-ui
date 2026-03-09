import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const VendorDetail = () => {
  const { t } = useTranslation();
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const [vendor, setVendor] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVendorDetails();
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const response = await api.getVendor(vendorId);
      setVendor(response.vendor);
      setContracts(response.contracts || []);
      setEditData({
        name: response.vendor.name,
        status: response.vendor.status,
      });
    } catch (error) {
      console.error('Error fetching vendor details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      await api.updateVendor(vendorId, editData);
      setIsEditing(false);
      fetchVendorDetails();
    } catch (error) {
      console.error('Error updating vendor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;

    try {
      await api.deleteVendor(vendorId);
      navigate('/vendors');
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

  const getAuditStatusBadge = (status) => {
    const statusConfig = {
      audited: { variant: 'success', label: 'Audited' },
      waiting: { variant: 'secondary', label: 'Waiting' },
    };
    const config = statusConfig[status] || statusConfig.waiting;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getComplianceBadge = (status) => {
    const statusConfig = {
      compliant: { variant: 'success', label: 'Compliant' },
      incompliant: { variant: 'destructive', label: 'Non-Compliant' },
      not_verified: { variant: 'secondary', label: 'Not Verified' },
    };
    const config = statusConfig[status] || statusConfig.not_verified;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-background'>
        <Header />
        <Sidebar />
        <main 
          className='flex-1 overflow-auto ml-64 p-6' 
          style={{ marginTop: 'var(--header-height)' }}
        >
          <div className='flex items-center justify-center h-64'>
            <p className='text-muted-foreground'>Loading vendor details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className='min-h-screen bg-background'>
        <Header />
        <Sidebar />
        <main 
          className='flex-1 overflow-auto ml-64 p-6' 
          style={{ marginTop: 'var(--header-height)' }}
        >
          <div className='flex flex-col items-center justify-center h-64'>
            <p className='text-muted-foreground mb-4'>Vendor not found</p>
            <Button onClick={() => navigate('/vendors')}>
              Back to Vendors
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <Sidebar />
      <main 
        className='flex-1 overflow-auto ml-64 p-6' 
        style={{ marginTop: 'var(--header-height)' }}
      >
        <div className='max-w-7xl mx-auto space-y-6'>
            <div className='flex items-center gap-4 mb-6'>
              <Button variant='ghost' onClick={() => navigate('/vendors')}>
                ← Back to Vendors
              </Button>
            </div>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <div>
                  <CardTitle className='text-2xl'>{vendor.name}</CardTitle>
                  <CardDescription>
                    Created on {formatDate(vendor.created_at)}
                  </CardDescription>
                </div>
                <div className='flex gap-2'>
                  {!isEditing && (
                    <>
                      <Button
                        variant='outline'
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </Button>
                      <Button variant='destructive' onClick={handleDelete}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className='space-y-4'>
                    <div>
                      <label htmlFor='edit-vendor-name' className='text-sm font-medium'>Vendor Name</label>
                      <Input
                        id='edit-vendor-name'
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor='edit-vendor-status' className='text-sm font-medium'>Status</label>
                      <Select
                        id='edit-vendor-status'
                        value={editData.status}
                        onChange={(e) =>
                          setEditData({ ...editData, status: e.target.value })
                        }
                      >
                        <option value='unverified'>Unverified</option>
                        <option value='verified'>Verified</option>
                        <option value='pending'>Pending</option>
                      </Select>
                    </div>
                    <div className='flex gap-2 pt-4'>
                      <Button
                        variant='outline'
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpdate} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div>
                      <p className='text-sm text-muted-foreground'>Status</p>
                      <div className='mt-1'>{getStatusBadge(vendor.status)}</div>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Last Verification
                      </p>
                      <p className='font-medium'>
                        {formatDate(vendor.last_verification_date)}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Next Verification
                      </p>
                      <p className='font-medium'>
                        {formatDate(vendor.next_verification_date)}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Contracts</p>
                      <p className='font-medium'>{contracts.length}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <div>
                  <CardTitle>Contracts</CardTitle>
                  <CardDescription>
                    Contracts associated with this vendor
                  </CardDescription>
                </div>
                <Button
                  onClick={() =>
                    navigate(`/contract-audit?vendor_id=${vendorId}`)
                  }
                >
                  Audit Contract
                </Button>
              </CardHeader>
              <CardContent>
                {contracts.length === 0 ? (
                  <div className='text-center py-8'>
                    <p className='text-muted-foreground'>
                      No contracts found for this vendor
                    </p>
                  </div>
                ) : (
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left p-4 font-medium'>Filename</th>
                        <th className='text-left p-4 font-medium'>
                          Audit Status
                        </th>
                        <th className='text-left p-4 font-medium'>
                          Compliance
                        </th>
                        <th className='text-left p-4 font-medium'>
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {contracts.map((contract) => (
                        <tr key={contract.id} className='border-b'>
                          <td className='p-4'>{contract.filename}</td>
                          <td className='p-4'>
                            {getAuditStatusBadge(contract.audit_status)}
                          </td>
                          <td className='p-4'>
                            {getComplianceBadge(contract.compliance_status)}
                          </td>
                          <td className='p-4'>
                            {formatDate(contract.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
};

export default VendorDetail;
