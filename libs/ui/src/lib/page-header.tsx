import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { StarIcon } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from './components';
import { PageHeaderProps } from '@apps-next/core';
import { cn } from './utils';

const DefaultPageHeader = (props: PageHeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="text-sm">
            <BreadcrumbLink href="/components">Views</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="text-sm">
            <BreadcrumbPage className="flex flex-row gap-4 items-center">
              <div className="flex flex-row gap-2 items-center">
                {props.icon ? <props.icon className="w-4 h-4" /> : null}
                {props.viewName}
              </div>

              <DotsHorizontalIcon
                className="w-5 h-5 cursor-pointer"
                onClick={() => {
                  // store$.userViewSettings.form.set(true);
                }}
              />

              <StarIcon
                className={cn(
                  'h-4 w-4 cursor-pointer',
                  props.starred ? 'text-yellow-500' : 'text-foreground'
                )}
                onClick={() => {
                  console.log('Star icon clicked');
                  props.onToggleFavorite?.();
                }}
              />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export const pageHeader = {
  default: DefaultPageHeader,
};
