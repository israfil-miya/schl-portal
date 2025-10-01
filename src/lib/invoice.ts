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
  /** Blank row gap (count) between GRAND TOTAL row and Bank heading when on same page (default: 3) */
  samePageBankGapRows?: number;
}

export default async function generateInvoice(
  invoiceData: InvoiceDataType,
  billData: BillDataType[],
  bankAccounts: BankAccountsType,
  options: GenerateInvoiceOptions = {},
): Promise<Blob | false> {
  try {
    /* ---------------------------- SHARED CONSTANTS ---------------------------- */
    const ARIAL = (size: number, extra: Partial<ExcelJS.Font> = {}) => ({
      name: 'Arial',
      size,
      ...extra,
    });
    const CALIBRI = (size = 9, extra: Partial<ExcelJS.Font> = {}) => ({
      name: 'Calibri',
      size,
      ...extra,
    });
    const GREEN = '7BA541';
    const LIGHT_GREEN = 'C4D79B';
    const DARK_TEXT = '595959';
    const WHITE = 'FFFFFF';
    const h20 = pxToPoints(20);
    const h22 = pxToPoints(22);
    const setRows = (start: number, end: number, height: number) => {
      for (let r = start; r <= end; r++) sheet.getRow(r).height = height;
    };
    const cell = (
      range: string,
      value: any,
      font: Partial<ExcelJS.Font>,
      alignment: Partial<ExcelJS.Alignment>,
      border?: Partial<ExcelJS.Borders>,
      fill?: string,
      fg?: string,
    ) =>
      addHeader(
        sheet,
        range,
        value,
        font,
        alignment,
        border,
        fill as any,
        fill ? { pattern: 'solid', fgColor: { argb: fg || GREEN } } : undefined,
      );
    const headerCell = (range: string, text: string) =>
      cell(
        range,
        text,
        ARIAL(10, { bold: true, color: { argb: WHITE } }),
        { vertical: 'middle', horizontal: 'center' },
        thinBorder,
        'pattern',
      );

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
      reader.onload = e =>
        typeof e.target?.result === 'string'
          ? resolve(e.target.result)
          : reject(new Error('Unexpected result type from FileReader (logo).'));
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

    cell(
      'E1:H3',
      'INVOICE',
      { name: 'Arial Black', size: 27, color: { argb: DARK_TEXT } },
      { vertical: 'bottom', horizontal: 'center' },
    );
    const MID_CENTER = { vertical: 'middle', horizontal: 'center' } as const;
    cell('E4:H4', `DATE: ${todayDate}`, ARIAL(10, { bold: true }), MID_CENTER);
    cell(
      'E5:H5',
      `INVOICE #: ${invoiceNo}`,
      ARIAL(10, { bold: true }),
      MID_CENTER,
    );

    let contactTableHeadingRow = 7;

    /**/
    // CONTACT TABLE
    /**/

    // CONTACT TABLE HEADING
    headerCell(
      `A${contactTableHeadingRow}:D${contactTableHeadingRow}`,
      'VENDOR',
    );
    headerCell(
      `E${contactTableHeadingRow}:H${contactTableHeadingRow}`,
      'CUSTOMER',
    );
    sheet.getRow(contactTableHeadingRow).height = h22;

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

    // Helper to render contact table rows
    const renderContactRows = () => {
      contactRowSpans.forEach((span, i) => {
        span.rows > 1
          ? setRows(span.start, span.end, h20)
          : (sheet.getRow(span.start).height = h22);
        // NEW: Always merge both sides over the full span if either side requires multiple rows.
        const mergeBoth = span.rows > 1; // unified span length
        const vendorRange = mergeBoth
          ? `A${span.start}:D${span.end}`
          : `A${span.start}:D${span.start}`;
        const customerRange = mergeBoth
          ? `E${span.start}:H${span.end}`
          : `E${span.start}:H${span.start}`;

        // Vendor cell
        cell(
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
          CALIBRI(),
          { vertical: 'middle', horizontal: 'left', wrapText: true },
          thinBorder,
        );

        // Customer cell
        cell(
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
          CALIBRI(),
          { vertical: 'middle', horizontal: 'left', wrapText: true },
          thinBorder,
        );
      });
    };
    renderContactRows();

    // BILL TABLE HEADING
    const billHeaderTop = afterBillTableRowNumber - 2;
    const billHeaderBottom = afterBillTableRowNumber - 1;
    headerCell(`A${billHeaderTop}:B${billHeaderBottom}`, 'DATE');
    headerCell(`C${billHeaderTop}:D${billHeaderBottom}`, 'JOB NAME');
    headerCell(`E${billHeaderTop}:E${billHeaderBottom}`, 'QUANTITY');
    headerCell(`F${billHeaderTop}:F${billHeaderBottom}`, 'UNIT PRICE');
    headerCell(`G${billHeaderTop}:H${billHeaderBottom}`, 'TOTAL');

    // bill table heading row heights
    sheet.getRow(billHeaderTop).height = h20;
    sheet.getRow(billHeaderBottom).height = pxToPoints(8);

    for (let i = 0; i < billData.length; i++) {
      const data = billData[i];
      const rowIdx = afterBillTableRowNumber;
      sheet.getRow(rowIdx).height = 26;
      const midCenter = MID_CENTER;
      cell(
        `A${rowIdx}:B${rowIdx}`,
        data.date,
        CALIBRI(),
        midCenter,
        thinBorder,
      );
      cell(
        `C${rowIdx}:D${rowIdx}`,
        data.job_name,
        CALIBRI(),
        { vertical: 'middle', horizontal: 'left', wrapText: true },
        thinBorder,
      );
      cell(`E${rowIdx}`, data.quantity, CALIBRI(), midCenter, thinBorder);
      cell(`F${rowIdx}`, data.unit_price, CALIBRI(), midCenter, thinBorder);
      cell(
        `G${rowIdx}:H${rowIdx}`,
        { formula: `E${rowIdx}*F${rowIdx}`, result: data.total() },
        CALIBRI(),
        midCenter,
        thinBorder,
      );
      sheet.getCell(`A${rowIdx}`).numFmt = 'dd/mm/yyyy';
      const mFmt = `${'"' + currencySymbol + '"'}#,##0.00;[Red]\\-${'"' + currencySymbol + '"'}#,##0.00`;
      for (const col of ['F', 'G', 'H'])
        sheet.getCell(`${col}${rowIdx}`).numFmt = mFmt;
      totalFiles += data.quantity;
      subtotal += data.total();
      afterBillTableRowNumber++;
    }

    // Empty Bill Row
    cell(
      `A${afterBillTableRowNumber}:B${afterBillTableRowNumber}`,
      undefined,
      ARIAL(10, { color: { argb: WHITE } }),
      { vertical: 'middle', horizontal: 'left', wrapText: true },
      thinBorder,
      'pattern',
    );
    cell(
      `C${afterBillTableRowNumber}:D${afterBillTableRowNumber}`,
      'TOTAL FILES',
      ARIAL(10, { bold: true, color: { argb: WHITE } }),
      MID_CENTER,
      thinBorder,
      'pattern',
    );
    cell(
      `E${afterBillTableRowNumber}`,
      {
        formula: `SUM(E${afterContactTableRowNumber + 3}:E${afterBillTableRowNumber - 1})`,
        result: totalFiles,
      },
      ARIAL(10, { bold: true, color: { argb: WHITE } }),
      MID_CENTER,
      thinBorder,
      'pattern',
    );
    cell(
      `F${afterBillTableRowNumber}`,
      undefined,
      ARIAL(10, { color: { argb: WHITE } }),
      { vertical: 'middle', horizontal: 'left', wrapText: true },
      thinBorder,
      'pattern',
    );
    cell(
      `G${afterBillTableRowNumber}:H${afterBillTableRowNumber}`,
      undefined,
      ARIAL(10, { color: { argb: WHITE } }),
      { vertical: 'middle', horizontal: 'left', wrapText: true },
      thinBorder,
      'pattern',
    );

    sheet.getRow(afterBillTableRowNumber).height = h22;

    cell(
      `A${afterBillTableRowNumber + 2}:D${afterBillTableRowNumber + 4}`,
      'Please make the payment available within 5 business days from the receipt of this Invoice.',
      CALIBRI(),
      { vertical: 'middle', horizontal: 'left', wrapText: true },
    );

    const fmt = `${'"' + currencySymbol + '"'}#,##0.00;[Red]\\-${'"' + currencySymbol + '"'}#,##0.00`;
    const summaryRows = [
      {
        label: 'SUBTOTAL',
        row: afterBillTableRowNumber + 1,
        formula: `SUM(G${afterContactTableRowNumber + 3}:H${afterBillTableRowNumber - 1})`,
        result: subtotal,
        fmt,
        labelFont: CALIBRI(9, { bold: true, color: { argb: DARK_TEXT } }),
        valueFont: CALIBRI(9),
      },
      {
        label: 'DISCOUNT',
        row: afterBillTableRowNumber + 2,
        formula: `G${afterBillTableRowNumber + 1}*${discount}`,
        result: subtotal * discount,
        fmt,
        labelFont: CALIBRI(9, { bold: true, color: { argb: DARK_TEXT } }),
        valueFont: CALIBRI(9),
      },
      {
        label: 'SALES TAX.',
        row: afterBillTableRowNumber + 3,
        formula: `G${afterBillTableRowNumber + 1}*${salesTax}`,
        result: subtotal * salesTax,
        fmt,
        labelFont: CALIBRI(9, { bold: true, color: { argb: DARK_TEXT } }),
        valueFont: CALIBRI(9),
      },
      {
        label: 'GRAND TOTAL',
        row: afterBillTableRowNumber + 4,
        formula: `(G${afterBillTableRowNumber + 1}-G${afterBillTableRowNumber + 2}+G${afterBillTableRowNumber + 3})`,
        result: salesTax * subtotal + subtotal - subtotal * discount,
        fmt,
        labelFont: CALIBRI(9, { bold: true }),
        valueFont: CALIBRI(9, { bold: true, color: { argb: WHITE } }),
        fill: true,
      },
    ];
    for (const r of summaryRows) {
      cell(`F${r.row}`, r.label, r.labelFont, {
        vertical: 'middle',
        horizontal: 'right',
      });
      cell(
        `G${r.row}:H${r.row}`,
        { formula: r.formula, result: r.result },
        r.valueFont,
        MID_CENTER,
        thinBorder,
        r.fill ? 'pattern' : undefined,
      );
      sheet.getCell(`G${r.row}:H${r.row}`).numFmt = r.fmt;
      if (r.fill) {
        // ensure green fill for grand total
        sheet.getCell(`G${r.row}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: GREEN },
        } as any;
        sheet.getCell(`H${r.row}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: GREEN },
        } as any;
      }
    }

    // Force consistent 22px height for each of the summary section rows (SUBTOTAL, DISCOUNT, SALES TAX, GRAND TOTAL)
    // plus the multi-row message block (rows +2 to +4 already covered in the loop range)
    setRows(afterBillTableRowNumber + 1, afterBillTableRowNumber + 4, h22);

    /**
     * BANK DETAILS SECTION (Dynamic like contact table)
     * Left: First bank account (Bangladesh)
     * Right: Second bank account (could be Eurozone / UK / USA / Australia / Bangladesh)
     */

    // Dynamically decide whether Bank Details can fit on the current page.
    // Goal: Keep bank details + closing/footer on the same page as the bill summary IF they fit entirely.
    // Otherwise, push them to the next page (single block) without artificial filler padding.

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
    // Gap rules (dynamic):
    // We attempt to keep the bank section on the same page using the LARGEST acceptable gap first.
    // If user explicitly sets samePageBankGapRows, we honor that value only (no fallback).
    // Otherwise we try gap=2, then gap=1. If neither fits, we move the bank section to a new page (gap=0).
    // NEW_PAGE_GAP_ROWS always 0 because heading should start at the top of the new page.
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

    const buildPairs = (bank: any): [string, string | undefined][] => {
      const labels: string[] = Array.isArray(bank.field_labels)
        ? bank.field_labels
        : [];
      return labels.reduce<[string, string | undefined][]>((acc, label) => {
        const key =
          LABEL_TO_KEY[label] ||
          label
            .toLowerCase()
            .replace(/\s*\(.*?\)/g, '')
            .replace(/\s+/g, '_');
        const value = bank[key];
        if (value !== undefined && value !== null && value !== '')
          acc.push([label + ': ', value]);
        return acc;
      }, []);
    };

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

    // Preview spans once (row offsets do not affect span lengths / wrapping logic)
    const previewStartRow = grandTotalRow + 3; // arbitrary placeholder (grandTotal + gap(1) + heading + subheading)
    const previewSpans = computeBankRowSpans(
      sheet,
      leftPairsPreview,
      rightPairsPreview,
      previewStartRow,
    );

    // Constant height components (independent of gap except heading offset)
    const headingHeightPts = pxToPoints(20);
    const subHeadingHeightPts = pxToPoints(20);
    const dataHeightPts = previewSpans.reduce((acc: number, span: any) => {
      return (
        acc + (span.rows > 1 ? span.rows * pxToPoints(20) : pxToPoints(22))
      );
    }, 0);
    const closingFillHeightPts = pxToPoints(22);
    const spacerHeightPts = pxToPoints(20); // spacer before footer message
    const footerLineHeightPts = pxToPoints(20) * 3; // 3 footer lines

    // Decide chosen gap dynamically
    let chosenSamePageGapRows = 0;
    let fitsSamePage = false;
    if (!forceNewPageForBank && keepBankOnSamePage) {
      const candidateGaps =
        options.samePageBankGapRows !== undefined
          ? [Math.max(0, options.samePageBankGapRows)]
          : [2, 1];
      for (const g of candidateGaps) {
        const gapHeightPts = g * DEFAULT_ROW_HEIGHT_POINTS;
        const bankSectionHeightPts =
          gapHeightPts +
          headingHeightPts +
          subHeadingHeightPts +
          dataHeightPts +
          closingFillHeightPts +
          spacerHeightPts +
          footerLineHeightPts;
        if (
          bankSectionHeightPts + safetyMarginPts <=
          remainingHeightOnCurrentPage
        ) {
          chosenSamePageGapRows = g;
          fitsSamePage = true;
          break;
        }
      }
    }

    let bankSectionStartRow: number;
    if (fitsSamePage) {
      bankSectionStartRow = grandTotalRow + chosenSamePageGapRows + 1; // grand total + gap + heading
    } else {
      sheet.getRow(grandTotalRow).addPageBreak();
      bankSectionStartRow = grandTotalRow + 1; // new page (no gap)
    }

    // Heading full width
    await cell(
      `A${bankSectionStartRow}:H${bankSectionStartRow}`,
      'STUDIO CLICK HOUSE BANK DETAILS',
      ARIAL(10, { bold: true, color: { argb: WHITE } }),
      MID_CENTER,
      thinBorder,
      'pattern',
    );
    sheet.getRow(bankSectionStartRow).height = h20;

    // Sub headings (country titles) - row below heading
    const bankSubHeadingRow = bankSectionStartRow + 1;
    // (leftBank/rightBank already defined above for sizing logic)
    await cell(
      `A${bankSubHeadingRow}:D${bankSubHeadingRow}`,
      leftBank.header_in_invoice || 'Bank Details',
      ARIAL(9, { bold: true }),
      MID_CENTER,
      thinBorder,
      'pattern',
      LIGHT_GREEN,
    );
    await cell(
      `E${bankSubHeadingRow}:H${bankSubHeadingRow}`,
      rightBank.header_in_invoice || 'Other Bank Details',
      ARIAL(9, { bold: true }),
      MID_CENTER,
      thinBorder,
      'pattern',
      LIGHT_GREEN,
    );
    sheet.getRow(bankSubHeadingRow).height = h20;

    const leftPairs = buildPairs(leftBank);
    const rightPairs = buildPairs(rightBank);

    const bankDataFirstRow = bankSubHeadingRow + 1;
    const bankSpans = computeBankRowSpans(
      sheet,
      leftPairs,
      rightPairs,
      bankDataFirstRow,
    );

    // Helper to render bank rows (keeps original two-pass logic: right side by span, then left packed row-by-row)
    const renderBankRows = async () => {
      for (let i = 0; i < bankSpans.length; i++) {
        const span = bankSpans[i];
        // Unified alignment: if either side needs multiple rows, merge BOTH sides across the full span.
        const mergeBoth = span.rows > 1;
        mergeBoth
          ? setRows(span.start, span.end, h20)
          : (sheet.getRow(span.start).height = h22);

        const left = leftPairs[i];
        const right = rightPairs[i];
        const leftRange = mergeBoth
          ? `A${span.start}:D${span.end}`
          : `A${span.start}:D${span.start}`;
        const rightRange = mergeBoth
          ? `E${span.start}:H${span.end}`
          : `E${span.start}:H${span.start}`;

        await cell(
          leftRange,
          left && left[1]
            ? {
                richText: [
                  { font: { bold: true }, text: left[0] },
                  { text: left[1] || '' },
                ],
              }
            : undefined,
          CALIBRI(),
          { vertical: 'middle', horizontal: 'left', wrapText: true },
          dividerBorder,
        );
        await cell(
          rightRange,
          right && right[1]
            ? {
                richText: [
                  { font: { bold: true }, text: right[0] },
                  { text: right[1] || '' },
                ],
              }
            : undefined,
          CALIBRI(),
          { vertical: 'middle', horizontal: 'left', wrapText: true },
          dividerBorder,
        );
      }
    };
    await renderBankRows();

    // closing solid fill (split into two merged halves to keep center vertical border visible)
    const afterBankTableRow = bankSpans.length
      ? bankSpans[bankSpans.length - 1].end + 1
      : bankDataFirstRow;
    await cell(
      `A${afterBankTableRow}:H${afterBankTableRow}`,
      undefined,
      ARIAL(10, { bold: true }),
      MID_CENTER,
      thinBorder,
      'pattern',
      LIGHT_GREEN,
    );
    sheet.getRow(afterBankTableRow).height = h22;

    // FOOTER SECTION (Questions / Contact / Thank You)
    const footerSpacerRow = afterBankTableRow + 1;
    const footerQuestionRow = footerSpacerRow + 1;
    const footerContactRow = footerSpacerRow + 2;
    const footerThanksRow = footerSpacerRow + 3;

    // Spacer (no border / optional height)
    sheet.getRow(footerSpacerRow).height = h20;

    await cell(
      `A${footerQuestionRow}:H${footerQuestionRow}`,
      'If you have any questions about this invoice, please contact',
      CALIBRI(9, { bold: true, color: { argb: DARK_TEXT } }),
      { vertical: 'middle', horizontal: 'center', wrapText: true },
    );
    sheet.getRow(footerQuestionRow).height = h20;
    await cell(
      `A${footerContactRow}:H${footerContactRow}`,
      {
        richText: [
          { font: { bold: true }, text: invoiceData.vendor.contact_person },
          {
            text: `, ${invoiceData.vendor.email}, ${invoiceData.vendor.contact_number}`,
          },
        ],
      },
      CALIBRI(),
      { vertical: 'middle', horizontal: 'center', wrapText: true },
    );
    sheet.getRow(footerContactRow).height = h20;
    await cell(
      `A${footerThanksRow}:H${footerThanksRow}`,
      {
        richText: [
          {
            font: { italic: true, bold: true },
            text: 'Thank You For Your Business!',
          },
        ],
      },
      CALIBRI(),
      { vertical: 'middle', horizontal: 'center', wrapText: true },
    );
    sheet.getRow(footerThanksRow).height = h20;

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
