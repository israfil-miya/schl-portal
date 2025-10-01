import {
  BankAustralia,
  BankBangladesh,
  BankEurozone,
  BankUK,
  BankUSA,
  CustomerDataType,
  VendorDataType,
} from '@/app/(pages)/accountancy/invoices/bank-details';

import {
  addHeader,
  computeBankRowSpans,
  computeContactRowSpans,
  dividerBorder,
  getFileFromUrl,
  pxToExcelWidth,
  pxToPoints,
  thinBorder,
} from '@/utility/invoiceHelpers';

import ExcelJS from 'exceljs';

import moment from 'moment-timezone';

export type BankAccountsType = [
  BankBangladesh,
  BankEurozone | BankUK | BankUSA | BankAustralia | BankBangladesh,
];

export interface BillDataType {
  date: string;
  job_name: string;
  quantity: number;
  total: () => number;
  unit_price: number;
}

export interface InvoiceDataType {
  vendor: VendorDataType;
  customer: CustomerDataType;
}

export interface GenerateInvoiceOptions {
  /** Try to keep bank & footer on same page as totals if they fit (default: true) */
  keepBankOnSamePage?: boolean;
  /** Force bank section to a new page regardless of available space (overrides keepBankOnSamePage) */
  forceNewPageForBank?: boolean;
  /** Page type used to compute printable height. Only 'letter' or 'a4' supported. (default: 'letter') */
  pageType?: 'letter' | 'a4';
  /** Override computed printable height (points) if provided */
  printableHeightOverridePts?: number;
  /** Safety buffer (points) to avoid printing right at page edge (default: 10) */
  safetyMarginPts?: number;
  /** Be more tolerant: allow fitting even when predicted height is close to page limit (default: true) */
  aggressiveSamePageFit?: boolean;
}

