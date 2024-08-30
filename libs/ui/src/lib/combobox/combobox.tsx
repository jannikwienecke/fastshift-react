import {
  ComboboxButton,
  Combobox as ComboboxHeadlessUi,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Label,
} from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { ComboboxProps } from './combobox.types';

export function Combobox(props: ComboboxProps) {
  return (
    <ComboboxHeadlessUi
      as="div"
      {...props.comboboxProps}
      value={props.comboboxProps.selected ?? null}
    >
      <Label className="block text-sm font-medium leading-6 text-gray-900">
        {props.comboboxProps.label}
      </Label>

      <div className="relative mt-2">
        <ComboboxInput
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          {...props.inputProps}
          onChange={(event) => props.inputProps.onChange(event.target.value)}
          displayValue={(value: any) => value?.label ?? ''}
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
                key={value.id.toString()}
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
    </ComboboxHeadlessUi>
  );
}
