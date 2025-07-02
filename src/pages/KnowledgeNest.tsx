
import React from 'react';
import KnowledgeNestEnhanced from '@/components/knowledgenest/KnowledgeNestEnhanced';

const KnowledgeNestPage = () => {
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              KnowledgeNest
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Collaborative knowledge base and documentation platform
            </p>
          </div>
        </div>
        <KnowledgeNestEnhanced />
      </div>
    </div>
  );
};

export default KnowledgeNestPage;
