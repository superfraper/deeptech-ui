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
  BarChart,
  Bar,
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

const ReportsNew = () => {
  const { t } = useTranslation();
  const [reportsData, setReportsData] = useState({
    users: 0,
    vendors: 0,
    documents: 0,
    compliancePolicies: 0,
    regulatoryProcedures: 0,
    complianceEvents: 0,
    insuranceTests: 0,
    testsCompleted: 0,
    insuranceDocumentsRiskRate: 0,
  });
  const [complianceErrors, setComplianceErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch reports data
    const fetchData = async () => {
      try {
        // Mock data for demo
        const mockData = {
          users: 45,
          vendors: 12,
          documents: 156,
          compliancePolicies: 28,
          regulatoryProcedures: 42,
          complianceEvents: 8,
          insuranceTests: 15,
          testsCompleted: 12,
          insuranceDocumentsRiskRate: 23,
        };
        setReportsData(mockData);

        // Mock data for compliance errors list
        setComplianceErrors([
          { id: 1, description: 'Policy XYZ-123 requires update', severity: 'High', date: '2025-01-15' },
          { id: 2, description: 'Missing documentation for Vendor ABC', severity: 'Medium', date: '2025-01-14' },
          { id: 3, description: 'Regulatory procedure outdated', severity: 'Low', date: '2025-01-13' },
          { id: 4, description: 'Insurance test failed validation', severity: 'High', date: '2025-01-12' },
        ]);
      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      case 'Low':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <Sidebar />
      <main className='flex-1 overflow-auto ml-64' style={{ marginTop: 'var(--header-height)' }}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="mt-8">
            <h1 className="text-3xl font-bold">{t('reports.title')}</h1>
            <p className="text-muted-foreground">{t('reports.description')}</p>
          </div>

          {/* First Row - Basic Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('reports.users')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportsData.users}</div>
                <p className="text-xs text-muted-foreground">
                  {t('reports.numberOfUsers')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('reports.vendors')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportsData.vendors}</div>
                <p className="text-xs text-muted-foreground">
                  {t('reports.numberOfVendors')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('reports.documents')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportsData.documents}</div>
                <p className="text-xs text-muted-foreground">
                  {t('reports.numberOfDocuments')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('reports.compliancePolicies')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportsData.compliancePolicies}</div>
                <p className="text-xs text-muted-foreground">
                  {t('reports.policies')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Compliance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('reports.regulatoryProcedures')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportsData.regulatoryProcedures}</div>
                <p className="text-xs text-muted-foreground">
                  {t('reports.procedures')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('reports.complianceEvents')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportsData.complianceEvents}</div>
                <p className="text-xs text-muted-foreground">
                  {t('reports.events')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('reports.insuranceTests')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportsData.insuranceTests}</div>
                <p className="text-xs text-muted-foreground">
                  {t('reports.tests')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('reports.testsCompleted')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportsData.testsCompleted}</div>
                <p className="text-xs text-muted-foreground">
                  {t('reports.completedTests')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Third Row - Risk Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('reports.insuranceDocumentsRiskRate')}
                </CardTitle>
                <Badge variant={reportsData.insuranceDocumentsRiskRate > 30 ? 'destructive' : reportsData.insuranceDocumentsRiskRate > 15 ? 'secondary' : 'default'}>
                  {reportsData.insuranceDocumentsRiskRate}%
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportsData.insuranceDocumentsRiskRate}%</div>
                <Progress value={reportsData.insuranceDocumentsRiskRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {t('reports.riskRateDescription')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('reports.complianceErrors')}</CardTitle>
                <CardDescription>
                  {t('reports.complianceErrorsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {complianceErrors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('reports.noErrors')}</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {complianceErrors.map((error) => (
                      <div key={error.id} className="flex items-start justify-between p-2 border rounded-md">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{error.description}</p>
                          <p className="text-xs text-muted-foreground">{error.date}</p>
                        </div>
                        <Badge variant={getSeverityColor(error.severity)} className="ml-2">
                          {t(`reports.severity.${error.severity.toLowerCase()}`)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportsNew;

