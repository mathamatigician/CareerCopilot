import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import { TailoredResumeData, TailoredCoverLetterData } from '../src/types';

export async function generateResumeDocx(resume: TailoredResumeData): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Candidate Name Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: (resume.fullName || 'Candidate Name').toUpperCase(),
          bold: true,
          size: 32, // 16pt
          color: '991B1B', // Warm Crimson / Red accent
          font: 'Arial',
        }),
      ],
    })
  );

  // Professional Headline
  if (resume.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: resume.headline,
            italics: true,
            size: 22, // 11pt
            color: '4B5563',
            font: 'Arial',
          }),
        ],
      })
    );
  }

  // Contact Info Line
  const contactParts = [
    resume.location,
    resume.phone,
    resume.email,
    resume.linkedin,
    resume.portfolio,
  ].filter(Boolean);

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      border: {
        bottom: {
          color: 'DC2626',
          space: 4,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
      children: [
        new TextRun({
          text: contactParts.join('  •  '),
          size: 18, // 9pt
          color: '374151',
          font: 'Arial',
        }),
      ],
    })
  );

  // Section: Professional Summary
  if (resume.summary) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 100 },
        children: [
          new TextRun({
            text: 'PROFESSIONAL SUMMARY',
            bold: true,
            size: 24,
            color: '991B1B',
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: resume.summary,
            size: 20,
            color: '1F2937',
            font: 'Arial',
          }),
        ],
      })
    );
  }

  // Section: Core Competencies & Keywords
  if (resume.coreCompetencies && resume.coreCompetencies.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 100 },
        children: [
          new TextRun({
            text: 'CORE COMPETENCIES & TECHNICAL SKILLS',
            bold: true,
            size: 24,
            color: '991B1B',
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: resume.coreCompetencies.join('  |  '),
            size: 19,
            color: '1F2937',
            font: 'Arial',
            bold: true,
          }),
        ],
      })
    );
  }

  // Section: Professional Experience
  if (resume.experience && resume.experience.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [
          new TextRun({
            text: 'PROFESSIONAL EXPERIENCE',
            bold: true,
            size: 24,
            color: '991B1B',
            font: 'Arial',
          }),
        ],
      })
    );

    resume.experience.forEach((exp) => {
      // Role & Company Row
      children.push(
        new Paragraph({
          spacing: { before: 140, after: 40 },
          children: [
            new TextRun({
              text: exp.role,
              bold: true,
              size: 22,
              color: '111827',
              font: 'Arial',
            }),
            new TextRun({
              text: `  |  ${exp.company}`,
              bold: true,
              size: 22,
              color: '991B1B',
              font: 'Arial',
            }),
            new TextRun({
              text: `  (${exp.period}${exp.location ? ` - ${exp.location}` : ''})`,
              italics: true,
              size: 19,
              color: '6B7280',
              font: 'Arial',
            }),
          ],
        })
      );

      // Bullet points
      exp.accomplishments.forEach((bullet) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({
                text: bullet,
                size: 20,
                color: '1F2937',
                font: 'Arial',
              }),
            ],
          })
        );
      });
    });
  }

  // Section: Education
  if (resume.education && resume.education.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: 'EDUCATION & CREDENTIALS',
            bold: true,
            size: 24,
            color: '991B1B',
            font: 'Arial',
          }),
        ],
      })
    );

    resume.education.forEach((edu) => {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 21,
              color: '111827',
              font: 'Arial',
            }),
            new TextRun({
              text: ` - ${edu.school} (${edu.year})`,
              size: 20,
              color: '374151',
              font: 'Arial',
            }),
            ...(edu.details
              ? [
                  new TextRun({
                    text: `\n${edu.details}`,
                    italics: true,
                    size: 18,
                    color: '6B7280',
                    font: 'Arial',
                  }),
                ]
              : []),
          ],
        })
      );
    });
  }

  // Section: Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 80 },
        children: [
          new TextRun({
            text: 'CERTIFICATIONS',
            bold: true,
            size: 24,
            color: '991B1B',
            font: 'Arial',
          }),
        ],
      })
    );

    resume.certifications.forEach((cert) => {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 30, after: 30 },
          children: [
            new TextRun({
              text: cert,
              size: 20,
              color: '1F2937',
              font: 'Arial',
            }),
          ],
        })
      );
    });
  }

  // Section: Projects
  if (resume.projects && resume.projects.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 80 },
        children: [
          new TextRun({
            text: 'NOTABLE PROJECTS',
            bold: true,
            size: 24,
            color: '991B1B',
            font: 'Arial',
          }),
        ],
      })
    );

    resume.projects.forEach((proj) => {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 30 },
          children: [
            new TextRun({
              text: proj.name,
              bold: true,
              size: 21,
              color: '111827',
              font: 'Arial',
            }),
            new TextRun({
              text: ` (${proj.techStack.join(', ')})`,
              italics: true,
              size: 18,
              color: '6B7280',
              font: 'Arial',
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: proj.description,
              size: 20,
              color: '374151',
              font: 'Arial',
            }),
          ],
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 in
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

export async function generateCoverLetterDocx(letter: TailoredCoverLetterData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Header Candidate Name
  children.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: letter.candidateName,
          bold: true,
          size: 28,
          color: '991B1B',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240 },
      border: {
        bottom: {
          color: 'DC2626',
          space: 4,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
      children: [
        new TextRun({
          text: letter.candidateContact,
          size: 19,
          color: '4B5563',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 180, after: 180 },
      children: [
        new TextRun({
          text: letter.date,
          size: 21,
          color: '374151',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: letter.hiringManager,
          bold: true,
          size: 21,
          color: '111827',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: letter.companyName,
          size: 21,
          color: '374151',
          font: 'Arial',
        }),
      ],
    })
  );

  if (letter.companyAddress) {
    children.push(
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: letter.companyAddress,
            size: 21,
            color: '6B7280',
            font: 'Arial',
          }),
        ],
      })
    );
  }

  // Salutation
  children.push(
    new Paragraph({
      spacing: { before: 180, after: 180 },
      children: [
        new TextRun({
          text: letter.salutation,
          bold: true,
          size: 22,
          color: '111827',
          font: 'Arial',
        }),
      ],
    })
  );

  // Opening Paragraph
  children.push(
    new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: letter.openingParagraph,
          size: 21,
          color: '1F2937',
          font: 'Arial',
        }),
      ],
    })
  );

  // Body Paragraphs
  letter.bodyParagraphs.forEach((body) => {
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: body,
            size: 21,
            color: '1F2937',
            font: 'Arial',
          }),
        ],
      })
    );
  });

  // Closing Paragraph
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: letter.closingParagraph,
          size: 21,
          color: '1F2937',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: letter.signOff,
          size: 21,
          color: '1F2937',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: letter.candidateName,
          bold: true,
          size: 22,
          color: '991B1B',
          font: 'Arial',
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
