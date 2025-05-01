export interface CreateTaskDto {
    title: string;
    description: string;
    userId: string;
  }
  
  export interface UpdateTaskDto {
    title?: string;
    description?: string;
    completed?: boolean;
    userId: string;
  }
  