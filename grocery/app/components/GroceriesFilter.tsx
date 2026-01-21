"use client";
import { GroceryItem } from '../types/grocery';
import GroceryItemCard from './GroceryItemCard';
import { useAppSelector } from '../redux/hook';
import { useAppDispatch } from '../redux/hook';
import { useState } from 'react';
import { X } from 'lucide-react';
import { clearCategory } from '../redux/slices/categorySlice';

type Props = {
    groceries: GroceryItem[] | []
}

function GroceriesFilter({ groceries }: Props) {
    const dispatch = useAppDispatch();
    const { selectedCategory } = useAppSelector(state => state.category);

    const [maxPrice, setMaxPrice] = useState<number>(5000);
    let displayedGroceries = !selectedCategory 
        ? groceries 
        : groceries.filter(g => g.category === selectedCategory);

    displayedGroceries = displayedGroceries.filter(g => Number(g.price) <= maxPrice);

    const handleClear = () => {
        dispatch(clearCategory()); 
        console.log("Clear category triggered");
    };

  return (
    <div className='w-[90%] md:w-[80%] mx-auto mt-10'>
        <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
            <h2 className='text-2xl md:text-3xl font-bold text-teal-700'>
                {selectedCategory ? `${selectedCategory} Items` : "Popular Grocery Items"}
            </h2>


            <div className='flex flex-wrap items-center gap-4'>

                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-600 font-medium'>Max Price: ₹{maxPrice}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="5000" 
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="accent-teal-600 cursor-pointer"
                  />
                </div>

                {selectedCategory && (
                    <button 
                        onClick={handleClear}
                        className='px-4 py-1.5 text-sm bg-teal-100 text-teal-700 rounded-full hover:bg-teal-200 transition font-semibold'
                    >
                        Clear Category <X size={16}/>
                    </button>
                )}
            </div>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6'>
          {displayedGroceries.length > 0 ? (
            displayedGroceries.map((item: GroceryItem) => (
              <GroceryItemCard key={item.id} item={item} />
            ))
          ) : (
            <div className='col-span-full py-20 text-center text-gray-500'>
                No items found in this range.
            </div>
          )}
        </div>
      </div>
  )
}

export default GroceriesFilter;