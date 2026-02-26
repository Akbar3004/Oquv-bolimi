import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, AlignmentType, BorderStyle, PageOrientation, VerticalAlign,
    HeadingLevel, TabStopPosition, TabStopType, ShadingType
} from 'docx';
import { saveAs } from 'file-saver';

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

const FONT = 'Times New Roman';
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
const allBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function txt(text, options = {}) {
    return new TextRun({
        text,
        font: FONT,
        size: options.size || 22, // 11pt = 22 half-points
        bold: options.bold || false,
        underline: options.underline ? {} : undefined,
        italics: options.italics || false,
    });
}

function para(texts, options = {}) {
    const runs = Array.isArray(texts) ? texts : [txt(texts, options)];
    return new Paragraph({
        children: runs,
        alignment: options.alignment || AlignmentType.LEFT,
        spacing: { after: options.spacingAfter ?? 40, before: options.spacingBefore ?? 0 },
    });
}

// Titil sahifasi
function buildTitlePageContent(plan) {
    const tp = plan.titlePage || {};
    const k = tp.kelishildi || {};
    const t = tp.tasdiqlayman || {};
    const c = tp.centerOrg || {};
    const maslaxatchilar = tp.maslaxatchilar || [];
    const year = plan.year || 2025;
    const children = [];

    // KELISHILDI va TASDIQLAYMAN — jadval bilan yonma-yon joylash
    const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders,
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 45, type: WidthType.PERCENTAGE },
                        borders: noBorders,
                        children: [
                            para([txt('KELISHILDI :', { bold: true })]),
                            para(k.orgLine1 || ''),
                            para(k.orgLine2 || ''),
                            para(`${k.name || '___'} _______________`),
                            para(`" _______ " _____________ ${year}y`),
                        ],
                    }),
                    new TableCell({
                        width: { size: 10, type: WidthType.PERCENTAGE },
                        borders: noBorders,
                        children: [para('')],
                    }),
                    new TableCell({
                        width: { size: 45, type: WidthType.PERCENTAGE },
                        borders: noBorders,
                        children: [
                            para([txt('TASDIQLAYMAN:', { bold: true })], { alignment: AlignmentType.RIGHT }),
                            para(t.orgLine1 || '', { alignment: AlignmentType.RIGHT }),
                            para(t.orgLine2 || '', { alignment: AlignmentType.RIGHT }),
                            para(t.orgLine3 || '', { alignment: AlignmentType.RIGHT }),
                            para([txt(t.name || '___', { underline: true })], { alignment: AlignmentType.RIGHT }),
                            para(`" _______ " _____________ ${year}y`, { alignment: AlignmentType.RIGHT }),
                        ],
                    }),
                ],
            }),
        ],
    });
    children.push(headerTable);

    // Bo'sh joy
    children.push(para('', { spacingAfter: 200 }));

    // Markaziy tashkilot
    children.push(para(c.line1 || '', { alignment: AlignmentType.CENTER }));
    children.push(para([txt(c.line2 || '', { underline: true })], { alignment: AlignmentType.CENTER, spacingAfter: 200 }));

    // Sarlavha
    children.push(para([txt(`${year} yil uchun tuzilgan choraklarga bo'lingan`, { bold: true })], { alignment: AlignmentType.CENTER }));
    children.push(para([txt("Yillik texnik o'quv mashg'ulotlar mavzulari rejasi", { bold: true })], { alignment: AlignmentType.CENTER, spacingAfter: 200 }));

    // Yo'nalish va Sexlar
    children.push(para([txt(`Yo'nalish: ${plan.direction || ''}`, { bold: true })], { alignment: AlignmentType.CENTER }));
    const sexText = plan.workshops && plan.workshops.length > 0
        ? `Sex № ${plan.workshops.join(', №')}.`
        : 'Sex №';
    children.push(para([txt(sexText, { bold: true })], { alignment: AlignmentType.CENTER, spacingAfter: 200 }));

    // Maslaxatchilar
    children.push(para([txt('Maslaxatchilar:', { bold: true })], { spacingAfter: 100 }));

    maslaxatchilar.forEach(m => {
        const titleLines = (m.title || '').split('\n');
        // Jadval — lavozim chap, ism o'ng
        const consultantRow = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorders,
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            width: { size: 55, type: WidthType.PERCENTAGE },
                            borders: noBorders,
                            children: titleLines.map(line => para(line, { spacingAfter: 0 })),
                        }),
                        new TableCell({
                            width: { size: 45, type: WidthType.PERCENTAGE },
                            borders: noBorders,
                            verticalAlign: VerticalAlign.BOTTOM,
                            children: [
                                para(`${m.name || '_______________'}    _______________`, { alignment: AlignmentType.RIGHT }),
                            ],
                        }),
                    ],
                }),
            ],
        });
        children.push(consultantRow);
        children.push(para('', { spacingAfter: 60 }));
    });

    // Pastdi tashkilot nomi
    children.push(para('', { spacingAfter: 200 }));
    const orgName = (c.line2 || '').replace(/"/g, '').replace(/\./g, '');
    children.push(para([txt(`\u201E${orgName}\u201C`, { italics: true })], { alignment: AlignmentType.CENTER }));

    return children;
}

