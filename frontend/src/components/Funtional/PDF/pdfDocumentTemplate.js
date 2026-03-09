import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import styles from '../styles';
import { SectionTable } from './pdfComponents';

// Define section titles for different context types
const sectionTitles = {
  OTH: {
    A: 'Information about the offeror or the person seeking admission to trading',
    B: 'Information about the issuer, if different from the offeror or person seeking admission to trading',
    C: 'Information about the operator of the trading platform in cases where it draws up the crypto-asset white paper and information about other persons drawing the crypto-asset white paper pursuant to Article 6(1), second subparagraph, of Regulation (EU) 2023/1114',
    D: 'Information about the crypto-asset project',
    E: 'Information about the offer to the public of crypto-assets or their admission to trading',
    F: 'Information about the crypto-assets',
    G: 'Information on the rights and obligations attached to the crypto-assets',
    H: 'Information on the underlying technology',
    I: 'Information on risks',
    J: 'Information on the sustainability indicators in relation to adverse impact on the climate and other environment-related adverse impacts',
  },
  ART: {
    A: 'Information about the issuer of the asset-referenced token',
    AA: 'Information on other persons offering to the public or seeking admission to trading of asset-referenced tokens',
    B: 'Information about the asset-referenced token',
    C: 'Information about the offer to the public of the asset-referenced token or its admission to trading',
    D: 'Information on the rights and obligations attached to the asset-referenced token',
    E: 'Information on the underlying technology',
    F: 'Information on the risks',
    G: 'Information on the reserve of assets',
    H: 'Information on the sustainability indicators in relation to adverse impact on the climate and other environment-related adverse impacts',
  },
  EMT: {
    A: 'Information about the issuer of the e-money token',
    B: 'Information about the e-money token',
    C: 'Information about the offer to the public of the e-money token or its admission to trading',
    D: 'Information on the rights and obligations attached to e-money tokens',
    E: 'Information on the underlying technology',
    F: 'Information on the risks',
    G: 'Information on the sustainability indicators in relation to adverse impact on the climate and other environment-related adverse impacts',
  },
};

export { sectionISubsections };

// Special subsection titles for section I based on context type
const sectionISubsections = {
  OTH: {
    '00-06': 'I. Compliance with duties of information',
    '07-10': 'II. Summary',
    rest: 'Part I: Information on risks',
  },
  ART: {
    '00-03': 'I. Compliance with duties of information',
    '04-07': 'II. Summary',
  },
  EMT: {
    '00-04': 'I. Compliance with duties of information',
    '05-10': 'II. Summary',
  },
};

