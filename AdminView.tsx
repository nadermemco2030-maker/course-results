import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileSpreadsheet, 
  Settings, 
  GraduationCap, 
  BarChart, 
  Database,
  Search,
  Plus,
  Filter,
  Download,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  MessageSquare,
  Bot
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy, limit, startAfter, where, getCountFromServer } from 'firebase/firestore';
import { db } from './firebaseConfig';
import CourseResultsDataView from './CourseResultsDataView';
import ExcelImportView from './ExcelImportView';
import ExcelImportEvaluationsView from './ExcelImportEvaluationsView';
import GeneralSettingsView from './GeneralSettingsView';
import UsageStatsView from './UsageStatsView';
import DataManagementView from './DataManagementView';
import CourseResultFormModal from './CourseResultFormModal';
import ConfirmationModal from './ConfirmationModal';
import type { StudentResult, Servant, CourseResult, Evaluation } from './types';
import type { CertificateTexts, CustomStyles } from './App';
// التصحيح هنا: إزالة الأقواس {} لأن التصدير هو default
import AIChatView from './AIChatView';
import DetailsModal from './DetailsModal';
import SettingsView from './SettingsView';

interface AdminViewProps {
  results: StudentResult[];
  servants: Servant[];
  courseResults: CourseResult[];
  evaluations: Evaluation[];
  onUpdateResults: (newResults: StudentResult[]) => void;
  onUpdateServants: (newServants: Servant[]) => void;
  onUpdateCourseResults: (newResults: CourseResult[]) => void;
  onUpdateEvaluations: (newEvaluations: Evaluation[]) => void;
  onUpdateCertificateTexts: (texts: CertificateTexts) => void;
  onUpdateCustomStyles: (styles: CustomStyles) => void;
  certificateTexts: CertificateTexts;
  customStyles: CustomStyles;
}

// ... (باقي الكود كما هو تماماً دون تغيير)

const AdminView: React.FC<AdminViewProps> = ({
  results,
  servants,
  courseResults,
  evaluations,
  onUpdateResults,
  onUpdateServants,
  onUpdateCourseResults,
  onUpdateEvaluations,
  onUpdateCertificateTexts,
  onUpdateCustomStyles,
  certificateTexts,
  customStyles
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'import' | 'import-eval' | 'settings' | 'stats' | 'data' | 'ai-chat'>('results');

  // ... (باقي الكود)

  const renderContent = () => {
    switch (activeTab) {
      case 'results':
        return (
          <CourseResultsDataView 
            courseResults={courseResults}
            servants={servants}
            onUpdateCourseResults={onUpdateCourseResults}
          />
        );
      case 'import':
        return (
          <ExcelImportView 
            onImport={(data) => {
              // Handle import logic
              console.log('Imported data:', data);
            }} 
          />
        );
      case 'import-eval':
        return (
          <ExcelImportEvaluationsView 
            onImport={(data) => {
               // Handle evaluation import logic
               console.log('Imported evaluations:', data);
            }}
          />
        );
      case 'settings':
        return (
          <SettingsView 
             certificateTexts={certificateTexts}
             onUpdateCertificateTexts={onUpdateCertificateTexts}
             customStyles={customStyles}
             onUpdateCustomStyles={onUpdateCustomStyles}
          />
        );
      case 'stats':
        return <UsageStatsView />;
      case 'data':
        return <DataManagementView />;
      case 'ai-chat':
        return <AIChatView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-white border-l border-gray-200 shadow-sm flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-indigo-800 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            لوحة التحكم
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('results')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'results' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Database className="w-5 h-5" />
            <span className="font-medium">بيانات النتائج</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'import' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="font-medium">استيراد النتائج</span>
          </button>

          <button
            onClick={() => setActiveTab('import-eval')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'import-eval' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium">استيراد التقييمات</span>
          </button>

          <div className="border-t border-gray-100 my-2 pt-2">
            <button
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === 'stats' 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart className="w-5 h-5" />
              <span className="font-medium">الإحصائيات</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-chat')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === 'ai-chat' 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bot className="w-5 h-5" />
              <span className="font-medium">المساعد الذكي</span>
            </button>
          </div>

          <div className="border-t border-gray-100 my-2 pt-2">
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === 'settings' 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">الإعدادات العامة</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === 'data' 
                  ? 'bg-red-50 text-red-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="font-medium">إدارة البيانات</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminView;