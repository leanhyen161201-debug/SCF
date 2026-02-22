import { documentRepository } from '../repositories/document.repository';
import { NotFoundError, BusinessError } from '../utils/errors';
import {
  AMOUNT_MATCH_THRESHOLD,
  MATCH_WEIGHTS,
  MATCH_PASS_SCORE,
} from '@scf/shared';
import type { CleanedDocumentData, MatchResult } from '@scf/shared';

// ========== Data Cleansing Utilities ==========

function normalizeAmount(raw?: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[¥$€,，\s]/g, '');
  return parseFloat(cleaned) || 0;
}

function normalizeDate(raw?: string): Date {
  if (!raw) return new Date();
  // Handle formats: YYYY-MM-DD, YYYY/MM/DD, DD.MM.YYYY, etc.
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function normalizeCompanyName(raw?: string): string {
  if (!raw) return '';
  return raw
    .replace(/\s+/g, '')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/[""'']/g, '')
    .replace(/有限责任公司$/g, '有限公司')
    .trim()
    .toLowerCase();
}

function normalizeGoodsList(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,，;；、\n]/)
    .map((g) => g.trim().toLowerCase())
    .filter(Boolean);
}

function cleanDocumentData(extracted: Record<string, unknown>): CleanedDocumentData {
  return {
    amount: normalizeAmount(extracted.amount as string),
    date: normalizeDate(extracted.date as string),
    partyA: normalizeCompanyName(extracted.partyA as string),
    partyB: normalizeCompanyName(extracted.partyB as string),
    goods: normalizeGoodsList(extracted.goods as string),
    quantity: parseInt(String(extracted.quantity || '0'), 10) || 0,
  };
}

// ========== Matching Utilities ==========

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function stringSimilarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

function goodsSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const intersection = b.filter((item) => setA.has(item));
  return intersection.length / Math.max(a.length, b.length);
}

// ========== Triple Match Core ==========

function tripleMatch(
  contract: CleanedDocumentData,
  invoice: CleanedDocumentData,
  logistics: CleanedDocumentData
): MatchResult {
  // 1. Amount comparison - HARD RULE
  const maxAmount = Math.max(contract.amount, invoice.amount, logistics.amount);
  const contractInvoiceDev = maxAmount > 0
    ? Math.abs(contract.amount - invoice.amount) / maxAmount
    : 0;
  const contractLogisticsDev = maxAmount > 0
    ? Math.abs(contract.amount - logistics.amount) / maxAmount
    : 0;
  const maxDev = Math.max(contractInvoiceDev, contractLogisticsDev);

  if (maxDev > AMOUNT_MATCH_THRESHOLD) {
    return {
      isMatched: false,
      score: 0,
      details: {
        amountMatch: { passed: false, deviation: maxDev },
        dateMatch: { passed: false, daysDiff: 0 },
        partyMatch: { passed: false, similarity: 0 },
        goodsMatch: { passed: false, similarity: 0 },
      },
      autoRejectReason: `Amount deviation ${(maxDev * 100).toFixed(2)}% exceeds threshold ${AMOUNT_MATCH_THRESHOLD * 100}%`,
    };
  }

  // 2. Date reasonableness (contract <= invoice <= logistics)
  const contractDate = contract.date.getTime();
  const invoiceDate = invoice.date.getTime();
  const logisticsDate = logistics.date.getTime();
  const daysDiff = Math.abs(logisticsDate - contractDate) / (1000 * 60 * 60 * 24);
  const dateReasonable = contractDate <= invoiceDate && invoiceDate <= logisticsDate;
  const dateScore = dateReasonable ? Math.max(0, 100 - daysDiff * 2) : Math.max(0, 50 - daysDiff);

  // 3. Party name matching
  const partyASimilarity = Math.max(
    stringSimilarity(contract.partyA, invoice.partyA),
    stringSimilarity(contract.partyA, logistics.partyA)
  );
  const partyBSimilarity = Math.max(
    stringSimilarity(contract.partyB, invoice.partyB),
    stringSimilarity(contract.partyB, logistics.partyB)
  );
  const partySimilarity = (partyASimilarity + partyBSimilarity) / 2;
  const partyScore = partySimilarity * 100;

  // 4. Goods description matching
  const goodsSim = Math.max(
    goodsSimilarity(contract.goods, invoice.goods),
    goodsSimilarity(contract.goods, logistics.goods)
  );
  const goodsScore = goodsSim * 100;

  // 5. Amount score (closer to 0 deviation = higher score)
  const amountScore = (1 - maxDev / AMOUNT_MATCH_THRESHOLD) * 100;

  // Weighted composite
  const totalScore =
    MATCH_WEIGHTS.amount * amountScore +
    MATCH_WEIGHTS.date * dateScore +
    MATCH_WEIGHTS.party * partyScore +
    MATCH_WEIGHTS.goods * goodsScore;

  return {
    isMatched: totalScore >= MATCH_PASS_SCORE,
    score: Math.round(totalScore * 100) / 100,
    details: {
      amountMatch: { passed: maxDev <= AMOUNT_MATCH_THRESHOLD, deviation: maxDev },
      dateMatch: { passed: dateReasonable, daysDiff },
      partyMatch: { passed: partySimilarity >= 0.8, similarity: partySimilarity },
      goodsMatch: { passed: goodsSim >= 0.6, similarity: goodsSim },
    },
  };
}