export const PDFDocument = ({
  formData,
  sectionsData,
  complianceItems,
  summaryItems,
  contextType = 'OTH',
}) => {
  const currentSectionTitles = sectionTitles[contextType] || sectionTitles.OTH;
  const currentSectionISubsections =
    sectionISubsections[contextType] || sectionISubsections.OTH;

  // Get compliance and summary section titles based on contextType
  let complianceTitle = null;
  let summaryTitle = null;
  if (contextType === 'EMT') {
    complianceTitle = currentSectionISubsections['00-04'];
    summaryTitle = currentSectionISubsections['05-10'];
  } else if (contextType === 'ART') {
    complianceTitle = currentSectionISubsections['00-03'];
    summaryTitle = currentSectionISubsections['04-07'];
  } else {
    // OTH or fallback
    complianceTitle = currentSectionISubsections['00-06'];
    summaryTitle = currentSectionISubsections['07-10'];
  }

  // Determine the token name for the title page based on contextType
  let tokenName = formData?.cryptoAssetName || 'Crypto Asset';
  if (!formData?.cryptoAssetName) {
    if (contextType === 'OTH') {
      const d2Item = sectionsData?.D?.find(item => item.key === 'D.2');
      tokenName = d2Item?.value?.field_text || 'Crypto Asset';
    } else if (contextType === 'ART') {
      const b1Item = sectionsData?.B?.find(item => item.key === 'B.1');
      tokenName = b1Item?.value?.field_text || 'Asset-referenced token';
    } else if (contextType === 'EMT') {
      const b1Item = sectionsData?.B?.find(item => item.key === 'B.1');
      tokenName = b1Item?.value?.field_text || 'E-money token';
    }
  }

  return (
    <Document>
      {/* Title page - no page number */}
      <Page size='A4' style={styles.titlePage}>
        <Text style={styles.titleText}>{tokenName} MiCA White Paper</Text>
        <Text style={styles.subtitleText}>
          Prepared with assistance from Audomate
        </Text>
        <Image
          src={`${process.env.PUBLIC_URL}/audomate-logo.png`}
          style={styles.logo}
        />
        <Text style={styles.footer}>
          Copyright © 2025 Audomate. All rights reserved.
        </Text>
      </Page>

      {/* Compliance section if exists */}
      {complianceItems.length > 0 && complianceTitle && (
        <Page size='A4' style={styles.page}>
          <Image
            src={`${process.env.PUBLIC_URL}/header.jpg`}
            style={styles.headerImage}
            fixed
          />
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>{complianceTitle}</Text>
            <SectionTable items={complianceItems} contextType={contextType} />
          </View>
          <Image
            src={`${process.env.PUBLIC_URL}/footer.jpg`}
            style={styles.footerImage}
            fixed
          />
          <Text
            style={styles.pageNumber}
            fixed
            render={({ pageNumber }) => pageNumber}
          />
          <Text style={styles.footer} fixed>
            Copyright © 2025 Audomate. All rights reserved.{'\n'}
          </Text>
        </Page>
      )}

      {/* Summary section if exists */}
      {summaryItems.length > 0 && summaryTitle && (
        <Page size='A4' style={styles.page}>
          <Image
            src={`${process.env.PUBLIC_URL}/header.jpg`}
            style={styles.headerImage}
            fixed
          />
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>{summaryTitle}</Text>
            <SectionTable items={summaryItems} contextType={contextType} />
          </View>
          <Image
            src={`${process.env.PUBLIC_URL}/footer.jpg`}
            style={styles.footerImage}
            fixed
          />
          <Text
            style={styles.pageNumber}
            fixed
            render={({ pageNumber }) => pageNumber}
          />
          <Text style={styles.footer} fixed>
            Copyright © 2025 Audomate. All rights reserved.{'\n'}
          </Text>
        </Page>
      )}

      {/* Regular sections */}
      {Object.keys(currentSectionTitles)
        .sort()
        .map(sectionLetter => {
          if (
            !sectionsData[sectionLetter] ||
            sectionsData[sectionLetter].length === 0
          ) {
            return null;
          }

          return (
            <Page key={sectionLetter} size='A4' style={styles.page}>
              <Image
                src={`${process.env.PUBLIC_URL}/header.jpg`}
                style={styles.headerImage}
                fixed
              />
              <View style={styles.contentContainer}>
                <Text style={styles.sectionTitle}>
                  {sectionLetter}. {currentSectionTitles[sectionLetter]}
                </Text>
                <SectionTable
                  items={sectionsData[sectionLetter]}
                  contextType={contextType}
                />
              </View>
              <Image
                src={`${process.env.PUBLIC_URL}/footer.jpg`}
                style={styles.footerImage}
                fixed
              />
              <Text
                style={styles.pageNumber}
                fixed
                render={({ pageNumber }) => pageNumber}
              />
              <Text style={styles.footer} fixed>
                Copyright © 2025 MiCA Crypto Alliance. All rights reserved.
                {'\n'}
                Email:{' '}
                <Text style={styles.link}>
                  contact@micacryptoalliance.com
                </Text>{' '}
                | Website:{' '}
                <Text style={styles.link}>www.micacryptoalliance.com</Text>
              </Text>
            </Page>
          );
        })}
    </Document>
  );
};
