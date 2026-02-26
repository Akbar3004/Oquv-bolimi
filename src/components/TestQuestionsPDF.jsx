import React from 'react';
import {
    Document, Page, View, Text, StyleSheet, Font, Svg, Rect, Defs, LinearGradient, Stop
} from '@react-pdf/renderer';

// Font
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf', fontWeight: 500 },
        { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf', fontWeight: 700 },
        { src: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZg.ttf', fontWeight: 800 },
    ],
});

Font.registerHyphenationCallback(word => [word]);

// Ranglar
const C = {
    navy: '#0f2b5b',
    navyLight: '#1a5276',
    blue: '#2980b9',
    white: '#ffffff',
    black: '#111827',
    gray700: '#374151',
    gray500: '#6b7280',
    gray400: '#9ca3af',
    gray200: '#e5e7eb',
    gray100: '#f3f4f6',
    gray50: '#fafbfc',
    greenBg: '#ecfdf5',
    greenBorder: '#a7f3d0',
    greenText: '#065f46',
    greenBright: '#059669',
};

const ANSWER_LETTERS = ['A', 'B', 'C', 'D'];

// Stillar
const s = StyleSheet.create({
    page: {
        fontFamily: 'Inter',
        backgroundColor: C.white,
        paddingTop: 0,
        paddingBottom: 40,
        paddingHorizontal: 0,
        color: C.black,
    },
    // Header
    header: {
        paddingHorizontal: 40,
        paddingTop: 20,
        paddingBottom: 16,
        textAlign: 'center',
    },
    orgName: {
        fontSize: 14,
        fontWeight: 800,
        color: C.navy,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    depotName: {
        fontSize: 10,
        fontWeight: 600,
        color: C.navyLight,
        marginTop: 2,
    },
    // Title
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 10,
        marginBottom: 6,
    },
    titleLine: {
        flex: 1,
        height: 1,
        backgroundColor: C.gray200,
    },
    titleBadge: {
        backgroundColor: C.navy,
        color: C.white,
        fontSize: 11,
        fontWeight: 800,
        paddingVertical: 5,
        paddingHorizontal: 20,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginHorizontal: 12,
    },
    // Info row
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        marginBottom: 14,
    },
    infoItem: {
        flexDirection: 'row',
        gap: 4,
    },
    infoLabel: {
        fontSize: 9,
        fontWeight: 700,
        color: C.gray500,
    },
    infoValue: {
        fontSize: 9,
        fontWeight: 600,
        color: C.black,
    },
    // Savol kartochkasi
    questionCard: {
        marginHorizontal: 40,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: C.gray200,
        borderRadius: 6,
        overflow: 'hidden',
    },
    questionHeader: {
        backgroundColor: C.gray100,
        paddingVertical: 6,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    questionNumber: {
        fontSize: 10,
        fontWeight: 800,
        color: C.navy,
    },
    questionText: {
        fontSize: 10,
        fontWeight: 600,
        color: C.black,
        flex: 1,
    },
    optionsGrid: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    optionItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: C.gray200,
    },
    optionItemCorrect: {
        backgroundColor: C.greenBg,
        borderColor: C.greenBorder,
    },
    optionLetter: {
        fontSize: 9,
        fontWeight: 700,
        color: C.gray500,
        width: 14,
    },
    optionLetterCorrect: {
        color: C.greenBright,
        fontWeight: 800,
    },
    optionText: {
        fontSize: 9,
        fontWeight: 500,
        color: C.gray700,
        flex: 1,
    },
    optionTextCorrect: {
        color: C.greenText,
        fontWeight: 700,
    },
    correctBadge: {
        fontSize: 7,
        fontWeight: 700,
        color: C.greenBright,
        backgroundColor: C.greenBg,
        paddingVertical: 1,
        paddingHorizontal: 4,
        borderRadius: 3,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 14,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 7,
        color: C.gray400,
    },
    pageNumber: {
        fontSize: 8,
        fontWeight: 600,
        color: C.gray500,
    },
    stripeBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 4,
    },
});

