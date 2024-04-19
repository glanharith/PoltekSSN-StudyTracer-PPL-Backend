import { AsyncParser } from '@json2csv/node';
import { Readable } from 'stream';
import { StreamableFile } from '@nestjs/common';

export const toCsvFile = async (
  data: Record<string, any>[],
): Promise<StreamableFile> => {
  const parser = new AsyncParser();
  const csvStream = parser.parse(data);

  const readableStream = new Readable().wrap(csvStream);

  return new StreamableFile(readableStream, {
    type: 'text/csv',
    disposition: 'attachment; filename="data.csv"',
  });
};
