import jsPDF from 'jspdf';
import { TailoredResumeData, TailoredCoverLetterData } from '../types';

export function exportResumeToPdf(resume: TailoredResumeData, fileName?: string) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin + 10;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 20;
    }
  };

  // Header - Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(153, 27, 27); // Warm Crimson / Red #991B1B
  doc.text((resume.fullName || 'Candidate Name').toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 18;

  // Headline
  if (resume.headline) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10.5);
    doc.setTextColor(75, 85, 99);
    doc.text(resume.headline, pageWidth / 2, y, { align: 'center' });
    y += 16;
  }

  // Contact line
  const contactParts = [
    resume.location,
    resume.phone,
    resume.email,
    resume.linkedin,
    resume.portfolio,
  ].filter(Boolean);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(55, 65, 81);
  doc.text(contactParts.join('  •  '), pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Red Divider rule
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  // Section Header Helper
  const drawSectionHeader = (title: string) => {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(153, 27, 27);
    doc.text(title, margin, y);
    y += 4;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;
  };

  // Summary
  if (resume.summary) {
    drawSectionHeader('PROFESSIONAL SUMMARY');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55);
    const summaryLines = doc.splitTextToSize(resume.summary, contentWidth);
    checkPageBreak(summaryLines.length * 12 + 10);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 12 + 10;
  }

  // Core Competencies
  if (resume.coreCompetencies && resume.coreCompetencies.length > 0) {
    drawSectionHeader('CORE COMPETENCIES & ATS KEYWORDS');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    const compText = resume.coreCompetencies.join('  •  ');
    const compLines = doc.splitTextToSize(compText, contentWidth);
    checkPageBreak(compLines.length * 12 + 10);
    doc.text(compLines, margin, y);
    y += compLines.length * 12 + 10;
  }

  // Work Experience
  if (resume.experience && resume.experience.length > 0) {
    drawSectionHeader('PROFESSIONAL EXPERIENCE');

    resume.experience.forEach((exp) => {
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text(exp.role, margin, y);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(153, 27, 27);
      const roleWidth = doc.getTextWidth(exp.role);
      doc.text(`  |  ${exp.company}`, margin + roleWidth, y);

      // Period & Location right-aligned
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(107, 114, 128);
      const rightText = `${exp.period}${exp.location ? ` • ${exp.location}` : ''}`;
      doc.text(rightText, pageWidth - margin, y, { align: 'right' });
      y += 14;

      // Accomplishments
      exp.accomplishments.forEach((bullet) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);

        const bulletIndent = margin + 12;
        const bulletWidth = contentWidth - 14;
        const lines = doc.splitTextToSize(bullet, bulletWidth);
        checkPageBreak(lines.length * 11 + 6);

        // Bullet point dot
        doc.setFillColor(220, 38, 38);
        doc.circle(margin + 4, y - 3, 1.8, 'F');

        doc.text(lines, bulletIndent, y);
        y += lines.length * 11 + 4;
      });
      y += 6;
    });
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    drawSectionHeader('EDUCATION');
    resume.education.forEach((edu) => {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(17, 24, 39);
      doc.text(edu.degree, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(` — ${edu.school} (${edu.year})`, margin + doc.getTextWidth(edu.degree), y);
      y += 12;

      if (edu.details) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(107, 114, 128);
        doc.text(edu.details, margin + 8, y);
        y += 12;
      }
    });
    y += 6;
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    drawSectionHeader('CERTIFICATIONS');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    resume.certifications.forEach((cert) => {
      checkPageBreak(14);
      doc.setFillColor(220, 38, 38);
      doc.circle(margin + 4, y - 3, 1.8, 'F');
      doc.text(cert, margin + 12, y);
      y += 13;
    });
    y += 6;
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    drawSectionHeader('NOTABLE PROJECTS');
    resume.projects.forEach((proj) => {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(17, 24, 39);
      doc.text(proj.name, margin, y);

      if (proj.techStack && proj.techStack.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(107, 114, 128);
        doc.text(` (${proj.techStack.join(', ')})`, margin + doc.getTextWidth(proj.name), y);
      }
      y += 12;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);
      const projLines = doc.splitTextToSize(proj.description, contentWidth - 10);
      doc.text(projLines, margin + 8, y);
      y += projLines.length * 11 + 6;
    });
  }

  const outName = fileName || `${(resume.fullName || 'Candidate').replace(/\s+/g, '_')}_Tailored_Resume.pdf`;
  doc.save(outName);
}

export function exportCoverLetterToPdf(letter: TailoredCoverLetterData, fileName?: string) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let y = margin + 10;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 20;
    }
  };

  // Header Candidate Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(153, 27, 27);
  doc.text(letter.candidateName || 'Candidate Name', margin, y);
  y += 16;

  // Contact
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text(letter.candidateContact || '', margin, y);
  y += 12;

  // Red accent divider
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(55, 65, 81);
  doc.text(letter.date || new Date().toLocaleDateString(), margin, y);
  y += 20;

  // Recipient details
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(letter.hiringManager || 'Hiring Team', margin, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.text(letter.companyName || '', margin, y);
  y += 14;

  if (letter.companyAddress) {
    doc.setTextColor(107, 114, 128);
    doc.text(letter.companyAddress, margin, y);
    y += 14;
  }
  y += 10;

  // Salutation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text(letter.salutation || 'Dear Hiring Team,', margin, y);
  y += 18;

  // Opening
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(31, 41, 55);
  const openLines = doc.splitTextToSize(letter.openingParagraph || '', contentWidth);
  checkPageBreak(openLines.length * 13 + 12);
  doc.text(openLines, margin, y);
  y += openLines.length * 13 + 12;

  // Body Paragraphs
  if (letter.bodyParagraphs) {
    letter.bodyParagraphs.forEach((para) => {
      const bodyLines = doc.splitTextToSize(para, contentWidth);
      checkPageBreak(bodyLines.length * 13 + 12);
      doc.text(bodyLines, margin, y);
      y += bodyLines.length * 13 + 12;
    });
  }

  // Closing
  const closeLines = doc.splitTextToSize(letter.closingParagraph || '', contentWidth);
  checkPageBreak(closeLines.length * 13 + 30);
  doc.text(closeLines, margin, y);
  y += closeLines.length * 13 + 16;

  // Signoff
  doc.text(letter.signOff || 'Sincerely,', margin, y);
  y += 24;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text(letter.candidateName || 'Candidate Name', margin, y);

  const outName = fileName || `${(letter.candidateName || 'Candidate').replace(/\s+/g, '_')}_Tailored_Cover_Letter.pdf`;
  doc.save(outName);
}
