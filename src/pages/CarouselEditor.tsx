import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MembersLayout } from '@/components/members/MembersLayout';
import { CarouselWorkspace } from '@/components/carousel/CarouselWorkspace';
import { Loader2 } from 'lucide-react';

const CarouselEditor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Editor de Carrosséis | Método IA Real</title>
        <meta name="description" content="Crie carrosséis profissionais para Instagram com IA" />
      </Helmet>
      <MembersLayout>
        <CarouselWorkspace />
      </MembersLayout>
    </>
  );
};

export default CarouselEditor;
