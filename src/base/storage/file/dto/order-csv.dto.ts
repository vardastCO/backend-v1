import { CsvColumn } from 'nest-csv-parser';

export class UserDto {
  @CsvColumn('name')
  name: string;

  @CsvColumn('date')
  date: string;

  // Define other fields if necessary
}
