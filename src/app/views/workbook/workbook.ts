import { ListData } from 'src/app/service/list-data-session';

export interface WorkbookData extends ListData {
  title: string;
  desc: string;
  index: number;
  shortTitle: string; // remove
  thumbnail: string;
  theme: string;
  pathname: string;
  games: {
    type: string,
    index: number,
    name: string,
    buttonToOpenDialog?: string;
    dialogContent?: string;
  }[];
  category: '電工２種' | '電工１種' | '電工まとめ' | '厳選問題' | string;
  disabled?: boolean;
}

export let WORKBOOK_CURRENT_DATA: { current: WorkbookData | null } = {
  current: null
};
