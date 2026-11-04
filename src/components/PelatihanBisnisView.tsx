import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCheck,
  Download,
} from 'lucide-react';
import { TrainingModule, Language, UserProfile } from '../types';
import { translations } from '../translations';

interface PelatihanBisnisViewProps {
  language: Language;
  modules: TrainingModule[];
  user: UserProfile;
}

export const PelatihanBisnisView: React.FC<PelatihanBisnisViewProps> = ({
  language,
  modules,
  user,
}) => {
  const t = translations[language];
  const [selectedModule, setSelectedModule] = useState<TrainingModule>(modules[0]);
  const [activeQuizIndex, setActiveQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  const currentQuiz = selectedModule.quiz[activeQuizIndex];
  const totalLessons = modules.reduce((acc, m) => acc + m.lessonsCount, 0);
  const completedLessons = modules.reduce((acc, m) => acc + m.completedLessons, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerChecked(true);
    if (selectedOption === currentQuiz.correctIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (activeQuizIndex < selectedModule.quiz.length - 1) {
      setActiveQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setShowCertificate(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Academy Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
                {t.tabPelatihan}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Kurikulum inkubasi bisnis mikro syariah terintegrasi: dari fiqih muamalah hingga legalitas halal dan digital growth.
            </p>
          </div>

          {/* Overall Progress Widget */}
          <div className="bg-stone-50 dark:bg-stone-800/80 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 min-w-[220px]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-stone-600 dark:text-stone-300">Progres Belajar</span>
              <span className="font-black text-purple-600 dark:text-purple-400">{overallProgress}%</span>
            </div>
            <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-stone-500 mt-1 text-right">
              {completedLessons} dari {totalLessons} materi tuntas
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Modules List & Interactive Classroom / Quiz */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Modules List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-1">
            Daftar Modul Kurikulum
          </h3>

          {modules.map((mod) => {
            const isSelected = selectedModule.id === mod.id;
            const progress = Math.round((mod.completedLessons / mod.lessonsCount) * 100);
            return (
              <div
                key={mod.id}
                onClick={() => {
                  setSelectedModule(mod);
                  setActiveQuizIndex(0);
                  setSelectedOption(null);
                  setIsAnswerChecked(false);
                  setShowCertificate(false);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-500 shadow-sm ring-1 ring-purple-500'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-purple-300 dark:hover:border-purple-700 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    {mod.category}
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {mod.durationMinutes} Menit
                  </span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif leading-snug">
                  {mod.title}
                </h4>

                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Instruktur: {mod.instructor}
                </p>

                {/* Progress Mini Bar */}
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>{mod.completedLessons}/{mod.lessonsCount} Selesai</span>
                    <span className="font-bold text-stone-700 dark:text-stone-300">{progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Columns: Active Module Classroom & Interactive Quiz / Certificate */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-5">
            {/* Header info */}
            <div className="border-b border-stone-200 dark:border-stone-800 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Tingkat {selectedModule.level}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  Badge: <strong className="text-stone-800 dark:text-stone-200">{selectedModule.badge}</strong>
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 font-serif">
                {selectedModule.title}
              </h3>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {selectedModule.description}
              </p>
            </div>

            {/* Interactive Assessment / Quiz Component */}
            {!showCertificate && currentQuiz ? (
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-400">
                    <HelpCircle className="w-4 h-4" />
                    <span>Uji Pemahaman Fiqih & Praktik Bisnis</span>
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    Pertanyaan {activeQuizIndex + 1} dari {selectedModule.quiz.length}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                  {currentQuiz.question}
                </h4>

                {/* Options */}
                <div className="space-y-2">
                  {currentQuiz.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQuiz.correctIndex;

                    let optionClass = 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 hover:border-purple-400';
                    if (isAnswerChecked) {
                      if (isCorrect) {
                        optionClass = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                      } else if (isSelected && !isCorrect) {
                        optionClass = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200';
                      }
                    } else if (isSelected) {
                      optionClass = 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-1 ring-purple-500';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isAnswerChecked}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${optionClass}`}
                      >
                        <span>{option}</span>
                        {isAnswerChecked && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation feedback after checking */}
                {isAnswerChecked && (
                  <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                    <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Landasan Syariah & Penjelasan Pakar:
                    </span>
                    <p className="text-purple-800 dark:text-purple-200 text-[11px] leading-relaxed">
                      {currentQuiz.explanation}
                    </p>
                  </div>
                )}

                {/* Action button */}
                <div className="flex justify-end pt-2">
                  {!isAnswerChecked ? (
                    <button
                      type="button"
                      disabled={selectedOption === null}
                      onClick={handleCheckAnswer}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition"
                    >
                      Periksa Jawaban
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                    >
                      <span>
                        {activeQuizIndex < selectedModule.quiz.length - 1
                          ? 'Soal Selanjutnya'
                          : 'Selesaikan & Terbitkan Sertifikat'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : showCertificate ? (
              /* Verified Digital Certificate view */
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-stone-900 dark:to-emerald-950/40 border-2 border-amber-400 dark:border-amber-600/60 text-center space-y-4 shadow-lg relative">
                <div className="inline-flex p-3 rounded-full bg-amber-400 text-stone-950 shadow-md">
                  <Award className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold tracking-widest text-amber-700 dark:text-amber-400 uppercase">
                    GERAKAN RAKYAT ISLAMICITY KAFFAH (GRIK)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black font-serif text-stone-900 dark:text-stone-100">
                    SERTIFIKAT KELULUSAN INKUBASI BISNIS
                  </h3>
                  <p className="text-xs text-stone-500">Nomor Registrasi: GRIK-CERT-2026-0921-998</p>
                </div>

                <div className="max-w-md mx-auto py-2">
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    Diberikan secara terverifikasi kepada:
                  </p>
                  <h4 className="text-lg font-black text-emerald-800 dark:text-emerald-300 underline underline-offset-4 decoration-amber-400">
                    {user.name}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Telah menyelesaikan modul kurikulum: <strong>{selectedModule.title}</strong> dengan pemahaman fiqih muamalah dan praktik manajemen bisnis mikro kaffah.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Cetak / Unduh Sertifikat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCertificate(false);
                      setActiveQuizIndex(0);
                      setSelectedOption(null);
                      setIsAnswerChecked(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold text-xs"
                  >
                    Kembali ke Modul
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
