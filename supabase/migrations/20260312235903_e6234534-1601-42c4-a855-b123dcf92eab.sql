
-- Allow admins to manage modules
CREATE POLICY "Admins can manage modules"
ON public.modules FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to manage lessons
CREATE POLICY "Admins can manage lessons"
ON public.lessons FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to manage materials
CREATE POLICY "Admins can manage materials"
ON public.materials FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));
