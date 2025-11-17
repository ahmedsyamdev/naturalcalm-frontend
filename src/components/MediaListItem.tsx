import { Heart, Clock, Headphones } from "lucide-react";

interface MediaListItemProps {
  title: string;
  subtitle: string;
  image: string;
  duration: string;
  plays: string;
}

const MediaListItem = ({ title, subtitle, image, duration, plays }: MediaListItemProps) => {
  return (
    <div className="flex items-center gap-4 p-3 bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <button className="w-10 h-10 flex items-center justify-center">
        <Heart className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
      </button>

      <div className="flex-1 text-right">
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        <div className="flex items-center justify-end gap-3 text-muted-foreground text-xs mt-1">
          <div className="flex items-center gap-1">
            <span>{plays}</span>
            <Headphones className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-1">
            <span>{duration}</span>
            <Clock className="w-3 h-3" />
          </div>
        </div>
      </div>

      <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default MediaListItem;
