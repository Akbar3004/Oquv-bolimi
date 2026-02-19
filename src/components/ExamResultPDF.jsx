import React from 'react';
import {
    Document, Page, View, Text, Image, StyleSheet, Font, Svg, Rect, Defs, LinearGradient, Stop, Line, Circle, Path, Polyline, G
} from '@react-pdf/renderer';

// ═══════════════════════════════════════════
// FONT REGISTRATION
// ═══════════════════════════════════════════
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf', fontWeight: 500 },
        { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf', fontWeight: 700 },
        { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZg.ttf', fontWeight: 800 },
        { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuBWYMZg.ttf', fontWeight: 900 },
    ],
});

// Disable hyphenation for better text rendering
Font.registerHyphenationCallback(word => [word]);

// ═══════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════
const C = {
    navy: '#0f2b5b',
    navyLight: '#1a5276',
    blue: '#2980b9',
    gold: '#c5a028',
    goldBg: '#fef3c7',
    white: '#ffffff',
    black: '#111827',
    gray900: '#1a1a2e',
    gray700: '#374151',
    gray500: '#6b7280',
    gray400: '#9ca3af',
    gray300: '#d1d5db',
    gray200: '#e5e7eb',
    gray100: '#f3f4f6',
    gray50: '#fafbfc',
    greenBg: '#ecfdf5',
    greenBorder: '#a7f3d0',
    greenDark: '#065f46',
    greenBright: '#059669',
    redBg: '#fef2f2',
    redBorder: '#fecaca',
    redDark: '#991b1b',
    redBright: '#dc2626',
};

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
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

