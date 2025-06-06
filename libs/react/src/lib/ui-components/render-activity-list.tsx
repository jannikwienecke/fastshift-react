import { HistoryType, useTranslation } from '@apps-next/core';
import { PersonIcon } from '@radix-ui/react-icons';
import { ChangeRendererFactory } from './history-change-renderer';

// Group similar activities that occur within the same minute
const groupSimilarActivities = (
  historyData: HistoryType[]
): HistoryType[][] => {
  // Sort by timestamp descending (newest first)
  const groupedActivities: HistoryType[][] = [];

  // Group activities that happen within the same minute, by the same creator, and of the same type and field
  let currentGroup: HistoryType[] = [];

  for (let i = 0; i < historyData.length; i++) {
    const current = historyData[i];
    const last = currentGroup.length > 0 ? currentGroup[0] : null;

    // Check if the current activity belongs to the same group as the last one
    const isSameGroup =
      last &&
      current.creator?.id === last.creator?.id &&
      current.changed.type === last.changed?.type &&
      current.changed.fieldName === last.changed?.fieldName &&
      (last.changed.type === 'added' || last?.changed?.type === 'removed') &&
      Math.abs(current.timestamp - last?.timestamp) < 60000;

    if (isSameGroup) {
      currentGroup.push(current);
    } else {
      // Start a new group if the current doesn't match or this is the first item
      if (currentGroup.length > 0) {
        groupedActivities.push([...currentGroup]);
      }
      currentGroup = [current];
    }
  }

  // Add the last group if it exists
  if (currentGroup.length > 0) {
    groupedActivities.push(currentGroup);
  }

  return groupedActivities;
};

export const RenderActivityList = (props: { historyData: HistoryType[] }) => {
  const { t } = useTranslation();
  const groupedActivities = groupSimilarActivities(
    props.historyData.sort((a, b) => b.timestamp - a.timestamp)
  );

  return (
    <div className="">
      <div className="flex flex-col max-h-[500px] overflow-y-auto">
        {groupedActivities.map((group) => {
          // We take the first item for common data like timestamp, creator, and change type
          const firstItem = group[0];
          const renderer = ChangeRendererFactory(firstItem);
          return (
            <div
              key={`group-${firstItem.timestamp}-${firstItem.changed.fieldName}`}
            >
              <div className="flex flex-row gap-1 items-center text-xs text-foreground/70 sm:mr-2 lg:mr-6 xl:mr-8">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-8 items-center flex justify-center">
                    <PersonIcon />
                  </div>

                  <div>{firstItem.creator.label}</div>
                </div>

                <div className={colorDict[firstItem.changed.type]}>
                  {t(`__history.changed.${firstItem.changed.type}`)}
                </div>

                <div>{renderer(firstItem, group).renderActivityItem()}</div>

                <div className="flex flex-grow" />
                <div>{getTimeAgoString(firstItem.timestamp)}</div>
              </div>

              <div className="h-6 w-8 flex justify-center items-center">
                <div className="h-3/5 w-[1px] bg-foreground/10"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const colorDict: {
  [key in HistoryType['changed']['type']]: string;
} = {
  created: 'text-green-600',
  changed: 'text-yellow-600',
  'added-to': 'text-blue-600',
  'removed-from': 'text-red-600',
  removed: 'text-red-600',
  added: 'text-blue-600',
};

const getTimeAgoString = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const timeDiff = Math.abs(now.getTime() - date.getTime());

  const diffDays = timeDiff / (1000 * 3600 * 24);
  const diffHours = timeDiff / (1000 * 3600);
  const diffMinutes = timeDiff / (1000 * 60);
  const diffSeconds = Math.ceil(timeDiff / 1000);

  return diffDays > 1
    ? `${Math.ceil(diffDays)} days ago`
    : diffHours > 1
    ? `${Math.ceil(diffHours)} hours ago`
    : diffMinutes > 1
    ? `${Math.ceil(diffMinutes)} minutes ago`
    : diffSeconds > 30
    ? `${Math.ceil(diffSeconds)} seconds ago`
    : 'just now';
};
