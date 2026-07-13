import { TransmissionSpan, VegetationEvent, Criticidade } from '../types';

/**
 * Event Generator:
 * Automatically creates operational events when:
 * - Vegetation Index > 0.75
 * - Clearance Risk > 0.70
 * - Growth Rate 30d > 15%
 * - Priority Score > 80
 */
export function generateEventsFromSpans(spans: TransmissionSpan[], existingEvents: VegetationEvent[] = []): VegetationEvent[] {
  const generated: VegetationEvent[] = [...existingEvents];
  const existingSpanIds = new Set(existingEvents.map(e => e.spanId));

  const responsibleList = [
    'Eng. Marcos Silveira (Operação)',
    'Eng. Ana Carolina (Vegetação)',
    'Téc. Roberto Alves (Campo)',
    'Gestora Cláudia Mendonça (P&M)',
    'Inspetor Lucas Ferreira'
  ];

  spans.forEach((span, index) => {
    const shouldCreate =
      span.vegetationIndex > 0.75 ||
      span.clearanceRisk > 0.70 ||
      span.growth30d > 15 ||
      span.priorityScore > 80;

    if (shouldCreate && !existingSpanIds.has(span.id)) {
      let criticidade: Criticidade = 'Normal';
      if (span.priorityScore >= 80 || span.clearanceRisk >= 0.8) criticidade = 'Critica';
      else if (span.priorityScore >= 60 || span.clearanceRisk >= 0.7) criticidade = 'Alta';
      else if (span.priorityScore >= 40) criticidade = 'Atencao';

      let deadlineDays = 30;
      if (criticidade === 'Critica') deadlineDays = 3;
      else if (criticidade === 'Alta') deadlineDays = 10;
      else if (criticidade === 'Atencao') deadlineDays = 20;

      const date = new Date();
      date.setDate(date.getDate() + deadlineDays);
      const recommendedDeadline = date.toISOString().split('T')[0];

      generated.push({
        id: `EVT-${1000 + generated.length + 1}`,
        lineName: span.lineName,
        spanId: span.id,
        startTower: span.startTower,
        endTower: span.endTower,
        region: span.region,
        criticidade,
        vegetationIndex: span.vegetationIndex,
        growth30d: span.growth30d,
        clearanceRisk: span.clearanceRisk,
        detectionDate: span.lastInspectionDate || new Date().toISOString().split('T')[0],
        recommendedDeadline,
        status: criticidade === 'Critica' ? 'Aberto' : 'Em analise',
        responsible: responsibleList[index % responsibleList.length],
        action: span.recommendedAction || 'Roçada mecanizada / poda seletiva'
      });
    }
  });

  return generated;
}
