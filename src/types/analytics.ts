export interface MetricOverview {
  avg_age: number;
  median_age: number;
  male_count: number;
  female_count: number;
  male_percentage: number;
  female_percentage: number;
  urban_count: number;
  rural_count: number;
  urban_percentage: number;
  rural_percentage: number;
}

export interface DistributionItem {
  name: string;
  count: number;
  percentage: number;
}

export interface AgeDistributionItem {
  range: string;
  count: number;
  percentage: number;
}

export interface AnalyticsOverviewPayload {
  dataset_name: string;
  total_personas: number;
  metrics: MetricOverview;
  charts: {
    age_distribution: AgeDistributionItem[];
    marital_status: DistributionItem[];
    education_level: DistributionItem[];
    zone: DistributionItem[];
    region: DistributionItem[];
    top_occupations: DistributionItem[];
  };
}

export type FilterKey = 'all' | 'urban' | 'rural' | 'male' | 'female';
