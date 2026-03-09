import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './i18n/config';
import MainPage from './components/MainPage';
import Dashboard from './components/Dashboard';
import Cookie from './components/Cookie';
import Privacy from './components/Privacy';
import Standard from './components/Standard';
import Questinare from './components/Questionare';
import Thankyou from './components/Thankyou';
import PDF from './components/pdfview';
import Test from './components/test';
import Profile from './components/Profile';
import ProfileFiles from './components/ProfileFiles';
import Questionnaire from './components/Funtional/Forms/Questionnaire';
import { SectionTitleProvider } from './context/SectionTitleContext';
import { AutosaveProvider } from './context/AutosaveContext';
import { MarkedFieldsProvider } from './context/MarkedFieldsContext';
import { DataProvider } from './context/DataContext';
import { FileProcessingProvider } from './context/FileProcessingContext';
import OthSection1 from './components/Pages/Oth/Section1';
import OthSummery from './components/Pages/Oth/Summery';
import OthPartA from './components/Pages/Oth/PartA';
import OthPartB from './components/Pages/Oth/PartB';
import OthPartC from './components/Pages/Oth/PartC';
import OthPartD from './components/Pages/Oth/PartD';
import OthPartE from './components/Pages/Oth/PartE';
import OthPartF from './components/Pages/Oth/PartF';
import OthPartG from './components/Pages/Oth/PartG';
import OthPartH from './components/Pages/Oth/PartH';
import OthPartI from './components/Pages/Oth/PartI';
import OthPartJ from './components/Pages/Oth/PartJ';
import ArtSection1 from './components/Pages/Art/Section1';
import ArtSummery from './components/Pages/Art/Summery';
import ArtPartA from './components/Pages/Art/PartA';
import ArtPartAA from './components/Pages/Art/PartAA';
import ArtPartB from './components/Pages/Art/PartB';
import ArtPartC from './components/Pages/Art/PartC';
import ArtPartD from './components/Pages/Art/PartD';
import ArtPartE from './components/Pages/Art/PartE';
import ArtPartF from './components/Pages/Art/PartF';
import ArtPartG from './components/Pages/Art/PartG';
import ArtPartH from './components/Pages/Art/PartH';
import EmtSection1 from './components/Pages/Emt/Section1';
import EmtSummery from './components/Pages/Emt/Summery';
import EmtPartA from './components/Pages/Emt/PartA';
import EmtPartB from './components/Pages/Emt/PartB';
import EmtPartC from './components/Pages/Emt/PartC';
import EmtPartD from './components/Pages/Emt/PartD';
import EmtPartE from './components/Pages/Emt/PartE';
import EmtPartF from './components/Pages/Emt/PartF';
import EmtPartG from './components/Pages/Emt/PartG';
import GenerationCompletionNotification from './components/Common/GenerationCompletionNotification';
import GenerationStatus from './components/Common/GenerationStatus';
import GenerationFailureHandler from './components/Common/GenerationFailureHandler';
import FileProcessingNotification from './components/Common/FileProcessingNotification';
import WhitepaperProgress from './components/WhitepaperProgress';
import Onboarding from './components/Onboarding/Onboarding';
import OnboardingGuard from './components/Onboarding/OnboardingGuard';
import NewDashboard from './components/Dashboard/NewDashboard';
import Monitoring from './components/Monitoring/Monitoring';
import Reports from './components/Reports/Reports';
import ReportsNew from './components/Reports/ReportsNew';
import Settings from './components/Settings/Settings';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DoraAudit from './components/Dora/DoraAudit';
import DoraReports from './components/Dora/DoraReports';
import VendorList from './components/Vendors/VendorList';
import VendorDetail from './components/Vendors/VendorDetail';
import VendorManagerDashboard from './components/Vendors/VendorManagerDashboard';
import OnboardVendorWizard from './components/Vendors/OnboardVendor/OnboardVendorWizard';
import ContractAudit from './components/ContractAudit/ContractAudit';
import ChatWidget from './components/Chat/ChatWidget';

// Loading component to show while authentication is in progress
const LoadingComponent = () => (
  <div className='min-h-screen flex items-center justify-center'>
    <p className='text-xl'>Loading, please wait...</p>
  </div>
);

