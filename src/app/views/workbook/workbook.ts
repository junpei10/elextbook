import { ListData } from 'src/app/service/list-data-session';

export interface WorkbookData extends ListData {
  title: string;
  shortTitle: string;
  theme: string;
  pathname: string;
  gameType: 'default' | 'denko';
  category: '電工２種' | '電工１種' | '電工まとめ' | '厳選問題' | string;
}

export let WORKBOOK_CURRENT_DATA: { current: WorkbookData | null } = {
  current: null
};
