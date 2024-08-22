import { atomWithDebounce, waitFor } from '@apps-next/core';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Label,
} from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import React, { useState } from 'react';

const people = [
  { id: 1, name: 'Leslie Alexander' },
  { id: 2, name: 'Michaela Walter' },
  { id: 3, name: 'Kevin Johnson' },
  { id: 4, name: 'Jack Black' },
  { id: 5, name: 'Katelyn Rohan' },
];

export const queryAtom = atom('');

export const {
  isDebouncingAtom,
  debouncedValueAtom: debouncedQueryAtom,
  clearTimeoutAtom,
  currentValueAtom,
} = atomWithDebounce('');

export type ComboboxProps<
  T extends {
    id: string;
    label: string;
  }
> = {
  inputProps: {
    query: string;
    onChange: (query: string) => void;
    onBlur?: () => void;
  };
  listProps: {
    values: T[];
    onSelectedChange: (value: T | null) => void;
  };

  comboboxProps: {
    onChange: (value: T) => void;
    selected: T | null;
  };
};

const useQuery_ = <T extends { id: string; label: string }>({
  query,
}: {
  query: string;
}) => {
  const [data, setData] = useState<T[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      console.log('Fetch: ', query);
      await waitFor(1000);
      setData(
        (
          people.map((person) => ({
            id: person.id.toString(),
            label: person.name,
          })) as T[]
        ).filter((person) =>
          person.label.toLowerCase().includes(query.toLowerCase())
        )
      );
    };

    fetchData();
  }, [query]);

  return { data: data };
};

type ComboboxState<T extends { id: string; label: string }> = {
  values: T[];
  selected: null | T;
  query: string;
  debouncedQuery: string;
};

const comboboxAtom = atom<ComboboxState<any>>({
  values: [],
  selected: null,
  query: '',
  debouncedQuery: '',
});

const comboboxStateAtom = atom(
  (get) => {
    const debouncedQuery = get(debouncedQueryAtom);
    const query = get(currentValueAtom);

    return {
      values: get(comboboxAtom).values,
      selected: get(comboboxAtom).selected,
      query: query,
      debouncedQuery: debouncedQuery,
    };
  },
  (get, set, update: Partial<ComboboxState<any>>) => {
    set(comboboxAtom, {
      ...get(comboboxAtom),
      ...update,
    });
  }
);

export const testAtom = atom((get) => get(debouncedQueryAtom).length);

const updateValuesAtom = atom(
  null,
  (get, set, update: Partial<ComboboxState<any>>) => {
    set(comboboxAtom, {
      ...get(comboboxAtom),
      ...update,
    });
  }
);

export const useCombobox = <
  T extends { id: string; label: string }
>(): (() => ComboboxProps<T>) => {
  const state = useAtomValue(comboboxStateAtom);
  const updateValues = useSetAtom(updateValuesAtom);
  const setDebouncedValue = useSetAtom(debouncedQueryAtom);

  const { data } = useQuery_<T>({ query: state.debouncedQuery || '' });

  const getComboboxProps = () => {
    return {
      listProps: {
        values: data,
        onSelectedChange: (value) => {
          updateValues({
            selected: value,
          });
        },
      },
      comboboxProps: {
        onChange: (value) => {
          updateValues({
            selected: value,
          });
        },
        selected: state.selected,
      },
      inputProps: {
        query: state.query ?? '',
        onChange(query) {
          setDebouncedValue(query);
        },
        onBlur: () => {
          setDebouncedValue('');
        },
      },
    } satisfies ComboboxProps<T>;
  };

  React.useEffect(() => {
    updateValues({
      values: data,
    });
  }, [data, updateValues]);

  return getComboboxProps;
};

export function Example() {
  const getComboboxProps = useCombobox();
  const props = getComboboxProps();
  return (
    <Combobox as="div" {...props.comboboxProps}>
      <Label className="block text-sm font-medium leading-6 text-gray-900">
        Assigned to
      </Label>

      <div className="relative mt-2">
        <ComboboxInput
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          //   onChange={(event) => setQuery(event.target.value)}
          //   onBlur={() => setQuery('')}
          {...props.inputProps}
          onChange={(event) => props.inputProps.onChange(event.target.value)}
          displayValue={(value: any) => value?.label}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </ComboboxButton>

        {props.listProps.values.length > 0 && (
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {props.listProps.values.map((value) => (
              <ComboboxOption
                key={value.id}
                value={value}
                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
              >
                <span className="block truncate group-data-[selected]:font-semibold">
                  {value.label}
                </span>

                <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[selected]:flex group-data-[focus]:text-white">
                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
}
