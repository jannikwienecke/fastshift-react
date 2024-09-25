import {
  ComboxboxItem,
  FilterDateType,
  FilterOperatorType,
} from '@apps-next/core';
import { DEFAULT_DATE_OPTIONS, MONTHS, QUARTERS } from './filter.constants';
import { filterHelper, stringsToComboxboxItems } from './filter.utils';

class DateOptions {
  private value: string;
  private hasFromNow: boolean;
  private hasAgo: boolean;
  private hasDays: boolean;
  private hasWeek: boolean;
  private hasNumber: boolean;
  private hasMonth: boolean;
  constructor(value: string) {
    this.value = value.toLowerCase();
    this.hasFromNow =
      'from now'.includes(this.value) ||
      this.value.includes('from') ||
      this.value.includes('now');
    this.hasAgo = this.value.includes('ago');
    this.hasDays = this.value.includes('day');
    this.hasWeek = this.value.includes('we');
    this.hasMonth = this.value.includes('mon');
    this.hasNumber =
      /\d/.test(this.value) ||
      this.value.includes('one') ||
      this.value.includes('two');
  }

  private getYearFromNumber(value: string): number | undefined {
    const number = this.extractNumber(this.value);
    const isYear =
      (number?.toString().startsWith('201') ||
        number?.toString().startsWith('202')) &&
      number > 2000 &&
      number < 2030;

    if (isYear && number) {
      return number;
    }

    return undefined;
  }

  private generateOptions(
    value: string | number,
    items: (string | number)[],
    reverse?: boolean
  ): ComboxboxItem[] {
    return items.map((item) => {
      if (reverse) {
        return {
          id: value + ' ' + item,
          label: value + ' ' + item,
        };
      }

      return {
        id: item + ' ' + value,
        label: item + ' ' + value,
      };
    });
  }

  private generateFromNowOptions(num: number, unit: string) {
    return {
      id: `${num === 1 ? 'One' : num} ${num > 1 ? unit + 's' : unit} from now`,
      label: `${num === 1 ? 'One' : num} ${
        num > 1 ? unit + 's' : unit
      } from now`,
    };
  }

  private generateAgoOptions(num: number, unit: string) {
    return {
      id: `${num === 1 ? 'One' : num} ${num > 1 ? unit + 's' : unit} ago`,
      label: `${num === 1 ? 'One' : num} ${num > 1 ? unit + 's' : unit} ago`,
    };
  }

  private handleYearInput(): ComboxboxItem[] | null {
    const year = this.getYearFromNumber(this.value);

    if (!year) return null;

    const optionsMonths = this.generateOptions(year, MONTHS);
    const optionsQuarters = this.generateOptions(year, QUARTERS);

    if (year.toString() === this.value) {
      // we typed 2024 for example
      return [
        {
          id: this.value,
          label: this.value,
        },
        ...optionsMonths,
        ...optionsQuarters,
      ];
    } else {
      const valueWithoutNumber = this.value
        .replace(/\d+/g, '')
        .split(' ')
        .join('');

      return [
        {
          id: year.toString(),
          label: year.toString(),
        },
        ...[...optionsMonths, ...optionsQuarters].filter((o) => {
          return o.id.toString().toLowerCase().includes(valueWithoutNumber);
        }),
      ];
    }
  }

