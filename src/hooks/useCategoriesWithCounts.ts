import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  count: number;
  trending: boolean;
  gradient: string;
}

const categoryGradients = [
  "from-blue-500 to-purple-600",
  "from-green-500 to-teal-600",
  "from-red-500 to-pink-600",
  "from-yellow-500 to-orange-600",
  "from-purple-500 to-indigo-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-green-600"
];

export const useCategoriesWithCounts = () => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoriesWithCounts();
  }, []);

  const fetchCategoriesWithCounts = async () => {
    try {
      setLoading(true);

      // Get categories with a forced refresh
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (categoriesError) throw categoriesError;

      // Get ad counts per category using category_id
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category, index) => {
          const { count } = await supabase
            .from('ads')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .eq('category_id', category.id);

          // Determine if trending (more than 10 ads for realistic numbers)
          const trending = (count || 0) > 10;

          return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            icon: category.icon || 'Package',
            description: category.description,
            count: count || 0,
            trending,
            gradient: categoryGradients[index % categoryGradients.length]
          };
        })
      );

      // Sort by sort_order (show all categories in intended order)
      const sortedCategories = categoriesWithCounts
        .sort((a, b) => {
          // Find original sort order from categoriesData
          const categoryA = categoriesData?.find(c => c.id === a.id);
          const categoryB = categoriesData?.find(c => c.id === b.id);
          return (categoryA?.sort_order || 0) - (categoryB?.sort_order || 0);
        });

      console.log('Categories loaded:', sortedCategories);
      console.log('Total categories from DB:', categoriesData?.length);
      setCategories(sortedCategories);

    } catch (error) {
      console.error('Error fetching categories with counts:', error);
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, refetch: fetchCategoriesWithCounts };
};