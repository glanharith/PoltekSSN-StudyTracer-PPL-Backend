import { StreamableFile } from '@nestjs/common';
import { BookType, utils, write } from 'xlsx';

export const toSheetsFile = async (
  data: Record<string, any>[],
  name: string,
  type: string,
): Promise<StreamableFile> => {
  const ws = utils.json_to_sheet(data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Data');

  const buf = write(wb, { type: 'buffer', bookType: type as BookType });

  return new StreamableFile(buf, {
    type:
      type === 'csv'
        ? 'type/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    disposition: `attachment; filename="${name}.${type}"`,
  });
};
