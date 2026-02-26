import { saveAs } from 'file-saver';

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

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

    const lessonsByMonth = {};
    MONTHS.forEach(m => { lessonsByMonth[m] = []; });
    (plan.lessons || []).forEach(l => {
        if (lessonsByMonth[l.month]) lessonsByMonth[l.month].push(l);
    });

    const totalHours = (plan.lessons || []).reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);

    // Maslaxatchilar qatorlari
    let maslaxatchilarRows = '';
    maslaxatchilar.forEach(m => {
        const titleText = (m.title || '').replace(/\n/g, '<br/>');
        maslaxatchilarRows += `
        <tr>
            <td style="padding:3px 0 8px 20px;font-size:10pt;vertical-align:bottom;border:none">${titleText}</td>
            <td style="padding:3px 0 8px 0;font-size:10pt;text-align:right;vertical-align:bottom;border:none">${m.name || '_______________'} &nbsp;&nbsp;&nbsp;&nbsp; _______________</td>
        </tr>`;
    });

    // Darslar jadvali qatorlari
    let lessonRows = '';
    MONTHS.forEach(month => {
        const ml = lessonsByMonth[month] || [];
        ml.forEach((lesson, i) => {
            const idx = (plan.lessons || []).indexOf(lesson);
            const cumHours = (plan.lessons || [])
                .slice(0, idx + 1)
                .reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);

            const monthCell = i === 0
                ? `<td rowspan="${ml.length}" style="border:1px solid black;padding:2px;text-align:center;font-weight:bold;font-size:9pt;vertical-align:middle">${month}</td>`
                : '';

            lessonRows += `
            <tr>
                <td style="border:1px solid black;padding:2px;text-align:center;font-size:9pt">${lesson.number}</td>
                ${monthCell}
                <td style="border:1px solid black;padding:2px 4px;font-size:9pt">${lesson.topic || '\u2014'}</td>
                <td style="border:1px solid black;padding:2px;text-align:center;font-size:8pt">${lesson.hours}/${cumHours}</td>
                <td style="border:1px solid black;padding:2px 4px;font-size:8pt">${lesson.literature || ''}</td>
                <td style="border:1px solid black;padding:2px;text-align:center;font-size:8pt">Dars \u2116${lesson.number}</td>
            </tr>`;
        });
    });

    // Imzolar
    let sigRows = '';
    sigs.forEach(sig => {
        sigRows += `
        <tr>
            <td style="padding:5px 0;font-size:10pt;border:none"><b>${sig.title}</b></td>
            <td style="padding:5px 0;font-size:10pt;text-align:center;border:none">_______________</td>
            <td style="padding:5px 0;font-size:10pt;border:none">${sig.name || ''}</td>
        </tr>`;
    });

    const html = `
<html xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
  </w:WordDocument>
</xml>
<style>
    @page Section1 {
        size: 841.9pt 595.3pt;
        mso-page-orientation: landscape;
        margin: 28.35pt 42.55pt 28.35pt 42.55pt;
    }
    div.Section1 { page: Section1; }
    body {
        font-family: 'Times New Roman', serif;
        font-size: 11pt;
        color: #000;
    }
    table {
        border-collapse: collapse;
    }
    td, th {
        font-family: 'Times New Roman', serif;
    }
    p {
        margin: 0;
        padding: 0;
    }
</style>
</head>
<body>
<div class="Section1">

<!-- ==================== TITIL SAHIFASI ==================== -->

<!-- KELISHILDI va TASDIQLAYMAN -->
<table width="100%" style="border:none">
<tr>
    <td width="45%" valign="top" style="border:none;font-size:10pt">
        <p><b>KELISHILDI :</b></p>
        <p>${k.orgLine1 || '"O\'zbekiston" lokomotiv'}</p>
        <p>${k.orgLine2 || 'deposi boshlig\'i'}</p>
        <p>${k.name || 'N.M.Hamdamov'} _______________</p>
        <p>&nbsp;</p>
        <p>" _______ " _____________ ${year}y</p>
    </td>
    <td width="10%" style="border:none">&nbsp;</td>
    <td width="45%" valign="top" style="border:none;font-size:10pt;text-align:right">
        <p><b>TASDIQLAYMAN:</b></p>
        <p>${ta.orgLine1 || '"O\'zbekiston Temir yo\'llari" AJ'}</p>
        <p>${ta.orgLine2 || 'Lokomotivlardan foydalanish boshqarmasi'}</p>
        <p>${ta.orgLine3 || 'boshlig\'i'}</p>
        <p><u>${ta.name || 'Sh.T.Tulyaganov'}</u></p>
        <p>" _______ " _____________ ${year}y</p>
    </td>
</tr>
</table>

<br/><br/>

<!-- Markaziy tashkilot -->
<p style="text-align:center;font-size:11pt">${c.line1 || '"O\'zbekiston temir yo\'llari" A.J.'}</p>
<p style="text-align:center;font-size:11pt"><u>${c.line2 || '"O\'zbekiston" lokomotiv deposi.'}</u></p>

<br/><br/>

<!-- Sarlavha -->
<p style="text-align:center;font-size:11pt"><b>${year} yil uchun tuzilgan choraklarga bo'lingan</b></p>
<p style="text-align:center;font-size:11pt"><b>Yillik texnik o'quv mashg'ulotlar mavzulari rejasi</b></p>

<br/>

<!-- Yo'nalish va Sexlar -->
<p style="text-align:center;font-size:10.5pt"><b>Yo'nalish: ${plan.direction || ''}</b></p>
<p style="text-align:center;font-size:10.5pt"><b>Sex \u2116 ${(plan.workshops || []).join(', \u2116')}${(plan.workshops || []).length > 0 ? '.' : ''}</b></p>

<br/><br/>

<!-- Maslaxatchilar -->
<p style="font-size:10pt"><b>Maslaxatchilar:</b></p>
<br/>
<table width="100%" style="border:none">
${maslaxatchilarRows}
</table>

<br/><br/>

<p style="text-align:center;font-style:italic;font-size:10pt">\u201E${(c.line2 || '').replace(/"/g, '').replace(/\./g, '')}\u201C</p>

<!-- Sahifa uzilishi -->
<br clear="all" style="page-break-before:always"/>

<!-- ==================== DARSLAR JADVALI ==================== -->

<p style="text-align:center;font-size:10pt;font-weight:bold">Yo'nalish: ${plan.direction || ''}</p>
<br/>

<table width="100%" style="border-collapse:collapse">
<thead>
<tr>
    <th style="border:1px solid black;padding:4px;font-size:8.5pt;background:#e0e0e0;width:25px">\u2116</th>
    <th style="border:1px solid black;padding:4px;font-size:8.5pt;background:#e0e0e0;width:55px">Oylar</th>
    <th style="border:1px solid black;padding:4px;font-size:8.5pt;background:#e0e0e0">Texnik mashg'ulot mavzusi</th>
    <th style="border:1px solid black;padding:4px;font-size:8.5pt;background:#e0e0e0;width:35px">Soat</th>
    <th style="border:1px solid black;padding:4px;font-size:8.5pt;background:#e0e0e0;width:130px">Adabiyotlar</th>
    <th style="border:1px solid black;padding:4px;font-size:8.5pt;background:#e0e0e0;width:55px">Darslar</th>
</tr>
</thead>
<tbody>
${lessonRows}
</tbody>
</table>

<br/>
<p style="text-align:right;font-weight:bold;font-size:10pt">Jami: ${totalHours} soat</p>

<br/><br/>

<!-- Imzolar -->
<table width="70%" style="border:none">
${sigRows}
</table>

</div>
</body>
</html>`;

    const blob = new Blob(['\ufeff' + html], {
        type: 'application/msword;charset=utf-8'
    });
    saveAs(blob, `${plan.name}.doc`);
}
