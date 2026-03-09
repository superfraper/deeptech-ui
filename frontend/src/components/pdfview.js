import {
  Document,
  Image,
  Link,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import logoblack from '../images/logoblack.png';
import logowhite from '../images/logowhite.png';
import backgroundImage from '../images/page_1.jpg'; // Import your background image

const username = localStorage.getItem('tokenName');

// Define styles
const styles = StyleSheet.create({
  page: {
    backgroundImage: `url(${backgroundImage})`, // Add background image
    backgroundSize: 'cover', // Ensures the image covers the entire page
    backgroundPosition: 'center', // Centers the image
    padding: 20, // Optional padding if needed
  },
  headerSection: {
    backgroundColor: '#004494',
    padding: 40,
    color: '#fff',
    textAlign: 'center',
    height: '100%', // Make the section fill the entire page
    display: 'flex',
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
  },
  headerSection2: {
    //padding: 40,
    color: '#000',
    textAlign: 'center',
    height: '100%', // Make the section fill the entire page
    display: 'flex',
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
  },
  headerTitle2: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    padding: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Manrope',
    marginTop: 10,
  },
  bodySection: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 8,
    lineHeight: 1.6,
    color: '#333',
    marginBottom: 20,
    textAlign: 'left',
  },
  faqItem: {
    marginBottom: 10,
  },
  question: {
    fontSize: 10,
    fontWeight: 800,
    color: '#333',
  },
  answer: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#555',
    marginTop: 5,
  },
  footerSection: {
    backgroundColor: '#333',
    padding: 20,
    color: '#fff',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    color: '#004494',
    textDecoration: 'underline',
  },
  image: {
    width: 100,
    marginVertical: 20,
    alignSelf: 'center',
  },
});

const paginateContent = (content, pageHeight, lineHeight, maxCharsPerLine) => {
  const pages = [];
  let currentPage = [];
  let currentHeight = 0;

  content.forEach(item => {
    const question = item.question || ''; // Fallback to an empty string if null or undefined
    const answer = item.answer || ''; // Fallback to an empty string if null or undefined

    const questionLines = question
      .split('\n')
      .reduce((sum, line) => sum + Math.ceil(line.length / maxCharsPerLine), 0);
    const answerLines = answer
      .split('\n')
      .reduce((sum, line) => sum + Math.ceil(line.length / maxCharsPerLine), 0);
    const totalLines = questionLines + answerLines;

    const itemHeight = totalLines * lineHeight;

    // Check if adding the current item exceeds the page height
    if (currentHeight + itemHeight > pageHeight) {
      pages.push(currentPage);
      currentPage = [];
      currentHeight = 0;
    }

    currentPage.push(item);
    currentHeight += itemHeight;
  });

  // Add remaining items to the final page
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
};

const cleanData = rawData => {
  return rawData
    .replace(/\\n/g, ' ') // Replace newline escape characters with spaces
    .replace(/\\"/g, '"') // Replace escaped quotes with actual quotes
    .replace(/【\d+:\d+†source】/g, '') // Remove source references
    .replace(/<\/?[^>]+(>|$)/g, '') // Remove any HTML tags
    .replace(/[^\x20-\x7E]/g, '') // Remove non-ASCII characters
    .replace(/\*\*/g, '') // Remove the bold markdown stars '**'
    .trim(); // Trim leading and trailing spaces                  // Trim leading and trailing spaces
};

const cleanAllLocalStorage = () => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i); // Get the key
    const rawData = localStorage.getItem(key); // Get the data

    if (rawData) {
      const cleanedData = cleanData(rawData); // Clean the data
      localStorage.setItem(key, cleanedData); // Set the cleaned data back in localStorage
    }
  }
};

// Call the function to clean all localStorage data
cleanAllLocalStorage();