// ═══════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════
const s = StyleSheet.create({
    page: {
        fontFamily: 'Inter',
        backgroundColor: C.white,
        paddingTop: 0,
        paddingBottom: 0,
        paddingHorizontal: 0,
        color: C.black,
        position: 'relative',
    },

    // Top/Bottom decorative stripe
    stripe: {
        height: 8,
        width: '100%',
    },
    stripeBottom: {
        height: 6,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 22,
        paddingBottom: 18,
        gap: 18,
    },
    logoWrap: {
        width: 72,
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: 72,
        height: 72,
        objectFit: 'contain',
    },
    headerCenter: {
        flex: 1,
        textAlign: 'center',
        alignItems: 'center',
    },
    orgName: {
        fontSize: 16,
        fontWeight: 800,
        color: C.navy,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    depotName: {
        fontSize: 11,
        fontWeight: 600,
        color: C.navyLight,
        textTransform: 'uppercase',
        marginTop: 2,
        letterSpacing: 0.5,
    },

    // Title Row
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 10,
    },
    titleLine: {
        flex: 1,
        height: 1,
        backgroundColor: C.gray200,
    },
    titleBadge: {
        backgroundColor: C.navy,
        color: C.white,
        fontSize: 14,
        fontWeight: 800,
        paddingVertical: 7,
        paddingHorizontal: 32,
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginHorizontal: 14,
    },

    // Profile Section
    profileSection: {
        marginHorizontal: 40,
        marginTop: 22,
        borderWidth: 1.5,
        borderColor: C.gray200,
        borderRadius: 10,
        padding: 20,
        flexDirection: 'row',
        gap: 18,
        backgroundColor: C.gray50,
    },
    avatarBox: {
        width: 78,
        height: 92,
        borderWidth: 1.5,
        borderColor: C.gray300,
        borderRadius: 8,
        backgroundColor: C.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 28,
        color: C.gray400,
    },
    infoCol: {
        flex: 1,
        justifyContent: 'center',
        gap: 12,
    },
    infoColRight: {
        flex: 1,
        justifyContent: 'center',
        gap: 10,
        alignItems: 'flex-end',
    },
    fieldLabel: {
        fontSize: 8,
        fontWeight: 700,
        color: C.gray500,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 13,
        fontWeight: 600,
        color: C.black,
    },
    fieldValueName: {
        fontSize: 18,
        fontWeight: 800,
        color: C.navy,
    },
    fieldValueSmall: {
        fontSize: 11,
        fontWeight: 600,
        color: C.black,
    },
    examFileNote: {
        fontSize: 8,
        color: C.gray400,
        marginTop: 1,
    },

    // Time Grid
    timeGrid: {
        flexDirection: 'row',
        gap: 6,
        marginHorizontal: 40,
        marginTop: 18,
    },
    timeCard: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: C.gray200,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    timeIcon: {
        width: 22,
        height: 22,
        borderRadius: 4,
        backgroundColor: '#eef2ff',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    timeLabel: {
        fontSize: 6,
        fontWeight: 700,
        color: C.gray500,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    timeValue: {
        fontSize: 11,
        fontWeight: 800,
        color: C.black,
        marginTop: 1,
    },

    // Results Grid
    resultsGrid: {
        flexDirection: 'row',
        gap: 14,
        marginHorizontal: 40,
        marginTop: 18,
    },
    statsCol: {
        flex: 1,
        gap: 10,
    },

    // Total Bar
    totalBar: {
        backgroundColor: C.navy,
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: C.white,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        opacity: 0.9,
    },
    totalNumber: {
        fontSize: 34,
        fontWeight: 900,
        color: C.white,
    },

    // Answer Cards
    answersRow: {
        flexDirection: 'row',
        gap: 10,
    },
    answerCard: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    answerCardCorrect: {
        backgroundColor: C.greenBg,
        borderWidth: 1.5,
        borderColor: C.greenBorder,
    },
    answerCardWrong: {
        backgroundColor: C.redBg,
        borderWidth: 1.5,
        borderColor: C.redBorder,
    },
    answerLabel: {
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    answerNumber: {
        fontSize: 40,
        fontWeight: 900,
        lineHeight: 1,
    },

    // Grade Box
    gradeBox: {
        width: 160,
        borderWidth: 2.5,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    gradeTitle: {
        fontSize: 8,
        fontWeight: 700,
        color: C.gray500,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    gradeNumber: {
        fontSize: 58,
        fontWeight: 900,
        lineHeight: 1,
    },
    gradeText: {
        fontSize: 16,
        fontWeight: 800,
        letterSpacing: 2,
        marginTop: 4,
    },

    // Efficiency
    efficiencySection: {
        marginHorizontal: 40,
        marginTop: 22,
        paddingTop: 16,
        borderTopWidth: 1.5,
        borderTopColor: C.gray100,
    },
    efficiencyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    efficiencyLabel: {
        fontSize: 9,
        fontWeight: 700,
        color: C.gray500,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    efficiencyPercent: {
        fontSize: 13,
        fontWeight: 800,
        color: C.navy,
    },
    barTrack: {
        width: '100%',
        height: 10,
        backgroundColor: C.gray100,
        borderRadius: 5,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: C.navy,
        borderRadius: 5,
    },

    // Footer
    footerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginHorizontal: 40,
        marginTop: 30,
        paddingTop: 18,
        gap: 30,
    },
    sigBlock: {
        flex: 1,
    },
    sigRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    sigLabelText: {
        fontSize: 12,
        fontWeight: 700,
        color: C.black,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    sigDotted: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: C.gray500,
        borderBottomStyle: 'dotted',
        paddingBottom: 2,
        textAlign: 'right',
        minWidth: 180,
    },
    sigNameText: {
        fontSize: 12,
        fontWeight: 700,
        color: C.black,
    },
    sigNote: {
        fontSize: 8,
        color: C.gray400,
        marginTop: 3,
        textAlign: 'center',
    },
    qrBlock: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    qrText: {
        fontSize: 7,
        color: C.gray500,
        maxWidth: 100,
        textAlign: 'right',
        lineHeight: 1.4,
    },
    qrImage: {
        width: 72,
        height: 72,
        borderWidth: 1.5,
        borderColor: C.gray300,
        borderRadius: 6,
    },

    // Watermark
    watermark: {
        position: 'absolute',
        top: '40%',
        left: '25%',
        fontSize: 52,
        fontWeight: 900,
        color: '#f3f4f6',
        letterSpacing: 8,
        textTransform: 'uppercase',
        opacity: 0.5,
        transform: 'rotate(-30deg)',
    },
});

// ═══════════════════════════════════════════
// SMALL SVG ICONS (inline for time cards)
// ═══════════════════════════════════════════
const CalendarIcon = () => (
    <Svg width="14" height="14" viewBox="0 0 24 24">
        <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke={C.navy} strokeWidth={2} />
        <Line x1="16" y1="2" x2="16" y2="6" stroke={C.navy} strokeWidth={2} />
        <Line x1="8" y1="2" x2="8" y2="6" stroke={C.navy} strokeWidth={2} />
        <Line x1="3" y1="10" x2="21" y2="10" stroke={C.navy} strokeWidth={2} />
    </Svg>
);

const ClockIcon = () => (
    <Svg width="14" height="14" viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="10" fill="none" stroke={C.navy} strokeWidth={2} />
        <Path d="M12 6 L12 12 L16 14" fill="none" stroke={C.navy} strokeWidth={2} />
    </Svg>
);

const HourglassIcon = () => (
    <Svg width="14" height="14" viewBox="0 0 24 24">
        <Path d="M5 22 L19 22" fill="none" stroke={C.navy} strokeWidth={2} />
        <Path d="M5 2 L19 2" fill="none" stroke={C.navy} strokeWidth={2} />
        <Path d="M17 22 L17 17.828 C17 17.298 16.789 16.789 16.414 16.414 L12 12 L7.586 16.414 C7.211 16.789 7 17.298 7 17.828 L7 22" fill="none" stroke={C.navy} strokeWidth={2} />
        <Path d="M7 2 L7 6.172 C7 6.702 7.211 7.211 7.586 7.586 L12 12 L16.414 7.586 C16.789 7.211 17 6.702 17 6.172 L17 2" fill="none" stroke={C.navy} strokeWidth={2} />
    </Svg>
);

const ClockEndIcon = () => (
    <Svg width="14" height="14" viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="10" fill="none" stroke={C.navy} strokeWidth={2} />
        <Path d="M12 6 L12 12 L8 14" fill="none" stroke={C.navy} strokeWidth={2} />
    </Svg>
);

// User icon for avatar
const UserIcon = () => (
    <Svg width="32" height="32" viewBox="0 0 24 24">
        <Path d="M20 21 L20 19 C20 16.791 18.209 15 16 15 L8 15 C5.791 15 4 16.791 4 19 L4 21" fill="none" stroke={C.gray400} strokeWidth={1.5} />
        <Circle cx="12" cy="7" r="4" fill="none" stroke={C.gray400} strokeWidth={1.5} />
    </Svg>
);

// ═══════════════════════════════════════════
// GRADIENT STRIPE (SVG-based)
// ═══════════════════════════════════════════
const GradientStripe = ({ height = 8 }) => (
    <Svg width="595" height={height} viewBox={`0 0 595 ${height}`}>
        <Defs>
            <LinearGradient id="stripeGrad" x1="0" y1="0" x2="595" y2="0">
                <Stop offset="0%" stopColor={C.navy} />
                <Stop offset="35%" stopColor={C.navyLight} />
                <Stop offset="65%" stopColor={C.blue} />
                <Stop offset="100%" stopColor={C.navy} />
            </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="595" height={height} fill="url(#stripeGrad)" />
    </Svg>
);

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
const ExamResultPDF = ({ result, qrDataUrl, logoDataUrl }) => {
    if (!result) return null;

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
    const gradeColor = getGradeColor(grade);
    const gradeLabel = getGradeLabel(grade);

    return (
        <Document>
            <Page size="A4" style={s.page}>

                {/* ─── TOP GRADIENT STRIPE ─── */}
                <GradientStripe height={8} />

                {/* ─── HEADER ─── */}
                <View style={s.header}>
                    {logoDataUrl ? (
                        <View style={s.logoWrap}>
                            <Image src={logoDataUrl} style={s.logoImage} />
                        </View>
                    ) : (
                        <View style={[s.logoWrap, { backgroundColor: C.goldBg, borderRadius: 8 }]}>
                            <Text style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>OTY</Text>
                        </View>
                    )}
                    <View style={s.headerCenter}>
                        <Text style={s.orgName}>"O'zbekiston temir yo'llari" AJ</Text>
                        <Text style={s.depotName}>"O'zbekiston" lokomotiv deposi</Text>
                    </View>
                </View>

                {/* ─── TITLE ─── */}
                <View style={s.titleRow}>
                    <View style={s.titleLine} />
                    <Text style={s.titleBadge}>Imtihon Natijasi</Text>
                    <View style={s.titleLine} />
                </View>

                {/* ─── PROFILE SECTION ─── */}
                <View style={s.profileSection}>
                    <View style={s.avatarBox}>
                        <UserIcon />
                    </View>
                    <View style={s.infoCol}>
                        <View>
                            <Text style={s.fieldLabel}>Lavozim</Text>
                            <Text style={s.fieldValue}>{position}</Text>
                        </View>
                        <View>
                            <Text style={s.fieldLabel}>Tabel raqami</Text>
                            <Text style={s.fieldValue}>{tabelId}</Text>
                        </View>
                    </View>
                    <View style={s.infoColRight}>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={s.fieldLabel}>F.I.Sh</Text>
                            <Text style={s.fieldValueName}>{name}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={s.fieldLabel}>Bo'lim / Sex</Text>
                            <Text style={s.fieldValue}>{workshop}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={s.fieldLabel}>Test mavzusi</Text>
                            <Text style={s.fieldValueSmall}>{examType}</Text>
                            <Text style={s.examFileNote}>{examFile}</Text>
                        </View>
                    </View>
                </View>

                {/* ─── TIME GRID ─── */}
                <View style={s.timeGrid}>
                    <View style={s.timeCard}>
                        <View style={s.timeIcon}>
                            <CalendarIcon />
                        </View>
                        <View>
                            <Text style={s.timeLabel}>Topshirgan sana</Text>
                            <Text style={s.timeValue}>{date}</Text>
                        </View>
                    </View>
                    <View style={s.timeCard}>
                        <View style={s.timeIcon}>
                            <ClockIcon />
                        </View>
                        <View>
                            <Text style={s.timeLabel}>Boshlanish vaqti</Text>
                            <Text style={s.timeValue}>{startTime}</Text>
                        </View>
                    </View>
                    <View style={s.timeCard}>
                        <View style={s.timeIcon}>
                            <ClockEndIcon />
                        </View>
                        <View>
                            <Text style={s.timeLabel}>Tugatish vaqti</Text>
                            <Text style={s.timeValue}>{endTime}</Text>
                        </View>
                    </View>
                    <View style={s.timeCard}>
                        <View style={s.timeIcon}>
                            <HourglassIcon />
                        </View>
                        <View>
                            <Text style={s.timeLabel}>Sarflangan vaqt</Text>
                            <Text style={s.timeValue}>{duration}</Text>
                        </View>
                    </View>
                </View>

                {/* ─── RESULTS SECTION ─── */}
                <View style={s.resultsGrid}>
                    <View style={s.statsCol}>
                        {/* Total Bar */}
                        <View style={s.totalBar}>
                            <Text style={s.totalLabel}>Jami savollar</Text>
                            <Text style={s.totalNumber}>{score.total}</Text>
                        </View>
                        {/* Answers Row */}
                        <View style={s.answersRow}>
                            <View style={[s.answerCard, s.answerCardCorrect]}>
                                <Text style={[s.answerLabel, { color: C.greenDark }]}>To'g'ri javoblar</Text>
                                <Text style={[s.answerNumber, { color: C.greenBright }]}>{score.correct}</Text>
                            </View>
                            <View style={[s.answerCard, s.answerCardWrong]}>
                                <Text style={[s.answerLabel, { color: C.redDark }]}>Xato javoblar</Text>
                                <Text style={[s.answerNumber, { color: C.redBright }]}>{score.wrong}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Grade Box */}
                    <View style={[s.gradeBox, { borderColor: gradeColor }]}>
                        <Text style={s.gradeTitle}>Yakuniy baho</Text>
                        <Text style={[s.gradeNumber, { color: gradeColor }]}>{grade}</Text>
                        <Text style={[s.gradeText, { color: gradeColor }]}>{gradeLabel}</Text>
                    </View>
                </View>

                {/* ─── EFFICIENCY ─── */}
                <View style={s.efficiencySection}>
                    <View style={s.efficiencyHeader}>
                        <Text style={s.efficiencyLabel}>Samaradorlik ko'rsatkichi</Text>
                        <Text style={s.efficiencyPercent}>{percentage}%</Text>
                    </View>
                    <View style={s.barTrack}>
                        <View style={[s.barFill, { width: `${percentage}%` }]} />
                    </View>
                </View>

                {/* ─── FOOTER ─── */}
                <View style={s.footerSection}>
                    <View style={s.sigBlock}>
                        <View style={s.sigRow}>
                            <Text style={s.sigLabelText}>TCHNUK:</Text>
                            <View style={s.sigDotted}>
                                <Text style={s.sigNameText}>{tchnuk}</Text>
                            </View>
                        </View>
                        <Text style={s.sigNote}>imzo</Text>
                    </View>
                    <View style={s.qrBlock}>
                        {qrDataUrl && (
                            <Image src={qrDataUrl} style={s.qrImage} />
                        )}
                    </View>
                </View>

                {/* ─── BOTTOM GRADIENT STRIPE ─── */}
                <View style={s.stripeBottom}>
                    <GradientStripe height={6} />
                </View>

            </Page>
        </Document>
    );
};

export default ExamResultPDF;
