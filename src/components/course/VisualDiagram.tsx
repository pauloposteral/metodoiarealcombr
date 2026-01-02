interface VisualDiagramProps {
  imageSrc: string;
  alt: string;
  caption?: string;
}

const VisualDiagram = ({ imageSrc, alt, caption }: VisualDiagramProps) => {
  return (
    <figure className="my-8">
      <div className="rounded-xl overflow-hidden border border-border shadow-lg">
        <img 
          src={imageSrc} 
          alt={alt} 
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-3 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default VisualDiagram;
