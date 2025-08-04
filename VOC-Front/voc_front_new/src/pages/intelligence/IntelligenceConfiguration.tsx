import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import IntelligenceNavbar from '../../components/intelligence/IntelligenceNavbar';
import IntelligenceSidebar from '../../components/intelligence/IntelligenceSidebar';
import { Settings, Users, Shield, Building, UserCheck } from 'lucide-react';

const IntelligenceConfiguration: React.FC = () => {
  return (
    <div className="intelligence-container">
      <IntelligenceSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IntelligenceNavbar />
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-400">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Intelligence Configuration</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure global settings for the intelligence platform
            </p>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="general" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="organizations" className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Organizations
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center">
                <UserCheck className="h-4 w-4 mr-2" />
                Roles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-dark-300">
              {/* Contenu de l'onglet General */}
            </TabsContent>

            <TabsContent value="users" className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-dark-300">
              {/* Contenu de l'onglet Users */}
            </TabsContent>

            <TabsContent value="security" className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-dark-300">
              {/* Contenu de l'onglet Security */}
            </TabsContent>

            <TabsContent value="organizations" className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-dark-300">
              {/* Contenu de l'onglet Organizations */}
            </TabsContent>

            <TabsContent value="roles" className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-dark-300">
              {/* Contenu de l'onglet Roles */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceConfiguration;