// HOC to protect routes
const ProtectedRoute = ({ component, ...args }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => <LoadingComponent />,
  });
  return <Component {...args} />;
};

function App() {
  return (
    <Auth0Provider
      domain='dev-lzz2sk107uunqvja.us.auth0.com'
      clientId='wUkBgLvohZZ3rumom9QXHQ93fqJeA1s1'
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience:
          process.env.REACT_APP_AUTH0_AUDIENCE || 'https://esf-dash-rag-api',
        scope: 'openid profile email read:current_user',
      }}
    >
      <Router>
        <DataProvider>
          <FileProcessingProvider>
            <SectionTitleProvider>
              <MarkedFieldsProvider>
                <AutosaveProvider>
                  <OnboardingGuard>
                    <GenerationStatus />
                    <GenerationCompletionNotification />
                    <GenerationFailureHandler />
                    <FileProcessingNotification />
                    <ChatWidget />
                    <Routes>
                    {/* Public routes */}
                    <Route path='/' element={<MainPage />} />
                    <Route path='/standard-disclaimer' element={<Standard />} />
                    <Route path='/cookie-policy' element={<Cookie />} />
                    <Route path='/privacy-policy' element={<Privacy />} />

                    {/* Protected routes */}
                    <Route
                      path='/onboarding'
                      element={<ProtectedRoute component={Onboarding} />}
                    />
                    <Route
                      path='/questionnaire'
                      element={<ProtectedRoute component={Questionnaire} />}
                    />
                    <Route
                      path='/dashboard'
                      element={<ProtectedRoute component={Dashboard} />}
                    />
                    <Route
                      path='/frameworks/mica'
                      element={<ProtectedRoute component={Questionnaire} />}
                    />
                    <Route
                      path='/frameworks/dora'
                      element={<ProtectedRoute component={DoraAudit} />}
                    />
                    <Route
                      path='/frameworks/dora/reports'
                      element={<ProtectedRoute component={DoraReports} />}
                    />
                    <Route
                      path='/vendors'
                      element={<ProtectedRoute component={VendorList} />}
                    />
                    <Route
                      path='/vendors/dashboard'
                      element={<ProtectedRoute component={VendorManagerDashboard} />}
                    />
                    <Route
                      path='/vendors/onboard'
                      element={<ProtectedRoute component={OnboardVendorWizard} />}
                    />
                    <Route
                      path='/vendors/onboard/:vendorId'
                      element={<ProtectedRoute component={OnboardVendorWizard} />}
                    />
                    <Route
                      path='/vendors/:vendorId'
                      element={<ProtectedRoute component={VendorDetail} />}
                    />
                    <Route
                      path='/contract-audit'
                      element={<ProtectedRoute component={ContractAudit} />}
                    />
                    <Route
                      path='/monitoring'
                      element={<ProtectedRoute component={Monitoring} />}
                    />
                    <Route
                      path='/reports'
                      element={<ProtectedRoute component={ReportsNew} />}
                    />
                    <Route
                      path='/whitepapers'
                      element={<ProtectedRoute component={Reports} />}
                    />
                    <Route
                      path='/settings'
                      element={<ProtectedRoute component={Settings} />}
                    />
                    <Route
                      path='/whitepaper-progress'
                      element={
                        <ProtectedRoute component={WhitepaperProgress} />
                      }
                    />
                    <Route
                      path='/whitepaper-progress/:generationId'
                      element={
                        <ProtectedRoute component={WhitepaperProgress} />
                      }
                    />
                    <Route
                      path='/questionare'
                      element={<ProtectedRoute component={Questinare} />}
                    />
                    <Route
                      path='/thankyou'
                      element={<ProtectedRoute component={Thankyou} />}
                    />
                    <Route
                      path='/pdf'
                      element={<ProtectedRoute component={PDF} />}
                    />
                    <Route
                      path='/testing'
                      element={<ProtectedRoute component={Test} />}
                    />
                    <Route
                      path='/profile'
                      element={<ProtectedRoute component={Profile} />}
                    />
                    <Route
                      path='/profile/files'
                      element={<ProtectedRoute component={ProfileFiles} />}
                    />

                    {/* OTH-specific routes - Make them protected */}
                    <Route
                      path='/oth/section1'
                      element={<ProtectedRoute component={OthSection1} />}
                    />
                    <Route
                      path='/oth/summery'
                      element={<ProtectedRoute component={OthSummery} />}
                    />
                    <Route
                      path='/oth/partA'
                      element={<ProtectedRoute component={OthPartA} />}
                    />
                    <Route
                      path='/oth/partB'
                      element={<ProtectedRoute component={OthPartB} />}
                    />
                    <Route
                      path='/oth/partC'
                      element={<ProtectedRoute component={OthPartC} />}
                    />
                    <Route
                      path='/oth/partD'
                      element={<ProtectedRoute component={OthPartD} />}
                    />
                    <Route
                      path='/oth/partE'
                      element={<ProtectedRoute component={OthPartE} />}
                    />
                    <Route
                      path='/oth/partF'
                      element={<ProtectedRoute component={OthPartF} />}
                    />
                    <Route
                      path='/oth/partG'
                      element={<ProtectedRoute component={OthPartG} />}
                    />
                    <Route
                      path='/oth/partH'
                      element={<ProtectedRoute component={OthPartH} />}
                    />
                    <Route
                      path='/oth/partI'
                      element={<ProtectedRoute component={OthPartI} />}
                    />
                    <Route
                      path='/oth/partJ'
                      element={<ProtectedRoute component={OthPartJ} />}
                    />

                    {/* ART-specific routes - Make them protected */}
                    <Route
                      path='/art/section1'
                      element={<ProtectedRoute component={ArtSection1} />}
                    />
                    <Route
                      path='/art/summery'
                      element={<ProtectedRoute component={ArtSummery} />}
                    />
                    <Route
                      path='/art/partA'
                      element={<ProtectedRoute component={ArtPartA} />}
                    />
                    <Route
                      path='/art/partAA'
                      element={<ProtectedRoute component={ArtPartAA} />}
                    />
                    <Route
                      path='/art/partB'
                      element={<ProtectedRoute component={ArtPartB} />}
                    />
                    <Route
                      path='/art/partC'
                      element={<ProtectedRoute component={ArtPartC} />}
                    />
                    <Route
                      path='/art/partD'
                      element={<ProtectedRoute component={ArtPartD} />}
                    />
                    <Route
                      path='/art/partE'
                      element={<ProtectedRoute component={ArtPartE} />}
                    />
                    <Route
                      path='/art/partF'
                      element={<ProtectedRoute component={ArtPartF} />}
                    />
                    <Route
                      path='/art/partG'
                      element={<ProtectedRoute component={ArtPartG} />}
                    />
                    <Route
                      path='/art/partH'
                      element={<ProtectedRoute component={ArtPartH} />}
                    />

                    {/* EMT-specific routes - Make them protected */}
                    <Route
                      path='/emt/section1'
                      element={<ProtectedRoute component={EmtSection1} />}
                    />
                    <Route
                      path='/emt/summery'
                      element={<ProtectedRoute component={EmtSummery} />}
                    />
                    <Route
                      path='/emt/partA'
                      element={<ProtectedRoute component={EmtPartA} />}
                    />
                    <Route
                      path='/emt/partB'
                      element={<ProtectedRoute component={EmtPartB} />}
                    />
                    <Route
                      path='/emt/partC'
                      element={<ProtectedRoute component={EmtPartC} />}
                    />
                    <Route
                      path='/emt/partD'
                      element={<ProtectedRoute component={EmtPartD} />}
                    />
                    <Route
                      path='/emt/partE'
                      element={<ProtectedRoute component={EmtPartE} />}
                    />
                    <Route
                      path='/emt/partF'
                      element={<ProtectedRoute component={EmtPartF} />}
                    />
                    <Route
                      path='/emt/partG'
                      element={<ProtectedRoute component={EmtPartG} />}
                    />
                  </Routes>
                  </OnboardingGuard>
                </AutosaveProvider>
              </MarkedFieldsProvider>
            </SectionTitleProvider>
          </FileProcessingProvider>
        </DataProvider>
      </Router>
    </Auth0Provider>
  );
}

export default App;
