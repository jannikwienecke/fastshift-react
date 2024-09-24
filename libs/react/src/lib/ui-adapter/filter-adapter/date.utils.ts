import { ComboxboxItem, FilterDateType } from '@apps-next/core';

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

  public getOptions(): ComboxboxItem[] {
    if (!this.value) {
      return this.getDefaultOptions();
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
    ].map((option) => ({ id: option, label: option }));

    const all = [...DateOptions.staticOptions, ...additionalOptions];

    const allFiltered = all.filter((option) =>
      option.label.toLowerCase().includes(this.value)
    );

    return [...allFiltered, selectSpecificDate];
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
          id: `${num} ${unit} from now`,
          label: `${num} ${unit} from now`,
        });
      }
      if (this.hasAgo || !this.hasFromNow) {
        options.push({ id: `${num} ${unit} ago`, label: `${num} ${unit} ago` });
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
  public static parse(option: string): FilterDateType {
    const lowerOption = option.toLowerCase();
    let number = lowerOption.match(/\d+/)
      ? parseInt(lowerOption.match(/\d+/)?.[0] || '', 10)
      : null;

    if (lowerOption.includes('one')) {
      number = 1;
    }

    if (lowerOption.endsWith('from now') && number) {
      const unit = lowerOption.split(' ')[1];
      return {
        operator: 'equal to',
        value: number,
        unit: unit as FilterDateType['unit'],
      };
    } else if (lowerOption.endsWith(' ago') && number) {
      const unit = lowerOption.split(' ')[1];
      return {
        operator: 'less than',
        value: number,
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
        default:
          throw new Error(`Invalid option format: ${option}`);
      }
    }
  }
}

class DateCalculator {
  public static getStartAndEndDate(dateFilter: FilterDateType) {
    const { unit, operator, value: valueRaw } = dateFilter;

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

    const value = operator === 'less than' ? (valueRaw ?? 1) * -1 : valueRaw;

    const multiplier =
      unit === 'weeks' || unit === 'week'
        ? 7
        : unit === 'months' || unit === 'month'
        ? 30
        : 1;

    let start: Date | undefined;
    let end: Date | undefined;

    if (unit === 'weeks' || unit === 'week') {
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

    return { start: _start, end: _end };
  }
}

export const dateUtils = {
  getOptions: (value: string): ComboxboxItem[] => {
    const dateOptions = new DateOptions(value);
    return dateOptions.getOptions();
  },
  parseOption: (option: string): FilterDateType => {
    return DateOptionParser.parse(option);
  },

  getStartAndEndDate: (dateFilter: FilterDateType) => {
    return DateCalculator.getStartAndEndDate(dateFilter);
  },
};
