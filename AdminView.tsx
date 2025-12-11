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
// ✅ التصحيح الجوهري: استخدام الأقواس {} لأننا غيرنا التصدير في AIChatView
import { AIChatView } from './AIChatView';
import DetailsModal from './DetailsModal';
import SettingsView from './SettingsView';

interface AdminViewProps {
  onLogout: () => void;
  results?: StudentResult[];
  servants: Servant[];
  courseResults: CourseResult[];
  evaluations: Evaluation[];
  onUpdateResults?: (newResults: StudentResult[]) => void;
  onUpdateServants: (newServants: Servant[]) => void;
  onUpdateCourseResults: (newResults: CourseResult[]) => void;
  onUpdateEvaluations: (newEvaluations: Evaluation[]) => void;
  onUpdateCertificateTexts: (texts: CertificateTexts) => void;
  onUpdateCustomStyles: (styles: CustomStyles) => void;
  certificateTexts: CertificateTexts;
  setCertificateTexts: React.Dispatch<React.SetStateAction<CertificateTexts>>;
  customStyles: CustomStyles;
  setCustomStyles: React.Dispatch<React.SetStateAction<CustomStyles>>;
  setTheme: (theme: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  setBackgroundUrl: (url: string) => void;
  backgroundUrl: string;
  backgroundGallery: string[];
  setBackgroundGallery: React.Dispatch<React.SetStateAction<string[]>>;
}

const AdminView: React.FC<AdminViewProps> = ({
  onLogout,
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
  setCertificateTexts,
  customStyles,
  setCustomStyles,
  setTheme,
  isDarkMode,
  setIsDarkMode,
  setBackgroundUrl,
  backgroundUrl,
  backgroundGallery,
  setBackgroundGallery
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'import' | 'import-eval' | 'settings' | 'stats' | 'data' | 'ai-chat'>('results');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<CourseResult | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, 'courseResults', itemToDelete));
        // تحديث الحالة المحلية إذا لزم الأمر
        if (onUpdateCourseResults) {
            const updatedResults = courseResults.filter(r => r.id !== itemToDelete);
            onUpdateCourseResults(updatedResults);
        }
        setItemToDelete(null);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Error deleting document: ', error);
        alert('حدث خطأ أثناء حذف النتيجة');
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'results':
        return (
          <CourseResultsDataView 
            courseResults={courseResults}
            servants={servants}
            onUpdateCourseResults={onUpdateCourseResults || (() => {})}
          />
        );
      case 'import':
        return (
          <ExcelImportView 
            onImport={(data) => {
              console.log('Imported data:', data);
            }} 
          />
        );
      case 'import-eval':
        return (
          <ExcelImportEvaluationsView 
            onImport={(data) => {
               console.log('Imported evaluations:', data);
            }}
          />
        );
      case 'settings':
        return (
           <GeneralSettingsView 
              setTheme={setTheme}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              customStyles={customStyles}
              setCustomStyles={setCustomStyles}
              setBackgroundUrl={setBackgroundUrl}
              backgroundUrl={backgroundUrl}
              backgroundGallery={backgroundGallery}
              setBackgroundGallery={setBackgroundGallery}
           />
        );
      case 'stats':
        return <UsageStatsView />;
      case 'data':
        return <DataManagementView />;
      case 'ai-chat':
        // نمرر نتائج الطلاب للمساعد الذكي ليكون الرد مبنياً على البيانات
        // نقوم بتحويل CourseResult إلى الشكل المطلوب إذا لزم الأمر، أو نمرر البيانات الخام
        return <AIChatView students={results || []} />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-800'}`} dir="rtl">
      {/* Sidebar */}
      <div className={`w-64 border-l shadow-sm flex flex-col ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-800'}`}>
            <Settings className="w-6 h-6" />
            لوحة التحكم
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('results')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'results' 
                ? (isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-700 shadow-sm')
                : (isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50')
            }`}
          >
            <Database className="w-5 h-5" />
            <span className="font-medium">بيانات النتائج</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'import' 
                ? (isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-700 shadow-sm')
                : (isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50')
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="font-medium">استيراد النتائج</span>
          </button>

          <button
            onClick={() => setActiveTab('import-eval')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'import-eval' 
                ? (isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-700 shadow-sm')
                : (isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50')
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium">استيراد التقييمات</span>
          </button>

          <div className={`border-t my-2 pt-2 ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
            <button
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === 'stats' 
                  ? (isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-700 shadow-sm')
                  : (isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50')
              }`}
            >
              <BarChart className="w-5 h-5" />
              <span className="font-medium">الإحصائيات</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-chat')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === 'ai-chat' 
                  ? (isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-700 shadow-sm')
                  : (isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50')
              }`}
            >
              <Bot className="w-5 h-5" />
              <span className="font-medium">المساعد الذكي</span>
            </button>
          </div>

          <div className={`border-t my-2 pt-2 ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === 'settings' 
                  ? (isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-50 text-indigo-700 shadow-sm')
                  : (isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50')
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">الإعدادات العامة</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === 'data' 
                  ? (isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700 shadow-sm')
                  : (isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-50')
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="font-medium">إدارة البيانات</span>
            </button>
          </div>

          <div className={`mt-auto pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
             <button 
               onClick={onLogout} 
               className="w-full text-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
             >
               تسجيل الخروج
             </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-auto p-8 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <CourseResultFormModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={async (data) => {
            setShowAddModal(false);
          }}
          initialData={undefined}
          servants={servants}
        />
      )}

      {selectedResult && (
        <CourseResultFormModal
          isOpen={true}
          onClose={() => setSelectedResult(null)}
          onSubmit={async (data) => {
            setSelectedResult(null);
          }}
          initialData={selectedResult}
          servants={servants}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذه النتيجة؟ لا يمكن التراجع عن هذا الإجراء."
      />
    </div>
  );
};

export default AdminView;