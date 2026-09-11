/**
 * MerchantPay Lite — Centralized Merchant KYC/KYB Compliance Requirement Engine
 * 
 * Maps entity classifications, regulatory mandates (CAC, Tax ID, SCUML / DNFBP),
 * and dynamic document requirements based on business structure and sector.
 */

export type MerchantMode = 'TEST' | 'LIVE';

export type VerificationStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACTION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type BusinessType =
  | 'SOLE_PROPRIETOR'
  | 'REGISTERED_BUSINESS_NAME'
  | 'LIMITED_LIABILITY_COMPANY'
  | 'INCORPORATED_TRUSTEE';

export type BusinessSector =
  | 'RETAIL'
  | 'SERVICES'
  | 'TECHNOLOGY'
  | 'HOSPITALITY'
  | 'REAL_ESTATE'
  | 'JEWELRY_LUXURY'
  | 'AUTOMOTIVE'
  | 'LEGAL_ACCOUNTING'
  | 'GAMING_BETTING';

export type DocumentStatus =
  | 'NOT_UPLOADED'
  | 'UPLOADED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'ACTION_REQUIRED';

export interface DocumentRequirement {
  id: string;
  code: string;
  name: string;
  category: 'REGISTRATION' | 'IDENTITY' | 'TAX' | 'REGULATORY' | 'CONSTITUTION';
  description: string;
  required: boolean;
  applicableBusinessTypes: BusinessType[];
  isScumlSpecific?: boolean;
  acceptedFormats: string[];
  maxSizeMb: number;
}

export interface UploadedDocumentRecord {
  id: string;
  requirementCode: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  status: DocumentStatus;
  rejectionReason?: string;
  reviewerNotes?: string;
}

export interface MerchantComplianceState {
  merchantId: string;
  currentMode: MerchantMode;
  verificationStatus: VerificationStatus;
  businessType: BusinessType;
  businessSector: BusinessSector;
  isScumlRelevant: boolean;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documents: Record<string, UploadedDocumentRecord>;
}

// SCUML (Special Control Unit Against Money Laundering) Designated Non-Financial Businesses & Professions (DNFBPs)
export const SCUML_RELEVANT_SECTORS: BusinessSector[] = [
  'REAL_ESTATE',
  'JEWELRY_LUXURY',
  'AUTOMOTIVE',
  'LEGAL_ACCOUNTING',
  'GAMING_BETTING'
];

