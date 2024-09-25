import {
  ComboxboxItem,
  FilterDateType,
  FilterOperatorType,
} from '@apps-next/core';

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

class DateOptions {
  private static staticOptions: ComboxboxItem[] = [
    'Today',
    'Tomorrow',
    'Yesterday',
    'This week',
    'Last week',
    'This month',
    'Last month',
    'This year',
    'Last year',
  ].map((name) => ({ id: name, label: name }));

  private static months = MONTHS;
  private static quarters = QUARTERS;

  private value: string;
  private hasFromNow: boolean;
  private hasAgo: boolean;
  private hasDays: boolean;
  private hasWeek: boolean;
  private hasMonth: boolean;
  private hasNumber: boolean;

  constructor(value: string) {
    this.value = value.toLowerCase();
    this.hasFromNow =
      'from now'.includes(this.value) ||
      this.value.includes('from') ||
      this.value.includes('now');
    this.hasAgo = this.value.includes('ago');
    this.hasDays = this.value.includes('days');
    this.hasWeek = this.value.includes('week');
    this.hasMonth = this.value.includes('month');
    this.hasNumber =
      /\d/.test(this.value) ||
      this.value.includes('one') ||
      this.value.includes('two');
  }

  private getDate(): ComboxboxItem[] | null {
    const number = this.extractNumber(this.value);

    if (
      (number?.toString().startsWith('201') ||
        number?.toString().startsWith('202')) &&
      number > 2000 &&
      number < 2030
    ) {
      const optionsMonths = DateOptions.months.map((month) => {
        return {
          id: month + ' ' + number,
          label: month + ' ' + number,
        };
      });

      const optionsQuarters = DateOptions.quarters.map((quarter) => {
        return {
          id: quarter + ' ' + number,
          label: quarter + ' ' + number,
        };
      });

      if (number.toString() === this.value) {
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
            id: number.toString(),
            label: number.toString(),
          },
          ...[...optionsMonths, ...optionsQuarters].filter((o) => {
            return o.id.toLowerCase().includes(valueWithoutNumber);
          }),
        ];
      }
    }

    const matchingMonths = MONTHS.map((m) => m.slice(0, 2).toLowerCase());

    const isMonth = matchingMonths.filter((m) => this.value.includes(m));
    const months = MONTHS.filter((m) => m.toLowerCase().includes(this.value));

    const matchingQuarters = QUARTERS.filter((q) =>
      this.value.includes(q.toLowerCase())
    );
    // TODOL hier weiter machen. check ob alles passt
    // tests schreiben....
    // after tests: refactor this and the operator utils page
    // handle use case: switch between match all filters and match any filters
    const currentYear = new Date().getFullYear();

    const years = [];
    for (let i = currentYear - 1; i <= currentYear + 2; i++) {
      years.push(i);
    }

    if (isMonth.length === 1 && months.length === 1) {
      const month = months[0];

      return years.map((year) => ({
        id: month + ' ' + year,
        label: month + ' ' + year,
      }));
    } else if (isMonth.length && months.length > 0) {
      return months.map((m) => ({
        id: m + ' ' + currentYear,
        label: m + ' ' + currentYear,
      }));
    } else if (matchingQuarters.length && matchingQuarters.length > 0) {
      return matchingQuarters.map((q) => ({
        id: q + ' ' + currentYear,
        label: q + ' ' + currentYear,
      }));
    }

    return null;
  }

  public getOptions(): ComboxboxItem[] {
    if (!this.value) {
      return this.getDefaultOptions();
    } else if (this.getDate()) {
      const dateOptions = this.getDate();
      if (!dateOptions) throw new Error('Date options not found');
      return dateOptions;
    } else if (this.hasWeek || this.hasDays) {
      return this.getWeekOrDayOptions();
    } else if (this.hasFromNow || this.hasAgo) {
      return this.getRelativeOptions();
    } else if (this.hasNumber) {
      return this.getNumberOptions();
    } else {
      return this.getDefaultOptions();
    }
  }

  private getDefaultOptions(): ComboxboxItem[] {
    const selectSpecificDate = {
      id: 'Select specific date',
      label: 'Select specific date',
    };

    const additionalOptions = [
      '3 days from now',
      '3 days ago',
      'One week from now',
      'One week ago',
      'One month from now',
      'One month ago',
      'No date defined',
    ].map((option) => ({ id: option, label: option }));

    const all = [...DateOptions.staticOptions, ...additionalOptions];

    const allFiltered = all.filter((option) =>
      option.label.toLowerCase().includes(this.value)
    );

    return [selectSpecificDate, ...allFiltered];
  }

  private getWeekOrDayOptions(): ComboxboxItem[] {
    const unit = this.hasWeek ? 'week' : 'day';
    const number = this.extractNumber(this.value) || 1;
    const numbers = number ? [number] : [1, 3, 7];
    const options: ComboxboxItem[] = [];

    if (number === 1 && !this.hasFromNow && !this.hasAgo) {
      options.push({ id: `This ${unit}`, label: `This ${unit}` });
      options.push({ id: `Last ${unit}`, label: `Last ${unit}` });
    }

    numbers.forEach((num) => {
      if (this.hasFromNow || !this.hasAgo) {
        options.push({
          id: `${num === 1 ? 'One' : num} ${
            num > 1 ? unit + 's' : unit
          } from now`,
          label: `${num === 1 ? 'One' : num} ${
            num > 1 ? unit + 's' : unit
          } from now`,
        });
      }
      if (this.hasAgo || !this.hasFromNow) {
        options.push({
          id: `${num === 1 ? 'One' : num} ${num > 1 ? unit + 's' : unit} ago`,
          label: `${num === 1 ? 'One' : num} ${
            num > 1 ? unit + 's' : unit
          } ago`,
        });
      }
    });

    return options;
  }

  private getRelativeOptions(): ComboxboxItem[] {
    const options = this.getFilteredStaticOptions();
    const units = ['day', 'week', 'month'];
    const number = this.extractNumber(this.value) || 1;

    units.forEach((unit) => {
      const unitLabel = number === 1 ? unit : `${unit}s`;
      if (this.hasFromNow || !this.hasAgo) {
        options.push({
          id: `${number} ${unitLabel} from now`,
          label: `${number} ${unitLabel} from now`,
        });
      }
      if (this.hasAgo || !this.hasFromNow) {
        options.push({
          id: `${number} ${unitLabel} ago`,
          label: `${number} ${unitLabel} ago`,
        });
      }
    });

    return options;
  }

  private getNumberOptions(): ComboxboxItem[] {
    const number = this.extractNumber(this.value) || 1;
    const units = ['day', 'week', 'month'];
    const options: ComboxboxItem[] = [];

    units.forEach((unit) => {
      const unitLabel = number === 1 ? unit : `${unit}s`;
      options.push({
        id: `${number} ${unitLabel} from now`,
        label: `${number} ${unitLabel} from now`,
      });
      options.push({
        id: `${number} ${unitLabel} ago`,
        label: `${number} ${unitLabel} ago`,
      });
    });

    return options;
  }

  private getFilteredStaticOptions(): ComboxboxItem[] {
    return DateOptions.staticOptions.filter((option) =>
      option.label.toLowerCase().includes(this.value)
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

    const includesQuarter = QUARTERS.some((quarter) =>
      lowerOption.includes(quarter.toLowerCase())
    );

    const includesMonth = MONTHS.some((month) =>
      lowerOption.includes(month.toLowerCase())
    );

    const isYear = ['201', '202', '203'].some((year) =>
      lowerOption.includes(year)
    );

    const isIsoDate = !Number.isNaN(new Date(lowerOption)?.getTime());

    if (isIsoDate) {
      return {
        operator: 'equal to',
        value: lowerOption,
        unit: 'iso-date',
      };
    } else if (includesQuarter || includesMonth || isYear) {
      return {
        operator: 'equal to',
        value: lowerOption,
        unit: includesQuarter ? 'quarter' : 'month',
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
      switch (lowerOption) {
        case 'today':
          return { operator: 'equal to', unit: 'today' };
        case 'tomorrow':
          return { operator: 'equal to', unit: 'tomorrow' };
        case 'yesterday':
          return { operator: 'equal to', unit: 'yesterday' };
        case 'no date defined':
          return null;
        default:
          throw new Error(`Invalid option format: ${option}`);
      }
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

    // const value = operator === 'less than' ? (valueRaw ?? 1) * -1 : valueRaw;
    const isMonths = MONTHS.some((month) =>
      valueRaw?.toString().includes(month.toLowerCase())
    );

    const isQuarters = QUARTERS.some((quarter) =>
      valueRaw?.toString().includes(quarter.toLowerCase())
    );

    const isYear = ['201', '202', '203'].some((year) =>
      valueRaw?.toString().includes(year)
    );

    const isIsoDate = unit === 'iso-date';

    const value = isMonths || isQuarters || isYear ? 1 : +(valueRaw || 1);

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

      start = new Date(date.setHours(0, 0, 0, 0));
      end = new Date(date.setHours(23, 59, 59, 999));

      return { start, end };
    } else if (isMonths && valueRaw && typeof valueRaw === 'string') {
      const year = valueRaw?.split(' ')[1];
      const month = valueRaw?.split(' ')[0];
      const index = MONTHS.map((m) => m.toLowerCase()).indexOf(
        month.toLowerCase()
      );

      const start = new Date(+year, index, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

      return { start, end };
    } else if (isQuarters && valueRaw && typeof valueRaw === 'string') {
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
    } else if (isYear && valueRaw && typeof valueRaw === 'string') {
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
