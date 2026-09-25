import type { Tables } from '@/integrations/supabase/types';

export type AdminCourse = Pick<Tables<'courses'>,
  'id' | 'title' | 'slug' | 'description' | 'thumbnail_url' | 'estimated_hours' | 'difficulty' | 'is_free' | 'is_published' | 'tags'>;

export type AdminModule = Pick<Tables<'modules'>,
  'id' | 'title' | 'description' | 'order_index' | 'course_id' | 'is_published' | 'slug' | 'code' | 'trails' | 'hours_label' | 'is_star' | 'project_title'>;

export type AdminLesson = Pick<Tables<'lessons'>,
  'id' | 'title' | 'description' | 'order_index' | 'module_id' | 'estimated_minutes' | 'is_free' | 'type' | 'content' | 'video_url' | 'reviewed_at' | 'prompts'>;

/** What the create/edit dialog is working on. */
export type CourseItemTarget =
  | { mode: 'course'; item: AdminCourse | null }
  | { mode: 'module'; item: AdminModule | null; courseId: string; orderIndex: number }
  | { mode: 'lesson'; item: AdminLesson | null; moduleId: string; orderIndex: number };
