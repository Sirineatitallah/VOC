import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import DashboardVI from './pages/DashboardVI';
import VulnerabilityList from './pages/VulnerabilityList';
import CVEDetails from './pages/CVEDetails';
import NotFound from './pages/NotFound';
import CollectorsNodes from './pages/intelligence/CollectorsNodes';
import OSINTSources from './pages/intelligence/OSINTSources';
import OSINTSourceGroups from './pages/intelligence/OSINTSourceGroups';
import NewCollectorForm from './pages/intelligence/NewCollectorForm';
import EditCollectorForm from './pages/intelligence/EditCollectorForm';
import NewOSINTSourceForm from './pages/intelligence/NewOSINTSourceForm';
import EditOSINTSourceForm from './pages/intelligence/EditOSINTSourceForm';
import OSINTSourceGroupForm from './pages/intelligence/OSINTSourceGroupForm';
import AddCollectorSourceForm from './pages/intelligence/AddCollectorSourceForm';
import IntelligenceCenter from './pages/IntelligenceCenter';
import OSINTSourceDetail from './pages/intelligence/OSINTSourceDetail';
import PresentersNodes from './pages/data-presentation/PresentersNodes';
import ProductTypes from './pages/data-presentation/ProductTypes';
import ProductTypeDetail from './pages/data-presentation/ProductTypeDetail';
import PublishersNodes from './pages/publishing/PublishersNodes';
import PublishersPresets from './pages/publishing/PublishersPresets';
import NewPublisherNodeForm from './pages/publishing/NewPublisherNodeForm';
import NewPublisherPresetForm from './pages/publishing/NewPublisherPresetForm';
import EditPublisherPresetForm from './pages/publishing/EditPublisherPresetForm';
import Attributes from './pages/intelligence/Attributes';
import AttributeDetail from './pages/intelligence/AttributeDetail';
import ReportTypesList from './pages/intelligence/ReportTypesList';
import EditReportItemType from './pages/intelligence/EditReportItemType';
import WordLists from './pages/intelligence/WordLists';
import EditWordList from './pages/intelligence/EditWordList';
import RemoteNodesList from './pages/intelligence/RemoteNodesList';
import RemoteNodeForm from './pages/intelligence/RemoteNodeForm';
import RemoteAccessList from './pages/intelligence/RemoteAccessList';
import RemoteAccessForm from './pages/intelligence/RemoteAccessForm';
import BotsNodesList from './pages/intelligence/BotsNodesList';
import BotNodeForm from './pages/intelligence/BotNodeForm';
import BotsPresetsList from './pages/intelligence/BotsPresetsList';
import BotPresetForm from './pages/intelligence/BotPresetForm';
import IntelligenceDashboardContent from './pages/intelligence/IntelligenceDashboardContent';
import UsersPage from './pages/access-control/UsersPage';
import EditUserPage from './pages/access-control/EditUserPage';
import NewUserPage from './pages/access-control/NewUserPage';
import OrganizationsPage from './pages/access-control/OrganizationsPage';
import NewOrganizationPage from './pages/access-control/NewOrganizationPage';
import EditOrganizationPage from './pages/access-control/EditOrganizationPage';
import RolesPage from './pages/access-control/RolesPage';
import NewRolePage from './pages/access-control/NewRolePage';
import EditRolePage from './pages/access-control/EditRolePage';
import AclPage from './pages/access-control/AclPage';
import NewAclPage from './pages/access-control/NewAclPage';
import EditAclPage from './pages/access-control/EditAclPage';
import CTIPage from './pages/CTIPage';
import ASMPage from './pages/ASMPage';
import ReportItemsPage from './pages/intelligence/ReportItemsPage';
import EditReportItemPage from './pages/intelligence/EditReportItemPage';
import PublishPage from './pages/intelligence/PublishPage';
import AssessPage from './pages/intelligence/AssessPage';
import NewProductTypeForm from './pages/data-presentation/NewProductTypeForm';
import NewReportItemTypeForm from './pages/intelligence/NewReportItemTypeForm';
import ProductTypeEditPage from './pages/intelligence/ProductTypeEditPage';
import ProductTypeNewPage from './pages/intelligence/ProductTypeNewPage';
import { TemplatePreviewPage } from './pages/intelligence';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <DashboardVI />
      },
      {
        path: 'vi',
        element: <DashboardVI />
      },
      {
        path: 'vi/vulnerabilities',
        element: <VulnerabilityList />
      },
      {
        path: 'vi/vulnerabilities/:id',
        element: <CVEDetails />
      },
      {
        path: 'vi/critical',
        element: <VulnerabilityList filterType="critical" />
      },
      {
        path: 'vi/high-risk',
        element: <VulnerabilityList filterType="high-risk" />
      },
      {
        path: 'vi/with-exploit',
        element: <VulnerabilityList filterType="with-exploit" />
      },
      {
        path: 'vi/recent',
        element: <VulnerabilityList filterType="recent" />
      },
      {
        path: 'cti',
        element: <CTIPage />
      },
      {
        path: 'asm',
        element: <ASMPage />
      },
      {
        path: 'intelligence',
        element: <IntelligenceCenter />,
        children: [
          {
            index: true,
            element: <IntelligenceDashboardContent />
          },
          {
            path: 'collectors',
            element: <CollectorsNodes />
          },
          {
            path: 'collectors/new',
            element: <NewCollectorForm />
          },
          {
            path: 'collectors/:id/edit',
            element: <EditCollectorForm />
          },
          {
            path: 'collectors/:id/sources/add',
            element: <AddCollectorSourceForm />
          },
          {
            path: 'osint',
            element: <OSINTSources />
          },
          {
            path: 'osint/new',
            element: <NewOSINTSourceForm />
          },
          {
            path: 'osint/:id',
            element: <OSINTSourceDetail />
          },
          {
            path: 'osint/:id/edit',
            element: <EditOSINTSourceForm />
          },
          {
            path: 'source-groups',
            element: <OSINTSourceGroups />
          },
          {
            path: 'source-groups/new',
            element: <OSINTSourceGroupForm />
          },
          {
            path: 'source-groups/:id',
            element: <OSINTSourceGroupForm />
          },
          {
            path: 'source-groups/:id/edit',
            element: <OSINTSourceGroupForm />
          },
          {
            path: 'attributes',
            element: <Attributes />
          },
          {
            path: 'attributes/new',
            element: <AttributeDetail />
          },
          {
            path: 'attributes/:id',
            element: <AttributeDetail />
          },
          {
            path: 'report-types',
            element: <ReportTypesList />
          },
          {
            path: 'report-types/new',
            element: <NewReportItemTypeForm />
          },
          {
            path: 'report-types/:id',
            element: <EditReportItemType />
          },
          {
            path: 'word-lists',
            element: <WordLists />
          },
          {
            path: 'word-lists/:id',
            element: <EditWordList />
          },
          {
            path: 'remote-nodes',
            element: <RemoteNodesList />
          },
          {
            path: 'remote-nodes/new',
            element: <RemoteNodeForm />
          },
          {
            path: 'remote-nodes/:id',
            element: <RemoteNodeForm />
          },
          {
            path: 'remote-accesses',
            element: <RemoteAccessList />
          },
          {
            path: 'remote-accesses/new',
            element: <RemoteAccessForm />
          },
          {
            path: 'remote-accesses/:id',
            element: <RemoteAccessForm />
          },
          {
            path: 'bots-nodes',
            element: <BotsNodesList />
          },
          {
            path: 'bots-nodes/new',
            element: <BotNodeForm />
          },
          {
            path: 'bots-nodes/:id',
            element: <BotNodeForm />
          },
          {
            path: 'bots-presets',
            element: <BotsPresetsList />
          },
          {
            path: 'bots-presets/new',
            element: <BotPresetForm />
          },
          {
            path: 'bots-presets/:id',
            element: <BotPresetForm />
          },
          {
            path: 'analyze/report-items',
            element: <ReportItemsPage />
          },
          {
            path: 'analyze/report-items/new',
            element: <EditReportItemPage />
          },
          {
            path: 'analyze/report-items/:id',
            element: <EditReportItemPage />
          },
          {
            path: 'publish',
            element: <PublishPage />
          },
          {
            path: 'publish/product-types/new',
            element: <ProductTypeNewPage />
          },
          {
            path: 'publish/product-types/:id',
            element: <ProductTypeEditPage />
          },
          {
            path: 'template-preview',
            element: <TemplatePreviewPage />
          }
        ]
      },
      {
        path: 'data-presentation',
        children: [
          {
            path: 'presenters-nodes',
            element: <PresentersNodes />
          },
          {
            path: 'product-types',
            element: <ProductTypes />
          },
          {
            path: 'product-types/new',
            element: <NewProductTypeForm />
          },
          {
            path: 'product-types/:id',
            element: <ProductTypeDetail />
          }
        ]
      },
      {
        path: 'publishing',
        children: [
          {
            path: 'publishers-nodes',
            element: <PublishersNodes />
          },
          {
            path: 'publishers-nodes/new',
            element: <NewPublisherNodeForm />
          },
          {
            path: 'publishers-presets',
            element: <PublishersPresets />
          },
          {
            path: 'publishers-presets/new',
            element: <NewPublisherPresetForm />
          },
          {
            path: 'publishers-presets/:id',
            element: <EditPublisherPresetForm />
          }
        ]
      },
      {
        path: 'access-control',
        children: [
          {
            path: 'users',
            element: <UsersPage />
          },
          {
            path: 'users/new',
            element: <NewUserPage />
          },
          {
            path: 'users/:id',
            element: <EditUserPage />
          },
          {
            path: 'organizations',
            element: <OrganizationsPage />
          },
          {
            path: 'organizations/new',
            element: <NewOrganizationPage />
          },
          {
            path: 'organizations/:id',
            element: <EditOrganizationPage />
          },
          {
            path: 'roles',
            element: <RolesPage />
          },
          {
            path: 'roles/new',
            element: <NewRolePage />
          },
          {
            path: 'roles/:id',
            element: <EditRolePage />
          },
          {
            path: 'acls',
            element: <AclPage />
          },
          {
            path: 'acls/new',
            element: <NewAclPage />
          },
          {
            path: 'acls/:id',
            element: <EditAclPage />
          }
        ]
      },
      {
        path: '*/*',
        element: <NotFound />
      }
    ]
  }
]);

export default router; 