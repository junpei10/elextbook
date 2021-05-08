export interface USER {
  name: string;
  id: string;
  config: {
    darkTheme?: boolean;
  };
}

export const LOCAL_USER: USER = {
  name: '',
  id: '',
  config: {}
} as const;
