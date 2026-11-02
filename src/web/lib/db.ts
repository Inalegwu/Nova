import Dexie, { type EntityTable } from 'dexie';

export type Progress = {
  issueId: string;
  chapterIndex: number;
  updatedAt: number;
};

export const store = new Dexie('nova-progress') as Dexie & {
  progress: EntityTable<Progress>;
};

store.version(1).stores({
  progrss: 'issueId, updatedAt',
});
