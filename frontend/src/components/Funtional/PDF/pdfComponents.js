import { Image, Page, Text, View } from '@react-pdf/renderer';
import { ContentRenderer } from '../markdownParser';
import styles from '../styles';

// Helper function to format field ID for display in OTH context
const formatFieldIdForDisplay = (fieldId, contextType) => {
  // For OTH type, convert I.00, I.01, etc. to 00, 01, etc.
  if (
    contextType === 'OTH' &&
    fieldId &&
    fieldId.startsWith('I.') &&
    fieldId.match(/^I\.\d{2}$/)
  ) {
    return fieldId.substring(2); // Remove "I." prefix
  }
  return fieldId;
};

// Function to render a Section Table with potential markdown tables in content
export const SectionTable = ({ items, contextType }) => {
  return (
    <>
      {/* Table header */}
      <View>
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <View style={styles.tableColN}>
            <Text style={styles.text}>N</Text>
          </View>
          <View style={styles.tableColField}>
            <Text style={styles.text}>Field</Text>
          </View>
          <View style={styles.tableColContent}>
            <Text style={styles.text}>Content</Text>
          </View>
        </View>
      </View>

      {/* Table rows - using different styles for continuous appearance */}
      {items.map((item, index) => {
        // Determine the appropriate style based on position
        let tableStyle;
        if (items.length === 1) {
          tableStyle = styles.tableSingle; // Only one item
        } else if (index === 0) {
          tableStyle = styles.tableMiddle; // First item (header is separate)
        } else if (index === items.length - 1) {
          tableStyle = styles.tableLast; // Last item
        } else {
          tableStyle = styles.tableMiddle; // Middle items
        }
        const itemKey = item.key;
        const displayKey = formatFieldIdForDisplay(itemKey, contextType);
        const fieldName = item.value.field_name || '';
        // Use original content; list rendering is handled in ContentRenderer
        const fieldContent = item.value.field_text || '';

        return (
          <View key={index}>
            <View style={styles.tableRow}>
              <View style={styles.tableColN}>
                <Text style={styles.text}>{displayKey}</Text>
              </View>
              <View style={styles.tableColField}>
                <Text style={styles.text}>{fieldName}</Text>
              </View>
              <View style={styles.tableColContent}>
                <ContentRenderer content={fieldContent} />
              </View>
            </View>
          </View>
        );
      })}
    </>
  );
};

export const PageHeader = () => (
  <Image
    src={`${process.env.PUBLIC_URL}/header.jpg`}
    style={styles.headerImage}
    fixed
  />
);

export const PageFooter = () => (
  <>
    <Image
      src={`${process.env.PUBLIC_URL}/footer.jpg`}
      style={styles.footerImage}
      fixed
    />
    <Text style={styles.footer} fixed>
      Copyright © 2025 Audomate. All rights reserved.{'\n'}
    </Text>
  </>
);

export const TitlePage = ({ title, subtitle }) => (
  <Page size='A4' style={styles.titlePage}>
    <Text style={styles.titleText}>{title}</Text>
    <Text style={styles.subtitleText}>{subtitle}</Text>
    <Image src={`${process.env.PUBLIC_URL}/audomate-logo.png`} style={styles.logo} />
    <Text style={styles.footer}>
      Copyright © 2025 DeepTech. All rights reserved.
    </Text>
  </Page>
);
