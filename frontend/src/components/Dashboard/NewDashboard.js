import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useApi } from '../../services/api';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = {
  verified: '#10b981',
  unverified: '#6b7280',
  pending: '#f59e0b',
  audited: '#3b82f6',
  waiting: '#94a3b8',
  compliant: '#10b981',
  incompliant: '#ef4444',
  not_verified: '#6b7280',
};

const NewDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const api = useApi();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.getDashboardStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({
        total_vendors: 0,
        vendor_by_status: {},
        total_contracts: 0,
        contracts_by_audit_status: {},
        contracts_by_compliance: {},
        vendor_monitoring: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatVendorStatusData = () => {
    if (!stats?.vendor_by_status) return [];
    return Object.entries(stats.vendor_by_status).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: COLORS[status] || '#6b7280',
    }));
  };

  const formatContractAuditData = () => {
    if (!stats?.contracts_by_audit_status) return [];
    return Object.entries(stats.contracts_by_audit_status).map(
      ([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: COLORS[status] || '#6b7280',
      })
    );
  };

  const formatComplianceData = () => {
    if (!stats?.contracts_by_compliance) return [];
    return Object.entries(stats.contracts_by_compliance).map(
      ([status, count]) => ({
        name:
          status === 'not_verified'
            ? 'Not Verified'
            : status === 'incompliant'
              ? 'Non-Compliant'
              : status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: COLORS[status] || '#6b7280',
      })
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
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

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-muted-foreground'>Loading dashboard...</div>
      </div>
    );
  }

  const vendorStatusData = formatVendorStatusData();
  const contractAuditData = formatContractAuditData();
  const complianceData = formatComplianceData();

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='mt-8'>
        <h1 className='text-3xl font-bold'>Dashboard</h1>
        <p className='text-muted-foreground'>
          Overview of your vendor management and compliance status
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Vendors</CardTitle>
            <Badge variant='secondary'>{stats?.total_vendors || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.total_vendors || 0}</div>
            <p className='text-xs text-muted-foreground'>
              Active vendor relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Contracts
            </CardTitle>
            <Badge variant='secondary'>{stats?.total_contracts || 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.total_contracts || 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              Vendor contracts on file
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Verified Vendors
            </CardTitle>
            <Badge variant='success'>
              {stats?.vendor_by_status?.verified || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.vendor_by_status?.verified || 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              Vendors with verified status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Contracts Audited
            </CardTitle>
            <Badge variant='success'>
              {stats?.contracts_by_audit_status?.audited || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.contracts_by_audit_status?.audited || 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              Contracts with completed audits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {/* Vendor Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vendors by Status</CardTitle>
            <CardDescription>
              Distribution of vendor verification status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vendorStatusData.length > 0 ? (
              <ResponsiveContainer width='100%' height={250}>
                <PieChart>
                  <Pie
                    data={vendorStatusData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {vendorStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-[250px] flex items-center justify-center text-muted-foreground'>
                No vendor data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Audit Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Contracts by Audit Status</CardTitle>
            <CardDescription>Audited vs waiting contracts</CardDescription>
          </CardHeader>
          <CardContent>
            {contractAuditData.length > 0 ? (
              <ResponsiveContainer width='100%' height={250}>
                <PieChart>
                  <Pie
                    data={contractAuditData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {contractAuditData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-[250px] flex items-center justify-center text-muted-foreground'>
                No contract data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Contracts by Compliance</CardTitle>
            <CardDescription>
              Compliance status of audited contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {complianceData.length > 0 ? (
              <ResponsiveContainer width='100%' height={250}>
                <PieChart>
                  <Pie
                    data={complianceData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {complianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-[250px] flex items-center justify-center text-muted-foreground'>
                No compliance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendor Monitoring Table */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Vendor Monitoring Status</CardTitle>
            <CardDescription>
              Upcoming verification schedules and status
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/vendors')}>View All Vendors</Button>
        </CardHeader>
        <CardContent>
          {stats?.vendor_monitoring?.length > 0 ? (
            <table className='w-full'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left p-4 font-medium'>Vendor Name</th>
                  <th className='text-left p-4 font-medium'>Status</th>
                  <th className='text-left p-4 font-medium'>
                    Last Verification
                  </th>
                  <th className='text-left p-4 font-medium'>
                    Next Verification
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.vendor_monitoring.map((vendor) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='text-center py-8'>
              <p className='text-muted-foreground mb-4'>
                No vendors found. Add your first vendor to start monitoring.
              </p>
              <Button onClick={() => navigate('/vendors')}>Add Vendor</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card
          className='cursor-pointer hover:bg-muted/50 transition-colors'
          onClick={() => navigate('/contract-audit')}
        >
          <CardHeader>
            <CardTitle className='text-lg'>Vendor Contract Audit</CardTitle>
            <CardDescription>
              Audit vendor contracts against compliance checklists
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className='cursor-pointer hover:bg-muted/50 transition-colors'
          onClick={() => navigate('/frameworks/dora')}
        >
          <CardHeader>
            <CardTitle className='text-lg'>DORA Audit</CardTitle>
            <CardDescription>
              Assess DORA compliance for your organization
            </CardDescription>
          </CardHeader>
        </Card>

        <Card
          className='cursor-pointer hover:bg-muted/50 transition-colors'
          onClick={() => navigate('/vendors')}
        >
          <CardHeader>
            <CardTitle className='text-lg'>Manage Vendors</CardTitle>
            <CardDescription>
              Add, edit, and monitor your vendor relationships
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default NewDashboard;
