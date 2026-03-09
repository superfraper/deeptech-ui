import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import { useSectionTitleContext } from '../../context/SectionTitleContext';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Package,
  Users,
  Plug,
  FileBarChart,
  ClipboardCheck,
  UserPlus,
  Eye,
  FileSearch,
  ListChecks,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const Sidebar = () => {
  const { t } = useTranslation();
  const { contextType, contextLoaded } = useDataContext();
  const { sectionTitles } = useSectionTitleContext();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    frameworks: true,
    'vendor-manager': true,
  });
  const location = useLocation();

  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: t('common.dashboard'),
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      id: 'frameworks',
      label: t('common.frameworks'),
      icon: FolderOpen,
      children: [
        {
          id: 'mica',
          label: 'MiCA',
          path: '/frameworks/mica',
          active: true,
        },
        {
          id: 'dora',
          label: 'DORA',
          path: '/frameworks/dora',
          active: true,
          disabled: false,
        },
      ],
    },
    {
      id: 'monitoring',
      label: t('common.monitoring'),
      icon: BarChart3,
      path: '/monitoring',
    },
    {
      id: 'whitepapers',
      label: t('common.whitepapers'),
      icon: FileText,
      path: '/whitepapers',
    },
    {
      id: 'reports',
      label: t('common.reports'),
      icon: FileBarChart,
      path: '/reports',
    },
    {
      id: 'vendor-manager',
      label: 'Vendor manager',
      icon: Building2,
      children: [
        {
          id: 'vendor-dashboard',
          label: 'Dashboard',
          path: '/vendors/dashboard',
          active: true,
        },
        {
          id: 'onboard-vendor',
          label: 'Onboard New Vendor',
          path: '/vendors/onboard',
          active: true,
        },
        {
          id: 'vendor-risk',
          label: 'Vendor Risk',
          path: '/vendors/risk',
          disabled: true,
        },
        {
          id: 'monitor-vendor',
          label: 'Monitor a Vendor',
          path: '/vendors/monitor',
          disabled: true,
        },
        {
          id: 'audit-contract',
          label: 'Audit a Contract',
          path: '/contract-audit',
          active: true,
        },
        {
          id: 'vendor-register',
          label: 'Vendor Register',
          path: '/vendors',
          active: true,
        },
      ],
    },
    {
      id: 'contract-audit',
      label: 'Contract Audit',
      icon: ClipboardCheck,
      path: '/contract-audit',
    },
    {
      id: 'settings',
      label: t('common.settings'),
      icon: Settings,
      path: '/settings',
    },
    {
      id: 'compliance',
      label: t('common.compliance'),
      icon: ShieldCheck,
      path: '/compliance',
      disabled: true,
    },
    {
      id: 'risk',
      label: t('common.risk'),
      icon: AlertTriangle,
      path: '/risk',
      disabled: true,
    },
    {
      id: 'assets',
      label: t('common.assets'),
      icon: Package,
      path: '/assets',
      disabled: true,
    },
    {
      id: 'teams',
      label: t('common.teams'),
      icon: Users,
      path: '/teams',
      disabled: true,
    },
    {
      id: 'integrations',
      label: t('common.integrations'),
      icon: Plug,
      path: '/integrations',
      disabled: true,
    },
  ];

  // Get MiCA sections if context is loaded
  const getMicaSections = () => {
    if (!contextType || !contextLoaded) return [];

    const commonMenuItems = [
      { label: 'Questionnaire', to: '/questionnaire', svgContent: 'Q' },
    ];

    if (contextType === 'ART') {
      return [
        ...commonMenuItems,
        { label: 'Section 1', to: '/art/section1', svgContent: '1' },
        { label: 'Section 2', to: '/art/summery', svgContent: '2' },
        { label: 'Part A', to: '/art/partA', svgContent: 'A' },
        { label: 'Part AA', to: '/art/partAA', svgContent: 'AA' },
        { label: 'Part B', to: '/art/partB', svgContent: 'B' },
        { label: 'Part C', to: '/art/partC', svgContent: 'C' },
        { label: 'Part D', to: '/art/partD', svgContent: 'D' },
        { label: 'Part E', to: '/art/partE', svgContent: 'E' },
        { label: 'Part F', to: '/art/partF', svgContent: 'F' },
        { label: 'Part G', to: '/art/partG', svgContent: 'G' },
        { label: 'Part H', to: '/art/partH', svgContent: 'H' },
      ];
    } else if (contextType === 'EMT') {
      return [
        ...commonMenuItems,
        { label: 'Section 1', to: '/emt/section1', svgContent: '1' },
        { label: 'Section 2', to: '/emt/summery', svgContent: '2' },
        { label: 'Part A', to: '/emt/partA', svgContent: 'A' },
        { label: 'Part B', to: '/emt/partB', svgContent: 'B' },
        { label: 'Part C', to: '/emt/partC', svgContent: 'C' },
        { label: 'Part D', to: '/emt/partD', svgContent: 'D' },
        { label: 'Part E', to: '/emt/partE', svgContent: 'E' },
        { label: 'Part F', to: '/emt/partF', svgContent: 'F' },
        { label: 'Part G', to: '/emt/partG', svgContent: 'G' },
      ];
    } else if (contextType === 'OTH') {
      return [
        ...commonMenuItems,
        { label: 'Section 1', to: '/oth/section1', svgContent: '1' },
        { label: 'Section 2', to: '/oth/summery', svgContent: '2' },
        { label: 'Part A', to: '/oth/partA', svgContent: 'A' },
        { label: 'Part B', to: '/oth/partB', svgContent: 'B' },
        { label: 'Part C', to: '/oth/partC', svgContent: 'C' },
        { label: 'Part D', to: '/oth/partD', svgContent: 'D' },
        { label: 'Part E', to: '/oth/partE', svgContent: 'E' },
        { label: 'Part F', to: '/oth/partF', svgContent: 'F' },
        { label: 'Part G', to: '/oth/partG', svgContent: 'G' },
        { label: 'Part H', to: '/oth/partH', svgContent: 'H' },
        { label: 'Part I', to: '/oth/partI', svgContent: 'I' },
        { label: 'Part J', to: '/oth/partJ', svgContent: 'J' },
      ];
    }

    return commonMenuItems;
  };

  const micaSections = getMicaSections();
  const isMicaRoute = location.pathname.startsWith('/frameworks/mica') || 
                      location.pathname.startsWith('/questionnaire') ||
                      location.pathname.startsWith('/art/') ||
                      location.pathname.startsWith('/emt/') ||
                      location.pathname.startsWith('/oth/');

  return (
    <aside
      className={cn(
        'flex flex-col fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-30',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{ paddingTop: 'var(--header-height)' }}
    >
      {!collapsed && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center p-4 border-b border-border bg-card" style={{ height: 'var(--header-height)' }}>
          <img 
            src={`${process.env.PUBLIC_URL}/audomate-logo.png`} 
            alt='Audomate' 
            className='h-8 w-auto' 
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedSections[item.id];

            if (hasChildren) {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      collapsed && 'justify-center'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>
                  {!collapsed && isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.id}
                            to={child.disabled ? '#' : child.path}
                            className={cn(
                              'block px-3 py-2 rounded-md text-sm transition-colors',
                              child.disabled
                                ? 'text-muted-foreground cursor-not-allowed opacity-50'
                                : isChildActive
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-accent hover:text-accent-foreground'
                            )}
                            onClick={(e) => {
                              if (child.disabled) {
                                e.preventDefault();
                              }
                            }}
                          >
                            {child.label}
                            {child.disabled && !collapsed && (
                              <span className="ml-2 text-xs">{t('common.comingSoon')}</span>
                            )}
                          </Link>
                        );
                      })}
                      {/* Show MiCA sections if on MiCA route */}
                      {item.id === 'frameworks' && isMicaRoute && micaSections.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border">
                          {micaSections.map((section) => {
                            const sectionIsActive = location.pathname === section.to;
                            return (
                              <Link
                                key={section.to}
                                to={section.to}
                                className={cn(
                                  'block px-3 py-2 rounded-md text-sm transition-colors',
                                  sectionIsActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent hover:text-accent-foreground'
                                )}
                              >
                                {section.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.disabled ? '#' : item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  item.disabled
                    ? 'text-muted-foreground cursor-not-allowed opacity-50'
                    : isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center'
                )}
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault();
                  }
                }}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    {item.disabled && <span className="ml-auto text-xs">{t('common.comingSoon')}</span>}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-border">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5 rotate-90" />}
          {!collapsed && <span>{t('sidebar.collapse')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
