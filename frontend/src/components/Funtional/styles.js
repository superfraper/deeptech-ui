import { Font, StyleSheet } from '@react-pdf/renderer';

// Register local Manrope fonts for PDF generation
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

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingTop: 70, // Increased top padding to accommodate header
    paddingBottom: 70, // Increased bottom padding to accommodate footer
    fontSize: 10,
    fontFamily: 'Manrope', // Back to Manrope with local fonts
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  titlePage: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Manrope', // Back to Manrope with local fonts
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitleText: {
    fontSize: 16,
    fontFamily: 'Manrope',
    textAlign: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 200, // Width of the logo
    height: 42.9, // Height to maintain aspect ratio (200 * (71/331) = 42.9)
    marginTop: 30,
    alignSelf: 'center',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 50, // Height adjusted for header image
  },
  footerImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 50, // Height adjusted for footer image
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginBottom: 10,
    marginTop: 15,
  },
  header: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: 'white',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 0, // Changed from 10 to 0 to remove gaps
  },
  tableFirst: {
    // Style for first table in a series
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 0,
    borderBottomWidth: 0, // No bottom border for first table
  },
  tableMiddle: {
    // Style for middle tables in a series
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 0,
    borderTopWidth: 0, // No top border
    borderBottomWidth: 0, // No bottom border
  },
  tableLast: {
    // Style for last table in a series
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10, // Add margin after the last table in a section
    borderTopWidth: 0, // No top border
  },
  tableSingle: {
    // Style for a table with only one row (standalone)
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10, // Add margin after standalone tables
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 30, // Minimum height for rows
  },
  tableHeaderRow: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  tableColN: {
    width: '8%',
    borderLeftWidth: 1,
    borderLeftColor: '#000',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 8, // Increased padding
  },
  tableColField: {
    width: '32%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 8, // Increased padding
  },
  tableColContent: {
    width: '60%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 8, // Increased padding
  },
  tableCell: {
    padding: 8, // Increased padding
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  tableCellLast: {
    padding: 8, // Increased padding
  },
  text: {
    fontSize: 10,
  },
  boldText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    right: 30,
    fontSize: 10, // Increased font size for better visibility
    fontWeight: 'bold', // Make it bold to stand out
    color: 'white',
    zIndex: 2000, // Increased z-index to ensure it appears above the footer image
  },
  link: {
    color: 'white',
    textDecoration: 'underline',
  },
  contentRow: {
    marginBottom: 3,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 10,
    marginRight: 5,
  },
  bulletContent: {
    flex: 1,
  },
  markdownHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    marginTop: 8,
    marginBottom: 8, // Increase the bottom margin for more space after headers
  },
  //JSON table styles
  tableContainer: {
    marginTop: 5,
    marginBottom: 5,
  },
  tableColAuto: {
    flex: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    padding: 4,
    minHeight: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
});

export default styles;