export const MASTER_DOCUMENT_REQUIREMENTS: DocumentRequirement[] = [
  // 1. Government-Issued Identity Document (Applicable to Sole Proprietor, Partners, Directors, Trustees)
  {
    id: 'req_id_card',
    code: 'GOVERNMENT_ID',
    name: 'Government-Issued Photo ID',
    category: 'IDENTITY',
    description: 'Valid National Identity Card (NIN slip with QR), International Passport, Driver’s Licence, or Voter’s Card of the owner or principal director.',
    required: true,
    applicableBusinessTypes: ['SOLE_PROPRIETOR', 'REGISTERED_BUSINESS_NAME', 'LIMITED_LIABILITY_COMPANY', 'INCORPORATED_TRUSTEE'],
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMb: 10,
  },

  // 2. Proof of Business Address
  {
    id: 'req_proof_address',
    code: 'PROOF_OF_ADDRESS',
    name: 'Proof of Business Address',
    category: 'IDENTITY',
    description: 'Recent utility bill (Electricity, Water, Waste), commercial lease agreement, or bank statement dated within the last 3 months matching business operating address.',
    required: true,
    applicableBusinessTypes: ['SOLE_PROPRIETOR', 'REGISTERED_BUSINESS_NAME', 'LIMITED_LIABILITY_COMPANY', 'INCORPORATED_TRUSTEE'],
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMb: 10,
  },

  // 3. CAC Business Name Registration (For Registered Business Names)
  {
    id: 'req_cac_bn',
    code: 'CAC_BN_CERTIFICATE',
    name: 'CAC Business Name Certificate',
    category: 'REGISTRATION',
    description: 'Official Corporate Affairs Commission Certificate of Registration for Business Name or electronic Business Name Status Report.',
    required: true,
    applicableBusinessTypes: ['REGISTERED_BUSINESS_NAME'],
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMb: 10,
  },

  // 4. CAC Certificate of Incorporation (For Limited Liability Companies)
  {
    id: 'req_cac_coi',
    code: 'CAC_INCORPORATION_CERTIFICATE',
    name: 'Certificate of Incorporation (RC/LLC)',
    category: 'REGISTRATION',
    description: 'Official CAC Certificate of Incorporation bearing your RC number.',
    required: true,
    applicableBusinessTypes: ['LIMITED_LIABILITY_COMPANY'],
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMb: 10,
  },

  // 5. CAC Status Report / Particulars of Directors & PSC (Persons with Significant Control)
  {
    id: 'req_cac_status_report',
    code: 'CAC_STATUS_REPORT',
    name: 'CAC Status Report / Form CAC 1.1',
    category: 'REGISTRATION',
    description: 'Certified CAC Status Report detailing share capital, active directors, shareholders, and beneficial ownership / PSC disclosure.',
    required: true,
    applicableBusinessTypes: ['LIMITED_LIABILITY_COMPANY'],
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMb: 10,
  },

  // 6. Memorandum and Articles of Association (MEMART)
  {
    id: 'req_memart',
    code: 'MEMART',
    name: 'Memorandum & Articles of Association (MEMART)',
    category: 'CONSTITUTION',
    description: 'Certified copy of the company Memorandum and Articles of Association registered with CAC.',
    required: true,
    applicableBusinessTypes: ['LIMITED_LIABILITY_COMPANY'],
    acceptedFormats: ['.pdf'],
    maxSizeMb: 15,
  },

  // 7. CAC Certificate of Incorporation for Incorporated Trustee / NGO / Non-Profit
  {
    id: 'req_cac_it',
    code: 'CAC_IT_CERTIFICATE',
    name: 'CAC Certificate of Incorporated Trustees',
    category: 'REGISTRATION',
    description: 'Certificate of Registration/Incorporation as an Incorporated Trustee (IT) under Part F of CAMA.',
    required: true,
    applicableBusinessTypes: ['INCORPORATED_TRUSTEE'],
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMb: 10,
  },

  // 8. Constitution / Charter (For Incorporated Trustees)
  {
    id: 'req_it_constitution',
    code: 'IT_CONSTITUTION',
    name: 'Approved Trustee Constitution',
    category: 'CONSTITUTION',
    description: 'CAC-certified Constitution and resolution designating authorized platform account operators.',
    required: true,
    applicableBusinessTypes: ['INCORPORATED_TRUSTEE'],
    acceptedFormats: ['.pdf'],
    maxSizeMb: 15,
  },

  // 9. Tax Identification Number (TIN) Verification Evidence
  {
    id: 'req_tin',
    code: 'TAX_IDENTIFICATION_NUMBER',
    name: 'Tax Identification Number (TIN) Evidence',
    category: 'TAX',
    description: 'FIRS / State IRS Tax Clearance Certificate, JTB TIN validation slip, or VAT registration document.',
    required: true,
    applicableBusinessTypes: ['REGISTERED_BUSINESS_NAME', 'LIMITED_LIABILITY_COMPANY'],
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMb: 10,
  },

  // 10. SCUML Certificate (CONDITIONAL ONLY for designated high-risk sectors)
  {
    id: 'req_scuml',
    code: 'SCUML_CERTIFICATE',
    name: 'SCUML Registration Certificate',
    category: 'REGULATORY',
    description: 'Special Control Unit Against Money Laundering (SCUML) certificate issued by EFCC, mandatory under the Money Laundering (Prevention and Prohibition) Act for Designated Non-Financial Businesses & Professions.',
    required: true,
    applicableBusinessTypes: ['SOLE_PROPRIETOR', 'REGISTERED_BUSINESS_NAME', 'LIMITED_LIABILITY_COMPANY', 'INCORPORATED_TRUSTEE'],
    isScumlSpecific: true,
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
    maxSizeMb: 10,
  }
];

/**
 * Filter applicable requirements for a merchant based on business structure & sector.
 */
export function getApplicableRequirements(
  businessType: BusinessType,
  businessSector: BusinessSector
): DocumentRequirement[] {
  const isScumlSector = SCUML_RELEVANT_SECTORS.includes(businessSector);

  return MASTER_DOCUMENT_REQUIREMENTS.filter((req) => {
    // Check if business type matches
    if (!req.applicableBusinessTypes.includes(businessType)) {
      return false;
    }

    // SCUML conditional check
    if (req.isScumlSpecific && !isScumlSector) {
      return false;
    }

    return true;
  });
}
