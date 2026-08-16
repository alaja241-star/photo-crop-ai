import { PhotoIcon } from '@heroicons/react/24/outline';

interface ImagePlaceholderProps {
  type: 'crop' | 'soil';
  className?: string;
}

export default function ImagePlaceholder({ type, className = '' }: ImagePlaceholderProps) {
  const bgColor = type === 'crop' ? 'bg-green-100' : 'bg-yellow-100';
  const iconColor = type === 'crop' ? 'text-green-400' : 'text-yellow-400';
  const text = type === 'crop' ? 'Crop Image' : 'Soil Sample';

  return (
    <div className={`flex items-center justify-center ${bgColor} ${className}`}>
      <div className="text-center">
        <PhotoIcon className={`mx-auto h-12 w-12 ${iconColor}`} />
        <p className="mt-2 text-sm text-gray-500">{text}</p>
        <p className="text-xs text-gray-400">Image processed and removed</p>
      </div>
    </div>
  );
}
