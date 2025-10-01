import ExcelJS, {
  Alignment,
  Borders,
  CellFormulaValue,
  CellRichTextValue,
  Fill,
  Font,
  Worksheet,
} from 'exceljs';

/**
 * Reusable thin border style for contact table cells.
 */
export const thinBorder = {
  top: { style: 'thin', color: { argb: '000000' } },
  left: { style: 'thin', color: { argb: '000000' } },
  bottom: { style: 'thin', color: { argb: '000000' } },
  right: { style: 'thin', color: { argb: '000000' } },
} as const;

// Border style for table divider cells: show both left and right vertical dividers
export const dividerBorder = {
  right: { style: 'thin', color: { argb: '000000' } },
  left: { style: 'thin', color: { argb: '000000' } },
} as const;

/** Heuristic tuning constants (kept small & documented) */
const CELL_HORIZONTAL_PADDING_PX = 12; // Approx left+right text padding allowance
const MIN_USABLE_WIDTH_PX = 60; // Guardrail for very narrow merged regions
const FALLBACK_DIVISOR_PX = 210; // Old magic number kept as final fallback

/**
 * Canvas measuring helper with caching & SSR guard.
 * Falls back to simple char multiplier when DOM is unavailable.
 */
let _canvas: HTMLCanvasElement | null = null;
let _ctx: CanvasRenderingContext2D | null = null;
const _measureCache = new Map<string, number>();
function measure(text: string): number {
  if (!text) return 0;
  if (typeof document === 'undefined') {
    // SSR fallback heuristic
    return text.length * 7;
  }
  const key = text;
  if (_measureCache.has(key)) return _measureCache.get(key)!;
  if (!_canvas) {
    _canvas = document.createElement('canvas');
    _ctx = _canvas.getContext('2d');
    if (_ctx) _ctx.font = getComputedStyle(document.body).font;
  }
  if (!_ctx) return text.length * 7; // final fallback
  const w = _ctx.measureText(text).width;
  _measureCache.set(key, w);
  return w;
}

function columnWidthToPixels(charWidth: number | undefined): number {
  const w = typeof charWidth === 'number' ? charWidth : 8.43; // Excel default width
  return Math.trunc(((256 * w + Math.trunc(128 / 7)) / 256) * 7);
}

function mergedWidthPixels(
  sheet: Worksheet,
  startCol: number,
  endCol: number,
): number {
  let total = 0;
  for (let c = startCol; c <= endCol; c++) {
    const col = sheet.getColumn(c);
    total += columnWidthToPixels(col.width as number | undefined);
  }
  return total;
}

function estimateRows(
  sheet: Worksheet,
  startCol: number,
  endCol: number,
  label: string | undefined,
  value: string | undefined,
): number {
  const totalMerged = mergedWidthPixels(sheet, startCol, endCol);
  // We render label + value inside the same merged cell.
  // Subtracting the measured label width (previous heuristic) often underestimates
  // remaining horizontal space on narrower (right-side) blocks and forces an
  // unnecessary second row for perfectly short single-line values. We therefore
  // treat the whole merged width (minus a small padding allowance) as available
  // to the combined text. This keeps genuinely long values wrapping while
  // preventing false positives like a Beneficiary Name taking 2 rows.
  const usable = Math.max(
    MIN_USABLE_WIDTH_PX,
    totalMerged - CELL_HORIZONTAL_PADDING_PX,
  );
  const divisor = usable || FALLBACK_DIVISOR_PX;
  const valueWidth = measure(value || '');
  return Math.max(1, Math.ceil(valueWidth / divisor));
}

export interface ContactDetailsInput {
  vendor: string[];
  customer: string[];
  vendorConstants: string[];
  customerConstants: string[];
}

export interface ContactRowSpan {
  start: number; // starting Excel row index
  end: number; // ending Excel row index (inclusive)
  vendorRows: number; // rows needed for vendor value
  customerRows: number; // rows needed for customer value
  rows: number; // max(vendorRows, customerRows)
}

/**
 * Compute row spans for the side-by-side contact table.
 * Returns an ordered list of spans beginning at `firstDataRow`.
 */
export function computeContactRowSpans(
  sheet: Worksheet,
  contactDetails: ContactDetailsInput,
  firstDataRow: number,
): ContactRowSpan[] {
  const spans: ContactRowSpan[] = [];
  const longest = Math.max(
    contactDetails.customer.length,
    contactDetails.vendor.length,
  );
  let lastEnd = firstDataRow;

  for (let i = 0; i < longest; i++) {
    const vendorText = contactDetails.vendor[i];
    const customerText = contactDetails.customer[i];
    const vendorLabel = contactDetails.vendorConstants[i];
    const customerLabel = contactDetails.customerConstants[i];

    const vendorRows = estimateRows(sheet, 1, 4, vendorLabel, vendorText);
    const customerRows = estimateRows(sheet, 5, 8, customerLabel, customerText);
    const rows = Math.max(vendorRows, customerRows);
    const span: ContactRowSpan = {
      start: lastEnd,
      end: lastEnd + rows - 1,
      vendorRows,
      customerRows,
      rows,
    };
    spans.push(span);
    lastEnd += rows;
  }

  return spans;
}