const PartD = [
  {
    question: 'D.1 Crypto-asset project name ?',
    answer:
      localStorage.getItem('response_thread_1_question_1') ||
      'No data available',
  },
  {
    question: 'D.2 Crypto-assets name',
    answer:
      localStorage.getItem('response_thread_2_question_1') ||
      'No data available',
  },
  {
    question: 'D.3 Abbreviation',
    answer:
      localStorage.getItem('response_thread_3_question_1') ||
      'No data available',
  },
  {
    question: 'D.4 Crypto-asset project description',
    answer:
      localStorage.getItem('response_thread_4_question_1') ||
      'No data available',
  },
  {
    question:
      'D.5 Details of all natural or legal persons involved in the implementation of the crypto-asset project',
    answer:
      (localStorage.getItem('response_thread_5_question_1') ||
        'No data available') +
      '\n' +
      (localStorage.getItem('response_thread_5_question_2') || '') +
      '\n' +
      (localStorage.getItem('response_thread_5_question_3') || ''),
  },
  {
    question:
      "D.6 Use the following questionnaire: https://lk648ntk1fo.typeform.com/utility to check whether the token is a utility token and answer 'Yes' or 'No' below",
    answer:
      localStorage.getItem('selectedOption') || localStorage.getItem('d6'),
  },
  {
    question: 'D.7 Key Features of Goods/Services for Utility Token Projects',
    answer:
      (localStorage.getItem('response_thread_6_question_1') ||
        'No data available') +
      '\n' +
      (localStorage.getItem('response_thread_6_question_2') || ''),
  },
  {
    question: 'D.8 Plans for the token',
    answer:
      localStorage.getItem('response_thread_7_question_1') ||
      'No data available',
  },
  {
    question: 'D.9 Resource Allocation',
    answer:
      (localStorage.getItem('response_thread_8_question_1') ||
        'No data available') +
      '\n' +
      (localStorage.getItem('response_thread_8_question_2') || ''),
  },
  {
    question: 'D.10 Planned Use of Collected Funds or Crypto-Asset',
    answer:
      localStorage.getItem('response_thread_9_question_1') ||
      'No data available',
  },
];
const PartG = [
  {
    question: 'G.1 Purchaser Rights and Obligations',
    answer:
      (localStorage.getItem('response_thread_10_question_1') ||
        'AI Is Detecting') +
        '\n' +
        (localStorage.getItem('response_thread_10_question_2') || '') ||
      'No data available',
  },
  {
    question: 'G.2 Exercise of Rights and obligations',
    answer:
      (localStorage.getItem('response_thread_11_question_1') ||
        'AI Is Detecting') +
      '\n' +
      (localStorage.getItem('response_thread_11_question_2') || '') +
      '\n' +
      (localStorage.getItem('response_thread_11_question_3') || '') +
      '\n' +
      (localStorage.getItem('response_thread_11_question_4') || '') +
      '\n' +
      (localStorage.getItem('response_thread_11_question_5') || '') +
      '\n' +
      (localStorage.getItem('response_thread_11_question_6') || '') +
      '\n' +
      (localStorage.getItem('response_thread_11_question_7') || ''),
  },
  {
    question: 'G.3 Conditions for modifications of rights and obligations',
    answer:
      (localStorage.getItem('response_thread_12_question_1') ||
        'AI Is Detecting') +
      '\n' +
      (localStorage.getItem('response_thread_12_question_2') || ''),
  },
  {
    question: 'G.4 Future Public Offers',
    answer:
      (localStorage.getItem('response_thread_13_question_1') ||
        'AI Is Detecting') +
      '\n' +
      (localStorage.getItem('response_thread_13_question_2') || ''),
  },
  {
    question: 'G.5 Issuer Retained Crypto-Assets',
    answer:
      (localStorage.getItem('response_thread_14_question_1') ||
        'AI Is Detecting') +
      '\n' +
      (localStorage.getItem('response_thread_14_question_2') || '') +
      '\n' +
      (localStorage.getItem('response_thread_14_question_3') || '') +
      '\n' +
      (localStorage.getItem('response_thread_14_question_4') || '') +
      '\n' +
      (localStorage.getItem('response_thread_14_question_5') || '') +
      '\n' +
      (localStorage.getItem('response_thread_14_question_6') || '') +
      '\n' +
      (localStorage.getItem('response_thread_14_question_7') || '') +
      '\n' +
      (localStorage.getItem('response_thread_14_question_8') || '') +
      '\n' +
      (localStorage.getItem('response_thread_14_question_9') || '') +
      '\n' +
      (localStorage.getItem('response_thread_14_question_10') || '') +
      '\n' +
      (localStorage.getItem('response_thread_11_question_11') || ''),
  },
  {
    question:
      "G.6 Use the following questionnaire: https://lk648ntk1fo.typeform.com/utility to check whether the token is a utility token and answer 'Yes' or 'No' below",
    answer: localStorage.getItem('selectedOption') || 'Yes',
  },
  {
    question: 'G.7 Key Features of Goods/ Services of Utility Tokens',
    answer:
      (localStorage.getItem('response_thread_15_question_1') ||
        'AI Is Detecting') +
      '\n' +
      (localStorage.getItem('response_thread_15_question_2') || ''),
  },
  {
    question: 'G.8 Utility Tokens Redemption',
    answer:
      localStorage.getItem('response_thread_16_question_1') ||
      'Ai Is detecting',
  },
  {
    question: 'G.9 Non-Trading request',
    answer:
      localStorage.getItem('response_thread_17_question_1') ||
      'Ai Is detecting',
  },
  {
    question: 'G.10 Crypto-Assets purchase or sale modalities',
    answer:
      localStorage.getItem('response_thread_18_question_1') ||
      'Ai Is detecting',
  },

  {
    question: 'G.11 Crypto-Assets Transfer Restrictions',
    answer:
      localStorage.getItem('response_thread_20_question_1') ||
      'No data available',
  },
  {
    question: 'G.12 Supply Adjustment Protocols',
    answer:
      localStorage.getItem('response_thread_21_question_1') ||
      'No data available',
  },
  {
    question: 'G.13 Supply Adjustment Mechanisms',
    answer:
      localStorage.getItem('response_thread_22_question_1') ||
      'No data available',
  },
  {
    question: 'G.14 Token Value Protection Schemes',
    answer:
      localStorage.getItem('response_thread_23_question_1') ||
      'No data available',
  },
  {
    question: 'G.15 Token Value Protection Schemes Description',
    answer:
      localStorage.getItem('response_thread_24_question_1') ||
      'No data available',
  },
  {
    question: 'G.16 Compensation schemes',
    answer:
      localStorage.getItem('response_thread_25_question_1') ||
      'No data available',
  },
  {
    question: 'G.17 Compensation schemes description',
    answer:
      (localStorage.getItem('response_thread_27_question_1') ||
        'AI Is Detecting') +
        '\n' +
        (localStorage.getItem('response_thread_27_question_2') || '') +
        '\n' +
        (localStorage.getItem('response_thread_27_question_3') || '') ||
      'No data available',
  },
  {
    question: 'G.18 Applicable law',
    answer:
      (localStorage.getItem('response_thread_28_question_1') ||
        'AI Is Detecting') +
        '\n' +
        (localStorage.getItem('response_thread_28_question_3') || '') ||
      'No data available',
  },
  {
    question: 'G.19 Competent court',
    answer:
      localStorage.getItem('response_thread_9_question_1') ||
      'No data available',
  },
];