// Darslar jadvali
function buildLessonsTableContent(plan) {
    const children = [];
    const signatures = plan.signatures || [
        { title: 'Tuzuvchi:', name: plan.author || '' },
        { title: 'Konsultant:', name: plan.consultant || '' },
    ];

    children.push(para([txt(`Yo'nalish: ${plan.direction || ''}`, { bold: true })], { alignment: AlignmentType.CENTER, spacingAfter: 100 }));

    // Oylar bo'yicha darslarni guruhlash
    const lessonsByMonth = {};
    MONTHS.forEach(m => { lessonsByMonth[m] = []; });
    plan.lessons.forEach(l => {
        if (lessonsByMonth[l.month]) lessonsByMonth[l.month].push(l);
    });

    // Jadval sarlavha qatori
    const headerCells = ['№', 'Oylar', "Texnik mashg'ulot mavzusi", 'Soat', 'Adabiyotlar', 'Darslar'];
    const colWidths = [500, 900, 5000, 600, 2000, 900];

    const headerRow = new TableRow({
        tableHeader: true,
        children: headerCells.map((text, i) => new TableCell({
            width: { size: colWidths[i], type: WidthType.DXA },
            borders: allBorders,
            shading: { fill: 'E8E8E8', type: ShadingType.CLEAR },
            verticalAlign: VerticalAlign.CENTER,
            children: [para([txt(text, { bold: true, size: 18 })], { alignment: AlignmentType.CENTER, spacingAfter: 0 })],
        })),
    });

    const dataRows = [headerRow];

    MONTHS.forEach(month => {
        const ml = lessonsByMonth[month] || [];
        ml.forEach((lesson, i) => {
            const cumHours = plan.lessons
                .slice(0, plan.lessons.indexOf(lesson) + 1)
                .reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);

            const cells = [];
            // № ustuni
            cells.push(new TableCell({
                width: { size: colWidths[0], type: WidthType.DXA },
                borders: allBorders,
                verticalAlign: VerticalAlign.CENTER,
                children: [para([txt(`${lesson.number}`, { size: 18 })], { alignment: AlignmentType.CENTER, spacingAfter: 0 })],
            }));

            // Oy ustuni (faqat birinchi darsda)
            if (i === 0) {
                cells.push(new TableCell({
                    width: { size: colWidths[1], type: WidthType.DXA },
                    borders: allBorders,
                    rowSpan: ml.length,
                    verticalAlign: VerticalAlign.CENTER,
                    children: [para([txt(month, { bold: true, size: 18 })], { alignment: AlignmentType.CENTER, spacingAfter: 0 })],
                }));
            }

            // Mavzu
            cells.push(new TableCell({
                width: { size: colWidths[2], type: WidthType.DXA },
                borders: allBorders,
                children: [para([txt(lesson.topic || '\u2014', { size: 18 })], { spacingAfter: 0 })],
            }));

            // Soat
            cells.push(new TableCell({
                width: { size: colWidths[3], type: WidthType.DXA },
                borders: allBorders,
                verticalAlign: VerticalAlign.CENTER,
                children: [para([txt(`${lesson.hours}/${cumHours}`, { size: 16 })], { alignment: AlignmentType.CENTER, spacingAfter: 0 })],
            }));

            // Adabiyotlar
            cells.push(new TableCell({
                width: { size: colWidths[4], type: WidthType.DXA },
                borders: allBorders,
                children: [para([txt(lesson.literature || '', { size: 16 })], { spacingAfter: 0 })],
            }));

            // Dars
            cells.push(new TableCell({
                width: { size: colWidths[5], type: WidthType.DXA },
                borders: allBorders,
                verticalAlign: VerticalAlign.CENTER,
                children: [para([txt(`Dars №${lesson.number}`, { size: 16 })], { alignment: AlignmentType.CENTER, spacingAfter: 0 })],
            }));

            dataRows.push(new TableRow({ children: cells }));
        });
    });

    const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: dataRows,
    });
    children.push(table);

    // Jami
    const totalHours = plan.lessons.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
    children.push(para('', { spacingAfter: 60 }));
    children.push(para([txt(`Jami: ${totalHours} soat`, { bold: true })], { alignment: AlignmentType.RIGHT, spacingAfter: 300 }));

    // Imzolar
    const sigTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders,
        rows: signatures.map(sig => new TableRow({
            children: [
                new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    borders: noBorders,
                    children: [para([txt(sig.title, { bold: true })])],
                }),
                new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    borders: noBorders,
                    children: [para('_______________', { alignment: AlignmentType.CENTER })],
                }),
                new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    borders: noBorders,
                    children: [para(sig.name || '')],
                }),
            ],
        })),
    });
    children.push(sigTable);

    return children;
}

export async function exportPlanToDocx(plan) {
    const titleContent = buildTitlePageContent(plan);
    const lessonsContent = buildLessonsTableContent(plan);

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: {
                            orientation: PageOrientation.LANDSCAPE,
                            width: 16838, // A4 landscape
                            height: 11906,
                        },
                        margin: { top: 567, bottom: 567, left: 680, right: 680 }, // ~10mm
                    },
                },
                children: titleContent,
            },
            {
                properties: {
                    page: {
                        size: {
                            orientation: PageOrientation.LANDSCAPE,
                            width: 16838,
                            height: 11906,
                        },
                        margin: { top: 567, bottom: 567, left: 680, right: 680 },
                    },
                },
                children: lessonsContent,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${plan.name}.docx`);
}