// Gradient stripe
const GradientStripe = ({ height = 6 }) => (
    <Svg width="595" height={height} viewBox={`0 0 595 ${height}`}>
        <Defs>
            <LinearGradient id="sg" x1="0" y1="0" x2="595" y2="0">
                <Stop offset="0%" stopColor={C.navy} />
                <Stop offset="35%" stopColor={C.navyLight} />
                <Stop offset="65%" stopColor={C.blue} />
                <Stop offset="100%" stopColor={C.navy} />
            </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="595" height={height} fill="url(#sg)" />
    </Svg>
);

// Savol kartochkasi
const QuestionCard = ({ question, index }) => (
    <View style={s.questionCard} wrap={false}>
        <View style={s.questionHeader}>
            <Text style={s.questionNumber}>{index + 1}-savol</Text>
            <Text style={s.questionText}>{question.question}</Text>
        </View>
        <View style={s.optionsGrid}>
            {question.options.map((opt, i) => {
                const isCorrect = i === question.correct;
                return (
                    <View key={i} style={[s.optionItem, isCorrect && s.optionItemCorrect]}>
                        <Text style={[s.optionLetter, isCorrect && s.optionLetterCorrect]}>
                            {ANSWER_LETTERS[i]})
                        </Text>
                        <Text style={[s.optionText, isCorrect && s.optionTextCorrect]}>
                            {opt}
                        </Text>
                        {isCorrect && <Text style={s.correctBadge}>✓</Text>}
                    </View>
                );
            })}
        </View>
    </View>
);

// Asosiy komponent
const TestQuestionsPDF = ({ bankName, seh, lavozim, razryad, questions }) => {
    if (!questions || questions.length === 0) return null;

    // Savollarni sahifalarga bo'lish (taxminan 6 ta savol har sahifada)
    return (
        <Document>
            <Page size="A4" style={s.page} wrap>
                {/* Yuqori chiziq */}
                <GradientStripe height={6} />

                {/* Header */}
                <View style={s.header}>
                    <Text style={s.orgName}>"O'zbekiston temir yo'llari" AJ</Text>
                    <Text style={s.depotName}>"O'zbekiston" lokomotiv deposi</Text>
                </View>

                {/* Title */}
                <View style={s.titleRow}>
                    <View style={s.titleLine} />
                    <Text style={s.titleBadge}>Test Savollari</Text>
                    <View style={s.titleLine} />
                </View>

                {/* Info */}
                <View style={s.infoRow}>
                    <View style={s.infoItem}>
                        <Text style={s.infoLabel}>To'plam:</Text>
                        <Text style={s.infoValue}>{bankName}</Text>
                    </View>
                    <View style={s.infoItem}>
                        <Text style={s.infoLabel}>Seh:</Text>
                        <Text style={s.infoValue}>{seh || 'Barchasi'}</Text>
                    </View>
                    <View style={s.infoItem}>
                        <Text style={s.infoLabel}>Lavozim:</Text>
                        <Text style={s.infoValue}>{lavozim || 'Barchasi'}</Text>
                    </View>
                    <View style={s.infoItem}>
                        <Text style={s.infoLabel}>Razryad:</Text>
                        <Text style={s.infoValue}>{razryad || 'Barchasi'}</Text>
                    </View>
                    <View style={s.infoItem}>
                        <Text style={s.infoLabel}>Jami:</Text>
                        <Text style={s.infoValue}>{questions.length} ta</Text>
                    </View>
                </View>

                {/* Savollar */}
                {questions.map((q, i) => (
                    <QuestionCard key={i} question={q} index={i} />
                ))}

                {/* Footer */}
                <View style={s.footer} fixed>
                    <Text style={s.footerText}>
                        {bankName} — {new Date().toLocaleDateString('uz-UZ')}
                    </Text>
                    <Text style={s.pageNumber} render={({ pageNumber, totalPages }) => (
                        `${pageNumber} / ${totalPages}`
                    )} />
                </View>

                {/* Pastki chiziq */}
                <View style={s.stripeBottom} fixed>
                    <GradientStripe height={4} />
                </View>
            </Page>
        </Document>
    );
};

export default TestQuestionsPDF;
