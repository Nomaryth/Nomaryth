import { useState, useEffect } from 'react';

interface ContentData {
  explore_title?: string;
  explore_subtitle?: string;
  testimonials?: Array<{
    name: string;
    role: string;
    content: string;
    avatar: string;
    rating: number;
  }>;
}

export function useAdminContent(type: string) {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const allowedTypes = ['home-cards', 'testimonials'];
        if (!allowedTypes.includes(type)) {
          console.error('Invalid content type:', type);
          setLoading(false);
          return;
        }

        const encodedType = encodeURIComponent(type);
        const response = await fetch(`/api/admin/content?type=${encodedType}`);
        
        if (response.ok) {
          const data = await response.json();
          setContent(data.data);
        }
      } catch (error) {
        console.error('Error fetching admin content:', error);
      } finally {
        setLoading(false);
      }
    };

    if (type) {
      fetchContent();
    }
  }, [type]);

  return { content, loading };
}
