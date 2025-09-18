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

export interface BankBangladesh {
  bank_name: string;
  beneficiary_name: string;
  account_number: string;
  swift_code: string;
  routing_number: string;
  branch: string;
}

export interface BankEurozone {
  bank_name: string;
  beneficiary_name: string;
  bank_address: string;
  iban: string;
  bic: string;
}

export interface BankUK {
  bank_name: string;
  beneficiary_name: string;
  sort_code: string;
  account_number: string;
}

export interface BankUSA {
  bank_name: string;
  beneficiary_name: string;
  bank_address: string;
  routing_number_aba: string;
  account_number: string;
  account_type: string;
}

export interface BankAustralia {
  bank_name: string;
  beneficiary_name: string;
  bank_address: string;
  branch_code_bsb: string;
  account_number: string;
}

export const BankBangladeshAccount: BankBangladesh = {
  bank_name: 'Eastern Bank Plc',
  beneficiary_name: 'Studio Click House Ltd',
  account_number: '1091070000373',
  swift_code: 'EBLDBDDH001',
  routing_number: '095260721',
  branch: 'BanasreeBranch',
};

export const BankEurozoneAccount: BankEurozone = {
  bank_name: 'Banking Circle S.A.',
  beneficiary_name: 'Studio Click House Ltd',
  bank_address: '2, Boulevard de la Foire L-1528 LUXEMBOURG',
  iban: 'LU504080000050970109',
  bic: 'BCIRLULL',
};

export const BankUKAccount: BankUK = {
  bank_name: 'Barclays',
  beneficiary_name: 'Studio Click House Ltd',
  sort_code: '231486',
  account_number: '15081703',
};

export const BankUSAAccount: BankUSA = {
  bank_name: 'First Century Bank',
  beneficiary_name: 'Studio Click House Ltd',
  bank_address: '1731 N Elm St Commerce, GA 30529 USA',
  routing_number_aba: '061120084',
  account_number: '4030000434790',
  account_type: 'CHECKING',
};

export const BankAustraliaAccount: BankAustralia = {
  bank_name: 'Citibank',
  beneficiary_name: 'Studio Click House Ltd',
  bank_address: '2 Park Street, Sydney NSW 2000',
  branch_code_bsb: '248024',
  account_number: '10507349',
};
