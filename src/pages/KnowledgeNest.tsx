
import React from 'react';
import AppLayout from '@/components/AppLayout';
import KnowledgeNest from '@/components/knowledgenest/KnowledgeNest';

const KnowledgeNestPage = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <KnowledgeNest />
      </div>
    </AppLayout>
  );
};

export default KnowledgeNestPage;
