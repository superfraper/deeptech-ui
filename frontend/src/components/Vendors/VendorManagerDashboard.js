import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';

const VendorManagerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const api = useApi();
  const [stats, setStats] = useState({
    tasksInProgress: 0,
    warnings: 0,
    vendorsRegistered: 0,
    newVendors: 0,
    reports: 0,
  });
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [vendorsResponse, statsResponse, qualificationsResponse] = await Promise.all([
        api.listVendors(),
        api.getDashboardStats(),
        api.listVendorQualifications(),
      ]);

      setVendors(vendorsResponse.vendors || []);

      const qualifications = qualificationsResponse?.qualifications || [];
      const inProgressCount = qualifications.filter(q => q.status === 'in_progress').length;

      setStats({
        tasksInProgress: inProgressCount || 21,
        warnings: 12,
        vendorsRegistered: statsResponse?.total_vendors || 0,
        newVendors: 2,
        reports: 345,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value }) => (
    <Card className='text-center'>
      <CardContent className='pt-6'>
        <p className='text-sm text-muted-foreground mb-1'>{title}</p>
        <p className='text-3xl font-bold'>{value}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <Sidebar />
      <main
        className='flex-1 overflow-auto ml-64 p-6'
        style={{ marginTop: 'var(--header-height)' }}
      >
        <div className='max-w-7xl mx-auto space-y-6'>
          {/* Stats Cards */}
          <div className='grid grid-cols-5 gap-4'>
            <StatCard title='Tasks in progress' value={stats.tasksInProgress} />
            <StatCard title='Warnings' value={stats.warnings} />
            <StatCard title='Vendors Registered' value={stats.vendorsRegistered} />
            <StatCard title='New Vendors' value={stats.newVendors} />
            <StatCard title='Reports' value={stats.reports} />
          </div>

          {/* Vendors Table */}
          <Card>
            <CardContent className='p-0'>
              {loading ? (
                <div className='flex items-center justify-center h-64'>
                  <p className='text-muted-foreground'>Loading vendors...</p>
                </div>
              ) : vendors.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-64'>
                  <p className='text-muted-foreground mb-4'>No vendors found</p>
                  <Button onClick={() => navigate('/vendors/onboard')}>
                    Add Your First Vendor
                  </Button>
                </div>
              ) : (
                <table className='w-full'>
                  <thead className='bg-muted'>
                    <tr className='border-b'>
                      <th className='p-4 text-left font-medium'>Name</th>
                      <th className='p-4 text-left font-medium'>Status</th>
                      <th className='p-4 text-left font-medium'>Documents</th>
                      <th className='p-4 text-left font-medium'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.slice(0, 4).map((vendor, index) => (
                      <tr key={vendor.id} className='border-b last:border-b-0'>
                        <td className='p-4 font-medium w-1/5'>
                          {vendor.name || `Vendor ${index + 1}`}
                        </td>
                        <td className='p-4 w-1/5'>
                          <div className='border border-gray-200 rounded p-2 text-sm text-center'>
                            Status, upcoming tasks
                          </div>
                        </td>
                        <td className='p-4 w-1/5'>
                          <div className='border border-gray-200 rounded p-2 text-sm text-center'>
                            Contract, documents
                          </div>
                        </td>
                        <td className='p-4 w-2/5'>
                          <div className='border border-gray-200 rounded p-2 text-sm'>
                            Actions (audit a contract, risk review, run monitoring process...
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* More Vendors Link */}
          {vendors.length > 4 && (
            <div className='text-center'>
              <button
                onClick={() => navigate('/vendors')}
                className='text-primary hover:underline'
              >
                more Vendors
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VendorManagerDashboard;
