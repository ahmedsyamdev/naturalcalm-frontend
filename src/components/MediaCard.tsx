import { Heart, Play, Clock, Headphones } from "lucide-react";

interface MediaCardProps {
  title: string;
  image: string;
  duration: string;
  plays: string;
  isPremium?: boolean;
}

const MediaCard = ({ title, image, duration, plays, isPremium }: MediaCardProps) => {
  return (
    <div className="relative min-w-[280px] group cursor-pointer">
      <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        {/* Premium Badge */}
        {isPremium && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
            مميز
          </div>
        )}

        {/* Play Button */}
        <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 text-white ml-1" fill="white" />
        </button>

        {/* Bottom Info */}
        <div className="absolute bottom-3 right-3 left-3">
          <h3 className="text-white font-semibold text-sm mb-2 text-right">{title}</h3>
          <div className="flex items-center justify-end gap-4 text-white/90 text-xs">
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

        {/* Favorite Button */}
        <button className="absolute bottom-3 left-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
          <Heart className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default MediaCard;
