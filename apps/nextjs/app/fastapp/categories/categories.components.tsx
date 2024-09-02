import { GetRowType } from '@apps-next/core';

// TODO: Maybe fix this Props type -> use some Type Like ComponentProps or something like that
export const ColorComponent = (props: { data: GetRowType<'category'> }) => {
  return (
    <div
      className="w-5 h-5 rounded-full"
      style={{
        backgroundColor: props.data.raw.color,
      }}
    />
  );
};
