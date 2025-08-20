export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'manual' | 'brochure';
  file_url: string;
  file_name: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      resources: {
        Row: Resource;
        Insert: Omit<Resource, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Resource, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}