export default async function generateInvoice(
  invoiceData: InvoiceDataType,
  billData: BillDataType[],
  bankAccounts: BankAccountsType,
  options: GenerateInvoiceOptions = {},
): Promise<Blob | false> {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('INVOICE', {
      properties: { tabColor: { argb: '7BA541' } },
    });

    sheet.columns = [
      { width: pxToExcelWidth(48) }, // A - 48 px
      { width: pxToExcelWidth(50) }, // B - 50 px
      { width: pxToExcelWidth(93) }, // C - 93 px
      { width: pxToExcelWidth(193) }, // D - 193 px
      { width: pxToExcelWidth(75) }, // E - 75 px
      { width: pxToExcelWidth(93.6848) }, // F - 88 px
      { width: pxToExcelWidth(40) }, // G - 45 px
      { width: pxToExcelWidth(80) }, // H - 35 px
    ];

    // VALUES
    const contactDetails = {
      vendor: [
        invoiceData.vendor.company_name,
        invoiceData.vendor.contact_person,
        invoiceData.vendor.address,
        invoiceData.vendor.contact_number,
        invoiceData.vendor.email,
      ],
      customer: [
        invoiceData.customer.client_name,
        invoiceData.customer.contact_person,
        invoiceData.customer.address,
        invoiceData.customer.contact_number,
        invoiceData.customer.email,
      ],

      vendorConstants: [
        'Company Name: ',
        'Contact Person: ',
        'Address: ',
        'Phone: ',
        'Email: ',
      ],
      customerConstants: [
        'Company Name: ',
        'Contact Person: ',
        'Address: ',
        'Phone: ',
        'Email: ',
      ],
    };

    console.log('contactDetails', contactDetails);

    let totalFiles = 0;
    let subtotal = 0;
    const currencySymbol = invoiceData.customer.currency;
    const salesTax = 0;
    const discount = 0;
    const todayDate = moment().format('MMMM D, YYYY');
    const invoiceNo = invoiceData.customer.invoice_number;

    // ExcelJS expects image ext width/height in pixels (assume 96 DPI)
    const targetHeightInches = 1.44 * 0.73; // original height of the logo = 1.44"
    const targetWidthInches = 2.38 * 0.65; // original width of the logo = 2.38"
    const PX_PER_INCH = 96;

    const pixelHeight = Math.round(targetHeightInches * PX_PER_INCH);
    const pixelWidth = Math.round(targetWidthInches * PX_PER_INCH);

    console.log({ pixelHeight, pixelWidth });

    // ensure at least 10 rows in bill
    if (billData.length <= 10) {
      for (let i = billData.length; i < 10; i++)
        billData.push({
          date: '',
          job_name: '',
          quantity: 0,
          total: () => 0,
          unit_price: 0,
        });
    }

    /**/
    /* START OF EXCEL FILE MAIN SHEET DESIGN */
    /**/

    // LOGO
    const logoCell = {
      tl: { col: 2, row: 0 },
      ext: { width: pixelWidth, height: pixelHeight },
    };

    const file = await getFileFromUrl('/images/logo-grey.png', 'logo.png');

    const logoDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        if (typeof e.target?.result === 'string') {
          resolve(e.target.result); // Ensure it's a string (data URL).
        } else {
          reject(new Error('Unexpected result type from FileReader (logo).'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const logoImage = workbook.addImage({
      base64: logoDataUrl || '',
      extension: 'png',
    });

    sheet.addImage(logoImage, logoCell);

    /**/
    // HEADING
    /**/

    addHeader(
      sheet,
      'E1:H3',
      'INVOICE',
      {
        name: 'Arial Black',
        size: 27,
        color: { argb: '595959' },
      },
      {
        vertical: 'bottom',
        horizontal: 'center',
      },
    );

    addHeader(
      sheet,
      'E4:H4',
      'DATE: ' + todayDate,
      {
        name: 'Arial',
        size: 10,
        bold: true,
      },
      {
        vertical: 'middle',
        horizontal: 'center',
      },
    );

    addHeader(
      sheet,
      'E5:H5',
      'INVOICE #: ' + invoiceNo,
      {
        name: 'Arial',
        size: 10,
        bold: true,
      },
      {
        vertical: 'middle',
        horizontal: 'center',
      },
    );

    let contactTableHeadingRow = 7;

    /**/
    // CONTACT TABLE
    /**/

    // CONTACT TABLE HEADING
    addHeader(
      sheet,
      `A${contactTableHeadingRow}:D${contactTableHeadingRow}`,
      'VENDOR',
      {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFF' },
      },
      {
        vertical: 'middle',
        horizontal: 'center',
      },
      {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      },
      'pattern',
      {
        pattern: 'solid',
        fgColor: { argb: '7BA541' },
      },
    );

    addHeader(
      sheet,
      `E${contactTableHeadingRow}:H${contactTableHeadingRow}`,
      'CUSTOMER',
      {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFF' },
      },
      {
        vertical: 'middle',
        horizontal: 'center',
      },
      {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      },
      'pattern',
      {
        pattern: 'solid',
        fgColor: { argb: '7BA541' },
      },
    );

    // Set contact table heading row height to 22px
    sheet.getRow(contactTableHeadingRow).height = pxToPoints(22);

    // Compute dynamic row spans (moved utility)
    const contactRowSpans = computeContactRowSpans(
      sheet,
      contactDetails,
      contactTableHeadingRow + 1,
    );

    const contactTableLoopEndIndex = contactRowSpans.reduce(
      (sum, s) => sum + s.rows,
      0,
    );

    let afterContactTableRowNumber =
      contactTableHeadingRow +
      1 +
      (contactTableLoopEndIndex <= 3
        ? Math.max(contactDetails.vendor.length, contactDetails.customer.length)
        : contactTableLoopEndIndex);
    let afterBillTableRowNumber = afterContactTableRowNumber + 3;

    console.log('contactRowSpans', contactRowSpans);
    console.log('contactTableLoopEndIndex', contactTableLoopEndIndex);

    // CONTACT TABLE RENDERING (using unified spans)
    for (let i = 0; i < contactRowSpans.length; i++) {
      const span = contactRowSpans[i];
      // Vertically merged (span over multiple rows) => each underlying row gets 20px.
      // Single-row (no vertical merge) => leave row height default so caller can control independently.
      if (span.rows > 1) {
        for (let r = span.start; r <= span.end; r++) {
          sheet.getRow(r).height = pxToPoints(20);
        }
      } else {
        sheet.getRow(span.start).height = pxToPoints(22);
      }

      // Vendor cell occupies only the first physical row of its span (to mimic previous single-row appearance) unless vendorRows > 1, then merge
      if (contactDetails.vendor[i] !== undefined) {
        const vendorRange =
          span.vendorRows > 1
            ? `A${span.start}:D${span.end}`
            : `A${span.start}:D${span.start}`;
        addHeader(
          sheet,
          vendorRange,
          contactDetails.vendor[i]
            ? {
                richText: [
                  {
                    font: { bold: true },
                    text: contactDetails.vendorConstants[i],
                  },
                  { text: contactDetails.vendor[i] },
                ],
              }
            : undefined,
          { name: 'Calibri', size: 9 },
          { vertical: 'middle', horizontal: 'left', wrapText: true },
          thinBorder,
        );
      }

      // Customer cell merges across its required span
      if (contactDetails.customer[i] !== undefined) {
        const customerRange =
          span.customerRows > 1
            ? `E${span.start}:H${span.end}`
            : `E${span.start}:H${span.start}`;
        addHeader(
          sheet,
          customerRange,
          contactDetails.customer[i]
            ? {
                richText: [
                  {
                    font: { bold: true },
                    text: contactDetails.customerConstants[i],
                  },
                  { text: contactDetails.customer[i] },
                ],
              }
            : undefined,
          { name: 'Calibri', size: 9 },
          { vertical: 'middle', horizontal: 'left', wrapText: true },
          thinBorder,
        );
      }
    }

    // BILL TABLE HEADING
    addHeader(
      sheet,
      `A${afterBillTableRowNumber - 2}:B${afterBillTableRowNumber - 1}`,
      'DATE',
      {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFF' },
      },
      {
        vertical: 'middle',
        horizontal: 'center',
      },
      thinBorder,
      'pattern',
      {
        pattern: 'solid',
        fgColor: { argb: '7BA541' },
      },
    );

    addHeader(
      sheet,
      `C${afterBillTableRowNumber - 2}:D${afterBillTableRowNumber - 1}`,
      'JOB NAME',
      {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFF' },
      },
      {
        vertical: 'middle',
        horizontal: 'center',
      },
      thinBorder,
      'pattern',
      {
        pattern: 'solid',
        fgColor: { argb: '7BA541' },
      },
    );

    addHeader(
      sheet,
      `E${afterBillTableRowNumber - 2}:E${afterBillTableRowNumber - 1}`,
      'QUANTITY',
      {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFF' },
      },
      {
        vertical: 'middle',
        horizontal: 'center',
      },
      thinBorder,
      'pattern',
      {
        pattern: 'solid',
        fgColor: { argb: '7BA541' },
      },
    );

    addHeader(
      sheet,
      `F${afterBillTableRowNumber - 2}:F${afterBillTableRowNumber - 1}`,
      'UNIT PRICE',
      {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFF' },
      },
      {
        vertical: 'middle',
        horizontal: 'center',
      },
      thinBorder,
      'pattern',
      {
        pattern: 'solid',
        fgColor: { argb: '7BA541' },
      },
    );

    addHeader(
      sheet,
      `G${afterBillTableRowNumber - 2}:H${afterBillTableRowNumber - 1}`,
      'TOTAL',
      {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFF' },
      },
      {
        vertical: 'middle',
        horizontal: 'center',
      },
      thinBorder,
      'pattern',
      {
        pattern: 'solid',
        fgColor: { argb: '7BA541' },
      },
    );

    // bill table heading row heights
    const billHeaderRowTop = afterBillTableRowNumber - 2;
    const billHeaderRowBottom = afterBillTableRowNumber - 1;
    sheet.getRow(billHeaderRowTop).height = pxToPoints(20);
    sheet.getRow(billHeaderRowBottom).height = pxToPoints(8);

    billData.forEach((data, index) => {
      index = afterBillTableRowNumber;
      let row = sheet.getRow(index);
      row.height = 26;

      addHeader(
        sheet,
        `A${index}:B${index}`,
        data.date,
        {
          name: 'Calibri',
          size: 9,
        },
        {
          vertical: 'middle',
          horizontal: 'center',
        },
        thinBorder,
      );
      addHeader(
        sheet,
        `C${index}:D${index}`,
        data.job_name,
        {
          name: 'Calibri',
          size: 9,
        },
        {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: true,
        },
        thinBorder,
      );
      addHeader(
        sheet,
        `E${index}`,
        data.quantity,
        {
          name: 'Calibri',
          size: 9,
        },
        {
          vertical: 'middle',
          horizontal: 'center',
        },
        thinBorder,
      );
      addHeader(
        sheet,
        `F${index}`,
        data.unit_price,
        {
          name: 'Calibri',
          size: 9,
        },
        {
          vertical: 'middle',
          horizontal: 'center',
        },
        thinBorder,
      );
      addHeader(
        sheet,
        `G${index}:H${index}`,
        { formula: `E${index}*F${index}`, result: data.total() },
        {
          name: 'Calibri',
          size: 9,
        },
        {
          vertical: 'middle',
          horizontal: 'center',
        },
        thinBorder,
      );

      sheet.getCell(`A${index}:B${index}`).numFmt = 'dd/mm/yyyy';
      sheet.getCell(`F${index}`).numFmt = `${
        '"' + currencySymbol + '"'
      }#,##0.00;[Red]\-"AUD"#,##0.00`;
      sheet.getCell(`G${index}:H${index}`).numFmt = `${
        '"' + currencySymbol + '"'
      }#,##0.00;[Red]\-"AUD"#,##0.00`;

      totalFiles += data.quantity;
      subtotal += data.total();
      afterBillTableRowNumber++;
    });

    // Empty Bill Row
    addHeader(
      sheet,
      `A${afterBillTableRowNumber}:B${afterBillTableRowNumber}`,
      undefined,
      {
        name: 'Arial',
        size: 10,
        color: { argb: 'FFFFFF' },
      },
      {
        vertical: 'middle',
        horizontal: 'left',
        wrapText: true,
      },

      thinBorder,
      'pattern',
      {
        pattern: 'solid',
        fgColor: { argb: '7BA541' },
      },
    );
    addHeader(
      sheet,
      `C${afterBillTableRowNumber}:D${afterBillTableRowNumber}`,
      'TOTAL FILES',
      {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFF' },
      },
      {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      },

      thinBorder,
      'pattern',
      {
        pattern: 'solid',
        fgColor: { argb: '7BA541' },
      },
    );
    addHeader(
      sheet,
      `E${afterBillTableRowNumber}`,
      {
        formula: `SUM(E${afterContactTableRowNumber + 3}:E${
          afterBillTableRowNumber - 1
        })`,
        result: totalFiles,
      },
      {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: 'FFFFFF' },
      },
      {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      },
      thinBorder,
      'pattern',
      {
        pattern: 'solid',
        fgColor: { argb: '7BA541' },
      },
    );
    addHeader(
      sheet,
      `F${afterBillTableRowNumber}`,
      undefined,
      {
        name: 'Arial',
        size: 10,
        color: { argb: 'FFFFFF' },
      },
      {
        vertical: 'middle',
        horizontal: 'left',
        wrapText: true,
      },
      thinBorder,
      'pattern',
      {
        pattern: 'solid',
        fgColor: { argb: '7BA541' },
      },
    );
    addHeader(
      sheet,
      `G${afterBillTableRowNumber}:H${afterBillTableRowNumber}`,
      undefined,
      {
        name: 'Arial',
        size: 10,
        color: { argb: 'FFFFFF' },
      },
      {
        vertical: 'middle',
        horizontal: 'left',
        wrapText: true,
      },
      thinBorder,
      'pattern',
      {
        pattern: 'solid',
        fgColor: { argb: '7BA541' },
      },
    );

    sheet.getRow(afterBillTableRowNumber).height = pxToPoints(22);

    addHeader(
      sheet,
      `A${afterBillTableRowNumber + 2}:D${afterBillTableRowNumber + 4}`,
      'Please make the payment available within 5 business days from the receipt of this Invoice.',
      {
        name: 'Calibri',
        size: 9,
      },
      {
        vertical: 'middle',
        horizontal: 'left',
        wrapText: true,
      },
    );

    addHeader(
      sheet,
      `F${afterBillTableRowNumber + 1}`,
      'SUBTOTAL',
      {
        name: 'Calibri',
        size: 9,
        bold: true,
        color: { argb: '595959' },
      },
      {
        vertical: 'middle',
        horizontal: 'right',
      },
    );
    addHeader(
      sheet,
      `G${afterBillTableRowNumber + 1}:H${afterBillTableRowNumber + 1}`,
      {
        formula: `SUM(G${afterContactTableRowNumber + 3}:H${
          afterBillTableRowNumber - 1
        })`,
        result: subtotal,
      },
      {
        name: 'Calibri',
        size: 9,
      },
      {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      },
      thinBorder,
    );
    sheet.getCell(
      `G${afterBillTableRowNumber + 1}:H${afterBillTableRowNumber + 1}`,
    ).numFmt = `${'"' + currencySymbol + '"'}#,##0.00;[Red]\-"AUD"#,##0.00`;

    addHeader(
      sheet,
      `F${afterBillTableRowNumber + 2}`,
      'DISCOUNT',
      {
        name: 'Calibri',
        size: 9,
        bold: true,
        color: { argb: '595959' },
      },
      {
        vertical: 'middle',
        horizontal: 'right',
      },
    );
    addHeader(
      sheet,
      `G${afterBillTableRowNumber + 2}:H${afterBillTableRowNumber + 2}`,
      {
        formula: `G${afterBillTableRowNumber + 1}*${discount}`,
        result: subtotal * discount,
      },
      {
        name: 'Calibri',
        size: 9,
      },
      {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      },
      thinBorder,
    );
    sheet.getCell(
      `G${afterBillTableRowNumber + 2}:H${afterBillTableRowNumber + 2}`,
    ).numFmt = `${'"' + currencySymbol + '"'}#,##0.00;[Red]\-"AUD"#,##0.00`;

    addHeader(
      sheet,
      `F${afterBillTableRowNumber + 3}`,
      'SALES TAX.',
      {
        name: 'Calibri',
        size: 9,
        bold: true,
        color: { argb: '595959' },
      },
      {
        vertical: 'middle',
        horizontal: 'right',
      },
    );
    addHeader(
      sheet,
      `G${afterBillTableRowNumber + 3}:H${afterBillTableRowNumber + 3}`,
      {
        formula: `G${afterBillTableRowNumber + 1}*${salesTax}`,
        result: subtotal * salesTax,
      },
      {
        name: 'Calibri',
        size: 9,
      },
      {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      },
      thinBorder,
    );
    sheet.getCell(
      `G${afterBillTableRowNumber + 3}:H${afterBillTableRowNumber + 3}`,
    ).numFmt = `${'"' + currencySymbol + '"'}#,##0.00;[Red]\-"AUD"#,##0.00`;

    addHeader(
      sheet,
      `F${afterBillTableRowNumber + 4}`,
      'GRAND TOTAL',
      {
        name: 'Calibri',
        size: 9,
        bold: true,
      },
      {
        vertical: 'middle',
        horizontal: 'right',
      },
    );
    addHeader(
      sheet,
      `G${afterBillTableRowNumber + 4}:H${afterBillTableRowNumber + 4}`,
      {
        formula: `(G${afterBillTableRowNumber + 1}-G${
          afterBillTableRowNumber + 2
        }+G${afterBillTableRowNumber + 3})`,
        result: salesTax * subtotal + subtotal - subtotal * discount,
      },
      {
        name: 'Calibri',
        size: 9,
        bold: true,
        color: { argb: 'FFFFFF' },
      },
      {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      },
      thinBorder,
      'pattern',
      {
        pattern: 'solid',
        fgColor: { argb: '7BA541' },
      },
    );
    sheet.getCell(
      `G${afterBillTableRowNumber + 4}:H${afterBillTableRowNumber + 4}`,
    ).numFmt = `${'"' + currencySymbol + '"'}#,##0.00;[Red]\-${
      '"' + currencySymbol + '"'
    }#,##0.00`;

    // Force consistent 22px height for each of the summary section rows (SUBTOTAL, DISCOUNT, SALES TAX, GRAND TOTAL)
    // plus the multi-row message block (rows +2 to +4 already covered in the loop range)
    for (
      let r = afterBillTableRowNumber + 1;
      r <= afterBillTableRowNumber + 4;
      r++
    ) {
      sheet.getRow(r).height = pxToPoints(22);
    }

    /**
     * BANK DETAILS SECTION (Dynamic like contact table)
     * Left: First bank account (Bangladesh)
     * Right: Second bank account (could be Eurozone / UK / USA / Australia / Bangladesh)
     */

    // Dynamically decide whether Bank Details can fit on the current page.
    // Goal: Keep bank details + closing/footer on the same page as the bill summary IF they fit entirely.
    // Otherwise, push them to the next page (single block) without artificial filler padding.
    // Heuristic approach based on row counts (simpler & fast). If needed we could
    // later refine using accumulated row heights in points for higher fidelity.

    // --- Two-pass pagination ---
    const {
      keepBankOnSamePage = true,
      forceNewPageForBank = false,
      pageType = 'letter',
      printableHeightOverridePts,
      safetyMarginPts = 10,
    } = options;

    const PAGE_HEIGHT_INCHES = pageType === 'a4' ? 11.69 : 11; // letter vs a4
    const MARGIN_TOP_IN = 0.75;
    const MARGIN_BOTTOM_IN = 0.75;
    const POINTS_PER_INCH = 72;
    const PRINTABLE_HEIGHT_POINTS =
      printableHeightOverridePts !== undefined
        ? printableHeightOverridePts
        : (PAGE_HEIGHT_INCHES - (MARGIN_TOP_IN + MARGIN_BOTTOM_IN)) *
          POINTS_PER_INCH;
    const DEFAULT_ROW_HEIGHT_POINTS = 15;
    // Gap rules:
    // - If bank section stays on same page: exactly ONE blank row before heading.
    // - If bank section starts a new page: NO gap (heading is first row on that page).
    const SAME_PAGE_GAP_ROWS = 1;
    const NEW_PAGE_GAP_ROWS = 0;

    // Build bank pairs to know spans & exact height before rendering
    const LABEL_TO_KEY: Record<string, string> = {
      'Bank Name': 'bank_name',
      'Beneficiary Name': 'beneficiary_name',
      'Account Number': 'account_number',
      'SWIFT Code': 'swift_code',
      'Routing Number': 'routing_number',
      Branch: 'branch',
      'Bank Address': 'bank_address',
      IBAN: 'iban',
      BIC: 'bic',
      'Sort Code': 'sort_code',
      'Routing Number (ABA)': 'routing_number_aba',
      'Account Type': 'account_type',
      'Branch Code (BSB)': 'branch_code_bsb',
    };

    function buildPairs(bank: any): [string, string | undefined][] {
      const labels: string[] = Array.isArray(bank.field_labels)
        ? bank.field_labels
        : [];
      const pairs: [string, string | undefined][] = [];
      for (const label of labels) {
        const key =
          LABEL_TO_KEY[label] ||
          label
            .toLowerCase()
            .replace(/\s*\(.*?\)/g, '')
            .replace(/\s+/g, '_');
        const value = bank[key];
        if (value !== undefined && value !== null && value !== '') {
          pairs.push([label + ': ', value as string | undefined]);
        }
      }
      return pairs;
    }

    const leftBank = bankAccounts[0];
    const rightBank = bankAccounts[1];
    const leftPairsPreview = buildPairs(leftBank);
    const rightPairsPreview = buildPairs(rightBank);

    // Determine end row of previous content
    const grandTotalRow = afterBillTableRowNumber + 4;

    // Simulate pagination up to the grandTotalRow to know how much height is used on the CURRENT page (not cumulative total)
    let pageHeights: number[] = [0];
    let currentPageIndex = 0;
    const EPS = 0.5; // small epsilon to avoid floating rounding pushing rows prematurely
    for (let r = 1; r <= grandTotalRow; r++) {
      const row = sheet.getRow(r);
      const h = row.height ? row.height : DEFAULT_ROW_HEIGHT_POINTS;
      if (pageHeights[currentPageIndex] + h > PRINTABLE_HEIGHT_POINTS + EPS) {
        // Start new page
        pageHeights.push(h);
        currentPageIndex++;
      } else {
        pageHeights[currentPageIndex] += h;
      }
    }
    const currentPageUsedHeight = pageHeights[currentPageIndex];
    const remainingHeightOnCurrentPage =
      PRINTABLE_HEIGHT_POINTS - currentPageUsedHeight;

    // Predict bank data spans using a temporary start row reference (not final)
    // For preview we assume same-page scenario (gap = 1); if we later decide to move to new page
    // we will omit that gap (slightly reducing height) which can only improve fitting.
    const tempBankDataFirstRow = grandTotalRow + SAME_PAGE_GAP_ROWS + 2; // gap + heading + subheading
    const tempBankSpans = computeBankRowSpans(
      sheet,
      leftPairsPreview,
      rightPairsPreview,
      tempBankDataFirstRow,
    );

    // Height components (match actual rendering):
    const headingHeightPts = pxToPoints(20);
    const subHeadingHeightPts = pxToPoints(20);
    const dataHeightPts = tempBankSpans.reduce((acc: number, span: any) => {
      if (span.rows > 1) return acc + span.rows * pxToPoints(20);
      return acc + pxToPoints(22);
    }, 0);
    const closingFillHeightPts = pxToPoints(22);
    const spacerHeightPts = pxToPoints(20); // spacer before footer message
    const footerLineHeightPts = pxToPoints(20) * 3; // 3 footer lines
    const gapHeightPts = SAME_PAGE_GAP_ROWS * DEFAULT_ROW_HEIGHT_POINTS; // used only for fit calculation

    const bankSectionHeightPts =
      gapHeightPts +
      headingHeightPts +
      subHeadingHeightPts +
      dataHeightPts +
      closingFillHeightPts +
      spacerHeightPts +
      footerLineHeightPts;

    const fitsSamePage =
      keepBankOnSamePage &&
      !forceNewPageForBank &&
      bankSectionHeightPts + safetyMarginPts <= remainingHeightOnCurrentPage;

    let bankSectionStartRow: number;
    if (fitsSamePage) {
      bankSectionStartRow = grandTotalRow + SAME_PAGE_GAP_ROWS + 1; // grand total row + 1 gap + heading
    } else {
      sheet.getRow(grandTotalRow).addPageBreak();
      bankSectionStartRow = grandTotalRow + 1; // first row on new page is heading (no gap)
    }

    // Heading full width
    await addHeader(
      sheet,
      `A${bankSectionStartRow}:H${bankSectionStartRow}`,
      'STUDIO CLICK HOUSE BANK DETAILS',
      { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } },
      { vertical: 'middle', horizontal: 'center' },
      thinBorder,
      'pattern',
      { pattern: 'solid', fgColor: { argb: '7BA541' } },
    );
    sheet.getRow(bankSectionStartRow).height = pxToPoints(20);

    // Sub headings (country titles) - row below heading
    const bankSubHeadingRow = bankSectionStartRow + 1;
    // (leftBank/rightBank already defined above for sizing logic)
    await addHeader(
      sheet,
      `A${bankSubHeadingRow}:D${bankSubHeadingRow}`,
      leftBank.header_in_invoice || 'Bank Details',
      { name: 'Arial', size: 9, bold: true },
      { vertical: 'middle', horizontal: 'center' },
      thinBorder,
      'pattern',
      { pattern: 'solid', fgColor: { argb: 'C4D79B' } },
    );

    await addHeader(
      sheet,
      `E${bankSubHeadingRow}:H${bankSubHeadingRow}`,
      rightBank.header_in_invoice || 'Other Bank Details',
      { name: 'Arial', size: 9, bold: true },
      { vertical: 'middle', horizontal: 'center' },
      thinBorder,
      'pattern',
      { pattern: 'solid', fgColor: { argb: 'C4D79B' } },
    );
    sheet.getRow(bankSubHeadingRow).height = pxToPoints(20);

    const leftPairs = buildPairs(leftBank);
    const rightPairs = buildPairs(rightBank);

    const bankDataFirstRow = bankSubHeadingRow + 1;
    const bankSpans = computeBankRowSpans(
      sheet,
      leftPairs,
      rightPairs,
      bankDataFirstRow,
    );

    // Render bank rows similar to contact table (right side first); only middle divider borders as requested
    for (let i = 0; i < bankSpans.length; i++) {
      const span = bankSpans[i];
      if (span.rows > 1) {
        for (let r = span.start; r <= span.end; r++) {
          sheet.getRow(r).height = pxToPoints(20);
        }
      } else {
        sheet.getRow(span.start).height = pxToPoints(22);
      }
      const right = rightPairs[i];
      const rightRange =
        span.customerRows > 1
          ? `E${span.start}:H${span.end}`
          : `E${span.start}:H${span.start}`;
      await addHeader(
        sheet,
        rightRange,
        right && right[1]
          ? {
              richText: [
                { font: { bold: true }, text: right[0] },
                { text: right[1] || '' },
              ],
            }
          : undefined,
        { name: 'Calibri', size: 9 },
        { vertical: 'middle', horizontal: 'left', wrapText: true },
        dividerBorder,
      );
    }

    // Re-pack LEFT bank entries so they fill any blank rows created by right-side multi-row spans.
    let leftItemIndex = 0;
    for (const span of bankSpans) {
      for (let r = span.start; r <= span.end; r++) {
        if (leftItemIndex < leftPairs.length) {
          const [label, value] = leftPairs[leftItemIndex++];
          await addHeader(
            sheet,
            `A${r}:D${r}`,
            value
              ? {
                  richText: [
                    { font: { bold: true }, text: label },
                    { text: value || '' },
                  ],
                }
              : undefined,
            { name: 'Calibri', size: 9 },
            { vertical: 'middle', horizontal: 'left', wrapText: true },
            dividerBorder,
          );
        } else {
          await addHeader(
            sheet,
            `A${r}:D${r}`,
            undefined,
            { name: 'Calibri', size: 9 },
            { vertical: 'middle', horizontal: 'left', wrapText: true },
            dividerBorder,
          );
        }
      }
    }

    // closing solid fill (split into two merged halves to keep center vertical border visible)
    const afterBankTableRow = bankSpans.length
      ? bankSpans[bankSpans.length - 1].end + 1
      : bankDataFirstRow;
    await addHeader(
      sheet,
      `A${afterBankTableRow}:H${afterBankTableRow}`,
      undefined,
      { name: 'Arial', size: 10, bold: true },
      { vertical: 'middle', horizontal: 'center' },
      thinBorder,
      'pattern',
      { pattern: 'solid', fgColor: { argb: 'C4D79B' } },
    );

    sheet.getRow(afterBankTableRow).height = pxToPoints(22);

    // FOOTER SECTION (Questions / Contact / Thank You)
    const footerSpacerRow = afterBankTableRow + 1;
    const footerQuestionRow = footerSpacerRow + 1;
    const footerContactRow = footerSpacerRow + 2;
    const footerThanksRow = footerSpacerRow + 3;

    // Spacer (no border / optional height)
    sheet.getRow(footerSpacerRow).height = pxToPoints(20);

    await addHeader(
      sheet,
      `A${footerQuestionRow}:H${footerQuestionRow}`,
      'If you have any questions about this invoice, please contact',
      { name: 'Calibri', size: 9, color: { argb: '595959' }, bold: true },
      { vertical: 'middle', horizontal: 'center', wrapText: true },
    );
    sheet.getRow(footerQuestionRow).height = pxToPoints(20);

    await addHeader(
      sheet,
      `A${footerContactRow}:H${footerContactRow}`,
      {
        richText: [
          { font: { bold: true }, text: invoiceData.vendor.contact_person },
          {
            text: `, ${invoiceData.vendor.email}, ${invoiceData.vendor.contact_number}`,
          },
        ],
      },
      { name: 'Calibri', size: 9 },
      { vertical: 'middle', horizontal: 'center', wrapText: true },
    );
    sheet.getRow(footerContactRow).height = pxToPoints(20);

    await addHeader(
      sheet,
      `A${footerThanksRow}:H${footerThanksRow}`,
      {
        richText: [
          {
            font: { italic: true, bold: true },
            text: 'Thank You For Your Business!',
          },
        ],
      },
      { name: 'Calibri', size: 9 },
      { vertical: 'middle', horizontal: 'center', wrapText: true },
    );
    sheet.getRow(footerThanksRow).height = pxToPoints(20);

    // Set print area (may help some viewers)
    sheet.pageSetup.printArea = `A1:H${footerThanksRow}`;

    // Set some page setup options
    sheet.pageSetup = {
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
      horizontalCentered: true,
      verticalCentered: false,
    };

    // Write the workbook to a Blob and create a download link
    // const fileName = `invoice_studioclickhouse_${invoiceData.customer.invoice_number}.xlsx`;
    const data = await workbook.xlsx.writeBuffer();
    console.log(data);
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    return blob;
  } catch (e) {
    console.error('Error generating invoice: ', e);
    return false;
  }
}
