import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Monitoring = () => {
  const { t } = useTranslation();
  const [monitoringData, setMonitoringData] = useState({
    documentCount: 0,
    userCount: 0,
    compliance: 0,
    lastUpdate: null,
    complianceHistory: [],
  });
  const [documentStatuses, setDocumentStatuses] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch monitoring data
    const fetchData = async () => {
      try {
        // Mock data for compliance history (last 12 months)
        const complianceHistory = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          complianceHistory.push({
            month: date.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' }),
            compliance: Math.floor(Math.random() * 26) + 70, // 70-95%
          });
        }

        // Mock data for demo
        const mockData = {
          documentCount: 42,
          userCount: 8,
          compliance: 87,
          lastUpdate: new Date().toISOString(),
          complianceHistory,
        };
        setMonitoringData(mockData);

        // Mock data for document statuses distribution
        setDocumentStatuses([
          { name: t('documentStatus.completed'), value: 60, color: '#10b981' },
          { name: t('documentStatus.inProgress'), value: 25, color: '#3b82f6' },
          { name: t('documentStatus.pending'), value: 10, color: '#f59e0b' },
          { name: t('documentStatus.error'), value: 5, color: '#ef4444' },
        ]);

        // Mock data for user activity (last 30 days)
        const userActivityData = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          userActivityData.push({
            date: date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }),
            users: Math.floor(Math.random() * 8) + 5, // 5-12 users
          });
        }
        setUserActivity(userActivityData);
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <Sidebar />
      <main className='flex-1 overflow-auto ml-64' style={{ marginTop: 'var(--header-height)' }}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="mt-8">
            <h1 className="text-3xl font-bold">{t('monitoring.title')}</h1>
            <p className="text-muted-foreground">{t('monitoring.description')}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('monitoring.currentDocuments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringData.documentCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('monitoring.activeDocuments')}
            </p>
          </CardContent>
            </Card>

            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('monitoring.todaysUsers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringData.userCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('monitoring.activeUsers')}
            </p>
          </CardContent>
            </Card>

            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('monitoring.latestCompliance')}
            </CardTitle>
            <Badge variant={monitoringData.compliance >= 80 ? 'default' : 'secondary'}>
              {monitoringData.compliance}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringData.compliance}%</div>
            <Progress value={monitoringData.compliance} className="mt-2" />
          </CardContent>
            </Card>

            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('monitoring.latestUpdate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {formatDate(monitoringData.lastUpdate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('monitoring.lastSync')}
            </p>
          </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Compliance Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t('monitoring.complianceTrend')}</CardTitle>
                <CardDescription>
                  {t('monitoring.complianceTrendDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monitoringData.complianceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[60, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="compliance" 
                      stroke="#52ad80" 
                      strokeWidth={2}
                      name={t('monitoring.compliance')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Document Statuses Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t('monitoring.documentStatuses')}</CardTitle>
                <CardDescription>
                  {t('monitoring.documentStatusesDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={documentStatuses}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {documentStatuses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Activity Chart */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t('monitoring.userActivity')}</CardTitle>
                <CardDescription>
                  {t('monitoring.userActivityDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userActivity}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#52ad80" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#52ad80" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#52ad80" 
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      name={t('monitoring.activeUsersLabel')}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Monitoring;

