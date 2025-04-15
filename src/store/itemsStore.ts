
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Item } from '@/types';

interface ItemsState {
  items: Item[];
  addItem: (name: string, location: string) => void;
  updateItem: (id: string, location: string) => void;
  deleteItem: (id: string) => void;
  getItemByName: (name: string) => Item | undefined;
}

export const useItemsStore = create<ItemsState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (name, location) => {
        const normalizedName = name.toLowerCase().trim();
        const existingItem = get().items.find(
          (item) => item.name.toLowerCase() === normalizedName
        );
        
        if (existingItem) {
          // Update existing item instead
          return get().updateItem(existingItem.id, location);
        }
        
        const newItem: Item = {
          id: Date.now().toString(),
          name,
          location,
          lastUpdated: new Date(),
        };
        
        set((state) => ({
          items: [...state.items, newItem],
        }));
      },
      
      updateItem: (id, location) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, location, lastUpdated: new Date() }
              : item
          ),
        }));
      },
      
      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      getItemByName: (name) => {
        const normalizedName = name.toLowerCase().trim();
        return get().items.find(
          (item) => item.name.toLowerCase() === normalizedName
        );
      },
    }),
    {
      name: 'items-storage',
    }
  )
);
