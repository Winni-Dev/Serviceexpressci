import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';

interface FormSearchableSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

export function FormSearchableSelect<T extends FieldValues>({
  control,
  name,
  options,
  placeholder,
  searchPlaceholder,
  disabled,
}: FormSearchableSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <SearchableSelect
          value={field.value ?? ''}
          onValueChange={field.onChange}
          options={options}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          disabled={disabled}
        />
      )}
    />
  );
}
