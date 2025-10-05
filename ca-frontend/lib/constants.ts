export const DocTypes = {
  // Identity & KYC
  "aadhaar": {
    title: "Aadhaar Card",
    options: ["Aadhaar Front", "Aadhaar Back"],
    relatedDocs: ["Address Proof", "Photo ID", "Date of Birth Proof"]
  },
  "pan": {
    title: "PAN Card",
    options: ["PAN Front", "PAN Back"],
    relatedDocs: ["Identity Proof", "Address Proof", "Date of Birth Proof", "Passport Size Photo"]
  },
  "voter-id": {
    title: "Voter ID",
    options: ["Voter ID Front", "Voter ID Back"],
    relatedDocs: ["Address Proof", "Age Proof", "Recent Photograph"]
  },
  "passport": {
    title: "Passport",
    options: ["Passport Front", "Passport Back", "Passport Photo Page"],
    relatedDocs: ["Birth Certificate", "Address Proof", "PAN Card", "Passport Size Photos", "Previous Passport (if renewal)"]
  },
  "driving-license": {
    title: "Driving License",
    options: ["Driving License Front", "Driving License Back"],
    relatedDocs: ["Learner's License", "Training Certificate", "Medical Certificate", "Address Proof"]
  },
  "bank-details": {
    title: "Bank Account Details",
    options: ["Bank Passbook", "Cancelled Cheque", "Bank Statement"],
    relatedDocs: ["Identity Proof", "Address Proof", "Salary Certificate", "Income Proof"]
  },
  
  // Based on occupation type
  "salaried": {
    title: "Salaried Employee Documents",
    options: ["Salary Slip", "Proof Of Allowances", "Investment Portfolio", "Loan and EMI"],
    relatedDocs: ["Employment Letter", "Previous Year ITR", "Investment Proofs", "LTA Bills", "Medical Bills"]
  },
  "self-employed": {
    title: "Self Employed Documents", 
    options: ["ITR Returns", "P&L Statement", "Balance Sheet", "Bank Statement", "PAN Card"],
    relatedDocs: ["GST Returns", "Business Registration", "Audit Report", "Investment Proofs", "Expense Bills"]
  },
  "businessman": {
    title: "Business Documents",
    options: ["Company ITR", "Financial Statements", "GST Returns", "Bank Statement", "PAN Card"],
    relatedDocs: ["MOA/AOA", "Company Registration", "Audit Report", "Director Details", "Investment Proofs"]
  },
  
  // Default fallback
  "default": {
    title: "Document Upload",
    options: ["Identity Proof", "Address Proof", "Income Proof", "Bank Statement"],
    relatedDocs: ["Supporting Documents", "Additional Proofs"]
  }
};