import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * BreadcrumbNav component displays a breadcrumb navigation path
 *
 * @param {Object} props
 * @param {string} props.currentPageName - Name of the current page to display in the breadcrumb
 * @param {Object[]} props.additionalCrumbs - Optional additional breadcrumb items
 * @returns {JSX.Element}
 */
const BreadcrumbNav = ({ currentPageName, additionalCrumbs = [] }) => {
  const location = useLocation();
  // Define the base breadcrumb (Dashboard)
  const baseCrumbs = [
    {
      path: '/dashboard',
      name: 'Dashboard',
    },
  ];

  // Combine base crumbs with any additional custom crumbs
  const allCrumbs = [
    ...baseCrumbs,
    ...additionalCrumbs,
    {
      path: location.pathname,
      name: currentPageName,
    },
  ];
  return (
    <nav
      aria-label='breadcrumb'
      className='mb-6 bg-gray-100 p-3 rounded-md shadow-sm'
    >
      <ol className='flex flex-wrap items-center space-x-1 text-sm text-gray-700 font-medium'>
        {allCrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && (
              <li className='mx-1 text-gray-400' aria-hidden='true'>
                /
              </li>
            )}
            <li
              className={
                index === allCrumbs.length - 1
                  ? 'text-blue-600 font-medium'
                  : ''
              }
            >
              {index === allCrumbs.length - 1 ? (
                <span>{crumb.name}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className='hover:text-blue-700 hover:underline'
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
