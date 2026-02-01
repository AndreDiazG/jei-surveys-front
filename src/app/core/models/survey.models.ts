export interface Survey {
  id: number;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  // questions?: Question[];
}
