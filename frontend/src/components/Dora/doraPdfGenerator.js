import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

// Register local Manrope font - supports Polish characters
Font.register({
  family: 'Manrope',
  fonts: [
    {
      src: '/fonts/Manrope/static/Manrope-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: '/fonts/Manrope/static/Manrope-Medium.ttf',
      fontWeight: 500,
    },
    {
      src: '/fonts/Manrope/static/Manrope-SemiBold.ttf',
      fontWeight: 600,
    },
    {
      src: '/fonts/Manrope/static/Manrope-Bold.ttf',
      fontWeight: 700,
    },
    {
      src: '/fonts/Manrope/static/Manrope-ExtraBold.ttf',
      fontWeight: 800,
    },
  ],
});

// Auditor information (hardcoded)
const auditorInfo = {
  name: 'mgr inż. Tomasz Mielnicki, CISSP',
  company: 'Deeptech Sp. z o.o.',
  address: 'Jabłoni 3, 03-071 Warsaw, Poland',
  email: 'info@deeptech.com',
  website: 'www.deeptech.com',
};

// Helper function to parse markdown-style text and return array of segments
const parseMarkdownText = (text) => {
  if (!text) return [{ text: '', bold: false }];
  
  const segments = [];
  // Pattern matches **bold text** and also handles * * patterns
  const pattern = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match (if any)
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        bold: false,
      });
    }
    // Add the bold text (without the asterisks)
    segments.push({
      text: match[1],
      bold: true,
    });
    lastIndex = pattern.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      bold: false,
    });
  }

  // If no segments were added, return the original text
  if (segments.length === 0) {
    segments.push({ text: text, bold: false });
  }

  return segments;
};

// Component to render text with markdown formatting
const MarkdownText = ({ children, style }) => {
  const segments = parseMarkdownText(children);
  
  return (
    <Text style={style}>
      {segments.map((segment, index) => (
        <Text
          key={index}
          style={segment.bold ? { fontWeight: 'bold' } : {}}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
};

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 50,
    paddingBottom: 70,
    fontSize: 10,
    fontFamily: 'Manrope',
  },
  titlePage: {
    padding: 50,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  titleContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginBottom: 30,
    textAlign: 'center',
    color: '#004494',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginTop: 20,
    marginBottom: 60,
    textAlign: 'center',
    color: '#333',
  },
  forLabel: {
    fontSize: 12,
    fontFamily: 'Manrope',
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  auditorSection: {
    marginTop: 40,
    textAlign: 'center',
  },
  auditorLabel: {
    fontSize: 10,
    fontFamily: 'Manrope',
    color: '#666',
    marginBottom: 5,
  },
  auditorName: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    color: '#333',
  },
  auditorCompany: {
    fontSize: 10,
    fontFamily: 'Manrope',
    color: '#333',
    marginTop: 3,
  },
  versionInfo: {
    fontSize: 10,
    fontFamily: 'Manrope',
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  titleFooter: {
    borderTop: '1px solid #ccc',
    paddingTop: 15,
    marginTop: 30,
  },
  contactInfo: {
    fontSize: 9,
    fontFamily: 'Manrope',
    color: '#666',
    textAlign: 'center',
    marginBottom: 3,
  },
  confidentialBadge: {
    marginTop: 20,
    padding: 8,
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
  },
  confidentialText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    color: '#666',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginTop: 20,
    marginBottom: 12,
    color: '#004494',
    borderBottom: '2px solid #004494',
    paddingBottom: 5,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginBottom: 15,
    color: '#004494',
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginTop: 15,
    marginBottom: 8,
    color: '#333',
  },
  text: {
    fontSize: 10,
    fontFamily: 'Manrope',
    marginBottom: 8,
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  textBold: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginBottom: 8,
    lineHeight: 1.6,
  },
  italicText: {
    fontSize: 10,
    fontFamily: 'Manrope',
    marginBottom: 8,
    lineHeight: 1.6,
    textAlign: 'justify',
    color: '#444',
  },
  questionText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginTop: 10,
    marginBottom: 5,
    color: '#1a1a1a',
  },
  answerText: {
    fontSize: 10,
    fontFamily: 'Manrope',
    marginBottom: 10,
    marginLeft: 15,
    lineHeight: 1.6,
    textAlign: 'justify',
    color: '#333',
  },
  zagadnienieBox: {
    marginTop: 10,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderLeft: '3px solid #004494',
  },
  zagadnienieTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginBottom: 5,
    color: '#004494',
  },
  // Table styles for methodology
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 15,
    marginBottom: 15,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#004494',
  },
  tableHeaderCell: {
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    color: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#fff',
  },
  tableCell: {
    padding: 8,
    fontSize: 9,
    fontFamily: 'Manrope',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  tableCellRating: {
    width: '25%',
    fontWeight: 'bold',
  },
  tableCellDescription: {
    width: '75%',
  },
  // Compliance rating badge
  ratingBadge: {
    padding: 4,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 3,
    marginLeft: 15,
    marginBottom: 8,
    display: 'flex',
    flexDirection: 'row',
  },
  ratingSpelnienie: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  ratingCzesciowe: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  ratingBrak: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  ratingNieDotyczy: {
    backgroundColor: '#e2e3e5',
    color: '#383d41',
  },
  ratingText: {
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
  },
  // Statistics
  statsContainer: {
    marginTop: 15,
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  statBullet: {
    fontSize: 10,
    fontFamily: 'Manrope',
    marginRight: 8,
  },
  statText: {
    fontSize: 10,
    fontFamily: 'Manrope',
  },
  // List items
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    marginLeft: 10,
  },
  listBullet: {
    fontSize: 10,
    fontFamily: 'Manrope',
    marginRight: 8,
    width: 15,
  },
  listText: {
    fontSize: 10,
    fontFamily: 'Manrope',
    flex: 1,
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    fontFamily: 'Manrope',
    color: '#666',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 50,
    fontSize: 8,
    fontFamily: 'Manrope',
    color: '#666',
  },
  // TOC styles
  tocItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tocNumber: {
    fontSize: 10,
    fontFamily: 'Manrope',
    width: 25,
  },
  tocTitle: {
    fontSize: 10,
    fontFamily: 'Manrope',
    flex: 1,
  },
});

