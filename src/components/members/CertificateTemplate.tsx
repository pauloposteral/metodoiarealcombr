import { forwardRef } from 'react';
import logoImage from '@/assets/logo-iareal.png';

interface CertificateTemplateProps {
  studentName: string;
  courseName: string;
  totalHours: number;
  completedAt: string;
  certificateCode: string;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ studentName, courseName, totalHours, completedAt, certificateCode }, ref) => {
    const formattedDate = new Date(completedAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    return (
      <div
        ref={ref}
        className="w-[1123px] h-[794px] bg-white relative overflow-hidden"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {/* Border frame */}
        <div className="absolute inset-4 border-2 border-[#1a1a2e]" />
        <div className="absolute inset-6 border border-[#c9a227]/40" />

        {/* Corner decorations */}
        <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[#c9a227]" />
        <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-[#c9a227]" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-[#c9a227]" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-[#c9a227]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-20 py-16">
          {/* Logo */}
          <div className="mb-6">
            <img src={logoImage} alt="Método IA Real" className="h-16 object-contain" />
          </div>

          {/* Title */}
          <h1 
            className="text-4xl font-bold text-[#1a1a2e] tracking-widest mb-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            CERTIFICADO
          </h1>
          <div className="w-32 h-0.5 bg-[#c9a227] mb-8" />

          {/* Subtitle */}
          <p className="text-lg text-[#4a4a4a] mb-8 tracking-wide">
            DE CONCLUSÃO DE CURSO
          </p>

          {/* Main text */}
          <p className="text-center text-[#3a3a3a] text-lg leading-relaxed max-w-3xl mb-6">
            Certificamos que
          </p>

          {/* Student name */}
          <h2 
            className="text-3xl font-bold text-[#1a1a2e] mb-2 tracking-wide"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {studentName.toUpperCase()}
          </h2>
          <div className="w-64 h-px bg-[#c9a227]/60 mb-6" />

          {/* Course description */}
          <p className="text-center text-[#3a3a3a] text-base leading-relaxed max-w-2xl mb-8">
            concluiu com êxito o curso <strong className="text-[#1a1a2e]">"{courseName}"</strong>, 
            um método estruturado de aprendizagem em Inteligência Artificial aplicada ao mundo real, 
            com carga horária de <strong className="text-[#1a1a2e]">{totalHours} horas</strong>.
          </p>

          {/* Date and code */}
          <div className="flex items-center gap-16 mt-4">
            <div className="text-center">
              <p className="text-sm text-[#6a6a6a] mb-1">Data de Conclusão</p>
              <p className="text-base font-semibold text-[#1a1a2e]">{formattedDate}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[#6a6a6a] mb-1">Código de Validação</p>
              <p className="text-base font-mono font-semibold text-[#1a1a2e]">{certificateCode}</p>
            </div>
          </div>

          {/* Validation URL */}
          <p className="absolute bottom-12 text-xs text-[#8a8a8a]">
            Validar em: metodoiareal.com.br/validar-certificado
          </p>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
