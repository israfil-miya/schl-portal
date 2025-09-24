export interface CustomerDataType {
  client_name: string;
  client_code: string;
  contact_person: string;
  address: string;
  contact_number: string;
  email: string;
  invoice_number: string;
  currency: string;
}
export interface VendorDataType {
  company_name: string;
  contact_person: string;
  address: string;
  contact_number: string;
  email: string;
}

interface BankDetailsInInvoice {
  header_in_invoice: string;
  field_labels: string[];
}

export interface BankBangladesh extends BankDetailsInInvoice {
  bank_name: string;
  beneficiary_name: string;
  account_number: string;
  swift_code: string;
  routing_number: string;
  branch: string;
}

export interface BankEurozone extends BankDetailsInInvoice {
  bank_name: string;
  beneficiary_name: string;
  bank_address: string;
  iban: string;
  bic: string;
}

export interface BankUK extends BankDetailsInInvoice {
  bank_name: string;
  beneficiary_name: string;
  sort_code: string;
  account_number: string;
}

export interface BankUSA extends BankDetailsInInvoice {
  bank_name: string;
  beneficiary_name: string;
  bank_address: string;
  routing_number_aba: string;
  account_number: string;
  account_type: string;
}

export interface BankAustralia extends BankDetailsInInvoice {
  bank_name: string;
  beneficiary_name: string;
  bank_address: string;
  branch_code_bsb: string;
  account_number: string;
}

export const BankBangladeshAccount: BankBangladesh = {
  header_in_invoice: 'Based in Bangladesh',
  field_labels: [
    'Bank Name',
    'Beneficiary Name',
    'Account Number',
    'SWIFT Code',
    'Routing Number',
    'Branch',
  ],
  bank_name: 'Eastern Bank Plc',
  beneficiary_name: 'Studio Click House Ltd',
  account_number: '1091070000373',
  swift_code: 'EBLDBDDH001',
  routing_number: '095260721',
  branch: 'Banasree Branch',
};

export const BankEurozoneAccount: BankEurozone = {
  header_in_invoice: 'Based in Eurozone',
  field_labels: [
    'Bank Name',
    'Beneficiary Name',
    'Bank Address',
    'IBAN',
    'BIC',
  ],
  bank_name: 'Banking Circle S.A.',
  beneficiary_name: 'Studio Click House Ltd',
  bank_address: '2, Boulevard de la Foire L-1528 LUXEMBOURG',
  iban: 'LU504080000050970109',
  bic: 'BCIRLULL',
};

export const BankUKAccount: BankUK = {
  header_in_invoice: 'Based in the UK',
  field_labels: [
    'Bank Name',
    'Beneficiary Name',
    'Sort Code',
    'Account Number',
  ],
  bank_name: 'Barclays',
  beneficiary_name: 'Studio Click House Ltd',
  sort_code: '231486',
  account_number: '15081703',
};

export const BankUSAAccount: BankUSA = {
  header_in_invoice: 'Based in the USA',
  field_labels: [
    'Bank Name',
    'Beneficiary Name',
    'Bank Address',
    'Routing Number (ABA)',
    'Account Number',
    'Account Type',
  ],
  bank_name: 'First Century Bank',
  beneficiary_name: 'Studio Click House Ltd',
  bank_address: '1731 N Elm St Commerce, GA 30529 USA',
  routing_number_aba: '061120084',
  account_number: '4030000434790',
  account_type: 'CHECKING',
};

export const BankAustraliaAccount: BankAustralia = {
  header_in_invoice: 'Based in Australia',
  field_labels: [
    'Bank Name',
    'Beneficiary Name',
    'Bank Address',
    'Branch Code (BSB)',
    'Account Number',
  ],
  bank_name: 'Citibank',
  beneficiary_name: 'Studio Click House Ltd',
  bank_address: '2 Park Street, Sydney NSW 2000',
  branch_code_bsb: '248024',
  account_number: '10507349',
};