// Helper function to group results by category
const groupResultsByCategory = (results) => {
  const grouped = {
    wymagania: [],
    narzedzia: [],
    dokumenty: [],
  };

  if (!results) return grouped;

  results.forEach((zagadnienie) => {
    const kategoria = zagadnienie.kategoria || 'wymagania';
    if (grouped[kategoria]) {
      grouped[kategoria].push(zagadnienie);
    } else {
      grouped.wymagania.push(zagadnienie);
    }
  });

  return grouped;
};

// Helper function to calculate compliance statistics
const calculateComplianceStats = (results) => {
  const stats = {
    spelnienie: 0,
    czesciowe: 0,
    brak: 0,
    brakMozliwosci: 0,
    nieDotyczy: 0,
    total: 0,
  };

  if (!results) return stats;

  results.forEach((zagadnienie) => {
    if (zagadnienie.answers) {
      zagadnienie.answers.forEach((answer) => {
        stats.total++;
        const rating = answer.compliance_rating?.toUpperCase() || '';
        
        if (rating.includes('SPEŁNIENIE') && !rating.includes('CZĘŚCIOWE') && !rating.includes('BRAK')) {
          stats.spelnienie++;
        } else if (rating.includes('CZĘŚCIOWE')) {
          stats.czesciowe++;
        } else if (rating.includes('BRAK SPEŁNIENIA')) {
          stats.brak++;
        } else if (rating.includes('BRAK MOŻLIWOŚCI') || rating.includes('NIE DOTYCZY')) {
          stats.brakMozliwosci++;
        } else {
          stats.brakMozliwosci++;
        }
      });
    }
  });

  return stats;
};

// Helper function to get rating style
const getRatingStyle = (rating) => {
  if (!rating) return styles.ratingNieDotyczy;
  const ratingUpper = rating.toUpperCase();
  
  if (ratingUpper.includes('SPEŁNIENIE') && !ratingUpper.includes('CZĘŚCIOWE') && !ratingUpper.includes('BRAK')) {
    return styles.ratingSpelnienie;
  } else if (ratingUpper.includes('CZĘŚCIOWE')) {
    return styles.ratingCzesciowe;
  } else if (ratingUpper.includes('BRAK SPEŁNIENIA')) {
    return styles.ratingBrak;
  }
  return styles.ratingNieDotyczy;
};