// ========== Service ==========

export const documentReviewService = {
  /**
   * Simulate AI field extraction from a document
   */
  async extractFields(documentId: string) {
    const doc = await documentRepository.findById(documentId);
    if (!doc) throw new NotFoundError('Document');

    // Update status to EXTRACTING
    await documentRepository.updateStatus(documentId, 'EXTRACTING');

    // Simulate AI extraction based on document type
    // In production, this would call an OCR/AI service
    const extractedData: Record<string, string> = {
      amount: '100000.00',
      date: '2026-01-15',
      partyA: '示例甲方有限公司',
      partyB: '示例乙方有限公司',
      goods: '电子元件, 电路板',
      quantity: '1000',
    };

    // For existing extracted data, use it
    if (doc.extractedData) {
      Object.assign(extractedData, doc.extractedData as Record<string, string>);
    }

    await documentRepository.updateExtractedData(documentId, {
      extractedData,
      extractedAmount: normalizeAmount(extractedData.amount),
      extractedDate: normalizeDate(extractedData.date),
      extractedPartyA: extractedData.partyA,
      extractedPartyB: extractedData.partyB,
      extractedGoods: extractedData.goods,
      status: 'EXTRACTED',
    });

    return { extractedData };
  },

  /**
   * Perform triple-document matching (contract, invoice, logistics)
   */
  async matchDocuments(contractId: string, invoiceId: string, logisticsId: string) {
    const [contractDoc, invoiceDoc, logisticsDoc] = await Promise.all([
      documentRepository.findById(contractId),
      documentRepository.findById(invoiceId),
      documentRepository.findById(logisticsId),
    ]);

    if (!contractDoc) throw new NotFoundError('Contract document');
    if (!invoiceDoc) throw new NotFoundError('Invoice document');
    if (!logisticsDoc) throw new NotFoundError('Logistics document');

    // Ensure all documents have been extracted
    if (!contractDoc.extractedData || !invoiceDoc.extractedData || !logisticsDoc.extractedData) {
      throw new BusinessError('All documents must have extracted data before matching');
    }

    // Clean data
    const contractClean = cleanDocumentData(contractDoc.extractedData as Record<string, unknown>);
    const invoiceClean = cleanDocumentData(invoiceDoc.extractedData as Record<string, unknown>);
    const logisticsClean = cleanDocumentData(logisticsDoc.extractedData as Record<string, unknown>);

    // Run triple match
    const result = tripleMatch(contractClean, invoiceClean, logisticsClean);

    // Update all documents with match results
    const matchStatus = result.isMatched ? 'MATCHED' : 'MISMATCHED';
    const matchData = {
      matchStatus: matchStatus as 'MATCHED' | 'MISMATCHED',
      matchResult: result as unknown as Record<string, unknown>,
      matchScore: result.score,
    };

    await Promise.all([
      documentRepository.updateMatchResult(contractId, matchData),
      documentRepository.updateMatchResult(invoiceId, matchData),
      documentRepository.updateMatchResult(logisticsId, matchData),
    ]);

    return result;
  },
};
