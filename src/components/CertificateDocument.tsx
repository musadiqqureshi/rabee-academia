import { Atom, Award } from "lucide-react";

interface Props {
  studentName: string;
  studentCode: string;
  subjectName: string;
  level?: string | null;
  date: string;
  type?: string;
}

export default function CertificateDocument({
  studentName, studentCode, subjectName, level, date, type = "Certificate of Completion",
}: Props) {
  return (
    <div className="bg-white text-gray-900 mx-auto max-w-3xl print:shadow-none">
      <div className="relative border-[6px] border-blue-600 rounded-2xl p-10 text-center overflow-hidden">
        <div className="absolute inset-3 border border-amber-400/60 rounded-xl pointer-events-none" />

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white grid place-items-center"><Atom className="w-6 h-6" /></div>
          <div className="text-left">
            <p className="font-bold text-lg leading-tight">Rabee Academia</p>
            <p className="text-[11px] text-gray-500">Premier Online Academy</p>
          </div>
        </div>

        <p className="uppercase tracking-[0.3em] text-xs text-amber-600 font-semibold">{type}</p>
        <p className="text-gray-500 mt-6 text-sm">This is proudly presented to</p>
        <h1 className="text-3xl font-extrabold text-blue-700 mt-2">{studentName}</h1>
        <p className="text-gray-500 text-xs mt-1">Student ID: {studentCode}</p>

        <p className="text-gray-700 mt-6 max-w-xl mx-auto leading-relaxed">
          for successfully completing the course
          <span className="font-semibold text-gray-900"> {subjectName}</span>
          {level ? <span> ({level})</span> : null} at Rabee Academia.
        </p>

        <div className="flex items-center justify-between mt-12 px-6">
          <div className="text-center">
            <div className="w-40 border-t border-gray-400 mx-auto" />
            <p className="text-xs text-gray-500 mt-1">Date · {date}</p>
          </div>
          <Award className="w-14 h-14 text-amber-500" strokeWidth={1.2} />
          <div className="text-center">
            <div className="w-40 border-t border-gray-400 mx-auto" />
            <p className="text-xs text-gray-500 mt-1">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