const paginatedFAQ = paginateContent(PartD, 800, 20, 60);
const paginatedFAQ2 = paginateContent(PartG, 800, 20, 60);

// Create PDF Document
const MyDocument = () => (
  <Document>
    {/* Cover Page */}
    <Page style={[styles.page, styles.headerSection]}>
      <Text style={styles.headerTitle}>Mica White Paper</Text>
      <Text style={styles.headerSubtitle}> for {username}</Text>
      <Image src={logowhite} style={styles.image} />
    </Page>
    {/* Welcome Page */}
    <Page style={[styles.page, styles.headerSection2]}>
      <View style={styles.bodySection}>
        <Text style={styles.title}>Welcome to DSF Mica Whitepaper</Text>
        <Text style={styles.paragraph}>
          The tool will deliver a first draft in minutes, while an analyst could
          take days to complete a similar draft for the 80 questions.
          {'\n'}More importantly, our tool can write more comprehensive and
          detailed answers than human/people. To demonstrate that, let&apos;s
          compare the answers of MiCA papers already submitted to competent
          authorities and the answers our tool delivers.
          {'\n'}
          Conside the question:{'\n'}
          &quot;Details of all-natural or legal persons involved in design and
          development&quot; appears in all MiCa paper typologies, and it is
          deceptively simple .{'\n'}
          The first step to get an answer from the tool would be to provide our
          tool access to existing documents that contain that information, for
          example, the issuer&apos;s website.
          {'\n'}
          Our tool would read the text on the website, ignore the irrelevant
          information and (provided that the information was available on the
          website) to tool extract a list of advisors and organises the
          information specifying: 1. The name of each advisor,{'\n'}
          2. The role,{'\n'}
          3. The company or the domicile {'\n'}
          We are training our tool not to hallucinate—i.e., gather non-relevant
          information. Hence, if the website does not mention any advisor, the
          tool will inform the user that &quot;no information was found&quot;
          and provide suggestions on how to shape the answer.
          {'\n'}
          The curious fact is that current MiCA papers written by people can
          contain exciting and slightly confusing answers. For the question
          under consideration, we have seen answers that mention companies
          (legal entities) that helped write the white paper instead of the
          project seeking funding or admission to trade. As MiCa legislation is
          focused on enabling investors to make an informed decision about their
          money, unless clearly specified, allquestion concerns project.
          {'\n'}
          Our tool, broadly, interprets the question above as {'\n'}
          &quot;Details of all-natural or legal persons, present and past what
          made a contribution to the design and development of this project
          seeking funding or admission to trade&quot; not as {'\n'}
          &quot;Details of all-natural or legal persons involved in design and
          development of this white paper&quot;.
          {'\n'}
          How these kinds of misunderstandings are possible?
          {'\n'}
          ESMA guidance on filling the white paper is relatively short,
          confusing, and prone to misinterpretation. In the absence or robust
          and diligent legal analysis, even crypto- risk experts and junion
          solicitors can get confused. It is very easy. Legal international
          experience in the field is key, as national crypto legislations follow
          commong legal principle. This experience is key to nsure to ensure the
          paper answers the questions as they are intended.
          {'\n'}
          Why are we so confident that this is the way to go?
          {'\n'}
          We have worked with DLA Piper to interpret the law and understand what
          is required. Based on this rigorous legal work, we have trained our
          tool to retrieve and categorise sentences and information closest to
          the original legal interpretation for each question. The legal
          interpretation varies according to the typology of the paper (ART,
          money, etc.) and the entity that needs to submit the paper (issuer
          versus CASP). In other words, some questions for the same token could
          have different answers depending on the issuer and an exchange
          submitting the white paper.
          {'\n'}
          Why should you use our tool?
          {'\n'}
          It saves time when writing the first draft of the paper: no need to
          read old internal documents, seek information on the website, and hire
          a hopeless intern to do the job: simply upload as many documents you
          can find into our tool, and the tool will do the rest in matter of
          minutes.
          {'\n'}
          The tool is trained to follow the ESMA guidance on tone of voice that
          is factual and avoid marketing material and hyperboles.
          {'\n'}
          It provides helpful suggestions to improve an answers when information
          is incomplete, enabling your team to write some answers quicker than
          starting from scratch.
          {'\n'}
          Our tool is also an editing platform so that answers can be easily
          modified on the fly.
          {'\n'}
          Once the first draft is ready, it would be useful to seek legal advice
          on the compliance of the paper, to ensure a successful submission to
          the relevant authorities.
        </Text>
        <Image src={logoblack} style={styles.image} />
      </View>
    </Page>
    {/* PartD Pages */}

    {paginatedFAQ.map((faqPage, index) => (
      <Page style={styles.page} key={index}>
        <View style={styles.bodySection}>
          <Text style={styles.title}>Part D</Text>
          {faqPage.map((item, idx) => (
            <View style={styles.faqItem} key={idx}>
              <Text style={styles.question}>
                {item.question ===
                'D.6 Use the following questionnaire: https://lk648ntk1fo.typeform.com/utility to check whether the token is a utility token and answer &apos;Yes&apos; or &apos;No&apos; below' ? (
                  <Text style={styles.question}>
                    D.6 Use the following questionnaire:
                    <Link
                      src='https://lk648ntk1fo.typeform.com/utility'
                      style={styles.link}
                    >
                      https://lk648ntk1fo.typeform.com/utility
                    </Link>{' '}
                    to check whether the token is a utility token and answer
                    &apos;Yes&apos; or &apos;No&apos; below.
                  </Text>
                ) : (
                  item.question
                )}
              </Text>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
          ))}
        </View>
      </Page>
    ))}
    {/* PartG Pages */}
    {paginatedFAQ2.map((faqPage, index) => (
      <Page style={styles.page} key={index}>
        <View style={styles.bodySection}>
          <Text style={styles.title}>Part G</Text>
          {faqPage.map((item, idx) => (
            <View style={styles.faqItem} key={idx}>
              <Text style={styles.question}>{item.question}</Text>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
          ))}
        </View>
      </Page>
    ))}
    {/* Footer Page */}
    <Page style={[styles.page, styles.headerSection]}>
      <Text style={styles.headerTitle2}>DeepTech</Text>
      <Text style={styles.footerText}>
        DeepTech provides comprehensive solutions for regulatory compliance and whitepaper generation
        for the fintech industry, supporting your transition to compliance with MiCA and other frameworks.
      </Text>
    </Page>
  </Document>
);

// PDF Download Component
const StyledPdfComponent = () => (
  <PDFDownloadLink
    className='bg-blue-500 text-white px-4 py-2 rounded-lg'
    document={<MyDocument />}
    fileName='Mica_White_Paper.pdf'
  >
    {({ loading }) => (loading ? 'Loading document...' : 'Download PDF')}
  </PDFDownloadLink>
);

export default StyledPdfComponent;
