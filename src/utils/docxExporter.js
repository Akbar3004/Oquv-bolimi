import {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, AlignmentType, BorderStyle, PageOrientation, VerticalAlign,
    ShadingType, convertMillimetersToTwip
} from 'docx';
import { saveAs } from 'file-saver';

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
const FONT = 'Times New Roman';

// ===== Yordamchi funksiyalar =====
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const solidBorder = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const allBorders = { top: solidBorder, bottom: solidBorder, left: solidBorder, right: solidBorder };

// Matn yaratish
function t(text, opts = {}) {
    return new TextRun({
        text: text || '',
        font: FONT,
        size: opts.size || 22,
        bold: opts.bold || false,
        underline: opts.underline ? {} : undefined,
        italics: opts.italics || false,
    });
}

// Paragraf yaratish
function p(content, opts = {}) {
    const children = typeof content === 'string' ? [t(content, opts)] : content;
    return new Paragraph({
        children,
        alignment: opts.align || AlignmentType.LEFT,
        spacing: { after: opts.after ?? 40, before: opts.before ?? 0 },
        indent: opts.indent ? { left: opts.indent } : undefined,
    });
}

// Bo'sh qator
function emptyLine(after = 120) {
    return p('', { after });
}

// Chegarasiz katak
function noBorderCell(children, opts = {}) {
    return new TableCell({
        children: Array.isArray(children) ? children : [children],
        borders: noBorders,
        width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
        verticalAlign: opts.vAlign || VerticalAlign.TOP,
    });
}

// Chegarali katak
function borderedCell(children, opts = {}) {
    return new TableCell({
        children: Array.isArray(children) ? children : [children],
        borders: allBorders,
        width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
        verticalAlign: opts.vAlign || VerticalAlign.CENTER,
        rowSpan: opts.rowSpan || 1,
        shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    });
}