/**
 * Generic two-column span calculator (used for Bank Details section).
 * Accepts arrays of tuple [label, value]. Either side may have a different number of entries.
 * Rows are only generated for indices where at least one side contains a non-empty value.
 */
export function computeBankRowSpans(
  sheet: Worksheet,
  leftDetails: [string, string | undefined][],
  rightDetails: [string, string | undefined][],
  firstDataRow: number,
): ContactRowSpan[] {
  const spans: ContactRowSpan[] = [];
  const longest = Math.max(leftDetails.length, rightDetails.length);
  let lastEnd = firstDataRow;

  for (let i = 0; i < longest; i++) {
    const left = leftDetails[i];
    const right = rightDetails[i];
    const leftValue = left?.[1];
    const rightValue = right?.[1];

    // Skip completely empty row (both sides missing or empty)
    if (!leftValue && !rightValue) continue;

    const leftLabel = left?.[0];
    const rightLabel = right?.[0];

    const vendorRows = estimateRows(sheet, 1, 4, leftLabel, leftValue); // reuse column ranges A:D
    const customerRows = estimateRows(sheet, 5, 8, rightLabel, rightValue); // reuse column ranges E:H
    const rows = Math.max(vendorRows, customerRows);
    const span: ContactRowSpan = {
      start: lastEnd,
      end: lastEnd + rows - 1,
      vendorRows,
      customerRows,
      rows,
    };
    spans.push(span);
    lastEnd += rows;
  }
  return spans;
}

// Convert pixels to points (1pt = 1/72 inch). Default assumes 96 DPI display.
export function pxToPoints(pixels: number, dpi: number = 96): number {
  return (pixels * 72) / dpi;
}

export async function getFileFromUrl(
  url: string,
  name: string,
  defaultType: string = 'image/png',
): Promise<File> {
  const response = await fetch(url);
  const data = await response.blob();
  return new File([data], name, {
    type: data.type || defaultType,
  });
}

export async function addHeader(
  sheet: Worksheet,
  cell: string,
  value?: string | number | CellRichTextValue | CellFormulaValue,
  font?: Partial<Font>,
  alignment?: Partial<Alignment>,
  borderStyle?: Partial<Borders>,
  fillType?: 'pattern' | 'gradient',
  fillOptions?:
    | {
        pattern?:
          | 'solid'
          | 'darkVertical'
          | 'darkGray'
          | 'lightGray'
          | 'lightVertical';
        fgColor?: { argb: string };
        bgColor?: { argb: string };
      }
    | {
        gradient: 'angle' | 'path';
        degree?: number;
        stops: { position: number; color: { argb: string } }[];
      },
): Promise<void> {
  // Conditional merge: only merge if range spans more than one distinct cell.
  if (cell.includes(':')) {
    const [start, end] = cell.split(':');
    if (start !== end) {
      sheet.mergeCells(cell);
    }
  }

  const targetCell = sheet.getCell(cell.split(':')[0]); // anchor cell

  if (font) targetCell.font = font;
  if (alignment) targetCell.alignment = alignment;
  if (value !== undefined) targetCell.value = value;
  if (borderStyle) targetCell.border = borderStyle;

  if (fillType && fillOptions) {
    targetCell.fill = {
      type: fillType,
      ...fillOptions,
    } as Fill;
  }
}

type FontMap = {
  [key: string]: { charWidthPx: number };
};

const fontCalibration: FontMap = {
  Calibri11: { charWidthPx: 7.0 },
  Arial9: { charWidthPx: 6.0 },
  Arial10: { charWidthPx: 6.5 },
  Arial12: { charWidthPx: 7.5 },
};

/**
 * Convert px → Excel width, adapting to font size/metrics.
 * Default: Calibri 11
 */
export function pxToExcelWidth(
  px: number,
  font: keyof FontMap = 'Calibri11',
): number {
  const charWidth = fontCalibration[font]?.charWidthPx ?? 7.0;
  return (px - 5) / charWidth;
}

/**
 * Convert Excel width → px
 */
export function excelWidthToPx(
  width: number,
  font: keyof FontMap = 'Calibri11',
): number {
  const charWidth = fontCalibration[font]?.charWidthPx ?? 7.0;
  return Math.round(width * charWidth + 5);
}
