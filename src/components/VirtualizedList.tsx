import { FixedSizeList as List } from 'react-window';
import { forwardRef } from 'react';

interface VirtualizedListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: ({ index, style }: { index: number; style: any }) => JSX.Element;
}

export const VirtualizedList = forwardRef<List, VirtualizedListProps>(
  ({ items, itemHeight, containerHeight, renderItem }, ref) => {
    return (
      <List
        ref={ref}
        height={containerHeight}
        itemCount={items.length}
        itemSize={itemHeight}
        width="100%"
      >
        {renderItem}
      </List>
    );
  }
);

VirtualizedList.displayName = 'VirtualizedList';
