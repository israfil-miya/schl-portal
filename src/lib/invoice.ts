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
  computeContactRowSpans,
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

export default async function generateInvoice(
  invoiceData: InvoiceDataType,
  billData: BillDataType[],
  bankAccounts: BankAccountsType,
): Promise<Blob | false> {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('INVOICE', {
      properties: { tabColor: { argb: 'C4D79B' } },
    });

    sheet.columns = [
      { width: pxToExcelWidth(48) }, // A - 48 px
      { width: pxToExcelWidth(50) }, // B - 50 px
      { width: pxToExcelWidth(93) }, // C - 93 px
      { width: pxToExcelWidth(127) }, // D - 127 px
      { width: pxToExcelWidth(127) }, // E - 127 px
      { width: pxToExcelWidth(93.6848) }, // F - 88 px
      { width: pxToExcelWidth(45) }, // G - 45 px
      { width: pxToExcelWidth(35) }, // H - 35 px
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
    const targetHeightInches = 1.44 * 0.94; // original height of the logo = 1.44"
    const targetWidthInches = 2.38 * 0.79; // original width of the logo = 2.38"
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
      tl: { col: 1, row: 0 },
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
      'E1:H4',
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
      'E5:H5',
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
      'E6:H6',
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

    let contactTableHeadingRow = 9;

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
      (contactTableLoopEndIndex <= 5
        ? Math.max(contactDetails.vendor.length, contactDetails.customer.length)
        : contactTableLoopEndIndex);
    let afterBillTableRowNumber = afterContactTableRowNumber + 5;

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

    // Extra spacer row: add both vendor (A:D) and customer (E:H) halves so borders appear continuous
    addHeader(
      sheet,
      `A${afterContactTableRowNumber}:D${afterContactTableRowNumber}`,
      undefined,
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
      `E${afterContactTableRowNumber}:H${afterContactTableRowNumber}`,
      undefined,
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
    sheet.getRow(afterContactTableRowNumber).height = pxToPoints(22);

    // Contact table closing solid fill
    addHeader(
      sheet,
      `A${afterContactTableRowNumber + 1}:H${afterContactTableRowNumber + 1}`,
      undefined,
      {
        name: 'Arial',
        size: 10,
        bold: true,
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
    sheet.getRow(afterContactTableRowNumber + 1).height = pxToPoints(22);

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

    // Ensure the two physical rows that make up the vertically merged bill table header are 20px each
    const billHeaderRowTop = afterBillTableRowNumber - 2;
    const billHeaderRowBottom = afterBillTableRowNumber - 1;
    sheet.getRow(billHeaderRowTop).height = pxToPoints(20);
    sheet.getRow(billHeaderRowBottom).height = pxToPoints(20);

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
        formula: `SUM(E${afterContactTableRowNumber + 5}:E${
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
        formula: `SUM(G${afterContactTableRowNumber + 5}:H${
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