  private getYearsAroundCurrentYear(): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 1; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  }

  private handleOnlyMonthInput(): ComboxboxItem[] | null {
    const monthsStartingLetters = MONTHS.map((m) =>
      m.slice(0, 2).toLowerCase()
    );
    const matchingMonths = monthsStartingLetters.filter((m) =>
      this.value.includes(m)
    );
    const months = MONTHS.filter((m) => m.toLowerCase().includes(this.value));

    const matchingQuarters = QUARTERS.filter((q) =>
      this.value.includes(q.toLowerCase())
    );

    const currentYear = new Date().getFullYear();
    const years = this.getYearsAroundCurrentYear();

    if (matchingMonths.length === 1 && months.length === 1) {
      const month = months[0];

      return this.generateOptions(month, years, true);
    } else if (matchingMonths.length && months.length > 0) {
      return this.generateOptions(currentYear, months);
    } else if (matchingQuarters.length && matchingQuarters.length > 0) {
      return this.generateOptions(currentYear, matchingQuarters);
    }

    return null;
  }

  private getDate(): ComboxboxItem[] | null {
    const optionsYear = this.handleYearInput();
    const optionsMonth = this.handleOnlyMonthInput();

    if (optionsYear) return optionsYear;
    if (optionsMonth) return optionsMonth;

    return null;
  }

  public getOptions(): ComboxboxItem[] {
    let options: ComboxboxItem[] = [];
    if (!this.value) {
      options = this.getDefaultOptions();
    } else if (this.getDate()) {
      const dateOptions = this.getDate();
      if (!dateOptions) throw new Error('Date options not found');
      options = dateOptions;
    } else if (this.hasWeek || this.hasDays || this.hasMonth) {
      options = this.getWeekMonthDayOptions();
    } else if (this.hasNumber || this.hasFromNow || this.hasAgo) {
      options = this.getNumberOptions();
    } else {
      options = this.getDefaultOptions();
    }

    const defaultOptions = stringsToComboxboxItems(
      DEFAULT_DATE_OPTIONS.filter((option) =>
        option.toLowerCase().includes(this.value)
      ).filter((option) => !options.some((o) => o.id === option))
    );

    return [...defaultOptions, ...options];
  }

  private getDefaultOptions(): ComboxboxItem[] {
    const selectSpecificDate = 'Select specific date';

    const allFiltered = DEFAULT_DATE_OPTIONS.filter((option) =>
      option.toLowerCase().includes(this.value)
    );

    return stringsToComboxboxItems([selectSpecificDate, ...allFiltered]);
  }

  private getWeekMonthDayOptions(): ComboxboxItem[] {
    const unit = this.hasWeek ? 'week' : this.hasMonth ? 'month' : 'day';
    const number = this.extractNumber(this.value);
    const numbers = number ? [number] : [4, 6];

    return numbers.reduce((acc, num) => {
      if (this.hasFromNow || !this.hasAgo) {
        acc.push(this.generateFromNowOptions(num, unit));
      }

      if (this.hasAgo || !this.hasFromNow) {
        acc.push(this.generateAgoOptions(num, unit));
      }

      return acc;
    }, [] as ComboxboxItem[]);
  }

  private getNumberOptions(): ComboxboxItem[] {
    const number = this.extractNumber(this.value) || 1;
    const units = ['day', 'week', 'month'];

    const defaultOptions = number ? [] : this.getFilteredStaticOptions();
    return units.reduce((acc, unit) => {
      if (this.hasFromNow || !this.hasAgo) {
        acc.push(this.generateFromNowOptions(number, unit));
      }
      if (this.hasAgo || !this.hasFromNow) {
        acc.push(this.generateAgoOptions(number, unit));
      }

      return acc;
    }, defaultOptions as ComboxboxItem[]);
  }

  private getFilteredStaticOptions(): ComboxboxItem[] {
    return stringsToComboxboxItems(
      DEFAULT_DATE_OPTIONS.filter((option) =>
        option.toLowerCase().includes(this.value)
      )
    );
  }

  private extractNumber(text: string): number | null {
    if (text.includes('one')) {
      return 1;
    }
    if (text.includes('two')) {
      return 2;
    }
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }
}

class DateOptionParser {
  public static parse(
    option: string,
    operator: FilterOperatorType
  ): FilterDateType | null {
    const lowerOption = option.toString().toLowerCase();
    let number = lowerOption.match(/\d+/)
      ? parseInt(lowerOption.match(/\d+/)?.[0] || '', 10)
      : null;

    if (lowerOption.includes('one')) {
      number = 1;
    }

    const { year, month, quarter, isIsoDate } = filterHelper(lowerOption);

    if (isIsoDate) {
      return {
        operator: 'equal to',
        value: lowerOption,
        unit: 'iso-date',
      };
    } else if (quarter || month || year) {
      return {
        operator: 'equal to',
        value: lowerOption,
        unit: quarter ? 'quarter' : month ? 'month' : 'year',
      };
    }

    if (lowerOption.endsWith('from now') && number) {
      const unit = lowerOption.split(' ')[1];
      return {
        operator: operator.label === 'before' ? 'equal to' : 'greater than',
        value: number,
        unit: unit as FilterDateType['unit'],
      };
    } else if (lowerOption.endsWith(' ago') && number) {
      const unit = lowerOption.split(' ')[1];
      return {
        operator: operator.label === 'after' ? 'equal to' : 'less than',
        value: number * -1,
        unit: unit as FilterDateType['unit'],
      };
    } else if (lowerOption.startsWith('this ')) {
      const unit = lowerOption.split(' ')[1];
      return { operator: 'equal to', unit: unit as FilterDateType['unit'] };
    } else if (lowerOption.startsWith('last ')) {
      const unit = lowerOption.split(' ')[1];
      return {
        operator: 'equal to',
        unit: unit as FilterDateType['unit'],
        value: -1,
      };
    } else {
      const validOptions = ['today', 'tomorrow', 'yesterday'];
      if (validOptions.includes(lowerOption)) {
        return {
          operator: 'equal to',
          unit: lowerOption as FilterDateType['unit'],
        };
      }

      if (lowerOption.includes('no date defined')) {
        return null;
      }

      throw new Error(`Invalid option format: ${option}`);
    }
  }
}

class DateCalculator {
  public static getStartAndEndDate(
    dateFilter: FilterDateType | null | undefined
  ) {
    const { unit, operator, value: valueRaw } = dateFilter ?? {};

    if (!unit || !operator) {
      return { start: undefined, end: undefined };
    }

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const dict = {
      today: {
        gt: startOfDay,
        lt: endOfDay,
      },
      tomorrow: {
        gt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
        lt: new Date(endOfDay.getTime() + 24 * 60 * 60 * 1000),
      },
      yesterday: {
        gt: new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000),
        lt: new Date(endOfDay.getTime() - 24 * 60 * 60 * 1000),
      },
    };

