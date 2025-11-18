export interface Metric {
  name: string;
  help: string;
  type: string;
  values: {
    value: number;
    labels: Record<string, string>;
  }[];
}

export function parseMetrics(metrics: string): Metric[] {
  const lines = metrics.split('\n');
  const result: Metric[] = [];
  let currentMetric: Metric | null = null;

  for (const line of lines) {
    if (line.startsWith('# HELP')) {
      const parts = line.split(' ');
      const name = parts[2];
      const help = parts.slice(3).join(' ');
      currentMetric = { name, help, type: '', values: [] };
    } else if (line.startsWith('# TYPE')) {
      if (currentMetric) {
        currentMetric.type = line.split(' ')[3];
        result.push(currentMetric);
      }
    } else if (line && !line.startsWith('#')) {
      const metric = result.find((m) => line.startsWith(m.name));
      if (metric) {
        const [nameAndLabels, value] = line.split(' ');
        const labelsMatch = nameAndLabels.match(/{(.*)}/);
        const labels = labelsMatch
          ? labelsMatch[1].split(',').reduce((acc, label) => {
              const [key, value] = label.split('="');
              acc[key] = value.slice(0, -1);
              return acc;
            }, {} as Record<string, string>)
          : {};
        metric.values.push({ value: parseFloat(value), labels });
      }
    }
  }

  return result;
}
