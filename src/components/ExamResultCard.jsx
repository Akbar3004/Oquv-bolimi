import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'react-qr-code';

const ExamResultCard = ({ result, id }) => {
    const [htmlContent, setHtmlContent] = useState('');
    const containerRef = useRef(null);

    useEffect(() => {
        if (!result) return;

        const loadTemplate = async () => {
            try {
                const response = await fetch('/imtihon_shablon.html');
                let templateText = await response.text();

                const {
                    name = "",
                    position = "Noma'lum",
                    workshop = "Noma'lum",
                    tabelId = "0000",
                    examType = "Noma'lum",
                    examFile = "",
                    date = "",
                    startTime = "00:00",
                    endTime = "00:00",
                    duration = "0 daqiqa",
                    grade = 2,
                    score = { correct: 0, wrong: 0, total: 20 },
                    tchnuk = "Noma'lum"
                } = result;

                const percentage = Math.round((score.correct / score.total) * 100);

                const getGradeLabel = (g) => {
                    if (g === 5) return "A'LO";
                    if (g === 4) return "YAXSHI";
                    if (g === 3) return "QONIQARLI";
                    return "QONIQARSIZ";
                };

                const getGradeColor = (g) => {
                    if (g === 5) return '#059669';
                    if (g === 4) return '#d97706';
                    if (g === 3) return '#ea580c';
                    return '#dc2626';
                };

                const replacements = {
                    '{{NAME}}': name,
                    '{{POSITION}}': position,
                    '{{WORKSHOP}}': workshop,
                    '{{TABEL_ID}}': tabelId,
                    '{{EXAM_TYPE}}': examType,
                    '{{EXAM_FILE}}': examFile,
                    '{{DATE}}': date,
                    '{{START_TIME}}': startTime,
                    '{{END_TIME}}': endTime,
                    '{{DURATION}}': duration,
                    '{{SCORE_TOTAL}}': String(score.total),
                    '{{SCORE_CORRECT}}': String(score.correct),
                    '{{SCORE_WRONG}}': String(score.wrong),
                    '{{GRADE}}': String(grade),
                    '{{GRADE_LABEL}}': getGradeLabel(grade),
                    '{{GRADE_COLOR}}': getGradeColor(grade),
                    '{{PERCENTAGE}}': String(percentage),
                    '{{TCHNUK}}': tchnuk
                };

                // 1. Replace ALL placeholders in full text (covers CSS + HTML)
                let processedText = templateText;
                Object.entries(replacements).forEach(([key, value]) => {
                    processedText = processedText.split(key).join(value);
                });

                // 2. Parse and extract clean content
                const parser = new DOMParser();
                const doc = parser.parseFromString(processedText, 'text/html');

                // 3. Get CSS but remove body {} to prevent layout conflicts
                const styleEl = doc.querySelector('style');
                let css = '';
                if (styleEl) {
                    css = styleEl.textContent;
                    // Remove body, html, and universal reset rules
                    css = css.replace(/body\s*\{[\s\S]*?\}/gi, '');
                    css = css.replace(/html\s*\{[\s\S]*?\}/gi, '');
                    css = css.replace(/\*\s*\{[\s\S]*?\}/gi, '');
                    // Remove @import (fonts loaded separately or already available)
                    css = css.replace(/@import[^;]+;/gi, '');
                }

                // 4. Get page content
                const pageEl = doc.querySelector('.page');
                if (!pageEl) {
                    setHtmlContent('<div style="color:red;padding:20px;">Shablon xatosi: .page element topilmadi</div>');
                    return;
                }

                const finalHtml = `<style>${css}</style>${pageEl.outerHTML}`;
                setHtmlContent(finalHtml);

            } catch (error) {
                console.error('Template loading error:', error);
                setHtmlContent('<div style="color:red;padding:20px;">Shablon yuklanmadi</div>');
            }
        };

        loadTemplate();
    }, [result]);

    // Inject QR code after HTML is rendered
    useEffect(() => {
        if (!htmlContent || !containerRef.current) return;

        const qrMount = containerRef.current.querySelector('#qr-mount-point');
        if (qrMount) {
            // Clear any previous content
            qrMount.innerHTML = '';
        }
    }, [htmlContent]);

    if (!result) return null;

    return (
        <div
            id={id}
            ref={containerRef}
            style={{ position: 'relative', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
        >
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

            {/* QR Code overlay — positioned at footer right */}
            <div style={{
                position: 'absolute',
                bottom: '32px',
                right: '40px',
                background: '#fff',
                borderRadius: '6px',
                padding: '3px',
                border: '1.5px solid #d1d5db',
                lineHeight: 0
            }}>
                <QRCode
                    value={`https://railway-exam.uz/verify/${id || 'demo'}`}
                    size={70}
                    level="M"
                    style={{ display: 'block' }}
                />
            </div>
        </div>
    );
};

export default ExamResultCard;