    const compareStatic =
      unit in dict ? dict[unit as keyof typeof dict] : undefined;

    if (compareStatic) {
      return {
        start: compareStatic.gt,
        end: compareStatic.lt,
      };
    }

    const { year, month, quarter } = filterHelper(
      valueRaw?.toString().toLowerCase() || ''
    );

    const isIsoDate = unit === 'iso-date';

    const value = month || quarter || year ? 1 : +(valueRaw || 1);

    const multiplier =
      unit === 'weeks' || unit === 'week'
        ? 7
        : unit === 'months' || unit === 'month'
        ? 30
        : 1;

    let start: Date | undefined;
    let end: Date | undefined;

    if (isIsoDate && valueRaw) {
      const date = new Date(valueRaw.toString());
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();

      start = new Date(year, month, day + 1);
      end = new Date(year, month, day + 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return { start, end };
    } else if (month && valueRaw && typeof valueRaw === 'string') {
      const year = valueRaw?.split(' ')[1];
      const month = valueRaw?.split(' ')[0];
      const index = MONTHS.map((m) => m.toLowerCase()).indexOf(
        month.toLowerCase()
      );

      const start = new Date(+year, index, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

      return { start, end };
    } else if (quarter && valueRaw && typeof valueRaw === 'string') {
      const year = valueRaw?.split(' ')[1];
      const quarter = valueRaw?.split(' ')[0].toLowerCase();

      switch (quarter) {
        case 'q1':
          start = new Date(+year, 0, 1);
          end = new Date(+year, 2, 31);
          break;
        case 'q2':
          start = new Date(+year, 3, 1);
          end = new Date(+year, 5, 30);
          break;
        case 'q3':
          start = new Date(+year, 6, 1);
          end = new Date(+year, 8, 30);
          break;
        case 'q4':
          start = new Date(+year, 9, 1);
          end = new Date(+year, 11, 31);
          break;
      }

      return { start, end };
    } else if (year && valueRaw && typeof valueRaw === 'string') {
      start = new Date(+valueRaw, 0, 1);
      end = new Date(+valueRaw, 11, 31);
      return { start, end };
    } else if (unit === 'weeks' || unit === 'week') {
      start = new Date();
      end = new Date();
      //   if unit is "week" -> start should be the first of the week
      if (unit === 'week') start.setDate(start.getDate() - start.getDay());

      end.setDate(start.getDate() + multiplier * (value || 1));
    } else if (unit === 'months' || unit === 'month') {
      start = new Date();

      if (unit === 'month') start.setDate(1);

      end = new Date();
      end.setDate(start.getDate() + multiplier * (value || 1));
    } else if (unit === 'day' || unit === 'days') {
      start = new Date();
      end = new Date();
      start.setDate(start.getDate());
      end.setDate(end.getDate() + (value || 1));
      // set end date time to 23:59:59
      end.setHours(23, 59, 59, 999);
    } else if (unit === 'year') {
      start = new Date();
      end = new Date();

      start.setMonth(0);
      start.setDate(1);

      end.setMonth(11);
      end.setDate(31);
    }

    const _start = (value || 1) < 0 ? end : start;
    const _end = (value || 1) < 0 ? start : end;

    _start?.setHours(0, 0, 0, 0);
    _end?.setHours(23, 59, 59, 999);

    if (operator === 'greater than') {
      return { start: _end, end: undefined };
    }

    if (operator === 'less than') {
      return { start: undefined, end: _start };
    }

    return { start: _start, end: _end };
  }
}

/**
 * Checks if a given string is a valid ISO 8601 date string.
 *
 * @param str The string to check.
 * @returns True if the string is a valid ISO 8601 date string, false otherwise.
 */
export function isValidISOString(str: string): boolean {
  if (typeof str !== 'string') {
    return false;
  }

  // Regular expression for ISO 8601 date format
  // This regex allows for:
  // - Optional fractional seconds
  // - Optional timezone offset
  const isoRegex =
    /^\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:\d{2}(\.\d+)?(z|([+-]\d{2}:\d{2}))$/;

  if (!isoRegex.test(str.toLowerCase())) {
    return false;
  }

  // Additional check: Try parsing the string as a date
  const date = new Date(str);
  return !isNaN(date.getTime());
}

export const dateUtils = {
  getOptions: (value: string): ComboxboxItem[] => {
    const dateOptions = new DateOptions(value);
    return dateOptions.getOptions();
  },
  parseOption: (
    option: string,
    operator: FilterOperatorType
  ): FilterDateType | null => {
    return DateOptionParser.parse(option, operator);
  },

  getStartAndEndDate: (dateFilter: FilterDateType | null | undefined) => {
    return DateCalculator.getStartAndEndDate(dateFilter);
  },
};
