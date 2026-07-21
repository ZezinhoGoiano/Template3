/* ================================================================
   APEX MOTORS — financing-utils.js
   Calcula opções de financiamento e desconto
   Usado no admin (cálculo) e no site público (exibição)
================================================================ */

'use strict';

const FinancingUtils = (() => {
  // Candidatos de parcelas, do maior pro menor (mais parcelas = mais atrativo)
  const INSTALLMENT_CANDIDATES = [10, 8, 6, 5, 4, 3, 2];

  /**
   * Calcula até 3 opções de parcelamento sem entrada,
   * escolhendo divisores "exatos" (sem sobra de centavos).
   */
  const calculateFinancingOptions = (price) => {
    if (!price || price <= 0) return [];

    const priceCents = Math.round(price * 100);

    // Filtra apenas parcelas que dividem o preço exatamente
    const exact = INSTALLMENT_CANDIDATES.filter(
      (count) => priceCents % count === 0
    );

    let chosen;
    if (exact.length <= 3) {
      chosen = exact;
    } else {
      // Pega a maior, a menor e uma do meio — pra ter variedade
      const sorted = [...exact].sort((a, b) => b - a);
      const max = sorted[0];
      const min = sorted[sorted.length - 1];
      const mid = sorted[Math.floor(sorted.length / 2)];
      chosen = [...new Set([max, mid, min])];
    }

    chosen.sort((a, b) => b - a); // mais parcelas primeiro

    // Fallback: se nenhum divisor for exato, usa 2x com entrada cobrindo a sobra
    if (chosen.length === 0) {
      const count = 2;
      const value = Math.floor(priceCents / count) / 100;
      const entry = Math.round((price - value * count) * 100) / 100;
      return [{ installments: count, value, entry: Math.max(entry, 0) }];
    }

    return chosen.map((count) => ({
      installments: count,
      value: Math.round(priceCents / count) / 100,
      entry: 0,
    }));
  };

  /**
   * Calcula a porcentagem de desconto entre preço cheio e preço com desconto
   */
  const calculateDiscountPercent = (originalPrice, discountPrice) => {
    if (!originalPrice || !discountPrice || discountPrice >= originalPrice) return 0;
    const percent = (1 - discountPrice / originalPrice) * 100;
    return Math.round(percent * 100) / 100; // 2 casas decimais
  };

  return { calculateFinancingOptions, calculateDiscountPercent };
})();

window.FinancingUtils = FinancingUtils;
