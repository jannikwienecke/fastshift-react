import { HistoryType } from '@apps-next/core';
import { useTranslation } from 'react-i18next';
import { store$ } from '../legend-store';

type ChangeTypeRenderer = (
  history: HistoryType,
  group?: HistoryType[]
) => {
  renderActivityItem: () => JSX.Element;
};

export const ChangeRendererFactory = (
  history: HistoryType
): ChangeTypeRenderer => {
  const dict: Record<HistoryType['changed']['type'], ChangeTypeRenderer> = {
    created: ChangeCreated,
    changed: ChangeField,
    'added-to': ChangeAddedTo,
    'removed-from': ChangeRemovedFrom,
    removed: ChangeRemoved,
    added: ChangeAdded,
  };

  const renderer = dict[history.changed.type];

  if (!renderer) return ChangeCreated;

  return renderer;
};

const ChangeCreated: ChangeTypeRenderer = (history: HistoryType) => {
  const renderActivityItem = () => {
    return <RenderTableName name={history.tableName} />;
  };
  return {
    renderActivityItem,
  };
};

const ChangeField: ChangeTypeRenderer = (history: HistoryType) => {
  const renderActivityItem = () => {
    return (
      <div className="flex flex-row gap-1">
        <RenderFieldName name={history.changed.fieldName} />
        <div>to</div>
        <RenderLabel>{history.changed.newValue?.toString() ?? ''}</RenderLabel>
      </div>
    );
  };
  return {
    renderActivityItem,
  };
};

const ChangeAdded: ChangeTypeRenderer = (
  history: HistoryType,
  group = [history]
) => {
  const renderActivityItem = () => {
    // If we have multiple items in the group
    if (group.length > 1) {
      const labels = group
        .map((item) => item.changed.label?.toString() ?? '')
        .filter(Boolean);

      return (
        <div className="flex flex-row gap-1 items-center">
          <RenderFieldName name={history.changed.fieldName} />
          <RenderLabelList labels={labels} historyItems={group} />
        </div>
      );
    }

    // Single item rendering
    return (
      <div className="flex flex-row gap-1 items-center">
        <RenderFieldName name={history.changed.fieldName} />
        <RenderLabel onClick={() => handleClickOnLabel(history)}>
          {history.changed.label?.toString() ?? ''}
        </RenderLabel>
      </div>
    );
  };
  return {
    renderActivityItem,
  };
};

const ChangeRemoved: ChangeTypeRenderer = (
  history: HistoryType,
  group = [history]
) => {
  const renderActivityItem = () => {
    // If we have multiple items in the group
    if (group.length > 1) {
      const labels = group
        .map((item) => item.changed.label?.toString() ?? '')
        .filter(Boolean);

      return (
        <div className="flex flex-row gap-1 items-center">
          <RenderFieldName name={history.changed.fieldName} />
          <RenderLabelList labels={labels} historyItems={group} />
        </div>
      );
    }

    // Single item rendering
    return (
      <div className="flex flex-row gap-1">
        <RenderFieldName name={history.changed.fieldName} />
        <RenderLabel onClick={() => handleClickOnLabel(history)}>
          {history.changed.label?.toString() ?? ''}
        </RenderLabel>
      </div>
    );
  };
  return {
    renderActivityItem,
  };
};

const ChangeAddedTo: ChangeTypeRenderer = (history: HistoryType) => {
  const renderActivityItem = () => {
    // Single item rendering
    return (
      <div className="flex flex-row gap-1">
        <RenderTableName name={history.tableName} />
        <div>to</div>
        <RenderFieldName name={history.changed.fieldName} />
        <RenderLabel onClick={() => handleClickOnLabel(history)}>
          {history.changed.label?.toString() ?? ''}
        </RenderLabel>
      </div>
    );
  };
  return {
    renderActivityItem,
  };
};

const ChangeRemovedFrom: ChangeTypeRenderer = (history: HistoryType) => {
  const renderActivityItem = () => {
    // Single item rendering
    return (
      <div className="flex flex-row gap-1">
        <RenderTableName name={history.tableName} />
        <div>from</div>
        <RenderFieldName name={history.changed.fieldName} />
        <RenderLabel onClick={() => handleClickOnLabel(history)}>
          {history.changed.label?.toString() ?? ''}
        </RenderLabel>
      </div>
    );
  };
  return {
    renderActivityItem,
  };
};

const RenderFieldName = ({
  name,
}: {
  name: HistoryType['changed']['fieldName'];
}) => {
  const { t } = useTranslation();
  return (
    <div className="border-[.5px] px-2 rounded-sm border-foreground/20">
      {t(`${name}.one` as any).toLowerCase()}
    </div>
  );
};

const RenderLabel = (props: { children: string; onClick?: () => void }) => {
  return (
    <button onClick={props.onClick} className="italic px-1 text-foreground">
      {props.children}
    </button>
  );
};

// New component to render a list of labels
const RenderLabelList = ({
  labels,
  historyItems,
}: {
  labels: string[];
  historyItems: HistoryType[];
}) => {
  if (labels.length === 0) return null;

  // Format labels with commas and "and"
  const formattedLabels =
    labels.length === 1
      ? labels[0]
      : labels.length === 2
      ? `${labels[0]} and ${labels[1]}`
      : labels.slice(0, -1).join(', ') + `, and ${labels[labels.length - 1]}`;

  return (
    <div className="italic px-1 text-foreground">
      {labels.length > 1 ? (
        <span>{formattedLabels}</span>
      ) : (
        <button onClick={() => handleClickOnLabel(historyItems[0])}>
          {formattedLabels}
        </button>
      )}
    </div>
  );
};

const RenderTableName = (props: { name: HistoryType['tableName'] }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row gap-1">
      <div>this</div>
      <div>{t(`${props.name}.one`)}</div>
    </div>
  );
};

const handleClickOnLabel = (history: HistoryType) => {
  store$.navigation.state.set({
    type: 'navigate',
    view: history.changed.fieldName,
    id: history.changed.id,
  });
};
