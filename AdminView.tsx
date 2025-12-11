import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
// تم حذف استيراد lucide-react غير المستخدم لإزالة الأخطاء
import type { StudentResult, Servant, CourseResult, Evaluation } from './types';
import type { CertificateTexts, CustomStyles } from './App';
import { AIChatView } from './AIChatView';
import SettingsView from './SettingsView';
import DataManagementView from './DataManagementView';
import CourseResultsDataView from './CourseResultsDataView';
import ExcelImportEvaluationsView from './ExcelImportEvaluationsView';
import GeneralSettingsView from './GeneralSettingsView';
import UsageStatsView from './UsageStatsView';

// --- SVG Icons (Local Definitions) ---
const HamburgerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const DocumentTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const GraduationCapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v6m-4-3v3m8-3v3" /></svg>;
const ClipboardCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6.343 17.657l-2.828 2.828m14.142-14.142l2.828 2.828m-12.728 0l2.828-2.828m0 0l2.828 2.828M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const PaletteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;

interface AdminViewProps {
    onLogout: () => void;
    certificateTexts: CertificateTexts;
    setCertificateTexts: React.Dispatch<React.SetStateAction<CertificateTexts>>;
    setTheme: (theme: string) => void;
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    customStyles: CustomStyles;
    setCustomStyles: React.Dispatch<React.SetStateAction<CustomStyles>>;
    setBackgroundUrl: (url: string) => void;
    backgroundUrl: string;
    backgroundGallery: string[];
    setBackgroundGallery: React.Dispatch<React.SetStateAction<string[]>>;
}

const AdminView: React.FC<AdminViewProps> = ({ 
    onLogout, 
    certificateTexts, 
    setCertificateTexts, 
    setTheme, 
    isDarkMode, 
    setIsDarkMode, 
    customStyles, 
    setCustomStyles, 
    setBackgroundUrl, 
    backgroundUrl, 
    backgroundGallery, 
    setBackgroundGallery 
}) => {
    const [courseRegistrations, setCourseRegistrations] = useState<StudentResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState<string>('');
    const [activeTab, setActiveTab] = useState('info');
    
    // Mobile sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            setIsLoading(true); setError('');
            try {
                const servantsSnapshot = await db.collection("servants").get();
                const resultsSnapshot = await db.collection("courseResults").get();
                
                const servantsMap = new Map<string, Servant>();
                servantsSnapshot.forEach(doc => { const servant = doc.data() as Servant; servant.code = doc.id; servantsMap.set(doc.id, servant); });
                
                const resultsByServant = new Map<string, CourseResult[]>();
                resultsSnapshot.forEach(doc => {
                    const result = doc.data() as CourseResult;
                    const servantCode = String(result.servantCode);
                    if (!resultsByServant.has(servantCode)) resultsByServant.set(servantCode, []);
                    resultsByServant.get(servantCode)!.push(result);
                });

                const registrationsList: StudentResult[] = [];
                resultsByServant.forEach((servantResults, servantCode) => {
                    const servant = servantsMap.get(servantCode);
                    if (servant) {
                        servantResults.forEach(result => {
                             registrationsList.push({ 
                                code: servant.code, 
                                name: servant.name || 'اسم غير متوفر', 
                                mobileNumber: servant.mobileNumber || 'غير متوفر', 
                                service: (Array.isArray(servant.allServices) && servant.allServices.length > 0) ? servant.allServices.join(' / ') : servant.primaryService || 'خدمة غير محددة', 
                                courseName: result.courseName || 'كورس غير مسمى', 
                                score: result.score ?? 'غائب', 
                                attendance: result.attendance || 0, 
                            }); 
                        });
                    }
                });
                setCourseRegistrations(registrationsList);
            } catch (err: any) { 
                console.error("Error fetching students:", err); 
                setError('حدث خطأ أثناء جلب البيانات.');
            } finally { setIsLoading(false); }
        };
        fetchStudents();
    }, []);

    const tabs = [
        { id: 'info', name: 'المعلومات والإحصائيات', icon: <ChartBarIcon /> },
        { id: 'ai_chat', name: 'المساعد الذكي', icon: <SparklesIcon /> },
        { id: 'servants_data', name: 'إدارة الخدام', icon: <UsersIcon /> },
        { id: 'courses_data', name: 'إدارة نتائج الكورسات', icon: <GraduationCapIcon /> },
        { id: 'evaluations_data', name: 'إدارة التقييمات', icon: <ClipboardCheckIcon /> },
        { id: 'usage_stats', name: 'إحصائيات الاستخدام', icon: <TrendingUpIcon /> },
        { id: 'texts_settings', name: 'إعدادات نصوص الشهادة', icon: <DocumentTextIcon /> },
        { id: 'general_settings', name: 'الإعدادات العامة والمظهر', icon: <PaletteIcon /> },
    ];

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
        }
        switch (activeTab) {
            case 'info': return (
                <CourseResultsDataView /> 
            );
            case 'ai_chat': return <AIChatView students={courseRegistrations} />;
            case 'servants_data': return <DataManagementView />;
            case 'courses_data': return <CourseResultsDataView />;
            case 'evaluations_data': return <ExcelImportEvaluationsView />;
            case 'texts_settings': return <SettingsView certificateTexts={certificateTexts} setCertificateTexts={setCertificateTexts} />;
            case 'general_settings': return <GeneralSettingsView setTheme={setTheme} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} customStyles={customStyles} setCustomStyles={setCustomStyles} setBackgroundUrl={setBackgroundUrl} backgroundUrl={backgroundUrl} backgroundGallery={backgroundGallery} setBackgroundGallery={setBackgroundGallery} />;
            case 'usage_stats': return <UsageStatsView />;
            default: return null;
        }
    };
    
    return (
        <div className="w-full max-w-7xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl border border-black/5 dark:border-white/5 animate-fade-in-up mt-[-2rem] mb-8">
            <div className="flex flex-col lg:flex-row min-h-[80vh]">
                {/* --- Mobile Sidebar Toggle --- */}
                <div className="lg:hidden p-4 flex justify-between items-center border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">لوحة التحكم</h2>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800">
                        {isSidebarOpen ? <CloseIcon /> : <HamburgerIcon />}
                    </button>
                </div>

                {/* --- Sidebar --- */}
                <aside className={`flex-shrink-0 w-full lg:w-64 bg-white dark:bg-slate-800/50 border-r border-gray-200 dark:border-slate-700/50 rounded-r-2xl lg:rounded-r-none lg:rounded-l-2xl transition-all duration-300 ${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
                     <div className="p-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">لوحة التحكم</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">كنيسة القديس بولس</p>
                    </div>
                    <nav className="flex flex-col p-4">
                        {tabs.map(tab => (
                             <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50'}`}>
                                {tab.icon}
                                <span>{tab.name}</span>
                            </button>
                        ))}
                        <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 mt-4 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50">
                            <LogoutIcon />
                            <span>تسجيل الخروج</span>
                        </button>
                    </nav>
                </aside>
                
                {/* --- Main Content --- */}
                <main className="flex-grow p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminView;