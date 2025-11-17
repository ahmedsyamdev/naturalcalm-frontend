interface CategoryCardProps {
  icon: string;
  label: string;
  color: string;
  onClick?: () => void;
}

const CategoryCard = ({ icon, label, color, onClick }: CategoryCardProps) => {
  const isImageUrl = icon && (icon.startsWith('http') || icon.startsWith('/'));

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group w-[70px]"
    >
      <div className="w-[70px] h-[70px] bg-white rounded-2xl flex items-center justify-center shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform flex-shrink-0 overflow-hidden">
        {isImageUrl ? (
          <img
            src={icon}
            alt={label}
            className="w-full h-full object-contain p-3"
          />
        ) : (
          <span className="text-2xl">{icon}</span>
        )}
      </div>
      <span className="text-xs text-primary font-medium text-center leading-tight w-full line-clamp-2 min-h-[32px]">{label}</span>
    </button>
  );
};

export default CategoryCard;
