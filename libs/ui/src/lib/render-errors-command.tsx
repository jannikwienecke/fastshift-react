import { MessageCircleWarning } from 'lucide-react';

export const CommandRenderErrors = (props: {
  errors: string[];
  showError?: boolean;
}) => {
  const RenderError = () => {
    return (
      <div className="flex flex-col justify-center h-full gap-1">
        {props.errors.map((error, index) => {
          return (
            <div
              key={`error-${index}`}
              className="text-xs text-red-400 flex items-center"
            >
              <div>
                <MessageCircleWarning className="inline h-4 w-4 mr-1" />
              </div>

              <div>{error}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return <> {props?.showError ? <RenderError /> : null}</>;
};