// Document component
const DoraPDFDocument = ({ auditData }) => {
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('pl-PL');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pl-PL');
    } catch {
      return dateString;
    }
  };

  const companyName = auditData.questionnaire_data?.companyName || 'Podmiot Finansowy';
  const stats = calculateComplianceStats(auditData.results);
  const documentCount = auditData.questionnaire_data?.documents?.length || 0;
  const groupedResults = groupResultsByCategory(auditData.results);

  return (
    <Document>
      {/* Title Page */}
      <Page size='A4' style={styles.titlePage}>
        <View style={styles.titleContent}>
          <Text style={styles.mainTitle}>
            Raport z audytu zgodności{'\n'}z Rozporządzeniem DORA
          </Text>
          
          <Text style={styles.forLabel}>dla</Text>
          
          <Text style={styles.companyName}>{companyName}</Text>
          
          <View style={styles.auditorSection}>
            <Text style={styles.auditorLabel}>Przygotował:</Text>
            <Text style={styles.auditorName}>{auditorInfo.name}</Text>
            <Text style={styles.auditorCompany}>{auditorInfo.company}</Text>
          </View>
          
          <Text style={styles.versionInfo}>
            Wersja 1.0 z dnia {formatShortDate(auditData.created_at)}
          </Text>
        </View>
        
        <View style={styles.titleFooter}>
          <Text style={styles.contactInfo}>{auditorInfo.website}</Text>
          <Text style={styles.contactInfo}>{auditorInfo.company}</Text>
          <Text style={styles.contactInfo}>{auditorInfo.address}</Text>
          <Text style={styles.contactInfo}>{auditorInfo.email}</Text>
          
          <View style={styles.confidentialBadge}>
            <Text style={styles.confidentialText}>Confidential - Poufne</Text>
          </View>
        </View>
      </Page>

      {/* Table of Contents */}
      <Page size='A4' style={styles.page}>
        <Text style={styles.chapterTitle}>Spis treści</Text>
        
        <View style={styles.tocItem}>
          <Text style={styles.tocNumber}>1.</Text>
          <Text style={styles.tocTitle}>Wstęp</Text>
        </View>
        <View style={styles.tocItem}>
          <Text style={styles.tocNumber}>2.</Text>
          <Text style={styles.tocTitle}>Metodyka oceny</Text>
        </View>
        <View style={styles.tocItem}>
          <Text style={styles.tocNumber}>3.</Text>
          <Text style={styles.tocTitle}>Podsumowanie do kierownictwa</Text>
        </View>
        <View style={styles.tocItem}>
          <Text style={styles.tocNumber}>4.</Text>
          <Text style={styles.tocTitle}>Zakres wykonanych prac</Text>
        </View>
        <View style={styles.tocItem}>
          <Text style={styles.tocNumber}>5.</Text>
          <Text style={styles.tocTitle}>Wyniki audytu - Wymagania DORA</Text>
        </View>
        <View style={styles.tocItem}>
          <Text style={styles.tocNumber}>6.</Text>
          <Text style={styles.tocTitle}>Narzędzia ICT</Text>
        </View>
        <View style={styles.tocItem}>
          <Text style={styles.tocNumber}>7.</Text>
          <Text style={styles.tocTitle}>Dokumentacja</Text>
        </View>
        <View style={styles.tocItem}>
          <Text style={styles.tocNumber}>8.</Text>
          <Text style={styles.tocTitle}>Podsumowanie i zalecenia końcowe</Text>
        </View>
        
        <View style={styles.confidentialBadge}>
          <Text style={styles.confidentialText}>Confidential - Poufne</Text>
        </View>
        
        <Text style={styles.footer}>
          {auditorInfo.website}
        </Text>
      </Page>

      {/* Chapter 1: Introduction */}
      <Page size='A4' style={styles.page}>
        <Text style={styles.chapterTitle}>1. Wstęp</Text>
        
        <Text style={styles.text}>
          Niniejszy raport jest wynikiem prac realizowanych w ramach audytu zgodności podmiotu {companyName} (dalej Podmiot) z wymaganiami Rozporządzenia DORA, przeprowadzonego przez {auditorInfo.company} (dalej Audytor).
        </Text>
        
        <Text style={styles.text}>
          Raport przedstawia podsumowanie prac wykonanych w dniu {formatDate(auditData.created_at)}, polegających na analizie otrzymanej dokumentacji związanej z działalnością i infrastrukturą teleinformatyczną Podmiotu oraz odpowiedzi na kwestionariusz pod kątem stwierdzenia zgodności funkcjonowania Podmiotu z wymaganiami zawartymi w dokumencie pn.
        </Text>
        
        <Text style={[styles.italicText, { marginTop: 10, marginBottom: 10 }]}>
          Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2022/2554 z dnia 14 grudnia 2022 r. w sprawie operacyjnej odporności cyfrowej sektora finansowego i zmieniające rozporządzenia (WE) nr 1060/2009, (UE) nr 648/2012, (UE) nr 600/2014, (UE) nr 909/2014 oraz (UE) 2016/1011
        </Text>
        
        <Text style={styles.text}>
          zwanym dalej Rozporządzeniem.
        </Text>
        
        <Text style={[styles.text, { marginTop: 15 }]}>
          W niniejszym raporcie nie wyrażamy opinii na temat zagadnień nieobjętych zakresem zrealizowanych przez nas prac, a w szczególności dokumentacji, której nie otrzymaliśmy do oceny, nawet jeśli taka dokumentacja istnieje.
        </Text>
        
        <Text style={[styles.text, { marginTop: 15 }]}>
          Raport z audytu ma na celu zwrócenie uwagi kierownictwa Podmiotu na zidentyfikowane niezgodności oraz wskazanie możliwych działań zaradczych, które kierownictwo powinno rozważyć w momencie podejmowania decyzji o sposobie postępowania z niezgodnościami.
        </Text>
        
        <View style={styles.confidentialBadge}>
          <Text style={styles.confidentialText}>Confidential - Poufne</Text>
        </View>
        
        <Text style={styles.footer}>{auditorInfo.website}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Strona ${pageNumber}`} fixed />
      </Page>

      {/* Chapter 2: Methodology */}
      <Page size='A4' style={styles.page}>
        <Text style={styles.chapterTitle}>2. Metodyka oceny</Text>
        
        <Text style={styles.text}>
          Ocena zgodności z Rozporządzeniem została dokonana w następujących krokach:
        </Text>
        
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>1.</Text>
          <Text style={styles.listText}>weryfikacja rodzaju Podmiotu względem definicji i kategorii stosowanych w Rozporządzeniu,</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>2.</Text>
          <Text style={styles.listText}>ustalenie listy wymagań mających zastosowanie dla Podmiotu wynikających z jego rodzaju,</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>3.</Text>
          <Text style={styles.listText}>weryfikacja i ocena spełnienia w/w wymagań przez Podmiot.</Text>
        </View>
        
        <Text style={[styles.text, { marginTop: 15 }]}>
          Ocena spełnienia wymagań (zgodnie z p. 3) została dokonana w skali trzystopniowej zdefiniowanej poniżej:
        </Text>
        
        {/* Methodology Table */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.tableCellRating]}>OCENA</Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellDescription, { borderRightWidth: 0 }]}>OPIS</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableCellRating, { backgroundColor: '#f8d7da', color: '#721c24' }]}>BRAK SPEŁNIENIA</Text>
            <Text style={[styles.tableCell, styles.tableCellDescription]}>Stwierdzono brak dokumentów lub zapisów w otrzymanych dokumentach spełniających dane wymaganie. Analiza dokumentacji potwierdziła brak realizacji wymagania.</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableCellRating, { backgroundColor: '#fff3cd', color: '#856404' }]}>CZĘŚCIOWE SPEŁNIENIE</Text>
            <Text style={[styles.tableCell, styles.tableCellDescription]}>Stwierdzono istnienie dokumentów lub zapisów w otrzymanych dokumentach częściowo spełniających dane wymaganie. Analiza dokumentacji potwierdziła częściową realizację wymagania.</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableCellRating, { backgroundColor: '#d4edda', color: '#155724' }]}>SPEŁNIENIE</Text>
            <Text style={[styles.tableCell, styles.tableCellDescription, { borderBottomWidth: 0 }]}>Stwierdzono istnienie dokumentów lub zapisów w otrzymanych dokumentach spełniających dane wymaganie. Analiza dokumentacji potwierdziła realizację wymagania.</Text>
          </View>
        </View>
        
        <View style={styles.confidentialBadge}>
          <Text style={styles.confidentialText}>Confidential - Poufne</Text>
        </View>
        
        <Text style={styles.footer}>{auditorInfo.website}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Strona ${pageNumber}`} fixed />
      </Page>

      {/* Chapter 3: Executive Summary */}
      <Page size='A4' style={styles.page}>
        <Text style={styles.chapterTitle}>3. Podsumowanie do kierownictwa</Text>
        
        <Text style={styles.text}>
          W wyniku przeprowadzonych prac zidentyfikowany został szereg niezgodności lub braków, do których kierownictwo Podmiotu powinno się odnieść, podejmując decyzje w zakresie dalszego postępowania w obszarze organizacji działalności, dokumentacji, procedur i procesów.
        </Text>
        
        <Text style={[styles.text, { marginTop: 10 }]}>
          W oparciu o przeprowadzone prace zaobserwowano:
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statBullet}>•</Text>
            <Text style={styles.statText}>całkowity brak zgodności z {stats.brak} wymaganiami,</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statBullet}>•</Text>
            <Text style={styles.statText}>częściowy brak zgodności z {stats.czesciowe} wymaganiami,</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statBullet}>•</Text>
            <Text style={styles.statText}>zgodność z {stats.spelnienie} wymaganiami,</Text>
          </View>
        </View>
        
        <Text style={styles.text}>
          Jednocześnie stwierdzono brak możliwości oceny dla {stats.brakMozliwosci} wymagań.
        </Text>
        
        <Text style={[styles.text, { marginTop: 15 }]}>
          Szczegółowy opis wyników przeprowadzonej analizy przedstawiono w rozdziałach 5-7 niniejszego raportu:
        </Text>
        
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listText}>Rozdział 5 - Wymagania DORA ({groupedResults.wymagania.length} wymagań)</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listText}>Rozdział 6 - Narzędzia ICT ({groupedResults.narzedzia.length} narzędzi)</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listText}>Rozdział 7 - Dokumentacja ({groupedResults.dokumenty.length} dokumentów)</Text>
        </View>
        
        <Text style={[styles.text, { marginTop: 15 }]}>
          Podsumowując wykonaną pracę, na wstępie stwierdzono, że {auditData.questionnaire_data?.isMicroenterprise === 'Tak' ? 'podmiot jest mikroprzedsiębiorcą' : 'podmiot nie jest mikroprzedsiębiorcą'}. {auditData.questionnaire_data?.canUseSimplifiedFramework === 'Tak' ? 'Podmiot może stosować uproszczone ramy zarządzania ryzykiem.' : 'W stosunku do Podmiotu mają zastosowanie wszystkie zasadnicze wymagania w zakresie cyfrowej odporności operacyjnej wynikające z Rozporządzenia DORA.'}
        </Text>
        
        <Text style={styles.subsectionTitle}>Ogólne zalecenia</Text>
        
        <Text style={styles.text}>
          Zaleca się wprowadzenie całościowego systemu zarządzania ryzykiem, którego częścią będą ramy zarządzania ryzykiem w obszarze ICT. W tym celu należy wprowadzić dokument opisujący system zarządzania ryzykiem w Spółce. Należy przeprowadzić kompleksowe analizy ryzyka dla wszystkich możliwych scenariuszy ryzyka i cyberataków.
        </Text>
        
        <Text style={styles.text}>
          W zakresie ram zarządzania ryzykiem w obszarze ICT, Rozporządzenie kładzie duży nacisk na posiadanie dokumentacji w postaci strategii, polityk, planów i procedur oraz dokumentacji technicznej środowiska teleinformatycznego.
        </Text>
        
        <View style={styles.confidentialBadge}>
          <Text style={styles.confidentialText}>Confidential - Poufne</Text>
        </View>
        
        <Text style={styles.footer}>{auditorInfo.website}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Strona ${pageNumber}`} fixed />
      </Page>

      {/* Chapter 4: Scope of Work */}
      <Page size='A4' style={styles.page}>
        <Text style={styles.chapterTitle}>4. Zakres wykonanych prac</Text>
        
        <Text style={styles.text}>
          W toku prac przeprowadzono analizę otrzymanej dokumentacji związanej z organizacją Podmiotu, bezpieczeństwem informacji i środowiskiem teleinformatycznym. Łącznie przeanalizowano {documentCount > 0 ? documentCount : 'otrzymane'} dokument{documentCount === 1 ? '' : documentCount > 1 && documentCount < 5 ? 'y' : 'ów'}. Przeprowadzono także analizę odpowiedzi na kwestionariusz mającą na celu potwierdzenie prawidłowości zrozumienia działalności Podmiotu.
        </Text>
        
        <Text style={[styles.text, { marginTop: 15 }]}>
          Na tej podstawie stworzono niniejszy raport (dalej Raport).
        </Text>
        
        <Text style={[styles.text, { marginTop: 15 }]}>
          W rozdziale 5 zaprezentowano wymagania mające zastosowanie dla Podmiotu wraz z obserwacjami i zaleceniami Audytora.
        </Text>
        
        <Text style={[styles.text, { marginTop: 10 }]}>
          W Raporcie zaprezentowano wykaz przepisów/wymagań Rozporządzenia DORA, wraz z ich podstawową treścią, a także weryfikację posiadania wymaganych narzędzi ICT oraz dokumentacji. Każde wymaganie wyszczególnione w Raporcie posiada szereg szczegółowych wymagań i komentarzy w treści Rozporządzenia lub dokumentach niższego szczebla (tzw. aktach delegowanych), które nie są przytoczone w Raporcie, ale były wzięte pod uwagę przez Audytora.
        </Text>
        
        <Text style={[styles.text, { marginTop: 15 }]}>
          Dla każdego wymagania Rozporządzenia dokonano krótkiego opisu obserwacji Audytora (Obserwacje), przedstawiono stanowisko dotyczące stopnia zgodności (Ocena) zgodnie z metodyką przyjętą w rozdziale 2 oraz zaprezentowano zalecenia dotyczące ewentualnych działań naprawczych (Zalecenia).
        </Text>
        
        <View style={styles.confidentialBadge}>
          <Text style={styles.confidentialText}>Confidential - Poufne</Text>
        </View>
        
        <Text style={styles.footer}>{auditorInfo.website}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Strona ${pageNumber}`} fixed />
      </Page>

      {/* Chapter 5: Audit Results - Wymagania DORA */}
      <Page size='A4' style={styles.page}>
        <Text style={styles.chapterTitle}>5. Wyniki audytu - Wymagania DORA</Text>
        
        <Text style={styles.text}>
          Poniżej przedstawiono szczegółowe wyniki audytu dla {groupedResults.wymagania.length} wymagań Rozporządzenia DORA.
        </Text>
        
        <View style={styles.confidentialBadge}>
          <Text style={styles.confidentialText}>Confidential - Poufne</Text>
        </View>
        
        <Text style={styles.footer}>{auditorInfo.website}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Strona ${pageNumber}`} fixed />
      </Page>

      {/* Wymagania DORA Results Pages */}
      {groupedResults.wymagania.map((zagadnienie, idx) => (
          <Page size='A4' style={styles.page} key={`wymagania-${idx}`}>
            <Text style={styles.sectionTitle}>
              {zagadnienie.artykul 
                ? `5.${idx + 1}. Artykuł ${zagadnienie.artykul}${zagadnienie.nr_wymagania ? ` (Wymaganie ${zagadnienie.nr_wymagania})` : ''}`
                : `5.${idx + 1}. Wymaganie ${zagadnienie.nr_wymagania || (idx + 1)}`
              }
            </Text>

            <View style={styles.zagadnienieBox}>
              <Text style={styles.zagadnienieTitle}>
                {zagadnienie.zagadnienie_dora}
              </Text>
            </View>

            {zagadnienie.answers &&
              zagadnienie.answers.map((answer, ansIdx) => (
                <View key={ansIdx} style={{ marginBottom: 15 }}>
                  <Text style={styles.questionText}>
                    Pytanie: {answer.question}
                  </Text>
                  <MarkdownText style={styles.answerText}>
                    {`Obserwacje: ${answer.answer}`}
                  </MarkdownText>
                  
                  {/* Compliance Rating Badge */}
                  {answer.compliance_rating && (
                    <View style={[styles.ratingBadge, getRatingStyle(answer.compliance_rating)]}>
                      <Text style={styles.ratingText}>
                        Ocena: {answer.compliance_rating}
                      </Text>
                    </View>
                  )}
                  
                  {answer.confident === false && !answer.compliance_rating && (
                    <Text
                      style={[
                        styles.text,
                        { marginLeft: 15, color: '#666', fontSize: 9 },
                      ]}
                    >
                      Uwaga: Odpowiedź oparta na ograniczonych danych
                    </Text>
                  )}
                </View>
              ))}

            <View style={styles.confidentialBadge}>
              <Text style={styles.confidentialText}>Confidential - Poufne</Text>
            </View>
            
            <Text style={styles.footer}>{auditorInfo.website}</Text>
            <Text style={styles.pageNumber} render={({ pageNumber }) => `Strona ${pageNumber}`} fixed />
          </Page>
        ))}

      {/* Chapter 6: Narzędzia ICT */}
      {groupedResults.narzedzia.length > 0 && (
        <Page size='A4' style={styles.page}>
          <Text style={styles.chapterTitle}>6. Narzędzia ICT</Text>
          
          <Text style={styles.text}>
            W tej sekcji przedstawiono wyniki weryfikacji posiadania przez Podmiot wymaganych narzędzi ICT zgodnie z Rozporządzeniem DORA. Łącznie zweryfikowano {groupedResults.narzedzia.length} narzędzi.
          </Text>
          
          <View style={styles.confidentialBadge}>
            <Text style={styles.confidentialText}>Confidential - Poufne</Text>
          </View>
          
          <Text style={styles.footer}>{auditorInfo.website}</Text>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `Strona ${pageNumber}`} fixed />
        </Page>
      )}

      {/* Narzędzia ICT Results Pages */}
      {groupedResults.narzedzia.map((zagadnienie, idx) => (
          <Page size='A4' style={styles.page} key={`narzedzia-${idx}`}>
            <Text style={styles.sectionTitle}>
              {`6.${idx + 1}. ${zagadnienie.zagadnienie_dora}`}
            </Text>

            <View style={styles.zagadnienieBox}>
              <Text style={styles.zagadnienieTitle}>
                Wymagane narzędzie: {zagadnienie.zagadnienie_dora}
              </Text>
            </View>

            {zagadnienie.answers &&
              zagadnienie.answers.map((answer, ansIdx) => (
                <View key={ansIdx} style={{ marginBottom: 15 }}>
                  <Text style={styles.questionText}>
                    Pytanie: {answer.question}
                  </Text>
                  <MarkdownText style={styles.answerText}>
                    {`Obserwacje: ${answer.answer}`}
                  </MarkdownText>
                  
                  {/* Compliance Rating Badge */}
                  {answer.compliance_rating && (
                    <View style={[styles.ratingBadge, getRatingStyle(answer.compliance_rating)]}>
                      <Text style={styles.ratingText}>
                        Ocena: {answer.compliance_rating}
                      </Text>
                    </View>
                  )}
                  
                  {answer.confident === false && !answer.compliance_rating && (
                    <Text
                      style={[
                        styles.text,
                        { marginLeft: 15, color: '#666', fontSize: 9 },
                      ]}
                    >
                      Uwaga: Odpowiedź oparta na ograniczonych danych
                    </Text>
                  )}
                </View>
              ))}

            <View style={styles.confidentialBadge}>
              <Text style={styles.confidentialText}>Confidential - Poufne</Text>
            </View>
            
            <Text style={styles.footer}>{auditorInfo.website}</Text>
            <Text style={styles.pageNumber} render={({ pageNumber }) => `Strona ${pageNumber}`} fixed />
          </Page>
        ))}

      {/* Chapter 7: Dokumentacja */}
      {groupedResults.dokumenty.length > 0 && (
        <Page size='A4' style={styles.page}>
          <Text style={styles.chapterTitle}>7. Dokumentacja</Text>
          
          <Text style={styles.text}>
            W tej sekcji przedstawiono wyniki weryfikacji posiadania przez Podmiot wymaganej dokumentacji zgodnie z Rozporządzeniem DORA. Łącznie zweryfikowano {groupedResults.dokumenty.length} dokumentów.
          </Text>
          
          <View style={styles.confidentialBadge}>
            <Text style={styles.confidentialText}>Confidential - Poufne</Text>
          </View>
          
          <Text style={styles.footer}>{auditorInfo.website}</Text>
          <Text style={styles.pageNumber} render={({ pageNumber }) => `Strona ${pageNumber}`} fixed />
        </Page>
      )}

      {/* Dokumentacja Results Pages */}
      {groupedResults.dokumenty.map((zagadnienie, idx) => (
          <Page size='A4' style={styles.page} key={`dokumenty-${idx}`}>
            <Text style={styles.sectionTitle}>
              {`7.${idx + 1}. ${zagadnienie.zagadnienie_dora}`}
            </Text>

            <View style={styles.zagadnienieBox}>
              <Text style={styles.zagadnienieTitle}>
                Wymagany dokument: {zagadnienie.zagadnienie_dora}
              </Text>
            </View>

            {zagadnienie.answers &&
              zagadnienie.answers.map((answer, ansIdx) => (
                <View key={ansIdx} style={{ marginBottom: 15 }}>
                  <Text style={styles.questionText}>
                    Pytanie: {answer.question}
                  </Text>
                  <MarkdownText style={styles.answerText}>
                    {`Obserwacje: ${answer.answer}`}
                  </MarkdownText>
                  
                  {/* Compliance Rating Badge */}
                  {answer.compliance_rating && (
                    <View style={[styles.ratingBadge, getRatingStyle(answer.compliance_rating)]}>
                      <Text style={styles.ratingText}>
                        Ocena: {answer.compliance_rating}
                      </Text>
                    </View>
                  )}
                  
                  {answer.confident === false && !answer.compliance_rating && (
                    <Text
                      style={[
                        styles.text,
                        { marginLeft: 15, color: '#666', fontSize: 9 },
                      ]}
                    >
                      Uwaga: Odpowiedź oparta na ograniczonych danych
                    </Text>
                  )}
                </View>
              ))}

            <View style={styles.confidentialBadge}>
              <Text style={styles.confidentialText}>Confidential - Poufne</Text>
            </View>
            
            <Text style={styles.footer}>{auditorInfo.website}</Text>
            <Text style={styles.pageNumber} render={({ pageNumber }) => `Strona ${pageNumber}`} fixed />
          </Page>
        ))}

      {/* Final Summary Page */}
      <Page size='A4' style={styles.page}>
        <Text style={styles.chapterTitle}>8. Podsumowanie i zalecenia końcowe</Text>

        <Text style={styles.text}>
          Raport audytu DORA został ukończony. Przeanalizowano {auditData.total_zagadnienia || stats.total} zagadnień określonych w Rozporządzeniu.
        </Text>

        <Text style={styles.subsectionTitle}>Zalecenia ogólne</Text>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>1.</Text>
          <Text style={styles.listText}>Należy regularnie aktualizować dokumentację dotyczącą systemów ICT i zarządzania ryzykiem.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>2.</Text>
          <Text style={styles.listText}>Zaleca się okresowy przegląd polityk i procedur zgodności z DORA.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>3.</Text>
          <Text style={styles.listText}>Należy zapewnić ciągłe szkolenia dla kadry zarządzającej w zakresie wymogów DORA.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>4.</Text>
          <Text style={styles.listText}>Należy monitorować zmiany w przepisach i dostosowywać procedury w miarę potrzeb.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>5.</Text>
          <Text style={styles.listText}>Podmiot powinien posiadać formalne zatwierdzenia dokumentów na odpowiednim poziomie w zależności od rodzaju dokumentów.</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.listBullet}>6.</Text>
          <Text style={styles.listText}>Zaleca się prowadzenie okresowych (zwykle co najmniej raz do roku) przeglądów i aktualizacji kluczowych dokumentów i planów.</Text>
        </View>

        <Text style={[styles.text, { marginTop: 30, fontSize: 9, color: '#555' }]}>
          Niniejszy raport został wygenerowany na podstawie przesłanych dokumentów i odpowiedzi na kwestionariusz. Zaleca się konsultację z ekspertami ds. zgodności regulacyjnej w celu pełnej interpretacji wyników i wdrożenia działań naprawczych.
        </Text>

        <View style={styles.confidentialBadge}>
          <Text style={styles.confidentialText}>Confidential - Poufne</Text>
        </View>
        
        <Text style={styles.footer}>{auditorInfo.website}</Text>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Strona ${pageNumber}`} fixed />
      </Page>
    </Document>
  );
};

// Function to generate and save PDF
export const generateDoraPDF = async (auditData) => {
  try {
    const blob = await pdf(<DoraPDFDocument auditData={auditData} />).toBlob();
    const companyName = auditData.questionnaire_data?.companyName || 'Podmiot';
    const safeCompanyName = companyName.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]/g, '').replace(/\s+/g, '_');
    const fileName = `DORA_Audit_${safeCompanyName}_${new Date().toISOString().slice(0, 10)}.pdf`;
    saveAs(blob, fileName);
    return true;
  } catch (error) {
    console.error('Error generating DORA PDF:', error);
    return false;
  }
};
