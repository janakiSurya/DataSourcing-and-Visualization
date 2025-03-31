// Types for API responses and requests

// Filter types
export interface SourceAFilter {
  min_price?: number;
  max_price?: number;
  property_types?: string[];
  locations?: string[];
  min_listing_date?: string;
  max_listing_date?: string;
}

export interface SourceBFilter {
  min_price?: number;
  max_price?: number;
  property_types?: string[];
  locations?: string[];
  min_bedrooms?: number;
  max_bedrooms?: number;
}

// Task types
export interface TaskCreate {
  name: string;
  source_a_enabled: boolean;
  source_b_enabled: boolean;
  source_a_filters?: SourceAFilter;
  source_b_filters?: SourceBFilter;
}

export interface TaskResponse {
  id: number;
  name: string;
  status: string;
  created_at: string;
  completed_at?: string;
}

// Property listing type
export interface PropertyListing {
  id: number;
  property_id: string;
  task_id: number;
  data_source: string;
  location: string;
  property_type: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  listing_date: string;
  description?: string;
}

// Analytics types
export interface Analytics {
  task_id: number;
  count: number;
  analytics: {
    avg_price_by_location: Record<string, number>;
    avg_price_by_type: Record<string, number>;
    listings_by_month: Record<string, number>;
    bedroom_distribution: Record<string | number, number>;
  };
} 