export async function exportPlanToDocx(plan) {
    const tp = plan.titlePage || {};
    const k = tp.kelishildi || {};
    const ta = tp.tasdiqlayman || {};
    const c = tp.centerOrg || {};
    const maslaxatchilar = tp.maslaxatchilar || [];
    const year = plan.year || 2025;
    const sigs = plan.signatures || [
        { title: 'Tuzuvchi:', name: plan.author || '' },
        { title: 'Konsultant:', name: plan.consultant || '' },
    ];

    // A4 landscape = 297mm x 210mm
    // Marginal: chap/o'ng 15mm, yuqori/pastki 10mm
    // Foydalanish mumkin bo'lgan kenglik ≈ 297 - 30 = 267mm ≈ 15120 twips
    const pageW = convertMillimetersToTwip(297);
    const pageH = convertMillimetersToTwip(210);
    const marginLR = convertMillimetersToTwip(15);
    const marginTB = convertMillimetersToTwip(10);
    const usableWidth = pageW - marginLR * 2; // ~15120

    const halfWidth = Math.floor(usableWidth / 2);

    // ==========================================
    // 1-SAHIFA: TITIL
    // ==========================================
    const titleChildren = [];

    // --- KELISHILDI / TASDIQLAYMAN ---
    titleChildren.push(new Table({
        width: { size: usableWidth, type: WidthType.DXA },
        rows: [
            new TableRow({
                children: [
                    noBorderCell([
                        p([t('KELISHILDI :', { bold: true })]),
                        p(k.orgLine1 || '"O\'zbekiston" lokomotiv'),
                        p(k.orgLine2 || 'deposi boshlig\'i'),
                        p(`${k.name || 'N.M.Hamdamov'} _______________`),
                        p(`" _______ " _____________ ${year}y`),
                    ], { width: halfWidth }),
                    noBorderCell([
                        p([t('TASDIQLAYMAN:', { bold: true })], { align: AlignmentType.RIGHT }),
                        p(ta.orgLine1 || '"O\'zbekiston Temir yo\'llari" AJ', { align: AlignmentType.RIGHT }),
                        p(ta.orgLine2 || 'Lokomotivlardan foydalanish boshqarmasi', { align: AlignmentType.RIGHT }),
                        p(ta.orgLine3 || 'boshlig\'i', { align: AlignmentType.RIGHT }),
                        p([t(ta.name || 'Sh.T.Tulyaganov', { underline: true })], { align: AlignmentType.RIGHT }),
                        p(`" _______ " _____________ ${year}y`, { align: AlignmentType.RIGHT }),
                    ], { width: halfWidth }),
                ],
            }),
        ],
    }));

    titleChildren.push(emptyLine(300));

    // --- Markaziy tashkilot ---
    titleChildren.push(p(c.line1 || '"O\'zbekiston temir yo\'llari" A.J.', { align: AlignmentType.CENTER }));
    titleChildren.push(p([t(c.line2 || '"O\'zbekiston" lokomotiv deposi.', { underline: true })], { align: AlignmentType.CENTER, after: 300 }));

    // --- Sarlavha ---
    titleChildren.push(p([t(`${year} yil uchun tuzilgan choraklarga bo'lingan`, { bold: true })], { align: AlignmentType.CENTER }));
    titleChildren.push(p([t("Yillik texnik o'quv mashg'ulotlar mavzulari rejasi", { bold: true })], { align: AlignmentType.CENTER, after: 300 }));

    // --- Yo'nalish va Sexlar ---
    titleChildren.push(p([t(`Yo'nalish: ${plan.direction || ''}`, { bold: true })], { align: AlignmentType.CENTER }));
    const sexList = (plan.workshops || []).length > 0
        ? `Sex № ${plan.workshops.join(', №')}.`
        : '';
    if (sexList) {
        titleChildren.push(p([t(sexList, { bold: true })], { align: AlignmentType.CENTER, after: 300 }));
    }

    // --- Maslaxatchilar ---
    titleChildren.push(emptyLine(100));
    titleChildren.push(p([t('Maslaxatchilar:', { bold: true })]));
    titleChildren.push(emptyLine(60));

    for (const m of maslaxatchilar) {
        const lines = (m.title || '').split('\n');
        const titleParas = lines.map(line => p(line, { after: 0 }));
        const nameText = `${m.name || '_______________'}    _______________`;

        titleChildren.push(new Table({
            width: { size: usableWidth, type: WidthType.DXA },
            rows: [
                new TableRow({
                    children: [
                        noBorderCell(titleParas, { width: Math.floor(usableWidth * 0.55) }),
                        noBorderCell([
                            p(nameText, { align: AlignmentType.RIGHT }),
                        ], { width: Math.floor(usableWidth * 0.45), vAlign: VerticalAlign.BOTTOM }),
                    ],
                }),
            ],
        }));
        titleChildren.push(emptyLine(80));
    }

    // --- Pastki tashkilot ---
    titleChildren.push(emptyLine(200));
    const orgClean = (c.line2 || '').replace(/"/g, '').replace(/\./g, '');
    titleChildren.push(p([t(`\u201E${orgClean}\u201C`, { italics: true })], { align: AlignmentType.CENTER }));

    // ==========================================
    // 2-SAHIFA: DARSLAR JADVALI
    // ==========================================
    const lessonsChildren = [];

    lessonsChildren.push(p([t(`Yo'nalish: ${plan.direction || ''}`, { bold: true })], { align: AlignmentType.CENTER, after: 120 }));

    // Darslarni oylar bo'yicha guruhlash
    const lessonsByMonth = {};
    MONTHS.forEach(m => { lessonsByMonth[m] = []; });
    (plan.lessons || []).forEach(l => {
        if (lessonsByMonth[l.month]) lessonsByMonth[l.month].push(l);
    });

    // Ustun kengliklari (jami ≈ usableWidth)
    const cNum = Math.floor(usableWidth * 0.035);    // №
    const cMonth = Math.floor(usableWidth * 0.065);   // Oylar
    const cTopic = Math.floor(usableWidth * 0.50);    // Mavzu
    const cHour = Math.floor(usableWidth * 0.05);     // Soat
    const cLit = Math.floor(usableWidth * 0.27);      // Adabiyotlar
    const cLesson = Math.floor(usableWidth * 0.08);   // Darslar

    // Jadval sarlavhasi
    const headerTexts = ['№', 'Oylar', "Texnik mashg'ulot mavzusi", 'Soat', 'Adabiyotlar', 'Darslar'];
    const colWidths = [cNum, cMonth, cTopic, cHour, cLit, cLesson];

    const headerRow = new TableRow({
        tableHeader: true,
        children: headerTexts.map((text, i) =>
            borderedCell(
                p([t(text, { bold: true, size: 17 })], { align: AlignmentType.CENTER, after: 0 }),
                { width: colWidths[i], shading: 'E0E0E0' }
            )
        ),
    });

    const dataRows = [headerRow];

    MONTHS.forEach(month => {
        const ml = lessonsByMonth[month] || [];
        ml.forEach((lesson, i) => {
            const idx = (plan.lessons || []).indexOf(lesson);
            const cumHours = (plan.lessons || [])
                .slice(0, idx + 1)
                .reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);

            const cells = [];

            // №
            cells.push(borderedCell(
                p([t(`${lesson.number}`, { size: 17 })], { align: AlignmentType.CENTER, after: 0 }),
                { width: colWidths[0] }
            ));

            // Oy (faqat birinchida, rowSpan)
            if (i === 0) {
                cells.push(borderedCell(
                    p([t(month, { bold: true, size: 17 })], { align: AlignmentType.CENTER, after: 0 }),
                    { width: colWidths[1], rowSpan: ml.length }
                ));
            }

            // Mavzu
            cells.push(borderedCell(
                p([t(lesson.topic || '\u2014', { size: 17 })], { after: 0 }),
                { width: colWidths[2] }
            ));

            // Soat
            cells.push(borderedCell(
                p([t(`${lesson.hours}/${cumHours}`, { size: 15 })], { align: AlignmentType.CENTER, after: 0 }),
                { width: colWidths[3] }
            ));

            // Adabiyotlar
            cells.push(borderedCell(
                p([t(lesson.literature || '', { size: 15 })], { after: 0 }),
                { width: colWidths[4] }
            ));

            // Dars №
            cells.push(borderedCell(
                p([t(`Dars №${lesson.number}`, { size: 15 })], { align: AlignmentType.CENTER, after: 0 }),
                { width: colWidths[5] }
            ));

            dataRows.push(new TableRow({ children: cells }));
        });
    });

    lessonsChildren.push(new Table({
        width: { size: usableWidth, type: WidthType.DXA },
        rows: dataRows,
    }));

    // Jami
    const totalHours = (plan.lessons || []).reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
    lessonsChildren.push(emptyLine(60));
    lessonsChildren.push(p([t(`Jami: ${totalHours} soat`, { bold: true })], { align: AlignmentType.RIGHT, after: 300 }));

    // Imzolar
    const sigRows = sigs.map(sig => new TableRow({
        children: [
            noBorderCell(p([t(sig.title, { bold: true })], { after: 0 }), { width: Math.floor(usableWidth * 0.3) }),
            noBorderCell(p('_______________', { align: AlignmentType.CENTER, after: 0 }), { width: Math.floor(usableWidth * 0.25) }),
            noBorderCell(p(sig.name || '', { after: 0 }), { width: Math.floor(usableWidth * 0.2) }),
            noBorderCell(p('', { after: 0 }), { width: Math.floor(usableWidth * 0.25) }),
        ],
    }));
    lessonsChildren.push(new Table({
        width: { size: usableWidth, type: WidthType.DXA },
        rows: sigRows,
    }));

    // ==========================================
    // HUJJAT YARATISH
    // ==========================================
    const pageProps = {
        page: {
            size: { width: pageW, height: pageH, orientation: PageOrientation.LANDSCAPE },
            margin: { top: marginTB, bottom: marginTB, left: marginLR, right: marginLR },
        },
    };

    const doc = new Document({
        sections: [
            { properties: pageProps, children: titleChildren },
            { properties: pageProps, children: lessonsChildren },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${plan.name}.docx`);
}
